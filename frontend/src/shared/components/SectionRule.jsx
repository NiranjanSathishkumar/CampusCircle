import { useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Plain scaleX bars instead of SVG paths drawn with DrawSVGPlugin — a
// straight horizontal hairline doesn't need path-length "drawing" at all,
// and the SVGs here (viewBox="0 0 100 1" stretched via preserveAspectRatio
// "none" across a fluid-width container) scaled X and Y non-uniformly,
// which is exactly the combination DrawSVGPlugin warns about when the path
// also carries vector-effect="non-scaling-stroke" (needed to keep the
// hairline visually 1px regardless of container width) — a real console
// warning on every landing-page load for a visual effect scaleX achieves
// identically with no such measurement step involved.
export default function SectionRule({ label, dark = false, className = 'mb-10' }) {
  const reduce       = useReducedMotion();
  const containerRef = useRef(null);
  const leftBarRef   = useRef(null);
  const rightBarRef  = useRef(null);
  const labelRef     = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const leftBar   = leftBarRef.current;
    const rightBar  = rightBarRef.current;
    const labelEl   = labelRef.current;

    if (!container || !leftBar || !rightBar || !labelEl) return;

    if (reduce) {
      gsap.set([leftBar, rightBar], { scaleX: 1 });
      gsap.set(labelEl, { opacity: 1, y: 0 });
      return;
    }

    gsap.set([leftBar, rightBar], { scaleX: 0 });
    gsap.set(labelEl, { opacity: 0, y: 4 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 88%',
          once: true,
        },
      });

      // 1. Hairlines grow outward on left and right
      tl.to([leftBar, rightBar], {
        scaleX: 1,
        duration: 0.48,
        stagger: 0.08,
        ease: 'power2.out',
      });

      // 2. Section label fades in as lines complete
      tl.to(
        labelEl,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
        '-=0.24'
      );
    }, container);

    return () => ctx.revert();
  }, [reduce]);

  const strokeColor = dark ? 'rgba(216, 210, 196, 0.25)' : '#D8D2C4';

  return (
    <div
      ref={containerRef}
      className={`flex items-center gap-4 w-full ${className}`}
      aria-label={`Section: ${label}`}
    >
      {/* Left Hairline */}
      <div className="flex-1 h-3 flex items-center overflow-hidden">
        <div
          ref={leftBarRef}
          className="w-full h-px origin-left"
          style={{ backgroundColor: strokeColor }}
          aria-hidden="true"
        />
      </div>

      {/* Center Label */}
      <span
        ref={labelRef}
        className={`font-mono text-[0.625rem] font-medium uppercase tracking-[0.15em] shrink-0 select-none ${
          dark ? 'text-[#9CA3AF]/70' : 'text-[#9CA3AF]'
        }`}
      >
        {label}
      </span>

      {/* Right Hairline */}
      <div className="flex-1 h-3 flex items-center overflow-hidden">
        <div
          ref={rightBarRef}
          className="w-full h-px origin-left"
          style={{ backgroundColor: strokeColor }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
