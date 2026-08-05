import React from "react";

function EventContactSection({ event }) {
  return (
    <section className="edp__section">
      <h2 className="edp__section-title">
        <span className="edp__section-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
          <i className="fa-solid fa-address-book" />
        </span>
        Organiser Contact &amp; Help Desk
      </h2>

      {/* Sub-heading: People */}
      <div className="edp__contact-group">
        <h3 className="edp__contact-subheading">
          <i className="fa-solid fa-users" /> People
        </h3>
        <div className="edp__contact-grid">
          <div className="edp__contact-card">
            <div className="edp__contact-icon" style={{ background: "#eeedfb", color: "#5B4FE9" }}>
              <i className="fa-solid fa-user-gear" />
            </div>
            <div className="edp__contact-details">
              <span className="edp__contact-label">Organiser Lead</span>
              <span className="edp__contact-value">{event.hostName} Event Desk</span>
              <span className="edp__contact-sub">Alex Rivera (Lead Coordinator)</span>
            </div>
          </div>
          <div className="edp__contact-card">
            <div className="edp__contact-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
              <i className="fa-solid fa-building-user" />
            </div>
            <div className="edp__contact-details">
              <span className="edp__contact-label">Campus Desk Location</span>
              <span className="edp__contact-value">Student Activity Centre</span>
              <span className="edp__contact-sub">Room 204, Second Floor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-heading: Channels */}
      <div className="edp__contact-group">
        <h3 className="edp__contact-subheading">
          <i className="fa-solid fa-satellite-dish" /> Contact Channels
        </h3>
        <div className="edp__contact-grid">
          <div className="edp__contact-card">
            <div className="edp__contact-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
              <i className="fa-solid fa-envelope" />
            </div>
            <div className="edp__contact-details">
              <span className="edp__contact-label">Official Email</span>
              <a
                href={`mailto:${event.community || "events"}@campuscircle.edu`}
                className="edp__contact-link"
              >
                {event.community || "events"}@campuscircle.edu
              </a>
              <span className="edp__contact-sub">Response within 24 hours</span>
            </div>
          </div>
          <div className="edp__contact-card">
            <div className="edp__contact-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
              <i className="fa-solid fa-phone" />
            </div>
            <div className="edp__contact-details">
              <span className="edp__contact-label">Helpline / Phone</span>
              <a href="tel:+15552345678" className="edp__contact-link">
                +1 (555) 234-5678
              </a>
              <span className="edp__contact-sub">Mon–Fri, 9:00 AM – 6:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventContactSection;
