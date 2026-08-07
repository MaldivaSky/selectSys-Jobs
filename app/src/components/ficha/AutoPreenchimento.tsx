import { useCallback, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  Check,
  FileText,
  RotateCcw,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  ErroExtracao,
  ROTULOS,
  TIPOS_ACEITOS,
  analisarComIA,
  extrairTexto,
  formatarValor,
  type ProgressoExtracao,
  type ResultadoIA,
} from '../../dados/extracaoFicha';

/* ═══════════════════════════════════════════════════════════════════════════
   AUTOPREENCHIMENTO COM IA
   ---------------------------------------------------------------------------
   A regra que organiza este componente: a IA PROPÕE, o candidato DISPÕE.

   Preencher 30 campos automaticamente e mandar o candidato "conferir depois"
   é como o erro entra na ficha e chega ao Japão. Um CPF trocado por OCR vira
   COE recusado. Então nada é aplicado sem passar por uma tela onde cada campo
   aparece com o valor lido, a confiança da leitura e o valor que será
   substituído — com o que veio duvidoso já desmarcado.
   ═════════════════════════════════════════════════════════════════════════ */

interface Props {
  tenantSlug: string;
  /** Cor da agência: o componente veste a marca do tenant, não a nossa. */
  cor: string;
  /** Valores hoje na ficha, para mostrar o que será substituído. */
  valoresAtuais: Record<string, unknown>;
  onAplicar: (campos: Record<string, unknown>) => void;
}

type Fase = 'ocioso' | 'processando' | 'revisao' | 'erro';

/** Abaixo disto o campo entra desmarcado: leitura duvidosa não vira dado. */
const CORTE_CONFIANCA = 0.7;

