import React from "react";
import { Link } from "react-router-dom";
import "./StatePages.css";

/**
 * SuccessPage — Shown after a successful action (registration, signup, form submission, etc.).
 * Features an animated check mark and a call-to-action to continue.
 */
function SuccessPage() {
  return (
    <div className="sp-page sp-page--success">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-check-circle">
          <i className="fa-solid fa-check sp-check-icon" />
        </div>

        <h1 className="sp-title">All Done!</h1>
        <p className="sp-subtitle">
          Your action was completed successfully. Whether you just signed up, registered for
          an event, or updated your profile — everything is saved and ready to go.
        </p>

        <div className="sp-actions">
          <Link to="/discover" className="sp-btn sp-btn--success">
            <i className="fa-solid fa-compass" />
            <span>Explore Feed</span>
          </Link>
          <Link to="/events" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-ticket" />
            <span>Browse Events</span>
          </Link>
        </div>

        <div className="sp-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>Success</span>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;
