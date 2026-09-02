import { useRef } from 'react';
import { ArrowsClockwise, Check, X } from '@phosphor-icons/react';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { COMMUNITY_CATEGORY_VALUES } from '@/features/communities/communitiesConstants';

// Re-exported from the shared taxonomy (communitiesConstants.js) so the
// categories an organizer can be created under always match what the
// student-facing discovery page can filter by - they used to be two
// independently-hand-maintained lists that had already drifted apart.
export const CATEGORIES = COMMUNITY_CATEGORY_VALUES;

export const EMPTY_COMMUNITY = {
  name: '',
  category: CATEGORIES[0],
  sharedEmail: '',
  sharedPassword: '',
};

function slugify(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
}

function generatePassword() {
  return Math.random().toString(36).slice(-10);
}

/**
 * AdminCommunityFormModal — manual community creation only.
 * Creation *is* the vetting step (Section 15/16 of the product doc) — there
 * is no separate approval queue, so this single form both creates and
 * verifies the community, and issues the shared organiser login. There's no
 * backend route to edit an existing organiser's name/category/email after
 * creation (only activate/deactivate) — so unlike the mock-data version of
 * this modal, this one never opens against an existing record.
 */
export default function AdminCommunityFormModal({ draft, onChange, onClose, onSave, saving, error }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, true, onClose);

  const update = (patch) => onChange({ ...draft, ...patch });

  const handleNameChange = (name) => {
    const patch = { name };
    if (!draft.sharedEmail || draft.sharedEmail.endsWith('@campuscircle.app') === false || draft.sharedEmail === '') {
      patch.sharedEmail = name ? `${slugify(name)}.siesgst@campuscircle.app` : '';
    }
    update(patch);
  };

  const canSave = draft.name.trim() && draft.sharedEmail.trim() && draft.sharedPassword.trim();

  return (
    <div className="org-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={modalRef} className="org-modal" role="dialog" aria-modal="true" aria-labelledby="community-modal-title">
        <div className="org-modal-header">
          <h2 className="org-modal-title" id="community-modal-title">Create Community</h2>
          <button className="org-icon-btn" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <div className="org-modal-body">
          <div className="adm-modal-notice">
            Off-platform vetting happens before this step — filling this in and saving <strong>is</strong> the verification. There's no separate approval queue, and these details can't be edited afterward — only activated or deactivated.
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Community Name <span className="required">*</span></label>
            <input className="org-form-input" value={draft.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Photography Club" />
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Category</label>
            <select className="org-form-select" value={draft.category} onChange={(e) => update({ category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Shared Organiser Email <span className="required">*</span></label>
            <input className="org-form-input" value={draft.sharedEmail} onChange={(e) => update({ sharedEmail: e.target.value })} placeholder="community.siesgst@campuscircle.app" />
            <span className="org-form-hint">Used by every authorized roster member to sign in at /organizer/login.</span>
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Initial Shared Password <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="org-form-input" value={draft.sharedPassword} onChange={(e) => update({ sharedPassword: e.target.value })} placeholder="Issued to the organiser roster lead" />
              <button type="button" className="org-btn org-btn-ghost org-btn-sm" onClick={() => update({ sharedPassword: generatePassword() })}>
                <ArrowsClockwise size={13} /> Generate
              </button>
            </div>
            <span className="org-form-hint">Hand this off to the community's roster lead outside the platform — it isn't emailed automatically.</span>
          </div>

          {error && <p className="adm-form-error">{error}</p>}
        </div>
        <div className="org-modal-footer">
          <button className="org-btn org-btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="org-btn org-btn-primary" disabled={!canSave || saving} onClick={() => onSave(draft)}>
            <Check size={14} weight="bold" /> {saving ? 'Creating…' : 'Create & Verify Community'}
          </button>
        </div>
      </div>
    </div>
  );
}
