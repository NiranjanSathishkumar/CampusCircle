import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StatePages.css";

/**
 * ErrorPage — Shown when something goes wrong (500 / server error / unexpected crash).
 * Provides a friendly message with retry and navigation options.
 */
function ErrorPage() {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="sp-page sp-page--error">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-icon-wrap sp-icon-wrap--danger">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>

        <h1 className="sp-title">Something Went Wrong</h1>
        <p className="sp-subtitle">
          We ran into an unexpected issue while processing your request.
          Don't worry — our team is on it. Please try again or head back to safety.
        </p>

        <div className="sp-detail">
          Error Code: <code>500</code> · Internal Server Error
        </div>

        <div className="sp-actions" style={{ marginTop: "24px" }}>
          <button className="sp-btn sp-btn--danger" onClick={handleRetry}>
            <i className="fa-solid fa-rotate-right" />
            <span>Try Again</span>
          </button>
          <Link to="/" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-house" />
            <span>Go Home</span>
          </Link>
        </div>

        <div className="sp-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>Error</span>
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
