/**
 * Saved events and posts.
 */
import { Link } from 'react-router-dom';
import { BookmarkSimple, Trash } from '@phosphor-icons/react';

export default function BookmarkedTab({
  bookmarkSubTab,
  bookmarks,
  handleRemoveBookmarkEvent,
  handleRemoveBookmarkPost,
  setBookmarkSubTab,
}) {
  return (
    <div>
      <div className="profile-section-header">
        <div>
          <h2 className="profile-section-title">Saved Discoveries</h2>
          <p className="profile-section-desc">Quick access to bookmarked campus events, workshops, and announcements.</p>
        </div>
      </div>

      {/* Subtabs */}
      <div className="bookmark-subtabs">
        <button
          className={`bookmark-subtab-btn ${bookmarkSubTab === 'events' ? 'active' : ''}`}
          onClick={() => setBookmarkSubTab('events')}
        >
          Saved Events ({bookmarks.events.length})
        </button>
        <button
          className={`bookmark-subtab-btn ${bookmarkSubTab === 'posts' ? 'active' : ''}`}
          onClick={() => setBookmarkSubTab('posts')}
        >
          Saved Posts ({bookmarks.posts.length})
        </button>
      </div>

      {bookmarkSubTab === 'events' && (
        bookmarks.events.length === 0 ? (
          <div className="profile-empty-box">
            <div className="profile-empty-icon"><BookmarkSimple size={24} /></div>
            <h3 className="profile-empty-title">No bookmarked discoveries saved yet</h3>
            <p className="profile-empty-desc">Explore upcoming campus events and bookmark them to keep track of deadlines.</p>
            <Link to="/events" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="bookmark-grid">
            {bookmarks.events.map(ev => (
              <div key={ev.id} className="bookmark-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span className="event-category-badge">{ev.category}</span>
                  <button
                    onClick={() => handleRemoveBookmarkEvent(ev.id)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 2 }}
                    title="Remove bookmark"
                  >
                    <Trash size={15} />
                  </button>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: '0.25rem 0' }}>
                  {ev.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.75rem', color: '#6B7280', margin: 0 }}>
                  {ev.meta}
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <Link to={`/events/detail/${ev.id}`} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '0.375rem' }}>
                    View Event Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {bookmarkSubTab === 'posts' && (
        bookmarks.posts.length === 0 ? (
          <div className="profile-empty-box">
            <div className="profile-empty-icon"><BookmarkSimple size={24} /></div>
            <h3 className="profile-empty-title">No bookmarked discoveries saved yet</h3>
            <p className="profile-empty-desc">Bookmark announcements and posts from campus communities to view them here.</p>
            <Link to="/discover" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
              Explore Discover Feed
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookmarks.posts.map(post => (
              <div key={post.id} className="bookmark-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span className="event-category-badge">{post.category}</span>
                  <button
                    onClick={() => handleRemoveBookmarkPost(post.id)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 2 }}
                    title="Remove bookmark"
                  >
                    <Trash size={15} />
                  </button>
                </div>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: '0.25rem 0' }}>
                  {post.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: '#374151', margin: '0 0 0.5rem', lineHeight: 1.5 }}>
                  {post.excerpt}
                </p>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.625rem', color: '#9CA3AF' }}>
                  Posted by {post.author} ({post.authorRole}) · {post.date}
                </span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
