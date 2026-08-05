import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEED_COMMUNITIES } from "./communitiesData";
import "./CommunityDetailPage.css";
import CommunityHeroBanner from "./CommunityHeroBanner";
import CommunitySidebar from "./CommunitySidebar";

const SOCIAL_CONFIG = {
  github:    { icon: "fa-brands fa-github",    label: "GitHub",    color: "#24292f", bg: "#f6f8fa" },
  linkedin:  { icon: "fa-brands fa-linkedin",  label: "LinkedIn",  color: "#0a66c2", bg: "#e8f3ff" },
  instagram: { icon: "fa-brands fa-instagram", label: "Instagram", color: "#e1306c", bg: "#fce4ec" },
  discord:   { icon: "fa-brands fa-discord",   label: "Discord",   color: "#5865f2", bg: "#eef0ff" },
  youtube:   { icon: "fa-brands fa-youtube",   label: "YouTube",   color: "#ff0000", bg: "#ffebee" },
};

const SOCIAL_HREFS = {
  github:    (val) => `https://github.com/${val}`,
  linkedin:  (val) => `https://linkedin.com/${val}`,
  instagram: (val) => `https://instagram.com/${val}`,
  discord:   (val) => `https://${val}`,
  youtube:   (val) => `https://youtube.com/${val}`,
};

