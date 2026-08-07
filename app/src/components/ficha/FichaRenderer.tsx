import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Camera, Plus, Trash2, Lock } from 'lucide-react';
import {
  FICHA_FUJIARTE_2024_06,
  PROVINCIAS_ORDENADAS,
  type Campo,
  type DefinicaoFormulario,
  type Etapa,
  type Repetivel,
  type Texto,
} from '@selectsys/core';
import { Hanko } from '../../brand/Hanko';
import { enviarCandidatura, lerLocal, limparLocal, salvarLocal } from '../../dados/candidaturas';
import { temBanco } from '../../dados/supabase';

/* ═══════════════════════════════════════════════════════════════════════════
   RENDERER DIRIGIDO POR SCHEMA — o coração do produto (docs/02 §4)
   ---------------------------------------------------------------------------
   Este componente não conhece NENHUM campo da FUJIARTE. Ele lê a definição
   versionada (packages/core) e monta a tela. Trocar uma pergunta, mudar um
   rótulo, incluir uma organização com ficha diferente: tudo é dado.

   É isso que separa "um formulário bonito" de um SaaS vendável — sem isto,
   cada empreiteira nova exigiria um deploy.

   Cobre os critérios de aceite A1 e A2 do escopo: 7 etapas com progresso,
   todos os ~130 campos, máscaras, ViaCEP, idade ao vivo, campos condicionais,
   validação bloqueante, autosave de 3s e consentimento destacado.
   ═════════════════════════════════════════════════════════════════════════ */

type Valores = Record<string, unknown>;
type Linhas = Record<string, Valores[]>;

const txt = (t: Texto) => t['pt-BR'];

/* ── Máscaras ───────────────────────────────────────────────────────────── */
const mascarar = (valor: string, mask?: Campo['mask']) => {
  const d = valor.replace(/\D/g, '');
  switch (mask) {
    case 'cpf':
      return d.slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    case 'cep':
      return d.slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
    case 'telefone':
      return d.length <= 10
        ? d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
        : d.slice(0, 11).replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
    case 'passaporte':
      return valor.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    default:
      return valor;
  }
};

const inputMode = (c: Campo): CSSProperties['MozAppearance'] extends never ? never : 'text' | 'numeric' | 'email' | 'tel' => {
  if (c.teclado === 'numerico' || c.mask === 'cpf' || c.mask === 'cep') return 'numeric';
  if (c.teclado === 'email' || c.type === 'email') return 'email';
  if (c.teclado === 'telefone' || c.type === 'tel') return 'tel';
  return 'text';
};

/** Idade sempre derivada — a regra dos 55 anos depende disso (escopo B1). */
function idadeDe(iso: unknown): string {
  if (typeof iso !== 'string' || iso.length < 10) return '';
  const n = new Date(iso);
  if (Number.isNaN(n.getTime())) return '';
  const h = new Date();
  let a = h.getFullYear() - n.getFullYear();
  const m = h.getMonth() - n.getMonth();
  if (m < 0 || (m === 0 && h.getDate() < n.getDate())) a--;
  return String(a);
}

function visivel(c: Campo, v: Valores): boolean {
  const cond = c.visibleWhen;
  if (!cond) return true;
  const atual = v[cond.campo];
  if (cond.igual !== undefined) {
    return Array.isArray(atual) ? atual.includes(cond.igual as never) : atual === cond.igual;
  }
  if (cond.diferenteDe !== undefined) return atual !== cond.diferenteDe;
  if (cond.em) return cond.em.includes(atual as never);
  return true;
}

