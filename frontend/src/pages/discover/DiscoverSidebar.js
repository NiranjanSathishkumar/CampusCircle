import React from "react";
import { COMMUNITIES } from "./discoverData";

function DiscoverSidebar({ handleTagClick, setActiveCommunity }) {
  const trendingTags = [
    "#CodeClash2025",
    "#GenAI",
    "#HackFest36H",
    "#DesignSprint",
    "#Crescendo",
    "#Photography",
  ];

  return (
    <aside className="disc-sidebar">
      {/* Trending Topics Widget */}
      <div className="disc-widget">
        <h4 className="disc-widget-title">
          <i className="fa-solid fa-arrow-trend-up disc-widget-icon" /> Trending Topics
        </h4>
        {trendingTags.map((tag, i) => (
          <div
            key={tag}
            className="disc-trending-item"
            onClick={() => handleTagClick(tag)}
          >
            <span className="disc-trending-rank">#{i + 1}</span>
            <div>
              <p className="disc-trending-tag">{tag}</p>
              <p className="disc-trending-count">{48 - i * 7} active posts</p>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Communities Widget */}
      <div className="disc-widget">
        <h4 className="disc-widget-title">
          <i className="fa-solid fa-users disc-widget-icon" /> Featured Communities
        </h4>
        {COMMUNITIES.filter((c) => c.id !== "all")
          .slice(0, 5)
          .map((c) => (
            <div
              key={c.id}
              className="disc-comm-widget-item"
              onClick={() => setActiveCommunity(c.id)}
            >
              <div
                className="disc-comm-widget-icon"
                style={{
                  background: `${c.color}18`,
                  border: `1px solid ${c.color}40`,
                }}
              >
                <i className={`fa-solid ${c.icon}`} style={{ color: c.color }} />
              </div>
              <span className="disc-comm-widget-label">{c.label}</span>
              <i className="fa-solid fa-chevron-right disc-comm-widget-arrow" />
            </div>
          ))}
      </div>

      {/* Organiser Publishing Note Widget */}
      <div className="disc-widget disc-widget--note">
        <i className="fa-solid fa-shield-check disc-note-icon" />
        <p className="disc-note-text">
          <strong>Organiser-Only Publishing</strong>
          <br />
          Only verified club leads can create posts. All students can comment, like, save, and
          share!
        </p>
      </div>
    </aside>
  );
}

export default DiscoverSidebar;
