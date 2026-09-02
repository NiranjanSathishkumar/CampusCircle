import { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { ArrowRight, Users, CalendarCheck, Buildings } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';

// Register all plugins once at module level
gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, Draggable, InertiaPlugin);

const prefersReduced =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

// ─── Magnetic button ──────────────────────────────────────────────────────────
function MagneticButton({ children, className, href, id }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 25 });
  const springY = useSpring(y, { stiffness: 300, damping: 25 });

  const handleMouseMove = (e) => {
    if (prefersReduced) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.25);
    y.set((e.clientY - cy) * 0.25);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      id={id}
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={prefersReduced ? {} : { scale: 0.97 }}
    >
      {children}
    </motion.a>
  );
}

// ─── Floating stat pill ───────────────────────────────────────────────────────
function StatPill({ value, label, delay }) {
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 180, damping: 18 }}
      className="flex items-center gap-2.5 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm px-3 py-2 shadow-sm"
    >
      <p className="font-display font-bold text-[#0F172A] text-base leading-none">{value}</p>
      <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-widest leading-tight">{label}</p>
    </motion.div>
  );
}

// ─── Draggable "Next Event" floating card ─────────────────────────────────────
// GSAP owns this element — Draggable + InertiaPlugin handle fling/settle-back.
// Fix notes:
//   - instanceRef stores Draggable so useEffect cleanup can kill() it correctly
//   - onDragEnd fires the snap-back even when velocity is too low to trigger
//     onThrowComplete (i.e. the user just clicks + drops without a real fling)
//   - The card uses position:absolute BUT Draggable animates via transform,
//     so snap-back to {x:0,y:0} correctly returns to CSS-positioned origin
function NextEventCard() {
  const cardRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (prefersReduced) {
      gsap.to(el, { opacity: 1, duration: 0.5, delay: 0.9 });
      return;
    }

    // Snap-back tween — shared by both onDragEnd and onThrowComplete
    const snapHome = () =>
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.85,
        ease: 'elastic.out(1, 0.52)',
      });

    // Entrance first, then hand off to Draggable
    gsap.fromTo(
      el,
      { opacity: 0, y: 28, scale: 0.88 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: 0.9,
        ease: 'back.out(1.4)',
        onComplete() {
          instanceRef.current = Draggable.create(el, {
            type: 'x,y',
            inertia: true,
            // onDragEnd fires when the user releases (regardless of throw velocity)
            onDragEnd() {
              // If inertia is still running, onThrowComplete will fire — skip here
              if (!this.isThrowing) snapHome();
            },
            // onThrowComplete fires after inertia coasts to a stop
            onThrowComplete: snapHome,
          })[0];
        },
      }
    );

    return () => {
      if (instanceRef.current) {
        instanceRef.current.kill();
        instanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      // opacity:0 — GSAP controls visibility; position:absolute places it at origin
      style={{ opacity: 0, position: 'absolute', bottom: '-1.5rem', left: '-1.5rem' }}
      className="bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-3.5 shadow-md hidden sm:block min-w-[200px] cursor-grab active:cursor-grabbing select-none z-20"
      title="Drag me!"
    >
      <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-widest mb-1">
        Next Event
      </p>
      <p className="font-display font-semibold text-[#0F172A] text-sm leading-tight">
        Design Week Hackathon
      </p>
      <p className="font-mono text-[0.5625rem] text-[#991B1B] mt-0.5 seats-pulse font-medium">
        14 seats remaining
      </p>
    </div>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────
export default function HeroSection() {
  const sectionRef = useRef(null);
  // gridRef: dedicated div for the ledger-grid pattern so GSAP can translate it
  // independently of the section's overflow-hidden clipping context.
  const gridRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    const line1 = line1Ref.current;
    const line2 = line2Ref.current;
    if (!section || !grid || !line1 || !line2) return;

    const ctx = gsap.context(() => {

      // ── 1. SplitText char-stagger on "Your campus," ────────────────────────
      if (!prefersReduced) {
        const split1 = new SplitText(line1, { type: 'chars,words' });
        gsap.from(split1.chars, {
          opacity: 0,
          yPercent: 110,
          duration: 0.5,
          ease: 'power3.out',
          stagger: { amount: 0.26 },
          delay: 0.15,
          onComplete: () => split1.revert(),
        });
      }

      // ── 2. ScrambleText teleprinter decode on "in one place." ──────────────
      if (!prefersReduced) {
        gsap.set(line2, { opacity: 1 });
        gsap.to(line2, {
          delay: 0.38,
          duration: 1.15,
          scrambleText: {
            text: 'in one place.',
            chars: '01█▓▒░|/\\[]{}',
            revealDelay: 0.22,
            tweenLength: false,
            speed: 0.6,
          },
          ease: 'none',
        });
      } else {
        gsap.set(line2, { opacity: 1 });
      }

      // ── 3. GSAP ScrollTrigger parallax ─────────────────────────────────────
      // The .ledger-grid lives on a dedicated `gridRef` div, NOT on the section.
      // We translate the grid div upward (negative Y) slower than the page scrolls,
      // so it appears to drift behind the content — classic parallax depth.
      //
      // Why a separate div instead of section backgroundPositionY:
      //   • section has overflow-hidden → backgroundPositionY shifts are clipped
      //   • The gradient overlay covers the section background entirely
      //   • transform on the child div bypasses both constraints
      gsap.to(grid, {
        y: -60, // grid moves 60px up while the section fully scrolls out
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,           // 0.8s lag for a smooth, buttery feel
        },
      });

    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
      aria-label="Hero: What CampusCircle is"
    >
      {/* Parallax grid layer — translated by GSAP ScrollTrigger.
          Lives BELOW the gradient tint; overflow-hidden on the section
          clips it cleanly at the edges. Scale > 100% so translation
          never reveals a gap at the edges. */}
      <div
        ref={gridRef}
        className="ledger-grid absolute inset-0 pointer-events-none"
        style={{ willChange: 'transform', transform: 'scale(1.08)' }}
        aria-hidden="true"
      />
      {/* Gradient tint sits above the grid — creates depth separation */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EA]/90 via-[#F5F2EA]/85 to-[#ece9df]/90 pointer-events-none" aria-hidden="true" />

      <div className="page-container relative z-10 w-full grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-16 xl:gap-24 pt-32 pb-20 lg:pt-36 lg:pb-24 items-center">

        {/* LEFT — copy */}
        <div>
          {/* 1. Stamp */}
          <motion.div
            className="mb-8"
            initial={prefersReduced ? false : { opacity: 0, rotate: -8, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="stamp-badge stamp-badge-rotated inline-block text-xs tracking-[0.16em]">
              Closed Campus Access Only
            </span>
          </motion.div>

          {/* 2. Headline
               Line 1: GSAP SplitText char stagger
               Line 2: GSAP ScrambleText teleprinter decode (crimson, matches stamp) */}
          <h1 className="font-display font-bold text-[#0F172A] text-[3rem] sm:text-[3.75rem] lg:text-[4.5rem] xl:text-[5rem] tracking-tight leading-[1.0] mb-7 overflow-hidden">
            {/* overflow-hidden clips chars during yPercent stagger */}
            <span ref={line1Ref} className="block overflow-hidden">
              Your campus,
            </span>
            {/* Hidden initially; GSAP sets opacity:1 before scramble starts */}
            <span
              ref={line2Ref}
              className="block text-[#991B1B]"
              style={{ opacity: 0 }}
            >
              in one place.
            </span>
          </h1>

          {/* Accessible fallback — screen reader gets the real headline regardless */}
          <span className="sr-only">Your campus, in one place.</span>

          {/* 3. Subtext — delayed to after scramble resolves */}
          <motion.p
            className="text-[#4B5563] text-lg sm:text-xl leading-relaxed max-w-[42ch] mb-10 font-normal"
            initial={prefersReduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.62, ease: [0.16, 1, 0.3, 1] }}
          >
            CampusCircle replaces scattered WhatsApp groups and paper posters with one verified platform for events, clubs, and student networking at{' '}
            <span className="text-[#0F172A] font-semibold">SIES Graduate School of Technology</span>.
          </motion.p>

          {/* 4. CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3.5 mb-12"
            initial={prefersReduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 1.78, ease: [0.16, 1, 0.3, 1] }}
          >
            <MagneticButton
              id="hero-signup-cta"
              href="#signup"
              className="btn-primary text-base py-3.5 px-7 font-semibold"
            >
              Join CampusCircle
              <ArrowRight size={18} weight="bold" />
            </MagneticButton>
            <a
              id="hero-explore-cta"
              href="#features"
              className="btn-secondary text-base py-3.5 px-7 font-semibold"
            >
              See What&apos;s Inside
            </a>
          </motion.div>

          {/* 5. Stat pills */}
          <motion.div
            className="flex flex-wrap gap-2.5"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.92 }}
          >
            <StatPill value="8" label="Integrated features" delay={1.95} />
            <StatPill value="1" label="Campus. No outside noise" delay={2.08} />
            <StatPill value="SIES GST" label="Closed & verified" delay={2.22} />
          </motion.div>
        </div>

        {/* RIGHT — visual: app preview mockup */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, scale: 0.94, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-[500px]">
            {/* Decorative shadow card */}
            <div
              className="absolute -top-4 -right-4 w-full h-full rounded-md bg-[#0F172A]/6 border border-[#D8D2C4]"
              aria-hidden="true"
            />

            {/* App preview panel */}
            <div className="relative form-panel overflow-hidden shadow-lg">
              {/* Browser chrome */}
              <div className="bg-[#0F172A] px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#991B1B]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#B45309]/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1A3A2A]/60" />
                </div>
                <div className="flex-1 bg-[#1A2332] rounded-sm px-3 py-1 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#1A3A2A]" />
                  <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">campuscircle.app/sies-gst</p>
                </div>
              </div>

              {/* App content */}
              <div className="p-5 bg-[#F0EDE5]">
                {/* Upcoming events */}
                <div className="mb-4">
                  <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-widest mb-3">Upcoming for You</p>
                  <div className="space-y-2">
                    {[
                      { icon: CalendarCheck, title: 'Design Week Hackathon', meta: 'Aug 22 · 14 seats left', hot: true },
                      { icon: Users, title: 'GDSC Study Jam', meta: 'Aug 24 · Open', hot: false },
                      { icon: Buildings, title: 'Photography Walk', meta: 'Sep 1 · 8 seats left', hot: false },
                    ].map((e) => {
                      const Icon = e.icon;
                      return (
                        <div key={e.title} className="flex items-center gap-3 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm px-3 py-2.5">
                          <div className="w-7 h-7 rounded-sm bg-[#0F172A] flex items-center justify-center shrink-0">
                            <Icon size={12} color="#F5F2EA" weight="fill" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold text-[#0F172A] text-[0.6875rem] truncate">{e.title}</p>
                            <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider">{e.meta}</p>
                          </div>
                          {e.hot && (
                            <span className="font-mono text-[0.4rem] uppercase tracking-wider px-1 py-0.5 bg-[#991B1B] text-white rounded-sm shrink-0">Hot</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Communities row */}
                <div className="border-t border-[#D8D2C4] pt-4">
                  <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-widest mb-2.5">Your Communities</p>
                  <div className="flex gap-2 flex-wrap">
                    {['GDSC', 'Lens Society', 'Debate Club', 'E-Cell'].map((c) => (
                      <span key={c} className="font-mono text-[0.45rem] uppercase tracking-wider px-2 py-1 bg-[#0F172A] text-[#F5F2EA] rounded-sm">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating "Next Event" card — Draggable + InertiaPlugin */}
            <NextEventCard />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
