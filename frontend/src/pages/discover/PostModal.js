import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { TYPE_STYLES } from "./discoverData";
import CommentSection from "./CommentSection";
import { useToast } from "../../context/ToastContext";


/* ─────────────────────────────────────────────────────────────
   FULL-SCREEN IMAGE LIGHTBOX
───────────────────────────────────────────────────────────── */
function ImageLightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);

  const prev = useCallback(() => setIdx((i) => (i > 0 ? i - 1 : images.length - 1)), [images.length]);
  const next = useCallback(() => setIdx((i) => (i < images.length - 1 ? i + 1 : 0)), [images.length]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose, prev, next]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = images[idx];
    link.download = `image-${idx + 1}.jpg`;
    link.target = "_blank";
    link.click();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(images[idx]).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="disc-lightbox-overlay" onClick={onClose}>
      <div className="disc-lightbox" onClick={(e) => e.stopPropagation()}>
        {/* Top toolbar */}
        <div className="disc-lightbox-toolbar">
          <div className="disc-lightbox-toolbar-left">
            {images.length > 1 && (
              <span className="disc-lightbox-counter">
                <i className="fa-solid fa-images" /> {idx + 1} / {images.length}
              </span>
            )}
          </div>
          <div className="disc-lightbox-actions">
            <button className="disc-lightbox-btn" onClick={() => setZoom((z) => !z)} title={zoom ? "Fit to screen" : "Zoom in"}>
              <i className={`fa-solid fa-${zoom ? "compress" : "expand"}`} />
              <span>{zoom ? "Fit" : "Zoom"}</span>
            </button>
            <button className="disc-lightbox-btn" onClick={handleCopyLink} title="Copy link">
              <i className={`fa-solid fa-${copied ? "check" : "link"}`} />
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>
            <button className="disc-lightbox-btn disc-lightbox-btn--download" onClick={handleDownload} title="Download">
              <i className="fa-solid fa-download" />
              <span>Download</span>
            </button>
            <button className="disc-lightbox-btn disc-lightbox-btn--close" onClick={onClose} title="Close (Esc)">
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        {/* Image area */}
        <div className={`disc-lightbox-img-area ${zoom ? "disc-lightbox-img-area--zoom" : ""}`}>
          <img
            src={images[idx]}
            alt={`Full view ${idx + 1}`}
            className={`disc-lightbox-img ${zoom ? "disc-lightbox-img--zoom" : ""}`}
          />
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button className="disc-lightbox-arrow disc-lightbox-arrow--prev" onClick={(e) => { e.stopPropagation(); prev(); }}>
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button className="disc-lightbox-arrow disc-lightbox-arrow--next" onClick={(e) => { e.stopPropagation(); next(); }}>
              <i className="fa-solid fa-chevron-right" />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="disc-lightbox-thumbs">
            {images.map((url, i) => (
              <div
                key={i}
                className={`disc-lightbox-thumb ${i === idx ? "disc-lightbox-thumb--active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              >
                <img src={url} alt={`Thumb ${i + 1}`} />
              </div>
            ))}
          </div>
        )}

        {/* Esc hint */}
        <div className="disc-lightbox-esc-hint">Press Esc to close</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN POST MODAL
───────────────────────────────────────────────────────────── */
function PostModal({ post, initialImageIndex = 0, onClose, onLike, onBookmark, onAddComment }) {
  const { showToast } = useToast();
  const modalRef = useRef(null);
  const images = post.images || (post.imageUrl ? [post.imageUrl] : []);
  const [activeIdx, setActiveIdx] = useState(initialImageIndex);
  const [copied, setCopied] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIdx, setLightboxStartIdx] = useState(0);
  const tc = TYPE_STYLES[post.type] || TYPE_STYLES.Update;

  useEffect(() => {
    setActiveIdx(initialImageIndex);
  }, [initialImageIndex]);

  useEffect(() => {
    if (lightboxOpen) return;
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1)
        setActiveIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === "ArrowRight" && images.length > 1)
        setActiveIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose, images.length, lightboxOpen]);

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleShare = () => {
    setCopied(true);
    showToast("Post link copied to clipboard", "copy");
    setTimeout(() => setCopied(false), 2000);
  };

  const openLightbox = (idx) => {
    setLightboxStartIdx(idx);
    setLightboxOpen(true);
  };

  const totalComments = post.commentList?.length || 0;

  return (
    <>
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          startIdx={lightboxStartIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div className="disc-modal-overlay" onClick={onClose}>
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={`Post by ${post.author}`}
          className="disc-modal disc-modal--fixed"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="disc-modal-inner">
            {/* ── Left Column: Gallery OR Brand Artwork ── */}
            <div className="disc-modal-left">
              {images.length > 0 ? (
                <div className="disc-modal-gallery">
                  <div className="disc-modal-img-wrap">
                    <img
                      src={images[activeIdx] || images[0]}
                      alt={`${post.author} media ${activeIdx + 1}`}
                      className="disc-modal-img disc-modal-img--clickable"
                      onClick={() => openLightbox(activeIdx)}
                      title="Click to view full size"
                    />

                    {/* Expand hint */}
                    <button
                      className="disc-modal-expand-hint"
                      onClick={() => openLightbox(activeIdx)}
                      title="View full size"
                    >
                      <i className="fa-solid fa-expand" />
                    </button>

                    {/* Counter pill */}
                    {images.length > 1 && (
                      <span className="disc-modal-counter">
                        <i className="fa-solid fa-images" /> {activeIdx + 1} / {images.length}
                      </span>
                    )}

                    {/* Arrow navigation */}
                    {images.length > 1 && (
                      <>
                        <button className="disc-modal-arrow disc-modal-arrow--prev" onClick={prevImage} aria-label="Previous photo">
                          <i className="fa-solid fa-chevron-left" />
                        </button>
                        <button className="disc-modal-arrow disc-modal-arrow--next" onClick={nextImage} aria-label="Next photo">
                          <i className="fa-solid fa-chevron-right" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails strip */}
                  {images.length > 1 && (
                    <div className="disc-modal-thumbs-strip">
                      {images.map((url, idx) => (
                        <div
                          key={idx}
                          className={`disc-modal-thumb ${idx === activeIdx ? "disc-modal-thumb--active" : ""}`}
                          onClick={() => setActiveIdx(idx)}
                        >
                          <img src={url} alt={`Thumbnail ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Brand Artwork for Text-Only Posts */
                <div
                  className="disc-modal-artwork"
                  style={{ background: `radial-gradient(circle at top left, ${post.accentColor} 0%, #1e1b4b 100%)` }}
                >
                  <div className="disc-modal-artwork-watermark">
                    <i className={`fa-solid ${post.authorIcon}`} />
                  </div>
                  <div className="disc-modal-artwork-content">
                    <div className="disc-modal-artwork-icon" style={{ color: post.accentColor }}>
                      <i className={`fa-solid ${post.authorIcon}`} />
                    </div>
                    <h3 className="disc-modal-artwork-author">{post.author}</h3>
                    <span className="disc-modal-artwork-type" style={{ background: tc.bg, color: tc.text }}>
                      <i className={`fa-solid ${tc.icon}`} /> {post.type}
                    </span>
                    <p className="disc-modal-artwork-tagline">CampusCircle Official Publication</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column ── */}
            <div className="disc-modal-body">

              {/* Header — author info + close button */}
              <div className="disc-modal-header">
                <Link to={post.community ? `/communities/${post.community}` : `/profile/${post.authorId || post.id}`} onClick={onClose} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <div
                    className="disc-post-avatar"
                    style={{ background: `${post.accentColor}22`, border: `2px solid ${post.accentColor}44`, width: 40, height: 40, flexShrink: 0 }}
                  >
                    <i className={`fa-solid ${post.authorIcon}`} style={{ color: post.accentColor }} />
                  </div>
                  <div className="disc-post-author-info">
                    <div className="disc-post-author-row">
                      <span className="disc-post-author" style={{ fontSize: "0.9rem", color: "inherit" }}>{post.author}</span>
                    </div>
                    <span className="disc-post-time">{post.time}</span>
                  </div>
                </Link>
                <span className="disc-post-type-badge" style={{ background: tc.bg, color: tc.text, borderColor: tc.border }}>
                  <i className={`fa-solid ${tc.icon}`} /> {post.type}
                </span>
                {/* ✅ Close button inside the header — no more overlay bug */}
                <button className="disc-modal-close-btn" onClick={onClose} aria-label="Close">
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="disc-modal-scroll">
                <p className="disc-modal-text">{post.content}</p>

                {post.tags?.length > 0 && (
                  <div className="disc-post-tags" style={{ marginTop: 12, padding: "8px 0 14px" }}>
                    {post.tags.map((t) => (
                      <span key={t} className="disc-post-tag">
                        <i className="fa-solid fa-hashtag" style={{ fontSize: "0.6rem", opacity: 0.7 }} /> {t.replace(/^#/, "")}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Stats Strip ── */}
                <div className="disc-modal-stats-strip">
                  <button
                    className={`disc-modal-stat-item ${post.liked ? "disc-modal-stat-item--liked" : ""}`}
                    onClick={() => onLike(post.id)}
                  >
                    <i className={`fa-${post.liked ? "solid" : "regular"} fa-heart`} />
                    <strong>{post.likes}</strong>
                    <span>likes</span>
                  </button>
                  <span className="disc-modal-stat-sep" />
                  <button
                    className={`disc-modal-stat-item ${commentsOpen ? "disc-modal-stat-item--active" : ""}`}
                    onClick={() => setCommentsOpen((o) => !o)}
                    title={commentsOpen ? "Hide comments" : "Show comments"}
                  >
                    <i className="fa-regular fa-comment" />
                    <strong>{totalComments}</strong>
                    <span>comments</span>
                    <i className={`fa-solid fa-chevron-${commentsOpen ? "up" : "down"}`} style={{ fontSize: "0.6rem", opacity: 0.5 }} />
                  </button>
                  <span className="disc-modal-stat-sep" />
                  <button className="disc-modal-stat-item" onClick={handleShare}>
                    <i className={`fa-${copied ? "solid" : "regular"} fa-share-from-square`} />
                    <strong>{post.shares}</strong>
                    <span>{copied ? "copied!" : "shares"}</span>
                  </button>
                  <span className="disc-modal-stat-sep" />
                  <button
                    className={`disc-modal-stat-item ${post.bookmarked ? "disc-modal-stat-item--saved" : ""}`}
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
                </div>

                {/* ── Comments (collapsible) ── */}
                {commentsOpen && (
                  <>
                    <div className="disc-modal-comments-divider" />
                    <div className="disc-modal-comments-body">
                      <CommentSection
                        comments={post.commentList}
                        onAddComment={(c) => onAddComment(post.id, c)}
                      />
                    </div>
                  </>
                )}

                <div style={{ height: 16 }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PostModal;
