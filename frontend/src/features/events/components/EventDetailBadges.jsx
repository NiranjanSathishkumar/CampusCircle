/**
 * Status indicators used inside the event detail panel.
 */
export function StatusDot({ status }) {
  const colors = {
    'Open': '#1A3A2A',
    'Filling Fast': '#B45309',
    'Almost Full': '#991B1B',
    'Sold Out': '#374151',
  };
  return (
    <span
      style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: colors[status] || '#9CA3AF',
        display: 'inline-block',
        flexShrink: 0,
      }}
    />
  );
}

export function StatusBadgeLg({ status }) {
  const cls = {
    'Open': 'open',
    'Filling Fast': 'filling',
    'Almost Full': 'almost',
    'Sold Out': 'soldout',
  }[status] || 'open';
  return (
    <span className={`event-status-badge ${cls}`} style={{ fontSize: '0.625rem', padding: '0.3125rem 0.625rem' }}>
      <StatusDot status={status} />
      {status}
    </span>
  );
}
