import React from 'react';

function SignupBrandPanel() {
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
        Start Your<br />Campus Journey
      </h1>
      <p className="auth-brand__sub">
        Join 2,400+ students already networking, collaborating, and discovering opportunities.
      </p>

      <div className="auth-brand__stats">
        <div className="auth-brand__stat">
          <span className="auth-brand__stat-val">50+</span>
          <span className="auth-brand__stat-label">Active Clubs</span>
        </div>
        <div className="auth-brand__stat">
          <span className="auth-brand__stat-val">15k+</span>
          <span className="auth-brand__stat-label">Connections</span>
        </div>
        <div className="auth-brand__stat">
          <span className="auth-brand__stat-val">98%</span>
          <span className="auth-brand__stat-label">Satisfaction</span>
        </div>
      </div>
    </div>
  );
}

export default SignupBrandPanel;
