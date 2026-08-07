import { useState } from 'react';
import {
  FileSpreadsheet, ShieldCheck, Cpu,
  Download, CheckCircle2, DollarSign, Calendar, Globe
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Language } from '../translations';

export function PlanoAcaoView({ lang }: { lang: Language }) {
  console.log('Language active:', lang);

  const [downloadedPdf, setDownloadedPdf] = useState<boolean>(false);

  const handleSimulatePdfDownload = () => {
    setDownloadedPdf(true);
    setTimeout(() => { setDownloadedPdf(false); }, 4000);
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f4f5f2',
      color: '#14181f',
      fontFamily: 'var(--ssj-font-sans)',
      padding: '48px 32px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '56px'
    }}>

      {/* HERO */}
      <section style={{
        width: '100%', maxWidth: '1200px', margin: '0 auto',
        backgroundColor: '#14181f', color: '#ffffff', borderRadius: '24px',
        padding: '56px 48px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center', gap: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '8px 20px', borderRadius: '30px', backgroundColor: '#294b86',
          border: '1px solid #7ba4de', color: '#ffffff', fontSize: '12px',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          <span>PROPOSTA COMERCIAL &amp; PLANO DE IMPLANTAÇÃO HOMOLOGADO</span>
        </div>

        <h1 style={{
          fontSize: '3.2rem', fontWeight: 700, lineHeight: 1.15,
          letterSpacing: '-0.03em', maxWidth: '960px', color: '#ffffff'
        }}>
          Plano Master de Transformação Digital <span style={{ color: '#e8785d' }}>SelectSys Jobs</span>
        </h1>

        <p style={{
          fontSize: '1.15rem', lineHeight: 1.6, maxWidth: '840px',
          color: '#8d968f', fontWeight: 500
        }}>
          Documento executivo comercial para validação da diretoria no Japão referente à automação
          multitenant do fluxo de vistos e recrutamento Dekassegui — <strong style={{ color: '#ffffff' }}>FUJIARTE Co., Ltd.</strong>
        </p>

        <div style={{ paddingTop: '8px' }}>
          <button
            onClick={handleSimulatePdfDownload}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '16px 36px', borderRadius: '12px', fontSize: '15px',
              fontWeight: 700, backgroundColor: '#c4452b', color: '#ffffff',
              border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(196,69,43,0.4)'
            }}
          >
            <Download style={{ width: '18px', height: '18px' }} />
            <span>Baixar Proposta Comercial em PDF (Para Assinatura)</span>
          </button>
        </div>

        {downloadedPdf && (
          <div style={{
            padding: '12px 24px', borderRadius: '10px', backgroundColor: '#e2f0e9',
            border: '1px solid #1f7a4d', color: '#1f7a4d', fontSize: '13px',
            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', color: '#1f7a4d' }} />
            <span>Proposta Comercial PDF gerada e pronta para download executivo!</span>
          </div>
        )}
      </section>

      {/* OS 4 PILARES */}
      <section style={{
        width: '100%', maxWidth: '1200px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: '32px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#14181f' }}>
            Os 4 Pilares da Plataforma SelectSys Jobs
          </h2>
          <p style={{ fontSize: '15px', color: '#7a827f', maxWidth: '700px', margin: '0 auto' }}>
            Infraestrutura de tecnologia desenhada exclusivamente para as regras operacionais entre Brasil e Japão.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', width: '100%' }}>
          {[
            {
              icon: <FileSpreadsheet style={{ width: '24px', height: '24px' }} />,
              bg: '#e4eaf4', fg: '#294b86',
              title: '1. Exportador .XLS Fiel',
              desc: 'Ficha cadastral digitalizada (~130 campos) gerando arquivos .xls exatamente no formato oficial de cada empreiteira parceira (ex: modelo FUJIARTE).'
            },
            {
              icon: <Cpu style={{ width: '24px', height: '24px' }} />,
              bg: '#f7e6e2', fg: '#c4452b',
              title: '2. Visão Computacional por IA',
              desc: 'DeepSeek V3 integrando OCR inteligente com custo de $0.14 por 1M tokens (95% de economia OpEx em relação a modelos legados).'
            },
            {
              icon: <ShieldCheck style={{ width: '24px', height: '24px' }} />,
              bg: '#e2f0e9', fg: '#1f7a4d',
              title: '3. Compliance LGPD & APPI',
              desc: 'Criptografia colunar de dados sensíveis de saúde (pgcrypto PostgreSQL) e parecer explicável automatizado para o Artigo 20 da LGPD.'
            },
            {
              icon: <Globe style={{ width: '24px', height: '24px' }} />,
              bg: '#e4eaf4', fg: '#294b86',
              title: '4. Painel de Gestão Multitenant',
              desc: 'Visualização executiva para acompanhar o funil de 11 etapas de recrutamento, emissão de vistos COE e gestão de agências indicadoras no Brasil.'
            }
          ].map((p, i) => (
            <div key={i} style={{
              padding: '32px', borderRadius: '20px', backgroundColor: '#ffffff',
              border: '1px solid #e0e2dc', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column', gap: '16px'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: p.bg, color: p.fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#14181f' }}>{p.title}</h3>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#7a827f' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORMULÁRIO REAL — LINK DIRETO PARA O CLIENTE VER */}
      <section style={{
        width: '100%', maxWidth: '1200px', margin: '0 auto',
        padding: '40px', borderRadius: '24px', backgroundColor: '#eef2fb',
        border: '2px solid #294b86', display: 'flex', flexDirection: 'column',
        gap: '20px', alignItems: 'center', textAlign: 'center'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#294b86', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Demonstração ao Vivo — Formulário Real FUJIARTE
        </span>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#14181f' }}>
          Veja como o candidato preenche a Ficha Cadastral
        </h2>
        <p style={{ fontSize: '15px', color: '#7a827f', maxWidth: '680px', lineHeight: 1.6 }}>
          Clique abaixo para abrir o formulário real de cadastro, gerado a partir da planilha oficial
          <strong> 白紙 FUJIARTE Ficha Cadastral (Jun2024)</strong>. É exatamente o que o candidato vê no celular.
        </p>
        <Link to="/c/fujiarte" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '18px 40px', borderRadius: '14px', fontSize: '16px',
          fontWeight: 700, backgroundColor: '#294b86', color: '#ffffff',
          textDecoration: 'none', boxShadow: '0 8px 24px rgba(41,75,134,0.35)'
        }}>
          Abrir Formulário FUJIARTE (Visão Candidato) →
        </Link>
      </section>

      {/* ROADMAP */}
      <section style={{
        width: '100%', maxWidth: '1200px', margin: '0 auto',
        padding: '40px', borderRadius: '24px', backgroundColor: '#ffffff',
        border: '1px solid #e0e2dc', boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar style={{ width: '28px', height: '28px', color: '#294b86' }} />
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#294b86', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Cronograma de Go-to-Market
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#14181f', marginTop: '2px' }}>
              Roadmap de Entrega (4 Semanas)
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { sem: 'Semana 1', title: 'Apresentação & Homologação MVP', desc: 'Validação da Ficha Cadastral com a diretoria do Japão e lote piloto de 50 candidatos.', status: 'CONCLUÍDO' },
            { sem: 'Semana 2', title: 'Integração Multitenant & Agências Brasil', desc: 'Ativação dos subdomínios e links exclusivos por agência de captação (SP, PR, SC, MS).', status: 'EM ANDAMENTO' },
            { sem: 'Semana 3', title: 'Automatização do Visto COE & Imigração', desc: 'Integração do acompanhamento do Certificado de Elegibilidade com alertas via WhatsApp.', status: 'PLANEJADO' },
            { sem: 'Semana 4', title: 'Lançamento Comercial Enterprise', desc: 'Rollout global para 100% dos embarques e contratações do grupo.', status: 'PLANEJADO' }
          ].map((s, idx) => (
            <div key={idx} style={{
              padding: '24px', borderRadius: '16px', backgroundColor: '#f7f8f5',
              border: '1px solid #e0e2dc', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ padding: '8px 16px', borderRadius: '10px', backgroundColor: '#294b86', color: '#ffffff', fontWeight: 700, fontSize: '14px' }}>
                  {s.sem}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#14181f' }}>{s.title}</h3>
                  <p style={{ fontSize: '13px', color: '#7a827f', marginTop: '2px' }}>{s.desc}</p>
                </div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '6px 14px', borderRadius: '12px',
                backgroundColor: s.status === 'CONCLUÍDO' ? '#e2f0e9' : s.status === 'EM ANDAMENTO' ? '#f7e6e2' : '#ffffff',
                color: s.status === 'CONCLUÍDO' ? '#1f7a4d' : s.status === 'EM ANDAMENTO' ? '#c4452b' : '#7a827f',
                border: `1px solid ${s.status === 'CONCLUÍDO' ? '#1f7a4d' : s.status === 'EM ANDAMENTO' ? '#c4452b' : '#e0e2dc'}`
              }}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* MODELO FINANCEIRO */}
      <section style={{
        width: '100%', maxWidth: '1200px', margin: '0 auto',
        padding: '40px', borderRadius: '24px', backgroundColor: '#ffffff',
        border: '1px solid #e0e2dc', boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', gap: '32px'
      }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '6px', backgroundColor: '#e4eaf4', color: '#294b86', fontSize: '12px', fontWeight: 700, margin: '0 auto' }}>
            <DollarSign style={{ width: '16px', height: '16px' }} />
            MODELO FINANCEIRO MULTITENANT
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#14181f' }}>Estrutura Comercial SaaS</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {[
            { label: 'Licença Empreiteira (Enterprise)', color: '#294b86', value: 'Mensal Fixa', desc: 'Acesso ilimitado ao Painel de gestão, exportador oficial de planilhas .xls, gestão de vistos COE e suporte com SLA de 2 horas.' },
            { label: 'Leitura por IA (Pass-Through)', color: '#c4452b', value: '$0.14 / 1M Tokens', desc: 'Repasse a preço de custo do motor DeepSeek V3 para extração de OCR de documentos de candidatos.' },
            { label: 'Agências Indicadoras (Brasil)', color: '#1f7a4d', value: '100% Gratuito', desc: 'Sem custo de licença para agências parceiras no Brasil utilizarem os links parametrizados de indicação.' }
          ].map((item, i) => (
            <div key={i} style={{ padding: '32px', borderRadius: '20px', backgroundColor: '#f7f8f5', border: '1px solid #e0e2dc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: item.color, textTransform: 'uppercase' }}>{item.label}</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#14181f' }}>{item.value}</div>
              <p style={{ fontSize: '13px', color: '#7a827f', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{
        width: '100%', maxWidth: '1200px', margin: '0 auto',
        backgroundColor: '#14181f', color: '#ffffff', borderRadius: '24px',
        padding: '56px 40px', textAlign: 'center', display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#e4eaf4', backgroundColor: '#294b86', padding: '6px 16px', borderRadius: '20px' }}>
          FUJIARTE Co., Ltd. · Homologação Técnica
        </span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
          Pronto para transformar o fluxo Dekassegui?
        </h2>
        <p style={{ fontSize: '15px', color: '#8d968f', maxWidth: '650px', lineHeight: 1.6 }}>
          Acesse o formulário ao vivo ou entre em contato para agendar a demonstração executiva para a diretoria no Japão.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/c/fujiarte" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '16px 36px', borderRadius: '12px', fontSize: '15px',
            fontWeight: 700, backgroundColor: '#c4452b', color: '#ffffff',
            textDecoration: 'none', boxShadow: '0 6px 20px rgba(196,69,43,0.4)'
          }}>
            Abrir Formulário FUJIARTE →
          </Link>
          <Link to="/fujiarte" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '16px 36px', borderRadius: '12px', fontSize: '15px',
            fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#ffffff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Ver Case Técnico FUJIARTE
          </Link>
        </div>
      </section>
    </div>
  );
}