export function AutoPreenchimento({ tenantSlug, cor, valoresAtuais, onAplicar }: Props) {
  const [fase, setFase] = useState<Fase>('ocioso');
  const [progresso, setProgresso] = useState<ProgressoExtracao | null>(null);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);
  const [erro, setErro] = useState<{ amigavel: string; codigo: string } | null>(null);
  const [aceitos, setAceitos] = useState<Record<string, boolean>>({});
  const [arrastando, setArrastando] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState('');

  const inputArquivo = useRef<HTMLInputElement | null>(null);
  const inputCamera = useRef<HTMLInputElement | null>(null);

  const processar = useCallback(
    async (arquivo: File) => {
      setFase('processando');
      setErro(null);
      setNomeArquivo(arquivo.name);
      setProgresso({ fase: 'lendo', mensagem: 'Abrindo o arquivo...' });

      try {
        const { texto, origem } = await extrairTexto(arquivo, setProgresso);
        const res = await analisarComIA(texto, tenantSlug, origem, setProgresso);

        // Pré-seleção por confiança: o candidato começa com o que é seguro.
        const marcados: Record<string, boolean> = {};
        for (const chave of Object.keys(res.campos)) {
          marcados[chave] = (res.confianca?.[chave] ?? 1) >= CORTE_CONFIANCA;
        }

        setResultado(res);
        setAceitos(marcados);
        setFase('revisao');
      } catch (e) {
        const err = e as ErroExtracao;
        setErro({
          amigavel: err.amigavel ?? 'Algo deu errado ao ler o documento. Você pode preencher a ficha manualmente.',
          codigo: err.codigo ?? 'DESCONHECIDO',
        });
        setFase('erro');
      } finally {
        setProgresso(null);
      }
    },
    [tenantSlug],
  );

  const chaves = useMemo(() => (resultado ? Object.keys(resultado.campos) : []), [resultado]);
  const totalAceitos = chaves.filter((k) => aceitos[k]).length;

  function aplicar() {
    if (!resultado) return;
    const escolhidos: Record<string, unknown> = {};
    for (const k of chaves) if (aceitos[k]) escolhidos[k] = resultado.campos[k];
    onAplicar(escolhidos);
    reiniciar();
  }

  function reiniciar() {
    setFase('ocioso');
    setResultado(null);
    setErro(null);
    setAceitos({});
    setNomeArquivo('');
  }

  /* ── OCIOSO: a zona de upload ─────────────────────────────────────────── */
  if (fase === 'ocioso') {
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void processar(f);
        }}
        className="ssj-ia-zona"
        style={{
          borderColor: arrastando ? cor : 'var(--ssj-rule)',
          background: arrastando ? `color-mix(in srgb, ${cor} 8%, transparent)` : 'var(--ssj-surface-2)',
        }}
      >
        <div className="ssj-ia-selo" style={{ background: `color-mix(in srgb, ${cor} 14%, transparent)`, color: cor }}>
          <Sparkles size={14} /> Autopreenchimento
        </div>

        <h4 className="ssj-ia-titulo">Deixe a IA preencher para você</h4>
        <p className="ssj-ia-texto">
          Envie seu currículo, RG, passaporte ou zairyu card. Lemos o documento no seu próprio aparelho e preenchemos a
          ficha — você confere tudo antes de aplicar.
        </p>

        <div className="ssj-ia-botoes">
          <button type="button" onClick={() => inputArquivo.current?.click()} className="ssj-ia-btn" style={{ background: cor }}>
            <Upload size={17} /> Escolher arquivo
          </button>
          {/* No celular abre a câmera direto; no desktop o navegador ignora
              `capture` e cai no seletor comum — o botão não quebra em lugar nenhum. */}
          <button type="button" onClick={() => inputCamera.current?.click()} className="ssj-ia-btn-2" style={{ borderColor: cor, color: cor }}>
            <Camera size={17} /> Tirar foto
          </button>
        </div>

        <p className="ssj-ia-nota">PDF, JPG, PNG ou TXT · até 12 MB · o arquivo não sai do seu aparelho</p>

        <input
          ref={inputArquivo}
          type="file"
          accept={TIPOS_ACEITOS}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void processar(f);
            e.target.value = '';
          }}
        />
        <input
          ref={inputCamera}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void processar(f);
            e.target.value = '';
          }}
        />
      </div>
    );
  }

  /* ── PROCESSANDO ──────────────────────────────────────────────────────── */
  if (fase === 'processando') {
    const pct = progresso?.pct;
    return (
      <div className="ssj-ia-zona ssj-ia-ativa" style={{ borderColor: cor }}>
        <div className="ssj-ia-pulso" style={{ background: `color-mix(in srgb, ${cor} 16%, transparent)`, color: cor }}>
          <Sparkles size={24} />
        </div>
        <h4 className="ssj-ia-titulo">{progresso?.mensagem ?? 'Processando...'}</h4>
        <p className="ssj-ia-texto" style={{ marginBottom: '18px' }}>{nomeArquivo}</p>

        <div className="ssj-ia-barra">
          {pct !== undefined ? (
            <div className="ssj-ia-barra-fill" style={{ width: `${Math.round(pct * 100)}%`, background: cor }} />
          ) : (
            <div className="ssj-ia-barra-indef" style={{ background: cor }} />
          )}
        </div>

        <div className="ssj-ia-etapas">
          {[
            { id: 'lendo', label: 'Lendo arquivo' },
            { id: 'ocr', label: 'Reconhecendo texto' },
            { id: 'ia', label: 'Identificando campos' },
          ].map((et) => {
            const ativo = progresso?.fase === et.id;
            const feito =
              (et.id === 'lendo' && progresso?.fase !== 'lendo') ||
              (et.id === 'ocr' && progresso?.fase === 'ia');
            return (
              <span key={et.id} className="ssj-ia-etapa" style={{ color: ativo || feito ? cor : 'var(--ssj-muted)', fontWeight: ativo ? 700 : 500 }}>
                {feito ? <Check size={13} /> : <span className="ssj-ia-ponto" style={{ background: ativo ? cor : 'var(--ssj-rule)' }} />}
                {et.label}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── ERRO ─────────────────────────────────────────────────────────────── */
  if (fase === 'erro') {
    return (
      <div className="ssj-ia-zona" style={{ borderColor: 'var(--ssj-terra, #c4452b)', borderStyle: 'solid' }}>
        <AlertTriangle size={26} color="#c4452b" style={{ marginBottom: '12px' }} />
        <h4 className="ssj-ia-titulo">Não deu para ler este arquivo</h4>
        <p className="ssj-ia-texto">{erro?.amigavel}</p>
        <div className="ssj-ia-botoes">
          <button type="button" onClick={reiniciar} className="ssj-ia-btn" style={{ background: cor }}>
            <RotateCcw size={16} /> Tentar outro arquivo
          </button>
        </div>
        <p className="ssj-ia-nota">Preencher à mão funciona igual — a ficha é a mesma.</p>
      </div>
    );
  }

  /* ── REVISÃO ──────────────────────────────────────────────────────────── */
  return (
    <div className="ssj-ia-revisao">
      <header className="ssj-ia-revisao-topo" style={{ borderColor: `color-mix(in srgb, ${cor} 30%, transparent)` }}>
        <div className="ssj-ia-selo" style={{ background: `color-mix(in srgb, ${cor} 14%, transparent)`, color: cor }}>
          <Check size={14} /> {chaves.length} {chaves.length === 1 ? 'campo encontrado' : 'campos encontrados'}
        </div>
        <button type="button" onClick={reiniciar} className="ssj-ia-fechar" aria-label="Descartar leitura">
          <X size={18} />
        </button>
      </header>

      <p className="ssj-ia-texto ssj-ia-revisao-ajuda">
        Confira antes de aplicar. O que veio com leitura duvidosa já está desmarcado — marque só o que estiver correto.
      </p>

      {resultado?.avisos?.map((a) => (
        <div key={a} className="ssj-ia-aviso">
          <AlertTriangle size={14} /> {a}
        </div>
      ))}

      <ul className="ssj-ia-lista">
        {chaves.map((chave) => {
          const conf = resultado?.confianca?.[chave] ?? 1;
          const marcado = !!aceitos[chave];
          const atual = valoresAtuais[chave];
          const substitui = atual !== undefined && atual !== '' && !Array.isArray(atual);
          return (
            <li key={chave}>
              <label className="ssj-ia-item" style={{ borderColor: marcado ? cor : 'var(--ssj-rule)' }}>
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={(e) => setAceitos({ ...aceitos, [chave]: e.target.checked })}
                  style={{ accentColor: cor }}
                />
                <div className="ssj-ia-item-corpo">
                  <div className="ssj-ia-item-topo">
                    <span className="ssj-ia-item-rotulo">{ROTULOS[chave] ?? chave}</span>
                    <span
                      className="ssj-ia-conf"
                      title={`Confiança da leitura: ${Math.round(conf * 100)}%`}
                      style={{ color: conf >= CORTE_CONFIANCA ? cor : '#b06a1f' }}
                    >
                      {conf >= CORTE_CONFIANCA ? 'leitura clara' : 'confira bem'}
                    </span>
                  </div>
                  <div className="ssj-ia-item-valor">{formatarValor(chave, resultado?.campos[chave])}</div>
                  {substitui && (
                    <div className="ssj-ia-item-substitui">
                      substitui <s>{String(atual)}</s>
                    </div>
                  )}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      <footer className="ssj-ia-revisao-rodape">
        <button
          type="button"
          onClick={() => setAceitos(Object.fromEntries(chaves.map((k) => [k, totalAceitos !== chaves.length])))}
          className="ssj-ia-btn-3"
        >
          {totalAceitos === chaves.length ? 'Desmarcar todos' : 'Marcar todos'}
        </button>
        <button
          type="button"
          onClick={aplicar}
          disabled={totalAceitos === 0}
          className="ssj-ia-btn"
          style={{ background: cor, opacity: totalAceitos === 0 ? 0.45 : 1 }}
        >
          <FileText size={16} /> Aplicar {totalAceitos} {totalAceitos === 1 ? 'campo' : 'campos'}
        </button>
      </footer>
    </div>
  );
}
