import { useRef, useEffect } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import {
  GlobeHemisphereWest,
  Student,
  Megaphone,
  ShieldCheck,
  Check,
  X as XIcon,
} from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import SectionRule from '@/shared/components/SectionRule';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const ROLES = [
  {
    id: 'public',
    icon: GlobeHemisphereWest,
    label: 'Logged Out',
    sublabel: 'Anyone with the URL',
    color: '#9CA3AF',
    bg: '#F0EDE5',
  },
  {
    id: 'student',
    icon: Student,
    label: 'Student',
    sublabel: 'Verified college email',
    color: '#0F172A',
    bg: '#F5F2EA',
  },
  {
    id: 'organiser',
    icon: Megaphone,
    label: 'Organiser',
    sublabel: 'Approved club account',
    color: '#991B1B',
    bg: '#FEF2F2',
  },
  {
    id: 'admin',
    icon: ShieldCheck,
    label: 'Admin',
    sublabel: 'College administration',
    color: '#1A3A2A',
    bg: '#ECFDF5',
  },
];

const ROWS = [
  {
    action: 'Browse event listings',
    public: true,
    student: true,
    organiser: true,
    admin: true,
  },
  {
    action: 'View community pages',
    public: true,
    student: true,
    organiser: true,
    admin: true,
  },
  {
    action: 'View student profiles',
    public: false,
    student: true,
    organiser: true,
    admin: true,
  },
  {
    action: 'Register for events',
    public: false,
    student: true,
    organiser: false,
    admin: false,
  },
  {
    action: 'Follow communities and peers',
    public: false,
    student: true,
    organiser: false,
    admin: false,
  },
  {
    action: 'Search Buddies Directory',
    public: false,
    student: true,
    organiser: true,
    admin: true,
  },
  {
    action: 'Post events',
    public: false,
    student: false,
    organiser: true,
    admin: false,
  },
  {
    action: 'Run recruitment drives',
    public: false,
    student: false,
    organiser: true,
    admin: false,
  },
  {
    action: 'View organiser analytics',
    public: false,
    student: false,
    organiser: true,
    admin: true,
  },
  {
    action: 'Approve communities',
    public: false,
    student: false,
    organiser: false,
    admin: true,
  },
  {
    action: 'Oversight & reports',
    public: false,
    student: false,
    organiser: false,
    admin: true,
  },
];

function Cell({ value }) {
  return value ? (
    <td className="py-3 px-3 text-center">
      <span className="sr-only">Yes</span>
      <Check size={16} color="#1A3A2A" weight="bold" className="mx-auto" aria-hidden="true" />
    </td>
  ) : (
    <td className="py-3 px-3 text-center">
      <span className="sr-only">No</span>
      <XIcon size={14} color="#D8D2C4" weight="bold" className="mx-auto" aria-hidden="true" />
    </td>
  );
}

