import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CaretDown } from '@phosphor-icons/react';

// Ordinal ramp (one hue, monotone lightness) — validated against a white
// card surface: light-end clears the 2:1 contrast floor, adjacent steps
// clear the >=0.06 lightness gap. Funnel stage order carries meaning
// (swapping it changes the story), so this is ordinal, not categorical —
// a single hue that darkens as the funnel narrows, never 4 unrelated hues.
const ORDINAL_RAMP = ['#DCA3A3', '#C57373', '#A83A3A', '#7F1D1D'];

/**
 * OrganizerFunnelChart — sequential conversion stages (views -> RSVP ->
 * check-in) rendered as narrowing bars with stage-to-stage drop-off called
 * out explicitly, instead of a generic bar list that hides the conversion
 * rate between steps.
 */
export default function OrganizerFunnelChart({ data, emptyLabel = 'No funnel data recorded yet.' }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const rows = useMemo(() => {
    if (!data || data.length === 0) return [];
    const maxVal = Math.max(...data.map((d) => d.value || 0), 1);
    const first = data[0].value || maxVal;
    return data.map((d, i) => {
      const prev = i > 0 ? data[i - 1].value : d.value;
      const hasDrop = i > 0 && prev > d.value && prev > 0;
      const dropPct = hasDrop ? Math.round(((prev - d.value) / prev) * 100) : null;
      const widthPct = Math.min(Math.max(((d.value || 0) / maxVal) * 100, 6), 100);
      const color = ORDINAL_RAMP[Math.min(i, ORDINAL_RAMP.length - 1)];
      const shareOfFirst = first > 0 ? Math.min(Math.round(((d.value || 0) / first) * 100), 100) : 0;
      return { ...d, widthPct, dropPct, color, shareOfFirst };
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="org-bar-list-empty">
        <p className="text-xs text-gray-500 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="org-funnel-chart">
      {rows.map((row, i) => (
        <div key={row.label}>
          {i > 0 && row.dropPct != null && row.dropPct > 0 && (
            <div className="org-funnel-drop" aria-hidden="true">
              <CaretDown size={11} weight="bold" />
              <span>{row.dropPct}% drop-off</span>
            </div>
          )}

          <div
            className="org-funnel-row"
            onPointerEnter={() => setHoverIndex(i)}
            onPointerLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(null)}
            tabIndex={0}
            role="img"
            aria-label={`${row.label}: ${row.value.toLocaleString()}, ${row.shareOfFirst}% of ${data[0].label}`}
          >
            <span className="org-funnel-row-label">{row.label}</span>
            <div className="org-funnel-track">
              <motion.div
                className="org-funnel-fill"
                initial={{ width: 0 }}
                animate={{ width: `${row.widthPct}%` }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                style={{ backgroundColor: row.color }}
              />
            </div>
            <span className="org-funnel-row-value">
              {row.value.toLocaleString()}
              <span className="org-funnel-row-share">{row.shareOfFirst}%</span>
            </span>

            {hoverIndex === i && (
              <div className="org-funnel-tooltip">
                <strong>{row.value.toLocaleString()}</strong> {row.label} · {row.shareOfFirst}% of{' '}
                {data[0].label.toLowerCase()}
                {row.dropPct != null && row.dropPct > 0 && <span> · {row.dropPct}% dropped from previous stage</span>}
              </div>
            )}
          </div>
        </div>
      ))}

      <table className="org-sr-only">
        <caption>Funnel conversion by stage</caption>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            <th scope="col">Count</th>
            <th scope="col">Share of first stage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.value}</td>
              <td>{row.shareOfFirst}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
