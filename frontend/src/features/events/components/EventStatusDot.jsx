export default function EventStatusDot({ status }) {
  const colors = {
    'Open': '#1A3A2A',
    'Filling Fast': '#B45309',
    'Almost Full': '#991B1B',
    'Sold Out': '#374151',
  };
  return (
    <span style={{
      width: 6, height: 6,
      borderRadius: '50%',
      background: colors[status] || '#9CA3AF',
      display: 'inline-block',
      flexShrink: 0,
    }} />
  );
}
