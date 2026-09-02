/**
 * BuddyDetailPanel.jsx — CampusCircle Peer Student Profile View
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CaretRight,
  ShieldCheck,
  Users,
  Trophy,
  Buildings,
  CheckCircle,
  ShareNetwork,
  UserPlus,
  Check,
  GithubLogo,
  LinkedinLogo,
  InstagramLogo,
  Sparkle,
  GraduationCap,
  BookOpen,
  Star,
  CalendarBlank,
  Flame,
  Tag,
  SealCheck,
  Scroll,
  Globe,
  ArrowSquareOut,
  Medal,
  Confetti,
  Handshake,
} from '@phosphor-icons/react';
import { formatMetricCount } from '@/features/buddies/buddiesConstants';
import '@/features/buddies/buddies.css';

/* ── Skill-tier colour mapping ─────────────────────────────── */
const SKILL_COLORS = [
  { bg: 'rgba(153,27,27,0.09)', border: 'rgba(153,27,27,0.22)', text: '#991B1B' },
  { bg: 'rgba(26,58,42,0.09)',  border: 'rgba(26,58,42,0.22)',  text: '#1A3A2A' },
  { bg: 'rgba(180,83,9,0.09)',  border: 'rgba(180,83,9,0.22)',  text: '#B45309' },
  { bg: 'rgba(30,64,175,0.09)', border: 'rgba(30,64,175,0.22)', text: '#1D4ED8' },
  { bg: 'rgba(109,40,217,0.09)',border: 'rgba(109,40,217,0.22)',text: '#7C3AED' },
];

/* ── Gradient palettes for community logo fallback ─────────── */
const CLUB_GRADIENTS = [
  'linear-gradient(135deg,#991B1B,#1A3A2A)',
  'linear-gradient(135deg,#1A3A2A,#0F172A)',
  'linear-gradient(135deg,#B45309,#991B1B)',
  'linear-gradient(135deg,#1D4ED8,#1A3A2A)',
  'linear-gradient(135deg,#7C3AED,#1D4ED8)',
];

/* ── Year → ring color ─────────────────────────────────────── */
const YEAR_RING = {
  '1st Year':  '#1D4ED8',
  '2nd Year':  '#1A3A2A',
  '3rd Year':  '#B45309',
  '4th Year':  '#991B1B',
  'Graduate / Alumni': '#7C3AED',
};

const DEFAULT_BANNER_FALLBACK = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80';

