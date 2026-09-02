import { useEffect, useRef } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);


/**
 * PageHubHeader – Unified app-page header following the Events Hub design pattern.
 *
 * Props:
 *   eyebrow     string   – Pill badge text   (default: "SIES GST Campus · Live Hub")
 *   title       string   – Bold h1 text
 *   description string   – Subtitle paragraph
 *   rightSlot   node     – Optional right-side element (stats pill, user badge, etc.)
 *   scramble    boolean  – Animate eyebrow text with ScrambleText (default: true)
 */
export default function PageHubHeader({
  eyebrow = 'SIES GST Campus · Live Hub',
  title,
  description,
  rightSlot,
  scramble = true,
}) {
  const reduce = useReducedMotion();
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || reduce || !scramble) return;

    gsap.to(el, {
      duration: 1.1,
      scrambleText: {
        text: eyebrow,
        chars: '01█▓▒░|/\\[]{}',
        revealDelay: 0.1,
        speed: 0.6,
      },
      ease: 'none',
    });
  }, [eyebrow, reduce, scramble]);

  return (
    <motion.header
      className="page-hub-header"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="page-hub-header-inner">
        <div className="page-hub-header-left">
          {/* Eyebrow pill badge */}
          <p className="page-hub-eyebrow" aria-label={eyebrow}>
            <span className="page-hub-pulse-dot" aria-hidden="true" />
            <span ref={textRef}>{eyebrow}</span>
          </p>

          {/* Title */}
          {title && <h1 className="page-hub-title">{title}</h1>}

          {/* Description */}
          {description && <p className="page-hub-desc">{description}</p>}
        </div>

        {/* Optional right slot */}
        {rightSlot && (
          <motion.div
            className="page-hub-header-right"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 380, damping: 26 }}
          >
            {rightSlot}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
