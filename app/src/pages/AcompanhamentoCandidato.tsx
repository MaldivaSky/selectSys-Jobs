import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, LogIn, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase, temBanco } from '../dados/supabase';
import { obterSessao } from '../dados/rascunhoFicha';
import { derivarPaleta, normalizarHex } from '../theme/marcaTenant';

/* ═══════════════════════════════════════════════════════════════════════════
   ACOMPANHAMENTO DO CANDIDATO  ·  /c/<slug>/acompanhamento
   ---------------------------------------------------------------------------
   O que o candidato dekassegui mais pergunta à agência é "e o meu processo?".
   Hoje ele preenche a ficha e desaparece: cada atualização vira uma ligação
   ou um WhatsApp. Gupy, Catho e InfoJobs resolvem isso com uma linha do tempo
   pública para o titular — é esse padrão que esta tela traz.

   O que ela mostra: em que etapa a candidatura está, quais já passaram e
   quando cada transição aconteceu.

   O que ela NÃO mostra, por decisão de projeto: nota de triagem, score de
   match, decisão de reprovação e qualquer campo de auditoria interna. Isso é
   instrumento de trabalho da agência. A tela lê apenas `applications` e
   `pipeline_events`, ambas sob RLS — o recorte real acontece no Postgres,
   não neste componente.
   ═════════════════════════════════════════════════════════════════════════ */

/** As 11 etapas do funil, na ordem do processo. Espelha ETAPAS do painel. */
const ETAPAS = [
  { id: 'recebida', label: 'Ficha recebida', grupo: 'No Brasil' },
  { id: 'verificacao_documentos', label: 'Conferência de documentos', grupo: 'No Brasil' },
  { id: 'aguardando_entrevista', label: 'Entrevista agendada', grupo: 'No Brasil' },
  { id: 'entrevista_realizada', label: 'Entrevista realizada', grupo: 'No Brasil' },
  { id: 'aprovado_entrevista', label: 'Aprovado na entrevista', grupo: 'No Brasil' },
  { id: 'selecao_empresa_japonesa', label: 'Em seleção pela empresa japonesa', grupo: 'No Japão' },
  { id: 'aprovado_oferta', label: 'Oferta aceita', grupo: 'No Japão' },
  { id: 'coe_andamento', label: 'COE em andamento', grupo: 'Imigração' },
  { id: 'coe_emitido', label: 'COE emitido', grupo: 'Imigração' },
  { id: 'visto_andamento', label: 'Visto em andamento', grupo: 'Imigração' },
  { id: 'preparacao_viagem', label: 'Preparação de embarque', grupo: 'Imigração' },
] as const;

/** Estados finais: não são posição na régua, são desfecho. */
const DESFECHOS: Record<string, { titulo: string; tom: 'bom' | 'neutro' | 'ruim' }> = {
  chegada_japao: { titulo: 'Chegada ao Japão confirmada', tom: 'bom' },
  admissao_concluida: { titulo: 'Admissão concluída', tom: 'bom' },
  reprovado: { titulo: 'Processo encerrado', tom: 'ruim' },
  desistente: { titulo: 'Processo encerrado a seu pedido', tom: 'neutro' },
  inativo: { titulo: 'Processo inativo', tom: 'neutro' },
  rascunho: { titulo: 'Ficha ainda não enviada', tom: 'neutro' },
};

interface Evento {
  para_status: string;
  created_at: string;
}

interface Candidatura {
  id: string;
  status: string;
  submetida_em: string | null;
  eventos: Evento[];
}

