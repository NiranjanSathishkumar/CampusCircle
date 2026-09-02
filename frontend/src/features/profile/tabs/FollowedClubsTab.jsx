/**
 * FollowedClubsTab.jsx — Clubs & chapters the student follows.
 * Connected to backend polymorphic Follow endpoints.
 */
import { Link } from 'react-router-dom';
import { Buildings, MagnifyingGlass } from '@phosphor-icons/react';

export default function FollowedClubsTab({
  clubCategory,
  clubSearch,
  clubs,
  filteredClubs,
  handleUnfollowClub,
  setClubCategory,
  setClubSearch,
  showToast,
  loading = false,
}) {
  // Dynamically extract categories present in the student's followed clubs list
  const availableCategories = ['All', ...new Set(clubs.map((c) => c.category).filter(Boolean))];

  return (
    <div>
      <div className="profile-section-header">
        <div>
          <h2 className="profile-section-title">Followed Campus Communities ({clubs.length})</h2>
          <p className="profile-section-desc">Clubs and societies you are following for event updates and recruitment drives.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/communities" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.8125rem' }}>
            Discover New Clubs
          </Link>
          <button
            className="btn-secondary"
            onClick={() => showToast('Start a Club trigger: Navigate to Admin Portal to submit club charter proposal.')}
            style={{ fontSize: '0.8125rem' }}
          >
            Start a Club
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="club-toolbar">
        <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setClubCategory(cat)}
              className={`events-community-btn ${clubCategory === cat ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.3125rem 0.75rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="events-search-wrap" style={{ minWidth: 200, flex: 1 }}>
          <MagnifyingGlass size={14} className="events-search-icon" />
          <input
            type="search"
            className="events-search-input"
            placeholder="Search followed clubs…"
            value={clubSearch}
            onChange={e => setClubSearch(e.target.value)}
            style={{ padding: '0.4375rem 2.25rem 0.4375rem 2.25rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[200px] flex items-center justify-center py-12">
          <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredClubs.length === 0 ? (
        <div className="profile-empty-box">
          <div className="profile-empty-icon"><Buildings size={24} /></div>
          <h3 className="profile-empty-title">
            {clubs.length === 0 ? 'Not following any clubs yet' : 'No matching clubs found'}
          </h3>
          <p className="profile-empty-desc">
            {clubs.length === 0
              ? 'Explore and follow campus communities to receive event updates, announcements, and recruitment drives.'
              : 'Try clearing your category or search filter to view your followed communities.'}
          </p>
          <Link to="/communities" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
            Discover New Clubs
          </Link>
        </div>
      ) : (
        <div className="club-grid">
          {filteredClubs.map(club => (
            <div key={club.id} className="club-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link
                  to={`/communities/detail/${club.id}`}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 4,
                    background: club.iconBg || 'rgba(26, 58, 42, 0.12)',
                    color: club.iconColor || '#1A3A2A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    flexShrink: 0,
                    overflow: 'hidden',
                    textDecoration: 'none',
                  }}
                >
                  {club.logoUrl ? (
                    <img src={club.logoUrl} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    club.icon || '🏢'
                  )}
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>
                    <Link to={`/communities/detail/${club.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {club.name}
                    </Link>
                  </h3>
                  <span className="event-category-badge" style={{ marginTop: 2 }}>{club.category}</span>
                </div>
              </div>
              <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                {club.description}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #D8D2C4' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', color: '#6B7280' }}>
                  {club.followers} {club.followers === 1 ? 'follower' : 'followers'}
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => handleUnfollowClub(club.id)}
                  style={{ fontSize: '0.7188rem', padding: '0.25rem 0.5rem' }}
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
