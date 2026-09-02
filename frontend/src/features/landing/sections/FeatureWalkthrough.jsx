import { useState, useRef, useEffect, useCallback } from 'react';
import { useReducedMotion, motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CalendarCheck,
  QrCode,
  Buildings,
  UserSwitch,
  AddressBook,
  ChartLineUp,
  Bell,
  CaretLeft,
  CaretRight,
  Check,
  Users,
  Star,
  ArrowRight,
} from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import SectionRule from '@/shared/components/SectionRule';
import MockupPanel from '@/features/landing/sections/walkthrough/MockupPanel';
import { FEATURES } from '@/features/landing/sections/walkthrough/walkthroughFeatures';

gsap.registerPlugin(Flip, DrawSVGPlugin, ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   Main section
───────────────────────────────────────────────────────────────*/
export default function FeatureWalkthrough() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState('discover');
  const [direction, setDirection] = useState(1);
  const prevIndex = useRef(0);
  const tabRefs = useRef({});

  const currentIndex = FEATURES.findIndex((f) => f.id === active);
  const current = FEATURES[currentIndex];

  const scrollActiveTabIntoView = (id) => {
    const el = tabRefs.current[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  const handleTabClick = (id) => {
    const nextIndex = FEATURES.findIndex((f) => f.id === id);
    if (nextIndex === prevIndex.current) return;
    setDirection(nextIndex > prevIndex.current ? 1 : -1);
    prevIndex.current = nextIndex;
    setActive(id);
    scrollActiveTabIntoView(id);
  };

  const goNext = () => handleTabClick(FEATURES[(currentIndex + 1) % FEATURES.length].id);
  const goPrev = () => handleTabClick(FEATURES[(currentIndex - 1 + FEATURES.length) % FEATURES.length].id);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
  };

  // Copy panel variants (unchanged — Motion drag/swipe still drives the outer wrapper)
  const variants = {
    enter: (dir) => ({ x: reduce ? 0 : dir * 70, opacity: 0, scale: reduce ? 1 : 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ x: reduce ? 0 : dir * -70, opacity: 0, scale: reduce ? 1 : 0.98 }),
  };

  return (
    <section
      id="features"
      className="py-24 md:py-32 bg-[#F5F2EA] focus:outline-none"
      aria-label="Feature walkthrough"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="page-container">
        {/* Section Header */}
        <SectionRule label="Features" className="mb-10" />

        {/* Heading + Controls row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div className="max-w-[52ch]">
            <motion.h2
              className="font-display font-bold text-[#0F172A] text-4xl sm:text-5xl lg:text-[3.25rem] tracking-tight leading-[1.08] mb-4"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              Everything campus<br />life needs.
            </motion.h2>
            <motion.p
              className="text-[#6B7280] text-lg leading-relaxed"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              Eight integrated functions. One login. No switching between apps.
            </motion.p>
          </div>

          {/* Prev / Next arrows + counter */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-mono text-xs text-[#9CA3AF] tracking-wider uppercase mr-2">
              <span className="text-[#0F172A] font-bold">0{currentIndex + 1}</span> / 0{FEATURES.length}
            </span>
            <motion.button
              onClick={goPrev}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 rounded-full border border-[#D8D2C4] bg-[#F0EDE5] text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-colors shadow-xs"
              aria-label="Previous feature"
            >
              <CaretLeft size={18} weight="bold" />
            </motion.button>
            <motion.button
              onClick={goNext}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="w-10 h-10 rounded-full border border-[#D8D2C4] bg-[#F0EDE5] text-[#0F172A] flex items-center justify-center hover:bg-[#0F172A] hover:text-white transition-colors shadow-xs"
              aria-label="Next feature"
            >
              <CaretRight size={18} weight="bold" />
            </motion.button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-scroll-container mb-10">
          <div
            className="flex gap-0 border-b border-[#D8D2C4] overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
            role="tablist"
            aria-label="Feature tabs"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              const isActive = active === f.id;
              return (
                <button
                  key={f.id}
                  id={`tab-${f.id}`}
                  ref={(el) => (tabRefs.current[f.id] = el)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${f.id}`}
                  className={`feature-tab shrink-0 ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabClick(f.id)}
                >
                  <motion.span
                    animate={isActive && !reduce ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ display: 'inline-flex' }}
                  >
                    <Icon size={14} weight={isActive ? 'fill' : 'regular'} aria-hidden="true" />
                  </motion.span>
                  {f.tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Panel — Motion handles copy swipe; GSAP Flip handles mockup morph */}
        <div style={{ overflow: 'visible' }} className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={active}
              id={`panel-${active}`}
              role="tabpanel"
              aria-labelledby={`tab-${active}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.x < -50 || velocity.x < -300) goNext();
                else if (offset.x > 50 || velocity.x > 300) goPrev();
              }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-16 items-start cursor-grab active:cursor-grabbing select-none"
            >
              {/* Left — copy */}
              <div>
                <motion.div
                  className="mb-3"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  {(() => { const Icon = current.icon; return <Icon size={20} color="#991B1B" weight="duotone" />; })()}
                </motion.div>
                <motion.h3
                  className="font-display font-bold text-[#0F172A] text-2xl sm:text-[1.75rem] leading-tight mb-4"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  {current.title}
                </motion.h3>
                <motion.p
                  className="text-[#6B7280] text-base leading-relaxed mb-5"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  {current.body}
                </motion.p>
                <motion.div
                  className="form-panel p-4"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="form-panel-ref mb-2">Technical detail</p>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{current.detail}</p>
                </motion.div>
              </div>

              {/* Right — stable MockupPanel, morphed by GSAP Flip */}
              <div className="relative">
                <MockupPanel active={active} features={FEATURES} reduce={reduce} />
                <p className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider mt-2 text-right hidden sm:block">
                  Swipe ← → to navigate
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
