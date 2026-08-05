import React from "react";
import { Link, useNavigate } from "react-router-dom";

function EventHeroBanner({ event, communityLabel }) {
  const navigate = useNavigate();

  return (
    <>
      {/* ── Top Navigation Bar ── */}
      <div className="edp__topbar">
        <button className="edp__back-btn" onClick={() => navigate("/events")}>
          <i className="fa-solid fa-arrow-left" /> Back to Events
        </button>
        <nav className="edp__breadcrumb">
          <Link to="/events">Events</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>{communityLabel || "General"}</span>
          <i className="fa-solid fa-chevron-right" />
          <span className="edp__breadcrumb-current">{event.title}</span>
        </nav>
      </div>

      {/* ── Hero Banner ── */}
      <div className="edp__hero">
        <img src={event.imageUrl} alt={event.title} className="edp__hero-img" />
        <div className="edp__hero-overlay" />

        {/* Top-Left Badge: Category */}
        <div className="edp__hero-badge-top-left">
          {event.category && (
            <span className="edp__chip edp__chip--cat">
              <i className="fa-solid fa-layer-group" /> {event.category}
            </span>
          )}
        </div>

        {/* Top-Right Badge: Price/Payment */}
        <div className="edp__hero-badge-top-right">
          <span
            className={`edp__chip ${
              event.payment === "FREE" ? "edp__chip--free" : "edp__chip--paid"
            }`}
          >
            {event.payment}
          </span>
        </div>

        {/* Bottom-Left Badge: Team Format */}
        <div className="edp__hero-badge-bottom-left">
          <span className="edp__chip edp__chip--team">
            <i className="fa-solid fa-user-group" /> {event.teamSize}
          </span>
        </div>
      </div>
    </>
  );
}

export default EventHeroBanner;
