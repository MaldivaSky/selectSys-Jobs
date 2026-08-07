import { useEffect, useRef, useState } from 'react';
import { BRAND_COLORS as C } from './brand';

/* ═══════════════════════════════════════════════════════════════════════════
   GLOBO DA TRAVESSIA — 地球儀
   ---------------------------------------------------------------------------
   A logo em movimento, na escala do planeta: o ponto sai de São Paulo, cruza
   o Pacífico e chega em 名古屋 (Nagoya, Aichi) — onde a operação dekassegui
   realmente acontece, não numa Tóquio genérica.

   Projeção ortográfica em canvas 2D, interpolação esférica (slerp) sobre o
   grande círculo. Zero dependência: nenhum WebGL, nenhuma textura, nenhum
   megabyte para baixar antes da primeira impressão numa sala de reunião.

   O globo GIRA acompanhando o viajante, que permanece no centro — quem
   atravessa fica parado e o mundo se move em volta. Base geométrica do
   protótipo do designer, com a identidade, a acessibilidade e o controle de
   ciclo de vida corrigidos.
   ═════════════════════════════════════════════════════════════════════════ */

const D2R = Math.PI / 180;
const SAO_PAULO: [number, number] = [-23.55, -46.63];
const NAGOYA: [number, number] = [35.18, 136.9];

const DURACAO = 3400;
const INICIO_TRAJETO = 420;
const FIM_TRAJETO = 2700;
const DESCANSO = 1100;

/* ── Silhuetas ─────────────────────────────────────────────────────────────
   Contornos grosseiros de propósito: a 240–420px, detalhe de costa vira
   ruído. O que precisa ser legível é "sai daqui, chega ali".               */
const AMERICA_DO_SUL: [number, number][] = [
  [12.5, -71.7], [10.7, -64.0], [8.6, -60.0], [5.0, -52.5], [1.5, -50.0],
  [-2.5, -44.3], [-5.1, -36.5], [-8.0, -34.9], [-13.0, -38.5], [-18.0, -39.7],
  [-22.9, -43.2], [-23.9, -46.3], [-28.5, -48.8], [-32.0, -52.1], [-34.9, -56.2],
  [-38.0, -57.5], [-42.0, -63.6], [-47.0, -65.9], [-52.0, -68.5], [-54.8, -68.3],
  [-52.5, -73.0], [-46.0, -75.0], [-41.0, -74.0], [-36.0, -72.9], [-30.0, -71.5],
  [-23.5, -70.4], [-18.0, -70.3], [-12.0, -77.0], [-6.0, -81.0], [-2.0, -80.9],
  [1.0, -79.5], [6.0, -77.5], [9.0, -79.5], [11.0, -74.0], [12.5, -71.7],
];

const HONSHU: [number, number][] = [
  [41.5, 140.9], [40.5, 141.5], [38.3, 141.5], [36.0, 140.9], [34.9, 139.9],
  [34.6, 138.2], [34.7, 136.9], [33.5, 135.8], [34.4, 133.0], [34.4, 131.0],
  [35.5, 133.0], [37.4, 137.0], [39.0, 139.9], [41.5, 140.9],
];
const HOKKAIDO: [number, number][] = [
  [45.5, 141.9], [43.3, 145.6], [42.0, 143.0], [41.4, 140.0], [43.4, 140.0], [45.5, 141.9],
];
const KYUSHU: [number, number][] = [
  [33.9, 131.0], [31.6, 131.5], [31.0, 130.2], [33.0, 129.5], [33.9, 131.0],
];
const SHIKOKU: [number, number][] = [
  [34.3, 134.6], [33.5, 134.2], [32.7, 133.0], [33.9, 132.5], [34.3, 134.6],
];
const JAPAO = [HONSHU, HOKKAIDO, KYUSHU, SHIKOKU];

type Vec3 = [number, number, number];

const vetor = (lat: number, lon: number): Vec3 => {
  const la = lat * D2R;
  const lo = lon * D2R;
  const c = Math.cos(la);
  return [c * Math.cos(lo), c * Math.sin(lo), Math.sin(la)];
};

/** Interpolação sobre a esfera: o caminho real de um voo, não uma reta no mapa. */
function slerp(a: Vec3, b: Vec3, f: number): Vec3 {
  const d = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const o = Math.acos(d);
  if (o < 1e-6) return [...a];
  const s = Math.sin(o);
  const w0 = Math.sin((1 - f) * o) / s;
  const w1 = Math.sin(f * o) / s;
  const r: Vec3 = [w0 * a[0] + w1 * b[0], w0 * a[1] + w1 * b[1], w0 * a[2] + w1 * b[2]];
  const m = Math.hypot(r[0], r[1], r[2]);
  return [r[0] / m, r[1] / m, r[2] / m];
}

