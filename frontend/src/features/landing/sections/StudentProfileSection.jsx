import { useRef } from 'react';
import { useReducedMotion, motion } from 'motion/react';
import { GithubLogo, LinkedinLogo, InstagramLogo, Warning, Check } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import SectionRule from '@/shared/components/SectionRule';

const SAMPLE_PROFILE = {
  name: 'Aryan Mehta',
  branch: 'Computer Science Engineering',
  year: 'Third Year',
  uid: 'SIESGST/CS/2022/047',
  skills: ['React', 'Python', 'Machine Learning', 'UI Design'],
  bio: 'Building things at the intersection of software and human behaviour. Exploring ML pipelines and accessible UI.',
  achievements: [
    'First place, Internal Hackathon 2024',
    'Google Developer Student Club lead',
    "Open-source contributor to local NGO's platform",
  ],
  socials: { github: '#', linkedin: '#', instagram: '#' },
};

/* ─── Inline QR grid (static — for the back face) ───────────────────────────
   A 7×7 finder-pattern grid using a simple pattern array (1 = dark cell).
   No DrawSVG here — back face is static; motion is purely in the flip. */
const QR_PATTERN = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1],
];

function QRGrid() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${QR_PATTERN[0].length}, 1fr)`,
        gap: '1px',
        width: 76,
        height: 76,
      }}
      aria-hidden="true"
    >
      {QR_PATTERN.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              backgroundColor: cell ? '#F5F2EA' : 'transparent',
              borderRadius: 0.5,
            }}
          />
        ))
      )}
    </div>
  );
}

/* ─── Card front face ─────────────────────────────────────────────────────── */
function CardFront() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        borderRadius: 4,
        overflow: 'hidden',
      }}
      className="form-panel"
    >
      {/* Header */}
      <div className="bg-[#0F172A] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.5625rem] text-[#9CA3AF] uppercase tracking-widest mb-0.5">
            Student Profile
          </p>
          <p className="font-mono text-[0.6875rem] text-[#991B1B] uppercase tracking-wide">
            CampusCircle · SIES GST
          </p>
        </div>
        {/* Seal */}
        <div className="w-8 h-8 rounded-full border-2 border-[#991B1B]/50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#991B1B]/60" />
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Identity */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-sm bg-[#D8D2C4] flex items-center justify-center shrink-0 font-display font-bold text-2xl text-[#9CA3AF]"
            aria-label="Profile photo placeholder"
          >
            AM
          </div>
          <div>
            <h3 className="font-display font-bold text-[#0F172A] text-xl leading-tight">
              {SAMPLE_PROFILE.name}
            </h3>
            <p className="text-sm text-[#6B7280]">{SAMPLE_PROFILE.branch}</p>
            <p className="font-mono text-[0.625rem] text-[#991B1B] uppercase tracking-wider mt-1">
              {SAMPLE_PROFILE.year}
            </p>
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-[#6B7280] leading-relaxed mb-4 pb-4 border-b border-[#D8D2C4]">
          {SAMPLE_PROFILE.bio}
        </p>

        {/* Skills */}
        <div className="mb-4">
          <p className="font-mono text-[0.5625rem] text-[#9CA3AF] uppercase tracking-widest mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_PROFILE.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-xs font-medium bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-[#0F172A]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-4">
          <p className="font-mono text-[0.5625rem] text-[#9CA3AF] uppercase tracking-widest mb-2">
            Achievements <span className="text-[#B45309]">(self-reported)</span>
          </p>
          <ul className="space-y-1">
            {SAMPLE_PROFILE.achievements.map((a) => (
              <li key={a} className="text-xs text-[#6B7280] flex items-start gap-2">
                <span className="text-[#B45309] mt-0.5">*</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Social links */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#D8D2C4]">
          <p className="font-mono text-[0.5625rem] text-[#9CA3AF] uppercase tracking-widest">Links</p>
          <div className="flex gap-3">
            <a href={SAMPLE_PROFILE.socials.github} aria-label="GitHub profile" className="text-[#6B7280] hover:text-[#0F172A] transition-colors">
              <GithubLogo size={16} weight="fill" />
            </a>
            <a href={SAMPLE_PROFILE.socials.linkedin} aria-label="LinkedIn profile" className="text-[#6B7280] hover:text-[#0F172A] transition-colors">
              <LinkedinLogo size={16} weight="fill" />
            </a>
            <a href={SAMPLE_PROFILE.socials.instagram} aria-label="Instagram profile" className="text-[#6B7280] hover:text-[#0F172A] transition-colors">
              <InstagramLogo size={16} weight="fill" />
            </a>
          </div>
        </div>
      </div>

      {/* Hover hint — fades out as soon as you know */}
      <div
        className="absolute bottom-2 left-0 right-0 text-center pointer-events-none"
        aria-hidden="true"
      >
        <span className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-widest opacity-60">
          Hover to flip ↻
        </span>
      </div>
    </div>
  );
}

/* ─── Card back face ──────────────────────────────────────────────────────── */
// Dark verification face: campus seal, QR code, VERIFIED STUDENT stamp, UID,
// and a CSS shimmer gradient that simulates holographic laminate.
function CardBack() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg)',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#0F172A',
      }}
    >
      {/* Holographic shimmer overlay */}
      <div
        className="card-back-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background:
            'linear-gradient(105deg, transparent 30%, rgba(153,27,27,0.07) 45%, rgba(255,255,255,0.06) 50%, rgba(26,58,42,0.07) 55%, transparent 70%)',
          backgroundSize: '200% 200%',
          animation: 'shimmerSlide 3.5s ease-in-out infinite',
        }}
        aria-hidden="true"
      />

      {/* Large watermark seal */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -32,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '12px solid rgba(153,27,27,0.08)',
          opacity: 0.6,
          zIndex: 0,
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -14,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 144,
          height: 144,
          borderRadius: '50%',
          border: '6px solid rgba(153,27,27,0.06)',
          opacity: 0.6,
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, padding: '1.25rem' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-widest mb-0.5">
              CampusCircle — SIES GST
            </p>
            <p className="font-mono text-[0.45rem] text-[#6B7280] uppercase tracking-wider">
              Digital Student ID · 2024–25
            </p>
          </div>
          {/* Mini seal */}
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(153,27,27,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'rgba(153,27,27,0.6)' }} />
          </div>
        </div>

        {/* Main content: QR + identity side by side */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
          {/* QR code */}
          <div style={{ backgroundColor: '#F5F2EA', padding: 6, borderRadius: 4, flexShrink: 0 }}>
            <QRGrid />
          </div>

          {/* Identity block */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="font-display font-bold text-[#F5F2EA] text-base leading-tight mb-1">
              {SAMPLE_PROFILE.name}
            </p>
            <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider mb-2">
              {SAMPLE_PROFILE.branch}
            </p>
            <p className="font-mono text-[0.5rem] text-[#991B1B] uppercase tracking-wider mb-3">
              {SAMPLE_PROFILE.year}
            </p>

            {/* UID */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3, padding: '0.4rem 0.6rem', marginBottom: '0.75rem' }}>
              <p className="font-mono text-[0.42rem] text-[#6B7280] uppercase tracking-widest mb-0.5">Student UID</p>
              <p className="font-mono text-[0.5rem] text-[#F5F2EA] tracking-wider">{SAMPLE_PROFILE.uid}</p>
            </div>

            {/* Verified badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#1A3A2A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={8} color="white" weight="bold" />
              </div>
              <p className="font-mono text-[0.45rem] text-[#6B7280] uppercase tracking-wider">
                Campus-verified account
              </p>
            </div>
          </div>
        </div>

        {/* VERIFIED STUDENT stamp */}
        <div style={{
          border: '2px solid rgba(153,27,27,0.6)',
          borderRadius: 3,
          padding: '0.4rem 0.75rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          transform: 'rotate(-1.5deg)',
          marginBottom: '0.75rem',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#991B1B' }} />
          <p className="font-mono text-[0.55rem] text-[#991B1B] uppercase tracking-[0.18em] font-bold">
            Verified Student
          </p>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#991B1B' }} />
        </div>

        {/* Bottom disclaimer */}
        <p className="font-mono text-[0.42rem] text-[#6B7280] uppercase tracking-wider leading-relaxed" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.6rem' }}>
          This ID is issued for campus use only. Single-college, closed-access platform. Not for external verification.
        </p>
      </div>
    </div>
  );
}

/* ─── The flipping ID card ────────────────────────────────────────────────── */
// GSAP drives the Y-rotation on the inner container.
// Front: rotateY(0)   — visible
// Back:  rotateY(180) — initially hidden (backface-visibility: hidden on both faces)
// Flip in:  rotateY → -180 (power3.inOut)
// Flip out: spring back to 0 with tiny elastic overshoot (physical card settling)
function FlipCard({ reduce }) {
  const innerRef = useRef(null);
  const flipTween = useRef(null);
  const isFlipped = useRef(false);

  const handleEnter = () => {
    if (reduce) return;
    flipTween.current?.kill();
    isFlipped.current = true;
    flipTween.current = gsap.to(innerRef.current, {
      rotateY: -180,
      duration: 0.62,
      ease: 'power3.inOut',
    });
  };

  const handleLeave = () => {
    if (reduce) return;
    flipTween.current?.kill();
    isFlipped.current = false;
    flipTween.current = gsap.to(innerRef.current, {
      rotateY: 0,
      duration: 0.72,
      ease: 'elastic.out(0.75, 0.55)',
    });
  };

  // Touch: tap to toggle flip
  const handleClick = () => {
    if (reduce) return;
    if (isFlipped.current) handleLeave();
    else handleEnter();
  };

  return (
    <div
      style={{ perspective: '900px', perspectiveOrigin: '50% 40%' }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      aria-label="Student ID card. Hover or press Enter to flip and see verification."
    >
      <div
        ref={innerRef}
        style={{
          position: 'relative',
          // Card aspect ratio — slightly taller than wide, like a real ID
          height: 520,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        <CardFront />
        <CardBack />
      </div>
    </div>
  );
}

/* ─── Section ─────────────────────────────────────────────────────────────── */
export default function StudentProfileSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="profiles"
      className="py-20 md:py-28 bg-[#F0EDE5]"
      aria-label="Student discovery and profiles"
    >
      {/* Shimmer keyframe — injected once */}
      <style>{`
        @keyframes shimmerSlide {
          0%   { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }
      `}</style>

      <div className="page-container">
        {/* Section label */}
        <SectionRule label="Student profiles" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-20 items-start">
          {/* LEFT: copy */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
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
                A profile that shows<br />who you are on campus.
              </motion.h2>
            </div>
            <p className="text-[#6B7280] leading-relaxed mb-5">
              Not a social media bio. An academic identity: your branch, year, skills, and what you've worked on — all in a verified-campus context.
            </p>
            <p className="text-[#6B7280] leading-relaxed mb-8">
              Link your GitHub, LinkedIn, and Instagram. List achievements. Follow peers without waiting for them to follow back.
            </p>

            {/* Achievement disclaimer */}
            <div className="flex gap-3 p-4 bg-[#FFFBEB] border border-[#B45309]/30 rounded-sm">
              <Warning size={18} color="#B45309" weight="fill" className="shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[#B45309] mb-1">
                  Self-reported achievements
                </p>
                <p className="text-sm text-[#6B7280] leading-relaxed">
                  Achievements on profiles are self-reported and not verified by CampusCircle or the college. They represent what students choose to share, not an official academic record.
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: 3D flip ID card */}
          <motion.div
            initial={reduce ? false : { opacity: 0, x: 28, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, delay: 0.15, type: 'spring', stiffness: 110, damping: 18 }}
          >
            <FlipCard reduce={reduce} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
