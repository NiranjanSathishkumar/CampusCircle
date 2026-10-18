import { ChatCircle, Heart, PushPin } from '@phosphor-icons/react';
import { relativeTime } from '@/features/discover/discoverUtils';
import TypeBadge from '@/features/discover/components/PostTypeBadge';

/* ─────────────────────────────────────────────────────────────
   POST LEDGER ROW — Compact Ledger List View
   ───────────────────────────────────────────────────────────── */

export default function PostLedgerRow({ index, post, onLike, onView, onCommunityClick }) {
  const snippet = post.body.length > 90 ? post.body.slice(0, 90) + '...' : post.body;

  const handleLikeClick = (e) => {
    e.stopPropagation();
    onLike(post.id);
  };

  return (
    <button
      type="button"
      className="cc-ledger-row"
      onClick={() => onView(post)}
      role="listitem"
      aria-label={`Post by ${post.authorName}`}
    >
      <span className="cc-ledger-index">{String(index + 1).padStart(2, '0')}</span>

      <span className="cc-ledger-thumb" style={{ background: post.communityColor }}>
        {post.images?.[0] ? (
          <img src={post.images[0]} alt="" />
        ) : post.authorAvatar ? (
          <img src={post.authorAvatar} alt="" />
        ) : (
          post.communityIcon
        )}
      </span>

      <span className="cc-ledger-main">
        <span className="cc-ledger-title-row">
          {post.pinned && <PushPin size={11} weight="fill" style={{ color: '#991B1B', flexShrink: 0 }} />}
          <span className="cc-ledger-title">{post.authorName}</span>
          <TypeBadge type={post.type} small />
        </span>
        <span className="cc-ledger-meta">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onCommunityClick(post.communityId); }}
            className="cc-ledger-meta-item"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            {post.communityName}
          </button>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile">{snippet}</span>
          <span className="cc-ledger-meta-item">{relativeTime(post.timestamp)}</span>
        </span>
      </span>

      <span className="cc-ledger-actions">
        <button
          onClick={handleLikeClick}
          aria-pressed={post.liked}
          aria-label={`Like post, ${post.likes} likes`}
          className={`flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-mono transition-all active:scale-95 ${post.liked ? 'text-[#991B1B] bg-[#991B1B]/10 font-bold' : 'text-[#6B7280] hover:text-[#991B1B] hover:bg-[#991B1B]/8'}`}
        >
          <Heart size={13} weight={post.liked ? 'fill' : 'regular'} />
          <span>{post.likes}</span>
        </button>
        <span className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-[#6B7280]">
          <ChatCircle size={13} />
          <span>{post.comments}</span>
        </span>
      </span>
    </button>
  );
}
