import React, { useState } from 'react';

function EmptyState({ icon, message }) {
  return (
    <div className="ptab-empty">
      <div className="ptab-empty-icon">
        <i className={icon} />
      </div>
      <p className="ptab-empty-msg">{message}</p>
    </div>
  );
}

function BookmarksTab({ bookmarks = [], onUnbookmark = () => {} }) {
  const [bookmarkSubTab, setBookmarkSubTab] = useState("events");

  return (
    <div className="ptab-view-card">
      <div className="ptab-view-header">
        <div className="ptab-header-text">
          <h3 className="ptab-view-title">Bookmarks</h3>
          <p className="ptab-view-sub">Organize and revisit your favorite campus discoveries.</p>
        </div>
        {/* Events / Posts Sub-tabs */}
        <div className="ptab-subtab-pills">
          <button
            className={`ptab-pill-btn ${bookmarkSubTab === "events" ? "ptab-pill-btn--active" : ""}`}
            onClick={() => setBookmarkSubTab("events")}
          >
            Events
          </button>
          <button
            className={`ptab-pill-btn ${bookmarkSubTab === "posts" ? "ptab-pill-btn--active" : ""}`}
            onClick={() => setBookmarkSubTab("posts")}
          >
            Posts
          </button>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState icon="fa-regular fa-bookmark" message="No bookmarked discoveries saved yet." />
      ) : (
        <div className="ptab-bookmarks-grid">
          {bookmarks.map((b) => (
            <div key={b.id} className="ptab-bookmark-card">
              <div className="ptab-bm-img-wrap">
                {b.imageUrl ? (
                  <img src={b.imageUrl} alt={b.title} className="ptab-bm-img" />
                ) : (
                  <div className="ptab-bm-img-placeholder">
                    <i className="fa-solid fa-graduation-cap" />
                  </div>
                )}
                {b.dateBadge && (
                  <span className="ptab-bm-date-badge">{b.dateBadge}</span>
                )}
              </div>

              <div className="ptab-bm-body">
                <h4 className="ptab-bm-title">{b.title}</h4>
                <p className="ptab-bm-location">
                  <i className="fa-solid fa-location-dot" /> {b.meta}
                </p>

                <div className="ptab-bm-footer">
                  <button className="ptab-bm-details-btn">
                    View Details <i className="fa-solid fa-arrow-right" />
                  </button>
                  <button
                    className="ptab-bm-icon-btn"
                    onClick={() => onUnbookmark(b.id)}
                    title="Remove bookmark"
                  >
                    <i className="fa-solid fa-bookmark" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookmarksTab;
