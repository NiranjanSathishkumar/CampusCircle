/**
 * AdminSettingsPage.jsx — the single platform-owner Admin account.
 * Deliberately minimal: no team/roster management here, since the product
 * doc describes exactly one Admin identity, not a shared or multi-admin
 * model. Credentials are provisioned outside self-serve flows.
 */
import { useState } from 'react';
import { Lock, Info, Check } from '@phosphor-icons/react';
import { useAdminAuth } from '@/shared/auth/useAdminAuth';
import '@/layouts/portal/portal-widgets.css';
import './adm-settings.css';

export default function AdminSettingsPage() {
  const { admin } = useAdminAuth();

  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!pwd.current || !pwd.next || !pwd.confirm) { setError('All fields are required.'); return; }
    if (pwd.next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (pwd.next !== pwd.confirm) { setError('New password and confirmation do not match.'); return; }
    setPwd({ current: '', next: '', confirm: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="org-page">
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">Account</p>
          <h1 className="org-page-title">Settings</h1>
          <p className="org-page-desc">This platform has exactly one Admin account — there's no team or permissions surface to manage here.</p>
        </div>
      </div>

      <div className="adm-settings-grid">
        <div className="org-card">
          <div className="org-card-header">
            <h2 className="org-card-title">Admin Profile</h2>
          </div>
          <div className="org-card-pad">
            <div className="org-form-group">
              <label className="org-form-label">Name</label>
              <input className="org-form-input" value={admin?.name || ''} disabled />
            </div>
            <div className="org-form-group">
              <label className="org-form-label">Email</label>
              <input className="org-form-input" value={admin?.email || ''} disabled />
            </div>
            <div className="adm-settings-note">
              <Info size={14} />
              <span>Admin credentials are provisioned directly in the database, not through a self-serve signup — contact your infrastructure owner to change this profile's identity.</span>
            </div>
          </div>
        </div>

        <form className="org-card" onSubmit={handleSubmit}>
          <div className="org-card-header">
            <h2 className="org-card-title">Change Password</h2>
          </div>
          <div className="org-card-pad">
            <div className="org-form-group">
              <label className="org-form-label">Current Password</label>
              <input type="password" className="org-form-input" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
            </div>
            <div className="org-form-row">
              <div className="org-form-group">
                <label className="org-form-label">New Password</label>
                <input type="password" className="org-form-input" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
              </div>
              <div className="org-form-group">
                <label className="org-form-label">Confirm New Password</label>
                <input type="password" className="org-form-input" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
              </div>
            </div>
            {error && <p className="adm-form-error">{error}</p>}
          </div>
          <div className="org-modal-footer" style={{ borderTop: '1px solid #D8D2C4' }}>
            {saved && <span className="adm-save-confirm"><Check size={13} weight="bold" /> Password updated</span>}
            <button type="submit" className="org-btn org-btn-primary"><Lock size={14} /> Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
}
