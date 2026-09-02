import { useCallback, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const EXIT_DURATION = 0.22;
const ENTER_DURATION_LIST = 0.45;
const ENTER_DURATION_GRID = 0.55;

/**
 * Crossfade choreography for the Editorial Grid <-> Compact Ledger List
 * toggle. Both directions get their own distinct, fully GSAP-driven
 * entrance/exit so the swap always reads as an intentional transition:
 *
 *  - Grid items animate as tiles focusing into place (blur + scale pop).
 *  - Ledger rows animate as a table populating (blur + horizontal slide).
 *  - Whichever layout is leaving fades/slides/blurs out first; the view
 *    state only flips once that's done, so the two layouts never overlap.
 *  - The container's height is frozen at its old value and eased to the
 *    new layout's natural height in parallel, so the page doesn't jump.
 *
 * `containerRef` must wrap whichever layout (grid or ledger) is currently
 * mounted. `itemSelector` should match both layouts' row/card elements
 * (e.g. ".event-card, .cc-ledger-row") so the same hook drives either side.
 */
export function useViewTransition(containerRef, view, itemSelector) {
  const didMount = useRef(false);
  const prevView = useRef(view);
  const busy = useRef(false);
  const frozenHeight = useRef(null);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      prevView.current = view;
      return;
    }

    if (prevView.current === view) return;
    prevView.current = view;

    const el = containerRef.current;
    if (!el) {
      busy.current = false;
      return;
    }

    // Ease the frozen container back to whatever height the new layout
    // actually needs, instead of snapping straight to it.
    if (frozenHeight.current != null) {
      const naturalHeight = el.scrollHeight;
      gsap.fromTo(
        el,
        { height: frozenHeight.current },
        {
          height: naturalHeight,
          duration: 0.42,
          ease: 'power2.inOut',
          onComplete: () => gsap.set(el, { clearProps: 'height,overflow' }),
        }
      );
      frozenHeight.current = null;
    }

    const items = el.querySelectorAll(itemSelector);
    const targets = items.length ? Array.from(items) : [el];
    gsap.killTweensOf(targets);

    if (view === 'list') {
      // Ledger rows slide in from the left, sharpening into focus —
      // reads like entries populating a register.
      gsap.fromTo(
        targets,
        { opacity: 0, x: -26, filter: 'blur(4px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: ENTER_DURATION_LIST,
          ease: 'power2.out',
          stagger: Math.min(0.022, 0.4 / Math.max(targets.length, 1)),
          clearProps: 'opacity,transform,filter',
          onComplete: () => { busy.current = false; },
        }
      );
    } else {
      // Grid tiles pop into focus with a soft scale — an editorial
      // "assembling the page" feel, distinct from the ledger's slide.
      gsap.fromTo(
        targets,
        { scale: 0.94, filter: 'blur(6px)' },
        {
          scale: 1,
          filter: 'blur(0px)',
          duration: ENTER_DURATION_GRID,
          ease: 'power2.out',
          stagger: Math.min(0.03, 0.45 / Math.max(targets.length, 1)),
          clearProps: 'transform,filter',
          onComplete: () => { busy.current = false; },
        }
      );
    }
  }, [view, containerRef, itemSelector]);

  const switchView = useCallback((setView, nextView) => {
    if (nextView === view || busy.current) return;
    const el = containerRef.current;
    if (!el) {
      setView(nextView);
      return;
    }

    const items = el.querySelectorAll(itemSelector);
    const targets = items.length ? Array.from(items) : [el];
    busy.current = true;
    frozenHeight.current = el.offsetHeight;

    gsap.set(el, { height: frozenHeight.current, overflow: 'hidden' });
    gsap.killTweensOf(targets);

    gsap.to(targets, {
      opacity: 0,
      x: nextView === 'list' ? 26 : -18,
      scale: nextView === 'list' ? 1 : 0.95,
      filter: 'blur(4px)',
      duration: EXIT_DURATION,
      ease: 'power2.in',
      stagger: Math.min(0.014, 0.18 / Math.max(targets.length, 1)),
      onComplete: () => setView(nextView),
    });
  }, [view, containerRef, itemSelector]);

  return switchView;
}
