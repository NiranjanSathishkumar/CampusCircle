/**
 * Per-feature mockup visuals rendered inside the walkthrough panel.
 */
import { gsap } from 'gsap';
import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { ArrowRight, Check, Star } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   Visual mockup components
───────────────────────────────────────────────────────────────*/

export function DiscoverVisual() {
  const cards = [
    { title: 'Design Week Hackathon', club: 'GDSC SIES GST', date: 'Aug 22', seats: 14, hot: true },
    { title: 'Python Workshop Series', club: 'Coding Club', date: 'Aug 25', seats: 28, hot: false },
    { title: 'Photography Walk', club: 'Lens Society', date: 'Sep 1', seats: 8, hot: false },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {['Coding', 'Design', 'Photography'].map((t) => (
            <span key={t} className="font-mono text-[0.5rem] uppercase tracking-wider px-2 py-0.5 bg-[#991B1B]/10 border border-[#991B1B]/30 text-[#991B1B] rounded-sm">{t}</span>
          ))}
        </div>
        <span className="font-mono text-[0.5rem] text-[#9CA3AF] ml-auto uppercase tracking-wider">Filtered for you</span>
      </div>
      {cards.map((c) => (
        <div key={c.title} className="bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#0F172A] flex items-center justify-center shrink-0">
            <Star size={14} color="#991B1B" weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-display font-semibold text-[#0F172A] text-xs truncate">{c.title}</p>
              {c.hot && <span className="font-mono text-[0.45rem] uppercase tracking-wider px-1 py-0.5 bg-[#991B1B] text-white rounded-sm shrink-0">Hot</span>}
            </div>
            <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">{c.club} · {c.date}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-mono text-[0.5rem] text-[#991B1B] uppercase tracking-wider">{c.seats} seats</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EventsVisual() {
  return (
    <div className="bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm overflow-hidden">
      <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Event Registration</p>
          <p className="font-display font-bold text-[#F5F2EA] text-sm">Design Week Hackathon</p>
        </div>
        <span className="font-mono text-[0.5rem] text-[#991B1B] uppercase tracking-wider px-2 py-0.5 border border-[#991B1B]/40 rounded-sm">Aug 22</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider mb-2">Registration type</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="border-2 border-[#991B1B] rounded-sm p-2 text-center">
              <p className="font-display font-semibold text-[#0F172A] text-xs">Solo</p>
              <p className="font-mono text-[0.45rem] text-[#6B7280]">individual entry</p>
            </div>
            <div className="border border-[#D8D2C4] rounded-sm p-2 text-center opacity-60">
              <p className="font-display font-semibold text-[#0F172A] text-xs">Team</p>
              <p className="font-mono text-[0.45rem] text-[#6B7280]">up to 4 members</p>
            </div>
          </div>
        </div>
        <div className="pt-1 border-t border-[#D8D2C4]">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">Payment</p>
            <p className="font-mono text-[0.5rem] text-[#1A3A2A] uppercase tracking-wider">Razorpay secured</p>
          </div>
          <div className="bg-[#991B1B] text-white text-xs font-semibold rounded-sm py-2 text-center font-display">
            Register — ₹99
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── QR Visual with DrawSVG assembly animation ────────────────────────────────
// The three finder-square outlines are drawn via DrawSVG as stroked paths.
// Individual data-module cells stagger scale in after the outline draws.
// Fires on mount (= whenever the QR tab becomes active).

// QR finder square outline path (viewBox 56×56 sub-grid, 8px cells)
// Top-left, Top-right, Bottom-left finder patterns as a combined path
const FINDER_PATH = `
  M4,4 h48 v48 h-48 z
  M12,12 h32 v32 h-32 z
`.trim();

// Data module positions (col, row) in a 7×7 subgrid, scaled 8px each
// Simplified real-looking QR data pattern
const DATA_MODULES = [
  [1, 0], [3, 0], [5, 0],
  [0, 1], [2, 1], [4, 1], [6, 1],
  [1, 2], [4, 2],
  [0, 3], [2, 3], [3, 3], [6, 3],
  [1, 4], [5, 4], [6, 4],
  [0, 5], [3, 5], [4, 5],
  [2, 6], [4, 6], [6, 6],
];

export function QRVisual() {
  const svgRef = useRef(null);
  const finderRef = useRef(null);
  const cellRefs = useRef([]);

  useEffect(() => {
    const svg = svgRef.current;
    const finder = finderRef.current;
    const cells = cellRefs.current.filter(Boolean);
    if (!svg || !finder || !cells.length) return;

    // Reset to initial state
    gsap.set(finder, { drawSVG: '0%' });
    gsap.set(cells, { scale: 0, transformOrigin: '50% 50%' });

    const tl = gsap.timeline({ delay: 0.1 });

    // 1. DrawSVG traces the finder square outline
    tl.to(finder, {
      drawSVG: '100%',
      duration: 0.55,
      ease: 'power2.inOut',
    });

    // 2. Data modules pop in with a fast stagger
    tl.to(cells, {
      scale: 1,
      duration: 0.18,
      stagger: {
        amount: 0.35,
        from: 'random',
      },
      ease: 'back.out(2)',
    }, '-=0.1');

    return () => { tl.kill(); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="bg-[#0F172A] rounded-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b border-white/10">
          <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider mb-0.5">Digital Pass</p>
          <p className="font-display font-bold text-[#F5F2EA] text-sm">Design Week Hackathon</p>
          <p className="font-mono text-[0.5rem] text-[#991B1B] mt-0.5 uppercase tracking-wider">SIES GST · Aug 22, 2025</p>
        </div>
        <div className="p-4 flex items-center gap-4">
          {/* SVG QR code with DrawSVG + stagger-scale assembly */}
          <div className="w-16 h-16 bg-white rounded-sm p-1 shrink-0 overflow-hidden">
            <svg
              ref={svgRef}
              viewBox="0 0 64 64"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Finder square — drawn via DrawSVG */}
              <path
                ref={finderRef}
                d="M2,2 h60 v60 h-60 z M10,10 h16 v16 h-16 z M38,10 h16 v16 h-16 z M10,38 h16 v16 h-16 z"
                fill="none"
                stroke="#0F172A"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              {/* Finder square centers (static — always visible) */}
              <rect x="14" y="14" width="8" height="8" fill="#0F172A" rx="1" />
              <rect x="42" y="14" width="8" height="8" fill="#0F172A" rx="1" />
              <rect x="14" y="42" width="8" height="8" fill="#0F172A" rx="1" />
              {/* Data modules — stagger scale in */}
              {DATA_MODULES.map(([col, row], idx) => {
                // Place in the 64×64 grid, avoiding finder square areas
                const x = 28 + col * 5;
                const y = 28 + row * 5;
                return (
                  <rect
                    key={idx}
                    ref={(el) => { cellRefs.current[idx] = el; }}
                    x={x}
                    y={y}
                    width="3.5"
                    height="3.5"
                    fill="#0F172A"
                    rx="0.5"
                  />
                );
              })}
            </svg>
          </div>
          <div>
            <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider mb-1">Registrant</p>
            <p className="font-display font-semibold text-[#F5F2EA] text-xs">Aryan Mehta</p>
            <p className="font-mono text-[0.45rem] text-[#9CA3AF] mt-0.5">CS · Third Year</p>
            <div className="mt-2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#1A3A2A] animate-pulse" />
              <p className="font-mono text-[0.45rem] text-[#6B7280] uppercase tracking-wider">Single-scan enforced</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <Check size={12} color="#1A3A2A" weight="bold" />
        <p className="font-mono text-[0.5rem] text-[#6B7280] uppercase tracking-wider">Attendance logged automatically on scan</p>
      </div>
    </div>
  );
}

export function CommunitiesVisual() {
  const clubs = [
    { name: 'GDSC SIES GST', members: 142, events: 8, verified: true, tag: 'Tech' },
    { name: 'Lens Society', members: 67, events: 4, verified: true, tag: 'Photography' },
    { name: 'Debate Club', members: 89, events: 6, verified: true, tag: 'Debate' },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center mb-3">
        <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">Verified Communities</p>
        <span className="ml-auto font-mono text-[0.5rem] text-[#1A3A2A] uppercase tracking-wider">Admin approved</span>
      </div>
      {clubs.map((c) => (
        <div key={c.name} className="bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#0F172A] flex items-center justify-center shrink-0 font-display font-bold text-[#F5F2EA] text-xs">
            {c.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-display font-semibold text-[#0F172A] text-xs truncate">{c.name}</p>
              {c.verified && <div className="w-3 h-3 rounded-full bg-[#1A3A2A] flex items-center justify-center shrink-0"><Check size={7} color="white" weight="bold" /></div>}
            </div>
            <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider">{c.members} members · {c.events} events</p>
          </div>
          <span className="font-mono text-[0.45rem] uppercase tracking-wider px-1.5 py-0.5 bg-[#0F172A]/5 border border-[#D8D2C4] text-[#6B7280] rounded-sm shrink-0">{c.tag}</span>
        </div>
      ))}
    </div>
  );
}

export function RecruitmentVisual() {
  return (
    <div className="space-y-3">
      <div className="bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm overflow-hidden">
        <div className="bg-[#0F172A] px-4 py-2.5 flex items-center justify-between">
          <p className="font-display font-bold text-[#F5F2EA] text-xs">Open Positions — GDSC SIES GST</p>
          <span className="font-mono text-[0.45rem] text-[#991B1B] uppercase tracking-wider">3 open</span>
        </div>
        <div className="divide-y divide-[#D8D2C4]">
          {[
            { role: 'Frontend Developer', skills: 'React, CSS', apps: 7 },
            { role: 'Design Lead', skills: 'Figma, UI/UX', apps: 12 },
            { role: 'Social Media', skills: 'Content, Canva', apps: 5 },
          ].map((r) => (
            <div key={r.role} className="px-4 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-[#0F172A] text-xs">{r.role}</p>
                <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider mt-0.5">{r.skills}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[0.45rem] text-[#6B7280] uppercase tracking-wider">{r.apps} applied</p>
                <div className="mt-1 text-[0.45rem] font-mono text-[#991B1B] uppercase tracking-wider cursor-pointer hover:underline">Apply →</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 px-1">
        <Check size={12} color="#1A3A2A" weight="bold" />
        <p className="font-mono text-[0.5rem] text-[#6B7280] uppercase tracking-wider">No DMs. Structured applications only.</p>
      </div>
    </div>
  );
}

export function BuddiesVisual() {
  const peers = [
    { initials: 'AM', name: 'Aryan Mehta', branch: 'CS · Third Year', skills: ['React', 'ML'] },
    { initials: 'PS', name: 'Priya Shah', branch: 'EXTC · Second Year', skills: ['Python', 'Design'] },
    { initials: 'RK', name: 'Rahul Kadam', branch: 'Mech · Fourth Year', skills: ['CAD', 'Arduino'] },
  ];
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 mb-3 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm px-3 py-2">
        <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider flex-1">Search peers by branch, year, skill…</p>
        <ArrowRight size={12} color="#9CA3AF" />
      </div>
      {peers.map((p) => (
        <div key={p.name} className="bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#D8D2C4] flex items-center justify-center shrink-0 font-display font-bold text-sm text-[#6B7280]">
            {p.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-[#0F172A] text-xs mb-0.5">{p.name}</p>
            <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider mb-1">{p.branch}</p>
            <div className="flex gap-1 flex-wrap">
              {p.skills.map((s) => (
                <span key={s} className="font-mono text-[0.4rem] uppercase tracking-wider px-1 py-0.5 bg-[#0F172A]/5 border border-[#D8D2C4] text-[#6B7280] rounded-sm">{s}</span>
              ))}
            </div>
          </div>
          <span className="font-mono text-[0.45rem] text-[#991B1B] uppercase tracking-wider shrink-0 cursor-pointer">Follow</span>
        </div>
      ))}
    </div>
  );
}

// ─── Digit-roll counter ────────────────────────────────────────────────────────
// Uses GSAP number tweening: gsap.to({ val: 0 }, { val: target, onUpdate })
// Fires on mount — so it replays every time the analytics tab is opened.
function CounterStat({ target, suffix = '', label, reduce }) {
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
      duration: 1.6,
      delay: 0.2,
      ease: 'power2.out',
      onUpdate() {
        el.textContent = `${Math.round(obj.val)}${suffix}`;
      },
    });

    return () => { tween.kill(); };
  }, [target, suffix, reduce]);

  return (
    <div className="text-center">
      <p
        ref={numRef}
        className="font-display font-bold text-[#0F172A] text-lg leading-none"
        aria-label={`${target}${suffix} ${label}`}
      >
        0{suffix}
      </p>
      <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

export function AnalyticsVisual({ reduce }) {
  const bars = [
    { label: 'CS', value: 78, pct: 100 },
    { label: 'EXTC', value: 42, pct: 54 },
    { label: 'Mech', value: 35, pct: 45 },
    { label: 'Civil', value: 18, pct: 23 },
    { label: 'IT', value: 55, pct: 71 },
  ];
  return (
    <div className="bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm overflow-hidden">
      <div className="bg-[#0F172A] px-4 py-3 flex items-center justify-between">
        <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">Organiser Dashboard</p>
        <p className="font-mono text-[0.5rem] text-[#991B1B] uppercase tracking-wider">Design Week Hackathon</p>
      </div>
      <div className="p-4">
        {/* Digit-roll stat counters */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <CounterStat target={128} label="Registered" reduce={reduce} />
          <CounterStat target={114} label="Attended" reduce={reduce} />
          <CounterStat target={89} suffix="%" label="Attendance rate" reduce={reduce} />
        </div>
        <div className="border-t border-[#D8D2C4] pt-3">
          <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider mb-2">By branch</p>
          <div className="space-y-1.5">
            {bars.map((b) => (
              <div key={b.label} className="flex items-center gap-2">
                <p className="font-mono text-[0.45rem] text-[#6B7280] w-6 uppercase">{b.label}</p>
                <div className="flex-1 bg-[#D8D2C4]/40 rounded-full h-1.5">
                  <motion.div
                    className="bg-[#991B1B] h-1.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${b.pct}%` }}
                    transition={{ duration: 0.7, delay: bars.indexOf(b) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <p className="font-mono text-[0.45rem] text-[#0F172A] w-5 text-right">{b.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationsVisual() {
  const notifs = [
    { type: 'event', title: 'Registration opens — Python Workshop', sub: 'Coding Club · In 2 hours', unread: true },
    { type: 'app', title: 'Application shortlisted', sub: 'Frontend Dev · GDSC SIES GST', unread: true },
    { type: 'confirm', title: 'Registration confirmed', sub: 'Design Week Hackathon · QR ready', unread: false },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center mb-3">
        <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider">Notifications</p>
        <span className="ml-auto font-mono text-[0.5rem] px-1.5 py-0.5 bg-[#991B1B] text-white rounded-sm uppercase tracking-wider">2 new</span>
      </div>
      {notifs.map((n) => (
        <div key={n.title} className={`border rounded-sm p-3 flex items-start gap-3 ${n.unread ? 'bg-[#FEF2F2] border-[#991B1B]/20' : 'bg-[#F5F2EA] border-[#D8D2C4]'}`}>
          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${n.unread ? 'bg-[#991B1B]' : 'bg-[#D8D2C4]'}`} />
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-[#0F172A] text-xs leading-snug mb-0.5">{n.title}</p>
            <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider">{n.sub}</p>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 px-1 pt-1">
        <Check size={12} color="#1A3A2A" weight="bold" />
        <p className="font-mono text-[0.5rem] text-[#6B7280] uppercase tracking-wider">Only from communities you follow</p>
      </div>
    </div>
  );
}
