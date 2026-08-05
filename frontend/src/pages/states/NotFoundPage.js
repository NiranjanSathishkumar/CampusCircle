import React from "react";
import { Link } from "react-router-dom";
import "./StatePages.css";

/**
 * NotFoundPage — Displayed for invalid URLs (404).
 * The catch-all route "*" in the router should point here.
 */
function NotFoundPage() {
  return (
    <div className="sp-page sp-page--notfound">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-code">404</div>

        <h1 className="sp-title">Page Not Found</h1>
        <p className="sp-subtitle">
          Looks like you've wandered off the campus map! The page you're looking for
          doesn't exist or may have been moved.
        </p>

        <div className="sp-actions">
          <Link to="/" className="sp-btn sp-btn--primary">
            <i className="fa-solid fa-house" />
            <span>Back to Home</span>
          </Link>
          <Link to="/discover" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-compass" />
            <span>Explore Feed</span>
          </Link>
        </div>

        <div className="sp-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>404 — Not Found</span>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
