import React from 'react';

function BuddyHero({ student, isFollowed, setIsFollowed, onShare }) {
  return (
    <div className="bpp-hero">
      {/* Gradient banner */}
      <div
        className="bpp-banner"
        style={{ background: student.bannerGradient }}
      >
        {/* Decorative orbs */}
        <div className="bpp-banner-orb bpp-banner-orb--1" />
        <div className="bpp-banner-orb bpp-banner-orb--2" />
      </div>

      {/* White body */}
      <div className="bpp-hero-body">
        {/* Avatar only — straddles the banner/body boundary */}
        <div className="bpp-avatar-row">
          <div className="bpp-avatar-wrap">
            <div className="bpp-avatar">
              <i className="fa-solid fa-user" />
            </div>
            {student.online && (
              <span className="bpp-online-dot" title="Online now" />
            )}
          </div>
        </div>

        {/* Action buttons — sit fully inside the white body */}
        <div className="bpp-hero-actions">
          <button
            className={`bpp-btn bpp-btn--follow ${isFollowed ? "bpp-btn--following" : ""}`}
            onClick={() => setIsFollowed((v) => !v)}
          >
            <i className={`fa-solid ${isFollowed ? "fa-user-check" : "fa-user-plus"}`} />
            {isFollowed ? "Following" : "Follow"}
          </button>

          <button
            className="bpp-btn bpp-btn--ghost"
            onClick={onShare}
            title="Share profile"
          >
            <i className="fa-solid fa-share-nodes" />
            Share
          </button>
        </div>

        {/* Name + meta */}
        <div className="bpp-identity">
          <div className="bpp-name-row">
            <h1 className="bpp-name">{student.name}</h1>
            <i className="fa-solid fa-circle-check bpp-verified" title="Verified Student" />
            {student.leadBadge && (
              <span className="bpp-lead-badge">
                <i className="fa-solid fa-shield-halved" />
                {student.leadBadge}
              </span>
            )}
          </div>
          <span className="bpp-meta">
            <i className="fa-solid fa-graduation-cap" />
            {student.branch} &middot; {student.year}
          </span>
        </div>

        {/* Bio */}
        <p className="bpp-bio">{student.bio}</p>

        {/* Stats strip */}
        <div className="bpp-stats-strip">
          <div className="bpp-stat">
            <span className="bpp-stat-val">{student.followersCount.toLocaleString()}</span>
            <span className="bpp-stat-lbl">Followers</span>
          </div>
          <div className="bpp-stat">
            <span className="bpp-stat-val">{student.followingCount.toLocaleString()}</span>
            <span className="bpp-stat-lbl">Following</span>
          </div>
          <div className="bpp-stat">
            <span className="bpp-stat-val">{student.achievementsCount}</span>
            <span className="bpp-stat-lbl">Awards</span>
          </div>
          <div className="bpp-stat">
            <span className="bpp-stat-val">{student.communities.length}</span>
            <span className="bpp-stat-lbl">Clubs</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuddyHero;
