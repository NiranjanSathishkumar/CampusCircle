import React, { useState } from "react";
import { Link } from "react-router-dom";

function CommentSection({ comments, onAddComment }) {
  const [input, setInput] = useState("");

  const post = () => {
    if (!input.trim()) return;
    onAddComment({
      id: Date.now(),
      author: "You",
      avatarUrl: null,
      text: input.trim(),
      time: "Just now"
    });
    setInput("");
  };

  return (
    <div className="disc-comments">
      {comments.map((c) => (
        <div key={c.id} className="disc-comment">
          <Link to={`/profile/${c.authorId || c.id}`} className="disc-comment-avatar" title={`View ${c.author}'s profile`}>
            {c.avatarUrl ? (
              <img src={c.avatarUrl} alt={c.author} />
            ) : (
              <i className="fa-solid fa-user" />
            )}
          </Link>
          <div className="disc-comment-bubble">
            <div className="disc-comment-meta">
              <Link to={`/profile/${c.authorId || c.id}`} className="disc-comment-author" style={{ textDecoration: "none", color: "inherit" }}>
                {c.author}
              </Link>
              <span className="disc-comment-time">{c.time}</span>
            </div>
            <p className="disc-comment-text">{c.text}</p>
          </div>
        </div>
      ))}
      <div className="disc-comment-compose">
        <div className="disc-comment-avatar disc-comment-avatar--you">
          <i className="fa-solid fa-user" />
        </div>
        <div className="disc-comment-input-wrap">
          <input
            className="disc-comment-input"
            placeholder="Write a comment…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && post()}
          />
          <button className="disc-comment-send" onClick={post} disabled={!input.trim()}>
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentSection;
