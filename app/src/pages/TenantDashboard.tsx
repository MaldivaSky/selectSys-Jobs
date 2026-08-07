import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { supabase } from '../dados/supabase';
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Moon,
  Palette,
  Plane,
  Plus,
  RotateCcw,
  Settings,
  Sun,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useTheme } from '../theme/theme';
import { COR_PADRAO, derivarPaleta, normalizarHex } from '../theme/marcaTenant';
import { useNavigate, useParams } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════════════════
   PAINEL DA AGÊNCIA (TENANT)
   ---------------------------------------------------------------------------
   O painel é a casa da agência, não a nossa. Por isso a marca do cliente —
   logo e cor — governa o ambiente inteiro: cabeçalho, estado ativo do menu,
   botões, faixas do funil. O SelectSys aparece uma vez, discreto, no rodapé
   da barra lateral.

   Regra de dados: tudo aqui bate com o schema real (docs/schema/schema.sql).
   `jobs` não tem `descricao` nem `status` — a descrição vive em `requisitos`
   e o estado da vaga é `publicada`. Escrever colunas inexistentes é o que
   produzia "Could not find the column ... in the schema cache".
   ═════════════════════════════════════════════════════════════════════════ */

type Aba = 'visao' | 'vagas' | 'candidatos' | 'configuracoes';

interface Vaga {
  id: string;
  titulo: string;
  empresa_japonesa: string | null;
  provincia: string | null;
  cidade: string | null;
  setor: string | null;
  salario_hora_jpy: number | null;
  vagas_total: number;
  vagas_preenchidas: number;
  publicada: boolean;
  requisitos: Record<string, unknown> | null;
  created_at: string;
}

interface Candidatura {
  id: string;
  status: string;
  updated_at: string;
  created_at: string;
  candidates: { nome_completo: string; telefone: string | null; cidade: string | null; estado: string | null } | null;
  jobs: { titulo: string } | null;
}

/** Etapas do funil, na ordem real do processo dekassegui. */
const ETAPAS = [
  { id: 'recebida', label: 'Triagem', grupo: 'Captação' },
  { id: 'verificacao_documentos', label: 'Documentos', grupo: 'Captação' },
  { id: 'aguardando_entrevista', label: 'Entrevista', grupo: 'Seleção' },
  { id: 'aprovado_entrevista', label: 'Aprovado BR', grupo: 'Seleção' },
  { id: 'selecao_empresa_japonesa', label: 'Seleção Japão', grupo: 'Japão' },
  { id: 'aprovado_oferta', label: 'Oferta aceita', grupo: 'Japão' },
  { id: 'coe_andamento', label: 'COE', grupo: 'Imigração' },
  { id: 'visto_andamento', label: 'Visto', grupo: 'Imigração' },
  { id: 'preparacao_viagem', label: 'Embarque', grupo: 'Imigração' },
] as const;

const ETAPAS_TERMINAIS = ['reprovado', 'desistente', 'inativo', 'admissao_concluida', 'chegada_japao'];

/** Ponto de partida quando a agência ainda não editou a própria lista. */
const SETORES_PADRAO = ['Autopeças', 'Eletrônica', 'Alimentício', 'Metalurgia', 'Plásticos', 'Logística'];

const TURNOS = [
  { valor: 'diurno', label: 'Diurno' },
  { valor: 'noturno', label: 'Noturno' },
  { valor: 'alternado', label: 'Alternado' },
];

const SLA_DIAS = 15;

