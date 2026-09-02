import { motion } from 'motion/react';
import { Briefcase, Calendar, Check, Eye, Flame, ShieldCheck, UsersThree } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   COMMUNITY CATALOG CARD — editorial tile
   ───────────────────────────────────────────────────────────── */
export default function CommunityCard({
  community,
  isFollowed,
  onToggleFollow,
  onExplore,
  onPreview,
  isLoggedIn,
  onNavigateToLogin,
}) {
  const liveMembers = community.members ?? 0;

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { onNavigateToLogin(); return; }
    onToggleFollow(community.id);
  };

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    onPreview(community);
  };

  return (
    <motion.article
      className="comm-card group"
      onClick={() => onExplore(community.id)}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      role="article"
      aria-label={community.name}
    >
      {/* Cover — image with dark gradient overlay; identity text sits on top */}
      <div className="comm-card-cover">
        {community.coverImage ? (
          <img src={community.coverImage} alt={community.name} className="comm-card-cover-img" loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: community.coverGradient || 'linear-gradient(135deg, #1A3A2A, #0F172A)' }} />
        )}

        {/* Dark scrim overlay */}
        <div className="comm-card-cover-overlay" />

        {/* Recruitment Status Badge — top-right */}
        {community.recruiting ? (
          <span className="comm-card-recruiting-badge active flex items-center gap-1">
            <Flame size={9} weight="fill" /> Recruiting
          </span>
        ) : (
          <span className="comm-card-recruiting-badge inactive flex items-center gap-1">
            <Check size={9} /> Active
          </span>
        )}

        {/* Club name & category on the cover */}
        <div className="comm-card-cover-identity">
          <div className="flex items-start gap-1.5">
            <h3 className="comm-card-cover-name flex-1">
              {community.name}
            </h3>
            {community.isVerified && (
              <span className="comm-card-verified-mark mt-0.5">
                <ShieldCheck size={14} weight="fill" />
              </span>
            )}
          </div>
          <span className="comm-card-cover-cat">
            {community.categoryLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="comm-card-body">
        <p className="comm-card-tagline">{community.tagline}</p>

        <div className="comm-card-role-slot">
          {community.recruiting && community.recruitingRole ? (
            <div className="comm-card-role-notice">
              <Briefcase size={10} className="flex-shrink-0" />
              <span>Open Role: <strong>{community.recruitingRole}</strong></span>
            </div>
          ) : (
            <div className="comm-card-role-inactive">
              <Check size={11} className="text-[#1A3A2A]" weight="bold" />
              <span>Active Campus Chapter</span>
            </div>
          )}
        </div>

        <div className="comm-card-metrics">
          <UsersThree size={12} />
          <span>{liveMembers.toLocaleString('en-IN')}</span>
          <span className="comm-card-metric-sep" />
          <Calendar size={12} />
          <span>{community.activeEvents} event{community.activeEvents !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="comm-card-actions">
        <button
          className={`comm-card-btn-join ${isFollowed ? 'following' : ''}`}
          onClick={handleFollowClick}
          aria-label={isFollowed ? `Following ${community.name}. Click to leave/unfollow.` : `Join & Follow ${community.name}`}
          title={isFollowed ? 'Click to unfollow' : `Join & Follow ${community.name}`}
        >
          {isFollowed ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} weight="bold" /> Following
            </span>
          ) : (
            'Join & Follow'
          )}
        </button>

        <button
          className="comm-card-btn-preview"
          onClick={handlePreviewClick}
          aria-label={`Quick preview ${community.name}`}
          title="Quick preview"
        >
          <Eye size={15} />
        </button>
      </div>
    </motion.article>
  );
}
