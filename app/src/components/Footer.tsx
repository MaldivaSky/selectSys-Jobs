import { Shield } from 'lucide-react';
import { BrandLockup } from '../brand/BrandMark';
import { BRAND } from '../brand/brand';
import { translations } from '../translations';
import type { Language } from '../translations';

/* Rodapé padrão: marca, missão e conformidade. A missão fecha toda página. */

export function Footer({ lang }: { lang: Language }) {
  const t = translations[lang];

  return (
    <footer className="ssj-footer">
      <div className="ssj-container">
        <div
          style={{
            display: 'grid',
            gap: 'var(--ssj-s5)',
            gridTemplateColumns: 'repeat(auto-fit,minmax(min(280px,100%),1fr))',
            alignItems: 'start',
          }}
        >
          <div>
            <BrandLockup size={28} />
            <p style={{ marginTop: 12, maxWidth: 420, lineHeight: 1.6, color: 'var(--ssj-muted)' }}>
              {BRAND.mission}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="ssj-label">A travessia</span>
            <span className="ssj-mono" style={{ fontSize: 13, color: 'var(--ssj-text-2)' }}>
              <span style={{ color: 'var(--ssj-verde)' }}>●</span> {BRAND.route.from}
              <span style={{ color: 'var(--ssj-muted)' }}> ─────── </span>
              <span style={{ color: 'var(--ssj-shu)' }}>●</span> {BRAND.route.to}
            </span>
            <span style={{ color: 'var(--ssj-faint)', fontSize: 'var(--ssj-t-xs)' }}>{BRAND.story}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span className="ssj-label">Conformidade</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--ssj-text-2)' }}>
              <Shield size={14} style={{ color: 'var(--ssj-shu)' }} />
              {t.footer.compliance}
            </span>
            <span style={{ color: 'var(--ssj-faint)', fontSize: 'var(--ssj-t-xs)' }}>{BRAND.legal}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 'var(--ssj-s5)',
            paddingTop: 'var(--ssj-s4)',
            borderTop: '1px solid var(--ssj-rule-2)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'space-between',
            color: 'var(--ssj-faint)',
          }}
        >
          <span>
            <strong style={{ color: 'var(--ssj-text)', fontWeight: 600 }}>{BRAND.name}</strong> — {t.footer.rights}
          </span>
          <span className="ssj-mono">{BRAND.category}</span>
        </div>
      </div>
    </footer>
  );
}