export default function BuddyDetailPanel({
  buddy,
  isFollowed,
  onToggleFollow,
  onBack,
  onShowToast,
  isLoggedIn,
  onNavigateToLogin,
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const buddyId = String(buddy.id || buddy._id || '');
  const liveFollowers = buddy.followersCount ?? buddy.followerCount ?? 0;

  const handleFollowClick = () => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    onToggleFollow(buddyId);
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/buddies/detail/${buddyId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch { /* fallback */ }
    setCopied(true);
    onShowToast?.('Profile link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const ringColor = YEAR_RING[buddy.year] || '#991B1B';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BookOpen size={14} /> },
    { id: 'clubs',    label: 'Clubs',    icon: <Buildings size={14} /> },
    { id: 'awards',   label: 'Awards',   icon: <Trophy size={14} /> },
  ];

  /* ── Social link helpers ───────────────────────────────────── */
  const githubUrl   = buddy.socials?.github   && (buddy.socials.github.startsWith('http')   ? buddy.socials.github   : `https://github.com/${buddy.socials.github.replace('@','')}`);
  const linkedinUrl = buddy.socials?.linkedin  && (buddy.socials.linkedin.startsWith('http')  ? buddy.socials.linkedin  : `https://linkedin.com/in/${buddy.socials.linkedin.replace('@','')}`);
  const instaUrl    = buddy.socials?.instagram && (buddy.socials.instagram.startsWith('http') ? buddy.socials.instagram : `https://instagram.com/${buddy.socials.instagram.replace('@','')}`);
  const hasSocials  = githubUrl || linkedinUrl || instaUrl;

  const bannerImgSrc = buddy.bannerUrl || DEFAULT_BANNER_FALLBACK;
  const avatarImgSrc = buddy.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(buddy.name || 'Student')}&background=1A3A2A&color=fff&size=512`;

  return (
    <div className="buddy-detail-page">
      <div className="buddies-inner">

        {/* ── Breadcrumb ── */}
        <motion.div
          className="profile-breadcrumb"
          aria-label="Breadcrumb navigation"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <button className="profile-breadcrumb-link" onClick={onBack}>Buddies</button>
          <CaretRight size={10} className="profile-breadcrumb-sep" aria-hidden="true" />
          <span className="profile-breadcrumb-current">{buddy.name}</span>
        </motion.div>

        <div style={{ paddingBottom: '0.75rem' }}>
          <motion.button
            className="events-back-btn"
            onClick={onBack}
            whileTap={{ scale: 0.96 }}
            whileHover={{ x: -2 }}
          >
            <ArrowLeft size={14} /> Back to Buddies Directory
          </motion.button>
        </div>

        {/* ── Main Layout ── */}
        <div className="buddy-detail-layout">

          {/* ══ LEFT / MAIN COLUMN ══════════════════════════════════ */}
          <div>

            {/* ── Profile Hero Container (Banner + Overlapping Avatar & Info) ── */}
            <motion.div
              className="buddy-detail-hero-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Banner frame with rounded corners and overflow hidden */}
              <div className="buddy-detail-banner-frame">
                <img
                  src={bannerImgSrc}
                  alt={`${buddy.name} cover banner`}
                  className="buddy-detail-banner-img"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_BANNER_FALLBACK;
                  }}
                />
                <div className="buddy-detail-banner-overlay" aria-hidden="true" />

                {/* Badges on top of the banner */}
                <div className="buddy-detail-banner-top-badges">
                  {buddy.leadBadge && (
                    <span className="lead-badge">{buddy.leadBadge}</span>
                  )}
                  <div className="buddy-detail-year-badge" style={{ borderColor: ringColor, color: ringColor }}>
                    <GraduationCap size={13} weight="bold" />
                    <span>{buddy.year}</span>
                  </div>
                </div>
              </div>

              {/* Identity Row — Overlapping the banner cleanly without clip */}
              <div className="buddy-detail-profile-head">
                {/* Circular Avatar */}
                <div className="buddy-detail-avatar-wrap" style={{ '--ring-color': ringColor }}>
                  <img
                    src={avatarImgSrc}
                    alt={buddy.name}
                    className="buddy-detail-avatar-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(buddy.name || 'Student')}&background=1A3A2A&color=fff&size=512`;
                    }}
                  />
                  <span
                    className={`online-dot ${buddy.online ? 'online' : 'offline'}`}
                    title={buddy.online ? 'Online now' : 'Offline'}
                  />
                </div>

                {/* Identity Info + Action Buttons */}
                <div className="buddy-detail-head-main">
                  <div className="buddy-detail-head-info">
                    <div className="buddy-detail-name-row">
                      <h1 className="buddy-detail-title">{buddy.name}</h1>
                      {buddy.isVerified && (
                        <span className="stamp-verified">
                          <ShieldCheck size={13} weight="fill" /> Verified
                        </span>
                      )}
                    </div>

                    <p className="buddy-detail-subtitle">
                      <GraduationCap size={16} weight="duotone" />
                      <span>{buddy.branch}</span>
                      <span className="buddy-detail-sep">•</span>
                      <span>{buddy.year}</span>
                    </p>

                    {/* Status pills row */}
                    <div className="buddy-detail-status-row">
                      <span className={`buddy-detail-online-pill ${buddy.online ? 'online' : 'offline'}`}>
                        <span className={`online-dot ${buddy.online ? 'online' : 'offline'}`} style={{ position: 'static', width: 7, height: 7 }} />
                        {buddy.online ? 'Active now' : 'Offline'}
                      </span>
                      {buddy.yearOfJoining && (
                        <span className="buddy-detail-meta-pill">
                          <CalendarBlank size={12} /> Joined {buddy.yearOfJoining}
                        </span>
                      )}
                      {buddy.interestTags?.length > 0 && (
                        <span className="buddy-detail-meta-pill">
                          <Flame size={12} /> {buddy.interestTags.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons (Follow & Share) */}
                  <div className="buddy-detail-action-row">
                    <motion.button
                      className={`btn-primary buddy-detail-action-btn${isFollowed ? ' following' : ''}`}
                      onClick={handleFollowClick}
                      whileTap={{ scale: 0.96 }}
                      aria-label={isFollowed ? `Following ${buddy.name}. Click to unfollow.` : `Follow ${buddy.name}`}
                    >
                      {isFollowed
                        ? <><CheckCircle size={16} weight="fill" /> Following</>
                        : <><UserPlus size={16} /> Follow Student</>}
                    </motion.button>

                    <motion.button
                      className={`events-sticky-icon-btn buddy-detail-share-btn${copied ? ' copied' : ''}`}
                      onClick={handleShareProfile}
                      whileTap={{ scale: 0.96 }}
                      title="Share student profile"
                    >
                      {copied ? <Check size={15} /> : <ShareNetwork size={15} />}
                      <span>{copied ? 'Copied' : 'Share'}</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Bio / About ── */}
            {buddy.bio && (
              <motion.div
                className="buddy-detail-bio-block"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="events-about-text">{buddy.bio}</p>
              </motion.div>
            )}

            {/* ── Metrics Strip ── */}
            <motion.div
              className="buddy-metrics-strip"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {[
                { icon: <Users size={20} weight="duotone" />, label: 'Followers', value: formatMetricCount(liveFollowers), accent: '#991B1B' },
                { icon: <Handshake size={20} weight="duotone" />, label: 'Following', value: formatMetricCount(buddy.followingCount), accent: '#1A3A2A' },
                { icon: <Medal size={20} weight="duotone" />, label: 'Awards', value: buddy.achievements?.length || 0, accent: '#B45309' },
                { icon: <Buildings size={20} weight="duotone" />, label: 'Clubs', value: buddy.communities?.length || 0, accent: '#1D4ED8' },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  className="buddy-metric-cell"
                  style={{ '--accent': m.accent }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2 }}
                >
                  <span className="buddy-metric-icon" style={{ color: m.accent }}>{m.icon}</span>
                  <span className="buddy-metric-value">{m.value}</span>
                  <span className="buddy-metric-label">{m.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* ── Interest Tags ── */}
            {buddy.interestTags?.length > 0 && (
              <motion.div
                className="buddy-section-block"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <h2 className="buddy-section-title">
                  <Flame size={16} weight="duotone" style={{ color: '#B45309' }} />
                  Interests
                </h2>
                <div className="profile-tags-wrap" style={{ gap: '0.5rem' }}>
                  {buddy.interestTags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="buddy-interest-chip"
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.28, delay: i * 0.04 }}
                    >
                      <Tag size={11} /> {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Tab navigation ── */}
            <div className="buddy-tab-bar" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`buddy-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ── Tab Panels ── */}
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >

                  {/* Skills */}
                  {buddy.skills?.length > 0 && (
                    <div className="buddy-section-block">
                      <h2 className="buddy-section-title">
                        <Sparkle size={16} weight="duotone" style={{ color: '#991B1B' }} />
                        Skills &amp; Technologies
                      </h2>
                      <div className="profile-tags-wrap" style={{ gap: '0.5rem' }}>
                        {buddy.skills.map((skill, i) => {
                          const c = SKILL_COLORS[i % SKILL_COLORS.length];
                          return (
                            <motion.span
                              key={skill}
                              className="buddy-skill-chip"
                              style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.text }}
                              initial={{ opacity: 0, y: 6, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.28, delay: i * 0.035 }}
                              whileHover={{ y: -2, scale: 1.03 }}
                            >
                              {skill}
                            </motion.span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Social links */}
                  {hasSocials && (
                    <div className="buddy-section-block">
                      <h2 className="buddy-section-title">
                        <Globe size={16} weight="duotone" style={{ color: '#1A3A2A' }} />
                        Portfolio &amp; Social Links
                      </h2>
                      <div className="buddy-social-row">
                        {githubUrl && (
                          <a href={githubUrl} target="_blank" rel="noreferrer" className="buddy-social-link github">
                            <GithubLogo size={18} weight="fill" />
                            <span>GitHub</span>
                            <ArrowSquareOut size={11} className="buddy-social-ext" />
                          </a>
                        )}
                        {linkedinUrl && (
                          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="buddy-social-link linkedin">
                            <LinkedinLogo size={18} weight="fill" />
                            <span>LinkedIn</span>
                            <ArrowSquareOut size={11} className="buddy-social-ext" />
                          </a>
                        )}
                        {instaUrl && (
                          <a href={instaUrl} target="_blank" rel="noreferrer" className="buddy-social-link instagram">
                            <InstagramLogo size={18} weight="fill" />
                            <span>Instagram</span>
                            <ArrowSquareOut size={11} className="buddy-social-ext" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Education timeline */}
                  {buddy.education?.length > 0 && (
                    <div className="buddy-section-block">
                      <h2 className="buddy-section-title">
                        <Scroll size={16} weight="duotone" style={{ color: '#7C3AED' }} />
                        Education
                      </h2>
                      <div className="buddy-timeline">
                        {buddy.education.map((edu, i) => (
                          <motion.div
                            key={i}
                            className="buddy-timeline-item"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.07 }}
                          >
                            <div className="buddy-timeline-dot" />
                            <div className="buddy-timeline-content">
                              <p className="buddy-timeline-title">
                                {typeof edu === 'string' ? edu : edu.degree || edu.institution || 'Education'}
                              </p>
                              {typeof edu === 'object' && edu.institution && edu.degree && (
                                <p className="buddy-timeline-sub">{edu.institution}</p>
                              )}
                              {typeof edu === 'object' && edu.year && (
                                <span className="buddy-timeline-year">{edu.year}</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for overview when nothing to show */}
                  {!buddy.skills?.length && !hasSocials && !buddy.education?.length && (
                    <div className="buddy-empty-state">
                      <BookOpen size={36} weight="duotone" style={{ color: '#D8D2C4' }} />
                      <p>This student hasn't added details yet.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── CLUBS TAB ── */}
              {activeTab === 'clubs' && (
                <motion.div
                  key="clubs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {buddy.communities?.length > 0 ? (
                    <div className="buddy-clubs-grid">
                      {buddy.communities.map((c, i) => (
                        <motion.div
                          key={i}
                          className="buddy-club-card"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.06 }}
                          whileHover={{ y: -3 }}
                        >
                          <div
                            className="buddy-club-logo"
                            style={{
                              background: c.logo ? undefined : CLUB_GRADIENTS[i % CLUB_GRADIENTS.length],
                              backgroundImage: c.logo ? `url(${c.logo})` : undefined,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          >
                            {!c.logo && (
                              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: '1.25rem', color: '#fff' }}>
                                {(c.name || '?').charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="buddy-club-info">
                            <p className="buddy-club-name">{c.name}</p>
                            {c.category && <p className="buddy-club-cat">{c.category}</p>}
                          </div>
                          <span className="buddy-club-role-badge">
                            {c.role === 'Lead' || c.role === 'President' ? <Star size={10} weight="fill" /> : <SealCheck size={10} weight="fill" />}
                            {c.role}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="buddy-empty-state">
                      <Buildings size={36} weight="duotone" style={{ color: '#D8D2C4' }} />
                      <p>No clubs joined yet.</p>
                      <span>This student hasn't joined any communities.</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── AWARDS TAB ── */}
              {activeTab === 'awards' && (
                <motion.div
                  key="awards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {buddy.achievements?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                      {buddy.achievements.map((ach, i) => (
                        <motion.div
                          key={i}
                          className="buddy-award-card"
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.32, delay: i * 0.07 }}
                          whileHover={{ x: 3 }}
                        >
                          <div className="buddy-award-icon-wrap">
                            <Trophy size={20} weight="duotone" style={{ color: '#B45309' }} />
                          </div>
                          <div className="buddy-award-body">
                            <p className="buddy-award-title">{ach.title}</p>
                            <p className="buddy-award-issuer">{ach.issuer}</p>
                            {ach.description && (
                              <p className="buddy-award-desc">{ach.description}</p>
                            )}
                          </div>
                          <div className="buddy-award-year">
                            <CalendarBlank size={11} /> {ach.year}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="buddy-empty-state">
                      <Confetti size={36} weight="duotone" style={{ color: '#D8D2C4' }} />
                      <p>No awards yet.</p>
                      <span>Achievements will appear here once earned.</span>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* ══ RIGHT / SIDEBAR ═══════════════════════════════════ */}
          <div>
            <motion.div
              className="buddy-sidebar-card"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Sidebar header */}
              <div className="buddy-sidebar-header">
                <p className="buddy-sidebar-title">Student Profile</p>
                {buddy.isVerified && (
                  <span className="stamp-verified" style={{ fontSize: '0.5rem' }}>
                    <ShieldCheck size={11} weight="fill" /> Verified
                  </span>
                )}
              </div>

              {/* Profile data rows */}
              <div className="buddy-sidebar-body">
                <SidebarRow label="Branch" value={buddy.branch} />
                <SidebarRow label="Academic Year" value={buddy.year} />
                {buddy.yearOfJoining && <SidebarRow label="Year of Joining" value={String(buddy.yearOfJoining)} />}
                {buddy.yearOfJoining && (
                  <SidebarRow
                    label="Expected Graduation"
                    value={String(Number(buddy.yearOfJoining) + 4)}
                  />
                )}

                {/* Online status */}
                <div className="buddy-sidebar-row">
                  <span className="profile-detail-label">Status</span>
                  <p className={`buddy-status-badge ${buddy.online ? 'online' : 'offline'}`}>
                    <span
                      className={`online-dot ${buddy.online ? 'online' : 'offline'}`}
                      style={{ position: 'static', flexShrink: 0 }}
                    />
                    {buddy.online ? 'Online now' : 'Offline'}
                  </p>
                </div>

                {/* Skill count */}
                {buddy.skills?.length > 0 && (
                  <SidebarRow label="Skills Listed" value={`${buddy.skills.length} skill${buddy.skills.length !== 1 ? 's' : ''}`} />
                )}

                {/* Communities */}
                {buddy.communities?.length > 0 && (
                  <SidebarRow label="Clubs Joined" value={`${buddy.communities.length} club${buddy.communities.length !== 1 ? 's' : ''}`} />
                )}

                {/* Social quick links */}
                {hasSocials && (
                  <div className="buddy-sidebar-row">
                    <span className="profile-detail-label">Social</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {githubUrl   && <a href={githubUrl}   target="_blank" rel="noreferrer" className="buddy-sidebar-social-icon" title="GitHub"><GithubLogo   size={16} /></a>}
                      {linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer" className="buddy-sidebar-social-icon" title="LinkedIn"><LinkedinLogo size={16} style={{ color: '#0A66C2' }} /></a>}
                      {instaUrl    && <a href={instaUrl}    target="_blank" rel="noreferrer" className="buddy-sidebar-social-icon" title="Instagram"><InstagramLogo size={16} style={{ color: '#E4405F' }} /></a>}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA section (Follow only) */}
              <div className="buddy-sidebar-cta">
                <motion.button
                  className={`events-sticky-reg-btn${isFollowed ? ' registered' : ''}`}
                  onClick={handleFollowClick}
                  whileTap={{ scale: 0.97 }}
                >
                  {isFollowed
                    ? <><CheckCircle size={16} weight="fill" /> Following</>
                    : <><UserPlus size={16} /> Follow Student</>}
                </motion.button>
              </div>
            </motion.div>

            {/* ── Skills Quick-Peek (sidebar) ── */}
            {buddy.skills?.length > 0 && (
              <motion.div
                className="buddy-sidebar-skills"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="buddy-sidebar-section-label">Top Skills</p>
                <div className="profile-tags-wrap" style={{ gap: '0.375rem' }}>
                  {buddy.skills.slice(0, 6).map((skill, i) => {
                    const c = SKILL_COLORS[i % SKILL_COLORS.length];
                    return (
                      <span
                        key={skill}
                        className="buddy-skill-chip"
                        style={{ background: c.bg, border: `1.5px solid ${c.border}`, color: c.text, fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Helper: sidebar data row ─────────────────────────────── */
function SidebarRow({ label, value }) {
  return (
    <div className="buddy-sidebar-row">
      <span className="profile-detail-label">{label}</span>
      <p className="profile-detail-value">{value || '—'}</p>
    </div>
  );
}
