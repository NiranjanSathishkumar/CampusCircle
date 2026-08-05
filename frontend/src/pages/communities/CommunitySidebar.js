import React from "react";

function CommunitySidebar({
  club,
  isFollowed,
  setIsFollowed,
  handleShare,
  copied,
  applied,
  setApplied,
}) {
  return (
    <aside className="cdp__sidebar">
      <div className="cdp__action-card">
        {/* Header / Stats */}
        <div className="cdp__action-header">
          <div>
            <span className="cdp__members-lg">{club.members.toLocaleString()}</span>
            <span className="cdp__members-sub"> active members</span>
          </div>
          <span
            className={`cdp__status-pill ${
              club.recruiting ? "cdp__status-pill--recruiting" : "cdp__status-pill--active"
            }`}
          >
            {club.recruiting ? "🔥 Recruiting" : "✓ Active"}
          </span>
        </div>

        {/* Follow / Join Primary Button */}
        <button
          className={`cdp__follow-btn ${isFollowed ? "cdp__follow-btn--following" : ""}`}
          onClick={() => setIsFollowed(!isFollowed)}
        >
          <i className={`fa-solid ${isFollowed ? "fa-check" : "fa-plus"}`} />
          {isFollowed ? "Following Community" : "Join & Follow Club"}
        </button>

        {/* Secondary Action Buttons */}
        <div className="cdp__aux-btns">
          <button className="cdp__aux-btn" onClick={handleShare}>
            <i className={`fa-solid ${copied ? "fa-check" : "fa-share-nodes"}`} />
            {copied ? "Copied!" : "Share"}
          </button>
          {club.recruiting && (
            <button
              className={`cdp__aux-btn ${applied ? "cdp__aux-btn--applied" : ""}`}
              onClick={() => setApplied(true)}
            >
              <i className="fa-solid fa-user-plus" />
              {applied ? "Applied" : "Apply"}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="cdp__sidebar-divider" />

        {/* Quick Overview Meta List */}
        <ul className="cdp__meta-list">
          <li>
            <i className="fa-solid fa-tag" />
            <span>
              Category: <strong>{club.categoryLabel}</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-users" />
            <span>
              Members: <strong>{club.members.toLocaleString()}</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-calendar-check" />
            <span>
              Active Events: <strong>{club.activeEvents} events</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-user-tie" />
            <span>
              Lead: <strong>{club.leadName || "Student Council"}</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-clock" />
            <span>
              Founded: <strong>{club.established}</strong>
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default CommunitySidebar;
