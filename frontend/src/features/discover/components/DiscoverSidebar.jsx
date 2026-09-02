/**
 * Right-rail widgets for the Discover hub.
 */
import { CaretRight, Lightning, Megaphone, Sparkle, Star } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   SIDEBAR WIDGETS
   ───────────────────────────────────────────────────────────── */

export function TrendingTopics({ tags, onTagClick }) {
  return (
    <div className="bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Lightning size={14} weight="fill" className="text-[#991B1B]" />
        <span className="font-mono font-bold text-[0.58rem] text-[#0F172A] uppercase tracking-widest">Trending Topics</span>
      </div>
      <div className="space-y-1">
        {tags.map((item, i) => (
          <button
            key={item.tag}
            onClick={() => onTagClick(item.tag)}
            className="w-full flex items-center justify-between group hover:bg-[#E8E3D8] transition-colors px-2.5 py-2 rounded-sm -mx-1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-bold text-[0.52rem] text-[#991B1B] bg-[#991B1B]/10 w-5 h-5 flex items-center justify-center rounded-sm flex-shrink-0">
                0{i + 1}
              </span>
              <span className="font-mono text-xs text-[#0F172A] group-hover:text-[#991B1B] truncate">#{item.tag}</span>
            </div>
            <span className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase flex-shrink-0">{item.count} posts</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeaturedCommunities({ communities, onCommunityClick }) {
  return (
    <div className="bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-4">
      <div className="flex items-center gap-2 mb-3">
        <Star size={14} weight="fill" className="text-[#B45309]" />
        <span className="font-mono font-bold text-[0.58rem] text-[#0F172A] uppercase tracking-widest">Featured Communities</span>
      </div>
      <div className="space-y-1">
        {communities.map(c => (
          <button
            key={c.id}
            onClick={() => onCommunityClick(c.id)}
            className="w-full flex items-center gap-2.5 group hover:bg-[#E8E3D8] transition-colors px-2 py-1.5 rounded-sm -mx-1 text-left"
          >
            <div
              className="w-7 h-7 flex-shrink-0 rounded-sm flex items-center justify-center text-sm shadow-sm"
              style={{ backgroundColor: c.color + '20' }}
            >
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-[#0F172A] text-xs truncate group-hover:text-[#991B1B] transition-colors">{c.name}</p>
              <p className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase">{c.postCount} post{c.postCount === 1 ? '' : 's'} in feed</p>
            </div>
            <CaretRight size={12} className="text-[#9CA3AF] group-hover:text-[#991B1B] transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function CampusPulseWidget({ communityCount = 0, postsThisWeek = 0 }) {
  return (
    <div className="bg-[#0F172A] text-[#F5F2EA] rounded-sm p-4 border border-[#0F172A]">
      <div className="flex items-center gap-2 mb-2">
        <Sparkle size={14} weight="fill" className="text-[#F59E0B]" />
        <span className="font-mono font-bold text-[0.58rem] text-white uppercase tracking-widest">SIES GST Campus Pulse</span>
      </div>
      <p className="text-xs text-white/70 leading-relaxed mb-3">
        {communityCount} followed {communityCount === 1 ? 'community has' : 'communities have'} posted {postsThisWeek} update{postsThisWeek === 1 ? '' : 's'} this week.
      </p>
      <div className="flex items-center gap-3 pt-2 border-t border-white/10 font-mono text-[0.5rem] text-white/50 uppercase tracking-widest">
        <span>● Live Feed Active</span>
        <span className="ml-auto">SIES GST</span>
      </div>
    </div>
  );
}

export function PublishingNote() {
  return (
    <div className="bg-[#1A3A2A]/8 border border-[#1A3A2A]/25 rounded-sm p-4">
      <div className="flex items-center gap-2 mb-2">
        <Megaphone size={13} weight="fill" className="text-[#1A3A2A]" />
        <span className="font-mono font-bold text-[0.52rem] text-[#1A3A2A] uppercase tracking-widest">Publishing Policy</span>
      </div>
      <p className="font-sans text-xs text-[#374151] leading-relaxed">
        Only verified club organizers can post updates. Students can interact, save, and participate in all community discussions.
      </p>
    </div>
  );
}