function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const club = SEED_COMMUNITIES.find((c) => c.id === id);

  const [isFollowed, setIsFollowed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!club) {
    return (
      <div className="cdp-not-found">
        <div className="cdp-not-found__icon">
          <i className="fa-solid fa-users-slash" />
        </div>
        <h2>Community Not Found</h2>
        <p>The club or community you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate("/communities")}>
          <i className="fa-solid fa-arrow-left" /> Back to Communities
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const hasSocials = club.socials && Object.values(club.socials).some(Boolean);

  return (
    <div className="cdp">
      {/* Hero Banner & Breadcrumbs */}
      <CommunityHeroBanner club={club} />

      {/* ── Main 2-column Layout ── */}
      <div className="cdp__layout">
        {/* ───────── Left: Main Content ───────── */}
        <div className="cdp__main">
          {/* Host / Community Row */}
          <div className="cdp__host-row">
            <div
              className="cdp__host-avatar"
              style={{ background: `${club.accentColor || "#5B4FE9"}18`, color: club.accentColor || "#5B4FE9" }}
            >
              <i className={`fa-solid ${club.icon || "fa-users"}`} />
            </div>
            <div className="cdp__host-info">
              <span className="cdp__host-name">
                {club.name}
                <i className="fa-solid fa-circle-check cdp__verified-icon" title="Official Campus Society" />
              </span>
              <span className="cdp__host-sub">Official Student Organization</span>
            </div>
          </div>

          {/* Title & Tagline */}
          <h1 className="cdp__title">{club.name}</h1>
          <p className="cdp__tagline">{club.tagline}</p>

          {/* Quick Info Grid */}
          <div className="cdp__info-grid">
            <div className="cdp__info-item">
              <div className="cdp__info-icon" style={{ background: "#eeedfb", color: "#5B4FE9" }}>
                <i className="fa-solid fa-users" />
              </div>
              <div>
                <span className="cdp__info-label">Active Members</span>
                <span className="cdp__info-val">{club.members.toLocaleString()} Students</span>
              </div>
            </div>

            <div className="cdp__info-item">
              <div className="cdp__info-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <i className="fa-solid fa-calendar-check" />
              </div>
              <div>
                <span className="cdp__info-label">Active Events</span>
                <span className="cdp__info-val">{club.activeEvents} Hosted Events</span>
              </div>
            </div>

            <div className="cdp__info-item">
              <div className="cdp__info-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                <i className="fa-solid fa-shield-halved" />
              </div>
              <div>
                <span className="cdp__info-label">Established Year</span>
                <span className="cdp__info-val">{club.established}</span>
              </div>
            </div>

            <div className="cdp__info-item">
              <div className="cdp__info-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="fa-solid fa-user-tie" />
              </div>
              <div>
                <span className="cdp__info-label">Lead Organizer</span>
                <span className="cdp__info-val">{club.leadName || "Student Council"}</span>
              </div>
            </div>
          </div>

          {/* ── Section 1: About This Community ── */}
          <section className="cdp__section">
            <h2 className="cdp__section-title">
              <span className="cdp__section-icon" style={{ background: "#eeedfb", color: "#5B4FE9" }}>
                <i className="fa-solid fa-align-left" />
              </span>
              About {club.name}
            </h2>
            <div className="cdp__body-text">
              <p>{club.about}</p>
            </div>

            {/* Recruitment Callout Banner */}
            {club.recruiting && (
              <div className="cdp__recruit-banner">
                <div className="cdp__recruit-icon">
                  <i className="fa-solid fa-user-plus" />
                </div>
                <div className="cdp__recruit-info">
                  <span className="cdp__recruit-title">Currently Recruiting Members!</span>
                  <span className="cdp__recruit-sub">Open Roles: <strong>{club.recruitingRole}</strong></span>
                </div>
                <button
                  className={`cdp__recruit-btn ${applied ? "cdp__recruit-btn--applied" : ""}`}
                  onClick={() => setApplied(true)}
                >
                  {applied ? (
                    <><i className="fa-solid fa-check" /> Application Sent</>
                  ) : (
                    <>Apply Now <i className="fa-solid fa-arrow-right" /></>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* ── Section 2: Executive Leadership & Mentors ── */}
          <section className="cdp__section">
            <h2 className="cdp__section-title">
              <span className="cdp__section-icon" style={{ background: "#e0f2fe", color: "#0284c7" }}>
                <i className="fa-solid fa-user-shield" />
              </span>
              Executive Leadership &amp; Core Team
            </h2>
            <div className="cdp__contact-grid">
              {club.leads && club.leads.length > 0 ? (
                club.leads.map((lead, idx) => (
                  <div key={idx} className="cdp__contact-card">
                    <div
                      className="cdp__contact-icon"
                      style={{ background: `${club.accentColor || "#5B4FE9"}18`, color: club.accentColor || "#5B4FE9" }}
                    >
                      <i className="fa-solid fa-user-gear" />
                    </div>
                    <div className="cdp__contact-details">
                      <span className="cdp__contact-label">{lead.role}</span>
                      <span className="cdp__contact-value">{lead.name}</span>
                      <span className="cdp__contact-sub">{lead.branch}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cdp__empty-sub">No core team profiles listed.</p>
              )}
            </div>
          </section>

          {/* ── Section 3: Upcoming & Hosted Events ── */}
          <section className="cdp__section">
            <h2 className="cdp__section-title">
              <span className="cdp__section-icon" style={{ background: "#dcfce7", color: "#16a34a" }}>
                <i className="fa-solid fa-calendar-days" />
              </span>
              Hosted Events ({club.upcomingEvents?.length || 0})
            </h2>
            <div className="cdp__timeline">
              {club.upcomingEvents && club.upcomingEvents.length > 0 ? (
                club.upcomingEvents.map((ev, idx) => (
                  <div key={idx} className="cdp__timeline-item">
                    <span className="cdp__timeline-phase">{ev.type}</span>
                    <div style={{ flex: 1 }}>
                      <h3 className="cdp__timeline-title">{ev.title}</h3>
                      <p className="cdp__timeline-desc"><i className="fa-regular fa-calendar" /> {ev.date}</p>
                    </div>
                    <button className="cdp__event-btn" onClick={() => navigate("/events")}>
                      View Event <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="cdp__empty-sub">No upcoming events scheduled at the moment.</p>
              )}
            </div>
          </section>

          {/* ── Section 4: Connect & Official Handles ── */}
          {hasSocials && (
            <section className="cdp__section">
              <h2 className="cdp__section-title">
                <span className="cdp__section-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
                  <i className="fa-solid fa-share-nodes" />
                </span>
                Official Connect Channels
              </h2>
              <div className="cdp__socials-grid">
                {Object.entries(club.socials || {}).map(([platform, handle]) => {
                  if (!handle || !SOCIAL_CONFIG[platform]) return null;
                  const cfg = SOCIAL_CONFIG[platform];
                  return (
                    <a
                      key={platform}
                      href={SOCIAL_HREFS[platform](handle)}
                      target="_blank"
                      rel="noreferrer"
                      className="cdp__social-card"
                      style={{ "--s-color": cfg.color, "--s-bg": cfg.bg }}
                    >
                      <div className="cdp__social-icon">
                        <i className={cfg.icon} />
                      </div>
                      <div className="cdp__social-details">
                        <span className="cdp__social-platform">{cfg.label}</span>
                        <span className="cdp__social-handle">@{handle.replace(/^@/, "").replace(/^in\//, "")}</span>
                      </div>
                      <i className="fa-solid fa-arrow-up-right-from-square cdp__social-arrow" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* ───────── Right: Sticky Sidebar ───────── */}
        <CommunitySidebar
          club={club}
          isFollowed={isFollowed}
          setIsFollowed={setIsFollowed}
          handleShare={handleShare}
          copied={copied}
          applied={applied}
          setApplied={setApplied}
        />
      </div>
    </div>
  );
}

export default CommunityDetailPage;

