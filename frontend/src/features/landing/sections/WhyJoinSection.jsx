import { useRef, useEffect } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import { Clock, UserPlus, ArrowRight } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import SectionRule from '@/shared/components/SectionRule';

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  {
    icon: Clock,
    title: 'Event seats are limited',
    body: "Registration is first-come, first-served. Waitlists exist but don't guarantee entry. The earlier your profile exists, the faster you register when something opens.",
    urgentVal: 14,
    urgentLabel: 'seats remaining',
    badge: 'Design Week Hackathon',
    accentColor: '#991B1B',
  },
  {
    icon: UserPlus,
    title: 'Recruitment windows are short',
    body: 'Clubs open recruitment drives for specific roles and close them when slots fill. Applications without a profile on the platform cannot proceed.',
    urgentVal: 3,
    urgentLabel: 'roles closing soon',
    badge: 'GDSC SIES GST',
    accentColor: '#B45309',
  },
];

// ─── GSAP Digit-Roll Counter ────────────────────────────────────────────────
// Rolls 0 → target integer when scrolled into view to sell urgency
function DigitRoll({ target, suffix = '', reduce }) {
  const numRef = useRef(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;

    if (reduce) {
      el.textContent = `${target}${suffix}`;
      return;
    }

    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: target,
      duration: 1.5,
      delay: 0.15,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate() {
        el.textContent = `${Math.round(obj.val)}${suffix}`;
      },
    });

    return () => { tween.kill(); };
  }, [target, suffix, reduce]);

  return <span ref={numRef}>0{suffix}</span>;
}

// ─── Interactive 3D Tilt Card (GSAP quickTo for silky 60fps tilt) ─────────
function TiltCard({ children, className }) {
  const reduce = useReducedMotion();
  const cardRef = useRef(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || reduce) return;

    // Set initial 3D perspective
    gsap.set(el, { transformPerspective: 900, transformStyle: 'preserve-3d' });

    // quickTo's resetTo requires the canonical property name (rotationX/rotationY) —
    // the CSS-style alias (rotateX/rotateY) isn't registered in the tween's prop lookup,
    // so it silently no-ops.
    const rotateXTo = gsap.quickTo(el, 'rotationX', { duration: 0.35, ease: 'power2.out' });
    const rotateYTo = gsap.quickTo(el, 'rotationY', { duration: 0.35, ease: 'power2.out' });

    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      // Rotate up to 12 degrees towards cursor
      rotateYTo(dx * 12);
      rotateXTo(-dy * 12);
    };

    const handleMouseLeave = () => {
      rotateYTo(0);
      rotateXTo(0);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reduce]);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function WhyJoinSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="why"
      className="py-20 md:py-28 bg-[#F0EDE5]"
      aria-label="Why join CampusCircle now"
    >
      <div className="page-container">
        {/* Section label */}
        <SectionRule label="Why join now" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          {/* Left: main message */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden mb-5">
              <motion.h2
                className="font-display font-bold text-[#0F172A] text-4xl sm:text-5xl tracking-tight leading-[1.08]"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                Build your profile<br />before the semester starts.
              </motion.h2>
            </div>
            <p className="text-[#6B7280] leading-relaxed mb-8">
              Your CampusCircle profile is your campus record. The earlier it exists, the more history it accumulates — events attended, communities joined, applications sent.
            </p>

            <div className="flex flex-col gap-3">
              <a
                id="why-signup-cta"
                href="#signup"
                className="btn-primary inline-flex w-fit text-sm py-2.5 px-5 font-semibold"
              >
                Join CampusCircle
                <ArrowRight size={16} weight="bold" />
              </a>
              <a
                id="why-explore-cta"
                href="#features"
                className="btn-secondary inline-flex w-fit text-sm py-2.5 px-5 font-semibold"
              >
                Explore Platform
              </a>
            </div>
          </motion.div>

          {/* Right: 3D tilt cards + GSAP digit-roll urgency counters */}
          <div className="space-y-4">
            {REASONS.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div
                  key={r.title}
                  initial={reduce ? false : { opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.16,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <TiltCard className="form-panel p-6 cursor-default">
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-9 h-9 rounded-sm bg-[#F5F2EA] border border-[#D8D2C4] flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <Icon size={18} color={r.accentColor} weight="duotone" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-[#0F172A] mb-1.5 leading-snug">
                          {r.title}
                        </h3>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{r.body}</p>
                      </div>
                    </div>

                    {/* Digit-roll urgency footer */}
                    <div className="pt-3 border-t border-[#D8D2C4]/60 flex items-center justify-between">
                      <span className="font-mono text-[0.625rem] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: r.accentColor }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: r.accentColor }} aria-hidden="true" />
                        <DigitRoll target={r.urgentVal} reduce={reduce} /> {r.urgentLabel}
                      </span>
                      <span className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">
                        {r.badge}
                      </span>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}

            {/* Third reason — dark tiltable card with capacity digit-roll */}
            <motion.div
              initial={reduce ? false : { opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <TiltCard className="bg-[#0F172A] rounded-sm p-6 cursor-default">
                <h3 className="font-display font-semibold text-[#F5F2EA] mb-2 leading-snug">
                  Early profiles carry more history
                </h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed mb-4">
                  Every event you attend, every club you follow, every application you submit becomes part of your campus record. Profiles created at the start of the semester are richer than those created in week ten.
                </p>

                {/* Urgency capacity stat */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-[0.625rem] text-[#F5F2EA] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1A3A2A] animate-pulse" aria-hidden="true" />
                    <DigitRoll target={89} suffix="%" reduce={reduce} /> avg event capacity filled
                  </span>
                  <span className="font-mono text-[0.5rem] text-[#6B7280] uppercase tracking-wider">
                    First 48 Hours
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
