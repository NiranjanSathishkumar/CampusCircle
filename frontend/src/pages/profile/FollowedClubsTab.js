import React, { useState } from 'react';

function FollowedClubsTab({ followedClubs = [], onUnfollowClub = () => {} }) {
  const [clubCategory, setClubCategory] = useState("All");
  const [clubSearch, setClubSearch] = useState("");

  const filteredClubs = followedClubs.filter((c) => {
    const matchesCat = clubCategory === "All" || c.category === clubCategory;
    const matchesSearch = c.name.toLowerCase().includes(clubSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="ptab-view-card">
      <div className="ptab-view-header">
        <div className="ptab-header-text">
          <h3 className="ptab-view-title">Followed Clubs</h3>
          <p className="ptab-view-sub">
            Manage your active memberships and stay updated with the academic communities you care about.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="ptab-clubs-bar">
        <div className="ptab-clubs-search-wrap">
          <i className="fa-solid fa-filter ptab-filter-icon" />
          <input
            type="text"
            className="ptab-clubs-input"
            placeholder="Filter by category or keyword…"
            value={clubSearch}
            onChange={(e) => setClubSearch(e.target.value)}
          />

          <div className="ptab-cat-pills">
            {["All", "Science", "Arts", "Tech"].map((cat) => (
              <button
                key={cat}
                className={`ptab-cat-pill ${clubCategory === cat ? "ptab-cat-pill--active" : ""}`}
                onClick={() => setClubCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button className="ptab-discover-btn">
          <i className="fa-solid fa-compass" /> Discover New Clubs
        </button>
      </div>

      {/* Club Grid */}
      <div className="ptab-clubs-grid">
        {filteredClubs.map((club) => (
          <div key={club.id} className="ptab-club-card">
            <div className="ptab-club-top">
              <div
                className="ptab-club-icon-box"
                style={{ background: club.iconBg || "#EEF2FF", color: club.iconColor || "#4F46E5" }}
              >
                <i className={`fa-solid ${club.icon || "fa-people-group"}`} />
              </div>
              <button
                className="ptab-following-btn"
                onClick={() => onUnfollowClub(club.id)}
                title="Click to unfollow"
              >
                <i className="fa-solid fa-check" /> Following
              </button>
            </div>

            <h4 className="ptab-club-name">{club.name}</h4>
            <p className="ptab-club-desc">{club.description || "Active student academic circle."}</p>

            <div className="ptab-club-footer">
              <div className="ptab-avatar-stack">
                <div className="ptab-mini-avatar ptab-mini-avatar--1">
                  <i className="fa-solid fa-user" />
                </div>
                <div className="ptab-mini-avatar ptab-mini-avatar--2">
                  <i className="fa-solid fa-user" />
                </div>
                <span className="ptab-avatar-count">{club.membersCount || "+12"}</span>
              </div>
              <span className="ptab-club-followers">
                {(club.followers || 1000).toLocaleString()} Followers
              </span>
            </div>
          </div>
        ))}

        {/* Start a Club Action Card */}
        <div className="ptab-start-club-card">
          <div className="ptab-start-icon-box">
            <i className="fa-solid fa-plus" />
          </div>
          <h4 className="ptab-start-title">Start a Club</h4>
          <p className="ptab-start-desc">
            Bring your community together and start your own academic circle.
          </p>
        </div>
      </div>
    </div>
  );
}

export default FollowedClubsTab;
