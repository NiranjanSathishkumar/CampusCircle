import { getInitials } from '@/features/discover/discoverUtils';

/* ─────────────────────────────────────────────────────────────
   AVATAR COMPONENT
   ───────────────────────────────────────────────────────────── */

export default function DiscoverAvatar({ name, color = '#0F172A', size = 36, src = null }) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="flex-shrink-0 rounded-sm object-cover select-none shadow-sm transition-transform duration-200 hover:scale-105"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-sm font-display font-bold text-white select-none shadow-sm transition-transform duration-200 hover:scale-105"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.36 }}
    >
      {getInitials(name)}
    </div>
  );
}
