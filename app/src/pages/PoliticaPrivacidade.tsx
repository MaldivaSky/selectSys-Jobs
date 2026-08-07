import { useState } from 'react';
import { ArrowLeft, ShieldCheck, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/theme';

export function PoliticaPrivacidade() {
  const { escuro: isDark } = useTheme();
  const [secaoAtiva, setSecaoAtiva] = useState('geral');

  const pageBg = isDark ? '#0d1016' : '#f8f9fa';
  const cardBg = isDark ? '#161b24' : '#ffffff';
  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#4a5568';
  const cardBorder = isDark ? '#29313c' : '#e2e8f0';
  const accentPri = '#c4452b';
  const accentBlue = '#294b86';

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: pageBg, color: textPrimary, padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* Voltar */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Voltar para o Portal Principal
        </Link>

        {/* Cabeçalho Jurídico */}
        <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '24px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: 'rgba(196, 69, 43, 0.1)', padding: '12px', borderRadius: '16px', color: accentPri }}>
              <ShieldCheck size={36} />
            </div>
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                Política de Privacidade & Proteção de Dados
              </h1>
              <p style={{ color: textSecondary, fontSize: '14px', margin: '4px 0 0 0' }}>
                Conformidade integral com a LGPD (Lei nº 13.709/2018 - Brasil) e APPI (Act on the Protection of Personal Information - Japão)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', borderTop: `1px solid ${cardBorder}`, paddingTop: '20px', marginTop: '20px', fontSize: '13px', color: textSecondary, flexWrap: 'wrap' }}>
            <span><strong>Versão:</strong> 2.4 / 2026</span>
            <span>•</span>
            <span><strong>Vigência:</strong> Em vigor desde 01/01/2026</span>
            <span>•</span>
            <span><strong>Controladoras:</strong> Agências e Empreiteiras Parceiras</span>
            <span>•</span>
            <span><strong>Operador SaaS:</strong> SelectSys Jobs Tecnologia</span>
          </div>
        </div>

        {/* Alerta de Criptografia & LGPD Art. 11 */}
        <div style={{ backgroundColor: isDark ? 'rgba(41, 75, 134, 0.15)' : '#ebf8ff', border: `1px solid ${isDark ? '#294b86' : '#bee3f8'}`, borderRadius: '16px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <Lock size={24} color="#3182ce" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: isDark ? '#90cdf4' : '#2b6cb0' }}>
              Tratamento Rigoroso de Dados Sensíveis (Art. 5º, II e Art. 11 da LGPD)
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: textSecondary, lineHeight: 1.6 }}>
              Os dados de <strong>ascendência Nikkei</strong> (utilizados para comprovação de visto) e os dados de <strong>saúde e biometria de EPIs</strong> (perguntas 16 a 31 da Ficha Cadastral) são classificados como dados pessoais sensíveis. Eles são armazenados com criptografia de ponta a ponta (AES-256 via extensão <code style={{ fontFamily: 'monospace' }}>pgcrypto</code>) com controle de acesso auditado por perfil.
            </p>
          </div>
        </div>

        {/* Navegação de Seções */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Índice de Seções */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', position: 'sticky', top: '20px' }}>
            {[
              { id: 'geral', label: '1. Agentes e Escopo' },
              { id: 'coleta', label: '2. Dados Coletados' },
              { id: 'sensivis', label: '3. Dados Sensíveis (Etnia e Saúde)' },
              { id: 'base_legal', label: '4. Bases Legais e Finalidade' },
              { id: 'triagem', label: '5. Triagem Automatizada (Art. 20)' },
              { id: 'internacional', label: '6. Transferência Brasil → Japão' },
              { id: 'direitos', label: '7. Direitos do Titular' },
              { id: 'seguranca', label: '8. Segurança e Retenção' },
              { id: 'dpo', label: '9. Contato do Encarregado (DPO)' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSecaoAtiva(item.id)}
                style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: 'none',
                  backgroundColor: secaoAtiva === item.id ? (isDark ? '#29313c' : '#edf2f7') : 'transparent',
                  color: secaoAtiva === item.id ? accentPri : textPrimary,
                  fontWeight: secaoAtiva === item.id ? 700 : 500, fontSize: '13.5px', cursor: 'pointer'
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Conteúdo Detalhado */}
          <div style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}`, borderRadius: '20px', padding: '40px', lineHeight: 1.8, fontSize: '15px' }}>
            
            {secaoAtiva === 'geral' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  1. Agentes de Tratamento e Escopo de Atuação
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  A presente Política de Privacidade regula o tratamento de dados pessoais realizado através da plataforma SaaS <strong>SelectSys Jobs</strong>, disponível nos domínios institucionais e em portais white-label parametrizados por agências parceiras.
                </p>
                <ul style={{ color: textSecondary, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><strong>Controladoras dos Dados Pessoais:</strong> As Agências de Recrutamento e Empreiteiras parceiras (ex: FUJIARTE Co., Ltd. e filiais), responsáveis pelas decisões referentes ao tratamento dos dados dos candidatos e emissão de propostas de trabalho.</li>
                  <li><strong>Operador do Sistema SaaS:</strong> A SelectSys Jobs Tecnologia, que fornece a infraestrutura tecnológica, inteligência de triagem, processamento seguro e módulos de sincronização.</li>
                </ul>
              </section>
            )}

            {secaoAtiva === 'coleta' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  2. Dados Pessoais Coletados
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Para viabilizar o processo de seleção internacional e a concessão do visto de residente temporário/permanente no Japão, são coletados os seguintes dados pessoais:
                </p>
                <ul style={{ color: textSecondary, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li><strong>Dados de Identificação:</strong> Nome completo, data de nascimento, sexo, estado civil, nacionalidade, foto recente e assinatura.</li>
                  <li><strong>Documentos Oficiais:</strong> CPF, RG (e órgão emissor), Passaporte (número e validade), Visto e Autorização de Reentrada (Reentry).</li>
                  <li><strong>Contatos e Localização:</strong> Endereço residencial, CEP (com preenchimento automático via ViaCEP), e-mail, telefone celular, telefone fixo e contatos de emergência no Brasil e no Japão.</li>
                  <li><strong>Biometria para Uniformes (EPIs):</strong> Altura (cm), peso (kg), cintura (cm) e tamanho de calçado de segurança (cm) para encomendas fabris nas províncias japonesas.</li>
                  <li><strong>Histórico Profissional e Acadêmico:</strong> Escolaridade, cursos técnicos, graduações, até 4 registros de histórico de trabalho no Japão e 2 no Brasil.</li>
                </ul>
              </section>
            )}

            {secaoAtiva === 'sensivis' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  3. Tratamento de Dados Pessoais Sensíveis (Etnia e Saúde)
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Em estrita conformidade com os artigos 5º, II e 11 da LGPD, a plataforma trata duas categorias de dados sensíveis mediante consentimento específico, destacado e revogável:
                </p>
                <div style={{ backgroundColor: isDark ? '#1c222c' : '#f7fafc', border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: accentPri }}>
                    A) Ascendência Nikkei e Documentos Familiares (Koseki Tohon)
                  </h4>
                  <p style={{ margin: 0, color: textSecondary, fontSize: '14px' }}>
                    A informação sobre a geração Nikkei (Issei, Nissei, Sansei, Yonsei) e a certidão de registro familiar japonês (戸籍謄本) constitui dado referente à origem étnica. Sua coleta possui finalidade legítima e indispensável para a comprovação de elegibilidade perante a Imigração Japonesa (Nyukan / 出入国在留管理庁).
                  </p>
                </div>
                <div style={{ backgroundColor: isDark ? '#1c222c' : '#f7fafc', border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 700, color: accentBlue }}>
                    B) Enquete de Saúde, Acidentes e Tatuagens (Perguntas 16 a 31)
                  </h4>
                  <p style={{ margin: 0, color: textSecondary, fontSize: '14px' }}>
                    Informações sobre acuidade visual, daltonismo, dores crônicas, intervenções cirúrgicas, tratamentos contínuos e tatuagens são tratadas com a finalidade exclusiva de medicina do trabalho e adequação ergonômica da função no ambiente fabril. Estes dados não são expostos em listagens públicas e dependem de permissão auditada para visualização.
                  </p>
                </div>
              </section>
            )}

            {secaoAtiva === 'base_legal' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  4. Hipóteses Legais de Tratamento (Art. 7º e 11 da LGPD)
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  O processamento dos seus dados na SelectSys Jobs fundamenta-se nas seguintes hipóteses legais previstas pela LGPD:
                </p>
                <ol style={{ color: textSecondary, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li><strong>Consentimento do Titular (Art. 7º, I e Art. 11, I):</strong> Manifestação livre, informada e inequívoca para o envio da ficha cadastral e processamento do bloco de saúde.</li>
                  <li><strong>Procedimentos Preliminares Relacionados a Contrato (Art. 7º, V):</strong> Execução de medidas a pedido do titular necessárias para a formalização do contrato de trabalho com a empreiteira no Japão.</li>
                  <li><strong>Cumprimento de Obrigação Legal ou Regulatória (Art. 7º, II):</strong> Atendimento às exibições documentais exigidas pelas autoridades de imigração e trabalho do Governo do Japão.</li>
                </ol>
              </section>
            )}

            {secaoAtiva === 'triagem' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  5. Transparência na Triagem Automatizada (Art. 20 da LGPD)
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  O sistema SelectSys Jobs conta com um motor de triagem automatizado que avalia regras de elegibilidade operacional pré-definidas pelas agências (ex: limite de idade sem passagem prévia na empresa, verificação de descendência e alerta de tatuagem).
                </p>
                <div style={{ backgroundColor: isDark ? '#1c222c' : '#edf2f7', borderRadius: '12px', padding: '20px', borderLeft: `4px solid ${accentPri}` }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 700 }}>Direito à Explicação e Revisão Humana</h4>
                  <p style={{ margin: 0, fontSize: '14px', color: textSecondary }}>
                    Em cumprimento ao Art. 20 da LGPD, o candidato tem o direito de obter a explicação clara dos critérios que motivaram qualquer parecer de triagem automatizada, bem como solicitar a revisão da decisão por uma pessoa natural (recrutador humano da agência).
                  </p>
                </div>
              </section>
            )}

            {secaoAtiva === 'internacional' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  6. Transferência Internacional de Dados (Brasil → Japão)
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Devido à natureza da prestação de serviços Dekassegui, seus dados serão transferidos internacionalmente do Brasil para o Japão.
                </p>
                <p style={{ color: textSecondary, lineHeight: 1.8 }}>
                  Essa transferência opera respaldada no <strong>Art. 33, VIII da LGPD</strong> (necessária para a execução de contrato de trabalho a pedido do titular) e cumpre os requisitos da lei de privacidade japonesa <strong>APPI (Act on the Protection of Personal Information)</strong>. A transmissão para o sistema Cybozu Garoon da matriz japonesa ocorre sob criptografia TLS 1.3 com controle de acesso corporativo.
                </p>
              </section>
            )}

            {secaoAtiva === 'direitos' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  7. Direitos dos Titulares de Dados (Art. 18 da LGPD)
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Na qualidade de titular dos dados pessoais, você pode exercer os seguintes direitos a qualquer momento:
                </p>
                <ul style={{ color: textSecondary, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Confirmar a existência de tratamento dos seus dados;</li>
                  <li>Acessar e obter cópia integral dos dados cadastrados;</li>
                  <li>Solicitar a correção de dados incompletos, inexatos ou desatualizados;</li>
                  <li>Requerer a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos;</li>
                  <li>Solicitar a revogação do consentimento concedido anteriormente;</li>
                  <li>Solicitar a portabilidade dos dados para outro fornecedor de serviço.</li>
                </ul>
              </section>
            )}

            {secaoAtiva === 'seguranca' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  8. Medidas de Segurança e Prazo de Retenção
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Adotamos medidas técnicas e administrativas rigorosas para proteger seus dados contra acessos não autorizados, vazamentos ou alterações ilícitas:
                </p>
                <ul style={{ color: textSecondary, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <li>Criptografia de dados sensíveis de saúde em repouso via PostgreSQL <code style={{ fontFamily: 'monospace' }}>pgcrypto</code> (AES-256);</li>
                  <li>Comunicação 100% criptografada em trânsito com protocolo HTTPS / TLS 1.3;</li>
                  <li>Registros append-only de auditoria (<code style={{ fontFamily: 'monospace' }}>audit_log</code>) para cada visualização de dados sensíveis;</li>
                  <li>Retenção dos dados pelo período padrão de 24 meses após a última interação, seguido de expurgo automatizado seguro.</li>
                </ul>
              </section>
            )}

            {secaoAtiva === 'dpo' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  9. Encarregado pelo Tratamento de Dados (DPO) e Contato
                </h3>
                <p style={{ color: textSecondary, marginBottom: '20px' }}>
                  Para exercer seus direitos de titular, solicitar esclarecimentos sobre o tratamento dos seus dados ou enviar requerimentos ao Encarregado de Proteção de Dados (DPO), utilize o canal oficial:
                </p>
                
                <div style={{ backgroundColor: isDark ? '#1c222c' : '#f7fafc', border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'rgba(196, 69, 43, 0.1)', padding: '12px', borderRadius: '12px', color: accentPri }}>
                    <Mail size={28} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Canal Oficial do Encarregado (DPO)</h4>
                    <span style={{ fontSize: '15px', color: accentPri, fontWeight: 700 }}>dpo@selectsys.jobs</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: textSecondary }}>
                      Atendimento exclusivo a requisições de privacidade LGPD/APPI. Prazo de resposta: até 15 dias úteis conforme Art. 19 da LGPD.
                    </p>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
