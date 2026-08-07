import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw, LogIn, AlertTriangle, Inbox } from 'lucide-react';
import { ETAPAS_FUNIL, ORDEM_FUNIL, STATUS, type StatusCandidatura } from '@selectsys/core';
import { Hanko } from '../brand/Hanko';
import { temBanco } from '../dados/supabase';
import {
  entrar,
  listarAgencias,
  listarCandidatos,
  meuVinculo,
  moverStatus,
  resumoFunil,
  sair,
  sessaoAtiva,
  transicoesDe,
  type Filtros,
  type LinhaCandidato,
  type ResumoFunil,
} from '../dados/painel';
import type { Language } from '../translations';

/* ═══════════════════════════════════════════════════════════════════════════
   PAINEL DE GESTÃO — Épicos C2 e C4 do escopo
   ---------------------------------------------------------------------------
   Lê o banco de verdade. Nenhum número é inventado: se a base está vazia, o
   painel diz que está vazia. Número decorativo em demonstração é o tipo de
   coisa que o cliente descobre na primeira semana de uso.

   Tudo que chega aqui já passou pela RLS — não existe filtro por organização
   no código do cliente, porque um esquecimento viraria vazamento.
   ═════════════════════════════════════════════════════════════════════════ */

const tomCor: Record<string, string> = {
  neutro: 'ssj-pill--mute',
  andamento: 'ssj-pill--info',
  positivo: 'ssj-pill--ok',
  atencao: 'ssj-pill--warn',
  encerrado: 'ssj-pill--seal',
};

