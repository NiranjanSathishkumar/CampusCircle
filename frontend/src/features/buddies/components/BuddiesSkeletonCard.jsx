/* ─────────────────────────────────────────────────────────────
   SKELETON CARD
   ───────────────────────────────────────────────────────────── */
export default function BuddiesSkeletonCard() {
  return (
    <div className="event-card-skeleton" aria-hidden="true">
      <div className="skeleton-block" style={{ height: 90, borderRadius: 0 }} />
      <div style={{ padding: '2rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div className="skeleton-block" style={{ width: '55%', height: 16 }} />
        <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
        <div className="skeleton-block" style={{ width: '90%', height: 12, marginTop: 4 }} />
        <div className="skeleton-block" style={{ width: '70%', height: 12 }} />
      </div>
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #D8D2C4' }}>
        <div className="skeleton-block" style={{ width: '100%', height: 32, borderRadius: 3 }} />
      </div>
    </div>
  );
}
