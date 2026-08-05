import React from "react";
import { Link } from "react-router-dom";
import "./StatePages.css";

/**
 * AccessDeniedPage — Shown when the user lacks permissions (403).
 * For example: accessing admin routes, organizer panels without proper role.
 */
function AccessDeniedPage() {
  return (
    <div className="sp-page sp-page--denied">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-icon-wrap sp-icon-wrap--danger">
          <i className="fa-solid fa-lock" />
        </div>

        <h1 className="sp-title">Access Denied</h1>
        <p className="sp-subtitle">
          You don't have permission to view this page. This area may require a specific role
          like admin or organizer access. Please contact your campus administrator if you believe
          this is an error.
        </p>

        <div className="sp-detail">
          Status: <code>403</code> · Forbidden — Insufficient Permissions
        </div>

        <div className="sp-actions" style={{ marginTop: "24px" }}>
          <Link to="/" className="sp-btn sp-btn--primary">
            <i className="fa-solid fa-house" />
            <span>Go Home</span>
          </Link>
          <Link to="/login" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-right-to-bracket" />
            <span>Sign In</span>
          </Link>
        </div>

        <div className="sp-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>Access Denied</span>
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedPage;
