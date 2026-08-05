import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

function BuddyCard({ student, isFollowed, onToggleFollow }) {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const goToProfile = () => navigate(`/buddies/${student.id}`);

  return (
    <div
      className="bc-card"
      onClick={goToProfile}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && goToProfile()}
      style={{ "--bc-gradient": student.bannerGradient, cursor: "pointer" }}
    >
      {/* ── Gradient Banner ── */}
      <div className="bc-banner">
        {/* Lead badge — top right of banner */}
        {student.leadBadge && (
          <span className="bc-lead-badge">
            {student.leadBadge}
          </span>
        )}

        {/* Avatar overlapping banner at bottom-left */}
        <div className="bc-avatar-wrap">
          <div className="bc-avatar">
            <i className="fa-solid fa-user" />
          </div>
          {student.online && <span className="bc-online-dot" title="Online" />}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div className="bc-body">

        {/* ─ Identity ─ */}
        <div className="bc-identity">
          <div className="bc-name-row">
            <h4 className="bc-name">{student.name}</h4>
            <i className="fa-solid fa-circle-check bc-verified" title="Verified Student" />
          </div>
          <span className="bc-branch">
            {student.branch} &bull; {student.year}
          </span>
        </div>

        {/* ─ Bio ─ */}
        <p className="bc-bio">{student.bio}</p>

        {/* ─ Skills ─ */}
        <div className="bc-skills">
          {student.skills.slice(0, 3).map((sk) => (
            <span key={sk} className="bc-skill-tag">{sk}</span>
          ))}
          {student.skills.length > 3 && (
            <span className="bc-skill-tag bc-skill-tag--more">
              +{student.skills.length - 3}
            </span>
          )}
        </div>

        {/* ─ Stats row ─ */}
        <div className="bc-stats">
          <div className="bc-stat">
            <span className="bc-stat-value">{student.followingCount}</span>
            <span className="bc-stat-label">FOLLOWING</span>
          </div>
          <div className="bc-stat-divider" />
          <div className="bc-stat">
            <span className="bc-stat-value">
              {student.followersCount >= 1000
                ? `${(student.followersCount / 1000).toFixed(1)}k`
                : student.followersCount}
            </span>
            <span className="bc-stat-label">FOLLOWERS</span>
          </div>
        </div>

        {/* ─ Footer actions ─ */}
        <div className="bc-footer">
          <button
            className={`bc-btn bc-btn--follow ${isFollowed ? "bc-btn--following" : ""}`}
            style={!isFollowed ? { background: student.bannerGradient } : {}}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(student.id);
              showToast(
                isFollowed ? `Unfollowed ${student.name}` : `Buddy request sent to ${student.name}!`,
                "buddy"
              );
            }}
          >
            <i className={`fa-solid ${isFollowed ? "fa-user-check" : "fa-user-plus"}`} />
            <span>{isFollowed ? "Following" : "Follow"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default BuddyCard;
