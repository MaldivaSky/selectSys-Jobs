import { useState } from 'react';
import { 
  Cpu, FileSpreadsheet, ShieldCheck, Database, Smartphone, Check, X, 
  Info, Zap, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language } from '../translations';

interface FeatureItem {
  id: string;
  title: string;
  category: string;
  shortDesc: string;
  fullDesc: string;
  techDetail: string;
  businessImpact: string;
  icon: typeof Cpu;
  badge: string;
}

export function FuncionalidadesView({ lang }: { lang: Language }) {
  console.log('Language active:', lang);

  const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);

  const features: FeatureItem[] = [
    {
      id: 'ai-parsing',
      title: 'Leitura de Currículos e Documentos por IA (DeepSeek V3)',
      category: 'Inteligência Artificial',
      shortDesc: 'Extração instantânea de RG, Passaporte, CNH e Currículos em PDF ou foto em 0.9s com 99% de precisão.',
      fullDesc: 'O motor de IA do SelectSys Jobs processa imagens e documentos em papel enviados pelos candidatos, identificando nome completo, data de nascimento, filiação e ascendência. Ele preenche automaticamente ~70% dos 130 campos da Ficha Cadastral.',
      techDetail: 'Motor DeepSeek-V3 com custo de $0.14 por 1M tokens (95% mais econômico que Claude/GPT-4), processando JSON estruturado via API REST com validação de esquema Zod.',
      businessImpact: 'Reduz o tempo de preenchimento do candidato de 45 minutos para 7 minutos e elimina erros de digitação do RH.',
      icon: Cpu,
      badge: 'IA Integrada'
    },
    {
      id: 'excel-exporter',
      title: 'Exportador .XLS Fiel (Modelo Oficial FUJIARTE)',
      category: 'Interoperabilidade',
      shortDesc: 'Geração automatizada do arquivo Excel idêntico ao modelo oficial 白紙 FUJIARTE Ficha Cadastral (Jun2024).',
      fullDesc: 'Respeita rigorosamente o leiaute original exigido pela matriz no Japão, incluindo formatação de células, alinhamento de texto em japonês/português, foto do candidato anexada e tabelas de histórico profissional.',
      techDetail: 'Biblioteca `exceljs` com template binário pré-formatado, injeção dinâmica de células por coordenadas absolutas e codificação UTF-8.',
      businessImpact: 'A matriz japonesa recebe a planilha exatamente como exige, sem quebrar os processos existentes a jusante.',
      icon: FileSpreadsheet,
      badge: '1 Clique em 0.3s'
    },
    {
      id: 'lgpd-health',
      title: 'Proteção Criptográfica de Saúde (LGPD Art. 11)',
      category: 'Segurança & Compliance',
      shortDesc: 'Criptografia colunar PostgreSQL (pgcrypto) para histórico médico com emissão de audit log a cada acesso.',
      fullDesc: 'Perguntas sensíveis sobre cirurgias, fraturas, dores crônicas e daltonismo são armazenadas criptografadas. O acesso é restrito ao médico do trabalho ou responsável autorizado, registrando nome, horário e IP a cada abertura.',
      techDetail: 'Algoritmo AES-256 via extensão `pgcrypto` nativa do PostgreSQL. Parecer explicável automatizado conforme Artigo 20 da LGPD.',
      businessImpact: 'Protege a empreiteira contra passivos trabalhistas e autuações da ANPD em auditorias de dados sensíveis.',
      icon: ShieldCheck,
      badge: 'LGPD & APPI Japão'
    },
    {
      id: 'epi-biometrics',
      title: 'Biometria de equipamentos de proteção e Mapeamento Corporativo',
      category: 'Logística de Fábrica',
      shortDesc: 'Registro biométrico preciso de calçados de segurança (24.5cm a 28.0cm) e cintura para uniforme de fábrica.',
      fullDesc: 'Mapeamento anatômico de tatuagens em 11 regiões corporais (braços, costas, pescoço), permitindo triagem visual conforme restrições específicas de cada cliente fabril no Japão (Toyota, Suzuki, Subaru).',
      techDetail: 'Validação de intervalo numérico estrito em centímetros (tamanhos JP), com flag de restrição por setor de montagem.',
      businessImpact: 'Elimina devoluções e trocas de equipamentos de proteção na chegada ao Japão, garantindo que o candidato inicie o trabalho no 1º dia.',
      icon: Database,
      badge: 'Zero Trocas de EPI'
    },
    {
      id: 'mobile-stepper',
      title: 'Portal do Candidato Mobile-First com Auto-Save',
      category: 'Experiência do Usuário',
      shortDesc: 'Formulário em 5 micro-etapas otimizado para celulares, com salvamento automático a cada 3 segundos.',
      fullDesc: 'Elimina o abandono de candidatos em formulários longos. Caso o candidato perca a conexão ou feche o navegador, o progresso fica salvo para retomada posterior via link de WhatsApp.',
      techDetail: 'State management persistente em `localStorage` e suporte a auto-save com debounce de 3000ms via Web API.',
      businessImpact: 'Aumenta a taxa de conversão de candidaturas concluídas de 35% para 88%.',
      icon: Smartphone,
      badge: 'Conversão 88%'
    },
    {
      id: 'agency-links',
      title: 'Links Exclusivos por Agência Indicadora (Tenant ID)',
      category: 'Gestão Comercial',
      shortDesc: 'Endereço parametrizado por agência de captação (SP, PR, SC, MS) com atribuição automática de comissão.',
      fullDesc: 'Cada parceiro de indicação no Brasil possui uma URL exclusiva. Todo candidato que se cadastra fica vinculado à agência e ao promotor responsável, gerando relatórios de comissão por embarque.',
      techDetail: 'Roteamento via subdomínio ou query param `tenant_id` persistido na sessão do banco de dados.',
      businessImpact: 'Fim das dúvidas e disputas sobre qual agência indicou cada trabalhador.',
      icon: Zap,
      badge: 'Multitenant'
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
          letterSpacing: '0.08em'
        }}>
          Funcionalidades & Arquitetura de Software
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--ssj-text)', letterSpacing: '-0.03em' }}>
          Matriz de Recursos do SelectSys Jobs V2
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--ssj-faint)', maxWidth: '800px', lineHeight: 1.6 }}>
          Clique em qualquer card abaixo para abrir a especificação técnica detalhada e o impacto de negócio de cada módulo.
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--ssj-text)', marginTop: '4px' }}>
                  {feat.title}
                </h3>
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--ssj-faint)' }}>
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
                <span>Ver Detalhes Técnicos</span>
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
            Comparativo Técnico & Operacional
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--ssj-text)' }}>
            Processo Manual vs SelectSys Jobs V2
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--ssj-surface-2)', borderBottom: '2px solid var(--ssj-rule-3)', color: 'var(--ssj-faint)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Funcionalidade / Recurso</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--ssj-shu)', textAlign: 'center' }}>Processo Manual Tradicional</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--ssj-verde-ink)', textAlign: 'center' }}>SelectSys Jobs V2 (SaaS)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { f: 'Exportação Planilha .XLS Oficial', m: 'NÃO (Digitação Manual no Excel)', s: 'SIM (1 Clique em 0.3s)' },
                { f: 'Leitura Inteligente por IA (OCR/PDF)', m: 'NÃO (Conferência Visual Humana)', s: 'SIM (DeepSeek V3 em 0.9s)' },
                { f: 'Validação Biométrica de equipamentos de proteção (Calçado cm)', m: 'NÃO (Erros Frequentes na Chegada)', s: 'SIM (Formatado em cm)' },
                { f: 'Criptografia de Saúde (LGPD Art. 11)', m: 'NÃO (Papéis/PDFs sem Criptografia)', s: 'SIM (pgcrypto + Audit Log)' },
                { f: 'Atribuição Automática de Agências', m: 'NÃO (Dúvidas em Comissões)', s: 'SIM (Link Exclusivo tenant_id)' },
                { f: 'Tempo Médio de Preenchimento', m: '15 a 20 Dias por Correio/E-mail', s: '7 a 10 Minutos no Celular' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--ssj-rule)' }}>
                  <td style={{ padding: '18px 20px', fontWeight: 700, color: 'var(--ssj-text)' }}>{row.f}</td>
                  <td style={{ padding: '18px 20px', textAlign: 'center', color: 'var(--ssj-shu-2)', backgroundColor: 'var(--ssj-shu-wash-2)', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <XCircle style={{ width: '18px', height: '18px', color: 'var(--ssj-shu-2)' }} />
                      <span>{row.m}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center', color: 'var(--ssj-verde-ink)', backgroundColor: 'var(--ssj-verde-wash)', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <Check style={{ width: '18px', height: '18px', color: 'var(--ssj-verde-ink)' }} />
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
            maxWidth: '650px',
            backgroundColor: 'var(--ssj-surface)',
            borderRadius: '24px',
            padding: '36px',
            boxShadow: 'var(--ssj-shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'relative',
            color: 'var(--ssj-text)'
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
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--ssj-text)', marginTop: '2px' }}>
                  {selectedFeature.title}
                </h3>
              </div>
            </div>

            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--ssj-faint)', fontWeight: 500 }}>
              {selectedFeature.fullDesc}
            </p>

            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'var(--ssj-surface-2)', border: '1px solid var(--ssj-rule)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ssj-muted)', textTransform: 'uppercase' }}>
                  Especificação Técnica
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ssj-text)', marginTop: '4px' }}>
                  {selectedFeature.techDetail}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--ssj-rule)', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ssj-verde)', textTransform: 'uppercase' }}>
                  Impacto de Negócio Direto
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ssj-verde-ink)', marginTop: '4px' }}>
                  {selectedFeature.businessImpact}
                </div>
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
                Fechar Detalhes
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
        <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--ssj-text)' }}>
          Pronto para testar todas as funcionalidades na prática?
        </h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/c/fujiarte" style={{
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: 'var(--ssj-fill-pri)',
            color: 'var(--ssj-on-fill-pri)',
            textDecoration: 'none'
          }}>
            Ver Protótipo B2C ➔
          </Link>
          <Link to="/admin" style={{
            padding: '14px 32px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            backgroundColor: 'var(--ssj-surface-2)',
            color: 'var(--ssj-text)',
            border: '1px solid var(--ssj-rule)',
            textDecoration: 'none'
          }}>
            Ver Case Piloto FUJIARTE
          </Link>
        </div>
      </section>
    </div>
  );
}
