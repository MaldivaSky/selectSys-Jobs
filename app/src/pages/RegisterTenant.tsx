import { useState } from 'react';
import { Building2, User, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { BrandLockup } from '../brand/BrandMark';

export function RegisterTenant() {
  const [step, setStep] = useState<1 | 2>(1);
  const [tenantName, setTenantName] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTenantName(e.target.value);
    setTenantSlug(generateSlug(e.target.value));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenantName && tenantSlug) {
      setStep(2);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui chamaremos a API/Supabase para registrar o Tenant e o Org_Admin numa mesma transação
    alert(`Tenant ${tenantName} (${tenantSlug}) e Admin ${adminEmail} criados com sucesso!`);
    window.location.href = '/admin';
  };

  return (
    <div className="ssj-section" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ssj-container" style={{ maxWidth: '480px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-block', marginBottom: '16px' }}>
            <BrandLockup size={36} withTagline />
          </div>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px' }}>Cadastro de Organização</h2>
          <p className="ssj-text-muted" style={{ fontSize: '14px' }}>
            Crie seu ambiente exclusivo e administre recrutamentos.
          </p>
        </div>

        <div className="ssj-card" style={{ padding: '28px', background: 'var(--ssj-surface)', borderRadius: '16px', border: '1px solid var(--ssj-border)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '4px', background: step >= 1 ? 'var(--ssj-primary)' : 'var(--ssj-surface-2)', borderRadius: '2px' }} />
            <div style={{ width: '8px' }} />
            <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--ssj-primary)' : 'var(--ssj-surface-2)', borderRadius: '2px' }} />
          </div>

          {step === 1 ? (
            <form onSubmit={handleNext}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ssj-primary)' }}>
                <Building2 size={20} />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Dados da Empresa</h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="ssj-form-label" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  Nome da Organização
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={handleTenantNameChange}
                    placeholder="Ex: FUJIARTE do Brasil"
                    className="ssj-input"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="ssj-form-label" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>
                  Slug (URL de Acesso)
                </label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="ssj-text-muted" style={{ padding: '0 8px', background: 'var(--ssj-surface-2)', border: '1px solid var(--ssj-border)', borderRight: 'none', borderRadius: '8px 0 0 8px', height: '40px', display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                    app.selectsys.com/
                  </span>
                  <input
                    type="text"
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    className="ssj-input"
                    style={{ flex: 1, borderRadius: '0 8px 8px 0', borderLeft: 'none' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="ssj-btn ssj-btn--pri" style={{ width: '100%', justifyContent: 'center' }}>
                Próximo Passo <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ssj-primary)' }}>
                <ShieldCheck size={20} />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Administrador (Tenant Admin)</h3>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="ssj-form-label" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Nome Completo</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ssj-text-muted)' }} />
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="ssj-input"
                    style={{ width: '100%', paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="ssj-form-label" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>E-mail Profissional</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ssj-text-muted)' }} />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="ssj-input"
                    style={{ width: '100%', paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label className="ssj-form-label" style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>Senha de Acesso</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--ssj-text-muted)' }} />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="ssj-input"
                    style={{ width: '100%', paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setStep(1)} className="ssj-btn ssj-btn--ghost" style={{ flex: 1, justifyContent: 'center' }}>
                  Voltar
                </button>
                <button type="submit" className="ssj-btn ssj-btn--pri" style={{ flex: 2, justifyContent: 'center' }}>
                  Criar Organização
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
