import { gsap } from 'gsap';
import { useEffect, useRef } from 'react';
import { Warning } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   SCHEDULE CONFLICT WARNING (GSAP shake + attention pulse)
   ───────────────────────────────────────────────────────────── */

export default function EventConflictWarning({ conflictTitle }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { x: 0 },
      { keyframes: { x: [0, -7, 7, -5, 5, -2, 2, 0] }, duration: 0.5, ease: 'power2.out' },
      0
    );
    tl.fromTo(
      el,
      { boxShadow: '0 0 0 0 rgba(153,27,27,0.5)' },
      { boxShadow: '0 0 0 7px rgba(153,27,27,0)', duration: 0.9, ease: 'power2.out' },
      0
    );

    return () => tl.kill();
  }, []);

  return (
    <div ref={ref} className="events-conflict-notice">
      <Warning size={16} className="events-conflict-icon" weight="fill" />
      <p className="events-conflict-text">
        You are already registered for <strong>{conflictTitle}</strong> which overlaps with this event's date. You can still register — please review your schedule.
      </p>
    </div>
  );
}
