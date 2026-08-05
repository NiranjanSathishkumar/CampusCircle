import React from 'react';

function LoginBrandPanel() {
  return (
    <div className="auth-brand">
      <div className="auth-particles">
        <span className="auth-particle" />
        <span className="auth-particle" />
        <span className="auth-particle" />
        <span className="auth-particle" />
        <span className="auth-particle" />
        <span className="auth-particle" />
      </div>

      <div className="auth-brand__logo">
        <div className="auth-brand__logo-icon">
          <i className="fa-solid fa-graduation-cap" />
        </div>
        <div className="auth-brand__logo-text">
          Campus<span>Circle</span>
        </div>
      </div>

      <h1 className="auth-brand__tagline">
        Your Campus,<br />Connected.
      </h1>
      <p className="auth-brand__sub">
        Discover events, join communities, and connect with buddies — all in one vibrant campus hub.
      </p>

      <div className="auth-brand__stats">
        <div className="auth-brand__stat">
          <span className="auth-brand__stat-val">2.4k+</span>
          <span className="auth-brand__stat-label">Active Students</span>
        </div>
        <div className="auth-brand__stat">
          <span className="auth-brand__stat-val">120+</span>
          <span className="auth-brand__stat-label">Communities</span>
        </div>
        <div className="auth-brand__stat">
          <span className="auth-brand__stat-val">350+</span>
          <span className="auth-brand__stat-label">Events / Month</span>
        </div>
      </div>
    </div>
  );
}

export default LoginBrandPanel;
