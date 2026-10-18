import { useRef, useEffect, useId } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrambleTextPlugin, MorphSVGPlugin, DrawSVGPlugin, SplitText);

const PATH_BOOKMARK_OUTLINE = "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z";
const PATH_BOOKMARK_FILL    = "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z";

/* ── MorphSVG Bookmark Icon ── */
export function MorphBookmark({ isSaved, size = 16 }) {
  const reduce  = useReducedMotion();
  const pathRef = useRef(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    if (reduce) {
      gsap.set(el, {
        attr: { d: isSaved ? PATH_BOOKMARK_FILL : PATH_BOOKMARK_OUTLINE },
        fill: isSaved ? '#991B1B' : '#6B7280',
      });
      return;
    }

    gsap.to(el, {
      morphSVG: isSaved ? PATH_BOOKMARK_FILL : PATH_BOOKMARK_OUTLINE,
      fill: isSaved ? '#991B1B' : '#6B7280',
      duration: 0.38,
      ease: 'power2.inOut',
    });
  }, [isSaved, reduce]);

  // GSAP owns `d` and `fill` after mount. Letting React keep rendering them
  // from `isSaved` snapped the path to its target before the effect ran, so
  // morphSVG tweened the target into itself and the morph was never visible.
  // Render the first frame only, then hand the attributes over.
  const initial = useRef({
    d: isSaved ? PATH_BOOKMARK_FILL : PATH_BOOKMARK_OUTLINE,
    fill: isSaved ? '#991B1B' : '#6B7280',
  });

  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none" style={{ display: 'block' }}>
      <path ref={pathRef} d={initial.current.d} fill={initial.current.fill} />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   COLOR PALETTE MAP FOR EVENT STATUS BADGES
   ───────────────────────────────────────────────────────────── */
const STATUS_STYLES = {
  'Open': {
    color: '#1A3A2A',
    bg: 'rgba(26, 58, 42, 0.12)',
    border: 'rgba(26, 58, 42, 0.28)',
    dotColor: '#1A3A2A',
  },
  'Filling Fast': {
    color: '#B45309',
    bg: 'rgba(180, 83, 9, 0.12)',
    border: 'rgba(180, 83, 9, 0.28)',
    dotColor: '#B45309',
  },
  'Almost Full': {
    color: '#C2410C',
    bg: 'rgba(194, 65, 12, 0.15)',
    border: 'rgba(194, 65, 12, 0.35)',
    dotColor: '#C2410C',
  },
  'Sold Out': {
    color: '#991B1B',
    bg: 'rgba(153, 27, 27, 0.15)',
    border: 'rgba(153, 27, 27, 0.35)',
    dotColor: '#991B1B',
  },
  // Time-based closure (event ended / registration window passed) — kept
  // visually distinct (neutral grey) from the capacity-driven "Sold Out"
  // red, since seats being free isn't why these are closed.
  'Concluded': {
    color: '#4B5563',
    bg: 'rgba(75, 85, 99, 0.12)',
    border: 'rgba(75, 85, 99, 0.28)',
    dotColor: '#4B5563',
  },
  'Registration Closed': {
    color: '#4B5563',
    bg: 'rgba(75, 85, 99, 0.12)',
    border: 'rgba(75, 85, 99, 0.28)',
    dotColor: '#4B5563',
  },
};

