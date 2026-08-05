import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MyEventsPage.css";
import { MY_ENROLLED_EVENTS } from "./myEventsData";
import MyEventCard from "./MyEventCard";

/* ── Main Page ───────────────────────────────────────────── */
function MyEventsPage() {
  const [events, setEvents] = useState(MY_ENROLLED_EVENTS);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeTab]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketEvent, setTicketEvent] = useState(null);
  const [cancelEvent, setCancelEvent] = useState(null);

  /* Compute stats */
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcomingCount = events.filter((e) => new Date(e.rawDate) >= now).length;
  const completedCount = events.filter((e) => new Date(e.rawDate) < now).length;

  /* Filter by tab + search */
  let filtered = events.filter((e) => {
    const eventDate = new Date(e.rawDate);
    eventDate.setHours(0, 0, 0, 0);

    if (activeTab === "upcoming" && eventDate < now) return false;
    if (activeTab === "completed" && eventDate >= now) return false;
    if (
      searchQuery &&
      !e.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !e.hostName.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  /* Sort: upcoming first for upcoming tab, recent-first for completed */
  filtered = [...filtered].sort((a, b) => {
    const dateA = new Date(a.rawDate);
    const dateB = new Date(b.rawDate);
    if (activeTab === "completed") return dateB - dateA;
    return dateA - dateB;
  });

  const handleCancelConfirm = (eventId) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    setCancelEvent(null);
  };

  const TABS = [
    { id: "all", label: "All Events", icon: "fa-layer-group", count: events.length },
    { id: "upcoming", label: "Upcoming", icon: "fa-clock", count: upcomingCount },
    { id: "completed", label: "Completed", icon: "fa-circle-check", count: completedCount },
  ];

  return (
    <div className="me-page">
      {/* ── Page Header ── */}
      <div className="me-page-header">
        <span className="me-header-badge">
          <i className="fa-solid fa-calendar-check" /> MY EVENTS
        </span>
        <h1 className="me-page-title">Your Registered Events</h1>
        <p className="me-page-sub">
          Track all your registered events, view tickets, and manage your enrollments.
        </p>
        <div className="me-search-wrap">
          <i className="fa-solid fa-magnifying-glass me-search-icon" />
          <input
            className="me-search-input"
            placeholder="Search your events…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="my-events-search"
          />
          {searchQuery && (
            <button className="me-search-clear" onClick={() => setSearchQuery("")}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="me-stats-row">
        <div className="me-stat-card me-stat-card--total">
          <div className="me-stat-icon me-stat-icon--total">
            <i className="fa-solid fa-ticket" />
          </div>
          <div className="me-stat-info">
            <span className="me-stat-number">{events.length}</span>
            <span className="me-stat-label">Total Enrolled</span>
          </div>
        </div>
        <div className="me-stat-card me-stat-card--upcoming">
          <div className="me-stat-icon me-stat-icon--upcoming">
            <i className="fa-solid fa-clock" />
          </div>
          <div className="me-stat-info">
            <span className="me-stat-number">{upcomingCount}</span>
            <span className="me-stat-label">Upcoming</span>
          </div>
        </div>
        <div className="me-stat-card me-stat-card--completed">
          <div className="me-stat-icon me-stat-icon--completed">
            <i className="fa-solid fa-circle-check" />
          </div>
          <div className="me-stat-info">
            <span className="me-stat-number">{completedCount}</span>
            <span className="me-stat-label">Completed</span>
          </div>
        </div>
        <div className="me-stat-card me-stat-card--saved">
          <div className="me-stat-icon me-stat-icon--saved">
            <i className="fa-solid fa-bookmark" />
          </div>
          <div className="me-stat-info">
            <span className="me-stat-number">3</span>
            <span className="me-stat-label">Saved</span>
          </div>
        </div>
      </div>

      {/* ── Status Tabs ── */}
      <div className="me-tabs-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`me-tab ${activeTab === tab.id ? "me-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            id={`my-events-tab-${tab.id}`}
          >
            <i className={`fa-solid ${tab.icon}`} />
            {tab.label}
            <span className="me-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── Results count ── */}
      <p className="me-results-count">
        {filtered.length} event{filtered.length !== 1 ? "s" : ""}{" "}
        {activeTab !== "all" ? `(${activeTab})` : ""}
      </p>

      {/* ── Events List ── */}
      {filtered.length > 0 ? (
        <div className="me-events-list">
          {filtered.map((event) => (
            <MyEventCard
              key={event.id}
              event={event}
              onViewTicket={setTicketEvent}
              onCancel={setCancelEvent}
            />
          ))}
        </div>
      ) : (
        <div className="me-empty">
          <div className="me-empty-icon">
            <i className="fa-regular fa-calendar-xmark" />
          </div>
          <h3 className="me-empty-title">
            {searchQuery
              ? "No matching events found"
              : activeTab === "completed"
              ? "No completed events yet"
              : activeTab === "upcoming"
              ? "No upcoming events"
              : "You haven't enrolled in any events yet"}
          </h3>
          <p className="me-empty-sub">
            {searchQuery
              ? "Try adjusting your search to find what you're looking for."
              : "Browse our events hub to discover exciting campus activities and register!"}
          </p>
          {!searchQuery && (
            <Link to="/events" className="me-empty-btn">
              <i className="fa-solid fa-compass" />
              Explore Events
            </Link>
          )}
        </div>
      )}

      {/* ── Ticket Modal ── */}
      {ticketEvent && (
        <div className="me-modal-overlay" onClick={() => setTicketEvent(null)}>
          <div className="me-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="me-modal-close" onClick={() => setTicketEvent(null)}>
              <i className="fa-solid fa-xmark" />
            </button>
            <div className="me-ticket">
              <div className="me-ticket-icon">
                <i className="fa-solid fa-ticket" />
              </div>
              <h3 className="me-ticket-title">Your Event Ticket</h3>
              <p className="me-ticket-event-name">{ticketEvent.title}</p>
              <div className="me-ticket-divider" />
              <div className="me-ticket-details">
                <div className="me-ticket-row">
                  <i className="fa-solid fa-user" />
                  <span>
                    <strong>Attendee:</strong> Student User
                  </span>
                </div>
                <div className="me-ticket-row">
                  <i className="fa-regular fa-calendar-check" />
                  <span>
                    <strong>Date:</strong> {ticketEvent.dateFormatted}
                  </span>
                </div>
                <div className="me-ticket-row">
                  <i className="fa-solid fa-location-dot" />
                  <span>
                    <strong>Venue:</strong> {ticketEvent.venue}
                  </span>
                </div>
                <div className="me-ticket-row">
                  <i className="fa-solid fa-users" />
                  <span>
                    <strong>Team:</strong> {ticketEvent.teamSize}
                  </span>
                </div>
                <div className="me-ticket-row">
                  <i className="fa-solid fa-building" />
                  <span>
                    <strong>Host:</strong> {ticketEvent.hostName}
                  </span>
                </div>
                <div className="me-ticket-row">
                  <i className="fa-solid fa-tag" />
                  <span>
                    <strong>Type:</strong> {ticketEvent.category} • {ticketEvent.payment}
                  </span>
                </div>
              </div>
              <div className="me-ticket-divider" />
              <span className="me-ticket-id">{ticketEvent.ticketId}</span>
              <div className="me-ticket-actions">
                <button className="me-btn-outline" onClick={() => setTicketEvent(null)}>
                  Close
                </button>
                <button className="me-btn-ticket">
                  <i className="fa-solid fa-download" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirmation Modal ── */}
      {cancelEvent && (
        <div className="me-modal-overlay" onClick={() => setCancelEvent(null)}>
          <div className="me-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="me-modal-close" onClick={() => setCancelEvent(null)}>
              <i className="fa-solid fa-xmark" />
            </button>
            <div className="me-cancel-modal">
              <div className="me-cancel-icon">
                <i className="fa-solid fa-triangle-exclamation" />
              </div>
              <h3 className="me-cancel-title">Cancel Registration?</h3>
              <p className="me-cancel-text">
                You're about to cancel your registration for <strong>{cancelEvent.title}</strong> hosted
                by <strong>{cancelEvent.hostName}</strong>. This action cannot be undone.
              </p>
              <div className="me-cancel-actions">
                <button className="me-btn-outline" onClick={() => setCancelEvent(null)}>
                  Keep Ticket
                </button>
                <button className="me-btn-danger" onClick={() => handleCancelConfirm(cancelEvent.id)}>
                  <i className="fa-solid fa-xmark" />
                  Cancel Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyEventsPage;