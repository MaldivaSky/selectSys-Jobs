/* ═══════════════════════════════════════════════════════════════════════════
   PUBLICAR O MODELO DA FICHA NO STORAGE PRIVADO
   ---------------------------------------------------------------------------
   O modelo da ficha é material da FUJIARTE: não entra no repositório e não é
   servido pelo site. Ele mora no bucket privado `app-templates`, de onde só a
   edge function `gerar-ficha-excel` o lê, usando `service_role`.

   Este script existe para essa publicação ser repetível e auditável — quando a
   FUJIARTE revisar o formulário, roda-se isto de novo em vez de alguém subir
   arquivo pelo painel e ninguém saber qual versão está lá.

   Uso:
       node scripts/publicar_template_ficha.mjs [caminho-do-xlsx]

   Sem argumento, procura nos lugares onde o arquivo costuma estar na máquina
   de quem trabalha nele. Precisa de VITE_SUPABASE_URL e
   SUPABASE_SERVICE_ROLE_KEY no .env da raiz — a chave nunca é impressa.

   Antes de subir, o script recusa qualquer planilha que tenha cara de ficha
   PREENCHIDA. Publicar um modelo é rotina; publicar a ficha de um candidato
   com CPF e passaporte seria incidente de dado pessoal.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import ExcelJS from 'exceljs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

const BUCKET = 'app-templates';
const CAMINHO_NO_BUCKET = 'ficha_fujiarte_template.xlsx';
const TIPO_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** Onde o modelo costuma estar. O primeiro que existir é usado. */
const CANDIDATOS = [
  process.argv[2],
  join(RAIZ, 'app/public/templates/ficha_fujiarte_template.xlsx'),
  join(RAIZ, 'ficha_fujiarte_template.xlsx'),
  join(RAIZ, '../ficha_fujiarte_template.xlsx'),
].filter(Boolean);

function lerEnv(chave) {
  if (process.env[chave]) return process.env[chave];
  const arquivo = join(RAIZ, '.env');
  if (!existsSync(arquivo)) return undefined;
  const m = readFileSync(arquivo, 'utf8').match(new RegExp(`^${chave}=(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
}

/**
 * Recusa planilha que pareça ficha preenchida. Um modelo tem rótulo; uma ficha
 * de candidato tem CPF, e-mail, telefone, data de nascimento e passaporte.
 */
async function conferirQueEModeloEmBranco(caminho) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(caminho);

  const textos = [];
  for (const aba of wb.worksheets) {
    aba.eachRow({ includeEmpty: false }, (linha) => {
      linha.eachCell({ includeEmpty: false }, (celula) => {
        if (celula.value == null) return;
        textos.push(
          typeof celula.value === 'object' ? JSON.stringify(celula.value) : String(celula.value),
        );
      });
    });
  }

  const padroes = {
    CPF: /\d{3}\.\d{3}\.\d{3}-\d{2}|\b\d{11}\b/,
    'e-mail': /[\w.+-]+@[\w-]+\.[\w.]{2,}/,
    telefone: /\(\d{2}\)\s?\d{4,5}-?\d{4}/,
    'data de nascimento': /\b\d{2}[/-]\d{2}[/-](19|20)\d{2}\b/,
    passaporte: /\b[A-Z]{2}\d{6}\b/,
  };

  const achados = [];
  for (const [nome, regex] of Object.entries(padroes)) {
    const hits = textos.filter((t) => regex.test(t));
    if (hits.length) achados.push(`${nome} (${hits.length}x, ex.: ${hits[0].slice(0, 40)})`);
  }

  return { celulas: textos.length, achados };
}

const caminho = CANDIDATOS.find((c) => existsSync(c));
if (!caminho) {
  console.error('✗ Modelo não encontrado. Procurei em:');
  for (const c of CANDIDATOS) console.error(`    ${resolve(c)}`);
  console.error('\n  Passe o caminho: node scripts/publicar_template_ficha.mjs <arquivo.xlsx>');
  process.exit(1);
}

const url = lerEnv('VITE_SUPABASE_URL') ?? lerEnv('SUPABASE_URL');
const chave = lerEnv('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !chave) {
  console.error('✗ Faltam VITE_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no .env da raiz.');
  process.exit(1);
}

console.log(`Modelo: ${resolve(caminho)}`);

const { celulas, achados } = await conferirQueEModeloEmBranco(caminho);
if (achados.length) {
  console.error(`\n✗ RECUSADO — a planilha parece PREENCHIDA, não é um modelo em branco:`);
  for (const a of achados) console.error(`    - ${a}`);
  console.error('\n  Publicar isto seria expor dado pessoal de candidato. Nada foi enviado.');
  process.exit(1);
}
console.log(`✓ Modelo em branco: ${celulas} células, só rótulos.`);

const corpo = readFileSync(caminho);
const destino = `${url.replace(/\/$/, '')}/storage/v1/object/${BUCKET}/${CAMINHO_NO_BUCKET}`;

const resposta = await fetch(destino, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${chave}`,
    apikey: chave,
    'Content-Type': TIPO_XLSX,
    'x-upsert': 'true',
  },
  body: corpo,
});

if (!resposta.ok) {
  console.error(`\n✗ Upload falhou: HTTP ${resposta.status}`);
  console.error(`  ${(await resposta.text()).slice(0, 300)}`);
  process.exit(1);
}

console.log(`✓ Publicado em ${BUCKET}/${CAMINHO_NO_BUCKET} (${corpo.length} bytes, bucket privado).`);
