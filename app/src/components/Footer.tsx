import { Shield } from 'lucide-react';
import { BrandLockup } from '../brand/BrandMark';
import { Link } from 'react-router-dom';

/* Rodapé padrão: marca, missão e conformidade. A missão fecha toda página. */

export function Footer() {

  return (
    <footer className="ssj-rodape">
      <div className="ssj-container">
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: 'clamp(28px, 6vw, 48px)', marginBottom: 'clamp(32px, 7vw, 64px)' }}>
          
          {/* Coluna 1: Marca e Missão */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <BrandLockup size={38} withTagline={false} />
            <p style={{ color: '#a9b4c9', fontSize: '14px', lineHeight: 1.7, maxWidth: '300px' }}>
              Digitalizamos o recrutamento de dekasseguis, unindo tecnologia de ponta brasileira com a precisão exigida pelo mercado japonês.
            </p>
          </div>

          {/* Coluna 2: Plataforma */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className="ssj-rodape__titulo">Plataforma</h4>
            <Link to="/vagas" className="ssj-rodape__link">Vagas no Japão</Link>
            <Link to="/candidato" className="ssj-rodape__link">Portal do Candidato</Link>
            <Link to="/login" className="ssj-rodape__link">Acesso Agências B2B</Link>
          </div>

          {/* Coluna 3: Institucional */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className="ssj-rodape__titulo">Institucional</h4>
            <Link to="/termos" className="ssj-rodape__link">Termos de Uso</Link>
            <Link to="/privacidade" className="ssj-rodape__link">Política de Privacidade</Link>
          </div>

          {/* Coluna 4: Conformidade */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 className="ssj-rodape__titulo">Conformidade</h4>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: '#a9b4c9' }}>
              <Shield size={18} style={{ color: '#4fc287', flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                Aderência total à LGPD (Brasil) e APPI (Japão). Dados sensíveis protegidos por criptografia AES-256 no banco de dados.
              </p>
            </div>
          </div>
          
        </div>

        {/* Rodapé Inferior */}
        <div style={{ 
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', 
          borderTop: '1px solid #1c2331', paddingTop: '24px', color: '#6a7d9e', fontSize: '13px', gap: '16px'
        }}>
          <div>
            &copy; {new Date().getFullYear()} SelectSys Jobs. Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <span>SaaS Dekassegui</span>
            <span>Made in Brazil ➔ Japan</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
