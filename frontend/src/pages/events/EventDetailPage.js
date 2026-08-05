import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SAMPLE_EVENTS, COMMUNITIES } from "./eventsData";
import { formatDate } from "./eventsHelpers";
import "./EventsPage.css";
import "./EventDetailPage.css";
import EventHeroBanner from "./EventHeroBanner";
import EventContactSection from "./EventContactSection";
import EventSidebar from "./EventSidebar";
import EventRegisterModal from "./EventRegisterModal";
import { useToast } from "../../context/ToastContext";

function EventDetailPage() {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const event = SAMPLE_EVENTS.find((e) => e.id === parseInt(id, 10));

  if (!event) {
    return (
      <div className="edp-not-found">
        <div className="edp-not-found__icon">
          <i className="fa-solid fa-calendar-xmark" />
        </div>
        <h2>Event Not Found</h2>
        <p>The event you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate("/events")}>
          <i className="fa-solid fa-arrow-left" /> Back to Events
        </button>
      </div>
    );
  }

  const pct = Math.min(100, Math.round((event.registered / event.capacity) * 100));
  const comm = COMMUNITIES.find((c) => c.id === event.community);

  const faqs = [
    {
      q: "Who is eligible to participate in this event?",
      a: `All active undergraduate and postgraduate campus students with a valid student ID are eligible to attend and compete in ${event.title}.`,
    },
    {
      q: "Is there any registration fee or hidden charges?",
      a: `This event is marked as ${event.payment}. No hidden fees apply to student registrations.`,
    },
    {
      q: "Can I participate individually or do I need a team?",
      a: `The entry format for this event is ${event.teamSize}. If team participation is required, solo registrants can form teams during check-in.`,
    },
    {
      q: "Will participants receive certificates of completion?",
      a: `Yes! Verified digital certificates signed by ${event.hostName} will be issued to all participants upon event completion.`,
    },
    {
      q: "What items should I bring on event day?",
      a: "Bring your digital/physical student ID card, registration confirmation ticket, and any personal tools or laptops required for your track.",
    },
  ];

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    showToast("Event link copied to clipboard", "copy");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmRegister = () => {
    setRegistered(true);
    setShowConfirmModal(false);
    showToast(`Registered for ${event.title}! Ticket pass issued 🎟️`, "event");
  };

  const toggleFaq = (idx) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="edp">
      {/* ── Top Navigation Bar & Hero Banner ── */}
      <EventHeroBanner event={event} communityLabel={comm?.label} />

      {/* ── Main 2-column Layout ── */}
      <div className="edp__layout">
        {/* ───────── Left: Main Content ───────── */}
        <div className="edp__main">
          {/* Host Row */}
          <div className="edp__host-row">
            <div
              className="edp__host-avatar"
              style={{ background: `${event.hostColor || "#5B4FE9"}18` }}
            >
              <i
                className={`fa-solid ${event.hostIcon || "fa-microchip"}`}
                style={{ color: event.hostColor || "#5B4FE9" }}
              />
            </div>
            <div className="edp__host-info">
              <span className="edp__host-name">
                {event.hostName}
                <i className="fa-solid fa-circle-check edp__verified-icon" title="Verified Organiser" />
              </span>
              <span className="edp__host-sub">Official Campus Host</span>
            </div>
          </div>

          {/* Event Title */}
          <h1 className="edp__title">{event.title}</h1>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="edp__tags-row">
              {event.tags.map((tag) => (
                <span key={tag} className="edp__tag-pill">{tag}</span>
              ))}
            </div>
          )}

          {/* Quick Info Grid */}
          <div className="edp__info-grid">
            <div className="edp__info-item">
              <div className="edp__info-icon" style={{ background: "#eeedfb", color: "#5B4FE9" }}>
                <i className="fa-regular fa-calendar-check" />
              </div>
              <div>
                <span className="edp__info-label">Date &amp; Time</span>
                <span className="edp__info-val">{event.dateFormatted || formatDate(event.date)}</span>
              </div>
            </div>
            <div className="edp__info-item">
              <div className="edp__info-icon" style={{ background: "#fee2e2", color: "#ef4444" }}>
                <i className="fa-solid fa-location-dot" />
              </div>
              <div>
                <span className="edp__info-label">Venue</span>
                <span className="edp__info-val">{event.venue}</span>
              </div>
            </div>
            <div className="edp__info-item">
              <div className="edp__info-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <i className="fa-solid fa-users" />
              </div>
              <div>
                <span className="edp__info-label">Team Format</span>
                <span className="edp__info-val">{event.teamSize}</span>
              </div>
            </div>
            <div className="edp__info-item">
              <div className="edp__info-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="fa-solid fa-ticket" />
              </div>
              <div>
                <span className="edp__info-label">Entry Fee</span>
                <span className="edp__info-val">{event.payment}</span>
              </div>
            </div>
          </div>

          {/* ── About This Event ── */}
          <section className="edp__section">
            <h2 className="edp__section-title">
              <span className="edp__section-icon" style={{ background: "#eeedfb", color: "#5B4FE9" }}>
                <i className="fa-solid fa-align-left" />
              </span>
              About This Event
            </h2>
            <div className="edp__body-text">
              <p>
                Welcome to <strong>{event.title}</strong>, hosted by <strong>{event.hostName}</strong>!
                This event brings together students from across campus to collaborate, learn, and excel in{" "}
                {event.category?.toLowerCase()} activities.
              </p>
              <p>
                Whether you're looking to showcase your skills, learn from experts, or network with like-minded
                peers, this event offers hands-on experience, exciting challenges, and opportunities to win
                recognition.
              </p>
            </div>
          </section>

          {/* ── Event Highlights & Schedule ── */}
          <section className="edp__section">
            <h2 className="edp__section-title">
              <span className="edp__section-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <i className="fa-solid fa-list-check" />
              </span>
              Event Highlights &amp; Schedule
            </h2>
            <div className="edp__timeline">
              {[
                {
                  phase: "Phase 1",
                  title: "Check-in & Welcome Orientation",
                  desc: `Report to ${event.venue}, collect event badges and introductory kits.`,
                },
                {
                  phase: "Phase 2",
                  title: "Main Session & Challenge Execution",
                  desc: "Live performance, coding rounds, or team presentations judged by campus faculty.",
                },
                {
                  phase: "Phase 3",
                  title: "Judges' Review & Award Ceremony",
                  desc: "Winners announced, certificates distributed, and networking session.",
                },
              ].map((item) => (
                <div key={item.phase} className="edp__timeline-item">
                  <span className="edp__timeline-phase">{item.phase}</span>
                  <div>
                    <h3 className="edp__timeline-title">{item.title}</h3>
                    <p className="edp__timeline-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Guidelines & Rules ── */}
          <section className="edp__section">
            <h2 className="edp__section-title">
              <span className="edp__section-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="fa-solid fa-shield-halved" />
              </span>
              Guidelines &amp; Rules
            </h2>
            <ul className="edp__rules-list">
              {[
                "Valid Campus Student ID is mandatory at check-in.",
                "Please arrive at least 15 minutes before the scheduled start time.",
                "All team members must be present during check-in for team events.",
                "Certificates of participation will be awarded to all registered attendees.",
              ].map((rule) => (
                <li key={rule}>
                  <i className="fa-solid fa-circle-check" />
                  {rule}
                </li>
              ))}
            </ul>
          </section>

          {/* ── Contact Section ── */}
          <EventContactSection event={event} />

          {/* ── FAQs ── */}
          <section className="edp__section">
            <h2 className="edp__section-title">
              <span className="edp__section-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>
                <i className="fa-solid fa-circle-question" />
              </span>
              Frequently Asked Questions
            </h2>
            <div className="edp__faq-list">
              {faqs.map((faq, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div
                    key={i}
                    className={`edp__faq-item ${isOpen ? "edp__faq-item--open" : ""}`}
                    onClick={() => toggleFaq(i)}
                  >
                    <div className="edp__faq-question">
                      <span>{faq.q}</span>
                      <i className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} edp__faq-arrow`} />
                    </div>
                    {isOpen && <div className="edp__faq-answer">{faq.a}</div>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ───────── Right: Sticky Sidebar ───────── */}
        <EventSidebar
          event={event}
          pct={pct}
          registered={registered}
          setShowConfirmModal={setShowConfirmModal}
          saved={saved}
          setSaved={setSaved}
          handleShare={handleShare}
          copied={copied}
        />
      </div>

      {/* ── Confirm Registration Modal ── */}
      {showConfirmModal && (
        <EventRegisterModal
          event={event}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmRegister}
        />
      )}
    </div>
  );
}

export default EventDetailPage;