/* ── Status Dot Helper ── */
export function StatusDot({ status }) {
  const dotRef = useRef(null);

  useEffect(() => {
    const el = dotRef.current;
    if (!el) return;
    const style = STATUS_STYLES[status] || STATUS_STYLES['Open'];
    gsap.to(el, {
      backgroundColor: style.dotColor,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [status]);

  // Mount colour only — the tween owns backgroundColor from then on.
  const initialColor = useRef((STATUS_STYLES[status] || STATUS_STYLES['Open']).dotColor);

  return (
    <span
      ref={dotRef}
      style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        backgroundColor: initialColor.current,
        display: 'inline-block',
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  );
}

/* ── 1. Hub Header Eyebrow (GSAP ScrambleText decode-in) ── */
export function ScrambleTextEyebrow({ text = 'SIES GST Campus · Live Hub' }) {
  const reduce = useReducedMotion();
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el || reduce) return;

    gsap.to(el, {
      duration: 1.15,
      scrambleText: {
        text: text,
        chars: '01█▓▒░|/\\[]{}',
        revealDelay: 0.12,
        speed: 0.6,
      },
      ease: 'none',
    });
  }, [text, reduce]);

  return (
    <p className="events-hub-eyebrow" aria-label={text}>
      <span className="events-hub-pulse-dot" aria-hidden="true" />
      <span ref={textRef}>{text}</span>
    </p>
  );
}

/* ── 2. Digit-Roll Counter (GSAP number tweening) ── */
export function GSAPDigitRoll({ value, prefix = '', suffix = '' }) {
  const reduce = useReducedMotion();
  const numRef = useRef(null);
  const prevVal = useRef(value);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    if (reduce) {
      el.textContent = `${prefix}${value}${suffix}`;
      return;
    }

    const startVal = prevVal.current;
    prevVal.current = value;

    const obj = { val: startVal };
    const tween = gsap.to(obj, {
      val: value,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
      },
    });

    return () => { tween.kill(); };
  }, [value, prefix, suffix, reduce]);

  // One text node, not three: the tween writes through el.textContent, which
  // collapses the children into a single node and detaches the ones React is
  // holding references to. With three siblings, React's later updates went to
  // detached nodes and were silently lost.
  return <span ref={numRef}>{`${prefix}${value}${suffix}`}</span>;
}

/* ── 3. Status Badge (GSAP color tweening when threshold changes) ── */
export function GSAPStatusBadge({ status, className = '', style = {} }) {
  const reduce = useReducedMotion();
  const badgeRef = useRef(null);

  useEffect(() => {
    const el = badgeRef.current;
    if (!el || reduce) return;

    const targetStyle = STATUS_STYLES[status] || STATUS_STYLES['Open'];

    // Smoothly color-tween text color, background color, and border color
    gsap.to(el, {
      color: targetStyle.color,
      backgroundColor: targetStyle.bg,
      borderColor: targetStyle.border,
      duration: 0.65,
      ease: 'power2.out',
    });
  }, [status, reduce]);

  // Mount palette only — re-rendering the target colours from `status` on
  // every render meant the tween below always started from where it was
  // headed, so the colour change snapped instead of easing.
  const initialStyle = useRef(STATUS_STYLES[status] || STATUS_STYLES['Open']).current;

  return (
    <span
      ref={badgeRef}
      className={`event-status-badge ${className}`}
      style={{
        color: initialStyle.color,
        backgroundColor: initialStyle.bg,
        borderColor: initialStyle.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        ...style,
      }}
      aria-label={`Status: ${status}`}
    >
      <StatusDot status={status} />
      {status}
    </span>
  );
}

/* ── 4. Progress Bar (GSAP width + color tweening) ── */
export function GSAPProgressBar({ pct, liveRegistered, capacity, className = '' }) {
  const reduce = useReducedMotion();
  const barRef = useRef(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const targetColor =
      pct >= 0.9 ? '#991B1B' : pct >= 0.7 ? '#B45309' : '#1A3A2A';

    if (reduce) {
      gsap.set(el, { width: `${pct * 100}%`, backgroundColor: targetColor });
      return;
    }

    gsap.to(el, {
      width: `${pct * 100}%`,
      backgroundColor: targetColor,
      duration: 0.8,
      ease: 'power2.out',
    });
  }, [pct, reduce]);

  // Mount width/colour only. Keeping these React-controlled set the bar to its
  // new width before the effect ran, so the fill jumped and the tween that
  // followed had nothing left to animate.
  const initial = useRef({
    width: `${pct * 100}%`,
    backgroundColor: pct >= 0.9 ? '#991B1B' : pct >= 0.7 ? '#B45309' : '#1A3A2A',
  }).current;

  return (
    <div
      className={`event-card-progress-bar-wrap ${className}`}
      role="progressbar"
      aria-valuenow={liveRegistered}
      aria-valuemin={0}
      aria-valuemax={capacity}
      aria-label="Registration capacity progress"
    >
      <div
        ref={barRef}
        className="event-card-progress-bar"
        style={{
          width: initial.width,
          backgroundColor: initial.backgroundColor,
          height: '100%',
          borderRadius: 2,
        }}
      />
    </div>
  );
}

