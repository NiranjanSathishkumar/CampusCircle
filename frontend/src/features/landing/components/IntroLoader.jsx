import { useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

export default function IntroLoader({ onComplete }) {
  const reduce     = useReducedMotion();
  const overlayRef = useRef(null);
  const textRef    = useRef(null);
  const stampRef   = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const text    = textRef.current;
    const stamp   = stampRef.current;

    if (!overlay || !text || !stamp) return;

    if (reduce) {
      gsap.set(overlay, { display: 'none' });
      onComplete?.();
      return;
    }

    // Prevent scrolling while intro curtain is active
    document.body.style.overflow = 'hidden';

    // Initial states
    gsap.set(text, { opacity: 1 });
    gsap.set(stamp, { opacity: 0, scale: 2.4, rotate: -12 });

    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = '';
        gsap.set(overlay, { display: 'none' });
        onComplete?.();
      },
    });

    // 1. Scramble-decode "Verifying access…" with teleprinter security glyphs
    tl.to(text, {
      duration: 0.95,
      scrambleText: {
        text: 'Verifying access…',
        chars: '01█▓▒░|/\\[]{}',
        revealDelay: 0.1,
        speed: 0.6,
      },
      ease: 'none',
    });

    // 2. "ACCESS GRANTED" stamp slams down with high impact
    tl.to(
      stamp,
      {
        opacity: 1,
        scale: 1,
        rotate: -3,
        duration: 0.42,
        ease: 'back.out(2.2)',
      },
      '+=0.1'
    );

    // Hold briefly to establish verification theme
    tl.to({}, { duration: 0.35 });

    // 3. Curtain slides up with a smooth power4.inOut reveal onto hero
    tl.to(overlay, {
      yPercent: -100,
      duration: 0.75,
      ease: 'power4.inOut',
    });

  }, [reduce, onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-[#0F172A] flex flex-col items-center justify-center pointer-events-auto select-none"
      aria-label="Security verification loading curtain"
    >
      <div className="flex flex-col items-center gap-6">
        {/* Teleprinter decode text */}
        <p
          ref={textRef}
          className="font-mono text-sm sm:text-base text-[#9CA3AF] uppercase tracking-[0.25em]"
        >
          01█▒01...
        </p>

        {/* ACCESS GRANTED stamp badge */}
        <div
          ref={stampRef}
          className="stamp-badge border-[#991B1B] text-[#991B1B] bg-[#991B1B]/10 px-6 py-2.5 text-sm sm:text-base tracking-[0.22em] font-bold shadow-[0_0_24px_rgba(153,27,27,0.5)]"
        >
          ACCESS GRANTED · SIES GST
        </div>
      </div>
    </div>
  );
}
