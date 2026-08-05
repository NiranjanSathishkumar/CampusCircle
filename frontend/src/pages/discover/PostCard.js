import React, { useState } from "react";
import { Link } from "react-router-dom";
import { COMMUNITIES, TYPE_STYLES } from "./discoverData";
import CommentSection from "./CommentSection";
import { useToast } from "../../context/ToastContext";

/* ─────────────────────────────────────────────────────────────
   MULTI-IMAGE FEED GRID COMPONENT
───────────────────────────────────────────────────────────── */
function PostImageGrid({ images, onImageClick }) {
  if (!images || images.length === 0) return null;
  const count = images.length;

  if (count === 1) {
    return (
      <div className="disc-img-grid disc-img-grid--1" onClick={() => onImageClick(0)}>
        <img src={images[0]} alt="Post media 1" className="disc-img-item" loading="lazy" />
        <div className="disc-img-overlay"><i className="fa-solid fa-expand" /></div>
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className="disc-img-grid disc-img-grid--2">
        {images.map((url, i) => (
          <div key={i} className="disc-img-cell" onClick={() => onImageClick(i)}>
            <img src={url} alt={`Post media ${i + 1}`} className="disc-img-item" loading="lazy" />
            <div className="disc-img-overlay"><i className="fa-solid fa-expand" /></div>
          </div>
        ))}
      </div>
    );
  }
  if (count === 3) {
    return (
      <div className="disc-img-grid disc-img-grid--3">
        <div className="disc-img-cell disc-img-cell--main" onClick={() => onImageClick(0)}>
          <img src={images[0]} alt="Post media 1" className="disc-img-item" loading="lazy" />
          <div className="disc-img-overlay"><i className="fa-solid fa-expand" /></div>
        </div>
        <div className="disc-img-column">
          {images.slice(1, 3).map((url, i) => (
            <div key={i + 1} className="disc-img-cell" onClick={() => onImageClick(i + 1)}>
              <img src={url} alt={`Post media ${i + 2}`} className="disc-img-item" loading="lazy" />
              <div className="disc-img-overlay"><i className="fa-solid fa-expand" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayImages = images.slice(0, 4);
  const remaining = count - 4;
  return (
    <div className="disc-img-grid disc-img-grid--4">
      {displayImages.map((url, i) => {
        const isLast = i === 3 && remaining > 0;
        return (
          <div key={i} className="disc-img-cell" onClick={() => onImageClick(i)}>
            <img src={url} alt={`Post media ${i + 1}`} className="disc-img-item" loading="lazy" />
            {isLast ? (
              <div className="disc-img-more-badge"><span>+{remaining + 1}</span></div>
            ) : (
              <div className="disc-img-overlay"><i className="fa-solid fa-expand" /></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   POST CARD — premium social-feed redesign
───────────────────────────────────────────────────────────── */
function PostCard({ post, index, onLike, onBookmark, onAddComment, onOpenModal, onTagClick }) {
  const { showToast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const tc   = TYPE_STYLES[post.type] || TYPE_STYLES.Update;
  const comm = COMMUNITIES.find((c) => c.id === post.community);
  const images = post.images || (post.imageUrl ? [post.imageUrl] : []);
  const authorId = post.authorId || post.id;

  const handleShare = () => {
    setCopied(true);
    showToast("Post link copied to clipboard", "copy");
    setTimeout(() => setCopied(false), 2000);
  };

  const PREVIEW_LINES = 4;
  const lines = post.content.split("\n");
  const isLong = lines.length > PREVIEW_LINES || post.content.length > 240;
  const [expanded, setExpanded] = useState(false);
  const preview = expanded ? post.content : lines.slice(0, PREVIEW_LINES).join("\n");

  return (
    <article
      className={`disc-post ${post.pinned ? "disc-post--pinned" : ""}`}
      style={{ "--bar-color": post.accentColor }}
    >
      {/* ── Header ── */}
      <div className="disc-post-header">
        {/* Avatar */}
        <Link to={comm ? `/communities/${comm.id}` : `/profile/${authorId}`} className="disc-post-avatar-wrap" title={`View ${post.author}`}>
          <div
            className="disc-post-avatar"
            style={{ background: `${post.accentColor}18`, border: `2px solid ${post.accentColor}40` }}
          >
            <i className={`fa-solid ${post.authorIcon}`} style={{ color: post.accentColor }} />
          </div>
          {comm && <div className="disc-post-comm-dot" style={{ background: comm.color }} title={comm.label} />}
        </Link>

        {/* Author info */}
        <div className="disc-post-author-info">
          <div className="disc-post-author-row">
            <Link to={comm ? `/communities/${comm.id}` : `/profile/${authorId}`} className="disc-post-author" style={{ textDecoration: "none", color: "inherit" }}>
              {post.author}
            </Link>
          </div>
          <div className="disc-post-meta-row">
            <span className="disc-post-time">
              <i className="fa-regular fa-clock" /> {post.time}
            </span>
          </div>
        </div>


        {/* Type badge — top right */}
        <span
          className="disc-post-type-badge"
          style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}
        >
          <i className={`fa-solid ${tc.icon}`} /> {post.type}
        </span>
      </div>

      {/* ── Post body text ── */}
      <div className="disc-post-content" onClick={() => onOpenModal(post, 0)}>
        <p className="disc-post-text-p">
          {preview}{!expanded && isLong ? "…" : ""}
        </p>
        {isLong && !expanded && (
          <button
            className="disc-post-readmore"
            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          >
            Read more <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.65rem" }} />
          </button>
        )}
      </div>

      {/* ── Media grid ── */}
      {images.length > 0 && (
        <div className="disc-post-media-container disc-post-media-padded">
          <PostImageGrid images={images} onImageClick={(idx) => onOpenModal(post, idx)} />
        </div>
      )}

      {/* ── Tags ── */}
      {post.tags?.length > 0 && (
        <div className="disc-post-tags">
          {post.tags.map((t) => (
            <span
              key={t}
              className="disc-post-tag"
              onClick={(e) => { e.stopPropagation(); onTagClick && onTagClick(t); }}
            >
              <i className="fa-solid fa-hashtag" style={{ fontSize: "0.6rem", opacity: 0.7 }} /> {t.replace(/^#/, "")}
            </span>
          ))}
        </div>
      )}



      {/* ── Action footer ── */}
      <div className="disc-post-footer">
        <button
          className={`disc-action-btn ${post.liked ? "disc-action-btn--liked" : ""}`}
          onClick={() => onLike(post.id)}
        >
          <i className={`fa-${post.liked ? "solid" : "regular"} fa-heart`} />
          <span>{post.liked ? "Liked" : "Like"}</span>
        </button>
        <button
          className={`disc-action-btn ${showComments ? "disc-action-btn--active" : ""}`}
          onClick={() => setShowComments((p) => !p)}
        >
          <i className="fa-regular fa-comment" />
          <span>Comment</span>
        </button>
        <button className="disc-action-btn" onClick={handleShare}>
          <i className={`fa-${copied ? "solid" : "regular"} fa-share-from-square`} />
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
        <button
          className={`disc-action-btn ${post.bookmarked ? "disc-action-btn--bookmarked" : ""}`}
          onClick={() => {
            onBookmark(post.id);
            showToast(
              post.bookmarked ? "Removed from bookmarks" : "Post saved to bookmarks",
              "bookmark"
            );
          }}
        >
          <i className={`fa-${post.bookmarked ? "solid" : "regular"} fa-bookmark`} />
          <span>{post.bookmarked ? "Saved" : "Save"}</span>
        </button>
        <button className="disc-action-btn disc-action-btn--view" onClick={() => onOpenModal(post, 0)}>
          <i className="fa-solid fa-expand" />
          <span>View</span>
        </button>
      </div>

      {/* ── Inline comments ── */}
      {showComments && (
        <div className="disc-post-comments-section">
          <CommentSection
            comments={post.commentList}
            onAddComment={(c) => onAddComment(post.id, c)}
          />
        </div>
      )}
    </article>
  );
}

export default PostCard;
export { PostImageGrid };
