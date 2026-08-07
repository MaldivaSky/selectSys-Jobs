import { BRAND_COLORS as C } from './brand';
import { paraWareki } from '@selectsys/core';

/* ═══════════════════════════════════════════════════════════════════════════
   CARIMBO (印鑑 · hanko)
   No Japão nada é aprovado sem carimbo. É o gesto que a marca empresta à
   interface: cada etapa vencida do funil recebe um selo vermelho, batido com
   a leve imperfeição de um carimbo de tinta — não é um "check" genérico.

     <Hanko texto="承認" />          selo cheio (etapa aprovada)
     <Hanko estado="agora" />        anel pulsando (etapa em curso)
     <Hanko estado="futuro" />       contorno apagado (ainda não aconteceu)
   ═════════════════════════════════════════════════════════════════════════ */

export type EstadoSelo = 'aprovado' | 'agora' | 'futuro';

interface HankoProps {
  estado?: EstadoSelo;
  /** Texto dentro do selo. Curto: 1–2 kanji ou um número. */
  texto?: string;
  size?: number;
  /** Atraso da batida, para escalonar numa lista. */
  delay?: number;
  title?: string;
}

export function Hanko({ estado = 'aprovado', texto = '済', size = 34, delay = 0, title }: HankoProps) {
  const comum = {
    width: size,
    height: size,
    flex: 'none' as const,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--ssj-font-mono)',
    fontWeight: 600,
    userSelect: 'none' as const,
  };

  if (estado === 'aprovado') {
    return (
      <span
        title={title}
        aria-label={title ?? 'Etapa concluída'}
        style={{
          ...comum,
          color: C.shu,
          background: 'var(--ssj-shu-wash)',
          fontSize: size * 0.34,
          letterSpacing: 0,
          // Carimbo de tinta: anel externo grosso, filete interno e leve torto.
          border: `${Math.max(2, size * 0.075)}px solid ${C.shu}`,
          boxShadow: [
            `inset 0 0 0 1.5px var(--ssj-shu-wash)`,
            `inset 0 0 0 ${Math.max(2.5, size * 0.09)}px ${C.shu}`,
            `inset 0 0 ${size * 0.2}px rgba(196,69,43,.18)`,
            `0 0 0 3px var(--ssj-paper)`,
          ].join(','),
          transform: 'rotate(-7deg)',
          animation: `ssj-carimbo .5s ${delay}s cubic-bezier(.25,1.6,.45,1) both`,
        }}
      >
        {texto}
      </span>
    );
  }

  if (estado === 'agora') {
    return (
      <span
        title={title}
        aria-label={title ?? 'Etapa em andamento'}
        style={{
          ...comum,
          border: `2px solid var(--ssj-indigo)`,
          background: 'var(--ssj-surface)',
          boxShadow: `0 0 0 3px var(--ssj-paper)`,
          animation: 'ssj-pulse 2.2s 1s infinite',
        }}
      >
        <span style={{ width: size * 0.26, height: size * 0.26, borderRadius: '50%', background: 'var(--ssj-indigo)' }} />
      </span>
    );
  }

  return (
    <span
      title={title}
      aria-label={title ?? 'Etapa pendente'}
      style={{
        ...comum,
        border: '2px solid var(--ssj-rule-3)',
        background: 'var(--ssj-surface)',
        boxShadow: `0 0 0 3px var(--ssj-paper)`,
        color: 'var(--ssj-faint)',
        fontSize: size * 0.32,
      }}
    >
      {texto === '済' ? '' : texto}
    </span>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   CARIMBO DE DOCUMENTO (承認印)
   O selo do trilho é pequeno e diz só o estado. Este é o carimbo que vai no
   DOCUMENTO — ficha exportada, 応募者カルテ, parecer de triagem. Traz o termo
   da ação e a data em era imperial (令和), porque papel oficial japonês não
   data em calendário ocidental. É o detalhe que faz a folha parecer nativa.
   ═════════════════════════════════════════════════════════════════════════ */

export type AcaoSelo = 'aprovado' | 'recebido' | 'conferido' | 'enviado';

const TERMOS: Record<AcaoSelo, { ja: string; romaji: string; pt: string }> = {
  aprovado: { ja: '承認', romaji: 'shōnin', pt: 'Aprovado' },
  recebido: { ja: '受付', romaji: 'uketsuke', pt: 'Recebido' },
  conferido: { ja: '確認済', romaji: 'kakunin-zumi', pt: 'Conferido' },
  enviado: { ja: '送付済', romaji: 'sōfu-zumi', pt: 'Enviado' },
};

interface HankoDocumentoProps {
  acao?: AcaoSelo;
  data?: Date;
  size?: number;
  /** Mostra a leitura em romaji abaixo — para o lado brasileiro. */
  comRomaji?: boolean;
}

export function HankoDocumento({ acao = 'aprovado', data = new Date(), size = 84, comRomaji = false }: HankoDocumentoProps) {
  const termo = TERMOS[acao];
  const wareki = paraWareki(data);

  return (
    <span
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
      title={`${termo.pt} — ${wareki.texto}`}
    >
      <span
        role="img"
        aria-label={`${termo.pt} em ${wareki.texto}`}
        style={{
          width: size,
          height: size,
          flex: 'none',
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: size * 0.04,
          color: C.shu,
          background: 'transparent',
          border: `${size * 0.045}px solid ${C.shu}`,
          boxShadow: `inset 0 0 0 ${size * 0.018}px transparent, inset 0 0 0 ${size * 0.035}px ${C.shu}`,
          transform: 'rotate(-8deg)',
          animation: 'ssj-carimbo .55s cubic-bezier(.25,1.6,.45,1) both',
          fontFamily: 'var(--ssj-font-display)',
        }}
      >
        <span style={{ font: `700 ${size * 0.3}px/1 var(--ssj-font-display)`, letterSpacing: '0.02em' }}>{termo.ja}</span>
        <span style={{ width: size * 0.52, height: 1, background: C.shu, opacity: 0.55 }} />
        {/* Data em era imperial: 令和8年8月10日 */}
        <span style={{ font: `600 ${size * 0.115}px/1.25 var(--ssj-font-mono)`, textAlign: 'center' }}>
          {wareki.era}
          {wareki.ano}年
          <br />
          {data.getMonth() + 1}月{data.getDate()}日
        </span>
      </span>
      {comRomaji && (
        <span className="ssj-mono" style={{ fontSize: 11.5, color: 'var(--ssj-muted)' }}>
          {termo.romaji} · {termo.pt}
        </span>
      )}
    </span>
  );
}
