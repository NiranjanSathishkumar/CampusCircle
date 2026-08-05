import React from "react";
import { CATEGORIES, SORT_OPTIONS } from "./communitiesData";

function CommunityFilters({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  onlyRecruiting,
  setOnlyRecruiting,
  sortBy,
  setSortBy,
}) {
  return (
    <>
      {/* ── Page Header / Banner ── */}
      <div className="comm-header-card">
        <div className="comm-header-content">
          <span className="comm-header-badge">
            <i className="fa-solid fa-users-viewfinder" /> Campus Hub
          </span>
          <h1 className="comm-header-title">Student Communities & Clubs</h1>
          <p className="comm-header-sub">
            Discover 8+ official student-led societies, tech guilds, cultural teams, and sports councils on campus. Join and collaborate!
          </p>

          {/* Search bar */}
          <div className="comm-search-bar">
            <i className="fa-solid fa-magnifying-glass comm-search-icon" />
            <input
              type="search"
              className="comm-search-input"
              placeholder="Search by community name, skill, or interest…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="comm-search-clear" onClick={() => setSearchQuery("")}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Category Filters & Controls ── */}
      <div className="comm-controls-bar">
        {/* Category Pills */}
        <div className="comm-category-strip">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`comm-cat-pill ${activeCategory === cat.id ? "comm-cat-pill--active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <i className={`fa-solid ${cat.icon}`} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sub-controls: Recruiting toggle & Sort */}
        <div className="comm-sub-controls">
          <label className="comm-checkbox-label">
            <input
              type="checkbox"
              checked={onlyRecruiting}
              onChange={(e) => setOnlyRecruiting(e.target.checked)}
            />
            <span className="comm-checkbox-custom" />
            <span>Recruiting Now</span>
          </label>

          <div className="comm-sort-dropdown">
            <i className="fa-solid fa-arrow-up-arrow-down comm-sort-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="comm-sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export default CommunityFilters;
