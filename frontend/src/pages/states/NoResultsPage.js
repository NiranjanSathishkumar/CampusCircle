import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./StatePages.css";

/**
 * NoResultsPage — Displayed when a search or filter returns zero results.
 * Encourages users to adjust their query or browse other sections.
 */
function NoResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="sp-page sp-page--noresults">
      <div className="sp-deco sp-deco--1" />
      <div className="sp-deco sp-deco--2" />
      <div className="sp-deco sp-deco--3" />
      <div className="sp-deco sp-deco--4" />

      <div className="sp-card">
        <div className="sp-icon-wrap sp-icon-wrap--info">
          <i className="fa-solid fa-magnifying-glass" />
        </div>

        <h1 className="sp-title">No Results Found</h1>
        <p className="sp-subtitle">
          We couldn't find anything matching your search. Try adjusting your filters,
          checking for typos, or exploring a different category.
        </p>

        <div className="sp-actions">
          <button className="sp-btn sp-btn--primary" onClick={() => navigate(-1)}>
            <i className="fa-solid fa-arrow-left" />
            <span>Go Back</span>
          </button>
          <Link to="/events" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-ticket" />
            <span>Browse Events</span>
          </Link>
          <Link to="/communities" className="sp-btn sp-btn--ghost">
            <i className="fa-solid fa-users" />
            <span>Communities</span>
          </Link>
        </div>

        <div className="sp-breadcrumb">
          <Link to="/">Home</Link>
          <i className="fa-solid fa-chevron-right" />
          <span>No Results</span>
        </div>
      </div>
    </div>
  );
}

export default NoResultsPage;
