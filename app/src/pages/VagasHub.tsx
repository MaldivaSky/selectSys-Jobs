import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, JapaneseYen, MapPin, Search, SearchX, Users } from 'lucide-react';
import { supabase } from '../dados/supabase';
import type { Language } from '../translations';

/* ═══════════════════════════════════════════════════════════════════════════
   VAGAS HUB (B2C)
   ---------------------------------------------------------------------------
   Reescrita sobre os primitivos. Esta página não declara nenhum pixel: respiro,
   tipografia e grade vêm de `primitivos.css`, cor vem dos tokens. Antes ela
   carregava a própria paleta em constantes e `fontSize: '3rem'` no título —
   que no celular ocupava três linhas e empurrava o conteúdo para baixo da
   dobra.

   A consulta também estava contra colunas inexistentes (`descricao`,
   `salario_hora`, `tipo_contrato`, `horario`, `status`), então a lista voltava
   vazia sempre e a tela mostrava "nenhuma vaga" mesmo com vaga publicada.
   Agora bate com o schema real (docs/schema/schema.sql).
   ═════════════════════════════════════════════════════════════════════════ */

interface VagaPublica {
  id: string;
  titulo: string;
  empresa_japonesa: string | null;
  provincia: string | null;
  cidade: string | null;
  setor: string | null;
  salario_hora_jpy: number | null;
  vagas_total: number;
  vagas_preenchidas: number;
  organizations: { nome: string } | null;
}

export function VagasHub({ lang: _lang }: { lang?: Language }) {
  const [vagas, setVagas] = useState<VagaPublica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [provincia, setProvincia] = useState('Todas');

  useEffect(() => {
    async function carregar() {
      if (!supabase) {
        setCarregando(false);
        return;
      }
      const { data } = await supabase
        .from('jobs')
        .select(
          'id, titulo, empresa_japonesa, provincia, cidade, setor, salario_hora_jpy, vagas_total, vagas_preenchidas, organizations(nome)',
        )
        .eq('publicada', true)
        .order('created_at', { ascending: false });

      setVagas((data as unknown as VagaPublica[]) ?? []);
      setCarregando(false);
    }
    void carregar();
  }, []);

  const provincias = useMemo(
    () => ['Todas', ...Array.from(new Set(vagas.map((v) => v.provincia).filter(Boolean) as string[]))],
    [vagas],
  );

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return vagas.filter((v) => {
      if (provincia !== 'Todas' && v.provincia !== provincia) return false;
      if (!termo) return true;
      return [v.titulo, v.setor, v.cidade, v.empresa_japonesa]
        .filter(Boolean)
        .some((c) => (c as string).toLowerCase().includes(termo));
    });
  }, [vagas, busca, provincia]);

  const temFiltro = busca.trim() !== '' || provincia !== 'Todas';

  return (
    <div className="ssj-page">
      <div className="ssj-container ssj-pilha ssj-pilha--lg" style={{ maxWidth: 1000 }}>
        <header className="ssj-centro ssj-pilha ssj-pilha--sm">
          <h1 className="ssj-titulo-hero">Vagas de trabalho no Japão</h1>
          <p className="ssj-lead">
            Oportunidades em empreiteiras verificadas, com acompanhamento do COE, do visto e da passagem.
          </p>
        </header>

        {/* Filtros: a linha quebra sozinha quando não cabe, sem media query. */}
        <div className="ssj-linha">
          <label className="ssj-campo-busca ssj-flex-1">
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por cargo, setor ou cidade"
              aria-label="Buscar vagas"
            />
          </label>

          <select
            className="ssj-input ssj-filtro-provincia"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            aria-label="Filtrar por província"
          >
            {provincias.map((p) => (
              <option key={p} value={p}>
                {p === 'Todas' ? 'Todas as províncias' : p}
              </option>
            ))}
          </select>
        </div>

        {carregando ? (
          /* Esqueleto no lugar de "Carregando...": segura a altura do conteúdo
             real e evita o salto de layout quando os dados chegam. */
          <div className="ssj-pilha ssj-pilha--sm" aria-busy="true" aria-label="Carregando vagas">
            {[0, 1, 2].map((i) => (
              <div key={i} className="ssj-esqueleto ssj-esqueleto--cartao" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="ssj-vazio">
            <SearchX size={30} className="ssj-vazio__icone" aria-hidden />
            <h2 className="ssj-subtitulo">
              {temFiltro ? 'Nenhuma vaga com esses filtros' : 'Ainda não há vagas publicadas'}
            </h2>
            <p className="ssj-texto">
              {temFiltro
                ? 'Tente ampliar a busca ou ver todas as províncias.'
                : 'Cadastre-se agora: assim que uma vaga abrir, sua ficha já estará na fila da agência.'}
            </p>
            {temFiltro ? (
              <button
                type="button"
                className="ssj-btn ssj-btn--ghost"
                onClick={() => {
                  setBusca('');
                  setProvincia('Todas');
                }}
              >
                Limpar filtros
              </button>
            ) : (
              <Link to="/candidato" className="ssj-btn ssj-btn--pri">
                Cadastrar minha ficha
              </Link>
            )}
          </div>
        ) : (
          <>
            <p className="ssj-texto" aria-live="polite">
              {filtradas.length} {filtradas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
            </p>

            <div className="ssj-pilha ssj-pilha--sm">
              {filtradas.map((vaga) => {
                const restantes = Math.max(0, vaga.vagas_total - vaga.vagas_preenchidas);
                return (
                  <Link key={vaga.id} to={`/vagas/${vaga.id}`} className="ssj-vaga-cartao">
                    <div className="ssj-flex-1 ssj-pilha ssj-pilha--xs">
                      <span className="ssj-vaga-agencia">
                        <Building2 size={15} aria-hidden />
                        {vaga.empresa_japonesa || vaga.organizations?.nome || 'Empreiteira parceira'}
                      </span>

                      <h2 className="ssj-subtitulo">{vaga.titulo}</h2>

                      <div className="ssj-linha ssj-vaga-tags">
                        {(vaga.cidade || vaga.provincia) && (
                          <span className="ssj-tag">
                            <MapPin size={14} aria-hidden />
                            {[vaga.cidade, vaga.provincia].filter(Boolean).join(', ')}
                          </span>
                        )}
                        {vaga.salario_hora_jpy && (
                          <span className="ssj-tag ssj-tag--valor">
                            <JapaneseYen size={14} aria-hidden />
                            {vaga.salario_hora_jpy.toLocaleString('ja-JP')}/hora
                          </span>
                        )}
                        {restantes > 0 && (
                          <span className="ssj-tag">
                            <Users size={14} aria-hidden />
                            {restantes} {restantes === 1 ? 'posto' : 'postos'}
                          </span>
                        )}
                        {vaga.setor && <span className="ssj-tag">{vaga.setor}</span>}
                      </div>
                    </div>

                    <span className="ssj-vaga-seta" aria-hidden>
                      <ArrowRight size={18} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
