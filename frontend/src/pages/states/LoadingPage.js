import React from "react";
import { Link } from "react-router-dom";
import "./StatePages.css";

/**
 * LoadingPage — Full-page loading state with animated spinner and skeleton.
 * Usage: Show while fetching data, navigating, or processing heavy tasks.
 */
function LoadingPage() {
  return (
    <div className="sp-page sp-page--loading">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-spinner-wrap">
          <div className="sp-spinner" />
          <div className="sp-loading-dots">
            <span /><span /><span />
          </div>
        </div>

        <h1 className="sp-title">Loading Your Experience</h1>
        <p className="sp-subtitle">
          Hang tight! We're gathering the latest campus updates, events, and connections for you.
        </p>

        {/* Skeleton preview to show expected content shape */}
        <div className="sp-skeleton-group">
          <div className="sp-skeleton-bar sp-skeleton-bar--wide" />
          <div className="sp-skeleton-bar sp-skeleton-bar--mid" />
          <div className="sp-skeleton-card">
            <div className="sp-skeleton-avatar" />
            <div className="sp-skeleton-lines">
              <div className="sp-skeleton-bar sp-skeleton-bar--wide" />
              <div className="sp-skeleton-bar sp-skeleton-bar--short" />
            </div>
          </div>
          <div className="sp-skeleton-card">
            <div className="sp-skeleton-avatar" />
            <div className="sp-skeleton-lines">
              <div className="sp-skeleton-bar sp-skeleton-bar--mid" />
              <div className="sp-skeleton-bar sp-skeleton-bar--short" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
