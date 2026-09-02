/**
 * NetworkTab.jsx — Academic peer network (followers and following).
 * Connected to backend polymorphic Follow endpoints.
 */
import { Link } from 'react-router-dom';
import { MagnifyingGlass, UserPlus } from '@phosphor-icons/react';

export default function NetworkTab({
  filteredNetworkList,
  handleToggleFollowBack,
  handleUnfollowPeer,
  network,
  networkSearch,
  networkSubTab,
  setNetworkSearch,
  setNetworkSubTab,
  loading = false,
}) {
  return (
    <div>
      <div className="profile-section-header">
        <div>
          <h2 className="profile-section-title">Academic Peer Network</h2>
          <p className="profile-section-desc">Connect with verified peers, study partners, and fellow students across campus.</p>
        </div>
        <Link to="/buddies" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
          Explore Student Directory
        </Link>
      </div>

      {/* Subtabs & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div className="bookmark-subtabs" style={{ marginBottom: 0, borderBottom: 'none' }}>
          <button
            className={`bookmark-subtab-btn ${networkSubTab === 'followers' ? 'active' : ''}`}
            onClick={() => setNetworkSubTab('followers')}
          >
            Followers ({network.followers.length})
          </button>
          <button
            className={`bookmark-subtab-btn ${networkSubTab === 'following' ? 'active' : ''}`}
            onClick={() => setNetworkSubTab('following')}
          >
            Following ({network.following.length})
          </button>
        </div>

        <div className="events-search-wrap" style={{ minWidth: 200, flex: '0 1 240px' }}>
          <MagnifyingGlass size={14} className="events-search-icon" />
          <input
            type="search"
            className="events-search-input"
            placeholder="Search peers by name or branch…"
            value={networkSearch}
            onChange={e => setNetworkSearch(e.target.value)}
            style={{ padding: '0.4375rem 2.25rem 0.4375rem 2.25rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredNetworkList.length === 0 ? (
        <div className="profile-empty-box">
          <div className="profile-empty-icon"><UserPlus size={24} /></div>
          <h3 className="profile-empty-title">
            {networkSubTab === 'followers'
              ? (network.followers.length === 0 ? 'No followers yet' : 'No matching followers found')
              : (network.following.length === 0 ? 'Not following any peers yet' : 'No matching peers found')}
          </h3>
          <p className="profile-empty-desc">
            {networkSubTab === 'followers'
              ? 'Complete your profile and interact on the Discover feed and Buddies directory to grow your campus network.'
              : 'Search the campus student directory in the Buddies section to connect with students from your department and beyond.'}
          </p>
          <Link to="/buddies" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
            Browse Student Directory
          </Link>
        </div>
      ) : (
        <div className="network-roster-grid">
          {filteredNetworkList.map(peer => (
            <div key={peer.id} className="network-user-card">
              {/* Avatar */}
              <Link to={`/profile/${peer.id}`} className="network-avatar-wrap">
                <img
                  src={peer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={peer.name}
                  className="network-avatar-img"
                />
              </Link>

              {/* Identity Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link
                  to={`/profile/${peer.id}`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.875rem', fontWeight: 700, color: '#0F172A', textDecoration: 'none', display: 'block' }}
                >
                  {peer.name}
                </Link>
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.7188rem', color: '#6B7280', display: 'block' }}>
                  {peer.title}
                </span>
                {peer.degreeBadge && (
                  <span className="event-category-badge" style={{ fontSize: '0.5rem', marginTop: 2 }}>
                    {peer.degreeBadge}
                  </span>
                )}
              </div>

              {/* Actions */}
              {networkSubTab === 'followers' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {peer.isFollowingBack ? (
                    <button
                      className="btn-secondary"
                      onClick={() => handleToggleFollowBack(peer.id)}
                      style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                      title="Click to unfollow"
                    >
                      Following
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={() => handleToggleFollowBack(peer.id)}
                      style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                    >
                      Follow Back
                    </button>
                  )}
                </div>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => handleUnfollowPeer(peer.id)}
                  style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                  title="Unfollow peer"
                >
                  Unfollow
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
