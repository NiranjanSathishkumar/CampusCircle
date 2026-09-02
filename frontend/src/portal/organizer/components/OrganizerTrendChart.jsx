import { useId, useMemo, useState } from 'react';
import { motion } from 'motion/react';

/**
 * OrganizerTrendChart — line + area chart for a single time series
 * (follower growth, weekly registration surge). Trend-over-time data
 * gets a line, not a bar list, so slope and direction are legible at
 * a glance instead of read one bar at a time.
 */
export default function OrganizerTrendChart({
  data,
  accent = '#991B1B',
  formatValue = (v) => v.toLocaleString(),
  emptyLabel = 'No trend data recorded yet.',
}) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState(null);

  const W = 480;
  const H = 180;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 22;
  const PAD_B = 26;

  const { points, ticks, maxValue } = useMemo(() => {
    if (!data || data.length === 0) return { points: [], ticks: [], maxValue: 0 };
    const values = data.map((d) => d.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const pts = data.map((d, i) => {
      const x = data.length === 1 ? PAD_L + plotW / 2 : PAD_L + (i / (data.length - 1)) * plotW;
      const y = PAD_T + plotH - ((d.value - min) / span) * plotH;
      return { x, y, ...d };
    });

    // Three clean-ish reference lines: max, mid, min.
    const tickVals = [max, min + span / 2, min];
    const tk = tickVals.map((v) => ({
      value: Math.round(v),
      y: PAD_T + plotH - ((v - min) / span) * plotH,
    }));

    return { points: pts, ticks: tk, maxValue: max };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="org-bar-list-empty">
        <p className="text-xs text-gray-500 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const plotBottom = H - PAD_B;
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${plotBottom} L ${points[0].x} ${plotBottom} Z`;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const growthPct = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
  const active = hoverIndex != null ? points[hoverIndex] : null;

  const handleMove = (e) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let bestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - relX);
      if (dist < bestDist) {
        bestDist = dist;
        nearest = i;
      }
    });
    setHoverIndex(nearest);
  };

  return (
    <div className="org-trend-chart">
      <div className="org-trend-chart-headline">
        <span
          className={`org-trend-growth-chip ${growthPct < 0 ? 'is-negative' : ''}`}
          style={{ color: growthPct < 0 ? '#991B1B' : '#1A3A2A' }}
        >
          {growthPct > 0 ? '+' : ''}
          {growthPct}% since {data[0].label}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="org-trend-svg"
        role="img"
        aria-label={`Trend from ${data[0].label} to ${data[data.length - 1].label}, rising from ${formatValue(first)} to ${formatValue(last)}`}
        onPointerMove={handleMove}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.16" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines + rounded value ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              x2={W - PAD_R}
              y1={t.y}
              y2={t.y}
              stroke="#E5E0D5"
              strokeWidth="1"
            />
            <text x={PAD_L} y={t.y - 4} className="org-trend-tick-label">
              {formatValue(t.value)}
            </text>
          </g>
        ))}

        {/* Area wash */}
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Crosshair */}
        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={PAD_T}
            y2={plotBottom}
            stroke="#0F172A"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
        )}

        {/* End marker (always visible) + hover marker */}
        {points.map((p, i) => {
          const isLast = i === points.length - 1;
          const isActive = hoverIndex === i;
          if (!isLast && !isActive) return null;
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={isActive ? 5 : 4}
              fill={accent}
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* Endpoint direct label */}
        <text
          x={points[points.length - 1].x}
          y={points[points.length - 1].y - 10}
          textAnchor="end"
          className="org-trend-end-label"
        >
          {formatValue(last)}
        </text>

        {/* Hit-target rects: keyboard-focusable per point, mirrors hover tooltip */}
        {points.map((p, i) => (
          <rect
            key={`hit-${i}`}
            x={p.x - (W / data.length) / 2}
            y={PAD_T}
            width={W / data.length}
            height={plotBottom - PAD_T}
            fill="transparent"
            tabIndex={0}
            role="button"
            aria-label={`${p.label}: ${formatValue(p.value)}`}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(null)}
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="org-trend-axis-labels">
        {data.map((d, i) => (
          <span key={i} className={hoverIndex === i ? 'is-active' : ''}>
            {d.label}
          </span>
        ))}
      </div>

      {/* Tooltip */}
      {active && (
        <div
          className="org-trend-tooltip"
          style={{ left: `${(active.x / W) * 100}%` }}
        >
          <span className="org-trend-tooltip-label">{active.label}</span>
          <span className="org-trend-tooltip-value">{formatValue(active.value)}</span>
        </div>
      )}

      {/* Screen-reader table twin */}
      <table className="org-sr-only">
        <caption>Trend data by period</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.label}</td>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
