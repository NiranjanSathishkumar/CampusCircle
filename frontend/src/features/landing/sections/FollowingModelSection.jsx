import { useRef, useEffect } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import { User, Buildings } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

import SectionRule from '@/shared/components/SectionRule';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

// ─── Connector Arrow with DrawSVG + MotionPath Traveling Dot ────────────────
function FollowConnector({ label, reduce, pathId }) {
  const containerRef = useRef(null);
  const pathRef      = useRef(null);
  const headRef      = useRef(null);
  const dotRef       = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const path      = pathRef.current;
    const head      = headRef.current;
    const dot       = dotRef.current;

    if (!container || !path || !head || !dot) return;

    if (reduce) {
      gsap.set(path, { drawSVG: '100%' });
      gsap.set(head, { opacity: 1, scale: 1 });
      gsap.set(dot, { opacity: 0 });
      return;
    }

    // Initial hidden state
    gsap.set(path, { drawSVG: '0%' });
    gsap.set(head, { opacity: 0, scale: 0.4, transformOrigin: 'center' });
    gsap.set(dot, { opacity: 0 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          once: true,
        },
      });

      // 1. DrawSVG draws the connection vector line
      tl.to(path, {
        drawSVG: '100%',
        duration: 0.75,
        ease: 'power2.out',
      });

      // 2. Arrowhead pops in at the tip
      tl.to(
        head,
        {
          opacity: 1,
          scale: 1,
          duration: 0.25,
          ease: 'back.out(1.8)',
        },
        '-=0.15'
      );

      // 3. MotionPath sends the pulse dot traveling along the follow arrow endlessly
      tl.add(() => {
        gsap.set(dot, { opacity: 1 });
        gsap.to(dot, {
          motionPath: {
            path: path,
            align: path,
            alignOrigin: [0.5, 0.5],
          },
          duration: 1.6,
          repeat: -1,
          ease: 'power1.inOut',
        });
      });
    }, container);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col items-center justify-center relative min-w-[90px] sm:min-w-[130px] px-1">
      <span className="font-mono text-[0.5625rem] text-[#991B1B] uppercase tracking-wider mb-1 z-10 font-bold bg-[#F0EDE5] px-1 rounded-xs select-none">
        {label}
      </span>
      <div className="w-full h-7 relative flex items-center justify-center">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 140 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Subtle dashed guide line */}
          <path
            d="M 6 12 H 126"
            fill="none"
            stroke="#D8D2C4"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* DrawSVG animated path */}
          <path
            ref={pathRef}
            id={pathId}
            d="M 6 12 H 126"
            fill="none"
            stroke="#991B1B"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Arrowhead marker */}
          <polygon
            ref={headRef}
            points="125,6 137,12 125,18"
            fill="#991B1B"
          />

          {/* Traveling dot along MotionPath */}
          <circle
            ref={dotRef}
            r="3.5"
            fill="#991B1B"
          />
        </svg>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function FollowingModelSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="following"
      className="py-20 md:py-24 bg-[#F5F2EA] border-t border-[#D8D2C4]"
      aria-label="One-directional following model"
    >
      <div className="page-container">
        {/* Section label */}
        <SectionRule label="Following model" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-center">

          {/* Left: Diagram with DrawSVG + MotionPath */}
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
            aria-label="Following model diagram"
          >
            <div className="bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-8 shadow-xs">
              <p className="font-mono text-[0.5625rem] text-[#9CA3AF] uppercase tracking-widest mb-6">
                One-Directional Vector Flow
              </p>
              <div className="space-y-6">
                {[0, 1].map((i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 sm:gap-3"
                    initial={reduce ? false : { opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Source: You */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm shrink-0 min-w-[100px] sm:min-w-[110px]">
                      <User size={15} color="#0F172A" weight="fill" aria-hidden="true" />
                      <span className="text-sm font-semibold text-[#0F172A]">You</span>
                    </div>

                    {/* GSAP DrawSVG + MotionPath Connector */}
                    <FollowConnector
                      label="follow"
                      reduce={reduce}
                      pathId={`follow-path-${i}`}
                    />

                    {/* Destination: Club or Peer */}
                    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-sm shrink-0 min-w-[120px] sm:min-w-[130px] ${
                      i === 0
                        ? 'bg-[#0F172A]'
                        : 'bg-[#F5F2EA] border border-[#D8D2C4]'
                    }`}>
                      {i === 0
                        ? <Buildings size={15} color="#F5F2EA" weight="fill" aria-hidden="true" />
                        : <User size={15} color="#0F172A" weight="fill" aria-hidden="true" />
                      }
                      <span className={`text-sm font-semibold ${i === 0 ? 'text-[#F5F2EA]' : 'text-[#0F172A]'}`}>
                        {i === 0 ? 'Any club' : 'Any peer'}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* No mutual required footer */}
                <motion.div
                  className="pt-5 border-t border-[#D8D2C4]"
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#ECFDF5] border border-[#1A3A2A]/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#1A3A2A] text-xs font-bold" aria-hidden="true">+</span>
                    </div>
                    <p className="text-sm text-[#6B7280]">
                      No approval needed. No mutual follow required. One-directional, zero friction.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Right: Copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <div className="overflow-hidden mb-5">
              <motion.h2
                className="font-display font-bold text-[#0F172A] text-4xl sm:text-5xl tracking-tight leading-[1.08]"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              >
                Follow communities<br />and peers. No approval.
              </motion.h2>
            </div>
            <p className="text-[#6B7280] leading-relaxed mb-4">
              Following on CampusCircle is one-directional. You follow a club or a classmate; they do not need to accept. Their public events and posts appear in your feed.
            </p>
            <p className="text-[#6B7280] leading-relaxed">
              The result is a campus network that grows without social friction — no anxiety of waiting for approval.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
