import { useRef, useEffect } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

import SectionRule from '@/shared/components/SectionRule';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const ROWS = [
  {
    feature: 'Campus-only access',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'Verified communities',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'Event registration + payment',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'QR attendance tracking',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'Team registration',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'Organiser analytics',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'Structured recruitment drives',
    cc: true,
    wa: false,
    social: null,
  },
  {
    feature: 'Cross-branch peer search',
    cc: true,
    wa: false,
    social: null,
  },
  {
    feature: 'Single sign-in for all campus activity',
    cc: true,
    wa: false,
    social: false,
  },
  {
    feature: 'No general public access',
    cc: true,
    wa: false,
    social: false,
  },
];

// ─── Vector Check/X/Minus icons for GSAP DrawSVG ───────────────────────────
function VectorCheck({ isCC }) {
  return (
    <svg width={18} height={18} viewBox="0 0 20 20" fill="none" className="mx-auto" aria-label="Yes">
      <path
        d="M 4 10.5 L 8.5 15 L 16 5"
        stroke={isCC ? '#991B1B' : '#1A3A2A'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VectorX() {
  return (
    <svg width={16} height={16} viewBox="0 0 20 20" fill="none" className="mx-auto" aria-label="No">
      <path
        d="M 5 5 L 15 15 M 15 5 L 5 15"
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VectorMinus() {
  return (
    <svg width={16} height={16} viewBox="0 0 20 20" fill="none" className="mx-auto" aria-label="Partial">
      <path
        d="M 5 10 H 15"
        stroke="#D8D2C4"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CellIcon({ value, isCC }) {
  if (value === true) {
    return <VectorCheck isCC={isCC} />;
  }
  if (value === false) {
    return <VectorX />;
  }
  return <VectorMinus />;
}

export default function ComparisonSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const rowRefs    = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (reduce) {
      const paths = section.querySelectorAll('path');
      gsap.set(paths, { drawSVG: '100%' });
      return;
    }

    const ctx = gsap.context(() => {
      rowRefs.current.forEach((tr) => {
        if (!tr) return;
        const paths = tr.querySelectorAll('path');
        if (!paths.length) return;

        // DrawSVG draws the row's check/X marks stroke-by-stroke as it scrolls into view
        gsap.fromTo(
          paths,
          { drawSVG: '0%' },
          {
            drawSVG: '100%',
            duration: 0.45,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: tr,
              start: 'top 85%',
              once: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      id="comparison"
      ref={sectionRef}
      className="py-20 md:py-28 bg-[#F5F2EA]"
      aria-label="CampusCircle vs WhatsApp vs generic social"
    >
      <div className="page-container">
        {/* Section label */}
        <SectionRule label="vs the alternatives" className="mb-10" />

        {/* Header */}
        <div className="mb-12">
          <motion.h2
            className="font-display font-bold text-[#0F172A] text-4xl sm:text-5xl tracking-tight leading-[1.08] mb-4"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            Why not just use WhatsApp?
          </motion.h2>
          <motion.p
            className="text-[#6B7280] leading-relaxed max-w-[60ch]"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            WhatsApp solves messaging. Generic social networks solve personal presence. Neither was built for organised campus life.
          </motion.p>
        </div>

        {/* Comparison table */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-x-auto"
        >
          <table
            className="w-full min-w-[520px] border-collapse"
            aria-label="Comparison: CampusCircle vs WhatsApp vs generic social"
          >
            <thead>
              <tr>
                <th scope="col" className="text-left pb-4 pr-4 font-mono text-[0.5625rem] text-[#9CA3AF] uppercase tracking-widest font-normal w-[40%]">
                  Capability
                </th>
                {/* CC column — clean dark pill */}
                <th scope="col" className="pb-4 px-4 text-center">
                  <div className="inline-flex flex-col items-center gap-1.5">
                    <div className="px-4 py-2 bg-[#0F172A] rounded-sm">
                      <span className="font-display font-bold text-[#F5F2EA] text-sm">CampusCircle</span>
                    </div>
                    <span className="font-mono text-[0.45rem] text-[#991B1B] uppercase tracking-widest border border-[#991B1B]/40 px-1.5 py-0.5 rounded-sm">Verified</span>
                  </div>
                </th>
                <th scope="col" className="pb-4 px-4 text-center">
                  <div className="px-4 py-2 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm inline-block">
                    <span className="font-display font-bold text-[#0F172A] text-sm">WhatsApp</span>
                  </div>
                </th>
                <th scope="col" className="pb-4 px-4 text-center">
                  <div className="px-4 py-2 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm inline-block">
                    <span className="font-display font-bold text-[#0F172A] text-sm">Generic Social</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  ref={(el) => (rowRefs.current[i] = el)}
                  className={`border-b ${
                    i % 2 === 0 ? 'bg-[#F0EDE5]/50' : 'bg-transparent'
                  } border-[#D8D2C4]/60`}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: 'easeOut' }}
                >
                  <td className="py-3 pr-4 text-sm text-[#6B7280]">{row.feature}</td>
                  <td className="py-3 px-4 bg-[#0F172A]/5">
                    <CellIcon value={row.cc} isCC={true} />
                  </td>
                  <td className="py-3 px-4">
                    <CellIcon value={row.wa} isCC={false} />
                  </td>
                  <td className="py-3 px-4">
                    <CellIcon value={row.social} isCC={false} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <VectorCheck isCC={false} />
            <span className="text-xs text-[#9CA3AF]">Yes</span>
          </div>
          <div className="flex items-center gap-2">
            <VectorX />
            <span className="text-xs text-[#9CA3AF]">No</span>
          </div>
          <div className="flex items-center gap-2">
            <VectorMinus />
            <span className="text-xs text-[#9CA3AF]">Partial / varies</span>
          </div>
        </div>
      </div>
    </section>
  );
}
