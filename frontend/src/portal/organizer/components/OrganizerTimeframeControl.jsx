import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarBlank, CaretDown, Check } from '@phosphor-icons/react';
import { TIMEFRAME_PRESETS, formatTimeframeLabel, resolveTimeframeRange } from '@/portal/organizer/analyticsTimeframe';

/**
 * OrganizerTimeframeControl — one filter control that scopes every stat
 * and chart below it (dataviz interaction rule: filters live in a single
 * row above the content, never per-chart). Presets are listed as rows;
 * a custom date range sits behind a hairline in the footer.
 */
export default function OrganizerTimeframeControl({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(value.from || '');
  const [draftTo, setDraftTo] = useState(value.to || '');
  const rootRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const range = resolveTimeframeRange(value);
  const label = formatTimeframeLabel(value, range);

  const applyPreset = (presetId) => {
    onChange({ preset: presetId, from: '', to: '' });
    setOpen(false);
  };

  const applyCustom = () => {
    if (!draftFrom || !draftTo) return;
    onChange({ preset: 'custom', from: draftFrom, to: draftTo });
    setOpen(false);
  };

  return (
    <div className="org-timeframe-control" ref={rootRef}>
      <button
        type="button"
        className={`org-timeframe-trigger ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <CalendarBlank size={14} />
        <span>{label}</span>
        <CaretDown size={11} className="opacity-60" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="org-timeframe-panel"
            role="menu"
          >
            {TIMEFRAME_PRESETS.map((p) => {
              const isActive = value.preset === p.id;
              return (
                <button
                  type="button"
                  key={p.id}
                  role="menuitemradio"
                  aria-checked={isActive}
                  className={`org-timeframe-preset-row ${isActive ? 'is-active' : ''}`}
                  onClick={() => applyPreset(p.id)}
                >
                  <span className="org-timeframe-preset-check">
                    {isActive && <Check size={13} weight="bold" />}
                  </span>
                  <span>{p.label}</span>
                </button>
              );
            })}

            <div className="org-timeframe-divider" />

            <div className="org-timeframe-custom">
              <span className="org-timeframe-custom-label">Custom Range</span>
              <div className="org-timeframe-custom-inputs">
                <input
                  type="date"
                  className="org-form-input"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                  aria-label="Custom range start date"
                  max={draftTo || undefined}
                />
                <span className="org-timeframe-custom-sep">to</span>
                <input
                  type="date"
                  className="org-form-input"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                  aria-label="Custom range end date"
                  min={draftFrom || undefined}
                />
              </div>
              <button
                type="button"
                className="org-btn org-btn-primary org-btn-sm w-full justify-center mt-2"
                onClick={applyCustom}
                disabled={!draftFrom || !draftTo}
              >
                Apply Custom Range
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