export default function AccessMatrixSection() {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const tableRef = useRef(null);
  const scanlineRef = useRef(null);
  const roleLabelRefs = useRef([]);

  useEffect(() => {
    if (reduce) return;
    const section = sectionRef.current;
    const table = tableRef.current;
    const scanline = scanlineRef.current;

    if (!section || !table || !scanline) return;

    const ctx = gsap.context(() => {
      // 1. Security scan line tied directly to scroll position via scrub: true
      gsap.fromTo(
        scanline,
        { top: '0%', opacity: 0.2 },
        {
          top: '100%',
          opacity: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: table,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        }
      );

      // 2. ScrambleText decode-in on role header labels (Logged Out / Student / Organiser / Admin)
      roleLabelRefs.current.forEach((el, index) => {
        if (!el) return;
        const role = ROLES[index];
        gsap.to(el, {
          duration: 1.1,
          delay: index * 0.12,
          scrambleText: {
            text: role.label,
            chars: '01█▓▒░|/\\[]{}',
            revealDelay: 0.15,
            speed: 0.6,
          },
          ease: 'none',
          scrollTrigger: {
            trigger: table,
            start: 'top 85%',
            once: true,
          },
        });
      });
    }, section);

    return () => ctx.revert();
  }, [reduce]);

  return (
    <section
      id="access"
      ref={sectionRef}
      className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden"
      aria-label="Trust, safety, and access model"
    >
      {/* Subtle background grid */}
      <div className="absolute inset-0 ledger-grid-dark pointer-events-none" aria-hidden="true" />

      <div className="page-container relative z-10">
        {/* Section label */}
        <SectionRule label="Trust & Access" dark={true} className="mb-10" />

        {/* Header with stamp */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-12">
          <div className="overflow-hidden">
            <motion.h2
              className="font-display font-bold text-[#F5F2EA] text-4xl sm:text-5xl tracking-tight leading-[1.08] mb-4"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            >
              Closed campus.<br />Clear boundaries.
            </motion.h2>
            <motion.p
              className="text-[#9CA3AF] leading-relaxed max-w-[46ch]"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              CampusCircle is not public. It is locked to one institution. Here is exactly what each role can see and do.
            </motion.p>
          </div>
          <div className="shrink-0">
            <span className="stamp-badge stamp-badge-rotated inline-block" style={{ borderColor: '#991B1B', color: '#991B1B' }}>
              Closed Campus Access
            </span>
          </div>
        </div>

        {/* Access Matrix Table — with scroll-scrubbed security scan line */}
        <motion.div
          ref={tableRef}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-x-auto relative"
        >
          {/* Glowing laser scanline — mapped to scroll progress via GSAP ScrollTrigger scrub */}
          {!reduce && (
            <div
              ref={scanlineRef}
              className="absolute left-0 right-0 h-[2px] bg-[#991B1B] pointer-events-none z-20 shadow-[0_0_14px_rgba(153,27,27,0.85)]"
              aria-hidden="true"
            />
          )}

          <table className="w-full min-w-[600px] border-collapse" aria-label="Access level matrix by role">
            <thead>
              <tr>
                <th scope="col" className="text-left py-3 px-3 font-mono text-[0.5625rem] text-[#6B7280] uppercase tracking-widest font-normal">
                  Capability
                </th>
                {ROLES.map((role, idx) => {
                  const Icon = role.icon;
                  return (
                    <th
                      key={role.id}
                      scope="col"
                      className="py-3 px-3 text-center"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-sm flex items-center justify-center"
                          style={{ backgroundColor: role.bg }}
                          aria-hidden="true"
                        >
                          <Icon size={15} color={role.color} weight="duotone" />
                        </div>
                        {/* Role label — GSAP ScrambleText decode-in */}
                        <span
                          ref={(el) => (roleLabelRefs.current[idx] = el)}
                          className="font-display font-semibold text-[#F5F2EA] text-xs leading-tight"
                        >
                          {role.label}
                        </span>
                        <span className="font-mono text-[0.5rem] text-[#6B7280] tracking-wide leading-tight text-center">
                          {role.sublabel}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
              {/* Divider */}
              <tr>
                <td colSpan={5} className="pt-0 pb-2">
                  <div className="h-px bg-[#D8D2C4]/20" />
                </td>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <motion.tr
                  key={row.action}
                  className={`border-b ${
                    i % 2 === 0 ? 'bg-[#1A2332]/30' : 'bg-transparent'
                  } border-[#D8D2C4]/10`}
                  initial={reduce ? false : { opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: i * 0.05, ease: 'easeOut' }}
                >
                  <td className="py-3 px-3 text-sm text-[#9CA3AF]">{row.action}</td>
                  <Cell value={row.public} />
                  <Cell value={row.student} />
                  <Cell value={row.organiser} />
                  <Cell value={row.admin} />
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Security facts */}
        <div className="mt-10 pt-8 border-t border-[#D8D2C4]/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            'Secured by Razorpay signature verification on all payments',
            'Passwords hashed with bcrypt, never stored in plain text',
            'Platform access restricted to verified college email domain',
          ].map((fact) => (
            <div key={fact} className="flex items-start gap-3">
              <ShieldCheck size={16} color="#1A3A2A" weight="fill" className="shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-[#6B7280] leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
