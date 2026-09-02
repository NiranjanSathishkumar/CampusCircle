import { POST_TYPES } from '@/features/discover/discoverConstants';

/* ─────────────────────────────────────────────────────────────
   TYPE BADGE
   ───────────────────────────────────────────────────────────── */

export default function PostTypeBadge({ type, small = false }) {
  const cfg = POST_TYPES.find(p => p.id === type) || POST_TYPES[0];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-widest border rounded-sm ${small ? 'text-[0.5rem] px-1.5 py-0.5' : 'text-[0.58rem] px-2 py-1'}`}
      style={{ color: cfg.color, borderColor: cfg.color + '44', backgroundColor: cfg.color + '12' }}
    >
      <Icon size={small ? 9 : 11} weight="fill" />
      {type}
    </span>
  );
}
