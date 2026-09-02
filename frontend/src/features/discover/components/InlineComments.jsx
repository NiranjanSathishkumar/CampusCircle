import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { CircleNotch, PaperPlaneTilt } from '@phosphor-icons/react';
import { relativeTime, mapComment } from '@/features/discover/discoverUtils';
import { listComments, addComment } from '@/features/discover/feed.api';
import Avatar from '@/features/discover/components/DiscoverAvatar';

/* ─────────────────────────────────────────────────────────────
   INLINE COMMENT SECTION — lazy-loads the thread from the API
   the first time it's opened.
   ───────────────────────────────────────────────────────────── */

export default function InlineComments({ postId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    listComments(postId)
      .then(({ comments: apiComments }) => {
        if (!cancelled) setComments(apiComments.map(mapComment));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      const { comment } = await addComment(postId, content);
      setComments(cs => [...cs, mapComment(comment)]);
      setText('');
      onCommentAdded?.();
    } catch {
      // leave the draft text in place so the student can retry
    } finally {
      setPosting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="border-t border-[#D8D2C4] mt-3 pt-3 overflow-hidden"
    >
      {loading && (
        <div className="flex items-center gap-2 text-[#9CA3AF] text-xs mb-3">
          <CircleNotch size={13} className="animate-spin" /> Loading comments...
        </div>
      )}

      {!loading && error && (
        <p className="text-xs text-[#991B1B] mb-3">Could not load comments. Try again later.</p>
      )}

      {!loading && !error && comments.length > 0 && (
        <div className="space-y-2.5 mb-3">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2.5 items-start bg-[#F5F2EA] p-2.5 rounded-sm border border-[#D8D2C4]/60">
              <Avatar name={c.author} src={c.avatar} size={26} color="#6B7280" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display font-semibold text-[#0F172A] text-xs">{c.author}</span>
                  <span className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase">{relativeTime(c.timestamp)}</span>
                </div>
                <p className="text-xs text-[#374151] mt-0.5 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 min-w-0 px-3 py-2 text-xs bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] transition-colors"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
        />
        <button
          type="submit"
          disabled={!text.trim() || posting}
          aria-label="Submit comment"
          className="px-3 py-2 bg-[#0F172A] text-white rounded-sm flex items-center gap-1.5 disabled:opacity-40 hover:bg-[#1E293B] transition-colors active:scale-[0.97]"
        >
          {posting ? <CircleNotch size={13} className="animate-spin" /> : <PaperPlaneTilt size={13} />}
        </button>
      </form>
    </motion.div>
  );
}