type Estado =
  | { fase: 'carregando' }
  | { fase: 'sem-sessao' }
  | { fase: 'sem-candidatura' }
  | { fase: 'erro'; mensagem: string }
  | { fase: 'pronto'; candidatura: Candidatura };

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function AcompanhamentoCandidato() {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [estado, setEstado] = useState<Estado>({ fase: 'carregando' });
  const [marca, setMarca] = useState<{ nome: string; cor: string; logo: string } | null>(null);

  const carregar = useCallback(async () => {
    if (!temBanco || !supabase || !tenantSlug) {
      setEstado({ fase: 'erro', mensagem: 'Serviço indisponível no momento.' });
      return;
    }
    setEstado({ fase: 'carregando' });

    // Vitrine pública: só as colunas que a RLS libera sem login.
    const { data: org } = await supabase
      .from('organizations')
      .select('id, nome, logo_url, cor_primaria')
      .eq('slug', tenantSlug)
      .maybeSingle();

    if (org) {
      setMarca({ nome: org.nome, cor: normalizarHex(org.cor_primaria), logo: org.logo_url ?? '' });
    }

    const sessao = await obterSessao();
    if (!sessao) {
      setEstado({ fase: 'sem-sessao' });
      return;
    }
    if (!org) {
      setEstado({ fase: 'erro', mensagem: 'Agência não encontrada.' });
      return;
    }

    // A RLS já limita a candidaturas do próprio titular; o filtro por
    // organização é recorte de tela, não de segurança.
    const { data, error } = await supabase
      .from('applications')
      .select('id, status, submetida_em, pipeline_events(para_status, created_at)')
      .eq('organization_id', org.id)
      .neq('status', 'rascunho')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setEstado({ fase: 'erro', mensagem: 'Não foi possível carregar seu processo agora.' });
      return;
    }
    if (!data) {
      setEstado({ fase: 'sem-candidatura' });
      return;
    }

    const eventos = ((data.pipeline_events ?? []) as Evento[])
      .slice()
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));

    setEstado({
      fase: 'pronto',
      candidatura: { id: data.id, status: data.status, submetida_em: data.submetida_em, eventos },
    });
  }, [tenantSlug]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const p = marca ? derivarPaleta(marca.cor, true) : null;
  const corMarca = p?.marca ?? 'var(--ssj-shu)';

  return (
    <main className="ssj-acomp">
      <header className="ssj-acomp__topo">
        {marca?.logo && <img src={marca.logo} alt={marca.nome} className="ssj-acomp__logo" />}
        <div>
          <p className="ssj-acomp__sobretitulo">{marca?.nome ?? 'Portal do candidato'}</p>
          <h1>Acompanhamento do seu processo</h1>
        </div>
      </header>

      {estado.fase === 'carregando' && (
        <div className="ssj-acomp__aviso">
          <Loader2 size={20} className="ssj-gira" />
          <p>Carregando seu processo…</p>
        </div>
      )}

      {estado.fase === 'sem-sessao' && (
        <div className="ssj-acomp__aviso">
          <LogIn size={20} />
          <div>
            <p>
              <strong>Entre para ver seu processo.</strong> Seus dados só aparecem depois que
              confirmamos que é você — é o mesmo acesso sem senha que você usou para enviar a ficha.
            </p>
            <Link to="/login" className="ssj-acomp__botao" style={{ background: corMarca }}>
              Entrar com meu e-mail
            </Link>
          </div>
        </div>
      )}

      {estado.fase === 'sem-candidatura' && (
        <div className="ssj-acomp__aviso">
          <AlertTriangle size={20} />
          <div>
            <p>
              <strong>Ainda não há candidatura enviada.</strong> Assim que você concluir a ficha, a
              linha do tempo do seu processo aparece aqui.
            </p>
            <Link to={`/c/${tenantSlug}`} className="ssj-acomp__botao" style={{ background: corMarca }}>
              Preencher minha ficha
            </Link>
          </div>
        </div>
      )}

      {estado.fase === 'erro' && (
        <div className="ssj-acomp__aviso ssj-acomp__aviso--ruim">
          <AlertTriangle size={20} />
          <div>
            <p>{estado.mensagem}</p>
            <button type="button" onClick={() => void carregar()} className="ssj-acomp__botao" style={{ background: corMarca }}>
              Tentar de novo
            </button>
          </div>
        </div>
      )}

      {estado.fase === 'pronto' && (() => {
        const { candidatura } = estado;
        const desfecho = DESFECHOS[candidatura.status];
        const indiceAtual = ETAPAS.findIndex((e) => e.id === candidatura.status);
        const quandoDe = new Map(candidatura.eventos.map((ev) => [ev.para_status, ev.created_at]));

        return (
          <>
            <section className="ssj-acomp__resumo" style={{ borderColor: corMarca }}>
              <p className="ssj-acomp__rotulo">Situação atual</p>
              <h2 style={{ color: corMarca }}>
                {desfecho ? desfecho.titulo : ETAPAS[indiceAtual]?.label ?? 'Em análise'}
              </h2>
              {candidatura.submetida_em && (
                <p className="ssj-acomp__meta">Ficha enviada em {formatarData(candidatura.submetida_em)}</p>
              )}
              {!desfecho && indiceAtual >= 0 && (
                <p className="ssj-acomp__meta">
                  Etapa {indiceAtual + 1} de {ETAPAS.length}
                </p>
              )}
            </section>

            <ol className="ssj-acomp__linha">
              {ETAPAS.map((etapa, i) => {
                const concluida = indiceAtual >= 0 && i < indiceAtual;
                const atual = i === indiceAtual;
                const quando = quandoDe.get(etapa.id);
                const anterior = i > 0 ? ETAPAS[i - 1].grupo : null;

                return (
                  <li
                    key={etapa.id}
                    className={`ssj-acomp__passo${atual ? ' e-atual' : ''}${concluida ? ' e-feito' : ''}`}
                  >
                    {etapa.grupo !== anterior && <p className="ssj-acomp__grupo">{etapa.grupo}</p>}
                    <div className="ssj-acomp__passo-linha">
                      <span className="ssj-acomp__marca" style={atual || concluida ? { color: corMarca } : undefined}>
                        {concluida ? <CheckCircle2 size={20} /> : atual ? <Clock size={20} /> : <Circle size={20} />}
                      </span>
                      <div>
                        <p className="ssj-acomp__passo-label">{etapa.label}</p>
                        {quando && <p className="ssj-acomp__passo-data">{formatarData(quando)}</p>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className="ssj-acomp__nota">
              Dúvidas sobre uma etapa? Fale com a {marca?.nome ?? 'sua agência'}. Esta página mostra
              apenas o andamento do seu processo.
            </p>
          </>
        );
      })()}
    </main>
  );
}
