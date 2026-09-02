/* ─────────────────────────────────────────────────────────────
   SKELETON LOADER CARD
   ───────────────────────────────────────────────────────────── */

export default function DiscoverSkeletonCard() {
  return (
    <div className="discover-card animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-sm bg-[#D8D2C4]" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-[#D8D2C4] rounded-sm w-36" />
          <div className="h-2.5 bg-[#D8D2C4] rounded-sm w-24" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-[#D8D2C4] rounded-sm w-full" />
        <div className="h-3 bg-[#D8D2C4] rounded-sm w-4/5" />
        <div className="h-3 bg-[#D8D2C4] rounded-sm w-2/3" />
      </div>
      <div className="h-40 bg-[#D8D2C4] rounded-sm mb-3" />
      <div className="flex gap-3 pt-3 border-t border-[#D8D2C4]">
        {[1, 2, 3].map(i => <div key={i} className="h-6 bg-[#D8D2C4] rounded-sm w-14" />)}
      </div>
    </div>
  );
}
