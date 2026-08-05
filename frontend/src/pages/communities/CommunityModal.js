import React, { useState, useEffect, useRef } from "react";
import { useToast } from "../../context/ToastContext";

function CommunityModal({ club, followed, onToggleFollow, onClose }) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("about");
  const modalRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => {
      document.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="comm-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`${club.name} Community Details`}
        className="comm-modal comm-modal--fixed"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="comm-modal-close" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="comm-modal-inner">
          {/* Left Column: Fixed Cover & Identity Banner */}
          <div className="comm-modal-left" style={{ background: club.coverGradient }}>
            {club.coverImage && (
              <img src={club.coverImage} alt={club.name} className="comm-modal-cover-bg" />
            )}
            <div className="comm-modal-cover-overlay" />

            <div className="comm-modal-identity">
              <div className="comm-modal-avatar" style={{ color: club.accentColor }}>
                <i className={`fa-solid ${club.icon}`} />
              </div>

              <span className="comm-modal-cat-chip">
                <i className="fa-solid fa-shield-halved" /> {club.categoryLabel}
              </span>

              <h2 className="comm-modal-title">{club.name}</h2>
              <p className="comm-modal-tagline">{club.tagline}</p>

              <div className="comm-modal-quick-stats">
                <div>
                  <span className="comm-modal-stat-num">{club.members.toLocaleString()}</span>
                  <span className="comm-modal-stat-lbl">Members</span>
                </div>
                <div className="comm-modal-stat-div" />
                <div>
                  <span className="comm-modal-stat-num">{club.activeEvents}</span>
                  <span className="comm-modal-stat-lbl">Active Events</span>
                </div>
                <div className="comm-modal-stat-div" />
                <div>
                  <span className="comm-modal-stat-num">{club.established}</span>
                  <span className="comm-modal-stat-lbl">Est. Year</span>
                </div>
              </div>

              <button
                className={`comm-modal-follow-btn ${followed ? "comm-modal-follow-btn--following" : ""}`}
                onClick={() => {
                  onToggleFollow(club.id);
                  showToast(
                    followed ? `Left ${club.name}` : `Joined ${club.name} community! 🛡️`,
                    "success"
                  );
                }}
              >
                <i className={`fa-solid ${followed ? "fa-check" : "fa-plus"}`} />
                {followed ? "Following Club" : "Follow Community"}
              </button>
            </div>
          </div>

          {/* Right Column: Tab Content */}
          <div className="comm-modal-right">
            {/* Tabs Navigation */}
            <div className="comm-modal-tabs">
              <button
                className={`comm-modal-tab ${activeTab === "about" ? "comm-modal-tab--active" : ""}`}
                onClick={() => setActiveTab("about")}
              >
                <i className="fa-solid fa-circle-info" /> About
              </button>
              <button
                className={`comm-modal-tab ${activeTab === "leads" ? "comm-modal-tab--active" : ""}`}
                onClick={() => setActiveTab("leads")}
              >
                <i className="fa-solid fa-user-shield" /> Leads & Mentors
              </button>
              <button
                className={`comm-modal-tab ${activeTab === "events" ? "comm-modal-tab--active" : ""}`}
                onClick={() => setActiveTab("events")}
              >
                <i className="fa-solid fa-calendar-days" /> Events ({club.upcomingEvents.length})
              </button>
            </div>

            {/* Scrollable Tab Body */}
            <div className="comm-modal-body-scroll">
              {/* TAB 1: ABOUT */}
              {activeTab === "about" && (
                <div className="comm-modal-tab-pane">
                  <h4 className="comm-pane-heading">About the Community</h4>
                  <p className="comm-pane-desc">{club.about}</p>

                  {club.recruiting && (
                    <div className="comm-recruitment-banner">
                      <div className="comm-recruitment-icon">
                        <i className="fa-solid fa-user-plus" />
                      </div>
                      <div>
                        <p className="comm-recruitment-title">Currently Recruiting Members!</p>
                        <p className="comm-recruitment-sub">Open Roles: {club.recruitingRole}</p>
                      </div>
                      <button className="comm-apply-btn">Apply Now</button>
                    </div>
                  )}

                  <h4 className="comm-pane-heading" style={{ marginTop: 20 }}>Connect & Socials</h4>
                  <div className="comm-social-grid">
                    {club.socials.github && (
                      <a href={`https://github.com/${club.socials.github}`} target="_blank" rel="noreferrer" className="comm-social-pill">
                        <i className="fa-brands fa-github" /> GitHub
                      </a>
                    )}
                    {club.socials.linkedin && (
                      <a href={`https://linkedin.com/${club.socials.linkedin}`} target="_blank" rel="noreferrer" className="comm-social-pill">
                        <i className="fa-brands fa-linkedin" /> LinkedIn
                      </a>
                    )}
                    {club.socials.instagram && (
                      <a href={`https://instagram.com/${club.socials.instagram}`} target="_blank" rel="noreferrer" className="comm-social-pill">
                        <i className="fa-brands fa-instagram" /> Instagram
                      </a>
                    )}
                    {club.socials.discord && (
                      <a href={`https://${club.socials.discord}`} target="_blank" rel="noreferrer" className="comm-social-pill">
                        <i className="fa-brands fa-discord" /> Discord
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LEADS */}
              {activeTab === "leads" && (
                <div className="comm-modal-tab-pane">
                  <h4 className="comm-pane-heading">Community Leadership</h4>
                  <div className="comm-leads-list">
                    {club.leads.map((lead, idx) => (
                      <div key={idx} className="comm-lead-card">
                        <div className="comm-lead-avatar">
                          <i className="fa-solid fa-user" />
                        </div>
                        <div className="comm-lead-info">
                          <h5 className="comm-lead-name">{lead.name}</h5>
                          <span className="comm-lead-role">{lead.role}</span>
                          <span className="comm-lead-branch">{lead.branch}</span>
                        </div>
                        <button className="comm-lead-contact-btn" title="Send Message">
                          <i className="fa-regular fa-paper-plane" /> Message
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: UPCOMING EVENTS */}
              {activeTab === "events" && (
                <div className="comm-modal-tab-pane">
                  <h4 className="comm-pane-heading">Hosted Events</h4>
                  {club.upcomingEvents.length === 0 ? (
                    <p className="comm-pane-empty">No upcoming events scheduled at the moment.</p>
                  ) : (
                    <div className="comm-events-list">
                      {club.upcomingEvents.map((ev, idx) => (
                        <div key={idx} className="comm-event-item">
                          <div className="comm-event-icon-box">
                            <i className="fa-solid fa-calendar-star" />
                          </div>
                          <div className="comm-event-info">
                            <h5 className="comm-event-title">{ev.title}</h5>
                            <span className="comm-event-meta">{ev.date} · {ev.type}</span>
                          </div>
                          <button className="comm-event-view-btn">View Event</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunityModal;
