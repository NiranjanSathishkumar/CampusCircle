import React, { useRef } from "react";
import "./ProfileHeader.css";

const DEFAULT_GRADIENT =
  "linear-gradient(135deg, #5B4FE9 0%, #8B5CF6 45%, #EC4899 100%)";

function ProfileHeader({
  profile = {},
  stats = {},
  onAvatarChange = async () => {},
  onBannerChange = async () => {},
  onSelectTab = () => {},
  editable = true,
}) {
  const {
    name = "",
    branch = "",
    year = "",
    bio = "",
    skills = [],
    communities = [],
    avatarUrl = null,
    bannerUrl = null,
    bannerGradient = DEFAULT_GRADIENT,
  } = profile;

  const {
    followersCount = 0,
    followingCount = 0,
    clubsCount = 0,
    achievementsCount = 0,
  } = stats;

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleAvatarPick = async (e) => {
    const file = e.target.files?.[0];
    if (file) await onAvatarChange(file);
    e.target.value = "";
  };

  const handleBannerPick = async (e) => {
    const file = e.target.files?.[0];
    if (file) await onBannerChange(file);
    e.target.value = "";
  };

  const bannerStyle = bannerUrl
    ? { backgroundImage: `url(${bannerUrl})` }
    : { backgroundImage: bannerGradient };

  return (
    <div className="ph-card">
      {/* ── Cover Banner ────────────────────────────────────── */}
      <div className="ph-banner" style={bannerStyle}>
        <div className="ph-banner-overlay" />
        {editable && (
          <>
            <button
              className="ph-banner-cam"
              title="Change cover photo"
              onClick={() => bannerInputRef.current?.click()}
              aria-label="Change banner image"
            >
              <i className="fa-solid fa-camera" />
              <span>Edit Cover</span>
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="ph-hidden-input"
              onChange={handleBannerPick}
            />
          </>
        )}
      </div>

      {/* ── Identity & Avatar Row ────────────────────────────── */}
      <div className="ph-identity">
        <div className="ph-avatar-wrap">
          <div className="ph-avatar-ring">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="ph-avatar-img" />
            ) : (
              <div className="ph-avatar-placeholder">
                <i className="fa-solid fa-user" />
              </div>
            )}
          </div>
          {editable && (
            <>
              <button
                className="ph-avatar-add"
                title="Change profile photo"
                onClick={() => avatarInputRef.current?.click()}
                aria-label="Change profile photo"
              >
                <i className="fa-solid fa-camera" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="ph-hidden-input"
                onChange={handleAvatarPick}
              />
            </>
          )}
        </div>

        {editable && (
          <button
            className="ph-edit-btn"
            onClick={() => onSelectTab("personalDetails")}
            aria-label="Edit personal details"
          >
            <i className="fa-solid fa-user-gear" />
            <span>Edit Personal Details</span>
          </button>
        )}
      </div>

      {/* ── Info & Quick Stats ─────────────────────────────── */}
      <div className="ph-info">
        <div className="ph-name-wrap">
          <h2 className="ph-name">{name || "Your Name"}</h2>
          <span className="ph-verified-badge" title="Verified Student Member">
            <i className="fa-solid fa-circle-check" /> Verified Student
          </span>
        </div>

        {/* Branch & Standing badges */}
        {(branch || year) && (
          <div className="ph-meta-pills">
            {branch && (
              <span className="ph-meta-pill">
                <i className="fa-solid fa-laptop-code" /> {branch}
              </span>
            )}
            {year && (
              <span className="ph-meta-pill ph-meta-pill--accent">
                <i className="fa-solid fa-graduation-cap" /> {year}
              </span>
            )}
          </div>
        )}

        {/* Bio */}
        {bio && <p className="ph-bio">{bio}</p>}

        {/* Quick Interactive Stats Strip */}
        <div className="ph-stats-strip">
          <div
            className="ph-stat-item ph-stat-item--clickable"
            onClick={() => onSelectTab("network")}
            title="View Followers"
          >
            <span className="ph-stat-num">{followersCount}</span>
            <span className="ph-stat-label">Followers</span>
          </div>
          <div className="ph-stat-divider" />
          <div
            className="ph-stat-item ph-stat-item--clickable"
            onClick={() => onSelectTab("network")}
            title="View Following"
          >
            <span className="ph-stat-num">{followingCount}</span>
            <span className="ph-stat-label">Following</span>
          </div>
          <div className="ph-stat-divider" />
          <div
            className="ph-stat-item ph-stat-item--clickable"
            onClick={() => onSelectTab("followedClubs")}
            title="View Followed Clubs"
          >
            <span className="ph-stat-num">{clubsCount}</span>
            <span className="ph-stat-label">Clubs</span>
          </div>
          <div className="ph-stat-divider" />
          <div
            className="ph-stat-item ph-stat-item--clickable"
            onClick={() => onSelectTab("achievements")}
            title="View Achievements"
          >
            <span className="ph-stat-num">{achievementsCount}</span>
            <span className="ph-stat-label">Certificates</span>
          </div>
        </div>

        {/* Communities */}
        {communities.length > 0 && (
          <div className="ph-communities">
            <p className="ph-section-label">
              <i className="fa-solid fa-users-rectangle ph-section-icon" />
              Active Communities
            </p>
            <div className="ph-community-list">
              {communities.map((c, i) => (
                <div key={i} className="ph-community-item">
                  <span className="ph-community-dot" />
                  <span className="ph-community-name">{c.name}</span>
                  <span className="ph-community-role-badge">{c.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills pills */}
        {skills.length > 0 && (
          <div className="ph-skills">
            <p className="ph-section-label">
              <i className="fa-solid fa-sparkles ph-section-icon" />
              Skills & Expertise
            </p>
            <div className="ph-skills-list">
              {skills.map((skill) => (
                <span key={skill} className="ph-skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileHeader;
