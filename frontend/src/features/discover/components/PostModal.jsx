import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { absoluteTime, relativeTime, mapComment } from '@/features/discover/discoverUtils';
import { listComments, addComment } from '@/features/discover/feed.api';
import { ArrowLeft, ArrowRight, ArrowsOut, CircleNotch, Hash, Heart, PaperPlaneTilt, ShareNetwork, X } from '@phosphor-icons/react';
import Avatar from '@/features/discover/components/DiscoverAvatar';
import TypeBadge from '@/features/discover/components/PostTypeBadge';

/* ─────────────────────────────────────────────────────────────
   POST DETAIL MODAL
   ───────────────────────────────────────────────────────────── */

export default function PostModal({ post, onClose, onLike, onShare, onCommentPosted, onOpenLightbox }) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState(false);
  const [posting, setPosting] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setCommentsLoading(true);
    setCommentsError(false);
    listComments(post.id)
      .then(({ comments: apiComments }) => {
        if (!cancelled) setComments(apiComments.map(mapComment));
      })
      .catch(() => {
        if (!cancelled) setCommentsError(true);
      })
      .finally(() => {
        if (!cancelled) setCommentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [post.id]);

  useEffect(() => {
    const prev = document.activeElement;
    modalRef.current?.focus();
    const handle = (e) => {
      if (e.key === 'Escape') onClose();
      if (post.images.length > 0) {
        if (e.key === 'ArrowLeft') setGalleryIndex(i => Math.max(0, i - 1));
        if (e.key === 'ArrowRight') setGalleryIndex(i => Math.min(post.images.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      prev?.focus?.();
    };
  }, [post.images.length, onClose]);

  const handleModalComment = async (e) => {
    e.preventDefault();
    const content = commentText.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const { comment } = await addComment(post.id, content);
      setComments(cs => [...cs, mapComment(comment)]);
      setCommentText('');
      onCommentPosted(post.id);
    } catch {
      // leave the draft text in place so the student can retry
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 overflow-y-auto bg-[#0F172A]/75 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`Post by ${post.authorName}`}
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-5xl bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm shadow-2xl overflow-hidden outline-none max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 z-20 w-8 h-8 border border-[#D8D2C4] rounded-sm flex items-center justify-center text-[#6B7280] hover:text-[#0F172A] hover:border-[#0F172A] transition-colors bg-[#F5F2EA] shadow-sm active:scale-95"
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 overflow-hidden">
          {/* LEFT: Media or Editorial Canvas */}
          <div className="relative bg-[#0F172A] overflow-hidden flex flex-col justify-center min-h-[300px] lg:min-h-0">
            {post.images.length > 0 ? (
              <>
                <button
                  onClick={() => onOpenLightbox(galleryIndex)}
                  className="absolute inset-0 group w-full h-full"
                  aria-label="Open full-screen image"
                >
                  <img
                    src={post.images[galleryIndex]}
                    alt={`Image ${galleryIndex + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-[#0F172A]/0 group-hover:bg-[#0F172A]/20 transition-colors flex items-center justify-center">
                    <ArrowsOut size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
                <div className="absolute top-3 left-3 bg-[#0F172A]/80 text-white font-mono text-[0.55rem] uppercase tracking-widest px-2.5 py-1 rounded-sm pointer-events-none">
                  {galleryIndex + 1} / {post.images.length}
                </div>
                {post.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setGalleryIndex(i => Math.max(0, i - 1))}
                      disabled={galleryIndex === 0}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0F172A]/70 hover:bg-[#0F172A] flex items-center justify-center text-white rounded-sm transition-colors disabled:opacity-20 z-10"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      onClick={() => setGalleryIndex(i => Math.min(post.images.length - 1, i + 1))}
                      disabled={galleryIndex === post.images.length - 1}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0F172A]/70 hover:bg-[#0F172A] flex items-center justify-center text-white rounded-sm transition-colors disabled:opacity-20 z-10"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </>
                )}
                {post.images.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex gap-1.5 justify-center px-3 z-10">
                    {post.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIndex(i)}
                        className={`w-9 h-7 rounded-sm overflow-hidden border-2 transition-all ${i === galleryIndex ? 'border-white opacity-100 scale-105' : 'border-white/30 opacity-50 hover:opacity-90'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Editorial Artwork for text-only posts */
              <div className="editorial-canvas p-8 text-center" style={{ backgroundColor: post.communityColor }}>
                <div className="editorial-canvas-pattern" />
                <div className="text-5xl mb-3 z-10">{post.communityIcon}</div>
                <h3 className="font-display font-bold text-white text-xl tracking-tight z-10">{post.communityName}</h3>
                <p className="font-mono text-white/60 text-[0.55rem] uppercase tracking-widest mt-2 z-10">CampusCircle Announcement</p>
              </div>
            )}
          </div>

          {/* RIGHT: Content & Discussion */}
          <div className="flex flex-col h-full overflow-hidden bg-[#F5F2EA]">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Author & Header */}
              <div className="flex items-start justify-between gap-3 mb-4 pr-6">
                <div className="flex items-center gap-3">
                  <Avatar name={post.authorName} color={post.communityColor} src={post.authorAvatar} size={40} />
                  <div>
                    <p className="font-display font-bold text-[#0F172A] text-sm">{post.authorName}</p>
                    <p className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase mt-0.5" title={absoluteTime(post.timestamp)}>
                      {relativeTime(post.timestamp)}
                    </p>
                  </div>
                </div>
                <TypeBadge type={post.type} />
              </div>

              {/* Title + Body */}
              <h2 className="font-display font-bold text-[#0F172A] text-lg mb-2">{post.title}</h2>
              <p className="text-sm text-[#374151] leading-relaxed mb-4">{post.body}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 font-mono text-[0.52rem] text-[#991B1B] uppercase tracking-wider bg-[#991B1B]/8 px-2 py-0.5 rounded-sm">
                      <Hash size={9} />{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 py-3 border-t border-b border-[#D8D2C4] mb-4">
                <button
                  onClick={() => onLike(post.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors active:scale-95 ${post.liked ? 'text-[#991B1B] bg-[#991B1B]/10 font-bold' : 'text-[#6B7280] hover:text-[#991B1B]'}`}
                >
                  <Heart size={15} weight={post.liked ? 'fill' : 'regular'} />
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => onShare(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider text-[#6B7280] hover:text-[#0F172A] transition-colors active:scale-95"
                >
                  <ShareNetwork size={15} />
                  <span>Share</span>
                </button>
              </div>

              {/* Comments Header */}
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono font-bold text-[0.55rem] text-[#0F172A] uppercase tracking-widest">
                  Discussion ({post.comments})
                </span>
              </div>

              {/* Comments List */}
              {commentsLoading && (
                <div className="flex items-center gap-2 text-[#9CA3AF] text-xs mb-4">
                  <CircleNotch size={13} className="animate-spin" /> Loading comments...
                </div>
              )}

              {!commentsLoading && commentsError && (
                <p className="text-xs text-[#991B1B] mb-4">Could not load comments. Try again later.</p>
              )}

              {!commentsLoading && !commentsError && (
                <div className="space-y-3 mb-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-2.5 items-start bg-[#F0EDE5] p-3 rounded-sm border border-[#D8D2C4]/70">
                      <Avatar name={c.author} src={c.avatar} size={28} color="#6B7280" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-display font-semibold text-[#0F172A] text-xs">{c.author}</span>
                          <span className="font-mono text-[0.46rem] text-[#9CA3AF] uppercase">{relativeTime(c.timestamp)}</span>
                        </div>
                        <p className="text-xs text-[#374151] mt-1 leading-relaxed">{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handleModalComment} className="p-4 border-t border-[#D8D2C4] bg-[#F0EDE5] flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 min-w-0 px-3.5 py-2 text-xs bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim() || posting}
                className="px-4 py-2 bg-[#0F172A] text-white rounded-sm text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 hover:bg-[#1E293B] transition-colors active:scale-95"
              >
                {posting ? <CircleNotch size={13} className="animate-spin" /> : <PaperPlaneTilt size={13} />}
                Send
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
