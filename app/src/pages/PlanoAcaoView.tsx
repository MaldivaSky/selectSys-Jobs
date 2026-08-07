import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  Globe,
  Layers,
  Lock,
  Mail,
  MessageCircle,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language } from '../translations';

/* ═══════════════════════════════════════════════════════════════════════════
   PROPOSTA COMERCIAL — SelectSys Jobs
   ---------------------------------------------------------------------------
   Esta página é a peça de venda do produto e, ao mesmo tempo, a proposta que o
   primeiro assinante aceita. Três decisões estruturam o texto:

   1. VENDE RESULTADO, NÃO CRONOGRAMA. Prazo por semana não pertence a uma
      página comercial — vira compromisso antes de existir contrato. Prazo é
      assunto de reunião e de anexo de escopo.

   2. PREÇO SOB CONSULTA PARA O MERCADO, condição de fundador nomeada para o
      primeiro assinante. Publicar mensalidade baixa em página aberta ancora o
      produto por baixo e derruba a margem de todo cliente seguinte.

   3. SÓ PROMETE O QUE JÁ RODA. O que depende de terceiro (aprovação da Meta
      para o WhatsApp oficial) não entra: promessa não cumprida em proposta
      comercial é passivo de contrato, não é marketing.

   Nenhuma cor literal aqui. A página inteira sai dos tokens e responde a tema
   claro e escuro — a versão anterior era `#f4f5f2` chumbado e ficava ilegível
   no escuro.
   ═════════════════════════════════════════════════════════════════════════ */

const WHATSAPP = '5511919889233';
const WHATSAPP_TEXTO = encodeURIComponent(
  'Olá, Rafael. Vi a proposta do SelectSys Jobs e quero conversar sobre implantar na minha agência.',
);
const EMAIL = 'rafaelmaldivas@miseon.app.br';

const ENTREGAS = [
  {
    icone: <FileSpreadsheet size={22} />,
    titulo: 'A sua ficha, digital',
    texto:
      'Você entrega a planilha que já usa. Devolvemos ela como formulário guiado, campo por campo — e a exportação sai no layout idêntico ao arquivo original. Ninguém no Japão precisa aprender formato novo.',
  },
  {
    icone: <Sparkles size={22} />,
    titulo: 'Autopreenchimento por IA',
    texto:
      'O candidato envia currículo, RG ou documento e a ficha se preenche sozinha. Cada campo lido aparece para conferência antes de entrar — a inteligência propõe, a pessoa decide.',
  },
  {
    icone: <Palette size={22} />,
    titulo: 'A marca é sua, não a nossa',
    texto:
      'Logo e cor da agência governam o painel e a página do candidato. Quem se cadastra vê a sua empresa do começo ao fim.',
  },
  {
    icone: <Search size={22} />,
    titulo: 'Visibilidade no Google Jobs',
    texto:
      'Cada vaga publicada entra no índice de empregos do Google com dados estruturados. Captação orgânica, sem verba de mídia.',
  },
  {
    icone: <Workflow size={22} />,
    titulo: 'Funil até o embarque',
    texto:
      'Da triagem ao COE, do visto à chegada. Cada etapa com prazo visível e alerta de atraso, para nenhum candidato parar sem ninguém perceber.',
  },
  {
    icone: <Layers size={22} />,
    titulo: 'Integração com o Garoon',
    texto:
      'O que a operação no Japão já usa continua valendo. A plataforma conversa com o ambiente existente em vez de exigir substituição.',
  },
];

const ETAPAS = [
  {
    n: '01',
    titulo: 'Você entrega o formulário',
    texto: 'A planilha ou ficha que a agência usa hoje, do jeito que está. É o único material necessário para começar.',
  },
  {
    n: '02',
    titulo: 'Implantamos personalizado',
    texto: 'Campos, regras, marca e link de captação configurados para a sua operação. Sem obrigar a agência a mudar o processo.',
  },
  {
    n: '03',
    titulo: 'Entra no ar com a sua marca',
    texto: 'Equipe treinada, link de captação ativo e as vagas indexadas. A partir daí é mensalidade, sem fidelidade.',
  },
];

