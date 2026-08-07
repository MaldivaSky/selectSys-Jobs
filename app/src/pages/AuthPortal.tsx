import { useState } from 'react';
import { Mail, ArrowRight, Shield, CheckCircle2, Smartphone, Lock, UserCheck } from 'lucide-react';
import { BrandLockup } from '../brand/BrandMark';
import { Hanko } from '../brand/Hanko';
import { GloboTravessia } from '../brand/GloboTravessia';
import { supabase } from '../dados/supabase';

export function AuthPortal() {
  const [tab, setTab] = useState<'candidato' | 'staff'>('candidato');
  const [identificador, setIdentificador] = useState('');
  const [password, setPassword] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  // Removed mode state

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificador) return;

    if (supabase) {
      const isPhone = !identificador.includes('@') && /[0-9]{8,}/.test(identificador);

      let error;
      if (isPhone) {
        let phone = identificador.replace(/\D/g, '');
        if (phone.length === 10 || phone.length === 11) phone = `+55${phone}`;
        else if (!phone.startsWith('+')) phone = `+${phone}`;
        
        const res = await supabase.auth.signInWithOtp({ phone });
        error = res.error;
      } else {
        const res = await supabase.auth.signInWithOtp({
          email: identificador,
          options: { emailRedirectTo: `${window.location.origin}/candidato` }
        });
        error = res.error;
      }

      if (error) {
        alert(`Erro ao enviar código para ${isPhone ? 'WhatsApp' : 'E-mail'}: ` + error.message);
        return;
      }

      if (isPhone) {
        setOtpSent(true);
      } else {
        setMagicSent(true);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !otpCode) return;

    let phone = identificador.replace(/\D/g, '');
    if (phone.length === 10 || phone.length === 11) phone = `+55${phone}`;
    else if (!phone.startsWith('+')) phone = `+${phone}`;

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otpCode,
      type: 'sms'
    });

    if (error) {
      alert('Código inválido: ' + error.message);
      return;
    }
    window.location.href = '/candidato';
  };

  const handleGoogleOAuth = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/candidato`
        }
      });
    } else {
      alert('Banco de dados não configurado (Supabase nulo).');
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      alert('Erro: Banco de dados não configurado (Supabase nulo).');
      return;
    }

    // Autenticação real exigindo senha
    const { error } = await supabase.auth.signInWithPassword({
      email: identificador,
      password,
    });

    if (error) {
      alert('Credenciais inválidas: ' + error.message);
      return;
    }

    // Se o login for bem-sucedido, redireciona para o painel de gestão
    window.location.href = '/admin';
  };

  return (
    <div className="ssj-section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ssj-container" style={{ maxWidth: '480px' }}>
        
        {/* Header da Marca com Globo da Travessia Integrado */}
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ marginBottom: '8px', cursor: 'pointer' }} title="Clique para reproduzir a travessia São Paulo → Nagoya">
            <GloboTravessia size={180} comRotulos={false} />
          </div>
          <div style={{ display: 'inline-block', marginBottom: '8px' }}>
            <BrandLockup size={36} withTagline />
          </div>
          <p className="ssj-text-muted" style={{ fontSize: '13.5px' }}>
            Plataforma SaaS de Recrutamento & Vistos (Brasil ➔ Japão)
          </p>
        </div>

        {/* Card do Portal de Login */}
        <div className="ssj-card" style={{ padding: '28px', background: 'var(--ssj-surface)', borderRadius: '16px', border: '1px solid var(--ssj-rule)' }}>
          
          {/* Seletor de Perfil (Candidato vs Staff/Agência) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px', padding: '4px', background: 'var(--ssj-surface-2)', borderRadius: '10px' }}>
            <button
              onClick={() => { setTab('candidato'); setMagicSent(false); setOtpSent(false); }}
              className={`ssj-btn ${tab === 'candidato' ? 'ssj-btn--pri' : 'ssj-btn--ghost'}`}
              style={{ width: '100%', fontSize: '13.5px', justifyContent: 'center' }}
            >
              <Smartphone size={16} /> Candidato
            </button>
            <button
              onClick={() => { setTab('staff'); setMagicSent(false); setOtpSent(false); }}
              className={`ssj-btn ${tab === 'staff' ? 'ssj-btn--pri' : 'ssj-btn--ghost'}`}
              style={{ width: '100%', fontSize: '13.5px', justifyContent: 'center' }}
            >
              <Shield size={16} /> Equipe / Agência
            </button>
          </div>

          {/* ABA 1: CANDIDATO (Magic Link / Google OAuth) */}
          {tab === 'candidato' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span className="ssj-pill ssj-pill--info" style={{ marginBottom: '8px' }}>Acesso Sem Senha</span>
                <h3 style={{ margin: '6px 0 4px', fontSize: '18px' }}>Portal do Candidato Dekassegui</h3>
                <p className="ssj-text-muted" style={{ fontSize: '13px' }}>Preencha sua Ficha Cadastral ou acompanhe seu COE/Visto</p>
              </div>

              {/* Botão SSO Google Real */}
              <button
                type="button"
                onClick={handleGoogleOAuth}
                className="ssj-btn ssj-btn--ghost"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--ssj-rule)',
                  marginBottom: '16px',
                  background: 'var(--ssj-paper)',
                  fontWeight: 600
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Entrar com Conta Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: '12px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--ssj-rule)' }} />
                <span style={{ fontSize: '11px', color: 'var(--ssj-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ou Magic Link</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--ssj-rule)' }} />
              </div>

              {!magicSent && !otpSent ? (
                <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>E-mail ou Celular (WhatsApp)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        placeholder="seu.email@exemplo.com ou 11999999999"
                        className="ssj-input"
                        required
                        style={{ width: '100%', paddingLeft: '36px' }}
                      />
                      <Smartphone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ssj-muted)' }} />
                    </div>
                  </div>

                  <button type="submit" className="ssj-btn ssj-btn--pri" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    Receber Acesso (Link ou Código) <ArrowRight size={16} />
                  </button>
                </form>
              ) : otpSent ? (
                <form onSubmit={handleVerifyOtp} style={{ textAlign: 'center', padding: '16px', background: 'var(--ssj-paper)', borderRadius: '10px', border: '1px solid var(--ssj-indigo)' }}>
                  <Smartphone size={32} style={{ color: 'var(--ssj-indigo)', margin: '0 auto 8px' }} />
                  <h4 style={{ margin: '4px 0', fontSize: '15px' }}>Código Enviado!</h4>
                  <p className="ssj-text-muted" style={{ fontSize: '12.5px', marginBottom: '16px' }}>
                    Digite o código de 6 dígitos enviado para o WhatsApp <strong>{identificador}</strong>.
                  </p>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="ssj-input"
                    maxLength={6}
                    required
                    style={{ width: '100%', textAlign: 'center', fontSize: '18px', letterSpacing: '0.2em', marginBottom: '12px', fontFamily: 'var(--ssj-font-mono)' }}
                  />
                  <button type="submit" className="ssj-btn ssj-btn--pri ssj-btn--block" style={{ width: '100%', justifyContent: 'center' }}>
                    Verificar e Entrar
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', background: 'var(--ssj-paper)', borderRadius: '10px', border: '1px solid var(--ssj-verde)' }}>
                  <CheckCircle2 size={32} style={{ color: 'var(--ssj-verde)', margin: '0 auto 8px' }} />
                  <h4 style={{ margin: '4px 0', fontSize: '15px' }}>Link de Acesso Enviado!</h4>
                  <p className="ssj-text-muted" style={{ fontSize: '12.5px', marginBottom: '12px' }}>
                    Enviamos um link seguro para o e-mail <strong>{identificador}</strong>. Acesse para abrir sua ficha.
                  </p>
                  <button onClick={() => { window.location.href = '/candidato'; }} className="ssj-btn ssj-btn--pri ssj-btn--sm">
                    Ir para Ficha Cadastral
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ABA 2: STAFF / AGÊNCIAS (Login Simples e Direto) */}
          {tab === 'staff' && (
            <form onSubmit={handleStaffLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span className="ssj-pill ssj-pill--seal" style={{ marginBottom: '8px' }}>Área Restrita Multi-Tenant</span>
                <h3 style={{ margin: '4px 0', fontSize: '18px' }}>Painel Administrativo & Agências</h3>
                <p className="ssj-text-muted" style={{ fontSize: '13px' }}>Acesse com suas credenciais de administrador ou parceiro.</p>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>E-mail Corporativo</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={identificador}
                    onChange={(e) => setIdentificador(e.target.value)}
                    placeholder="analista@suaempresa.com.br"
                    className="ssj-input"
                    required
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ssj-muted)' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="ssj-input"
                    required
                    style={{ width: '100%', paddingLeft: '36px' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ssj-muted)' }} />
                </div>
              </div>

              <button type="submit" className="ssj-btn ssj-btn--pri" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '12px' }}>
                <UserCheck size={18} /> Entrar no Painel B2B
              </button>
            </form>
          )}

          {/* Selo Hanko de Garantia da Plataforma */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--ssj-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hanko estado="aprovado" texto="済" size={32} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ssj-text)' }}>Conformidade LGPD</div>
                <div style={{ fontSize: '10px', color: 'var(--ssj-muted)' }}>Criptografia AES-256 & Audit Log</div>
              </div>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ssj-muted)', fontFamily: 'var(--ssj-font-mono)' }}>v2.0 Vercel</span>
          </div>

        </div>
      </div>
    </div>
  );
}
