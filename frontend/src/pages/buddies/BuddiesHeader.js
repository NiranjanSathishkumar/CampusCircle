import React from 'react';

function BuddiesHeader({ searchQuery, setSearchQuery }) {
  return (
    <div className="buddies-header-card">
      <div className="buddies-header-content">
        <span className="buddies-header-badge">
          <i className="fa-solid fa-handshake-angle" /> Campus Directory
        </span>
        <h1 className="buddies-header-title">Connect with Campus Buddies</h1>
        <p className="buddies-header-sub">
          Find study partners, project collaborators, hackathon teammates, or friends across all branches & batches.
        </p>

        <div className="buddies-search-wrap">
          <i className="fa-solid fa-magnifying-glass buddies-search-icon" />
          <input
            type="search"
            className="buddies-search-input"
            placeholder="Search by student name, skill (e.g. React, Figma), or interest…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="buddies-search-clear" onClick={() => setSearchQuery("")}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuddiesHeader;
