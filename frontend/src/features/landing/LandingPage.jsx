import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';

import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import IntroLoader from '@/features/landing/components/IntroLoader';

import HeroSection from '@/features/landing/sections/HeroSection';
import ProblemSection from '@/features/landing/sections/ProblemSection';
import ValuePropsSection from '@/features/landing/sections/ValuePropsSection';
import FeatureWalkthrough from '@/features/landing/sections/FeatureWalkthrough';
import StudentProfileSection from '@/features/landing/sections/StudentProfileSection';
import FollowingModelSection from '@/features/landing/sections/FollowingModelSection';
import AccessMatrixSection from '@/features/landing/sections/AccessMatrixSection';
import WhyJoinSection from '@/features/landing/sections/WhyJoinSection';
import ComparisonSection from '@/features/landing/sections/ComparisonSection';
import FaqSection from '@/features/landing/sections/FaqSection';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function LandingPage() {
  const reduce = useReducedMotion();
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const smootherRef = useRef(null);

  useEffect(() => {
    if (reduce) return;

    const ctx = gsap.context(() => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.15,     // 1.15 seconds of buttery inertia catchup
        effects: true,    // Enables data-speed / data-lag parallax effects
        smoothTouch: 0.1, // Subtle touch inertia
      });

      smootherRef.current = smoother;
    });

    return () => {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      ctx.revert();
    };
  }, [reduce]);

  return (
    <div className="bg-[#F5F2EA] text-[#0F172A] font-sans antialiased min-h-screen">
      {/* Closed-campus verification load-in sequence */}
      <IntroLoader />

      {/* Fixed top Navbar outside smooth scroll content container */}
      <Navbar />

      {/* GSAP ScrollSmoother outer wrapper & inner content container */}
      <div id="smooth-wrapper" ref={wrapperRef} className="overflow-hidden">
        <div id="smooth-content" ref={contentRef}>
          <main>
            <HeroSection />
            <ProblemSection />
            <ValuePropsSection />
            <FeatureWalkthrough />
            <StudentProfileSection />
            <FollowingModelSection />
            <AccessMatrixSection />
            <WhyJoinSection />
            <ComparisonSection />
            <FaqSection />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
