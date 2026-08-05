import React from "react";
import { Link, useNavigate } from "react-router-dom";

function CommunityHeroBanner({ club }) {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <div className="cdp__topbar">
        <button className="cdp__back-btn" onClick={() => navigate("/communities")}>
          <i className="fa-solid fa-arrow-left" /> Back to Communities
        </button>
        <nav className="cdp__breadcrumb">
          <Link to="/communities">Communities</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>{club.categoryLabel}</span>
          <i className="fa-solid fa-chevron-right" />
          <span className="cdp__breadcrumb-current">{club.name}</span>
        </nav>
      </div>

      {/* ── Hero Banner ── */}
      <div className="cdp__hero">
        <img
          src={club.coverImage || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"}
          alt={club.name}
          className="cdp__hero-img"
        />
        <div className="cdp__hero-overlay" />

        {/* Top-Left Badge: Category */}
        <div className="cdp__hero-badge-top-left">
          <span className="cdp__chip cdp__chip--cat">
            <i className="fa-solid fa-layer-group" /> {club.categoryLabel}
          </span>
        </div>

        {/* Top-Right Badge: Recruiting status */}
        <div className="cdp__hero-badge-top-right">
          {club.recruiting ? (
            <span className="cdp__chip cdp__chip--recruiting">
              <i className="fa-solid fa-circle-dot" /> Recruiting Now
            </span>
          ) : (
            <span className="cdp__chip cdp__chip--active">
              <i className="fa-solid fa-check" /> Active Society
            </span>
          )}
        </div>

        {/* Bottom-Left Badge: Established Year */}
        <div className="cdp__hero-badge-bottom-left">
          <span className="cdp__chip cdp__chip--est">
            <i className="fa-solid fa-shield-halved" /> Est. {club.established}
          </span>
        </div>
      </div>
    </>
  );
}

export default CommunityHeroBanner;
