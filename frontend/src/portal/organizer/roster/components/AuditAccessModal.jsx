import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { getAuditLogs } from '@/portal/organizer/settings/community.api';
import { ApiError } from '@/shared/api/httpClient';
import { Clock, Desktop, DeviceMobile, ShieldCheck, Warning, CircleNotch, X } from '@phosphor-icons/react';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';

// Mirrors AdminAuditLogPage.jsx's client-side parsing of the raw userAgent
// string — the AuditLog collection only stores userAgent/ipAddress/createdAt,
// with no pre-parsed device fields and no per-member attribution (a shared
// organizer login is deliberately login-level, not action-level,
// accountability — see backend/src/models/AuditLog.js).
function parseUserAgent(ua = '') {
  let browser = 'Unknown browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'unknown OS';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { label: `${browser} on ${os}`, isMobile: /iPhone|iPad|Android/.test(ua) };
}

/* ─────────────────────────────────────────────────────────────
   AUDIT & ACCESS GOVERNANCE MODAL
   ───────────────────────────────────────────────────────────── */
export default function AuditAccessModal({ onClose }) {
  const modalRef = useRef(null);
  useFocusTrap(modalRef, true, onClose);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getAuditLogs({ limit: 20 })
      .then(({ logs: fetchedLogs }) => {
        if (!cancelled) setLogs(fetchedLogs);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load audit log.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="org-modal-overlay"
      style={{ zIndex: 1200 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="org-modal"
        style={{ maxWidth: 560 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="org-modal-header">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#1A3A2A]" />
            <div>
              <h2 className="org-modal-title">Access Governance &amp; Audit Log</h2>
              <p className="text-xs text-gray-500 font-mono">Shared Institutional Organizer Session</p>
            </div>
          </div>
          <button className="org-icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="org-modal-body space-y-3">
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg p-3 text-xs space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#0F172A] font-['Space_Grotesk']">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>CampusCircle Single-Account Security Model</span>
            </div>
            <p className="text-gray-600 font-['Plus_Jakarta_Sans'] leading-relaxed">
              All committee members share this community's authenticated portal account. Session device and IP are logged on every login for audit compliance — since credentials are shared by several people, that device/time trail (not per-action attribution) is the mechanism that catches misuse.
            </p>
          </div>

          {error && (
            <div className="org-settings-note" style={{ color: '#991B1B' }}>
              <Warning size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk'] block uppercase tracking-wider">
              Recent Login Audit Trail
            </span>
            <div className="border border-[#D8D2C4] rounded-lg overflow-hidden divide-y divide-[#E6E1D5] max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <CircleNotch size={14} className="animate-spin" />
                  <span>Loading login history…</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-4 text-xs text-gray-500 text-center">
                  {error ? 'Login history is unavailable right now.' : 'No logins recorded yet.'}
                </div>
              ) : (
                logs.map((log) => {
                  const device = parseUserAgent(log.userAgent);
                  return (
                    <div key={log._id} className="p-2.5 flex items-center justify-between text-xs hover:bg-[#FAF8F5]">
                      <div>
                        <div className="font-bold text-[#0F172A] font-['Space_Grotesk'] flex items-center gap-1.5">
                          {device.isMobile ? <DeviceMobile size={13} /> : <Desktop size={13} />}
                          <span>{device.label}</span>
                        </div>
                        <div className="text-[11px] font-mono text-gray-500">
                          IP: {log.ipAddress || '—'}
                        </div>
                      </div>
                      <div className="text-right text-[11px] font-mono text-gray-400">
                        <Clock size={11} className="inline mr-1" />
                        {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="org-modal-footer">
          <button type="button" className="org-btn org-btn-secondary" onClick={onClose}>
            Close Audit Log
          </button>
        </div>
      </motion.div>
    </div>
  );
}
