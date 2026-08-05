import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function NetworkTab({
  following = [],
  followers = [],
  onUnfollow = () => {},
  onRemoveFollower = () => {},
}) {
  const [networkSubTab, setNetworkSubTab] = useState("followers");
  const [networkSearch, setNetworkSearch] = useState("");

  const filteredFollowing = following.filter((u) =>
    u.name.toLowerCase().includes(networkSearch.toLowerCase())
  );

  const filteredFollowers = followers.filter((u) =>
    u.name.toLowerCase().includes(networkSearch.toLowerCase())
  );

  return (
    <div className="ptab-view-card">
      <div className="ptab-view-header">
        <div className="ptab-header-text">
          <h3 className="ptab-view-title">Academic Network</h3>
          <p className="ptab-view-sub">
            Connect with colleagues, mentors, and fellow researchers across campus.
          </p>
        </div>

        {/* Search Network Input */}
        <div className="ptab-network-search">
          <i className="fa-solid fa-magnifying-glass ptab-net-search-icon" />
          <input
            type="text"
            className="ptab-net-input"
            placeholder="Search network…"
            value={networkSearch}
            onChange={(e) => setNetworkSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Subtabs Line Header */}
      <div className="ptab-net-subtabs">
        <button
          className={`ptab-net-subtab ${networkSubTab === "followers" ? "ptab-net-subtab--active" : ""}`}
          onClick={() => setNetworkSubTab("followers")}
        >
          Followers <span className="ptab-net-badge">{followers.length}</span>
        </button>
        <button
          className={`ptab-net-subtab ${networkSubTab === "following" ? "ptab-net-subtab--active" : ""}`}
          onClick={() => setNetworkSubTab("following")}
        >
          Following <span className="ptab-net-badge">{following.length}</span>
        </button>
      </div>

      {/* User Cards Grid */}
      <div className="ptab-user-grid">
        {networkSubTab === "followers" &&
          filteredFollowers.map((user) => (
            <div key={user.id} className="ptab-user-card">
              <Link to={`/profile/${user.id}`} className="ptab-user-avatar-wrap" title={`View ${user.name}'s profile`}>
                <div className="ptab-user-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} />
                  ) : (
                    <i className="fa-solid fa-user" />
                  )}
                </div>
                {user.online && <span className="ptab-online-dot" />}
              </Link>

              <div className="ptab-user-info">
                <div className="ptab-user-head">
                  <Link to={`/profile/${user.id}`} className="ptab-user-name" style={{ textDecoration: "none", color: "inherit" }}>
                    {user.name}
                  </Link>
                  {user.degreeBadge && (
                    <span className="ptab-degree-badge">{user.degreeBadge}</span>
                  )}
                </div>
                <p className="ptab-user-title">{user.title || `${user.branch || "Student"} · ${user.year || "Enrolled"}`}</p>
              </div>

              <div className="ptab-user-actions">
                <button className="ptab-btn-follow">Follow</button>
                <button
                  className="ptab-btn-remove"
                  onClick={() => onRemoveFollower(user.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

        {networkSubTab === "following" &&
          filteredFollowing.map((user) => (
            <div key={user.id} className="ptab-user-card">
              <Link to={`/profile/${user.id}`} className="ptab-user-avatar-wrap" title={`View ${user.name}'s profile`}>
                <div className="ptab-user-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} />
                  ) : (
                    <i className="fa-solid fa-user" />
                  )}
                </div>
                {user.online && <span className="ptab-online-dot" />}
              </Link>

              <div className="ptab-user-info">
                <div className="ptab-user-head">
                  <Link to={`/profile/${user.id}`} className="ptab-user-name" style={{ textDecoration: "none", color: "inherit" }}>
                    {user.name}
                  </Link>
                  {user.degreeBadge && (
                    <span className="ptab-degree-badge">{user.degreeBadge}</span>
                  )}
                </div>
                <p className="ptab-user-title">{user.title || `${user.branch || "Student"} · ${user.year || "Enrolled"}`}</p>
              </div>

              <div className="ptab-user-actions">
                <button
                  className="ptab-btn-unfollow"
                  onClick={() => onUnfollow(user.id)}
                >
                  Following
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default NetworkTab;
