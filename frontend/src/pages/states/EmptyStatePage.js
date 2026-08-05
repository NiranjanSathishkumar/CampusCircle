import React from "react";
import { Link } from "react-router-dom";
import "./StatePages.css";

/**
 * EmptyStatePage — Shown when a section has no data yet.
 * For example: no events created, no communities joined, no buddies matched.
 * Encourages users to take their first action.
 */
function EmptyStatePage() {
  return (
    <div className="sp-page sp-page--empty">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-icon-wrap sp-icon-wrap--primary">
          <i className="fa-solid fa-inbox" />
        </div>

        <h1 className="sp-title">Nothing Here Yet</h1>
        <p className="sp-subtitle">
          This section is empty for now. Start exploring the campus to discover events,
          join student communities, and connect with study buddies!
        </p>

        <div className="sp-actions">
          <Link to="/events" className="sp-btn sp-btn--primary">
            <i className="fa-solid fa-plus" />
            <span>Discover Events</span>
          </Link>
          <Link to="/communities" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-users" />
            <span>Join a Community</span>
          </Link>
          <Link to="/buddies" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-handshake" />
            <span>Find Buddies</span>
          </Link>
        </div>

        <div className="sp-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
}

export default EmptyStatePage;
