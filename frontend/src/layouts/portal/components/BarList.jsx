import { motion } from 'motion/react';

/**
 * BarList — High-craft, animated horizontal bar visualization
 * for analytics breakdowns (follower growth, demographics, funnels).
 * Uses motion spring physics and editorial design system color tokens.
 */
export default function BarList({
  data,
  accent = '#991B1B',
  formatValue,
  showRank = false,
  emptyLabel = 'No analytics recorded yet.',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="org-bar-list-empty">
        <p className="text-xs text-gray-500 font-medium">{emptyLabel}</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const totalValue = data.reduce((sum, d) => sum + (typeof d.value === 'number' ? d.value : 0), 0);

  return (
    <div className="org-bar-list space-y-3">
      {data.map((d, index) => {
        const percentage = Math.max((d.value / maxValue) * 100, 4);
        const shareOfTotal = totalValue > 0 ? Math.round((d.value / totalValue) * 100) : 0;

        return (
          <div className="org-bar-row-item" key={d.label}>
            <div className="flex items-center justify-between text-xs mb-1.5 font-['Plus_Jakarta_Sans']">
              <span className="flex items-center gap-2 font-semibold text-[#0F172A]">
                {showRank && (
                  <span className="org-bar-rank-badge font-mono text-[10px] text-gray-400">
                    #{index + 1}
                  </span>
                )}
                <span>{d.label}</span>
              </span>
              <span className="font-mono font-bold text-[#0F172A]">
                {formatValue ? formatValue(d.value) : d.value.toLocaleString()}
                {totalValue > 0 && !formatValue && (
                  <span className="text-[10px] text-gray-400 font-normal ml-1">
                    ({shareOfTotal}%)
                  </span>
                )}
              </span>
            </div>

            {/* Track & Motion Fill Bar */}
            <div className="org-bar-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="org-bar-fill"
                style={{ backgroundColor: accent }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