function Login({ aoEntrar }: { aoEntrar: () => void }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOcupado(true);
    setErro('');
    const r = await entrar(email, senha);
    setOcupado(false);
    if (!r.ok) setErro(r.motivo);
    else aoEntrar();
  };

  return (
    <div className="ssj-container ssj-container--narrow ssj-section">
      <div className="ssj-card" style={{ maxWidth: 440, margin: '0 auto' }}>
        <span className="ssj-label">Painel de gestão · 応募者一覧</span>
        <h1 style={{ marginTop: 8 }}>Entrar</h1>
        <p className="ssj-lead" style={{ marginTop: 8 }}>
          Os dados dos candidatos são protegidos no banco. Sem sessão, nada é retornado.
        </p>

        <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 22 }}>
          <div className="ssj-field">
            <label htmlFor="email" style={{ fontWeight: 600 }}>E-mail</label>
            <input id="email" type="email" className="ssj-input" value={email} required
                   autoComplete="username" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="ssj-field">
            <label htmlFor="senha" style={{ fontWeight: 600 }}>Senha</label>
            <input id="senha" type="password" className="ssj-input" value={senha} required
                   autoComplete="current-password" onChange={(e) => setSenha(e.target.value)} />
          </div>
          {erro && (
            <span role="alert" style={{ color: 'var(--ssj-shu)', fontSize: 14 }}>{erro}</span>
          )}
          <button type="submit" className="ssj-btn ssj-btn--pri ssj-btn--block" disabled={ocupado}>
            <LogIn size={16} /> {ocupado ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function TenantDashboard({ lang: _lang }: { lang: Language }) {
  const [logado, setLogado] = useState<boolean | null>(null);
  const [vinculo, setVinculo] = useState<Awaited<ReturnType<typeof meuVinculo>>>(null);
  const [funil, setFunil] = useState<ResumoFunil[]>([]);
  const [linhas, setLinhas] = useState<LinhaCandidato[]>([]);
  const [agencias, setAgencias] = useState<string[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({ status: 'todos', agencia: 'todas' });
  const [carregando, setCarregando] = useState(false);
  const [transicoes, setTransicoes] = useState<Record<string, StatusCandidatura[]>>({});

  const carregar = useCallback(async () => {
    setCarregando(true);
    const [f, l, a, v] = await Promise.all([
      resumoFunil(),
      listarCandidatos(filtros),
      listarAgencias(),
      meuVinculo(),
    ]);
    setFunil(f);
    setLinhas(l);
    setAgencias(a);
    setVinculo(v);
    setCarregando(false);
  }, [filtros]);

  useEffect(() => {
    void (async () => {
      const s = await sessaoAtiva();
      setLogado(Boolean(s));
    })();
  }, []);

  useEffect(() => {
    if (logado) void carregar();
  }, [logado, carregar]);

  const totalFunil = useMemo(() => funil.reduce((n, f) => n + f.total, 0), [funil]);
  const atrasados = useMemo(() => funil.reduce((n, f) => n + f.atrasados, 0), [funil]);
  const emCoe = useMemo(
    () => funil.filter((f) => STATUS[f.status]?.etapa === 8).reduce((n, f) => n + f.total, 0),
    [funil],
  );

  const abrirTransicoes = async (l: LinhaCandidato) => {
    if (transicoes[l.status]) return;
    const t = await transicoesDe(l.status);
    setTransicoes((p) => ({ ...p, [l.status]: t }));
  };

  if (!temBanco) {
    return (
      <div className="ssj-container ssj-section">
        <div className="ssj-card ssj-card--edge ssj-card--seal">
          <h1>Painel de gestão</h1>
          <p className="ssj-lead" style={{ marginTop: 10 }}>
            Banco não configurado neste ambiente. Defina <code>VITE_SUPABASE_URL</code> e{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>.
          </p>
        </div>
      </div>
    );
  }

  if (logado === null) return <div className="ssj-container ssj-section">Verificando sessão…</div>;
  if (!logado) return <Login aoEntrar={() => setLogado(true)} />;

  return (
    <div className="ssj-container ssj-section">
      <div className="ssj-pagehead">
        <div>
          <span className="ssj-label">Painel de gestão · 応募者一覧</span>
          <h1 style={{ marginTop: 8 }}>Funil dekassegui</h1>
          {vinculo && (
            <p className="ssj-lead" style={{ marginTop: 6 }}>
              {vinculo.organizations?.nome}
              {vinculo.organizations?.nome_ja && (
                <span className="ssj-mono ssj-muted"> · {vinculo.organizations.nome_ja}</span>
              )}
              <span className="ssj-muted"> — seu acesso: {vinculo.role}</span>
            </p>
          )}
        </div>
        <div className="ssj-row" style={{ gap: 8 }}>
          <button className="ssj-btn ssj-btn--sm" onClick={() => void carregar()} disabled={carregando}>
            <RefreshCw size={15} /> {carregando ? 'Atualizando…' : 'Atualizar'}
          </button>
          <button className="ssj-btn ssj-btn--sm ssj-btn--ghost" onClick={() => void sair().then(() => setLogado(false))}>
            Sair
          </button>
        </div>
      </div>

      {/* Indicadores — todos calculados sobre o que existe no banco */}
      <div className="ssj-grid" style={{ marginTop: 24 }}>
        <div className="ssj-card">
          <span className="ssj-label">No funil</span>
          <div className="ssj-metric" style={{ marginTop: 6 }}>{totalFunil}</div>
        </div>
        <div className="ssj-card">
          <span className="ssj-label">Em autorização de visto · 在留資格認定証明書</span>
          <div className="ssj-metric" style={{ marginTop: 6 }}>{emCoe}</div>
        </div>
        <div className="ssj-card">
          <span className="ssj-label">Fora do prazo</span>
          <div className="ssj-metric" style={{ marginTop: 6, color: atrasados ? 'var(--ssj-shu)' : undefined }}>
            {atrasados}
          </div>
        </div>
        <div className="ssj-card">
          <span className="ssj-label">Agências ativas</span>
          <div className="ssj-metric" style={{ marginTop: 6 }}>{agencias.length}</div>
        </div>
      </div>

      {atrasados > 0 && (
        <div className="ssj-card ssj-card--edge ssj-card--seal" style={{ marginTop: 18 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <AlertTriangle size={17} style={{ color: 'var(--ssj-shu)' }} />
            {atrasados} candidato(s) parados além do prazo da etapa
          </span>
        </div>
      )}

      {/* As 11 etapas */}
      <h2 style={{ marginTop: 36 }}>As 11 etapas</h2>
      <div className="ssj-scroll-x" style={{ display: 'flex', gap: 12, paddingBlock: 18 }}>
        {ETAPAS_FUNIL.map((e) => {
          const total = funil
            .filter((f) => STATUS[f.status]?.etapa === e.n)
            .reduce((n, f) => n + f.total, 0);
          return (
            <div key={e.n} className="ssj-card" style={{ minWidth: 168, padding: 16 }}>
              <div className="ssj-row" style={{ gap: 10 }}>
                <Hanko estado={total > 0 ? 'aprovado' : 'futuro'} texto={String(e.n)} size={30} title={e.pt} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.25 }}>{e.pt}</div>
                  <div className="ssj-mono ssj-muted" style={{ fontSize: 12.5 }}>{e.ja}</div>
                </div>
              </div>
              <div className="ssj-metric" style={{ marginTop: 12, fontSize: 26 }}>{total}</div>
            </div>
          );
        })}
      </div>

      {/* Busca e filtros */}
      <div className="ssj-row ssj-wrap" style={{ gap: 12, marginTop: 24 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--ssj-muted)' }} />
          <input
            className="ssj-input"
            style={{ paddingLeft: 40 }}
            placeholder="Buscar por nome"
            value={filtros.busca ?? ''}
            onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
          />
        </div>
        <select
          className="ssj-select"
          style={{ maxWidth: 280 }}
          value={filtros.status}
          onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value as Filtros['status'] }))}
        >
          <option value="todos">Todas as etapas</option>
          {ORDEM_FUNIL.map((s) => (
            <option key={s} value={s}>{STATUS[s].pt} · {STATUS[s].ja}</option>
          ))}
        </select>
        <select
          className="ssj-select"
          style={{ maxWidth: 220 }}
          value={filtros.agencia}
          onChange={(e) => setFiltros((f) => ({ ...f, agencia: e.target.value }))}
        >
          <option value="todas">Todas as agências</option>
          {agencias.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      {/* Lista */}
      {linhas.length === 0 ? (
        <div className="ssj-card" style={{ marginTop: 22, textAlign: 'center', padding: 48 }}>
          <Inbox size={34} style={{ color: 'var(--ssj-muted)', margin: '0 auto 14px' }} />
          <h3>Nenhum candidato ainda</h3>
          <p className="ssj-lead" style={{ marginTop: 8 }}>
            As candidaturas aparecem aqui assim que a primeira ficha for enviada pelo
            link da agência.
          </p>
        </div>
      ) : (
        <div className="ssj-card ssj-scroll-x" style={{ marginTop: 22, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 880 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ssj-rule)' }}>
                {['Candidato', 'Idade', 'Origem', 'Geração', 'Agência', 'Etapa', 'Parado', 'Mover para'].map((h) => (
                  <th key={h} className="ssj-label" style={{ textAlign: 'left', padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => {
                const def = STATUS[l.status];
                return (
                  <tr key={l.application_id} style={{ borderBottom: '1px solid var(--ssj-rule-2)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{l.nome_completo}</div>
                      {l.parecer && (
                        <div className="ssj-muted" style={{ fontSize: 13, marginTop: 3 }}>{l.parecer}</div>
                      )}
                    </td>
                    <td className="ssj-mono" style={{ padding: '14px 16px' }}>{l.idade ?? '—'}</td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {l.cidade ? `${l.cidade}/${l.estado ?? ''}` : '—'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>{l.geracao ?? '—'}</td>
                    <td style={{ padding: '14px 16px' }}>{l.agencia ?? 'direta'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`ssj-pill ${tomCor[def?.tom ?? 'neutro']}`} title={def?.descricao}>
                        {def?.pt}
                      </span>
                      <div className="ssj-mono ssj-muted" style={{ fontSize: 12, marginTop: 4 }}>{def?.ja}</div>
                    </td>
                    <td className="ssj-mono" style={{ padding: '14px 16px' }}>
                      <span style={{ color: def?.slaDias && l.dias_parado > def.slaDias ? 'var(--ssj-shu)' : undefined }}>
                        {l.dias_parado}d
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        className="ssj-select"
                        style={{ minWidth: 190, minHeight: 40 }}
                        value=""
                        onFocus={() => void abrirTransicoes(l)}
                        onChange={async (e) => {
                          const para = e.target.value as StatusCandidatura;
                          if (!para) return;
                          const r = await moverStatus(l.application_id, l.status, para);
                          if (r.ok) void carregar();
                        }}
                      >
                        <option value="">Mover…</option>
                        {(transicoes[l.status] ?? []).map((s) => (
                          <option key={s} value={s}>{STATUS[s]?.pt ?? s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="ssj-mono ssj-muted" style={{ marginTop: 16, fontSize: 13 }}>
        As transições oferecidas vêm de <code>pipeline_transitions</code> — o cliente
        ajusta o fluxo sem deploy. Cada mudança grava evento com autor e horário.
      </p>
    </div>
  );
}
