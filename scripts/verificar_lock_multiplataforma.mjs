/* ═══════════════════════════════════════════════════════════════════════════
   GUARDA DO LOCKFILE MULTIPLATAFORMA
   ---------------------------------------------------------------------------
   O que este script impede de acontecer de novo:

   oxlint, rolldown (Vite 8), Tailwind e lightningcss nao sao JavaScript — sao
   binarios Rust publicados como um pacote npm por plataforma, ligados ao
   pacote principal por `optionalDependencies`. O `package-lock.json` precisa
   listar TODAS as variantes; o instalador escolhe a do sistema na hora.

   O problema: `npm install` reconstroi o lock a partir da arvore que ja existe
   em `node_modules`. Rodando no Windows, a arvore so tem os binarios win32 —
   entao o lock sai com so essa variante, e o Linux da CI fica sem nada para
   carregar. O sintoma nao parece de dependencia:

       cause: Error: Cannot find module '@oxlint/binding-linux-x64-gnu'

   Foi exatamente assim que o job "Lint e build" caiu. E o pior: quebra so no
   runner, nunca na maquina de quem commitou.

   Como consertar quando este script acusar: apagar TODAS as `node_modules`
   (raiz, app e packages) junto com o `package-lock.json`, e reinstalar com
   `npm install --include=dev --legacy-peer-deps`. O comando exato sai na
   mensagem de erro abaixo.

   Apagar o lock sozinho NAO resolve — o npm le a `node_modules` que sobrou e
   reproduz a mesma poda. As duas coisas saem juntas.
   ═════════════════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Plataformas que precisam estar no lock: a da CI e a de quem desenvolve. */
const PLATAFORMAS_EXIGIDAS = ['linux-x64-gnu', 'win32-x64-msvc'];

/** Pacotes com binario nativo por plataforma que o build/lint dependem. */
const PACOTES_NATIVOS = [
  '@oxlint/binding',
  '@rolldown/binding',
  '@tailwindcss/oxide',
  'lightningcss',
];

const lock = JSON.parse(readFileSync(join(raiz, 'package-lock.json'), 'utf8'));
const caminhos = Object.keys(lock.packages ?? {});

const problemas = [];

for (const pacote of PACOTES_NATIVOS) {
  const variantes = caminhos
    .map((c) => c.replace(/.*node_modules\//, ''))
    .filter((nome) => nome.startsWith(`${pacote}-`));

  for (const plataforma of PLATAFORMAS_EXIGIDAS) {
    if (!variantes.some((v) => v.endsWith(plataforma))) {
      problemas.push(`${pacote}-*-${plataforma}`);
    }
  }
}

if (problemas.length) {
  console.error('\n✗ package-lock.json esta podado por plataforma.\n');
  console.error('  Faltam no lock:');
  for (const p of problemas) console.error(`    - ${p}`);
  console.error('\n  Isso quebra a CI com "Cannot find module" e passa despercebido');
  console.error('  na maquina de quem commitou. Para regenerar o lock completo:\n');
  console.error('    rm -rf node_modules app/node_modules packages/*/node_modules package-lock.json');
  console.error('    npm install --include=dev --legacy-peer-deps\n');
  process.exit(1);
}

console.log(
  `✓ package-lock.json completo: ${PACOTES_NATIVOS.length} pacotes nativos com binario para ${PLATAFORMAS_EXIGIDAS.join(' e ')}.`,
);
