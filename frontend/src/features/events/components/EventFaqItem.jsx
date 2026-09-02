import { gsap } from 'gsap';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { MorphChevron } from '@/features/events/components/EventMotion';

/* ─────────────────────────────────────────────────────────────
   FAQ ACCORDION ITEM
   ───────────────────────────────────────────────────────────── */

export default function EventFaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      gsap.set(wrap, { height: open ? 'auto' : 0 });
      return;
    }

    if (open) {
      gsap.fromTo(
        wrap,
        { height: 0 },
        {
          height: inner.offsetHeight,
          duration: 0.42,
          ease: 'power2.out',
          onComplete: () => gsap.set(wrap, { height: 'auto' }),
        }
      );
    } else {
      gsap.to(wrap, { height: 0, duration: 0.3, ease: 'power2.inOut' });
    }
  }, [open]);

  return (
    <div className={`events-faq-card ${open ? 'open' : ''}`}>
      <motion.button
        className="events-faq-trigger"
        onClick={() => setOpen(o => !o)}
        whileTap={{ scale: 0.99 }}
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}
      >
        <span className="events-faq-question-text">{faq.q}</span>
        <span className="events-faq-chevron">
          <MorphChevron open={open} />
        </span>
      </motion.button>
      <div
        ref={wrapRef}
        id={`faq-answer-${index}`}
        role="region"
        aria-labelledby={`faq-question-${index}`}
        className={`events-faq-answer-wrap ${open ? 'open' : ''}`}
        style={{ height: 0 }}
      >
        <div ref={innerRef} className="events-faq-answer-inner">
          <p className="events-faq-answer-text">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}