const paraLatLon = (v: Vec3): [number, number] => [
  Math.asin(Math.max(-1, Math.min(1, v[2]))) / D2R,
  Math.atan2(v[1], v[0]) / D2R,
];

/** Projeção ortográfica. `front > 0` = o ponto está na face visível. */
function projetar(lat: number, lon: number, lat0: number, lon0: number, cx: number, cy: number, r: number) {
  const la = lat * D2R;
  const lo = lon * D2R;
  const la0 = lat0 * D2R;
  const lo0 = lon0 * D2R;
  const cla = Math.cos(la);
  const vx = cla * Math.cos(lo);
  const vy = cla * Math.sin(lo);
  const vz = Math.sin(la);
  const x1 = vx * Math.cos(lo0) + vy * Math.sin(lo0);
  const y1 = -vx * Math.sin(lo0) + vy * Math.cos(lo0);
  const front = x1 * Math.cos(la0) + vz * Math.sin(la0);
  const up = -x1 * Math.sin(la0) + vz * Math.cos(la0);
  return { x: cx + y1 * r, y: cy - up * r, front };
}

function misturar(a: string, b: string, f: number) {
  const h = (c: string) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const A = h(a);
  const B = h(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`;
}

interface GloboProps {
  /** Lado do canvas em px. O herói escala; o selo do rodapé não. */
  size?: number;
  tone?: 'dark' | 'light';
  /** Rótulos de origem e destino sobre o globo. */
  comRotulos?: boolean;
  className?: string;
}

export function GloboTravessia({ size = 320, tone = 'dark', comRotulos = true, className }: GloboProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const inicioRef = useRef(0);
  const [visivel, setVisivel] = useState(false);
  const [ciclo, setCiclo] = useState(0);

  // Só anima o que está na tela — nada de queimar CPU em seção que ninguém vê.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const ctx = el.getContext('2d');
    if (!ctx) return;

    const escuro = tone === 'dark';
    const vSP = vetor(...SAO_PAULO);
    const vNG = vetor(...NAGOYA);
    const noArco = (f: number) => paraLatLon(slerp(vSP, vNG, f));

    const desenhar = (t: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (el.width !== size * dpr) {
        el.width = size * dpr;
        el.height = size * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;
      const bruto = Math.max(0, Math.min(1, (t - INICIO_TRAJETO) / (FIM_TRAJETO - INICIO_TRAJETO)));
      const p = bruto < 0.5 ? 2 * bruto * bruto : 1 - Math.pow(-2 * bruto + 2, 2) / 2;
      const surge = Math.max(0, Math.min(1, t / 380));
      const [lat0, lon0] = paraLatLon(slerp(vSP, vNG, p));

      ctx.globalAlpha = surge;

      // Oceano
      const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.2, cx, cy, r);
      if (escuro) {
        g.addColorStop(0, '#233047');
        g.addColorStop(1, '#0e131d');
      } else {
        g.addColorStop(0, '#e9edf4');
        g.addColorStop(1, '#c3ccdb');
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      const traco = (pts: [number, number][]) => {
        let pen = false;
        for (const [la, lo] of pts) {
          const q = projetar(la, lo, lat0, lon0, cx, cy, r);
          if (q.front > 0) {
            if (!pen) {
              ctx.moveTo(q.x, q.y);
              pen = true;
            } else ctx.lineTo(q.x, q.y);
          } else pen = false;
        }
      };

      // Malha de meridianos e paralelos
      ctx.strokeStyle = escuro ? 'rgba(150,175,215,.15)' : 'rgba(60,80,120,.2)';
      ctx.lineWidth = 0.8;
      for (let lon = -180; lon < 180; lon += 30) {
        const pts: [number, number][] = [];
        for (let la = -90; la <= 90; la += 4) pts.push([la, lon]);
        ctx.beginPath();
        traco(pts);
        ctx.stroke();
      }
      for (let lat = -60; lat <= 60; lat += 30) {
        const pts: [number, number][] = [];
        for (let lo = -180; lo <= 180; lo += 4) pts.push([lat, lo]);
        ctx.beginPath();
        traco(pts);
        ctx.stroke();
      }

      // Terra. Sem isto o globo é bonito e não diz nada — é aqui que a
      // diretoria reconhece o Brasil de onde sai e o Japão onde chega.
      const pintarTerra = (partes: [number, number][][], cor: string, borda: string) => {
        for (const parte of partes) {
          ctx.beginPath();
          traco(parte);
          ctx.closePath();
          ctx.fillStyle = cor;
          ctx.fill();
          ctx.strokeStyle = borda;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      };
      pintarTerra(
        [AMERICA_DO_SUL],
        escuro ? 'rgba(31,157,87,.30)' : 'rgba(31,157,87,.26)',
        escuro ? 'rgba(88,204,140,.65)' : 'rgba(31,122,77,.7)',
      );
      pintarTerra(
        JAPAO,
        escuro ? 'rgba(196,69,43,.34)' : 'rgba(196,69,43,.28)',
        escuro ? 'rgba(232,120,93,.8)' : 'rgba(165,56,35,.8)',
      );

      ctx.restore();

      // Limbo do planeta
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = escuro ? 'rgba(120,140,180,.5)' : 'rgba(70,90,130,.55)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Rota completa, tracejada
      const rota: [number, number][] = [];
      for (let i = 0; i <= 200; i++) rota.push(noArco(i / 200));
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      traco(rota);
      ctx.strokeStyle = escuro ? 'rgba(230,235,245,.22)' : 'rgba(40,60,100,.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      // Trecho já percorrido, em âmbar da marca
      const n = Math.max(1, Math.round(p * 200));
      const percorrido: [number, number][] = [];
      for (let i = 0; i <= n; i++) percorrido.push(noArco((i / n) * p));
      ctx.beginPath();
      traco(percorrido);
      ctx.strokeStyle = C.ambar;
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(201,154,46,.55)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Origem
      const sp = projetar(SAO_PAULO[0], SAO_PAULO[1], lat0, lon0, cx, cy, r);
      if (sp.front > 0) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = C.verde;
        ctx.fill();
        ctx.strokeStyle = '#eafaef';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        if (comRotulos && p < 0.55) {
          ctx.font = `500 ${Math.round(size * 0.036)}px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = escuro ? 'rgba(234,250,239,.85)' : 'rgba(20,24,31,.8)';
          ctx.textAlign = 'left';
          ctx.fillText('São Paulo', sp.x + 9, sp.y + 4);
        }
      }

      // Destino
      const ng = projetar(NAGOYA[0], NAGOYA[1], lat0, lon0, cx, cy, r);
      if (ng.front > 0 && comRotulos && p > 0.45) {
        ctx.font = `500 ${Math.round(size * 0.036)}px 'IBM Plex Sans JP', 'IBM Plex Mono', monospace`;
        ctx.fillStyle = escuro ? 'rgba(255,225,218,.9)' : 'rgba(20,24,31,.8)';
        ctx.textAlign = 'right';
        ctx.fillText('名古屋 Nagoya', ng.x - 11, ng.y + 4);
      }

      // O viajante: verde → âmbar → vermelho, o mesmo gradiente da logo.
      const cor = p < 0.5 ? misturar(C.verde, C.ambar, p * 2) : misturar(C.ambar, C.shu, (p - 0.5) * 2);
      const chegada = Math.max(0, Math.min(1, (t - FIM_TRAJETO) / 400));
      if (chegada > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, 9 + chegada * 9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,69,43,${0.28 * (1 - chegada) + 0.12})`;
        ctx.fill();
      }
      ctx.shadowColor = cor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, 6.5 + chegada * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = cor;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(cx, cy, 6.5 + chegada * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = escuro ? '#fff' : C.ink;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // Quem pediu menos movimento recebe o quadro final, não a animação.
    const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (semMovimento || !visivel) {
      desenhar(semMovimento ? DURACAO : 0);
      return;
    }

    inicioRef.current = performance.now();
    const loop = () => {
      const t = performance.now() - inicioRef.current;
      desenhar(Math.min(t, DURACAO + DESCANSO));
      // Toca uma vez e descansa. Laço infinito em reunião distrai e esquenta o
      // notebook; a repetição fica sob controle de quem apresenta.
      if (t < DURACAO + DESCANSO) rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, tone, comRotulos, visivel, ciclo]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Globo mostrando a rota de São Paulo até Nagoya, no Japão"
      onClick={() => setCiclo((c) => c + 1)}
      title="Clique para rever a travessia"
      style={{ display: 'block', width: size, height: size, maxWidth: '100%', cursor: 'pointer' }}
    />
  );
}
