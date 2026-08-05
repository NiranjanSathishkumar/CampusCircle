import React, { useState, useRef } from "react";
import { CURRENT_USER, POST_TYPES } from "./discoverData";

/* ─────────────────────────────────────────────────────────────
   COMPOSE PANEL (organiser only)
───────────────────────────────────────────────────────────── */
function ComposePanel({ onPost }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [type, setType] = useState("Announcement");
  const [tags, setTags] = useState("");
  const [imgPrevs, setImgPrevs] = useState([]);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef(null);

  const pickImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPrevs = files.map((f) => URL.createObjectURL(f));
    setImgPrevs((prev) => [...prev, ...newPrevs]);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImgPrevs((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target);
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearAllImages = () => {
    imgPrevs.forEach((url) => URL.revokeObjectURL(url));
    setImgPrevs([]);
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 700));
    onPost({
      id: Date.now(),
      community: "turing",
      type,
      author: CURRENT_USER.name,
      authorIcon: CURRENT_USER.clubIcon,
      accentColor: CURRENT_USER.accentColor,
      rawDate: new Date().toISOString().slice(0, 10),
      time: "Just now",
      content: text.trim(),
      images: [...imgPrevs],
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith("#") ? t : `#${t}`)),
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      bookmarked: false,
      pinned: false,
      commentList: [],
    });
    setText("");
    setTags("");
    setImgPrevs([]);
    setPosting(false);
    setOpen(false);
  };

  const charCount = text.length;

  return (
    <div className="disc-compose">
      {!open ? (
        <div className="disc-compose-trigger" onClick={() => setOpen(true)}>
          <div className="disc-compose-avatar" style={{ background: `${CURRENT_USER.accentColor}22` }}>
            <i className={`fa-solid ${CURRENT_USER.clubIcon}`} style={{ color: CURRENT_USER.accentColor }} />
          </div>
          <span className="disc-compose-placeholder">Share an update, event, or multi-photo story…</span>
          <button className="disc-compose-open-btn">
            <i className="fa-solid fa-pen-to-square" /> New Post
          </button>
        </div>
      ) : (
        <div className="disc-compose-form">
          <div className="disc-compose-head">
            <div className="disc-compose-avatar" style={{ background: `${CURRENT_USER.accentColor}22` }}>
              <i className={`fa-solid ${CURRENT_USER.clubIcon}`} style={{ color: CURRENT_USER.accentColor }} />
            </div>
            <div>
              <p className="disc-compose-name">{CURRENT_USER.name}</p>
              <p className="disc-compose-role"><i className="fa-solid fa-shield-check" /> Organiser</p>
            </div>
            <button
              className="disc-compose-close"
              onClick={() => {
                setOpen(false);
                clearAllImages();
                setText("");
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          <textarea
            className="disc-compose-textarea"
            placeholder="What's happening? Announce an event, share achievements, post photos…"
            value={text}
            rows={5}
            autoFocus
            maxLength={2000}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="disc-compose-charcount">
            <span className={charCount > 1800 ? "disc-charcount--warn" : ""}>{charCount}</span> / 2000
          </div>

          {imgPrevs.length > 0 && (
            <div className="disc-compose-multi-preview">
              <div className="disc-compose-preview-head">
                <span>Attached Photos ({imgPrevs.length})</span>
                <button className="disc-compose-clear-imgs" onClick={clearAllImages}>Clear all</button>
              </div>
              <div className="disc-compose-grid">
                {imgPrevs.map((url, idx) => (
                  <div key={idx} className="disc-compose-thumb-box">
                    <img src={url} alt={`Upload ${idx + 1}`} className="disc-compose-thumb-img" />
                    <button
                      className="disc-compose-thumb-remove"
                      onClick={() => removeImage(idx)}
                      title="Remove image"
                    >
                      <i className="fa-solid fa-xmark" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="disc-compose-options">
            <button
              className={`disc-compose-icon-btn ${imgPrevs.length > 0 ? "disc-compose-icon-btn--active" : ""}`}
              onClick={() => fileRef.current?.click()}
              title="Attach photos"
            >
              <i className="fa-solid fa-images" />
              <span>{imgPrevs.length > 0 ? `Photos (${imgPrevs.length})` : "Attach Photos"}</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={pickImages}
            />

            <div className="disc-compose-type-wrap">
              <i className="fa-solid fa-tag disc-compose-type-icon" />
              <select
                className="disc-compose-type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {POST_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>

            <input
              className="disc-compose-tags-input"
              placeholder="# Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="disc-compose-actions">
            <button
              className="disc-compose-cancel"
              onClick={() => {
                setOpen(false);
                clearAllImages();
                setText("");
              }}
            >
              Discard
            </button>
            <button
              className="disc-compose-post-btn"
              onClick={handlePost}
              disabled={posting || !text.trim()}
            >
              {posting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" /> Publishing…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane" /> Publish Post
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComposePanel;
