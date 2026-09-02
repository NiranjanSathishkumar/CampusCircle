/**
 * CampusCircleLogo.jsx — Official Brand Logo & Mark Component
 * Uses the official CampusCircle emblem & wordmark
 * Features:
 * - High-definition brand emblem with academic, arts, tech & sports motifs
 * - Variants: 'mark' (symbol only), 'full' (full graphic badge), 'horizontal' (mark + wordmark + SIES GST badge),
 *   'stacked' (centered emblem + label), 'badge' (squircle container)
 * - Color modes: 'default' (deep navy + campus green), 'light' (for dark surfaces), 'monochrome'
 */

export function CampusCircleMark({
  size = 28,
  className = '',
  glow = false,
  alt = 'CampusCircle Emblem',
}) {
  const s = size;
  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden bg-white select-none ${
        glow ? 'shadow-md shadow-emerald-500/20' : 'shadow-xs'
      } ${className}`}
      style={{ width: `${s}px`, height: `${s}px` }}
    >
      <img
        src="/campuscircle-logo.png"
        alt={alt}
        className="w-full h-full object-contain pointer-events-none transform scale-110"
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

export function CampusCircleFullLogo({
  height = 36,
  className = '',
  alt = 'CampusCircle Logo',
}) {
  return (
    <img
      src="/campuscircle-logo.png"
      alt={alt}
      className={`inline-block object-contain select-none ${className}`}
      style={{ height: `${height}px`, width: 'auto' }}
      loading="eager"
      decoding="async"
    />
  );
}

export default function CampusCircleLogo({
  variant = 'horizontal', // 'mark' | 'horizontal' | 'stacked' | 'badge' | 'full'
  size = 28,
  theme = 'default', // 'default' | 'light' | 'monochrome'
  showTag = true,
  className = '',
}) {
  const isLight = theme === 'light';

  if (variant === 'mark') {
    return <CampusCircleMark size={size} className={className} glow={isLight} />;
  }

  if (variant === 'full') {
    return <CampusCircleFullLogo height={size * 1.4} className={className} />;
  }

  if (variant === 'badge') {
    return (
      <div
        className={`inline-flex items-center justify-center p-1.5 rounded-xl border shadow-xs ${
          isLight
            ? 'bg-[#0B1120] border-gray-800'
            : 'bg-white border-[#D8D2C4]'
        } ${className}`}
      >
        <CampusCircleMark size={size} glow={isLight} />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        <CampusCircleMark size={size * 1.5} glow={isLight} />
        <div>
          <span
            className={`font-['Space_Grotesk'] font-bold tracking-tight leading-none block ${
              isLight ? 'text-white' : 'text-[#0F172A]'
            }`}
            style={{ fontSize: `${Math.max(16, size * 0.75)}px` }}
          >
            Campus<span className={isLight ? 'text-emerald-400' : 'text-[#059669]'}>Circle</span>
          </span>
          {showTag && (
            <span
              className={`font-mono uppercase tracking-widest text-[10px] mt-0.5 block ${
                isLight ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              SIES GST · Navi Mumbai
            </span>
          )}
        </div>
      </div>
    );
  }

  // default 'horizontal'
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <CampusCircleMark size={size} glow={isLight} />
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-['Space_Grotesk'] font-bold tracking-tight leading-tight ${
              isLight ? 'text-white' : 'text-[#0F172A]'
            }`}
            style={{ fontSize: `${Math.max(15, size * 0.65)}px` }}
          >
            Campus<span className={isLight ? 'text-emerald-400' : 'text-[#059669]'}>Circle</span>
          </span>
          {showTag && (
            <span
              className={`font-mono text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                isLight
                  ? 'bg-white/10 text-emerald-300 border-white/20'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              SIES GST
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

