import { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { SplitText } from 'gsap/SplitText';

import SectionRule from '@/shared/components/SectionRule';

gsap.registerPlugin(MorphSVGPlugin, SplitText);

// Phosphor bold Plus and Minus SVG path definitions (viewBox 0 0 256 256)
const PATH_PLUS  = 'M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z';
const PATH_MINUS = 'M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z';

const FAQS = [
  {
    id: 'faq-browse',
    q: 'Can I browse events without creating an account?',
    a: 'Yes. Event listings and community pages are visible to anyone with a CampusCircle link. However, event details, registration, and student profiles require a verified student account. You can explore what is happening on campus before signing up.',
  },
  {
    id: 'faq-team',
    q: 'How does team registration work?',
    a: 'When an event allows team registration, you create or join a team slot during the registration flow. Team organisers invite members by their CampusCircle username. Each team member receives a separate QR pass. Payment can be configured per-team or per-member, depending on how the event organiser sets it up.',
  },
  {
    id: 'faq-college',
    q: 'Is CampusCircle available at other colleges?',
    a: 'CampusCircle is a single-college platform. The version you are accessing is specific to SIES Graduate School of Technology (SIES GST). There is no cross-campus access. Students from other institutions cannot register or view protected content.',
  },
  {
    id: 'faq-achievements',
    q: 'Are the achievements on student profiles verified?',
    a: 'No. Achievements listed on student profiles are entirely self-reported. CampusCircle does not validate, endorse, or verify any achievement claims. The platform displays them with a clear self-reported label so that anyone viewing a profile understands their status.',
  },
  {
    id: 'faq-organiser',
    q: 'How do club organisers get access?',
    a: 'Organiser access is granted through college administration. A student or group representing a club submits a community creation request through the Admin portal. Once approved, the designated organiser account gains access to the organiser dashboard, event creation, and analytics.',
  },
  {
    id: 'faq-full',
    q: 'What happens when an event is full?',
    a: 'When event capacity is reached, registration closes and a waitlist opens. Waitlisted registrants are notified if a spot opens due to a cancellation. Being on a waitlist does not guarantee entry. Event organisers can set the maximum capacity per event.',
  },
];

function AccordionItem({ faq }) {
  const reduce          = useReducedMotion();
  const [open, setOpen] = useState(false);
  const isFirstRender   = useRef(true);
  const wrapRef         = useRef(null);
  const answerRef       = useRef(null);
  const pathRef         = useRef(null);
  const splitRef        = useRef(null);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const answer = answerRef.current;
    const path   = pathRef.current;

    if (!wrap || !answer || !path) return;

    // Skip animation on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (reduce) {
      gsap.set(wrap, { height: open ? 'auto' : 0, opacity: open ? 1 : 0 });
      gsap.set(path, { morphSVG: open ? PATH_MINUS : PATH_PLUS, fill: open ? '#991B1B' : '#6B7280' });
      return;
    }

    if (open) {
      // 1. MorphSVG Plus → Minus
      gsap.to(path, {
        morphSVG: PATH_MINUS,
        fill: '#991B1B',
        duration: 0.35,
        ease: 'power2.inOut',
      });

      // 2. GSAP height tween (0 → auto height with smooth power3.inOut easing)
      gsap.fromTo(
        wrap,
        { height: 0, opacity: 0 },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.48,
          ease: 'power3.inOut',
          onComplete() {
            gsap.set(wrap, { height: 'auto' });
          },
        }
      );

      // 3. SplitText line stagger on answer text
      if (splitRef.current) splitRef.current.revert();
      const split = new SplitText(answer, { type: 'lines' });
      splitRef.current = split;

      gsap.fromTo(
        split.lines,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.38,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.12,
        }
      );
    } else {
      // 1. MorphSVG Minus → Plus
      gsap.to(path, {
        morphSVG: PATH_PLUS,
        fill: '#6B7280',
        duration: 0.32,
        ease: 'power2.inOut',
      });

      // 2. GSAP height tween (auto → 0)
      gsap.to(wrap, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.inOut',
        onComplete() {
          if (splitRef.current) {
            splitRef.current.revert();
            splitRef.current = null;
          }
        },
      });
    }
  }, [open, reduce]);

  return (
    <div className="accordion-item" role="listitem">
      <button
        id={`${faq.id}-trigger`}
        className="accordion-trigger select-none"
        aria-expanded={open}
        aria-controls={`${faq.id}-content`}
        onClick={() => setOpen(!open)}
      >
        <span>{faq.q}</span>

        {/* MorphSVG Plus ↔ Minus Icon */}
        <svg
          width={18}
          height={18}
          viewBox="0 0 256 256"
          className="shrink-0 ml-4 pointer-events-none"
          aria-hidden="true"
        >
          <path
            ref={pathRef}
            d={PATH_PLUS}
            fill="#6B7280"
          />
        </svg>
      </button>

      {/* GSAP Height Tween Content Wrapper */}
      <div
        ref={wrapRef}
        id={`${faq.id}-content`}
        style={{ height: 0, opacity: 0, overflow: 'hidden' }}
        role="region"
        aria-labelledby={`${faq.id}-trigger`}
        aria-hidden={!open}
      >
        <div className="pb-5 pt-1">
          <p ref={answerRef} className="text-[#6B7280] leading-relaxed text-sm">
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FaqSection() {
  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-[#F0EDE5]"
      aria-label="Frequently asked questions"
    >
      <div className="page-container">
        {/* Section label */}
        <SectionRule label="FAQ" className="mb-10" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          {/* Left */}
          <div>
            <h2 className="font-display font-bold text-[#0F172A] text-4xl sm:text-5xl tracking-tight leading-[1.04] mb-4">
              Questions.&nbsp;↓
            </h2>
            <p className="text-[#6B7280] leading-relaxed text-base">
              Specific things people ask before creating an account. Honest answers, no marketing language.
            </p>
          </div>

          {/* Right: accordion */}
          <div role="list">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.id} faq={faq} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
