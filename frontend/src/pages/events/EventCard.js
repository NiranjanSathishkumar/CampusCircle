import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "./eventsHelpers";

function EventCard({ event, onOpenDetail, onRegister }) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const pct = Math.min(100, Math.round((event.registered / event.capacity) * 100));

  /* Parse date for the callout block */
  const dateObj = event.date ? new Date(event.date) : null;
  const dayNum  = dateObj ? dateObj.getDate() : "";
  const monthAb = dateObj
    ? dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "";

  const handleDetailClick = () => {
    if (onOpenDetail) {
      onOpenDetail(event);
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <div className="ev-card" onClick={() => navigate(`/events/${event.id}`)} style={{ cursor: "pointer" }}>
      {/* ── Banner ── */}
      <div className="ev-card-banner">
        <img src={event.imageUrl} alt={event.title} className="ev-card-banner-img" />
        <div className="ev-card-banner-overlay" />

        {/* Date callout – top left */}
        <div className="ev-card-date-callout">
          <span className="ev-card-date-day">{dayNum}</span>
          <span className="ev-card-date-month">{monthAb}</span>
        </div>

        {/* Category chip – bottom left */}
        {event.category && (
          <span className="ev-card-cat-chip">
            <i className="fa-solid fa-layer-group" /> {event.category}
          </span>
        )}

        {/* Bookmark – top right */}
        <button
          className={`ev-card-bookmark-btn ${saved ? "ev-card-bookmark-btn--saved" : ""}`}
          onClick={(e) => { e.stopPropagation(); setSaved((p) => !p); }}
          aria-label={saved ? "Remove bookmark" : "Bookmark event"}
        >
          <i className={`fa-${saved ? "solid" : "regular"} fa-bookmark`} />
        </button>

        {/* Payment badge – bottom right */}
        <span className={`ev-card-badge-price ${event.payment === "FREE" ? "ev-card-badge-price--free" : ""}`}>
          {event.payment}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="ev-card-body">

        {/* Host row */}
        <div className="ev-card-host-row">
          <div className="ev-card-host-avatar" style={{ background: `${event.hostColor || "#5B4FE9"}18` }}>
            <i className={`fa-solid ${event.hostIcon || "fa-microchip"}`} style={{ color: event.hostColor || "#5B4FE9" }} />
          </div>
          <span className="ev-card-host-name">{event.hostName || "Campus Club"}</span>
          <i className="fa-solid fa-circle-check ev-card-verified-icon" title="Verified Organiser" />
          {event.teamSize && (
            <span className="ev-card-team-pill">{event.teamSize}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="ev-card-title">{event.title}</h3>

        {/* Meta: date + venue */}
        <div className="ev-card-meta-block">
          <div className="ev-card-meta-line">
            <i className="fa-regular fa-calendar-check ev-card-meta-icon ev-card-meta-icon--date" />
            <span>{event.dateFormatted || formatDate(event.date)}</span>
          </div>
          <div className="ev-card-meta-line">
            <i className="fa-solid fa-location-dot ev-card-meta-icon ev-card-meta-icon--location" />
            <span>{event.venue}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="ev-card-tags-row">
            {event.tags.map((tag) => (
              <span key={tag} className="ev-card-tag-pill">{tag}</span>
            ))}
          </div>
        )}

        {/* Registration progress */}
        <div className="ev-card-progress-section">
          <div className="ev-card-progress-header">
            <span className="ev-card-registered-count">
              <strong>{event.registered}</strong> / {event.capacity} registered
            </span>
            <span className={`ev-card-status-pill ${pct >= 80 ? "ev-card-status-pill--hot" : "ev-card-status-pill--open"}`}>
              {event.statusBadge || (pct >= 80 ? "🔥 Filling Fast" : "✓ Open")}
            </span>
          </div>
          <div className="ev-card-progress-track">
            <div className="ev-card-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Actions */}
        <div className="ev-card-action-row" onClick={(e) => e.stopPropagation()}>
          <button className="ev-card-btn-secondary" onClick={handleDetailClick}>
            <i className="fa-regular fa-eye" /> Details
          </button>
          <button className="ev-card-btn-primary" onClick={() => onRegister && onRegister(event)}>
            Register <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