const CONFIANCA = [
  { icone: <Lock size={18} />, titulo: 'Dados de saúde criptografados', texto: 'Criptografia individual no banco, conforme o Art. 11 da LGPD.' },
  { icone: <ShieldCheck size={18} />, titulo: 'Isolamento por agência', texto: 'Garantido no próprio banco de dados, não apenas na aplicação.' },
  { icone: <BadgeCheck size={18} />, titulo: 'Triagem explicável', texto: 'Toda decisão automática gera parecer auditável, com revisão humana.' },
  { icone: <CalendarCheck size={18} />, titulo: 'Trilha de auditoria', texto: 'Cada leitura e exportação de ficha fica registrada com autor e data.' },
];

const DUVIDAS = [
  {
    p: 'Preciso mudar a ficha que já uso?',
    r: 'Não. A ficha da agência é o ponto de partida da implantação, e a exportação continua saindo no mesmo layout que o Japão já recebe hoje.',
  },
  {
    p: 'E os candidatos que não têm computador?',
    r: 'A ficha foi desenhada para o celular primeiro. O candidato pode inclusive fotografar o documento e deixar a ficha se preencher.',
  },
  {
    p: 'Existe fidelidade?',
    r: 'Não há contrato de permanência. A implantação é paga uma vez e a assinatura é mensal, cancelável.',
  },
  {
    p: 'Quem é o dono dos dados?',
    r: 'A agência. Os dados são seus, exportáveis a qualquer momento, e nenhuma outra organização na plataforma tem acesso a eles.',
  },
];

