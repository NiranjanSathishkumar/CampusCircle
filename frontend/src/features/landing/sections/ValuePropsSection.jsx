import { useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(MorphSVGPlugin);

// ─── Hardcoded SVG path strings from @phosphor-icons/react (viewBox 0 0 256 256)
// Using real path `d` values so MorphSVG gets valid, compatible paths.
// Pairs: [duotone/regular resting state, fill/alternate hover state]
const PATHS = {
  // Lock regular → Lock fill (keyhole becomes solid)
  lock: {
    rest:  'M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z',
    hover: 'M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80,84a12,12,0,1,1,12-12A12,12,0,0,1,128,164Zm32-84H96V56a32,32,0,0,1,64,0Z',
  },
  // Ticket regular → Ticket fill (stub becomes solid)
  ticket: {
    rest:  'M232,104a8,8,0,0,0,8-8V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V96a8,8,0,0,0,8,8,24,24,0,0,1,0,48,8,8,0,0,0-8,8v32a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V160a8,8,0,0,0-8-8,24,24,0,0,1,0-48ZM32,167.2a40,40,0,0,0,0-78.4V64H88V192H32Zm192,0V192H104V64H224V88.8a40,40,0,0,0,0,78.4Z',
    hover: 'M232,104a8,8,0,0,0,8-8V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V96a8,8,0,0,0,8,8,24,24,0,0,1,0,48,8,8,0,0,0-8,8v32a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V160a8,8,0,0,0-8-8,24,24,0,0,1,0-48ZM32,167.2a40,40,0,0,0,0-78.4V64H88V192H32Z',
  },
  // UsersThree regular → UsersFour regular (group grows by one person)
  users: {
    rest:  'M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1,0-16,24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.85,8,57,57,0,0,0-98.15,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z',
    hover: 'M27.2,126.4a8,8,0,0,0,11.2-1.6,52,52,0,0,1,83.2,0,8,8,0,0,0,11.2,1.59,7.73,7.73,0,0,0,1.59-1.59h0a52,52,0,0,1,83.2,0,8,8,0,0,0,12.8-9.61A67.85,67.85,0,0,0,203,93.51a40,40,0,1,0-53.94,0,67.27,67.27,0,0,0-21,14.31,67.27,67.27,0,0,0-21-14.31,40,40,0,1,0-53.94,0A67.88,67.88,0,0,0,25.6,115.2,8,8,0,0,0,27.2,126.4ZM176,40a24,24,0,1,1-24,24A24,24,0,0,1,176,40ZM80,40A24,24,0,1,1,56,64,24,24,0,0,1,80,40ZM203,197.51a40,40,0,1,0-53.94,0,67.27,67.27,0,0,0-21,14.31,67.27,67.27,0,0,0-21-14.31,40,40,0,1,0-53.94,0A67.88,67.88,0,0,0,25.6,219.2a8,8,0,1,0,12.8,9.6,52,52,0,0,1,83.2,0,8,8,0,0,0,11.2,1.59,7.73,7.73,0,0,0,1.59-1.59h0a52,52,0,0,1,83.2,0,8,8,0,0,0,12.8-9.61A67.85,67.85,0,0,0,203,197.51ZM80,144a24,24,0,1,1-24,24A24,24,0,0,1,80,144Zm96,0a24,24,0,1,1-24,24A24,24,0,0,1,176,144Z',
  },
};

const PROPS = [
  {
    pathKey: 'lock',
    role: 'Student',
    title: 'One verified channel',
    body: "No cross-campus noise. Every community, event, and profile is locked to your college. You see exactly what's relevant — nothing else.",
    isHighlight: true,
  },
  {
    pathKey: 'ticket',
    role: 'Organiser',
    title: 'Register, pay, attend',
    body: 'Solo or team registration, Razorpay-secured payments, and a QR pass in your account. Attendance tracked automatically — no paper, no manual headcount.',
    isHighlight: false,
  },
  {
    pathKey: 'users',
    role: 'Community',
    title: 'Cross-branch networking',
    body: 'Find peers by branch, year, skill, or interest. Build a profile that shows who you actually are on campus, not just what you post on Instagram.',
    isHighlight: false,
  },
];

// ─── MorphSVG icon ────────────────────────────────────────────────────────────
// Renders a single <svg><path>. GSAP morphs the path `d` between rest ↔ hover.
// Callbacks are exposed via ref so the parent tile can trigger on tile hover.
function MorphIcon({ pathKey, color, morphRef, reduce }) {
  const pathRef = useRef(null);
  const paths = PATHS[pathKey];

  morphRef.current = {
    morphTo() {
      if (reduce || !pathRef.current) return;
      gsap.to(pathRef.current, {
        morphSVG: paths.hover,
        duration: 0.35,
        ease: 'power2.inOut',
      });
    },
    morphBack() {
      if (reduce || !pathRef.current) return;
      gsap.to(pathRef.current, {
        morphSVG: paths.rest,
        duration: 0.28,
        ease: 'power2.out',
      });
    },
  };

  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 256 256"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path ref={pathRef} d={paths.rest} />
    </svg>
  );
}

