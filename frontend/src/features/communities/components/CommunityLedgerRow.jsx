import { Calendar, Check, Eye, Flame, ShieldCheck, UsersThree } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   COMMUNITY LEDGER ROW — Compact Ledger List View
   ───────────────────────────────────────────────────────────── */
export default function CommunityLedgerRow({
  index,
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
    <button
      type="button"
      className="cc-ledger-row"
      onClick={() => onExplore(community.id)}
      role="listitem"
      aria-label={community.name}
    >
      <span className="cc-ledger-index">{String(index + 1).padStart(2, '0')}</span>

      <span className="cc-ledger-thumb" style={{ background: community.coverGradient || 'linear-gradient(135deg, #1A3A2A, #0F172A)' }}>
        {typeof community.icon === 'string' && (community.icon.startsWith('http') || community.icon.startsWith('/')) ? (
          <img src={community.icon} alt="" />
        ) : (
          community.icon
        )}
      </span>

      <span className="cc-ledger-main">
        <span className="cc-ledger-title-row">
          <span className="cc-ledger-title">{community.name}</span>
          {community.isVerified && <ShieldCheck size={13} weight="fill" style={{ color: '#1A3A2A', flexShrink: 0 }} />}
          {community.recruiting && (
            <span className="cc-ledger-badge" style={{ color: '#991B1B', background: 'rgba(153,27,27,0.08)' }}>
              <Flame size={9} weight="fill" style={{ marginRight: 2, verticalAlign: '-1px' }} />
              Recruiting
            </span>
          )}
        </span>
        <span className="cc-ledger-meta">
          <span className="cc-ledger-meta-item">{community.categoryLabel}</span>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile"><UsersThree size={11} />{liveMembers.toLocaleString('en-IN')} members</span>
          <span className="cc-ledger-meta-item cc-ledger-meta-hide-mobile"><Calendar size={11} />{community.activeEvents} event{community.activeEvents !== 1 ? 's' : ''}</span>
        </span>
      </span>

      <span className="cc-ledger-actions">
        <button
          className="comm-card-btn-preview"
          onClick={handlePreviewClick}
          aria-label={`Quick preview ${community.name}`}
          title="Quick preview"
        >
          <Eye size={15} />
        </button>
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
      </span>
    </button>
  );
}
