import { useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

export default function SectionRule({ label, dark = false, className = 'mb-10' }) {
  const reduce       = useReducedMotion();
  const containerRef = useRef(null);
  const leftPathRef  = useRef(null);
  const rightPathRef = useRef(null);
  const labelRef     = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const leftPath  = leftPathRef.current;
    const rightPath = rightPathRef.current;
    const labelEl   = labelRef.current;

    if (!container || !leftPath || !rightPath || !labelEl) return;

    if (reduce) {
      gsap.set([leftPath, rightPath], { drawSVG: '100%' });
      gsap.set(labelEl, { opacity: 1, y: 0 });
      return;
    }

    gsap.set([leftPath, rightPath], { drawSVG: '0%' });
    gsap.set(labelEl, { opacity: 0, y: 4 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 88%',
          once: true,
        },
      });

      // 1. Hairlines draw outward on left and right via DrawSVG
      tl.to([leftPath, rightPath], {
        drawSVG: '100%',
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
      {/* Left Hairline Vector */}
      <div className="flex-1 h-3 flex items-center overflow-hidden">
        <svg
          className="w-full h-[1px] overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 1"
          aria-hidden="true"
        >
          <path
            ref={leftPathRef}
            d="M 0 0.5 H 100"
            stroke={strokeColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
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

      {/* Right Hairline Vector */}
      <div className="flex-1 h-3 flex items-center overflow-hidden">
        <svg
          className="w-full h-[1px] overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 1"
          aria-hidden="true"
        >
          <path
            ref={rightPathRef}
            d="M 0 0.5 H 100"
            stroke={strokeColor}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
