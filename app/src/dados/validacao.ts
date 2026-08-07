/* ═══════════════════════════════════════════════════════════════════════════
   VALIDAÇÃO DA FICHA
   ---------------------------------------------------------------------------
   Validar aqui não é preciosismo de formulário: um CPF com dígito errado ou
   um passaporte vencido só aparece semanas depois, no consulado, quando o
   processo já custou dinheiro da agência e tempo do candidato. É mais barato
   segurar no campo.

   Toda função devolve `null` quando está tudo certo e uma frase em português
   quando não está — nunca um código que a tela precise traduzir.
   ═════════════════════════════════════════════════════════════════════════ */

export type Erro = string | null;

/** Dígitos verificadores do CPF. Rejeita os 11 dígitos repetidos. */
export function validarCpf(valor: string): Erro {
  const d = valor.replace(/\D/g, '');
  if (!d) return null; // vazio é problema de obrigatoriedade, não de formato
  if (d.length !== 11) return 'O CPF precisa ter 11 dígitos.';
  if (/^(\d)\1{10}$/.test(d)) return 'Este CPF não existe.';

  const digito = (ate: number) => {
    let soma = 0;
    for (let i = 0; i < ate; i++) soma += Number(d[i]) * (ate + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  if (digito(9) !== Number(d[9]) || digito(10) !== Number(d[10])) {
    return 'CPF inválido — confira os números.';
  }
  return null;
}

export function validarEmail(valor: string): Erro {
  if (!valor) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()) ? null : 'E-mail incompleto.';
}

/** Celular brasileiro: DDD + 9 dígitos. */
export function validarCelular(valor: string): Erro {
  if (!valor) return null;
  const d = valor.replace(/\D/g, '');
  if (d.length < 10) return 'Faltam dígitos — inclua o DDD.';
  if (d.length > 13) return 'Número longo demais.';
  return null;
}

export function validarCep(valor: string): Erro {
  if (!valor) return null;
  return valor.replace(/\D/g, '').length === 8 ? null : 'O CEP precisa ter 8 dígitos.';
}

export function validarNascimento(valor: string): Erro {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Data inválida.';
  if (data > new Date()) return 'A data de nascimento está no futuro.';

  const idade = calcularIdade(valor);
  if (idade < 18) return 'É preciso ter 18 anos ou mais para o processo de visto.';
  if (idade > 75) return 'Confira o ano — a idade calculada ficou acima de 75.';
  return null;
}

/**
 * Validade de documento. Não é erro estar vencido — é aviso: muita agência
 * recebe o candidato justamente para renovar. Mas passar batido é pior.
 */
export function validarValidadeDocumento(valor: string, nome: string): Erro {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Data inválida.';

  const hoje = new Date();
  if (data < hoje) return `${nome} vencido — será preciso renovar antes do embarque.`;

  const seisMeses = new Date();
  seisMeses.setMonth(seisMeses.getMonth() + 6);
  if (data < seisMeses) return `${nome} vence em menos de 6 meses — comece a renovação agora.`;
  return null;
}

export function calcularIdade(nascimento: string): number {
  const nasc = new Date(nascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

/* ── MÁSCARAS ───────────────────────────────────────────────────────────────
   Formatam enquanto o candidato digita, sem nunca bloquear a tecla: máscara
   que engole caractere faz o usuário achar que o teclado quebrou. */

export function mascararCpf(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function mascararCep(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, '$1-$2');
}

export function mascararCelular(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.replace(/(\d{1,2})/, '($1');
  if (d.length <= 6) return d.replace(/(\d{2})(\d{1,4})/, '($1) $2');
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{1,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{1,4})/, '($1) $2-$3');
}

/* ── PROGRESSO POR ETAPA ────────────────────────────────────────────────────
   Alimenta a barra do topo. Contar campo preenchido dá ao candidato a noção
   de quanto falta — é o que segura o abandono numa ficha de 130 campos. */

/**
 * Só campos que nascem VAZIOS no formulário.
 *
 * Contar `sexo`, `nacionalidade` ou `escolaridade` — que já abrem com um valor
 * escolhido — faria a ficha em branco marcar 53% de progresso. Barra que
 * começa cheia não informa nada e ainda mente para o candidato sobre quanto
 * falta.
 */
const CAMPOS_POR_ETAPA: Record<number, string[]> = {
  1: ['nomeCompleto', 'dataNascimento', 'cpf', 'rg', 'passaporte', 'passaporteValidade', 'fotoUrl'],
  2: ['alturaCm', 'pesoKg', 'cinturaCm', 'peCm'],
  3: ['cep', 'logradouro', 'bairro', 'cidade', 'celular', 'emergenciaNome', 'emergenciaRelacao', 'emergenciaTel'],
  4: ['experienciasJapao'],
  5: ['dataEmbarquePretendida'],
  6: ['consentimentoSaudeLGPD'],
  7: ['termoVeracidade'],
};

export function progressoEtapa(etapa: number, dados: Record<string, unknown>): number {
  const campos = CAMPOS_POR_ETAPA[etapa] ?? [];
  if (!campos.length) return 0;
  const preenchidos = campos.filter((c) => {
    const v = dados[c];
    if (typeof v === 'boolean') return v;
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && String(v).trim() !== '';
  }).length;
  return preenchidos / campos.length;
}

export function progressoTotal(dados: Record<string, unknown>): number {
  const etapas = Object.keys(CAMPOS_POR_ETAPA).map(Number);
  const soma = etapas.reduce((s, e) => s + progressoEtapa(e, dados), 0);
  return soma / etapas.length;
}