/** Escala numérica pronta para toque — ninguém digita "23,5" com uma mão só. */
function escalaDe(c: Campo): (string | number)[] {
  if (c.escala) return c.escala;
  if (c.min !== undefined && c.max !== undefined) {
    const passo = c.step ?? Math.max(1, Math.round((c.max - c.min) / 24));
    const out: number[] = [];
    for (let v = c.min; v <= c.max; v += passo) out.push(v);
    return out;
  }
  return [];
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

/* ── Campo ──────────────────────────────────────────────────────────────── */
function CampoFicha({
  campo,
  valor,
  onChange,
  erro,
  onCep,
}: {
  campo: Campo;
  valor: unknown;
  onChange: (v: unknown) => void;
  erro?: string;
  onCep?: (cep: string) => void;
}) {
  const id = `campo-${campo.key}`;
  const rotulo = (
    <label htmlFor={id} style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 600, fontSize: 15 }}>{txt(campo.label)}</span>
      {campo.required && <span style={{ color: 'var(--ssj-shu)', fontSize: 13 }}>obrigatório</span>}
      {campo.label['ja-JP'] && (
        <span className="ssj-mono" style={{ fontSize: 12.5, color: 'var(--ssj-faint)' }}>{campo.label['ja-JP']}</span>
      )}
      {campo.sensivel && (
        <span className="ssj-pill ssj-pill--seal" title="Dado sensível — criptografado e com acesso auditado">
          <Lock size={11} /> sensível
        </span>
      )}
    </label>
  );

  const dica = campo.hint && (
    <span style={{ fontSize: 13.5, color: 'var(--ssj-muted)', lineHeight: 1.5 }}>{txt(campo.hint)}</span>
  );

  const aviso = erro && (
    <span role="alert" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--ssj-shu)', fontSize: 13.5 }}>
      <AlertCircle size={14} /> {erro}
    </span>
  );

  const embrulha = (dentro: React.ReactNode) => (
    <div className="ssj-field" style={{ gap: 8 }}>
      {rotulo}
      {dica}
      {dentro}
      {aviso}
    </div>
  );

  // Derivado: mostrado, nunca digitado
  if (campo.derivaDe) {
    return embrulha(
      <output className="ssj-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--ssj-indigo)' }}>
        {String(valor ?? '—')} {campo.key === 'idade' ? 'anos' : ''}
      </output>,
    );
  }

  switch (campo.type) {
    case 'radio':
    case 'chips':
    case 'multi': {
      const multiplo = campo.type === 'multi' || campo.type === 'chips';
      const sel = Array.isArray(valor) ? (valor as string[]) : valor ? [String(valor)] : [];
      const unico = campo.type === 'radio';
      return embrulha(
        <div role={unico ? 'radiogroup' : 'group'} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(campo.options ?? []).map((o) => {
            const on = sel.includes(o.valor);
            return (
              <button
                key={o.valor}
                type="button"
                role={unico ? 'radio' : 'checkbox'}
                aria-checked={on}
                className={`ssj-chip${on ? ' ssj-chip--on' : ''}`}
                onClick={() => {
                  if (unico || !multiplo) onChange(o.valor);
                  else onChange(on ? sel.filter((s) => s !== o.valor) : [...sel, o.valor]);
                }}
              >
                {on && <Check size={14} />}
                {txt(o.label)}
              </button>
            );
          })}
        </div>,
      );
    }

    case 'escala': {
      const opcoes = escalaDe(campo);
      return embrulha(
        <div className="ssj-scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
          {opcoes.map((o) => (
            <button
              key={String(o)}
              type="button"
              className={`ssj-chip${String(valor) === String(o) ? ' ssj-chip--on' : ''}`}
              onClick={() => onChange(o)}
              style={{ minWidth: 62, justifyContent: 'center' }}
            >
              {o}
              {campo.unidade && <span style={{ fontSize: 12, color: 'var(--ssj-muted)' }}>{campo.unidade}</span>}
            </button>
          ))}
        </div>,
      );
    }

    case 'select': {
      const provincia = /provincia/i.test(campo.key);
      const uf = /^(uf|estado)$/i.test(campo.key);
      return embrulha(
        <select id={id} className="ssj-select" value={String(valor ?? '')} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecione…</option>
          {provincia &&
            PROVINCIAS_ORDENADAS.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.pt} · {p.ja}
              </option>
            ))}
          {uf && UFS.map((u) => <option key={u} value={u}>{u}</option>)}
          {!provincia && !uf && (campo.options ?? []).map((o) => (
            <option key={o.valor} value={o.valor}>{txt(o.label)}</option>
          ))}
        </select>,
      );
    }

    case 'textarea':
      return embrulha(
        <textarea id={id} className="ssj-textarea" rows={3} value={String(valor ?? '')} onChange={(e) => onChange(e.target.value)} />,
      );

    case 'foto':
      return embrulha(
        <button type="button" className="ssj-drop" onClick={() => onChange('foto-enviada.jpg')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} /> {valor ? 'Foto enviada — trocar' : 'Abrir a câmera ou escolher da galeria'}
          </span>
        </button>,
      );

    case 'date':
      return embrulha(
        <input id={id} type="date" className="ssj-input" value={String(valor ?? '')} onChange={(e) => onChange(e.target.value)} />,
      );

    default:
      return embrulha(
        <input
          id={id}
          className="ssj-input"
          type={campo.type === 'email' ? 'email' : campo.type === 'number' ? 'number' : 'text'}
          inputMode={inputMode(campo)}
          value={String(valor ?? '')}
          onChange={(e) => {
            let v = mascarar(e.target.value, campo.mask);
            if (campo.transform === 'uppercase') v = v.toUpperCase();
            onChange(v);
            if (campo.type === 'cep' && v.replace(/\D/g, '').length === 8) onCep?.(v);
          }}
        />,
      );
  }
}

