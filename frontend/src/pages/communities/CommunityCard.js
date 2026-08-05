import React from "react";
import { useNavigate } from "react-router-dom";

function CommunityCard({ club, isFollowed, onToggleFollow, onViewDetails }) {
  const navigate = useNavigate();

  const handleExplore = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(club);
    } else {
      navigate(`/communities/${club.id}`);
    }
  };

  return (
    <div className="comm-card" onClick={handleExplore} style={{ cursor: "pointer" }}>
      {/* Card Cover Banner */}
      <div
        className="comm-card-cover"
        style={{ background: club.coverGradient }}
      >
        {club.coverImage && (
          <img
            src={club.coverImage}
            alt={club.name}
            className="comm-card-cover-img"
          />
        )}
        <div className="comm-card-cover-overlay" />

        {/* Top badges row */}
        <div className="comm-card-cover-top">
          {club.recruiting && (
            <span className="comm-card-recruiting-badge">
              <i className="fa-solid fa-circle-dot" /> Recruiting
            </span>
          )}
          <span className="comm-card-cat-badge">{club.categoryLabel}</span>
        </div>

        {/* Follow button on banner */}
        <button
          className={`comm-card-follow-btn ${isFollowed ? "comm-card-follow-btn--on" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFollow(club.id);
          }}
        >
          <i className={`fa-solid ${isFollowed ? "fa-check" : "fa-plus"}`} />
          {isFollowed ? "Following" : "Follow"}
        </button>
      </div>

      {/* Card Content Body */}
      <div className="comm-card-body">
        {/* Floating avatar */}
        <div className="comm-card-avatar" style={{ color: club.accentColor }}>
          <i className={`fa-solid ${club.icon}`} />
        </div>

        <div className="comm-card-info">
          <h4 className="comm-card-name">{club.name}</h4>
          <p className="comm-card-tagline">{club.tagline}</p>

          <div className="comm-card-stats">
            <span>
              <i className="fa-solid fa-users" />
              <strong>{club.members.toLocaleString()}</strong> members
            </span>
            <span>
              <i className="fa-solid fa-calendar-day" />
              <strong>{club.activeEvents}</strong> active events
            </span>
          </div>
        </div>

        <button className="comm-card-details-btn" onClick={handleExplore}>
          Explore Club <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}

export default CommunityCard;