/* ── 5. Split-word title reveal (GSAP SplitText stagger) ── */
export function SplitTitleReveal({ text, as: Tag = 'h1', style, className, delay = 0.1 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduce) return;

    const split = SplitText.create(el, { type: 'words', wordsClass: 'split-word' });
    gsap.set(split.words, { display: 'inline-block' });
    gsap.from(split.words, {
      yPercent: 115,
      opacity: 0,
      duration: 0.7,
      delay,
      stagger: 0.045,
      ease: 'power3.out',
    });

    return () => split.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag ref={ref} className={className} style={{ ...style, overflow: 'hidden' }}>
      {text}
    </Tag>
  );
}

/* ── 6. Agenda timeline connector (GSAP DrawSVG path) ── */
export function AgendaTimelineLine({ count = 0 }) {
  const reduce = useReducedMotion();
  const pathRef = useRef(null);
  const wrapRef = useRef(null);
  const gradientId = useId().replace(/[:]/g, '');

  useEffect(() => {
    const path = pathRef.current;
    const wrap = wrapRef.current;
    if (!path || !wrap) return;

    if (reduce) {
      gsap.set(path, { drawSVG: '100%' });
      return;
    }

    gsap.set(path, { drawSVG: '0%' });
    const duration = Math.min(0.5 + count * 0.15, 1.8);

    let played = false;
    const play = () => {
      if (played) return;
      played = true;
      gsap.to(path, { drawSVG: '100%', duration, ease: 'power2.inOut', delay: 0.1 });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(wrap);

    return () => observer.disconnect();
  }, [count, reduce]);

  return (
    <svg
      ref={wrapRef}
      className="events-agenda-line-fill"
      viewBox="0 0 2 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#991B1B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d="M1,0 L1,100"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* ── 7. Morphing accordion chevron (GSAP MorphSVG) ── */
const PATH_CHEVRON_DOWN = 'M4,6 L8,10 L12,6';
const PATH_CHEVRON_UP = 'M4,10 L8,6 L12,10';

export function MorphChevron({ open, size = 16, color = '#6B7280', openColor = '#991B1B' }) {
  const reduce = useReducedMotion();
  const pathRef = useRef(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;

    if (reduce) {
      gsap.set(el, { attr: { d: open ? PATH_CHEVRON_UP : PATH_CHEVRON_DOWN }, stroke: open ? openColor : color });
      return;
    }

    gsap.to(el, {
      morphSVG: open ? PATH_CHEVRON_UP : PATH_CHEVRON_DOWN,
      stroke: open ? openColor : color,
      duration: 0.36,
      ease: 'power2.inOut',
    });
  }, [open, reduce, color, openColor]);

  // Same hand-off as MorphBookmark — React must not keep rewriting `d`/`stroke`
  // to the value GSAP is on its way to animating towards.
  const initial = useRef({
    d: open ? PATH_CHEVRON_UP : PATH_CHEVRON_DOWN,
    stroke: open ? openColor : color,
  });

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block' }} aria-hidden="true">
      <path
        ref={pathRef}
        d={initial.current.d}
        stroke={initial.current.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
