import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

// Categorical palette, fixed order — validated (adjacent-pair CVD >= 8,
// normal-vision floor >= 15, all >= 3:1 on a white card surface) via
// scripts/validate_palette.js. Built from CampusCircle's existing brand
// accents (crimson/blue/teal/amber) plus violet to give a 5th slot that
// stays distinct from all four under deuteranopia/tritanopia. Never
// reassign a slot to a different category between renders/filters.
const CATEGORICAL = ['#991B1B', '#2563EB', '#0D9488', '#B45309', '#7C3AED'];

/**
 * OrganizerCompositionBar — single 100%-stacked horizontal bar + legend
 * for part-to-whole data (branch/year/department composition). Replaces
 * a set of independently-scaled bars that implied "biggest wins" instead
 * of "these shares add up to the whole community."
 */
export default function OrganizerCompositionBar({ data, emptyLabel = 'No composition data recorded yet.' }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const segments = useMemo(() => {
    if (!data || data.length === 0) return [];
    const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
    return data.map((d, i) => ({
      ...d,
      pct: (d.value / total) * 100,
      color: CATEGORICAL[i % CATEGORICAL.length],
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="org-bar-list-empty">
        <p className="text-xs text-gray-500 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="org-composition-chart">
      <div className="org-composition-track" role="img" aria-label="Composition breakdown, see legend below for exact shares">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.label}
            className="org-composition-segment"
            initial={{ width: 0 }}
            animate={{ width: `${seg.pct}%` }}
            transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            style={{ backgroundColor: seg.color }}
            onPointerEnter={() => setHoverIndex(i)}
            onPointerLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(null)}
            tabIndex={0}
            aria-label={`${seg.label}: ${Math.round(seg.pct)}%`}
          >
            {hoverIndex === i && (
              <div className="org-composition-tooltip">
                <strong>{Math.round(seg.pct)}%</strong> {seg.label}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="org-composition-legend">
        {segments.map((seg, i) => (
          <button
            type="button"
            key={seg.label}
            className={`org-composition-legend-item ${hoverIndex === i ? 'is-active' : ''}`}
            onPointerEnter={() => setHoverIndex(i)}
            onPointerLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(null)}
          >
            <span className="org-composition-legend-swatch" style={{ backgroundColor: seg.color }} />
            <span className="org-composition-legend-label">{seg.label}</span>
            <span className="org-composition-legend-pct">{Math.round(seg.pct)}%</span>
          </button>
        ))}
      </div>

      <table className="org-sr-only">
        <caption>Composition breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg) => (
            <tr key={seg.label}>
              <td>{seg.label}</td>
              <td>{Math.round(seg.pct)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
