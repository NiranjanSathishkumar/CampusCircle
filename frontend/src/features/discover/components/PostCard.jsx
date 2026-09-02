import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { absoluteTime, relativeTime } from '@/features/discover/discoverUtils';
import { ArrowsOut, ChatCircle, Hash, Heart, PushPin, ShareNetwork } from '@phosphor-icons/react';
import Avatar from '@/features/discover/components/DiscoverAvatar';
import ImageLightbox from '@/features/discover/components/ImageLightbox';
import InlineComments from '@/features/discover/components/InlineComments';
import PostImageGrid from '@/features/discover/components/PostImageGrid';
import TypeBadge from '@/features/discover/components/PostTypeBadge';

/* ─────────────────────────────────────────────────────────────
   POST CARD COMPONENT
   ───────────────────────────────────────────────────────────── */

export default function PostCard({ post, onLike, onShare, onView, onTagClick, onCommunityClick, onCommentPosted }) {
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const BODY_LIMIT = 240;
  const isLong = post.body.length > BODY_LIMIT;
  const displayBody = isLong && !expanded ? post.body.slice(0, BODY_LIMIT) + '...' : post.body;

  return (
    <>
      <AnimatePresence>
        {lightboxOpen && (
          <ImageLightbox images={post.images} startIndex={lightboxIdx} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>

      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className={`discover-card ${post.pinned ? 'discover-card-pinned' : ''}`}
      >
        {/* Pinned Header Accent */}
        {post.pinned && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <PushPin size={11} weight="fill" className="text-[#991B1B]" />
            <span className="font-mono font-bold text-[0.5rem] text-[#991B1B] uppercase tracking-widest">Pinned Announcement</span>
          </div>
        )}

        {/* Author Header */}
        <div className="flex items-start gap-3 mb-3">
          <button onClick={() => onCommunityClick(post.communityId)} className="flex-shrink-0 focus-visible:ring-2 focus-visible:ring-[#991B1B] rounded-sm">
            <Avatar name={post.authorName} color={post.communityColor} src={post.authorAvatar} size={38} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onCommunityClick(post.communityId)}
                className="font-display font-bold text-[#0F172A] text-sm hover:text-[#991B1B] transition-colors truncate leading-tight"
              >
                {post.authorName}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase tracking-wider" title={absoluteTime(post.timestamp)}>
                {relativeTime(post.timestamp)}
              </span>
              <TypeBadge type={post.type} small />
            </div>
          </div>
        </div>

        {/* Title + Body Text */}
        <div className="mb-3">
          <h3 className="font-display font-bold text-[#0F172A] text-sm mb-1">{post.title}</h3>
          <p className="text-sm text-[#374151] leading-relaxed">{displayBody}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="mt-1 font-mono text-[0.52rem] text-[#991B1B] uppercase tracking-wider hover:underline font-bold"
            >
              {expanded ? 'Collapse text' : 'Read full post'}
            </button>
          )}
        </div>

        {/* Image Grid */}
        <PostImageGrid
          images={post.images}
          onImageClick={(i) => { setLightboxIdx(i); setLightboxOpen(true); }}
        />

        {/* Hashtags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="inline-flex items-center gap-0.5 font-mono text-[0.52rem] text-[#991B1B] uppercase tracking-wider bg-[#991B1B]/6 hover:bg-[#991B1B]/12 px-2 py-0.5 rounded-sm transition-colors"
              >
                <Hash size={9} />{tag}
              </button>
            ))}
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-[#D8D2C4]">
          <button
            onClick={() => onLike(post.id)}
            aria-pressed={post.liked}
            aria-label={`Like post, ${post.likes} likes`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all active:scale-95 ${post.liked ? 'text-[#991B1B] bg-[#991B1B]/10 font-bold' : 'text-[#6B7280] hover:text-[#991B1B] hover:bg-[#991B1B]/8'}`}
          >
            <Heart size={14} weight={post.liked ? 'fill' : 'regular'} />
            <span>{post.likes}</span>
          </button>

          <button
            onClick={() => setCommentsOpen(o => !o)}
            aria-expanded={commentsOpen}
            aria-label={`Comments, ${post.comments} comments`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-all active:scale-95 ${commentsOpen ? 'text-[#0F172A] bg-[#0F172A]/10 font-bold' : 'text-[#6B7280] hover:text-[#0F172A] hover:bg-[#0F172A]/8'}`}
          >
            <ChatCircle size={14} />
            <span>{post.comments}</span>
          </button>

          <button
            onClick={() => onShare(post.id)}
            aria-label="Share post link"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#1A3A2A] hover:bg-[#1A3A2A]/8 transition-all active:scale-95"
          >
            <ShareNetwork size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={() => onView(post)}
            aria-label="View post detail"
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider bg-[#0F172A] text-white hover:bg-[#1E293B] transition-all active:scale-95 shadow-sm"
          >
            <ArrowsOut size={13} />
            <span>Inspect</span>
          </button>
        </div>

        {/* Inline Comments Thread */}
        <AnimatePresence>
          {commentsOpen && (
            <InlineComments postId={post.id} onCommentAdded={() => onCommentPosted(post.id)} />
          )}
        </AnimatePresence>
      </motion.article>
    </>
  );
}