export function TenantDashboard() {
  const { escuro: isDark, alternar: alternarTema } = useTheme();
  const navigate = useNavigate();
  const { tenantSlug: slugFromUrl } = useParams<{ tenantSlug?: string }>();

  const [aba, setAba] = useState<Aba>('visao');
  const [loading, setLoading] = useState(true);
  const [erroFatal, setErroFatal] = useState<string | null>(null);

  const [tenant, setTenant] = useState<{ id: string; nome: string; slug: string; plano: string } | null>(null);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);

  // Identidade visual: `salvo` é o que está no banco, `config` é o que a tela
  // está mostrando. A diferença entre os dois é o que habilita "Salvar".
  const [salvo, setSalvo] = useState<{ logo: string; cor: string; setores: string[] }>({
    logo: '',
    cor: COR_PADRAO,
    setores: SETORES_PADRAO,
  });
  const [configLogo, setConfigLogo] = useState('');
  const [configCor, setConfigCor] = useState(COR_PADRAO);
  const [configSetores, setConfigSetores] = useState<string[]>(SETORES_PADRAO);
  const [novoSetor, setNovoSetor] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const inputArquivo = useRef<HTMLInputElement | null>(null);

  const [modalNovaVaga, setModalNovaVaga] = useState(false);
  const [criandoVaga, setCriandoVaga] = useState(false);
  const [novaVaga, setNovaVaga] = useState({
    titulo: '',
    empresa_japonesa: '',
    provincia: '',
    cidade: '',
    setor: SETORES_PADRAO[0],
    turnos: ['diurno'] as string[],
    salario_hora_jpy: '',
    horas_extras_dia: '',
    vagas_total: '1',
    descricao: '',
    publicada: true,
  });

  /* ── SUPERFÍCIES ────────────────────────────────────────────────────── */
  const pageBg = isDark ? '#0d1016' : '#f0f2f5';
  const sidebarBg = isDark ? '#12161d' : '#ffffff';
  const cardBg = isDark ? '#161b24' : '#ffffff';
  const sunkenBg = isDark ? '#0f131a' : '#f4f5f7';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#6b736f';
  const cardBorder = isDark ? '#29313c' : '#e2e4de';

  // A paleta segue `configCor` (e não a salva) para que ajustar o seletor
  // repinte o painel inteiro em tempo real — o cliente vê antes de salvar.
  const p = useMemo(() => derivarPaleta(configCor, isDark), [configCor, isDark]);
  const logoAtual = configLogo.trim();
  const temAlteracao =
    configLogo.trim() !== salvo.logo ||
    normalizarHex(configCor) !== salvo.cor ||
    configSetores.join('|') !== salvo.setores.join('|');

  /* ── CARGA ──────────────────────────────────────────────────────────── */
  const carregarDados = useCallback(async () => {
    if (!supabase) {
      setErroFatal('Conexão com o banco indisponível. Verifique as variáveis VITE_SUPABASE_*.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErroFatal(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErroFatal('Sessão expirada. Entre novamente para acessar o painel.');
      setLoading(false);
      return;
    }

    const { data: membership, error: memErr } = await supabase
      .from('memberships')
      .select('organization_id, role, organizations(id, nome, slug, plano, logo_url, cor_primaria, setores, features)')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .limit(1)
      .maybeSingle();

    if (memErr) {
      setErroFatal(`Não foi possível carregar sua organização: ${memErr.message}`);
      setLoading(false);
      return;
    }
    if (!membership?.organizations) {
      setErroFatal(
        'Seu usuário ainda não está vinculado a nenhuma agência. Peça ao administrador para criar o vínculo em memberships.',
      );
      setLoading(false);
      return;
    }

    const org = membership.organizations as unknown as {
      id: string;
      nome: string;
      slug: string | null;
      plano: string | null;
      logo_url: string | null;
      cor_primaria: string | null;
      setores: string[] | null;
      features: Record<string, string> | null;
    };

    const slug = org.slug || '';
    // Colunas dedicadas são a fonte da verdade; `features` fica como
    // compatibilidade com as organizações criadas pelo seed antigo.
    const logo = org.logo_url || org.features?.logo_url || '';
    const cor = normalizarHex(org.cor_primaria || org.features?.cor_primaria);
    const setores = org.setores?.length ? org.setores : SETORES_PADRAO;

    setTenant({ id: org.id, nome: org.nome, slug, plano: org.plano || 'founder' });
    setSalvo({ logo, cor, setores });
    setConfigLogo(logo);
    setConfigCor(cor);
    setConfigSetores(setores);
    setNovaVaga((v) => ({ ...v, setor: setores[0] ?? '' }));

    if (!slugFromUrl && slug) navigate(`/admin/${slug}`, { replace: true });

    const [{ data: vagasData }, { data: candData }] = await Promise.all([
      supabase
        .from('jobs')
        .select(
          'id, titulo, empresa_japonesa, provincia, cidade, setor, salario_hora_jpy, vagas_total, vagas_preenchidas, publicada, requisitos, created_at',
        )
        .eq('organization_id', org.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('id, status, updated_at, created_at, candidates(nome_completo, telefone, cidade, estado), jobs(titulo)')
        .eq('organization_id', org.id)
        .order('updated_at', { ascending: false }),
    ]);

    setVagas((vagasData as Vaga[]) || []);
    setCandidaturas((candData as unknown as Candidatura[]) || []);
    setLoading(false);
  }, [navigate, slugFromUrl]);

  useEffect(() => {
    void carregarDados();
  }, [carregarDados]);

  // A aba do navegador também é da agência.
  useEffect(() => {
    if (tenant?.nome) document.title = `${tenant.nome} · Painel`;
    return () => {
      document.title = 'SelectSys Jobs';
    };
  }, [tenant?.nome]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(t);
  }, [aviso]);

  /* ── MÉTRICAS ───────────────────────────────────────────────────────── */
  const metricas = useMemo(() => {
    const ativas = vagas.filter((v) => v.publicada);
    const postos = ativas.reduce((s, v) => s + Math.max(0, v.vagas_total - v.vagas_preenchidas), 0);
    const emAndamento = candidaturas.filter((c) => !ETAPAS_TERMINAIS.includes(c.status) && c.status !== 'rascunho');
    const embarcados = candidaturas.filter((c) => c.status === 'chegada_japao' || c.status === 'admissao_concluida');
    const atrasados = emAndamento.filter(
      (c) => (Date.now() - new Date(c.updated_at).getTime()) / 86_400_000 > SLA_DIAS,
    );
    const trintaDias = candidaturas.filter(
      (c) => (Date.now() - new Date(c.created_at).getTime()) / 86_400_000 <= 30,
    );
    const taxa = candidaturas.length ? Math.round((embarcados.length / candidaturas.length) * 100) : 0;
    return {
      vagasAtivas: ativas.length,
      postos,
      emAndamento: emAndamento.length,
      embarcados: embarcados.length,
      atrasados: atrasados.length,
      novos30: trintaDias.length,
      taxa,
    };
  }, [vagas, candidaturas]);

  const funil = useMemo(
    () => ETAPAS.map((e) => ({ ...e, total: candidaturas.filter((c) => c.status === e.id).length })),
    [candidaturas],
  );
  const funilPico = Math.max(1, ...funil.map((f) => f.total));

  const linkPublico = tenant?.slug ? `https://app.selectsys.com/c/${tenant.slug}` : '';

  /* ── AÇÕES ──────────────────────────────────────────────────────────── */
  async function salvarIdentidade() {
    if (!supabase || !tenant) return;
    setSalvando(true);
    const cor = normalizarHex(configCor);
    const logo = configLogo.trim();
    const setores = configSetores.length ? configSetores : SETORES_PADRAO;
    const { error } = await supabase
      .from('organizations')
      .update({ logo_url: logo || null, cor_primaria: cor, setores })
      .eq('id', tenant.id);
    setSalvando(false);

    if (error) {
      setAviso({ tipo: 'erro', texto: `Não foi possível salvar: ${error.message}` });
      return;
    }
    setSalvo({ logo, cor, setores });
    setConfigSetores(setores);
    setAviso({ tipo: 'ok', texto: 'Identidade visual aplicada em todo o ambiente.' });
  }

  async function enviarLogo(arquivo: File) {
    if (!supabase || !tenant) return;
    if (arquivo.size > 2 * 1024 * 1024) {
      setAviso({ tipo: 'erro', texto: 'O arquivo passa de 2 MB. Envie uma versão menor.' });
      return;
    }
    setEnviandoLogo(true);
    const ext = (arquivo.name.split('.').pop() || 'png').toLowerCase();
    const caminho = `${tenant.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('org-branding')
      .upload(caminho, arquivo, { cacheControl: '3600', upsert: true, contentType: arquivo.type });
    setEnviandoLogo(false);

    if (error) {
      setAviso({ tipo: 'erro', texto: `Falha no upload: ${error.message}` });
      return;
    }
    const { data } = supabase.storage.from('org-branding').getPublicUrl(caminho);
    setConfigLogo(data.publicUrl);
    setAviso({ tipo: 'ok', texto: 'Logo carregado. Clique em Salvar para publicar.' });
  }

  async function criarVaga(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !tenant) return;
    setCriandoVaga(true);

    // O schema não tem coluna de descrição: ela mora no jsonb `requisitos`.
    const { error } = await supabase.from('jobs').insert({
      organization_id: tenant.id,
      titulo: novaVaga.titulo.trim(),
      empresa_japonesa: novaVaga.empresa_japonesa.trim() || null,
      provincia: novaVaga.provincia.trim() || null,
      cidade: novaVaga.cidade.trim() || null,
      setor: novaVaga.setor || null,
      turnos: novaVaga.turnos.length ? novaVaga.turnos : null,
      salario_hora_jpy: novaVaga.salario_hora_jpy ? parseInt(novaVaga.salario_hora_jpy, 10) : null,
      horas_extras_dia: novaVaga.horas_extras_dia ? parseInt(novaVaga.horas_extras_dia, 10) : null,
      vagas_total: Math.max(1, parseInt(novaVaga.vagas_total || '1', 10)),
      requisitos: novaVaga.descricao.trim() ? { descricao: novaVaga.descricao.trim() } : {},
      publicada: novaVaga.publicada,
    });
    setCriandoVaga(false);

    if (error) {
      setAviso({ tipo: 'erro', texto: `Erro ao criar vaga: ${error.message}` });
      return;
    }
    setModalNovaVaga(false);
    setNovaVaga({
      titulo: '',
      empresa_japonesa: '',
      provincia: '',
      cidade: '',
      setor: configSetores[0] ?? '',
      turnos: ['diurno'],
      salario_hora_jpy: '',
      horas_extras_dia: '',
      vagas_total: '1',
      descricao: '',
      publicada: true,
    });
    setAviso({ tipo: 'ok', texto: 'Vaga publicada no Vagas Hub.' });
    void carregarDados();
  }

  async function alternarPublicacao(vaga: Vaga) {
    if (!supabase) return;
    const { error } = await supabase.from('jobs').update({ publicada: !vaga.publicada }).eq('id', vaga.id);
    if (error) {
      setAviso({ tipo: 'erro', texto: error.message });
      return;
    }
    setVagas((atual) => atual.map((v) => (v.id === vaga.id ? { ...v, publicada: !v.publicada } : v)));
  }

  async function moverCandidatura(id: string, novoStatus: string) {
    if (!supabase) return;
    const anterior = candidaturas;
    setCandidaturas((atual) =>
      atual.map((c) => (c.id === id ? { ...c, status: novoStatus, updated_at: new Date().toISOString() } : c)),
    );
    const { error } = await supabase
      .from('applications')
      .update({ status: novoStatus, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      setCandidaturas(anterior); // rollback: a tela não mente sobre o banco
      setAviso({ tipo: 'erro', texto: `Não foi possível mover: ${error.message}` });
    }
  }

  function adicionarSetor() {
    const nome = novoSetor.trim();
    if (!nome) return;
    if (configSetores.some((s) => s.toLowerCase() === nome.toLowerCase())) {
      setAviso({ tipo: 'erro', texto: `"${nome}" já está na lista.` });
      return;
    }
    setConfigSetores([...configSetores, nome]);
    setNovoSetor('');
  }

  async function sair() {
    await supabase?.auth.signOut();
    navigate('/login', { replace: true });
  }

  /* ── ESTILOS REUTILIZADOS ───────────────────────────────────────────── */
  const cardStyle: CSSProperties = {
    backgroundColor: cardBg,
    border: `1px solid ${cardBorder}`,
    borderRadius: '18px',
  };
  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${cardBorder}`,
    backgroundColor: sunkenBg,
    color: textPrimary,
    fontSize: '14px',
    outline: 'none',
  };
  const botaoMarca: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 22px',
    borderRadius: '12px',
    background: p.marca,
    color: p.sobreMarca,
    border: 'none',
    fontWeight: 700,
    fontSize: '14px',
    cursor: 'pointer',
    boxShadow: `0 8px 20px -8px ${p.marcaSombra}`,
  };
  const rotulo: CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: textSecondary,
    display: 'block',
    marginBottom: '8px',
  };

  /* ── PLACA DO LOGO ──────────────────────────────────────────────────── */
  // O logo do cliente é o elemento mais valorizado da tela: ele ganha uma
  // placa clara própria, para que logos escuros (a maioria) não sumam no
  // tema escuro, e um halo com a cor da marca.
  function PlacaLogo({ tamanho, raio = 18 }: { tamanho: number; raio?: number }) {
    return (
      <div
        style={{
          width: tamanho,
          height: tamanho,
          flexShrink: 0,
          borderRadius: raio,
          background: logoAtual ? '#ffffff' : p.gradiente,
          border: `1px solid ${logoAtual ? 'rgba(0,0,0,0.08)' : 'transparent'}`,
          boxShadow: `0 10px 28px -12px ${p.marcaSombra}, 0 0 0 4px ${p.marcaVeu}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: tamanho * 0.14,
          overflow: 'hidden',
        }}
      >
        {logoAtual ? (
          <img
            src={logoAtual}
            alt={tenant?.nome || 'Logo da agência'}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <Building2 size={tamanho * 0.45} color={p.sobreMarca} />
        )}
      </div>
    );
  }

  /* ── ESTADOS DE BORDA ───────────────────────────────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: pageBg,
          color: textSecondary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
        }}
      >
        <Loader2 size={20} className="ssj-spin" style={{ animation: 'ssj-rot 1s linear infinite' }} />
        Carregando painel da agência...
        <style>{'@keyframes ssj-rot { to { transform: rotate(360deg) } }'}</style>
      </div>
    );
  }

  if (erroFatal) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: pageBg,
          color: textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div style={{ ...cardStyle, padding: '32px', maxWidth: '520px', textAlign: 'center' }}>
          <AlertTriangle size={32} color="#c4452b" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Painel indisponível</h2>
          <p style={{ color: textSecondary, fontSize: '14px', lineHeight: 1.6 }}>{erroFatal}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
            <button onClick={() => void carregarDados()} style={botaoMarca}>
              <RotateCcw size={16} /> Tentar novamente
            </button>
            <button
              onClick={() => void sair()}
              style={{
                ...botaoMarca,
                background: 'transparent',
                color: textSecondary,
                border: `1px solid ${cardBorder}`,
                boxShadow: 'none',
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  const abas: { id: Aba; icone: ReactNode; label: string; contador?: number }[] = [
    { id: 'visao', icone: <LayoutDashboard size={19} />, label: 'Visão Geral' },
    { id: 'vagas', icone: <Briefcase size={19} />, label: 'Gestão de Vagas', contador: vagas.length },
    { id: 'candidatos', icone: <Users size={19} />, label: 'Funil de Candidatos', contador: metricas.emAndamento },
    { id: 'configuracoes', icone: <Settings size={19} />, label: 'Identidade & Ajustes' },
  ];

  const titulos: Record<Aba, { h1: string; sub: string }> = {
    visao: { h1: 'Visão Geral', sub: `Como a operação da ${tenant?.nome ?? 'agência'} está hoje.` },
    vagas: { h1: 'Gestão de Vagas', sub: 'Vagas publicadas aqui aparecem no Vagas Hub e são indexadas pelo Google Jobs.' },
    candidatos: { h1: 'Funil de Candidatos', sub: 'Do primeiro contato ao embarque, passando por COE e visto.' },
    configuracoes: { h1: 'Identidade & Ajustes', sub: 'A marca da agência governa todo o ambiente — inclusive o que o candidato vê.' },
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: pageBg,
        color: textPrimary,
        // `base.css` aplica `h1..h4 { color: var(--ssj-text) }`, que vence a
        // herança. Reancorar o token aqui faz os títulos do painel seguirem a
        // paleta do painel em vez da do site institucional.
        ['--ssj-text' as string]: textPrimary,
        // Fio de luz da marca no topo: assina o ambiente sem poluir.
        backgroundImage: `radial-gradient(1200px 400px at 20% -10%, ${p.marcaVeu}, transparent 70%)`,
      } as CSSProperties}
    >
      {/* ══ BARRA LATERAL ═════════════════════════════════════════════ */}
      <aside
        style={{
          width: '286px',
          flexShrink: 0,
          backgroundColor: sidebarBg,
          borderRight: `1px solid ${cardBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Assinatura da agência */}
        <div style={{ padding: '28px 22px 24px', borderBottom: `1px solid ${cardBorder}`, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(180deg, ${p.marcaVeu}, transparent)`,
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <PlacaLogo tamanho={64} raio={16} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px', lineHeight: 1.25, letterSpacing: '-0.01em' }}>
                {tenant?.nome}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 9px',
                    borderRadius: '999px',
                    background: p.marcaVeuForte,
                    color: p.marcaLegivel,
                  }}
                >
                  {tenant?.plano}
                </span>
                <span style={{ fontSize: '11px', color: textSecondary, fontFamily: 'monospace' }}>/{tenant?.slug}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav style={{ padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {abas.map((item) => {
            const ativo = aba === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAba(item.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: ativo ? p.marcaVeu : 'transparent',
                  color: ativo ? p.marcaLegivel : textSecondary,
                  fontWeight: ativo ? 700 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.18s ease, color 0.18s ease',
                }}
              >
                {ativo && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '22px',
                      borderRadius: '0 3px 3px 0',
                      background: p.marca,
                    }}
                  />
                )}
                {item.icone}
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.contador !== undefined && item.contador > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: ativo ? p.marca : sunkenBg,
                      color: ativo ? p.sobreMarca : textSecondary,
                    }}
                  >
                    {item.contador}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Nós, discretos. */}
        <div style={{ padding: '16px 22px 22px', borderTop: `1px solid ${cardBorder}` }}>
          <button
            onClick={() => void sair()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 0',
              background: 'none',
              border: 'none',
              color: textSecondary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} /> Encerrar sessão
          </button>
          <div style={{ fontSize: '10px', color: textSecondary, opacity: 0.65, marginTop: '10px', letterSpacing: '0.04em' }}>
            operado com <strong style={{ fontWeight: 700 }}>SelectSys Jobs</strong>
          </div>
        </div>
      </aside>

      {/* ══ ÁREA PRINCIPAL ════════════════════════════════════════════ */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Barra superior */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 36px',
            borderBottom: `1px solid ${cardBorder}`,
            backgroundColor: `${sidebarBg}cc`,
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{titulos[aba].h1}</h1>
            <p style={{ color: textSecondary, fontSize: '13px', marginTop: '2px' }}>{titulos[aba].sub}</p>
          </div>

          {linkPublico && (
            <a
              href={`/c/${tenant?.slug}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 14px',
                borderRadius: '10px',
                border: `1px solid ${p.marcaBorda}`,
                background: p.marcaVeu,
                color: p.marcaLegivel,
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ExternalLink size={15} /> Página do candidato
            </a>
          )}

          <button
            onClick={alternarTema}
            title={isDark ? 'Tema claro' : 'Tema escuro'}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: `1px solid ${cardBorder}`,
              background: 'transparent',
              color: textSecondary,
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {aba !== 'configuracoes' && (
            <button onClick={() => setModalNovaVaga(true)} style={botaoMarca}>
              <Plus size={17} /> Nova vaga
            </button>
          )}
        </header>

        <main style={{ flex: 1, padding: '32px 36px 48px', overflowX: 'hidden' }}>
          {/* ── VISÃO GERAL ───────────────────────────────────────── */}
          {aba === 'visao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1240px' }}>
              {/* Faixa de marca: o logo em destaque máximo */}
              <section
                style={{
                  borderRadius: '22px',
                  background: p.gradiente,
                  padding: '32px 34px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '26px',
                  flexWrap: 'wrap',
                  boxShadow: `0 24px 60px -30px ${p.marcaSombra}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '-80px',
                    width: '320px',
                    height: '320px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />
                <div
                  style={{
                    width: '104px',
                    height: '104px',
                    borderRadius: '24px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '14px',
                    boxShadow: '0 18px 40px -18px rgba(0,0,0,0.55)',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                  {logoAtual ? (
                    <img
                      src={logoAtual}
                      alt={tenant?.nome || ''}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Building2 size={44} color={p.marca} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '240px', position: 'relative', color: p.sobreMarca }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em', opacity: 0.75 }}>
                    PAINEL DA AGÊNCIA · BRASIL → JAPÃO
                  </div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', margin: '6px 0 10px' }}>
                    {tenant?.nome}
                  </h2>
                  <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '13px', opacity: 0.9 }}>
                    <span>
                      <strong style={{ fontWeight: 800 }}>{metricas.postos}</strong> postos em aberto
                    </span>
                    <span>
                      <strong style={{ fontWeight: 800 }}>{metricas.emAndamento}</strong> candidatos em processo
                    </span>
                    <span>
                      <strong style={{ fontWeight: 800 }}>{metricas.novos30}</strong> novos em 30 dias
                    </span>
                  </div>
                </div>
              </section>

              {/* KPIs */}
              <section
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
              >
                {[
                  {
                    icone: <Briefcase size={18} />,
                    label: 'Vagas ativas',
                    valor: metricas.vagasAtivas,
                    nota: `${metricas.postos} postos disponíveis`,
                    cor: p.marcaLegivel,
                  },
                  {
                    icone: <Users size={18} />,
                    label: 'No funil',
                    valor: metricas.emAndamento,
                    nota: `${metricas.novos30} entraram em 30 dias`,
                    cor: p.marcaLegivel,
                  },
                  {
                    icone: <AlertTriangle size={18} />,
                    label: 'SLA em risco',
                    valor: metricas.atrasados,
                    nota: `parados há mais de ${SLA_DIAS} dias`,
                    cor: metricas.atrasados > 0 ? '#c4452b' : textSecondary,
                  },
                  {
                    icone: <Plane size={18} />,
                    label: 'Embarcados',
                    valor: metricas.embarcados,
                    nota: `${metricas.taxa}% de conversão total`,
                    cor: '#1f7a4d',
                  },
                ].map((k) => (
                  <div key={k.label} style={{ ...cardStyle, padding: '22px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: k.cor,
                        fontSize: '12px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {k.icone} {k.label}
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '10px 0 4px' }}>
                      {k.valor}
                    </div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>{k.nota}</div>
                  </div>
                ))}
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '16px' }}>
                {/* Funil */}
                <section style={{ ...cardStyle, padding: '26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                    <TrendingUp size={18} color={p.marcaLegivel} />
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Distribuição do funil</h3>
                  </div>
                  {candidaturas.length === 0 ? (
                    <VazioInline
                      texto="Nenhuma candidatura ainda. Divulgue o link de captação para começar a receber."
                      cor={textSecondary}
                      borda={cardBorder}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {funil.map((f, i) => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '116px', fontSize: '12px', fontWeight: 600, color: textSecondary }}>
                            {f.label}
                          </div>
                          <div style={{ flex: 1, height: '26px', borderRadius: '8px', background: sunkenBg, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${(f.total / funilPico) * 100}%`,
                                height: '100%',
                                borderRadius: '8px',
                                background: p.rampa[Math.min(p.rampa.length - 1, Math.floor((i / ETAPAS.length) * p.rampa.length))],
                                transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                              }}
                            />
                          </div>
                          <div style={{ width: '32px', textAlign: 'right', fontSize: '14px', fontWeight: 800 }}>
                            {f.total}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Link de captação */}
                <section style={{ ...cardStyle, padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Captação B2C</h3>
                  <p style={{ fontSize: '13px', color: textSecondary, lineHeight: 1.6 }}>
                    Este link abre um formulário com a marca da {tenant?.nome} — logo, cor e nome da agência.
                  </p>
                  <CampoLink valor={linkPublico} p={p} borda={cardBorder} fundo={sunkenBg} texto={textPrimary} />
                  <div style={{ height: '1px', background: cardBorder }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {vagas.slice(0, 3).map((v) => (
                      <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                        <span
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: v.publicada ? '#1f7a4d' : textSecondary,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.titulo}
                        </span>
                        <span style={{ color: textSecondary, fontSize: '12px' }}>
                          {v.vagas_preenchidas}/{v.vagas_total}
                        </span>
                      </div>
                    ))}
                    {vagas.length === 0 && (
                      <span style={{ fontSize: '13px', color: textSecondary }}>Nenhuma vaga cadastrada.</span>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* ── VAGAS ──────────────────────────────────────────────── */}
          {aba === 'vagas' && (
            <div style={{ maxWidth: '1240px' }}>
              {vagas.length === 0 ? (
                <div style={{ ...cardStyle, padding: '56px', textAlign: 'center' }}>
                  <Briefcase size={34} color={p.marcaLegivel} style={{ margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>Nenhuma vaga publicada</h3>
                  <p style={{ color: textSecondary, fontSize: '14px', marginBottom: '24px' }}>
                    A primeira vaga publicada já entra no Vagas Hub com a marca da agência.
                  </p>
                  <button onClick={() => setModalNovaVaga(true)} style={{ ...botaoMarca, margin: '0 auto' }}>
                    <Plus size={17} /> Publicar primeira vaga
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {vagas.map((v) => {
                    const restantes = Math.max(0, v.vagas_total - v.vagas_preenchidas);
                    const pct = v.vagas_total ? (v.vagas_preenchidas / v.vagas_total) * 100 : 0;
                    return (
                      <article key={v.id} style={{ ...cardStyle, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{v.titulo}</h3>
                            {v.empresa_japonesa && (
                              <div style={{ fontSize: '12px', color: p.marcaLegivel, fontWeight: 700, marginTop: '4px' }}>
                                {v.empresa_japonesa}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => void alternarPublicacao(v)}
                            title={v.publicada ? 'Despublicar' : 'Publicar'}
                            style={{
                              flexShrink: 0,
                              height: 'fit-content',
                              fontSize: '10px',
                              fontWeight: 800,
                              letterSpacing: '0.06em',
                              padding: '5px 10px',
                              borderRadius: '999px',
                              cursor: 'pointer',
                              border: 'none',
                              background: v.publicada ? (isDark ? '#12291e' : '#e2f0e9') : sunkenBg,
                              color: v.publicada ? (isDark ? '#4fc287' : '#1f7a4d') : textSecondary,
                            }}
                          >
                            {v.publicada ? 'PUBLICADA' : 'RASCUNHO'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: textSecondary }}>
                          {v.setor && (
                            <span
                              style={{
                                alignSelf: 'flex-start',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '3px 10px',
                                borderRadius: '999px',
                                background: p.marcaVeu,
                                color: p.marcaLegivel,
                              }}
                            >
                              {v.setor}
                            </span>
                          )}
                          {(v.cidade || v.provincia) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MapPin size={15} /> {[v.cidade, v.provincia].filter(Boolean).join(' · ')}
                            </div>
                          )}
                          {v.salario_hora_jpy && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, color: textPrimary }}>
                                ¥{v.salario_hora_jpy.toLocaleString('ja-JP')}
                              </span>
                              /hora
                            </div>
                          )}
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: textSecondary, marginBottom: '6px' }}>
                            <span>
                              {v.vagas_preenchidas} de {v.vagas_total} preenchidas
                            </span>
                            <span style={{ fontWeight: 700 }}>{restantes} em aberto</span>
                          </div>
                          <div style={{ height: '6px', borderRadius: '999px', background: sunkenBg, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: p.marca, borderRadius: '999px' }} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── FUNIL ──────────────────────────────────────────────── */}
          {aba === 'candidatos' && (
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', alignItems: 'flex-start' }}>
              {ETAPAS.map((etapa, idx) => {
                const cards = candidaturas.filter((c) => c.status === etapa.id);
                return (
                  <div
                    key={etapa.id}
                    style={{
                      background: isDark ? '#12161d' : '#e7e9ec',
                      minWidth: '272px',
                      width: '272px',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      border: `1px solid ${cardBorder}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '2px',
                          background: p.rampa[Math.min(p.rampa.length - 1, Math.floor((idx / ETAPAS.length) * p.rampa.length))],
                        }}
                      />
                      <h3 style={{ flex: 1, fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: textSecondary }}>
                        {etapa.label}
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 800, background: cardBg, padding: '2px 8px', borderRadius: '999px' }}>
                        {cards.length}
                      </span>
                    </div>

                    {cards.map((card) => {
                      const dias = Math.floor((Date.now() - new Date(card.updated_at).getTime()) / 86_400_000);
                      const proxima = ETAPAS[idx + 1];
                      return (
                        <div
                          key={card.id}
                          style={{
                            background: cardBg,
                            padding: '14px',
                            borderRadius: '10px',
                            border: `1px solid ${cardBorder}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '13.5px' }}>
                            {card.candidates?.nome_completo || 'Sem nome'}
                          </div>
                          {card.jobs?.titulo && (
                            <div style={{ fontSize: '11.5px', color: p.marcaLegivel, fontWeight: 700 }}>{card.jobs.titulo}</div>
                          )}
                          <div style={{ fontSize: '11.5px', color: textSecondary }}>
                            {card.candidates?.telefone || '—'}
                            {card.candidates?.cidade ? ` · ${card.candidates.cidade}/${card.candidates.estado ?? ''}` : ''}
                          </div>
                          {dias > SLA_DIAS && (
                            <div
                              style={{
                                marginTop: '4px',
                                fontSize: '10.5px',
                                fontWeight: 800,
                                color: '#c4452b',
                                background: 'rgba(196,69,43,0.12)',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                alignSelf: 'flex-start',
                              }}
                            >
                              SLA atrasado · {dias} dias
                            </div>
                          )}
                          {proxima && (
                            <button
                              onClick={() => void moverCandidatura(card.id, proxima.id)}
                              style={{
                                marginTop: '8px',
                                padding: '7px',
                                borderRadius: '8px',
                                border: `1px solid ${p.marcaBorda}`,
                                background: p.marcaVeu,
                                color: p.marcaLegivel,
                                fontSize: '11.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Avançar → {proxima.label}
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {cards.length === 0 && (
                      <div
                        style={{
                          padding: '18px',
                          textAlign: 'center',
                          color: textSecondary,
                          fontSize: '12px',
                          border: `1.5px dashed ${cardBorder}`,
                          borderRadius: '10px',
                        }}
                      >
                        Vazio
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── IDENTIDADE ─────────────────────────────────────────── */}
          {aba === 'configuracoes' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 380px)', gap: '20px', maxWidth: '1160px', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Logo */}
                <section style={{ ...cardStyle, padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <ImageIcon size={18} color={p.marcaLegivel} />
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Logo da agência</h3>
                  </div>

                  <div style={{ display: 'flex', gap: '22px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <PlacaLogo tamanho={112} raio={22} />
                    <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => inputArquivo.current?.click()}
                          disabled={enviandoLogo}
                          style={{ ...botaoMarca, opacity: enviandoLogo ? 0.6 : 1 }}
                        >
                          {enviandoLogo ? <Loader2 size={16} /> : <Upload size={16} />}
                          {enviandoLogo ? 'Enviando...' : 'Enviar imagem'}
                        </button>
                        {logoAtual && (
                          <button
                            onClick={() => setConfigLogo('')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px 18px',
                              borderRadius: '12px',
                              border: `1px solid ${cardBorder}`,
                              background: 'transparent',
                              color: textSecondary,
                              fontWeight: 700,
                              fontSize: '14px',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={15} /> Remover
                          </button>
                        )}
                      </div>
                      <input
                        ref={inputArquivo}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void enviarLogo(f);
                          e.target.value = '';
                        }}
                      />
                      <div>
                        <label style={rotulo}>ou cole uma URL</label>
                        <input
                          value={configLogo}
                          onChange={(e) => setConfigLogo(e.target.value)}
                          placeholder="https://..."
                          style={inputStyle}
                        />
                      </div>
                      <p style={{ fontSize: '12px', color: textSecondary, lineHeight: 1.55 }}>
                        PNG ou SVG com fundo transparente, até 2 MB. O logo aparece no painel, no formulário do
                        candidato e nas vagas publicadas.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Cor */}
                <section style={{ ...cardStyle, padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Palette size={18} color={p.marcaLegivel} />
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Cor da marca</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <input
                      type="color"
                      value={p.marca}
                      onChange={(e) => setConfigCor(e.target.value)}
                      style={{ width: '56px', height: '56px', padding: 0, border: `1px solid ${cardBorder}`, borderRadius: '12px', cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      value={configCor}
                      onChange={(e) => setConfigCor(e.target.value)}
                      style={{ ...inputStyle, width: '132px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                    />
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {p.rampa.map((c) => (
                        <span key={c} title={c} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c, border: `1px solid ${cardBorder}` }} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: textSecondary, marginTop: '16px', lineHeight: 1.55 }}>
                    Os tons de apoio, o contraste do texto e as faixas do funil são calculados a partir desta cor.
                    Qualquer cor escolhida continua legível no tema claro e no escuro.
                  </p>
                </section>

                {/* Setores — taxonomia da agência */}
                <section style={{ ...cardStyle, padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <Layers size={18} color={p.marcaLegivel} />
                    <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Setores de atuação</h3>
                  </div>
                  <p style={{ fontSize: '12.5px', color: textSecondary, marginBottom: '18px', lineHeight: 1.55 }}>
                    Esta é a lista que aparece no cadastro de vagas e nos filtros do Vagas Hub. Cada agência define a
                    própria — quem trabalha com metalurgia não precisa carregar categorias de alimentício.
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {configSetores.map((s) => (
                      <span
                        key={s}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px 7px 14px',
                          borderRadius: '999px',
                          background: p.marcaVeu,
                          border: `1px solid ${p.marcaBorda}`,
                          color: p.marcaLegivel,
                          fontSize: '13px',
                          fontWeight: 700,
                        }}
                      >
                        {s}
                        <button
                          onClick={() => setConfigSetores(configSetores.filter((x) => x !== s))}
                          title={`Remover ${s}`}
                          style={{
                            display: 'grid',
                            placeItems: 'center',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'transparent',
                            color: 'inherit',
                            cursor: 'pointer',
                            opacity: 0.7,
                          }}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                    {configSetores.length === 0 && (
                      <span style={{ fontSize: '13px', color: textSecondary }}>
                        Nenhum setor — o campo ficará livre no cadastro de vagas.
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      value={novoSetor}
                      onChange={(e) => setNovoSetor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key !== 'Enter') return;
                        e.preventDefault();
                        adicionarSetor();
                      }}
                      placeholder="Adicionar setor (ex.: Construção civil)"
                      style={inputStyle}
                    />
                    <button
                      onClick={adicionarSetor}
                      disabled={!novoSetor.trim()}
                      style={{ ...botaoMarca, opacity: novoSetor.trim() ? 1 : 0.45 }}
                    >
                      <Plus size={16} /> Adicionar
                    </button>
                  </div>
                  {configSetores.length !== salvo.setores.length && (
                    <p style={{ fontSize: '12px', color: textSecondary, marginTop: '12px' }}>
                      Vagas já cadastradas mantêm o setor que receberam; a lista vale para os próximos cadastros.
                    </p>
                  )}
                </section>

                {/* Link */}
                <section style={{ ...cardStyle, padding: '28px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '16px' }}>Link único de captação</h3>
                  <CampoLink valor={linkPublico} p={p} borda={cardBorder} fundo={sunkenBg} texto={textPrimary} />
                  <p style={{ fontSize: '12px', color: textSecondary, marginTop: '10px' }}>
                    Compartilhe nas redes da agência: o candidato preenche a ficha já dentro da sua base.
                  </p>
                </section>

                {/* Barra de ação */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
                  {temAlteracao && (
                    <span style={{ fontSize: '12.5px', color: textSecondary, marginRight: 'auto' }}>
                      Alterações ainda não publicadas.
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setConfigLogo(salvo.logo);
                      setConfigCor(salvo.cor);
                      setConfigSetores(salvo.setores);
                      setNovoSetor('');
                    }}
                    disabled={!temAlteracao}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      border: `1px solid ${cardBorder}`,
                      background: 'transparent',
                      color: textSecondary,
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: temAlteracao ? 'pointer' : 'not-allowed',
                      opacity: temAlteracao ? 1 : 0.45,
                    }}
                  >
                    <RotateCcw size={15} /> Descartar
                  </button>
                  <button
                    onClick={() => void salvarIdentidade()}
                    disabled={!temAlteracao || salvando}
                    style={{ ...botaoMarca, opacity: !temAlteracao || salvando ? 0.5 : 1, cursor: temAlteracao ? 'pointer' : 'not-allowed' }}
                  >
                    {salvando ? <Loader2 size={16} /> : <Check size={16} />}
                    {salvando ? 'Salvando...' : 'Salvar identidade'}
                  </button>
                </div>
              </div>

              {/* Pré-visualização do que o candidato vê */}
              <aside style={{ ...cardStyle, padding: '22px', position: 'sticky', top: '108px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: textSecondary, marginBottom: '16px' }}>
                  Prévia · página do candidato
                </div>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${cardBorder}` }}>
                  <div style={{ background: p.gradiente, padding: '22px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fff', display: 'grid', placeItems: 'center', padding: '6px', flexShrink: 0 }}>
                      {logoAtual ? (
                        <img src={logoAtual} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Building2 size={22} color={p.marca} />
                      )}
                    </div>
                    <div style={{ color: p.sobreMarca, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.2 }}>{tenant?.nome}</div>
                      <div style={{ fontSize: '11px', opacity: 0.85 }}>Cadastro de candidato</div>
                    </div>
                  </div>
                  <div style={{ background: cardBg, padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Nome completo', 'Telefone / WhatsApp'].map((l) => (
                      <div key={l}>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: textSecondary, marginBottom: '5px' }}>{l}</div>
                        <div style={{ height: '32px', borderRadius: '8px', background: sunkenBg, border: `1px solid ${cardBorder}` }} />
                      </div>
                    ))}
                    <div style={{ height: '36px', borderRadius: '10px', background: p.marca, color: p.sobreMarca, display: 'grid', placeItems: 'center', fontSize: '12.5px', fontWeight: 800, marginTop: '4px' }}>
                      Continuar
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '11.5px', color: textSecondary, marginTop: '14px', lineHeight: 1.55 }}>
                  Logo, cor e nome da {tenant?.nome} conduzem a página inteira. O SelectSys aparece só como uma
                  assinatura discreta no rodapé.
                </p>
              </aside>
            </div>
          )}
        </main>
      </div>

      {/* ══ AVISO ═════════════════════════════════════════════════════ */}
      {aviso && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: cardBg,
            border: `1px solid ${aviso.tipo === 'ok' ? p.marcaBorda : '#c4452b'}`,
            boxShadow: '0 18px 40px -18px rgba(0,0,0,0.5)',
            fontSize: '13.5px',
            fontWeight: 600,
            maxWidth: '420px',
          }}
        >
          {aviso.tipo === 'ok' ? <Check size={17} color={p.marcaLegivel} /> : <AlertTriangle size={17} color="#c4452b" />}
          <span style={{ flex: 1 }}>{aviso.texto}</span>
          <button onClick={() => setAviso(null)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', display: 'grid' }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ══ MODAL NOVA VAGA ═══════════════════════════════════════════ */}
      {modalNovaVaga && (
        <div
          onMouseDown={(e) => e.target === e.currentTarget && setModalNovaVaga(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4,6,10,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <form
            onSubmit={criarVaga}
            style={{
              ...cardStyle,
              borderRadius: '22px',
              padding: '30px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: `1px solid ${cardBorder}`, paddingBottom: '18px' }}>
              <PlacaLogo tamanho={40} raio={11} />
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Nova vaga</h2>
                <p style={{ fontSize: '12.5px', color: textSecondary }}>Publicada em nome da {tenant?.nome}.</p>
              </div>
              <button type="button" onClick={() => setModalNovaVaga(false)} style={{ background: 'none', border: 'none', color: textSecondary, cursor: 'pointer', display: 'grid' }}>
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={rotulo}>Título da vaga</label>
              <input
                required
                autoFocus
                placeholder="Operador de linha — autopeças"
                value={novaVaga.titulo}
                onChange={(e) => setNovaVaga({ ...novaVaga, titulo: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={rotulo}>Empresa japonesa</label>
                <input
                  placeholder="Ex.: Toyota Boshoku"
                  value={novaVaga.empresa_japonesa}
                  onChange={(e) => setNovaVaga({ ...novaVaga, empresa_japonesa: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={rotulo}>Setor</label>
                {/* Lista da agência + criação inline: quem cadastra a vaga não
                    precisa sair da tela para incluir um setor que falta. */}
                <select
                  value={novaVaga.setor}
                  onChange={(e) => {
                    if (e.target.value === '__novo__') {
                      const nome = window.prompt('Nome do novo setor:')?.trim();
                      if (nome && !configSetores.includes(nome)) {
                        setConfigSetores([...configSetores, nome]);
                        setNovaVaga({ ...novaVaga, setor: nome });
                      }
                      return;
                    }
                    setNovaVaga({ ...novaVaga, setor: e.target.value });
                  }}
                  style={inputStyle}
                >
                  <option value="">— não informar —</option>
                  {configSetores.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="__novo__">+ Novo setor...</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={rotulo}>Província</label>
                <input
                  placeholder="Aichi"
                  value={novaVaga.provincia}
                  onChange={(e) => setNovaVaga({ ...novaVaga, provincia: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={rotulo}>Cidade</label>
                <input
                  placeholder="Nagoya"
                  value={novaVaga.cidade}
                  onChange={(e) => setNovaVaga({ ...novaVaga, cidade: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={rotulo}>Salário ¥/hora</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="1500"
                  value={novaVaga.salario_hora_jpy}
                  onChange={(e) => setNovaVaga({ ...novaVaga, salario_hora_jpy: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={rotulo}>H. extras/dia</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  placeholder="2"
                  value={novaVaga.horas_extras_dia}
                  onChange={(e) => setNovaVaga({ ...novaVaga, horas_extras_dia: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={rotulo}>Nº de postos</label>
                <input
                  type="number"
                  min="1"
                  value={novaVaga.vagas_total}
                  onChange={(e) => setNovaVaga({ ...novaVaga, vagas_total: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={rotulo}>Turnos</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {TURNOS.map((t) => {
                  const ativo = novaVaga.turnos.includes(t.valor);
                  return (
                    <button
                      key={t.valor}
                      type="button"
                      onClick={() =>
                        setNovaVaga({
                          ...novaVaga,
                          turnos: ativo ? novaVaga.turnos.filter((x) => x !== t.valor) : [...novaVaga.turnos, t.valor],
                        })
                      }
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: `1px solid ${ativo ? p.marcaBorda : cardBorder}`,
                        background: ativo ? p.marcaVeu : 'transparent',
                        color: ativo ? p.marcaLegivel : textSecondary,
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={rotulo}>Descrição e benefícios</label>
              <textarea
                placeholder="Detalhe a rotina, alojamento, transporte e benefícios..."
                value={novaVaga.descricao}
                onChange={(e) => setNovaVaga({ ...novaVaga, descricao: e.target.value })}
                style={{ ...inputStyle, minHeight: '110px', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={novaVaga.publicada}
                onChange={(e) => setNovaVaga({ ...novaVaga, publicada: e.target.checked })}
                style={{ width: '17px', height: '17px', accentColor: p.marca, cursor: 'pointer' }}
              />
              Publicar imediatamente no Vagas Hub
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '4px' }}>
              <button
                type="button"
                onClick={() => setModalNovaVaga(false)}
                style={{
                  padding: '12px 22px',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: textSecondary,
                  border: `1px solid ${cardBorder}`,
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button type="submit" disabled={criandoVaga} style={{ ...botaoMarca, opacity: criandoVaga ? 0.6 : 1 }}>
                {criandoVaga ? <Loader2 size={16} /> : <Plus size={16} />}
                {criandoVaga ? 'Publicando...' : 'Publicar vaga'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── AUXILIARES ────────────────────────────────────────────────────────── */

function VazioInline({ texto, cor, borda }: { texto: string; cor: string; borda: string }) {
  return (
    <div style={{ padding: '28px', textAlign: 'center', color: cor, fontSize: '13px', border: `1.5px dashed ${borda}`, borderRadius: '12px' }}>
      {texto}
    </div>
  );
}

function CampoLink({
  valor,
  p,
  borda,
  fundo,
  texto,
}: {
  valor: string;
  p: ReturnType<typeof derivarPaleta>;
  borda: string;
  fundo: string;
  texto: string;
}) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <input
        readOnly
        value={valor}
        onFocus={(e) => e.currentTarget.select()}
        style={{
          flex: 1,
          minWidth: 0,
          padding: '11px 14px',
          borderRadius: '10px',
          border: `1px solid ${borda}`,
          background: fundo,
          color: texto,
          fontFamily: 'monospace',
          fontSize: '12.5px',
        }}
      />
      <button
        onClick={() => {
          void navigator.clipboard.writeText(valor);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1800);
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          padding: '11px 16px',
          borderRadius: '10px',
          background: copiado ? 'transparent' : p.marca,
          color: copiado ? p.marcaLegivel : p.sobreMarca,
          border: `1px solid ${copiado ? p.marcaBorda : 'transparent'}`,
          fontWeight: 700,
          fontSize: '13px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {copiado ? <Check size={15} /> : <Copy size={15} />}
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}
