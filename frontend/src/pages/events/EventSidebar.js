import React from "react";

function EventSidebar({
  event,
  pct,
  registered,
  setShowConfirmModal,
  saved,
  setSaved,
  handleShare,
  copied,
}) {
  return (
    <aside className="edp__sidebar">
      <div className="edp__action-card">
        {/* Price Header */}
        <div className="edp__action-price-row">
          <div>
            <span className="edp__price-lg">{event.payment}</span>
            <span className="edp__price-sub"> / registration</span>
          </div>
          <span
            className={`edp__status-pill ${
              pct >= 80 ? "edp__status-pill--hot" : "edp__status-pill--open"
            }`}
          >
            {pct >= 80 ? "🔥 Filling Fast" : "✓ Open"}
          </span>
        </div>

        {/* Seats Progress */}
        <div className="edp__progress-block">
          <div className="edp__progress-header">
            <span className="edp__progress-count">
              <strong>{registered ? event.registered + 1 : event.registered}</strong> /{" "}
              {event.capacity} seats
            </span>
            <span className="edp__progress-pct">{pct}%</span>
          </div>
          <div className="edp__progress-track">
            <div
              className="edp__progress-fill"
              style={{ width: `${registered ? Math.min(100, pct + 1) : pct}%` }}
            />
          </div>
        </div>

        {/* Register / Registered State */}
        {registered ? (
          <div className="edp__registered-banner">
            <i className="fa-solid fa-circle-check" /> You're Registered!
          </div>
        ) : (
          <button
            className="edp__register-btn"
            onClick={() => setShowConfirmModal(true)}
          >
            Register Now <i className="fa-solid fa-arrow-right" />
          </button>
        )}

        {/* Save & Share */}
        <div className="edp__aux-btns">
          <button
            className={`edp__aux-btn ${saved ? "edp__aux-btn--saved" : ""}`}
            onClick={() => setSaved((p) => !p)}
          >
            <i className={`fa-${saved ? "solid" : "regular"} fa-bookmark`} />
            {saved ? "Saved" : "Save"}
          </button>
          <button className="edp__aux-btn" onClick={handleShare}>
            <i className="fa-solid fa-share-nodes" />
            {copied ? "Copied!" : "Share"}
          </button>
        </div>

        {/* Divider */}
        <div className="cdp__sidebar-divider" />

        {/* Quick Meta List */}
        <ul className="edp__meta-list">
          <li>
            <i className="fa-solid fa-building" />
            <span>
              Host: <strong>{event.hostName}</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-tag" />
            <span>
              Category: <strong>{event.category}</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-user-group" />
            <span>
              Format: <strong>{event.teamSize}</strong>
            </span>
          </li>
          <li>
            <i className="fa-solid fa-location-dot" />
            <span>
              Venue: <strong>{event.venue}</strong>
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default EventSidebar;