/* ── Bloco 1:N ──────────────────────────────────────────────────────────── */
function BlocoRepetivel({
  bloco,
  linhas,
  onChange,
}: {
  bloco: Repetivel;
  linhas: Valores[];
  onChange: (l: Valores[]) => void;
}) {
  return (
    <fieldset style={{ border: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <legend className="ssj-label" style={{ marginBottom: 6 }}>{txt(bloco.label)}</legend>
      {linhas.map((linha, i) => (
        <div key={i} className="ssj-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ssj-row ssj-spread">
            <span className="ssj-mono ssj-muted" style={{ fontSize: 13 }}>#{i + 1}</span>
            <button
              type="button"
              className="ssj-btn ssj-btn--sm ssj-btn--ghost"
              onClick={() => onChange(linhas.filter((_, j) => j !== i))}
              aria-label={`Remover entrada ${i + 1}`}
            >
              <Trash2 size={15} /> Remover
            </button>
          </div>
          <div className="ssj-grid">
            {bloco.campos.map((c) => (
              <CampoFicha
                key={c.key}
                campo={c}
                valor={linha[c.key]}
                onChange={(v) => onChange(linhas.map((l, j) => (j === i ? { ...l, [c.key]: v } : l)))}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="ssj-row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="ssj-btn ssj-btn--sm" onClick={() => onChange([...linhas, {}])}>
          <Plus size={15} /> Adicionar
        </button>
        {linhas.length > bloco.truncaExportacaoEm && (
          <span className="ssj-pill ssj-pill--warn">
            a planilha comporta {bloco.truncaExportacaoEm} — o excedente fica no sistema
          </span>
        )}
      </div>
    </fieldset>
  );
}

/* ── Formulário ─────────────────────────────────────────────────────────── */
export function FichaRenderer({ definicao = FICHA_FUJIARTE_2024_06 }: { definicao?: DefinicaoFormulario }) {
  const [etapa, setEtapa] = useState(0);
  const [valores, setValores] = useState<Valores>({});
  const [linhas, setLinhas] = useState<Linhas>({});
  const [consentimentos, setConsentimentos] = useState<Record<string, boolean>>({});
  const [erros, setErros] = useState<Record<string, string>>({});
  const [salvo, setSalvo] = useState(false);
  const [cepInfo, setCepInfo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ erro?: string; demo?: boolean } | null>(null);
  const primeiroRender = useRef(true);

  // Retomada: fechar o navegador e voltar não pode custar 130 campos (A2).
  useEffect(() => {
    const r = lerLocal();
    if (!r) return;
    setValores(r.valores ?? {});
    setLinhas(r.linhas ?? {});
    setConsentimentos(r.consentimentos ?? {});
    setEtapa(r.etapa ?? 0);
  }, []);

  // Autosave a cada 3s, com indicador visível (A2).
  useEffect(() => {
    if (primeiroRender.current) {
      primeiroRender.current = false;
      return;
    }
    const t = setTimeout(() => {
      salvarLocal({ valores, linhas, consentimentos, etapa });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 1600);
    }, 3000);
    return () => clearTimeout(t);
  }, [valores, linhas, consentimentos, etapa]);

  const definir = useCallback((chave: string, v: unknown) => {
    setValores((p) => {
      const proximo = { ...p, [chave]: v };
      if (chave === 'data_nascimento') proximo.idade = idadeDe(v);
      return proximo;
    });
    setErros((p) => {
      if (!p[chave]) return p;
      const { [chave]: _, ...resto } = p;
      return resto;
    });
  }, []);

  // ViaCEP: o endereço se preenche sozinho (A1).
  const buscarCep = useCallback(async (cep: string) => {
    const d = cep.replace(/\D/g, '');
    if (d.length !== 8) return;
    setCepInfo('buscando…');
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (j.erro) {
        setCepInfo('CEP não encontrado');
        return;
      }
      setValores((p) => ({
        ...p,
        endereco: j.logradouro || p.endereco,
        bairro: j.bairro || p.bairro,
        cidade: j.localidade || p.cidade,
        estado: j.uf || p.estado,
      }));
      setCepInfo(`${j.logradouro} — ${j.bairro}, ${j.localidade}/${j.uf}`);
    } catch {
      setCepInfo('não foi possível consultar agora');
    }
  }, []);

  const etapas = definicao.etapas;
  const atual: Etapa = etapas[etapa];

  const camposVisiveis = useMemo(
    () => (atual.campos ?? []).filter((c) => visivel(c, valores)),
    [atual, valores],
  );

  // Uma etapa protegida por consentimento não é preenchida sem ele — e recusar
  // não encerra a candidatura (escopo A5).
  const consentimentoDaEtapa = atual.exigeConsentimento;
  const liberada = !consentimentoDaEtapa || consentimentos[consentimentoDaEtapa] === true;

  const validar = () => {
    const novos: Record<string, string> = {};
    if (liberada) {
      camposVisiveis.forEach((c) => {
        if (!c.required || c.derivaDe) return;
        const v = valores[c.key];
        const vazio = v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
        if (vazio) novos[c.key] = 'Preencha para continuar';
      });
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const avancar = () => {
    if (!validar()) {
      const primeiro = document.querySelector('[role="alert"]');
      primeiro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (etapa < etapas.length - 1) {
      setEtapa(etapa + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    void enviar();
  };

  /* O envio é uma transação só no banco: candidato, histórico, consentimentos,
     candidatura e triagem entram juntos ou não entram. Reenviar atualiza — a
     chave (organization_id, cpf) impede candidato duplicado. */
  const enviar = async () => {
    setEnviando(true);
    setResultado(null);
    const agencia = new URLSearchParams(window.location.search).get('c');
    const r = await enviarCandidatura({ valores, linhas, consentimentos, etapa }, { agenciaCodigo: agencia });
    setEnviando(false);
    if (!r.ok) {
      setResultado({ erro: r.motivo ?? 'Não foi possível enviar agora.' });
      return;
    }
    limparLocal();
    setResultado({ demo: r.demonstracao });
    setEnviado(true);
  };

  const totalCampos = useMemo(
    () =>
      etapas.reduce(
        (n, e) => n + (e.campos?.length ?? 0) + (e.repetiveis ?? []).reduce((m, r) => m + r.campos.length, 0),
        0,
      ),
    [etapas],
  );

  const preenchidos = Object.values(valores).filter((v) => v !== '' && v !== undefined).length;
  const progresso = Math.round(((etapa + 1) / etapas.length) * 100);

  if (enviado) {
    return (
      <div className="ssj-container ssj-container--narrow ssj-section" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <Hanko estado="aprovado" texto="受付" size={72} />
        </div>
        <h1>Candidatura enviada</h1>
        <p className="ssj-lead" style={{ margin: '12px auto 0', maxWidth: 520 }}>
          Você vai receber a confirmação por e-mail. A triagem automática já rodou e sua ficha
          está com a equipe da FUJIARTE.
        </p>
        <p className="ssj-mono ssj-muted" style={{ marginTop: 18 }}>
          {preenchidos} de {totalCampos} campos preenchidos
        </p>
        {resultado?.demo && (
          <p className="ssj-pill ssj-pill--warn" style={{ marginTop: 14 }}>
            modo demonstração — sem banco configurado, nada foi gravado
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="ssj-container ssj-container--narrow ssj-section">
      {/* Cabeçalho: progresso e autosave */}
      <div className="ssj-pagehead" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <span className="ssj-label">
            Etapa {etapa + 1} de {etapas.length}
          </span>
          <h1 style={{ marginTop: 8 }}>{txt(atual.titulo)}</h1>
          {atual.titulo['ja-JP'] && (
            <div className="ssj-mono ssj-muted" style={{ fontSize: 14, marginTop: 4 }}>{atual.titulo['ja-JP']}</div>
          )}
          {atual.motivo && (
            <p className="ssj-lead" style={{ marginTop: 10 }}>{txt(atual.motivo)}</p>
          )}
        </div>
        <span
          className="ssj-pill ssj-pill--ok"
          aria-live="polite"
          style={{ opacity: salvo ? 1 : 0, transition: 'opacity .25s ease' }}
        >
          ✓ Salvo
        </span>
      </div>

      {!temBanco && (
        <div className="ssj-pill ssj-pill--warn" style={{ marginTop: 14 }}>
          modo demonstração — banco não configurado, o envio não será gravado
        </div>
      )}

      <div className="ssj-track" style={{ marginTop: 18 }}>
        <i style={{ maxWidth: `${progresso}%`, animation: 'none', transform: 'scaleX(1)' }} />
      </div>

      {/* Trilho de etapas com carimbo */}
      <div className="ssj-scroll-x" style={{ display: 'flex', gap: 16, padding: '18px 2px 24px' }}>
        {etapas.map((e, i) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEtapa(i)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              minWidth: 92,
              cursor: 'pointer',
              background: 'none',
              border: 0,
            }}
          >
            <Hanko
              estado={i < etapa ? 'aprovado' : i === etapa ? 'agora' : 'futuro'}
              texto={i < etapa ? '済' : String(i + 1)}
              size={34}
              title={txt(e.titulo)}
            />
            <span
              style={{
                fontSize: 12.5,
                lineHeight: 1.3,
                textAlign: 'center',
                color: i === etapa ? 'var(--ssj-text)' : 'var(--ssj-muted)',
                fontWeight: i === etapa ? 600 : 500,
              }}
            >
              {txt(e.titulo)}
            </span>
          </button>
        ))}
      </div>

      {/* Consentimento que abre a etapa */}
      {consentimentoDaEtapa && (
        <div className="ssj-card ssj-card--edge ssj-card--seal" style={{ marginBottom: 22 }}>
          <div className="ssj-label" style={{ color: 'var(--ssj-shu)' }}>
            Consentimento específico · LGPD Art. 11
          </div>
          <p style={{ marginTop: 10, lineHeight: 1.6 }}>
            {txt(definicao.consentimentos.find((c) => c.id === consentimentoDaEtapa)!.texto)}
          </p>
          <div className="ssj-row" style={{ gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`ssj-btn ssj-btn--sm${liberada ? ' ssj-btn--seal' : ''}`}
              onClick={() => setConsentimentos((p) => ({ ...p, [consentimentoDaEtapa]: true }))}
            >
              <Check size={15} /> Autorizo
            </button>
            <button
              type="button"
              className="ssj-btn ssj-btn--sm ssj-btn--ghost"
              onClick={() => {
                setConsentimentos((p) => ({ ...p, [consentimentoDaEtapa]: false }));
                avancar();
              }}
            >
              Prefiro não informar — seguir sem esta etapa
            </button>
          </div>
        </div>
      )}

      {/* Campos */}
      {liberada && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div className="ssj-grid">
            {camposVisiveis.map((c) => (
              <div key={c.key} style={{ gridColumn: c.type === 'textarea' || c.type === 'multi' ? '1 / -1' : undefined }}>
                <CampoFicha
                  campo={c}
                  valor={c.derivaDe ? idadeDe(valores[c.derivaDe.campo]) : valores[c.key]}
                  onChange={(v) => definir(c.key, v)}
                  erro={erros[c.key]}
                  onCep={buscarCep}
                />
                {c.type === 'cep' && cepInfo && (
                  <div className="ssj-mono" style={{ fontSize: 13, color: 'var(--ssj-verde-ink)', marginTop: 6 }}>{cepInfo}</div>
                )}
              </div>
            ))}
          </div>

          {(atual.repetiveis ?? []).map((b) => (
            <BlocoRepetivel
              key={b.key}
              bloco={b}
              linhas={linhas[b.key] ?? []}
              onChange={(l) => setLinhas((p) => ({ ...p, [b.key]: l }))}
            />
          ))}
        </div>
      )}

      {resultado?.erro && (
        <div className="ssj-card ssj-card--edge ssj-card--seal" style={{ marginTop: 20 }} role="alert">
          <strong>Não foi possível enviar.</strong>
          <p style={{ marginTop: 6 }}>{resultado.erro}</p>
          <p className="ssj-mono ssj-muted" style={{ fontSize: 13, marginTop: 8 }}>
            Seu preenchimento continua salvo neste aparelho — nada foi perdido.
          </p>
        </div>
      )}

      {/* Navegação */}
      <div
        className="ssj-row ssj-spread"
        style={{ marginTop: 34, paddingTop: 22, borderTop: '1px solid var(--ssj-rule)', gap: 12, flexWrap: 'wrap' }}
      >
        <button
          type="button"
          className="ssj-btn"
          disabled={etapa === 0}
          onClick={() => {
            setEtapa(etapa - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        <span className="ssj-mono ssj-muted" style={{ fontSize: 13.5 }}>
          {preenchidos} de {totalCampos} campos
        </span>

        <button type="button" className="ssj-btn ssj-btn--pri" onClick={avancar} disabled={enviando}>
          {enviando ? 'Enviando…' : etapa === etapas.length - 1 ? 'Enviar candidatura' : 'Continuar'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
