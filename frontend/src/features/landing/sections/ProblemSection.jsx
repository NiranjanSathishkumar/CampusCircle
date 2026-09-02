import { useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ChatCircleDots, Megaphone, ChartBar } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const PROBLEMS = [
  {
    num: '01',
    icon: ChatCircleDots,
    label: 'The group you never find',
    body: 'Fourteen WhatsApp groups, three Telegram channels, a Discord server nobody checks. Every announcement gets buried in three days. You miss registration because the message came Tuesday and you joined Thursday.',
    accent: '#991B1B',
    accentBg: 'rgba(153,27,27,0.06)',
  },
  {
    num: '02',
    icon: Megaphone,
    label: 'Paper posters on pillars',
    body: 'Club notice boards fill up by Monday. Half the posters are torn by Wednesday. Events happen without you knowing — organisers spend more time printing than recruiting, with no headcount until the day itself.',
    accent: '#B45309',
    accentBg: 'rgba(180,83,9,0.06)',
  },
  {
    num: '03',
    icon: ChartBar,
    label: 'Zero data for organisers',
    body: 'Who came to your last event? Which branches showed interest? How many left the waitlist? Organisers run blind, repeating what worked by guesswork, with no record of attendance, interest, or growth.',
    accent: '#1A3A2A',
    accentBg: 'rgba(26,58,42,0.06)',
  },
];

// ─── Individual problem tile ──────────────────────────────────────────────────
// Isolated component so each tile gets its own useEffect + ScrollTrigger scope.
// This avoids re-splitting already-split text when the parent re-renders.
function ProblemTile({ p, i, reduce }) {
  const tileRef   = useRef(null);
  const numRef    = useRef(null);
  const bodyRef   = useRef(null);
  const Icon = p.icon;

  useEffect(() => {
    const tile = tileRef.current;
    const num  = numRef.current;
    const body = bodyRef.current;
    if (!tile || !num || !body || reduce) return;

    // SplitText splits body copy into lines. We MUST call revert() on cleanup
    // to restore the original DOM so React can reconcile on re-renders.
    const split = new SplitText(body, {
      type: 'lines',
      // Wrap each line in a div with overflow:hidden so the y-translate is clipped
      linesClass: 'split-line-wrap',
    });

    // Set overflow:hidden on every line wrapper so out-of-range lines are clipped
    split.lines.forEach((line) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Timeline scrubbed to scroll position — both numeral and lines driven together
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: tile,
        // Enter: card top hits 85% of viewport height
        // Exit: card top hits 15% of viewport height (well into view)
        start: 'top 85%',
        end: 'top 15%',
        scrub: 1.2, // lag (seconds) makes the scrub buttery, not snappy
      },
    });

    // 1. Numeral opacity: 0.08 → 1 (full reveal as card scrolls into center view)
    tl.fromTo(
      num,
      { opacity: 0.08 },
      { opacity: 1, ease: 'none', duration: 1 },
      0,
    );

    // 2. Body lines stagger in — each line slides up from 18px and fades in.
    //    stagger is expressed as a fraction of the total timeline duration (0→1)
    //    so all lines land before the trigger's end point.
    tl.fromTo(
      split.lines,
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        ease: 'power2.out',
        stagger: 0.08,  // seconds between line reveals (inside the scrub timeline)
        duration: 0.5,
      },
      0.15, // start slightly after numeral begins revealing
    );

    return () => {
      tl.kill();
      // Remove the overflow:hidden wrappers we added manually
      split.lines.forEach((line) => {
        const wrapper = line.parentNode;
        if (wrapper && wrapper !== body) {
          wrapper.parentNode?.insertBefore(line, wrapper);
          wrapper.remove();
        }
      });
      split.revert();
    };
  }, [reduce]);

  return (
    <motion.div
      ref={tileRef}
      // Card entrance: simple one-shot fade+lift (not scrubbed — just for first appearance)
      initial={reduce ? false : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#F5F2EA] p-8 flex flex-col problem-tile-hover"
    >
      {/* Number + Icon row */}
      <div className="flex items-center justify-between mb-6">
        {/* Numeral — GSAP scrubs this from opacity 0.08 → 1 */}
        <span
          ref={numRef}
          className="font-mono text-[2.5rem] font-bold leading-none tracking-tighter select-none"
          style={{ color: p.accent, opacity: 0.08 }}
          aria-hidden="true"
        >
          {p.num}
        </span>

        {/* Icon badge */}
        <motion.div
          className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0"
          style={{ backgroundColor: p.accentBg, border: `1.5px solid ${p.accent}22` }}
          aria-hidden="true"
          initial={reduce ? false : { scale: 0.7, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.55,
            delay: i * 0.1 + 0.18,
            type: 'spring',
            stiffness: 240,
            damping: 18,
          }}
        >
          <Icon size={22} color={p.accent} weight="duotone" />
        </motion.div>
      </div>

      {/* Accent rule */}
      <div className="w-8 h-[2px] mb-5" style={{ backgroundColor: p.accent, opacity: 0.45 }} />

      <h3 className="font-display font-bold text-[#0F172A] text-xl mb-3 leading-snug">
        {p.label}
      </h3>

      {/* Body — GSAP SplitText scrubs lines in line-by-line */}
      <p
        ref={bodyRef}
        className="text-[#6B7280] text-sm leading-relaxed flex-1"
        style={{ overflow: 'hidden' }}
      >
        {p.body}
      </p>
    </motion.div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
import SectionRule from '@/shared/components/SectionRule';

export default function ProblemSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="problem"
      className="py-24 md:py-32 bg-[#F5F2EA] relative"
      aria-label="The problem: fragmented campus communication"
    >
      <div className="page-container">
        {/* Section label */}
        <SectionRule label="The problem" className="mb-10" />

        {/* Headline + subtext */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 mb-14 items-end">
          <motion.h2
            className="font-display font-bold text-[#0F172A] text-4xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.08]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Campus coordination<br />is broken.
          </motion.h2>
          <motion.p
            className="text-[#6B7280] text-base leading-relaxed max-w-[38ch] lg:text-right"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            Every college runs on informal channels that were never built for this. The cost is invisible until you miss something that mattered.
          </motion.p>
        </div>

        {/* Problem tiles — 3-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#D8D2C4]">
          {PROBLEMS.map((p, i) => (
            <ProblemTile key={p.label} p={p} i={i} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
}
