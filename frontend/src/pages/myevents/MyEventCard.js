import React from "react";
import { getEventStatus, getCountdownText } from "./myEventsHelpers";

/* ── Event Card ──────────────────────────────────────────── */
function MyEventCard({ event, onViewTicket, onCancel }) {
  const status = getEventStatus(event.rawDate);
  const countdown = getCountdownText(event.rawDate);
  const isCompleted = status.type === "completed";

  return (
    <div className="me-event-card" id={`my-event-${event.id}`}>
      {/* Left image */}
      <div className="me-event-image">
        <img src={event.imageUrl} alt={event.title} />
        <div className="me-event-image-overlay" />
        <span className={`me-event-status-badge me-event-status-badge--${status.type}`}>
          {status.label}
        </span>
      </div>

      {/* Right body */}
      <div className="me-event-body">
        {/* Host row */}
        <div className="me-event-host-row">
          <div className="me-event-host-avatar" style={{ background: `${event.hostColor}15` }}>
            <i className={`fa-solid ${event.hostIcon}`} style={{ color: event.hostColor }} />
          </div>
          <span className="me-event-host-name">{event.hostName}</span>
          <i className="fa-solid fa-circle-check me-event-verified" title="Verified Organiser" />
        </div>

        {/* Title */}
        <h3 className="me-event-title">{event.title}</h3>

        {/* Meta row */}
        <div className="me-event-meta-row">
          <div className="me-event-meta">
            <i className="fa-regular fa-calendar-check" />
            <span>{event.dateFormatted}</span>
          </div>
          <div className="me-event-meta">
            <i className="fa-solid fa-location-dot" />
            <span>{event.venue}</span>
          </div>
          <div className="me-event-meta">
            <i className="fa-solid fa-tag" />
            <span>{event.category}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="me-event-tags">
            {event.tags.map((tag) => (
              <span key={tag} className="me-event-tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: countdown + actions */}
        <div className="me-event-footer">
          <div
            className={`me-countdown ${
              countdown.completed
                ? "me-countdown--completed"
                : countdown.urgent
                ? "me-countdown--urgent"
                : ""
            }`}
          >
            <i className={`fa-solid ${countdown.completed ? "fa-circle-check" : "fa-clock"}`} />
            {countdown.text}
          </div>

          <div className="me-event-actions">
            <button className="me-btn-ticket" onClick={() => onViewTicket(event)}>
              <i className="fa-solid fa-ticket" />
              {isCompleted ? "View Ticket" : "My Ticket"}
            </button>
            {!isCompleted && (
              <button className="me-btn-cancel" onClick={() => onCancel(event)}>
                <i className="fa-solid fa-xmark" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyEventCard;
