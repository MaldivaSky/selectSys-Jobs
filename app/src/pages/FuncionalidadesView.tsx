import { useState } from 'react';
import { 
  Cpu, FileSpreadsheet, ShieldCheck, Database, Smartphone, Check, X, 
  Info, XCircle, HeartPulse, Sparkles, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language } from '../translations';

interface FeatureItem {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  dorDoCliente: string;
  nossaSolucao: string;
  resultadoPratico: string;
  icon: typeof Cpu;
  badge: string;
}

export function FuncionalidadesView({ lang }: { lang: Language }) {
  console.log('Language active:', lang);

  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  const features: FeatureItem[] = [
    {
      id: 'excel-exporter',
      title: 'Transformação de Planilhas em Formulários Digitais sem Fricção',
      category: 'Automação de Fichas',
      shortDesc: 'O candidato responde no celular de forma simples e seu RH baixa a planilha oficial exata exigida pela matriz no Japão em 1 clique.',
      dorDoCliente: 'A matriz no Japão exige planilhas cadastrais gigantes de 200+ células, mas enviar papéis ou PDFs faz candidatos desistirem no meio do caminho e força seu RH a gastar horas digitando dados manualmente.',
      nossaSolucao: 'Transformamos essa papelada em um formulário digital leve, bonito e intuitivo para o celular. Quando o candidato envia, nossa tecnologia preenche todas as 200+ células do modelo Excel da sua empresa automaticamente.',
      resultadoPratico: 'Zero digitação manual do RH, fim do abandono de fichas e envio imediato da planilha perfeita para a matriz no Japão.',
      icon: FileSpreadsheet,
      badge: '1 Clique em 0.3s'
    },
    {
      id: 'garoon-sync',
      title: 'Conexão Direta com a Matriz no Japão (Garoo Sync)',
      category: 'Integração Internacional',
      shortDesc: 'Envio automático do candidato aprovado para o sistema corporativo da matriz japonesa sem necessidade de troca de e-mails.',
      dorDoCliente: 'Após aprovar o candidato no Brasil, o RH perde dias valiosos trocando e-mails com o Japão para cadastrar dados de passaporte, visto e histórico nos sistemas da matriz.',
      nossaSolucao: 'Conectamos a plataforma diretamente à API corporativa (Cybozu Garoon) da matriz no Japão. Ao aprovar a candidatura no painel, todos os dados são transmitidos instantaneamente com segurança.',
      resultadoPratico: 'Elimina o retrabalho de digitação no Japão e antecipa em até 14 dias a emissão do visto de trabalho (COE).',
      icon: Database,
      badge: 'Conexão Japão'
    },
    {
      id: 'biometric-recruiter',
      title: 'Painel Biométrico & Ergonômico de Seleção Fabril',
      category: 'Gestão de Talentos',
      shortDesc: 'Filtros avançados para o recrutador selecionar candidatos pelo porte físico e altura ideal para cada linha de produção.',
      dorDoCliente: 'Enviar um trabalhador com altura ou calçado incompatível com a linha de montagem da fábrica gera trocas custosas de uniforme e desistências prematuras por dores físicas.',
      nossaSolucao: 'Capturamos as medidas exatas (altura, peso, calçado e cintura) e fornecemos um painel de filtros para o recrutador encontrar o perfil anatômico ideal para cada fábrica. O cálculo de IMC permanece confidencial no painel do recrutador.',
      resultadoPratico: 'Garante o encaixe ergonômico perfeito na fábrica, reduz a rotatividade no 1º mês e evita custos com trocas de EPI.',
      icon: HeartPulse,
      badge: 'Ergonomia Fabril'
    },
    {
      id: 'ai-parsing',
      title: 'Preenchimento Inteligente por Foto de Documento (IA)',
      category: 'Inteligência Artificial',
      shortDesc: 'O candidato tira foto do RG ou Passaporte e a IA preenche 70% da ficha em menos de 1 segundo.',
      dorDoCliente: 'Candidatos erram números de documentos, datas de validade e nomes ao digitar no celular, gerando recusas de visto na imigração.',
      nossaSolucao: 'Nossa inteligência artificial lê fotos de RG, CPF, CNH e Passaporte, extrai os campos com 99% de precisão e preenche o cadastro automaticamente.',
      resultadoPratico: 'Reduz o tempo de preenchimento do candidato de 45 minutos para 7 minutos e elimina erros de digitação.',
      icon: Cpu,
      badge: 'Preenchimento em 0.9s'
    },
    {
      id: 'lgpd-health',
      title: 'Triagem Transparente e Proteção Legal de Saúde',
      category: 'Segurança Jurídica',
      shortDesc: 'Avaliação automática de requisitos operacionais com parecer explicável e criptografia médica (LGPD Art. 11 & Art. 20).',
      dorDoCliente: 'Risco de passivos jurídicos e autuações ao coletar dados de saúde sem proteção adequada ou ao reprovar candidatos sem transparência.',
      nossaSolucao: 'Criptografamos dados de saúde no banco de dados e registramos decisões de triagem com justificativa clara e opção de revisão humana por recrutador.',
      resultadoPratico: 'Blindagem jurídica total para sua agência perante a LGPD e conformidade com a lei de privacidade do Japão (APPI).',
      icon: ShieldCheck,
      badge: 'Proteção Total'
    },
    {
      id: 'mobile-stepper',
      title: 'Portal do Candidato com Salvamento Automático',
      category: 'Experiência do Usuário',
      shortDesc: 'Passo a passo no celular que salva o progresso a cada 3 segundos para o candidato nunca perder dados.',
      dorDoCliente: 'Candidatos desistem de preencher a ficha quando o sinal de celular oscila ou quando a bateria descarrega.',
      nossaSolucao: 'Desenvolvemos uma experiência mobile-first leve que salva automaticamente cada resposta no próprio aparelho do candidato.',
      resultadoPratico: 'Aumenta a taxa de fichas concluídas de 35% para 88%, garantindo mais candidatos qualificados no seu funil.',
      icon: Smartphone,
      badge: 'Auto-Save 3s'
    }
  ];

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: 'var(--ssj-paper)',
      color: 'var(--ssj-text)',
      fontFamily: 'var(--ssj-font-sans)',
      padding: '48px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '56px'
    }}>

      {/* Header Title */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--ssj-indigo)',
          backgroundColor: 'var(--ssj-indigo-wash)',
          border: '1px solid var(--ssj-indigo-line)',
          padding: '6px 16px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Sparkles size={14} /> Soluções Desenhadas para Agências & Empreiteiras
        </div>

        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--ssj-text)', letterSpacing: '-0.03em' }}>
          Tudo o que sua operação precisa para captar e embarcar candidatos com eficiência
        </h1>

        <p style={{ fontSize: '1.15rem', color: 'var(--ssj-faint)', maxWidth: '800px', lineHeight: 1.6 }}>
          Elimine o trabalho manual, acabe com o abandono de fichas e conecte sua agência no Brasil diretamente com a matriz no Japão. Clique em qualquer card abaixo para ver o impacto de negócio.
        </p>
      </div>

      {/* 🔴 1. INTERACTIVE FEATURE CARDS GRID */}
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '24px'
      }}>
        {features.map((feat) => {
          const IconComp = feat.icon;
          return (
            <div
              key={feat.id}
              onClick={() => setSelectedFeature(feat)}
              style={{
                padding: '32px',
                borderRadius: '20px',
                backgroundColor: 'var(--ssj-surface)',
                border: '1px solid var(--ssj-rule)',
                boxShadow: 'var(--ssj-shadow-sm)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--ssj-shadow)';
                e.currentTarget.style.borderColor = 'var(--ssj-indigo)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--ssj-shadow-sm)';
                e.currentTarget.style.borderColor = 'var(--ssj-rule)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--ssj-indigo-wash)',
                  color: 'var(--ssj-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp style={{ width: '24px', height: '24px' }} />
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--ssj-verde-ink)',
                  backgroundColor: 'var(--ssj-verde-wash)',
                  border: '1px solid var(--ssj-verde-line)',
                  padding: '4px 10px',
                  borderRadius: '12px'
                }}>
                  {feat.badge}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ssj-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {feat.category}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ssj-text)', marginTop: '4px', lineHeight: 1.3 }}>
                  {feat.title}
                </h3>
              </div>

              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--ssj-faint)' }}>
                {feat.shortDesc}
              </p>

              <div style={{
                marginTop: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--ssj-indigo)',
                paddingTop: '12px',
                borderTop: '1px solid var(--ssj-rule-2)'
              }}>
                <span>Entenda como resolve a dor do seu RH</span>
                <Info style={{ width: '16px', height: '16px' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔴 2. DETAILED COMPARISON TABLE (SIM VS NÃO) */}
      <section style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px',
        borderRadius: '24px',
        backgroundColor: 'var(--ssj-surface)',
        border: '1px solid var(--ssj-rule)',
        boxShadow: 'var(--ssj-shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ssj-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Comparativo de Operação
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--ssj-text)' }}>
            Como sua agência opera hoje vs Com a SelectSys Jobs
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--ssj-surface-2)', borderBottom: '2px solid var(--ssj-rule-3)', color: 'var(--ssj-faint)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Desafio Operacional</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--ssj-shu)', textAlign: 'center' }}>Processo Tradicional em Papel / PDF</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--ssj-verde-ink)', textAlign: 'center' }}>Com a SelectSys Jobs</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: 'Preenchimento da Ficha Cadastral', m: 'Ficha longa em papel ou PDF que o candidato abandona no meio', s: 'Formulário leve no celular com preenchimento em minutos' },
                { f: 'Geração da Planilha da Matriz no Japão', m: 'RH digita manualmente campo por campo no Excel (horas de trabalho)', s: 'Planilha oficial gerada 100% pronta e formatada em 1 clique' },
                { f: 'Envio de Dados para a Matriz Japonesa', m: 'Troca de e-mails manuais, planilhas anexas e risco de extravio', s: 'Transmissão direta e segura para o sistema da matriz (Garoon API)' },
                { f: 'Conferência de Documentos', m: 'Digitação manual de nomes, passaportes e datas de nascimento', s: 'IA lê a foto do documento e preenche 70% da ficha sem erros' },
                { f: 'Match de Uniforme e Calçado de Segurança', m: 'Troca constante de equipamentos na chegada por erro de tamanho', s: 'Mapeamento anatômico exato em cm sem erros de tamanho' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--ssj-rule)' }}>
                  <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--ssj-text)' }}>{row.f}</td>
                  <td style={{ padding: '18px 20px', textAlign: 'center', color: 'var(--ssj-shu-2)', backgroundColor: 'var(--ssj-shu-wash-2)', fontWeight: 600, fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <XCircle style={{ width: '18px', height: '18px', color: 'var(--ssj-shu-2)', flexShrink: 0 }} />
                      <span>{row.m}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center', color: 'var(--ssj-verde-ink)', backgroundColor: 'var(--ssj-verde-wash)', fontWeight: 700, fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Check style={{ width: '18px', height: '18px', color: 'var(--ssj-verde-ink)', flexShrink: 0 }} />
                      <span>{row.s}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 🔴 3. INTERACTIVE FEATURE DETAIL MODAL */}
      {selectedFeature && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: 'var(--ssj-surface)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: 'var(--ssj-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
            color: 'var(--ssj-text)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => setSelectedFeature(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--ssj-surface-2)',
                border: '1px solid var(--ssj-rule)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--ssj-faint)'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                backgroundColor: 'var(--ssj-indigo-wash)',
                color: 'var(--ssj-indigo)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <selectedFeature.icon style={{ width: '28px', height: '28px' }} />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ssj-indigo)', textTransform: 'uppercase' }}>
                  {selectedFeature.category}
                </span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ssj-text)', marginTop: '2px', lineHeight: 1.3 }}>
                  {selectedFeature.title}
                </h3>
              </div>
            </div>

            {/* Bloco 1: A Dor do Cliente */}
            <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--ssj-shu-wash-2)', border: '1px solid var(--ssj-shu-line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ssj-shu-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🔴 A Dor Atual (Como é hoje sem o sistema)
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--ssj-text)', lineHeight: 1.6 }}>
                {selectedFeature.dorDoCliente}
              </div>
            </div>

            {/* Bloco 2: Nossa Solução */}
            <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--ssj-surface-2)', border: '1px solid var(--ssj-rule)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ssj-indigo)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🚀 A Nossa Solução (Como fica com a SelectSys Jobs)
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--ssj-text)', lineHeight: 1.6 }}>
                {selectedFeature.nossaSolucao}
              </div>
            </div>

            {/* Bloco 3: Resultado Prático */}
            <div style={{ padding: '18px', borderRadius: '14px', backgroundColor: 'var(--ssj-verde-wash)', border: '1px solid var(--ssj-verde-line)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ssj-verde-ink)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                💡 O Resultado Prático para sua Agência
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--ssj-verde-ink)', lineHeight: 1.6 }}>
                {selectedFeature.resultadoPratico}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                onClick={() => setSelectedFeature(null)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 700,
                  backgroundColor: 'var(--ssj-fill-pri)',
                  color: 'var(--ssj-on-fill-pri)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="ssj-section--ink" style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'var(--ssj-surface)',
        color: 'var(--ssj-text)',
        borderRadius: '24px',
        padding: '48px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--ssj-text)' }}>
          Quer transformar o recrutamento da sua agência hoje mesmo?
        </h2>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/vagas" style={{
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: 'var(--ssj-fill-pri)',
            color: 'var(--ssj-on-fill-pri)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Ver Vagas Abertas <ArrowRight size={16} />
          </Link>
          <Link to="/c/fujiarte" style={{
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: 'var(--ssj-surface-2)',
            color: 'var(--ssj-text)',
            border: '1px solid var(--ssj-rule)',
            textDecoration: 'none'
          }}>
            Testar Formulário sem Fricção no Celular
          </Link>
        </div>
      </section>
    </div>
  );
}
