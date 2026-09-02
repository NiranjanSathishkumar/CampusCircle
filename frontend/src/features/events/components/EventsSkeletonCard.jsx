import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   SKELETON CARD
   ───────────────────────────────────────────────────────────── */

export default function EventsSkeletonCard() {
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const blocks = el.querySelectorAll('.skeleton-block');
    gsap.fromTo(
      blocks,
      { backgroundPosition: '-200% 0%' },
      {
        backgroundPosition: '200% 0%',
        duration: 1.8,
        repeat: -1,
        ease: 'none',
        stagger: 0.08,
      }
    );
  }, []);

  return (
    <div ref={cardRef} className="event-card-skeleton" aria-hidden="true">
      <div className="skeleton-block" style={{ aspectRatio: '16/9', borderRadius: 0 }} />
      <div style={{ padding: '0.875rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="skeleton-block" style={{ width: 26, height: 26, borderRadius: 3 }} />
          <div className="skeleton-block" style={{ width: '55%', height: 12 }} />
        </div>
        <div className="skeleton-block" style={{ width: '90%', height: 16 }} />
        <div className="skeleton-block" style={{ width: '70%', height: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3125rem', marginTop: 2 }}>
          <div className="skeleton-block" style={{ width: '60%', height: 11 }} />
          <div className="skeleton-block" style={{ width: '50%', height: 11 }} />
        </div>
      </div>
      <div style={{ padding: '0.625rem 1rem 0.875rem', borderTop: '1px solid #D8D2C4' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton-block" style={{ flex: 1, height: 32, borderRadius: 3 }} />
          <div className="skeleton-block" style={{ flex: 1, height: 32, borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}
