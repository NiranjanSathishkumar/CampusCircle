import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, CaretRight } from '@phosphor-icons/react';

/**
 * StatCard — High-craft metric card component with background trend sparklines,
 * percentage deltas, dynamic multi-stage progress gauges, and interactive hover elevation.
 */
export default function StatCard({
  label,
  value,
  delta,
  deltaPeriod = 'this week',
  progress,
  icon: Icon,
  accent = '#991B1B',
  onClick,
  subtitle,
}) {
  const isClickable = Boolean(onClick);
  const CardComponent = isClickable ? motion.button : motion.div;

  // Determine capacity bar threshold color if progress is defined
  const getProgressColor = (val) => {
    if (accent !== '#991B1B') return accent;
    if (val >= 90) return '#DC2626'; // High capacity critical
    if (val >= 75) return '#F59E0B'; // Moderate warning
    return '#10B981'; // Healthy green
  };

  const progressFillColor = progress !== undefined ? getProgressColor(progress) : accent;

  return (
    <CardComponent
      type={isClickable ? 'button' : undefined}
      whileHover={{ y: -3, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } }}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      className={`org-stat-card ${isClickable ? 'org-stat-card--interactive' : ''}`}
      onClick={onClick}
    >
      {/* Background Micro Sparkline Visual */}
      <svg
        className="org-stat-sparkline"
        viewBox="0 0 100 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={
            delta != null && delta < 0
              ? 'M0 10 C 25 15, 50 30, 100 35'
              : 'M0 32 C 25 28, 50 12, 100 4'
          }
          stroke={delta != null && delta < 0 ? '#DC2626' : accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.25"
        />
        <path
          d={
            delta != null && delta < 0
              ? 'M0 10 C 25 15, 50 30, 100 35 L 100 40 L 0 40 Z'
              : 'M0 32 C 25 28, 50 12, 100 4 L 100 40 L 0 40 Z'
          }
          fill={delta != null && delta < 0 ? '#DC2626' : accent}
          opacity="0.06"
        />
      </svg>

      {/* Top row: Label & Icon emblem */}
      <div className="org-stat-card-top relative z-10">
        <span className="org-stat-card-label">{label}</span>
        {Icon && (
          <span
            className="org-stat-card-icon"
            style={{ color: accent, backgroundColor: `${accent}18` }}
          >
            <Icon size={16} weight="bold" />
          </span>
        )}
      </div>

      {/* Main value & optional click arrow */}
      <div className="flex items-baseline justify-between gap-2 mt-1 relative z-10">
        <div className="org-stat-card-value">{value}</div>
        {isClickable && (
          <CaretRight size={14} className="org-stat-card-arrow text-slate-400 group-hover:translate-x-1 transition-transform" />
        )}
      </div>

      {/* Subtitle / context description */}
      {subtitle && <p className="org-stat-card-subtitle mt-1 text-xs text-slate-500 relative z-10">{subtitle}</p>}

      {/* Progress Bar (Optional) */}
      {progress !== undefined && (
        <div className="org-stat-card-progress mt-2.5 relative z-10">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
            <span>Capacity</span>
            <span className="font-bold text-slate-700">{Math.round(progress)}%</span>
          </div>
          <div className="org-capacity-track">
            <div
              className="org-capacity-fill"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: progressFillColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Delta Trend Badge */}
      {delta != null && (
        <div className={`org-stat-card-delta mt-2.5 relative z-10 ${delta < 0 ? 'is-negative' : ''}`}>
          {delta >= 0 ? (
            <ArrowUpRight size={12} weight="bold" />
          ) : (
            <ArrowDownRight size={12} weight="bold" />
          )}
          <span>
            {delta > 0 ? '+' : ''}
            {delta}% {deltaPeriod}
          </span>
        </div>
      )}
    </CardComponent>
  );
}
