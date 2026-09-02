/* ─────────────────────────────────────────────────────────────
   SKELETON CARD
   ───────────────────────────────────────────────────────────── */
export default function CommunitiesSkeletonCard() {
  return (
    <div className="comm-card animate-pulse" aria-hidden="true">
      <div className="h-[168px] bg-[#D8D2C4]" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-3.5 bg-[#D8D2C4] rounded-sm w-2/3" />
        <div className="h-2.5 bg-[#D8D2C4] rounded-sm w-full" />
        <div className="h-2.5 bg-[#D8D2C4] rounded-sm w-4/5" />
        <div className="h-7 bg-[#D8D2C4] rounded-sm w-1/2 mt-1" />
      </div>
      <div className="px-5 pb-4 flex gap-2">
        <div className="h-9 bg-[#D8D2C4] rounded-sm flex-1" />
        <div className="h-9 w-9 bg-[#D8D2C4] rounded-sm" />
      </div>
    </div>
  );
}