export function PlanoAcaoView({ lang: _lang }: { lang?: Language }) {
  const zap = `https://wa.me/${WHATSAPP}?text=${WHATSAPP_TEXTO}`;

  return (
    <div className="ssj-prop">
      {/* ── ABERTURA ──────────────────────────────────────────────────── */}
      <section className="ssj-prop-hero">
        <div className="ssj-container ssj-pilha ssj-pilha--md ssj-centro">
          <span className="ssj-prop-selo">
            <Building2 size={14} /> Proposta comercial · Agências de recrutamento dekassegui
          </span>

          <h1 className="ssj-titulo-hero">
            Você não perde candidato por falta de vaga.
            <br />
            <span className="ssj-prop-realce">Perde no cadastro, no documento e na espera.</span>
          </h1>

          <p className="ssj-lead">
            Conhecemos o processo dekassegui de ponta a ponta — da ficha de 130 campos ao COE, do visto ao embarque.
            O SelectSys Jobs pega a ficha que a sua agência já usa e devolve uma plataforma completa de captação e
            acompanhamento, com a sua marca, no celular do candidato.
          </p>

          <div className="ssj-prop-acoes">
            <a href={zap} target="_blank" rel="noreferrer" className="ssj-btn ssj-btn--pri ssj-btn--lg">
              <MessageCircle size={18} /> Falar no WhatsApp
            </a>
            <Link to="/funcionalidades" className="ssj-btn ssj-btn--lg">
              Ver a plataforma <ArrowRight size={17} />
            </Link>
          </div>

          <p className="ssj-prop-nota">Implantação única + assinatura mensal · sem fidelidade</p>
        </div>
      </section>

      {/* ── AUTORIDADE NO DOMÍNIO ─────────────────────────────────────────
          Vocabulário é prova. Uma agência reconhece em três segundos quem já
          viu um koseki e quem está vendendo software genérico com a palavra
          "recrutamento" trocada. */}
      <section className="ssj-section ssj-prop-fundo">
        <div className="ssj-container ssj-pilha ssj-pilha--lg">
          <header className="ssj-centro ssj-pilha ssj-pilha--sm">
            <h2 className="ssj-titulo">Não vamos te explicar o seu próprio negócio</h2>
            <p className="ssj-lead">
              A plataforma nasceu dentro de uma operação real, sobre uma ficha real. Ela já entende o que a sua
              equipe faz todo dia.
            </p>
          </header>

          <div className="ssj-prop-dominio">
            {[
              { t: 'Geração nikkei', d: 'Issei, nissei, sansei, yonsei e cônjuge — porque é isso que define a elegibilidade do visto.' },
              { t: 'Documentos que vencem', d: 'Passaporte, visto, reentry permit e koseki, com alerta antes de virar problema no consulado.' },
              { t: 'COE e visto', d: 'Etapas próprias no funil, com prazo medido. É onde o processo trava e ninguém percebe.' },
              { t: 'Biometria para EPI', d: 'Altura, cintura e número do pé — a fábrica precisa disso antes de fechar a vaga.' },
              { t: 'Tatuagem e saúde', d: 'Perguntas que pesam na seleção japonesa, tratadas com o cuidado legal que exigem.' },
              { t: 'Histórico no Japão', d: 'Empreiteira, fábrica, província e motivo de saída — o que o cliente japonês olha primeiro.' },
            ].map((i) => (
              <div key={i.t} className="ssj-prop-dominio-item">
                <strong>{i.t}</strong>
                <span>{i.d}</span>
              </div>
            ))}
          </div>

          <p className="ssj-prop-missao">
            Nossa missão é simples: <strong>tirar a burocracia do caminho de quem quer trabalhar no Japão</strong> — e
            devolver à agência o tempo que hoje some em redigitação, cobrança de documento e planilha perdida.
          </p>
        </div>
      </section>

      {/* ── O PROBLEMA ────────────────────────────────────────────────── */}
      <section className="ssj-section">
        <div className="ssj-container ssj-prop-contraste">
          <article className="ssj-prop-lado">
            <span className="ssj-prop-rotulo">Hoje</span>
            <ul className="ssj-prop-lista">
              <li>Ficha em papel e planilha, redigitada mais de uma vez</li>
              <li>Candidato desiste no meio do cadastro e ninguém sabe por quê</li>
              <li>Processo parado no COE ou no visto sem alerta nenhum</li>
              <li>Dado sensível de saúde circulando em arquivo solto</li>
              <li>Captação dependendo de indicação e de anúncio pago</li>
            </ul>
          </article>

          <article className="ssj-prop-lado ssj-prop-lado--depois">
            <span className="ssj-prop-rotulo">Com o SelectSys Jobs</span>
            <ul className="ssj-prop-lista">
              <li>Ficha preenchida uma vez, pelo celular, com apoio de IA</li>
              <li>Cada etapa medida — dá para ver onde o candidato para</li>
              <li>Prazo por etapa com alerta automático de atraso</li>
              <li>Dados de saúde criptografados e acesso auditado</li>
              <li>Vagas no Google Jobs e link próprio de captação</li>
            </ul>
          </article>
        </div>
      </section>

      {/* ── O QUE ESTÁ INCLUÍDO ───────────────────────────────────────── */}
      <section className="ssj-section ssj-prop-fundo">
        <div className="ssj-container ssj-pilha ssj-pilha--lg">
          <header className="ssj-centro ssj-pilha ssj-pilha--sm">
            <h2 className="ssj-titulo">O que está incluído</h2>
            <p className="ssj-lead">
              Não é uma lista de funcionalidades para o futuro. É o que a plataforma entrega na implantação.
            </p>
          </header>

          <div className="ssj-auto">
            {ENTREGAS.map((e) => (
              <article key={e.titulo} className="ssj-card ssj-prop-cartao">
                <span className="ssj-prop-icone">{e.icone}</span>
                <h3 className="ssj-subtitulo">{e.titulo}</h3>
                <p className="ssj-texto">{e.texto}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────── */}
      <section className="ssj-section">
        <div className="ssj-container ssj-pilha ssj-pilha--lg">
          <header className="ssj-centro ssj-pilha ssj-pilha--sm">
            <h2 className="ssj-titulo">Do jeito mais simples possível</h2>
            <p className="ssj-lead">
              A implantação foi desenhada para exigir o mínimo da sua equipe. O trabalho pesado é nosso.
            </p>
          </header>

          <ol className="ssj-prop-passos">
            {ETAPAS.map((et) => (
              <li key={et.n} className="ssj-prop-passo">
                <span className="ssj-prop-passo-n">{et.n}</span>
                <h3 className="ssj-subtitulo">{et.titulo}</h3>
                <p className="ssj-texto">{et.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── INVESTIMENTO ──────────────────────────────────────────────── */}
      <section className="ssj-section ssj-prop-fundo">
        <div className="ssj-container ssj-pilha ssj-pilha--lg">
          <header className="ssj-centro ssj-pilha ssj-pilha--sm">
            <h2 className="ssj-titulo">Investimento</h2>
            <p className="ssj-lead">
              Modelo simples: um valor de implantação, uma vez, e uma assinatura mensal. Sem taxa por candidato, sem
              cobrança por usuário, sem fidelidade.
            </p>
          </header>

          <div className="ssj-prop-precos">
            <article className="ssj-card ssj-prop-preco">
              <span className="ssj-prop-rotulo">Implantação</span>
              <p className="ssj-prop-valor">Valor único</p>
              <p className="ssj-texto">
                Configuração da sua ficha, identidade visual da agência, link de captação, publicação das vagas e
                treinamento da equipe.
              </p>
            </article>

            <article className="ssj-card ssj-prop-preco">
              <span className="ssj-prop-rotulo">Assinatura</span>
              <p className="ssj-prop-valor">Mensal</p>
              <p className="ssj-texto">
                Plataforma no ar, hospedagem, atualizações, correções e suporte direto com quem construiu o sistema.
              </p>
            </article>
          </div>

          <p className="ssj-centro ssj-texto">
            Os valores são apresentados em reunião, junto ao escopo fechado da sua operação.
          </p>

          {/* Condição de fundador: nomeada, com prazo, e justificada pela troca
              real — quem entra primeiro dá referência de mercado e retorno de
              produto, e isso tem valor. */}
          <aside className="ssj-prop-fundador">
            <span className="ssj-prop-selo ssj-prop-selo--fundador">
              <BadgeCheck size={14} /> Condição fundador · primeiros assinantes
            </span>
            <h3 className="ssj-subtitulo">Para quem entra agora</h3>
            <p className="ssj-texto">
              As primeiras agências a adotar a plataforma recebem condição de implantação e mensalidade diferenciadas,
              congeladas por doze meses, em troca de participação próxima na evolução do produto. É uma janela de
              lançamento, não uma tabela permanente.
            </p>
            <a href={zap} target="_blank" rel="noreferrer" className="ssj-btn ssj-btn--seal">
              <MessageCircle size={17} /> Consultar a condição
            </a>
          </aside>
        </div>
      </section>

      {/* ── CONFIANÇA ─────────────────────────────────────────────────── */}
      <section className="ssj-section">
        <div className="ssj-container ssj-pilha ssj-pilha--lg">
          <header className="ssj-centro ssj-pilha ssj-pilha--sm">
            <h2 className="ssj-titulo">Dado de candidato é dado sensível</h2>
            <p className="ssj-lead">
              Ficha de dekassegui carrega documento, endereço, família e saúde. A arquitetura foi construída partindo
              disso, não adaptada depois.
            </p>
          </header>

          <div className="ssj-auto ssj-auto--sm">
            {CONFIANCA.map((c) => (
              <article key={c.titulo} className="ssj-prop-confianca">
                <span className="ssj-prop-icone ssj-prop-icone--sm">{c.icone}</span>
                <div>
                  <h3 className="ssj-prop-confianca-titulo">{c.titulo}</h3>
                  <p className="ssj-texto">{c.texto}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── DÚVIDAS ───────────────────────────────────────────────────── */}
      <section className="ssj-section ssj-prop-fundo">
        <div className="ssj-container ssj-pilha ssj-pilha--md" style={{ maxWidth: 760 }}>
          <h2 className="ssj-titulo ssj-centro">Perguntas que sempre aparecem</h2>
          {DUVIDAS.map((d) => (
            <details key={d.p} className="ssj-prop-duvida">
              <summary>{d.p}</summary>
              <p className="ssj-texto">{d.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── FECHAMENTO ────────────────────────────────────────────────── */}
      <section className="ssj-section">
        <div className="ssj-container">
          <div className="ssj-prop-fechamento">
            <div className="ssj-pilha ssj-pilha--sm">
              <h2 className="ssj-titulo">Vamos conversar sobre a sua operação</h2>
              <p className="ssj-lead">
                Uma conversa de trinta minutos é o suficiente para entender a sua ficha, o seu volume e o que faz
                sentido implantar. Sem compromisso e sem apresentação genérica.
              </p>
            </div>

            <div className="ssj-prop-contatos">
              <a href={zap} target="_blank" rel="noreferrer" className="ssj-btn ssj-btn--pri ssj-btn--lg">
                <MessageCircle size={18} /> WhatsApp (11) 91988-9233
              </a>
              <a href={`mailto:${EMAIL}?subject=SelectSys%20Jobs%20—%20proposta%20comercial`} className="ssj-btn ssj-btn--lg">
                <Mail size={17} /> {EMAIL}
              </a>
            </div>

            <p className="ssj-prop-assinatura">
              <Globe size={14} /> Rafael Maldivas · Responsável técnico e comercial · SelectSys Jobs
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
