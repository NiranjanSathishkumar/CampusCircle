import { Flip } from 'gsap/Flip';
import { gsap } from 'gsap';
import { useCallback, useEffect, useRef, useState } from 'react';

// ─── Mockup panel — stable DOM node for GSAP Flip ────────────────────────────
// The panel wrapper never unmounts. Only its inner content changes.
// Before every content swap, we record the panel's layout state via Flip.getState,
// commit the new content synchronously, then let Flip animate from old → new bounds.
export default function MockupPanel({ active, features, reduce }) {
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const activeRef = useRef(active);

  // Track last rendered feature for Flip
  const [displayed, setDisplayed] = useState(active);
  const pendingRef = useRef(null);

  const doFlipSwap = useCallback((nextId) => {
    const panel = panelRef.current;
    if (!panel || reduce) {
      setDisplayed(nextId);
      return;
    }

    // 1. Capture current layout state (size + position of the panel)
    const state = Flip.getState(panel);

    // 2. Swap content (React commit — synchronous setState batched below)
    setDisplayed(nextId);

    // 3. Animate from recorded state to new state
    //    We defer via rAF so React has painted the new content
    requestAnimationFrame(() => {
      Flip.from(state, {
        targets: panel,
        duration: 0.52,
        ease: 'power3.inOut',
        // Scale + fade for the content swap feel
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.96, duration: 0.2, ease: 'power2.in' }),
      });
    });
  }, [reduce]);

  // When active tab changes, trigger Flip swap
  useEffect(() => {
    if (active !== activeRef.current) {
      activeRef.current = active;
      doFlipSwap(active);
    }
  }, [active, doFlipSwap]);

  const current = features.find((f) => f.id === displayed);
  const Visual = current?.Visual;
  const needsReduce = current?.visualProps;

  return (
    <div ref={panelRef} className="form-panel p-4 shadow-sm" data-flip-id="mockup-panel">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#D8D2C4]">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#991B1B]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#B45309]/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#1A3A2A]/40" />
        </div>
        <p className="font-mono text-[0.45rem] text-[#9CA3AF] uppercase tracking-wider flex-1 text-center">
          CampusCircle · SIES GST
        </p>
      </div>
      <div ref={contentRef}>
        {Visual && (needsReduce ? <Visual reduce={reduce} /> : <Visual />)}
      </div>
    </div>
  );
}