// ─── Single value prop tile ───────────────────────────────────────────────────
function ValueTile({ p, i, reduce }) {
  const morphRef = useRef({ morphTo: null, morphBack: null });

  const handleMouseEnter = useCallback(() => morphRef.current.morphTo?.(), []);
  const handleMouseLeave = useCallback(() => morphRef.current.morphBack?.(), []);

  const iconColor = p.isHighlight ? '#ffffff' : '#991B1B';

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.85, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
      className={`p-8 flex flex-col cursor-default ${p.isHighlight ? 'bg-[#991B1B]' : 'bg-[#1A2332]'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Role badge */}
      <div className="mb-6">
        <span
          className="font-mono text-[0.5625rem] font-bold uppercase tracking-widest px-2 py-1 rounded-sm"
          style={{
            color: p.isHighlight ? 'rgba(255,255,255,0.7)' : '#991B1B',
            backgroundColor: p.isHighlight ? 'rgba(255,255,255,0.15)' : 'rgba(153,27,27,0.12)',
          }}
        >
          {p.role}
        </span>
      </div>

      {/* Icon badge — MorphSVG morphs path on tile hover */}
      <motion.div
        className="w-11 h-11 rounded-sm flex items-center justify-center mb-5 shrink-0"
        style={{
          backgroundColor: p.isHighlight ? 'rgba(255,255,255,0.15)' : 'rgba(153,27,27,0.15)',
        }}
        initial={reduce ? false : { rotate: -15, scale: 0.6, opacity: 0 }}
        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{
          duration: 0.6,
          delay: i * 0.14 + 0.2,
          type: 'spring',
          stiffness: 200,
          damping: 16,
        }}
      >
        <MorphIcon
          pathKey={p.pathKey}
          color={iconColor}
          morphRef={morphRef}
          reduce={reduce}
        />
      </motion.div>

      <h3
        className="font-display font-bold text-xl mb-3 leading-snug"
        style={{ color: p.isHighlight ? '#fff' : '#F5F2EA' }}
      >
        {p.title}
      </h3>
      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: p.isHighlight ? 'rgba(255,255,255,0.78)' : '#9CA3AF' }}
      >
        {p.body}
      </p>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
import SectionRule from '@/shared/components/SectionRule';

export default function ValuePropsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="values"
      className="py-24 md:py-32 bg-[#0F172A] overflow-hidden"
      aria-label="Core value propositions"
    >
      <div className="page-container">
        {/* Header */}
        <div className="mb-14">
          <SectionRule label="Why it works" dark={true} className="mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 items-end">
            <motion.h2
              className="font-display font-bold text-[#F5F2EA] text-4xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.08]"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              One platform,<br />three roles served.
            </motion.h2>
            <motion.p
              className="text-[#9CA3AF] text-base leading-relaxed max-w-[44ch]"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              Students find events. Organisers run them with real data. Administration maintains a verified campus record — all in one closed ecosystem.
            </motion.p>
          </div>
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D8D2C4]/10">
          {PROPS.map((p, i) => (
            <ValueTile key={p.title} p={p} i={i} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}
