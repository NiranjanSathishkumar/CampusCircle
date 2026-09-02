/* ─────────────────────────────────────────────────────────────
   SKELETON CARD
   ───────────────────────────────────────────────────────────── */
export default function MyEventsSkeletonCard() {
  return (
    <div className="event-card-skeleton" aria-hidden="true">
      <div className="skeleton-block" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
      <div style={{ padding: '1.25rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div className="skeleton-block" style={{ width: '40%', height: 12 }} />
        <div className="skeleton-block" style={{ width: '80%', height: 16 }} />
        <div className="skeleton-block" style={{ width: '60%', height: 12 }} />
      </div>
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #D8D2C4' }}>
        <div className="skeleton-block" style={{ width: '100%', height: 32, borderRadius: 3 }} />
      </div>
    </div>
  );
}
