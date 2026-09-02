import { AnimatePresence, motion } from 'motion/react';
import { Check, ShieldCheck } from '@phosphor-icons/react';
import { formatMetricCount } from '@/features/buddies/buddiesConstants';

/* ─────────────────────────────────────────────────────────────
   STUDENT DIRECTORY CARD
   ───────────────────────────────────────────────────────────── */
export default function StudentCard({
  buddy,
  isFollowed,
  onToggleFollow,
  onViewProfile,
  isLoggedIn,
  onNavigateToLogin,
}) {
  const liveFollowers = buddy.followersCount ?? buddy.followerCount ?? 0;

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onNavigateToLogin();
      return;
    }
    onToggleFollow(buddy.id || buddy._id);
  };

  const topSkills = buddy.skills?.slice(0, 3) || [];
  const overflowCount = Math.max(0, (buddy.skills?.length || 0) - 3);

  const coverStyle = buddy.bannerUrl
    ? { backgroundImage: `url(${buddy.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: buddy.bannerGradient || 'linear-gradient(135deg, #1A3A2A, #0F172A)' };

  return (
    <motion.article
      className="buddy-card"
      onClick={() => onViewProfile(buddy.id || buddy._id)}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      role="article"
      aria-label={buddy.name}
    >
      {/* Cover Header */}
      <div className="buddy-card-cover" style={coverStyle}>
        {/* Leadership Badge */}
        {buddy.leadBadge && <span className="lead-badge">{buddy.leadBadge}</span>}

        {/* Avatar */}
        <div className="buddy-avatar-wrap">
          <img
            src={buddy.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
            alt={buddy.name}
            className="buddy-avatar-img"
            loading="lazy"
          />
          <span className={`online-dot ${buddy.online ? 'online' : 'offline'}`} title={buddy.online ? 'Online now' : 'Offline'} />
        </div>
      </div>

      {/* Body */}
      <div className="buddy-card-body">
        <div className="buddy-name-row">
          <h3 className="buddy-name">{buddy.name}</h3>
          {buddy.isVerified && <ShieldCheck size={14} weight="fill" style={{ color: '#1A3A2A', flexShrink: 0 }} title="Verified Student" />}
        </div>

        <p className="buddy-sub-info">
          {buddy.branch} · {buddy.year}
        </p>

        <p className="buddy-bio-snippet">
          {buddy.bio || 'Campus member exploring new opportunities.'}
        </p>

        {/* Skill Chips */}
        {topSkills.length > 0 && (
          <div className="buddy-skills-wrap">
            {topSkills.map(skill => (
              <span key={skill} className="buddy-skill-chip">{skill}</span>
            ))}
            {overflowCount > 0 && (
              <span className="buddy-skill-overflow">+{overflowCount}</span>
            )}
          </div>
        )}

        {/* Metrics Bar */}
        <div className="buddy-card-metrics">
          <span>{formatMetricCount(liveFollowers)} followers</span>
          <span>•</span>
          <span>{formatMetricCount(buddy.followingCount)} following</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="buddy-card-actions">
        <motion.button
          className={`buddy-btn-follow ${isFollowed ? 'following' : ''}`}
          onClick={handleFollowClick}
          whileTap={{ scale: 0.95 }}
          aria-label={isFollowed ? `Following ${buddy.name}. Click to unfollow.` : `Follow ${buddy.name}`}
          title={isFollowed ? 'Click to unfollow' : `Follow ${buddy.name}`}
        >
          {isFollowed ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={13} weight="bold" /> Following
            </span>
          ) : (
            'Follow'
          )}
        </motion.button>

        <motion.button
          className="buddy-btn-profile"
          onClick={(e) => { e.stopPropagation(); onViewProfile(buddy.id || buddy._id); }}
          whileTap={{ scale: 0.95 }}
          aria-label={`View profile of ${buddy.name}`}
        >
          View Profile
        </motion.button>
      </div>
    </motion.article>
  );
}
