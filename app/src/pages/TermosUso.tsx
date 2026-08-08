import { useState } from 'react';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, Gavel } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../theme/contexto';

export function TermosUso() {
  const { escuro: isDark } = useTheme();
  const [secaoAtiva, setSecaoAtiva] = useState('natureza');

  const textPrimary = isDark ? '#e9ece8' : '#14181f';
  const textSecondary = isDark ? '#8d968f' : '#4a5568';
  const cardBorder = isDark ? '#29313c' : '#e2e8f0';
  const accentPri = '#c4452b';

  return (
    <div className="ssj-doc">
      <div className="ssj-doc__wrap">
        
        {/* Voltar */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: textSecondary, textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Voltar para o Portal Principal
        </Link>

        {/* Cabeçalho Jurídico */}
        <div className="ssj-doc__card">
          {/* Ícone e título empilham no celular em vez de disputar a largura. */}
          <div className="ssj-doc__faixa">
            <div style={{ backgroundColor: 'rgba(196, 69, 43, 0.1)', padding: 'var(--ssj-s3)', borderRadius: 'var(--ssj-r-lg)', color: accentPri, flexShrink: 0 }}>
              <Scale size={36} />
            </div>
            <div style={{ minWidth: 0, flex: '1 1 16rem' }}>
              <h1 className="ssj-doc__titulo">Termos de Uso e Condições de Serviço</h1>
              <p className="ssj-doc__subtitulo">
                Regulamento dos Serviços Tecnológicos da Plataforma SelectSys Jobs (Dekassegui B2B/B2C)
              </p>
            </div>
          </div>

          {/* Os separadores "•" saíram: em uma coluna eles viram lixo visual.
              A grade fluida já separa os itens sozinha. */}
          <div
            className="ssj-doc__meta"
            style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: 'var(--ssj-s5)', marginTop: 'var(--ssj-s5)' }}
          >
            <span><strong>Versão:</strong> 3.1 / 2026</span>
            <span><strong>Gratuidade B2C:</strong> Isenção Total de Taxas para Candidatos</span>
            <span><strong>Foro:</strong> São Paulo / SP - Brasil</span>
          </div>
        </div>

        {/* Garantia de Gratuidade B2C */}
        <div
          className="ssj-doc__faixa"
          style={{ backgroundColor: isDark ? 'rgba(31, 122, 77, 0.15)' : '#f0fff4', border: `1px solid ${isDark ? '#1f7a4d' : '#c6f6d5'}` }}
        >
          <CheckCircle2 size={24} color="#38a169" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ minWidth: 0, flex: '1 1 16rem' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: isDark ? '#68d391' : '#276749' }}>
              Plataforma 100% Gratuita para Candidatos e Trabalhadores Dekassegui
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: textSecondary, lineHeight: 1.6 }}>
              A SelectSys Jobs atua estritamente como intermediadora tecnológica. <strong>NUNCA</strong> cobraremos qualquer valor ou taxa dos candidatos para cadastro de currículo, submissão de fichas, agendamento de entrevistas ou utilização do assistente virtual. Toda a receita da plataforma advém de assinaturas empresariais B2B das Agências e Empreiteiras contratantes.
            </p>
          </div>
        </div>

        {/* Navegação de Seções */}
        <div className="ssj-doc__grid">

          {/* Índice de Seções */}
          <nav className="ssj-doc__indice" aria-label="Seções dos termos">
            {[
              { id: 'natureza', label: '1. Natureza do Serviço' },
              { id: 'gratuidade', label: '2. Gratuidade B2C' },
              { id: 'veracidade', label: '3. Veracidade dos Dados' },
              { id: 'visto_coe', label: '4. Emissão de Vistos (COE)' },
              { id: 'propriedade', label: '5. Propriedade Intelectual' },
              { id: 'responsabilidade', label: '6. Limitação de Responsabilidade' },
              { id: 'rescisao', label: '7. Cancelamento e Exclusão' },
              { id: 'foro', label: '8. Foro e Legislação' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSecaoAtiva(item.id)}
                className="ssj-doc__indice-item"
                /* `aria-current` carrega o estado ativo: o CSS pinta a partir
                   dele, e o leitor de tela anuncia qual seção está aberta. */
                aria-current={secaoAtiva === item.id}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Conteúdo Detalhado */}
          <div className="ssj-doc__card ssj-doc__corpo">
            
            {secaoAtiva === 'natureza' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  1. Natureza dos Serviços Prestados
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  A <strong>SelectSys Jobs</strong> é uma solução tecnológica SaaS de recrutamento e triagem especializada no mercado Dekassegui (trabalho no Japão para residentes no Brasil).
                </p>
                <p style={{ color: textSecondary }}>
                  A plataforma disponibiliza infraestrutura para preenchimento de formulários inteligentes, extração de dados via Inteligência Artificial, triagem automatizada de elegibilidade de visto, exportação de planilhas cadastrais e integração com sistemas corporativos da matriz japonesa.
                </p>
              </section>
            )}

            {secaoAtiva === 'gratuidade' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  2. Gratuidade Absoluta para o Candidato
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  É expressamente vedada qualquer cobrança financeira dirigida ao candidato pela utilização da plataforma SelectSys Jobs.
                </p>
                <div style={{ backgroundColor: isDark ? '#1c222c' : '#f7fafc', border: `1px solid ${cardBorder}`, borderRadius: '12px', padding: '20px' }}>
                  <p style={{ margin: 0, color: textSecondary, fontSize: '14px' }}>
                    Caso qualquer terceiro ou agência indevidamente exija pagamentos em nome da SelectSys Jobs para disponibilizar vagas ou acelerar o preenchimento de fichas, a ocorrência deve ser reportada imediatamente ao nosso suporte anticorrupção.
                  </p>
                </div>
              </section>
            )}

            {secaoAtiva === 'veracidade' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  3. Veracidade das Informações e Declarações do Usuário
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Ao submeter sua candidatura, o usuário declara e garante sob as penas da lei que todas as informações prestadas são autênticas, completas e exatas.
                </p>
                <div style={{ backgroundColor: isDark ? '#2b1717' : '#fff5f5', border: `1px solid ${isDark ? '#5a1d1d' : '#fed7d7'}`, borderRadius: '12px', padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <AlertTriangle size={24} color="#e53e3e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#e53e3e' }}>
                      Responsabilidade Civil e Criminal por Falsidade Ideológica
                    </h4>
                    <p style={{ margin: 0, fontSize: '14px', color: textSecondary, lineHeight: 1.6 }}>
                      A falsificação ou adulteração de dados pessoais, históricos de trabalho, passaportes, certidões (Koseki) ou omissão de restrições legais constitui crime de falsidade ideológica (Art. 299 do Código Penal Brasileiro e legislação de imigração do Japão), sujeitando o infrator ao cancelamento imediato da candidatura e notificação às autoridades policiais de ambos os países.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {secaoAtiva === 'visto_coe' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  4. Decisão de Contratação e Emissão de Vistos (COE)
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  A SelectSys Jobs atua exclusivamente como provedora de ferramentas de automação e organização documental.
                </p>
                <p style={{ color: textSecondary, lineHeight: 1.8 }}>
                  A decisão final sobre aprovação no processo seletivo, contratação, oferta salarial e a concessão do <strong>Certificado de Elegibilidade (COE - Certificate of Eligibility)</strong> e visto de trabalho (定住者 / Specific Skilled Worker) cabe exclusivamente às diretoria das empreiteiras parceiras e ao <strong>Departamento de Imigração do Governo do Japão (Nyukan)</strong>. O uso da plataforma não garante a aprovação de visto ou contratação.
                </p>
              </section>
            )}

            {secaoAtiva === 'propriedade' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  5. Propriedade Intelectual e Uso Autorizado
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Todos os direitos de propriedade intelectual sobre o software SelectSys Jobs — incluindo código-fonte, esquemas de banco de dados, marcas, layouts de formulários, conectores Garoon e algoritmos de triagem — são de propriedade exclusiva da SelectSys Jobs Tecnologia.
                </p>
                <p style={{ color: textSecondary }}>
                  É vedado copiar, modificar, fazer engenharia reversa, descompilar ou tentar extrair o código-fonte da aplicação sem autorização prévia por escrito.
                </p>
              </section>
            )}

            {secaoAtiva === 'responsabilidade' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  6. Limitação de Responsabilidade Operacional
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  A SelectSys Jobs emprega os mais elevados padrões de segurança da informação e alta disponibilidade. No entanto, não se responsabiliza por:
                </p>
                <ul style={{ color: textSecondary, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li>Inconsistências em dados fornecidos diretamente pelos candidatos ou recrutadores das agências;</li>
                  <li>Atrasos ou indeferimentos decorrentes de decisões soberanas do Consulado do Japão ou órgãos de imigração;</li>
                  <li>Interrupções temporárias de serviços decorrentes de manutenção programada ou instabilidades de infraestrutura de telecomunicações de terceiros.</li>
                </ul>
              </section>
            )}

            {secaoAtiva === 'rescisao' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  7. Cancelamento de Cadastro e Exclusão de Dados
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  O candidato pode solicitar a exclusão de seu cadastro e eliminação de seus dados pessoais a qualquer tempo, ressalvadas as hipóteses de guarda obrigatória estabelecidas na legislação aplicável.
                </p>
                <p style={{ color: textSecondary }}>
                  As agências contratantes podem suspender a exibição de suas vagas ou encerrar o contrato SaaS mediante cumprimento das cláusulas contratuais firmadas no plano corporativo.
                </p>
              </section>
            )}

            {secaoAtiva === 'foro' && (
              <section>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: textPrimary, marginTop: 0, marginBottom: '16px' }}>
                  8. Foro de Eleição e Legislação Aplicável
                </h3>
                <p style={{ color: textSecondary, marginBottom: '16px' }}>
                  Estes Termos de Uso são regidos e interpretados de acordo com as leis da República Federativa do Brasil, em consonância com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014).
                </p>
                <div style={{ backgroundColor: isDark ? '#1c222c' : '#f7fafc', border: `1px solid ${cardBorder}`, borderRadius: '16px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <Gavel size={28} color={accentPri} style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700 }}>Foro Central da Comarca de São Paulo / SP</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: textSecondary }}>
                      Fica eleito o Foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer controvérsias decorrentes destes Termos de Uso, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
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
