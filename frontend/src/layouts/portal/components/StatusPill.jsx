const STATUS_MAP = {
  published: { label: 'Published', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', pulse: true },
  draft: { label: 'Draft', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' },
  completed: { label: 'Completed', color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)' },
  open: { label: 'Open', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', pulse: true },
  closed: { label: 'Closed', color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)' },
  pending: { label: 'Pending', color: '#D97706', bg: 'rgba(217, 119, 6, 0.1)' },
  shortlisted: { label: 'Shortlisted', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
  selected: { label: 'Selected', color: '#059669', bg: 'rgba(16, 185, 129, 0.1)', pulse: true },
  rejected: { label: 'Rejected', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.08)' },
};

/**
 * StatusPill — mono uppercase status chip with live pulse dot indicator,
 * reused for posts, events, and recruitment application states.
 */
export default function StatusPill({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, color: '#64748B', bg: 'rgba(100, 116, 139, 0.12)' };
  return (
    <span className="org-status-pill border border-current/15" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.pulse && <span className="org-pulse-dot" />}
      {cfg.label}
    </span>
  );
}
