import { useState } from 'react';
import { Camera } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR DO CANDIDATO
   A ficha da FUJIARTE exige foto — ela é campo obrigatório e aparece em
   destaque na tela do entrevistador. Então o padrão aqui é FOTO; iniciais são
   só a queda quando a foto ainda não chegou, e nesse caso a interface deixa
   claro que falta enviar (não finge que está tudo certo).
   ═════════════════════════════════════════════════════════════════════════ */

interface AvatarProps {
  /** URL da foto (no produto: URL assinada do R2). */
  src?: string;
  nome: string;
  size?: number;
  /** Quadrado com cantos arredondados (ficha) ou círculo (listas). */
  formato?: 'ficha' | 'circulo';
  /** Sobre fundo escuro, o anel e o vazio invertem. */
  tone?: 'auto' | 'light';
  /** Mostra o aviso de foto pendente quando não há imagem. */
  exigirFoto?: boolean;
}

function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
}

export function Avatar({
  src,
  nome,
  size = 54,
  formato = 'ficha',
  tone = 'auto',
  exigirFoto = false,
}: AvatarProps) {
  const [falhou, setFalhou] = useState(false);
  const temFoto = Boolean(src) && !falhou;
  const raio = formato === 'circulo' ? '50%' : `${Math.round(size * 0.26)}px`;
  const claro = tone === 'light';

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: 'none' }}>
      <span
        style={{
          width: size,
          height: size,
          borderRadius: raio,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: claro ? 'rgba(255,255,255,.14)' : 'var(--ssj-surface-2)',
          // Anel da marca: o candidato é o centro do processo.
          boxShadow: claro
            ? '0 0 0 1px rgba(255,255,255,.18)'
            : '0 0 0 1px var(--ssj-rule)',
          color: claro ? '#f4f2ec' : 'var(--ssj-muted)',
          fontFamily: 'var(--ssj-font-display)',
          fontWeight: 700,
          fontSize: size * 0.34,
          letterSpacing: '-0.02em',
        }}
      >
        {temFoto ? (
          <img
            src={src}
            alt={`Foto de ${nome}`}
            onError={() => setFalhou(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span aria-label={nome}>{iniciais(nome)}</span>
        )}
      </span>

      {!temFoto && exigirFoto && (
        <span
          title="Foto ainda não enviada"
          style={{
            position: 'absolute',
            right: -3,
            bottom: -3,
            width: Math.max(18, size * 0.34),
            height: Math.max(18, size * 0.34),
            borderRadius: '50%',
            background: 'var(--ssj-shu)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 0 2px var(--ssj-surface)',
          }}
        >
          <Camera size={Math.max(10, size * 0.19)} />
        </span>
      )}
    </span>
  );
}
