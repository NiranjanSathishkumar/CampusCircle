import { motion } from 'motion/react';
import { Check, ShieldCheck } from '@phosphor-icons/react';
import { formatMetricCount } from '@/features/buddies/buddiesConstants';

/* ─────────────────────────────────────────────────────────────
   BUDDY LEDGER ROW — Compact Ledger List View
   ───────────────────────────────────────────────────────────── */
export default function BuddyLedgerRow({ index, buddy, isFollowed, onToggleFollow, onViewProfile, isLoggedIn, onNavigateToLogin }) {
  const liveFollowers = buddy.followersCount ?? buddy.followerCount ?? 0;
  const topSkills = buddy.skills?.slice(0, 2) || [];

  const handleFollowClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) { onNavigateToLogin(); return; }
    onToggleFollow(buddy.id || buddy._id);
  };

  return (
    <button
      type="button"
      className="cc-ledger-row"
      onClick={() => onViewProfile(buddy.id || buddy._id)}
      role="listitem"
      aria-label={buddy.name}
    >
      <span className="cc-ledger-index">{String(index + 1).padStart(2, '0')}</span>

      <span className="cc-ledger-thumb" style={{ position: 'relative', borderRadius: '50%' }}>
        <img
          src={buddy.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
          alt=""
        />
        <span
          className={`online-dot ${buddy.online ? 'online' : 'offline'}`}
          style={{ position: 'absolute', bottom: 1, right: 1 }}
        />
      </span>

      <span className="cc-ledger-main">
        <span className="cc-ledger-title-row">
          <span className="cc-ledger-title">{buddy.name}</span>
          {buddy.isVerified && <ShieldCheck size={13} weight="fill" style={{ color: '#1A3A2A', flexShrink: 0 }} />}
        </span>
        <span className="cc-ledger-meta">
          <span className="cc-ledger-meta-item">{buddy.branch} · {buddy.year}</span>
          {topSkills.length > 0 && (
            <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile">{topSkills.join(', ')}</span>
          )}
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile">{formatMetricCount(liveFollowers)} followers</span>
        </span>
      </span>

      <span className="cc-ledger-actions">
        <motion.button
          className={`buddy-btn-follow ${isFollowed ? 'following' : ''}`}
          onClick={handleFollowClick}
          whileTap={{ scale: 0.95 }}
          aria-label={isFollowed ? `Following ${buddy.name}. Click to unfollow.` : `Follow ${buddy.name}`}
          title={isFollowed ? 'Click to unfollow' : `Follow ${buddy.name}`}
        >
          {isFollowed ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} weight="bold" /> Following
            </span>
          ) : (
            'Follow'
          )}
        </motion.button>
      </span>
    </button>
  );
}
