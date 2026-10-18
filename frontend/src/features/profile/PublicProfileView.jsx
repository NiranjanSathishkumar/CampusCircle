/**
 * PublicProfileView.jsx — read-only view of another student's profile,
 * rendered by ProfilePage.jsx when /profile/:userId doesn't match the
 * logged-in student. Fetches GET /api/profile/:studentId (public fields,
 * achievements, and active community memberships — see backend
 * students.controller.js).
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import {
  ShieldCheck,
  GraduationCap,
  Sparkle,
  ArrowSquareOut,
  CaretRight,
  FilePdf,
  UserPlus,
  UserMinus,
  Check,
  CheckCircle,
  Buildings,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import { getStudentPublicProfile } from '@/features/profile/profile.api';
import { followUser, unfollowUser } from '@/features/follows/follows.api';
import './profile.css';

function mediaUrl(media) {
  return media?.cloudinaryUrl || media?.filename || '';
}

function formatAchievementDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function isPdfUrl(url) {
  return Boolean(url) && url.toLowerCase().endsWith('.pdf');
}

function StatusScreen({ icon, title, desc, action }) {
  return (
    <>
      <Navbar />
      <div className="profile-page" style={{ paddingTop: 64 }}>
        <div className="profile-page-inner">
          <div className="profile-empty-box" style={{ marginTop: '3rem' }}>
            <div className="profile-empty-icon">{icon}</div>
            <h3 className="profile-empty-title">{title}</h3>
            <p className="profile-empty-desc">{desc}</p>
            {action}
          </div>
        </div>
      </div>
      <Footer compact />
    </>
  );
}

export default function PublicProfileView({ studentId }) {
  const { user, isLoggedIn } = useAuth();
  const [student, setStudent] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | auth | notfound | error

  /* ── Achievement lightbox ── */
  const [expandedAchievement, setExpandedAchievement] = useState(null);
  const achievementsSectionRef = useRef(null);
  const communitiesSectionRef = useRef(null);

  /* ── Follow state ── */
  const [isFollowed, setIsFollowed] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [followerCountDelta, setFollowerCountDelta] = useState(0);

  /* ── Toast state ── */
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3500);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const data = await getStudentPublicProfile(studentId);
        if (cancelled) return;
        setStudent(data.student);
        setAchievements(data.achievements || []);
        setCommunities(data.communities || []);
        setIsFollowed(Boolean(data.isFollowedByMe));
        setFollowerCountDelta(0);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401) setStatus('auth');
        else if (err.status === 404) setStatus('notfound');
        else setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, [studentId]);

  const handleToggleFollow = async () => {
    if (!isLoggedIn) return;
    if (followBusy || !student) return;

    const wasFollowing = isFollowed;
    const nextFollowing = !wasFollowing;
    const name = student.name || 'Student';

    // Optimistic update
    setIsFollowed(nextFollowing);
    setFollowerCountDelta((prev) => prev + (nextFollowing ? 1 : -1));
    setFollowBusy(true);

    try {
      if (wasFollowing) {
        await unfollowUser(studentId);
        showToast(`Unfollowed ${name}`);
      } else {
        await followUser(studentId);
        showToast(`Now following ${name}!`);
      }
    } catch (err) {
      // Rollback
      setIsFollowed(wasFollowing);
      setFollowerCountDelta((prev) => prev + (wasFollowing ? 1 : -1));
      showToast(err.message || `Failed to update follow status for ${name}`);
    } finally {
      setFollowBusy(false);
    }
  };

  useEffect(() => {
    if (!expandedAchievement) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setExpandedAchievement(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedAchievement]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA]" style={{ paddingTop: 64 }}>
          <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer compact />
      </>
    );
  }

  if (status === 'auth') {
    return (
      <StatusScreen
        icon={<ShieldCheck size={24} />}
        title="Sign in to view this profile"
        desc="CampusCircle student profiles are only visible to signed-in members of the campus community."
        action={<Link to="/login" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>Go to Login</Link>}
      />
    );
  }

  if (status === 'notfound') {
    return (
      <StatusScreen
        icon={<GraduationCap size={24} />}
        title="Student not found"
        desc="This student account may have been removed, or the link is incorrect."
      />
    );
  }

  if (status === 'error') {
    return (
      <StatusScreen
        icon={<GraduationCap size={24} />}
        title="Failed to load profile"
        desc="Something went wrong loading this profile. Please try again shortly."
      />
    );
  }

  const isEnrolled = student.isEnrolled;
  const isPending = isEnrolled == null;
  const isActive = Boolean(isEnrolled);
  const standingLabel = isPending ? 'Year —' : isActive ? `Year ${student.currentYear ?? '—'}` : 'Alumni';
  const statusLabel = isPending ? 'Pending' : isActive ? 'Active' : 'Graduated';
  const isOwnAccount = Boolean(user && String(user._id) === String(studentId));
  const liveFollowerCount = Math.max(0, (student.followerCount || 0) + followerCountDelta);

  return (
    <>
      <Navbar />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              background: '#0F172A',
              color: '#F5F2EA',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 500,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <CheckCircle size={16} weight="fill" style={{ color: '#4ADE80', flexShrink: 0 }} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="profile-page" style={{ paddingTop: 64 }}>
        <div className="profile-page-inner">
          <div className="profile-breadcrumb" aria-label="Breadcrumb navigation">
            <Link to="/discover" className="profile-breadcrumb-link">Home</Link>
            <CaretRight size={10} className="profile-breadcrumb-sep" aria-hidden="true" />
            <Link to="/buddies" className="profile-breadcrumb-link">Buddies</Link>
            <CaretRight size={10} className="profile-breadcrumb-sep" aria-hidden="true" />
            <span className="profile-breadcrumb-current">{student.name}</span>
          </div>

          <div className="profile-hero-card">
            <div className="profile-banner-wrap">
              <img
                src={mediaUrl(student.profileBanner) || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'}
                alt="Profile banner"
                className="profile-banner-img"
              />
              <div className="profile-banner-overlay" aria-hidden="true" />
            </div>

            <div className="profile-summary-body">
              <div className="profile-avatar-row">
                <div className="profile-avatar-wrap">
                  <img
                    src={mediaUrl(student.profilePicture) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={student.name}
                    className="profile-avatar-img"
                  />
                </div>

                {!isOwnAccount && (
                  <div className="profile-summary-actions">
                    {isLoggedIn ? (
                      <button
                        className={isFollowed ? 'btn-secondary' : 'btn-primary'}
                        onClick={handleToggleFollow}
                        disabled={followBusy}
                        style={{
                          fontSize: '0.8125rem',
                          padding: '0.5rem 1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                        aria-label={isFollowed ? `Following ${student.name}. Click to unfollow.` : `Follow ${student.name}`}
                        title={isFollowed ? 'Click to unfollow' : `Follow ${student.name}`}
                      >
                        {isFollowed ? (
                          <>
                            <Check size={14} weight="bold" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="btn-primary"
                        style={{
                          textDecoration: 'none',
                          fontSize: '0.8125rem',
                          padding: '0.5rem 1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <UserPlus size={14} />
                        <span>Follow</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div className="profile-identity-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <h1 className="profile-student-name">{student.name}</h1>
                  <span className="stamp-verified" style={{ padding: '0.25rem 0.625rem', fontSize: '0.625rem' }}>
                    <ShieldCheck size={13} weight="fill" />
                    Verified Student
                  </span>
                  <span className={`standing-badge ${isPending ? 'pending' : isActive ? 'active' : 'alumni'}`}>
                    <span className="standing-dot" />
                    {standingLabel} · {statusLabel}
                  </span>
                </div>

                <p className="profile-student-sub">
                  <GraduationCap size={16} style={{ color: '#1A3A2A' }} />
                  <span>{student.branch}</span>
                  {student.yearOfJoining && (
                    <>
                      <span style={{ color: '#D8D2C4' }}>•</span>
                      <span>Joined {student.yearOfJoining}</span>
                    </>
                  )}
                </p>

                {student.bio && (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#374151', margin: '0.5rem 0 0', lineHeight: 1.6 }}>
                    {student.bio}
                  </p>
                )}
              </div>

              <div className="profile-stats-bar">
                <div
                  className="profile-stat-item"
                  onClick={achievements.length > 0 ? () => scrollToSection(achievementsSectionRef) : undefined}
                  style={achievements.length > 0 ? undefined : { cursor: 'default' }}
                >
                  <span className="profile-stat-val">{achievements.length}</span>
                  <span className="profile-stat-lbl">Achievements</span>
                </div>
                <div
                  className="profile-stat-item"
                  onClick={communities.length > 0 ? () => scrollToSection(communitiesSectionRef) : undefined}
                  style={communities.length > 0 ? undefined : { cursor: 'default' }}
                >
                  <span className="profile-stat-val">{communities.length}</span>
                  <span className="profile-stat-lbl">Communities</span>
                </div>
                <div className="profile-stat-item" style={{ cursor: 'default' }}>
                  <span className="profile-stat-val">{liveFollowerCount}</span>
                  <span className="profile-stat-lbl">Followers</span>
                </div>
                <div className="profile-stat-item" style={{ cursor: 'default' }}>
                  <span className="profile-stat-val">{student.followingCount || 0}</span>
                  <span className="profile-stat-lbl">Following</span>
                </div>
              </div>
            </div>
          </div>

          {communities.length > 0 && (
            <div
              className="profile-content-panel"
              style={{ marginTop: '1.25rem', scrollMarginTop: '84px' }}
              ref={communitiesSectionRef}
            >
              <div className="profile-section-header">
                <div>
                  <h2 className="profile-section-title">Communities ({communities.length})</h2>
                  <p className="profile-section-desc">Clubs and student organizations {student.name} is actively part of.</p>
                </div>
              </div>
              <div className="club-grid">
                {communities.map(c => (
                  <Link
                    key={c.id}
                    to={`/communities/detail/${c.id}`}
                    className="club-card is-link"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 4,
                          background: 'rgba(26, 58, 42, 0.12)',
                          color: '#1A3A2A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {mediaUrl(c.logo) ? (
                          <img src={mediaUrl(c.logo)} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Buildings size={20} weight="fill" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.9375rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                          {c.name}
                        </h3>
                        {c.category && <span className="event-category-badge" style={{ marginTop: 2 }}>{c.category}</span>}
                      </div>
                    </div>
                    <span className="profile-skill-chip" style={{ alignSelf: 'flex-start' }}>{c.role}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(student.skills?.length > 0 || student.interestTags?.length > 0) && (
            <div className="profile-content-panel" style={{ marginTop: '1.25rem' }}>
              {student.skills?.length > 0 && (
                <div style={{ marginBottom: student.interestTags?.length > 0 ? '1rem' : 0 }}>
                  <h2 className="profile-section-title" style={{ fontSize: '1rem' }}>Skills</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                    {student.skills.map(skill => (
                      <span key={skill} className="event-category-badge">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {student.interestTags?.length > 0 && (
                <div>
                  <h2 className="profile-section-title" style={{ fontSize: '1rem' }}>Interests</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                    {student.interestTags.map(tag => (
                      <span key={tag} className="event-category-badge">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            className="profile-content-panel"
            style={{ marginTop: '1.25rem', scrollMarginTop: '84px' }}
            ref={achievementsSectionRef}
          >
            <div className="profile-section-header">
              <div>
                {/* "Verified" would contradict the landing page's own Closed
                    Campus Policy FAQ, which states achievements are "entirely
                    self-reported" and never validated by CampusCircle or the
                    college. */}
                <h2 className="profile-section-title">Achievements — Self-Reported ({achievements.length})</h2>
                <p className="profile-section-desc">Hackathon prizes, cloud certifications, workshop completions, and academic credentials.</p>
              </div>
            </div>

            {achievements.length === 0 ? (
              <div className="profile-empty-box">
                <div className="profile-empty-icon"><Sparkle size={24} /></div>
                <h3 className="profile-empty-title">No achievements shared yet</h3>
              </div>
            ) : (
              <div className="cert-grid">
                {achievements.map(a => {
                  const imageUrl = a.certificate?.cloudinaryUrl || '';
                  return (
                    <div
                      key={a._id}
                      className="cert-card"
                      onClick={() => setExpandedAchievement(a)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedAchievement(a);
                        }
                      }}
                    >
                      <div className="cert-card-img-wrap">
                        {imageUrl ? (
                          isPdfUrl(imageUrl) ? (
                            <div className="cert-card-img" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F172A', gap: '0.375rem', padding: '1rem' }}>
                              <FilePdf size={28} weight="fill" style={{ color: '#E4405F' }} />
                              <span style={{ fontSize: '0.6875rem', color: '#F5F2EA', fontWeight: 600 }}>PDF Certificate</span>
                            </div>
                          ) : (
                            <img src={imageUrl} alt={a.title} className="cert-card-img" />
                          )
                        ) : (
                          <div className="cert-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0EDE5' }}>
                            <Sparkle size={24} style={{ color: '#9CA3AF' }} />
                          </div>
                        )}
                      </div>
                      <div className="cert-card-body">
                        <h3 className="cert-card-title">{a.title}</h3>
                        <span className="cert-card-issuer">{a.issuer}</span>
                        <span className="cert-card-date">{formatAchievementDate(a.dateEarned || a.createdAt)}</span>
                        {a.description && <p className="cert-card-desc">{a.description}</p>}
                      </div>
                      {a.verificationLink && (
                        <div className="cert-card-footer">
                          <a
                            href={a.verificationLink}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '0.625rem',
                              color: '#991B1B',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontWeight: 700,
                            }}
                          >
                            Verify Credential <ArrowSquareOut size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Lightbox (read-only) */}
      <AnimatePresence>
        {expandedAchievement && (
          <motion.div
            className="cert-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedAchievement(null)}
            role="dialog"
            aria-modal="true"
            aria-label={expandedAchievement.title}
          >
            <motion.div
              className="cert-lightbox-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ position: 'relative', minHeight: 220, maxHeight: 380, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {(() => {
                  const imageUrl = expandedAchievement.certificate?.cloudinaryUrl || '';
                  if (!imageUrl) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <Sparkle size={36} style={{ color: 'rgba(245,242,234,0.4)', marginBottom: 8 }} />
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#9CA3AF', margin: 0 }}>
                          No certificate document attached
                        </p>
                      </div>
                    );
                  }
                  if (isPdfUrl(imageUrl)) {
                    return (
                      <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <FilePdf size={40} weight="fill" style={{ color: '#E4405F', marginBottom: 8 }} />
                        <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem', fontWeight: 600, color: '#F5F2EA', margin: '0 0 0.75rem' }}>
                          PDF Certificate
                        </p>
                        <a
                          href={imageUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary"
                          style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}
                        >
                          Open PDF Document <ArrowSquareOut size={14} />
                        </a>
                      </div>
                    );
                  }
                  return (
                    <img
                      src={imageUrl}
                      alt={expandedAchievement.title}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 380 }}
                    />
                  );
                })()}
                <button
                  onClick={() => setExpandedAchievement(null)}
                  aria-label="Close dialog"
                  style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(15,23,42,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.125rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  {expandedAchievement.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.8125rem', color: '#991B1B', fontWeight: 600, margin: 0 }}>
                  {expandedAchievement.issuer}
                  {formatAchievementDate(expandedAchievement.dateEarned || expandedAchievement.createdAt) &&
                    ` · ${formatAchievementDate(expandedAchievement.dateEarned || expandedAchievement.createdAt)}`}
                </p>
                {expandedAchievement.description && (
                  <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, margin: '0.25rem 0 0' }}>
                    {expandedAchievement.description}
                  </p>
                )}
                {expandedAchievement.verificationLink && (
                  <a
                    href={expandedAchievement.verificationLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#991B1B', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontWeight: 700, marginTop: '0.5rem' }}
                  >
                    Verify Credential <ArrowSquareOut size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer compact />
    </>
  );
}
