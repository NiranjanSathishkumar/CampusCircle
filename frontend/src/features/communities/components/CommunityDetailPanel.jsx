/**
 * CommunityDetailPanel.jsx — CampusCircle Community Detail Page View
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A · Gold #B45309
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (data/mono)
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CaretRight,
  ShieldCheck,
  UsersThree,
  Calendar,
  User,
  Clock,
  ShareNetwork,
  PaperPlaneTilt,
  ChatCircleText,
  GithubLogo,
  LinkedinLogo,
  InstagramLogo,
  DiscordLogo,
  TwitterLogo,
  ArrowSquareOut,
  Info,
  Check,
  Sparkle,
  Flame,
  Globe,
  CircleNotch,
  TrendUp,
  Buildings,
  Question,
  CaretDown,
  Star,
  MapPin,
  Tag,
  CalendarBlank,
  Compass,
  CheckCircle,
  Lightning,
  BookOpen,
  EnvelopeSimple,
} from '@phosphor-icons/react';
import { COMMUNITY_CATEGORIES } from '@/features/communities/communitiesConstants';
import { fetchCommunityDrives, submitDriveApplication, fetchMyApplications } from '@/features/communities/communities.api';
import { ApiError } from '@/shared/api/httpClient';
import DriveApplicationDialog from '@/features/communities/components/DriveApplicationDialog';
import '@/features/communities/communities.css';

const isSimpleDrive = (drive) =>
  !drive.requireWaiver && (drive.formQuestions || []).every((q) => !q.required);

function formatDeadline(deadline) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Animated count-up hook */
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target || typeof target !== 'number') {
      setCount(typeof target === 'number' ? target : 0);
      return;
    }
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return count;
}

function StatTile({ value, label, accent, icon: Icon, onClick, isClickable }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  return (
    <div
      className={`cdp-stat-tile${accent ? ' cdp-stat-tile--accent' : ''}${isClickable ? ' cdp-stat-tile--clickable' : ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="cdp-stat-tile__top">
        {Icon && <Icon size={14} className="cdp-stat-tile__icon" />}
        <span className="cdp-stat-tile__num">{typeof value === 'number' ? animated : (value ?? '—')}</span>
      </div>
      <span className="cdp-stat-tile__lbl">{label}</span>
    </div>
  );
}

/* ── FAQ Accordion Item ── */
function FaqItem({ q, a, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`cdp-faq-item${open ? ' cdp-faq-item--open' : ''}`}>
      <button
        type="button"
        className="cdp-faq-item__q"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="cdp-faq-item__q-text">{q}</span>
        <CaretDown size={15} className="cdp-faq-item__caret" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="cdp-faq-item__a-wrapper"
          >
            <p className="cdp-faq-item__a">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview', Icon: Info },
  { id: 'events',   label: 'Events & Workshops', Icon: Calendar },
  { id: 'roster',   label: 'Core Leadership',   Icon: UsersThree },
  { id: 'drives',   label: 'Open Roles',        Icon: Flame },
  { id: 'faq',      label: 'FAQ & Charter',     Icon: Question },
];

export default function CommunityDetailPanel({
  community,
  isFollowed,
  onToggleFollow,
  onBack,
  onShowToast,
  isLoggedIn,
  onNavigateToLogin,
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const heroRef = useRef(null);

  const [drives, setDrives] = useState(null);
  const [drivesError, setDrivesError] = useState('');
  // driveId -> application status ('pending' | 'selected' | 'rejected').
  // Hydrated from the server on load (not just tracked in-memory after a
  // submit), so a reload keeps showing "Applied" instead of letting the
  // student hit the drive's unique-application constraint a second time.
  const [appliedDrives, setAppliedDrives] = useState(() => new Map());
  const [busyDriveId, setBusyDriveId] = useState(null);
  const [applyDialogDrive, setApplyDialogDrive] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setDrives(null);
    setDrivesError('');
    fetchCommunityDrives(community.id)
      .then(({ drives: list }) => {
        if (!cancelled) setDrives(list || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setDrives([]);
        setDrivesError(err instanceof ApiError ? err.message : 'Could not load open roles.');
      });
    return () => {
      cancelled = true;
    };
  }, [community.id]);

  useEffect(() => {
    if (!isLoggedIn) {
      setAppliedDrives(new Map());
      return;
    }
    let cancelled = false;
    fetchMyApplications()
      .then(({ applications }) => {
        if (cancelled) return;
        setAppliedDrives(
          new Map((applications || []).map((a) => [String(a.recruitment?._id ?? a.recruitment), a.status]))
        );
      })
      .catch(() => {
        /* Non-fatal — worst case the apply buttons don't reflect prior applications this load. */
      });
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, community.id]);

  /* Hero parallax effect */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const img = hero.querySelector('.cdp-hero__img');
    if (!img) return;
    const handleScroll = () => {
      const rect = hero.getBoundingClientRect();
      const offset = -rect.top * 0.18;
      img.style.transform = `translateY(${Math.max(-30, Math.min(30, offset))}px) scale(1.06)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryObj = COMMUNITY_CATEGORIES.find((c) => c.id === community.category);
  const liveMembers = community.members ?? 0;
  const accentColor = community.accentColor || '#991B1B';

  const handleShare = async () => {
    const url = `${window.location.origin}/communities/detail/${community.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* clipboard fallback */
    }
    setCopied(true);
    onShowToast('Community link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFollowClick = () => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    onToggleFollow(community.id);
  };

  const handleApplyToDrive = async (drive) => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;
    if (isDeadlinePassed || !drive.isOpen) {
      onShowToast('This recruitment drive is closed and no longer accepting applications.');
      return;
    }
    if (busyDriveId || appliedDrives.has(drive._id)) return;
    setBusyDriveId(drive._id);
    try {
      const { application } = await submitDriveApplication(drive._id, []);
      setAppliedDrives((prev) => new Map(prev).set(drive._id, application?.status || 'pending'));
      onShowToast('Application submitted successfully!');
    } catch (err) {
      onShowToast(err instanceof ApiError ? err.message : 'Could not submit application.');
    } finally {
      setBusyDriveId(null);
    }
  };

  const handleOpenFullApplication = (drive) => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;
    if (isDeadlinePassed || !drive.isOpen) {
      onShowToast('This recruitment drive is closed and no longer accepting applications.');
      return;
    }
    if (appliedDrives.has(drive._id)) return;
    setApplyDialogDrive(drive);
  };

  const handleFullApplicationSuccess = (application, message) => {
    setAppliedDrives((prev) => new Map(prev).set(applyDialogDrive._id, application?.status || 'pending'));
    setApplyDialogDrive(null);
    onShowToast(message || 'Application submitted successfully!');
  };

  const handleMessageLeader = (leader) => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    if (leader.id) {
      navigate(`/profile/${leader.id}`);
      onShowToast(`Opening ${leader.name}'s profile.`);
    } else {
      onShowToast(`Opening message prompt with ${leader.name}`);
    }
  };

  /* FAQs list combining custom community FAQs if available with default campus guidelines */
  const faqs = useMemo(() => {
    if (community.faqs && community.faqs.length > 0) {
      return community.faqs.map((f) => ({ q: f.question, a: f.answer }));
    }
    return [
      {
        q: 'How do I join and become an active member of this community?',
        a: 'Click the "Join & Follow" button at the top of this page to subscribe to updates. When recruitment opens, you can apply for specific core and executive roles in the Open Roles tab.',
      },
      {
        q: 'When and where do official chapter meetings happen?',
        a: `${community.location ? `Meetings are generally held at ${community.location}. ` : ''}Schedules, workshops, and hackathons are posted on the Events tab and broadcast to all members.`,
      },
      {
        q: 'Do I need prior experience or technical skills to join?',
        a: 'No prior background is required for general membership. Open recruitment roles list any prerequisite skills or technical domains in the role description.',
      },
      {
        q: 'Are community events open to all students across branches?',
        a: 'Yes! Unless explicitly specified as a members-only briefing, all campus workshops, hackathons, and seminars are open to all registered SIES GST students.',
      },
      {
        q: 'How are core team leaders selected each academic year?',
        a: 'Core teams are appointed annually via structured recruitment drives and faculty advisor review following the Student Council governance charter.',
      },
    ];
  }, [community.faqs, community.location]);

  const activeDrives = useMemo(() => {
    if (!drives) return null;
    const now = new Date();
    return drives.filter((d) => d.isOpen && d.isActive !== false && (!d.deadline || new Date(d.deadline) >= now));
  }, [drives]);

  const isRecruitingActive = activeDrives !== null ? activeDrives.length > 0 : Boolean(community.recruiting);
  const activeDrivesCount = activeDrives?.length ?? 0;
  const upcomingEventsCount = community.upcomingEvents?.length ?? 0;
  const coreLeadsCount = community.leads?.length ?? 0;

  return (
    <div className="comm-detail-page cdp-root">
      {/* ── Cinematic Hero ── */}
      <div className="cdp-hero" ref={heroRef}>
        {community.coverImage ? (
          <img src={community.coverImage} alt="" className="cdp-hero__img" aria-hidden="true" />
        ) : (
          <div
            className="cdp-hero__img cdp-hero__img--gradient"
            style={{
              background:
                community.coverGradient ||
                `radial-gradient(ellipse at 80% 20%, ${accentColor}44 0%, #0F172A 70%)`,
            }}
          />
        )}
        <div className="cdp-hero__overlay" />

        {/* Top Navigation Bar */}
        <div className="cdp-hero__topbar page-container">
          <button
            type="button"
            className="cdp-hero__back-btn"
            onClick={onBack}
            aria-label="Back to communities directory"
          >
            <ArrowLeft size={14} weight="bold" />
            <span>All Clubs</span>
          </button>

          <nav className="cdp-hero__breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={onBack}>
              Communities
            </button>
            <CaretRight size={10} className="cdp-hero__breadcrumb-sep" />
            <span className="cdp-hero__breadcrumb-cat">{categoryObj?.label || community.category}</span>
            <CaretRight size={10} className="cdp-hero__breadcrumb-sep" />
            <span className="cdp-hero__breadcrumb-current">{community.name}</span>
          </nav>

          <div className="cdp-hero__topbar-actions">
            {isRecruitingActive ? (
              <button
                type="button"
                className="cdp-hero__badge cdp-hero__badge--recruiting"
                onClick={() => setActiveTab('drives')}
                title="View Open Roles"
              >
                <Flame size={12} weight="fill" />
                <span>Recruiting Now</span>
              </button>
            ) : (
              <span className="cdp-hero__badge cdp-hero__badge--active">
                <CheckCircle size={12} weight="fill" />
                <span>Official Chapter</span>
              </span>
            )}
          </div>
        </div>

        {/* Hero Identity Block */}
        <div className="cdp-hero__identity page-container">
          <div
            className="cdp-hero__icon"
            style={{ '--accent': accentColor, borderColor: accentColor }}
          >
            {typeof community.icon === 'string' && (community.icon.startsWith('http') || community.icon.startsWith('/')) ? (
              <img src={community.icon} alt={community.name} className="w-full h-full object-cover" />
            ) : (
              <span className="cdp-hero__icon-emoji">{community.icon || '🏛️'}</span>
            )}
          </div>

          <div className="cdp-hero__title-block">
            <div className="cdp-hero__name-row">
              <h1 className="cdp-hero__name">{community.name}</h1>
              {community.isVerified && (
                <div className="cdp-hero__verified-badge" title="SIES GST Verified Student Council Chapter">
                  <ShieldCheck size={20} weight="fill" />
                  <span className="cdp-hero__verified-text">Verified</span>
                </div>
              )}
            </div>

            {community.tagline && <p className="cdp-hero__tagline">{community.tagline}</p>}

            <div className="cdp-hero__meta-chips">
              <span className="cdp-chip cdp-chip--category">
                <Sparkle size={11} weight="fill" />
                {categoryObj?.label || community.category}
              </span>
              <span className="cdp-chip cdp-chip--meta">
                <Star size={11} weight="fill" />
                Est. {community.establishedYear || 2021}
              </span>
              {(community.location || community.department) && (
                <span className="cdp-chip cdp-chip--meta">
                  <MapPin size={11} weight="fill" />
                  {community.location || community.department}
                </span>
              )}
              {community.leadOrganizer && (
                <span className="cdp-chip cdp-chip--meta">
                  <User size={11} weight="fill" />
                  Lead: {community.leadOrganizer}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Main Content ── */}
      <div className="page-container cdp-body">
        {/* Stats & Actions Banner */}
        <div className="cdp-stats-bar">
          <div className="cdp-stats-bar__metrics">
            <StatTile value={liveMembers} label="Followers & Members" icon={UsersThree} />
            <div className="cdp-stat-divider" />
            <StatTile
              value={upcomingEventsCount}
              label="Active Events"
              icon={Calendar}
              isClickable={upcomingEventsCount > 0}
              onClick={() => setActiveTab('events')}
            />
            <div className="cdp-stat-divider" />
            <StatTile
              value={activeDrivesCount}
              label="Open Roles"
              icon={Flame}
              accent={activeDrivesCount > 0}
              isClickable={activeDrivesCount > 0}
              onClick={() => setActiveTab('drives')}
            />
            <div className="cdp-stat-divider cdp-stat-divider--hide-sm" />
            <div className="cdp-stat-tile cdp-stat-tile--hide-sm">
              <div className="cdp-stat-tile__top">
                <Buildings size={14} className="cdp-stat-tile__icon text-[#1A3A2A]" />
                <span className="cdp-stat-tile__num text-sm font-bold text-[#0F172A]">SIES GST</span>
              </div>
              <span className="cdp-stat-tile__lbl">Campus Council</span>
            </div>
          </div>

          <div className="cdp-stats-bar__cta">
            <button
              type="button"
              className={`cdp-follow-btn${isFollowed ? ' cdp-follow-btn--following' : ''}`}
              onClick={handleFollowClick}
            >
              {isFollowed ? (
                <>
                  <Check size={16} weight="bold" />
                  <span>Following Chapter</span>
                </>
              ) : (
                <>
                  <UsersThree size={16} weight="fill" />
                  <span>Join &amp; Follow</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="cdp-share-btn"
              onClick={handleShare}
              title="Share community link"
              aria-label="Share community link"
            >
              <ShareNetwork size={18} />
              {copied && <span className="cdp-share-btn__copied">Link Copied!</span>}
            </button>
          </div>
        </div>

        {/* ── Tabbed Navigation ── */}
        <div className="cdp-tabs-wrap">
          <div className="cdp-tabs" role="tablist" aria-label="Community navigation">
            {TABS.map(({ id, label, Icon }) => {
              let count = null;
              if (id === 'events' && upcomingEventsCount > 0) count = upcomingEventsCount;
              if (id === 'drives' && activeDrivesCount > 0) count = activeDrivesCount;
              if (id === 'roster' && coreLeadsCount > 0) count = coreLeadsCount;

              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  role="tab"
                  id={`tab-${id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${id}`}
                  className={`cdp-tab-btn${isActive ? ' cdp-tab-btn--active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
                  <span>{label}</span>
                  {count !== null && <span className="cdp-tab-badge">{count}</span>}
                  {isActive && (
                    <motion.div
                      layoutId="cdp-active-tab-indicator"
                      className="cdp-tab-active-line"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Content Grid (Main Panels + Sidebar) ── */}
        <div className="cdp-content-layout">
          {/* ── Main Tab Panel Area ── */}
          <main className="cdp-tab-panel">
            <AnimatePresence mode="wait">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  id="panel-overview"
                  role="tabpanel"
                  aria-labelledby="tab-overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="cdp-tab-content"
                >
                  {/* Charter / Mission Card */}
                  <section className="cdp-card">
                    <div className="cdp-section-header">
                      <div className="cdp-section-header__icon-box cdp-section-header__icon-box--crimson">
                        <Info size={18} weight="duotone" />
                      </div>
                      <div>
                        <h2 className="cdp-section-title">Charter &amp; Mission</h2>
                        <span className="cdp-section-subtitle">Official Statement of Purpose</span>
                      </div>
                    </div>
                    <div className="cdp-about-rule" />
                    <p className="cdp-about-text">
                      {community.about ||
                        community.tagline ||
                        'No detailed charter provided for this student organization yet.'}
                    </p>
                  </section>

                  {/* Focus Areas & Tags */}
                  {community.tags && community.tags.length > 0 && (
                    <section className="cdp-card">
                      <div className="cdp-section-header">
                        <div className="cdp-section-header__icon-box cdp-section-header__icon-box--forest">
                          <Tag size={18} weight="duotone" />
                        </div>
                        <div>
                          <h2 className="cdp-section-title">Focus Areas &amp; Specializations</h2>
                          <span className="cdp-section-subtitle">Core technical and creative domains</span>
                        </div>
                      </div>
                      <div className="cdp-tags-cloud">
                        {community.tags.map((tag, idx) => (
                          <span key={idx} className="cdp-domain-pill">
                            <Sparkle size={12} weight="fill" className="text-[#B45309]" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Chapter Pillars Grid */}
                  <section className="cdp-pillars-grid">
                    <div className="cdp-pillar-card">
                      <div className="cdp-pillar-card__icon-wrap text-[#991B1B] bg-[#FEF2F2]">
                        <Lightning size={20} weight="duotone" />
                      </div>
                      <h3 className="cdp-pillar-card__title">Hands-on Workshops</h3>
                      <p className="cdp-pillar-card__desc">
                        Regular skill-building bootcamps, technical study jams, and project build-offs.
                      </p>
                    </div>
                    <div className="cdp-pillar-card">
                      <div className="cdp-pillar-card__icon-wrap text-[#1A3A2A] bg-[#ECFDF5]">
                        <UsersThree size={20} weight="duotone" />
                      </div>
                      <h3 className="cdp-pillar-card__title">Peer Mentorship</h3>
                      <p className="cdp-pillar-card__desc">
                        Connect with senior leads, alumni networks, and collaborative student project teams.
                      </p>
                    </div>
                    <div className="cdp-pillar-card">
                      <div className="cdp-pillar-card__icon-wrap text-[#B45309] bg-[#FFFBEB]">
                        <Star size={20} weight="duotone" />
                      </div>
                      <h3 className="cdp-pillar-card__title">Competitions &amp; Hackathons</h3>
                      <p className="cdp-pillar-card__desc">
                        Represent SIES GST in inter-college hackathons, cultural fests, and solution challenges.
                      </p>
                    </div>
                  </section>
                </motion.div>
              )}

              {/* EVENTS TAB */}
              {activeTab === 'events' && (
                <motion.div
                  key="events"
                  id="panel-events"
                  role="tabpanel"
                  aria-labelledby="tab-events"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="cdp-tab-content"
                >
                  <section className="cdp-card">
                    <div className="cdp-section-header">
                      <div className="cdp-section-header__icon-box cdp-section-header__icon-box--gold">
                        <Calendar size={18} weight="duotone" />
                      </div>
                      <div>
                        <h2 className="cdp-section-title">Hosted Events &amp; Workshops</h2>
                        <span className="cdp-section-subtitle">Upcoming campus sessions and challenges</span>
                      </div>
                    </div>

                    {community.upcomingEvents && community.upcomingEvents.length > 0 ? (
                      <div className="cdp-events-list">
                        {community.upcomingEvents.map((ev, i) => (
                          <div key={ev.eventId || i} className="cdp-event-card">
                            <div className="cdp-event-card__date-box">
                              <CalendarBlank size={20} weight="duotone" className="text-[#B45309]" />
                              <span className="cdp-event-card__date-label">Upcoming</span>
                            </div>
                            <div className="cdp-event-card__main">
                              <div className="cdp-event-card__tag-row">
                                <span className="cdp-event-type-chip">{ev.type || 'Event'}</span>
                                <span className="cdp-event-time">
                                  <Clock size={12} />
                                  {ev.date}
                                </span>
                              </div>
                              <h3 className="cdp-event-card__title">{ev.title}</h3>
                            </div>
                            <div className="cdp-event-card__action">
                              <Link
                                to={`/events/detail/${ev.eventId}`}
                                className="cdp-event-register-btn"
                              >
                                <span>View Details</span>
                                <ArrowSquareOut size={13} weight="bold" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cdp-empty-state">
                        <div className="cdp-empty-state__icon-wrap">
                          <Calendar size={36} weight="duotone" />
                        </div>
                        <h3 className="cdp-empty-state__title">No Scheduled Events Right Now</h3>
                        <p className="cdp-empty-state__sub">
                          Follow this community to receive instant notifications when new workshops, hackathons,
                          or seminars are announced.
                        </p>
                        <Link to="/events" className="cdp-empty-state__btn">
                          <Compass size={14} weight="bold" />
                          <span>Explore All Campus Events</span>
                        </Link>
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {/* ROSTER TAB */}
              {activeTab === 'roster' && (
                <motion.div
                  key="roster"
                  id="panel-roster"
                  role="tabpanel"
                  aria-labelledby="tab-roster"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="cdp-tab-content"
                >
                  <section className="cdp-card">
                    <div className="cdp-section-header">
                      <div className="cdp-section-header__icon-box cdp-section-header__icon-box--forest">
                        <UsersThree size={18} weight="duotone" />
                      </div>
                      <div>
                        <h2 className="cdp-section-title">Executive Leadership &amp; Core Team</h2>
                        <span className="cdp-section-subtitle">
                          Current academic term organizers &amp; domain leads
                        </span>
                      </div>
                    </div>

                    {community.leads && community.leads.length > 0 ? (
                      <div className="cdp-leaders-grid">
                        {community.leads.map((leader) => (
                          <div key={leader.id || leader.name} className="cdp-leader-card">
                            <div className="cdp-leader-card__avatar-wrap">
                              {leader.avatarUrl ? (
                                <img
                                  src={leader.avatarUrl}
                                  alt={leader.name}
                                  className="cdp-leader-card__avatar"
                                />
                              ) : (
                                <div className="cdp-leader-card__avatar-placeholder">
                                  <User size={22} weight="duotone" />
                                </div>
                              )}
                              <div className="cdp-leader-card__avatar-ring" />
                            </div>

                            <div className="cdp-leader-card__info">
                              <h4 className="cdp-leader-card__name">{leader.name}</h4>
                              <span className="cdp-leader-card__role">{leader.role}</span>
                              {leader.branch && (
                                <span className="cdp-leader-card__branch">{leader.branch}</span>
                              )}
                            </div>

                            <div className="cdp-leader-card__actions">
                              {leader.id ? (
                                <Link
                                  to={`/profile/${leader.id}`}
                                  className="cdp-dm-btn"
                                  title={`View ${leader.name}'s profile`}
                                >
                                  <User size={13} weight="bold" />
                                  <span>Profile</span>
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  className="cdp-dm-btn"
                                  onClick={() => handleMessageLeader(leader)}
                                  title={`Message ${leader.name}`}
                                >
                                  <ChatCircleText size={13} weight="fill" />
                                  <span>Message</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cdp-empty-state">
                        <div className="cdp-empty-state__icon-wrap">
                          <UsersThree size={36} weight="duotone" />
                        </div>
                        <h3 className="cdp-empty-state__title">Executive Roster Unlisted</h3>
                        <p className="cdp-empty-state__sub">
                          Leadership profiles are currently being updated for the current academic session.
                        </p>
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {/* DRIVES / OPENINGS TAB */}
              {activeTab === 'drives' && (
                <motion.div
                  key="drives"
                  id="panel-drives"
                  role="tabpanel"
                  aria-labelledby="tab-drives"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="cdp-tab-content"
                >
                  <section className="cdp-card cdp-drives-section">
                    <div className="cdp-section-header">
                      <div className="cdp-section-header__icon-box cdp-section-header__icon-box--crimson">
                        <Flame size={18} weight="fill" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h2 className="cdp-section-title">Open Recruitment Drives</h2>
                          {drives !== null && !drivesError && drives.length > 0 && (
                            <span className="cdp-drives-count">{drives.length} Open Positions</span>
                          )}
                        </div>
                        <span className="cdp-section-subtitle">
                          Apply to join the chapter executive council
                        </span>
                      </div>
                    </div>

                    {drives === null ? (
                      <div className="cdp-loading-row">
                        <CircleNotch size={18} className="cdp-spinner text-[#991B1B]" />
                        <span>Loading active recruitment drives…</span>
                      </div>
                    ) : drivesError ? (
                      <div className="cdp-error-box">
                        <p className="cdp-error-text">{drivesError}</p>
                      </div>
                    ) : drives.length === 0 ? (
                      <div className="cdp-empty-state">
                        <div className="cdp-empty-state__icon-wrap text-[#991B1B]">
                          <Flame size={36} weight="duotone" />
                        </div>
                        <h3 className="cdp-empty-state__title">No Active Recruitment Drives</h3>
                        <p className="cdp-empty-state__sub">
                          This community is not currently onboarding new core team members. Follow the chapter
                          to be alerted when fresh roles open.
                        </p>
                      </div>
                    ) : (
                      <div className="cdp-drives-list">
                        {drives.map((drive, idx) => {
                          const applicationStatus = appliedDrives.get(drive._id);
                          const applied = Boolean(applicationStatus);
                          const isDeadlinePassed = drive.deadline ? new Date() > new Date(drive.deadline) : false;
                          const isDriveClosed = !drive.isOpen || isDeadlinePassed;
                          const simple = isSimpleDrive(drive);
                          const deadline = formatDeadline(drive.deadline);
                          const statusLabel =
                            applicationStatus === 'selected'
                              ? 'Selected!'
                              : applicationStatus === 'rejected'
                              ? 'Not Selected'
                              : applicationStatus === 'pending'
                              ? 'Applied'
                              : isDeadlinePassed
                              ? 'Deadline Passed'
                              : null;
                          const buttonLabel =
                            applicationStatus === 'selected'
                              ? 'Selected'
                              : applicationStatus === 'rejected'
                              ? 'Not Selected'
                              : applicationStatus === 'pending'
                              ? 'Application Sent'
                              : isDriveClosed
                              ? 'Closed'
                              : simple
                              ? 'Quick Apply'
                              : 'Apply Now';
                          return (
                            <div
                              key={drive._id}
                              className={`cdp-drive-card${applied ? ' cdp-drive-card--applied' : ''}`}
                            >
                              <div className="cdp-drive-card__index">
                                {String(idx + 1).padStart(2, '0')}
                              </div>
                              <div className="cdp-drive-card__content">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="cdp-drive-card__title">{drive.title}</h3>
                                  {statusLabel && (
                                    <span
                                      className={`cdp-status-pill ${
                                        applicationStatus === 'rejected' || isDeadlinePassed
                                          ? 'cdp-status-pill--muted'
                                          : 'cdp-status-pill--success'
                                      }`}
                                    >
                                      {isDeadlinePassed && !applied ? (
                                        <Clock size={11} weight="bold" />
                                      ) : (
                                        <Check size={11} weight="bold" />
                                      )}
                                      {statusLabel}
                                    </span>
                                  )}
                                </div>
                                <p className="cdp-drive-card__desc">{drive.description}</p>
                                {deadline && (
                                  <span className={`cdp-drive-card__deadline ${isDeadlinePassed ? '!text-red-700 font-semibold' : ''}`}>
                                    <Clock size={12} weight="bold" /> {isDeadlinePassed ? `Closed on ${deadline}` : `Apply by ${deadline}`}
                                  </span>
                                )}
                              </div>
                              <div className="cdp-drive-card__action">
                                {simple ? (
                                  <button
                                    type="button"
                                    disabled={busyDriveId === drive._id || applied || isDriveClosed}
                                    onClick={() => handleApplyToDrive(drive)}
                                    className={`cdp-apply-btn${applied ? ' cdp-apply-btn--applied' : ''}`}
                                  >
                                    {busyDriveId === drive._id ? (
                                      <CircleNotch size={14} className="cdp-spinner" />
                                    ) : applied ? (
                                      <Check size={14} weight="bold" />
                                    ) : isDriveClosed ? (
                                      <Clock size={14} weight="bold" />
                                    ) : (
                                      <PaperPlaneTilt size={14} weight="fill" />
                                    )}
                                    <span>{buttonLabel}</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={applied || isDriveClosed}
                                    onClick={() => handleOpenFullApplication(drive)}
                                    className={`cdp-apply-btn${applied ? ' cdp-apply-btn--applied' : ''}`}
                                  >
                                    {applied ? (
                                      <Check size={14} weight="bold" />
                                    ) : isDriveClosed ? (
                                      <Clock size={14} weight="bold" />
                                    ) : (
                                      <PaperPlaneTilt size={14} weight="fill" />
                                    )}
                                    <span>{buttonLabel}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </motion.div>
              )}

              {/* FAQ TAB */}
              {activeTab === 'faq' && (
                <motion.div
                  key="faq"
                  id="panel-faq"
                  role="tabpanel"
                  aria-labelledby="tab-faq"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="cdp-tab-content"
                >
                  <section className="cdp-card">
                    <div className="cdp-section-header">
                      <div className="cdp-section-header__icon-box cdp-section-header__icon-box--crimson">
                        <Question size={18} weight="duotone" />
                      </div>
                      <div>
                        <h2 className="cdp-section-title">Frequently Asked Questions</h2>
                        <span className="cdp-section-subtitle">
                          Membership, attendance, and campus participation guidelines
                        </span>
                      </div>
                    </div>

                    <div className="cdp-faq-list">
                      {faqs.map((item, i) => (
                        <FaqItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* ── Right-Side Institutional Sidebar ── */}
          <aside className="cdp-sidebar">
            {/* SIES GST Student Council Accreditation */}
            <div className="cdp-campus-notice">
              <div className="cdp-campus-notice__badge-row">
                <div className="cdp-campus-notice__eyebrow">
                  <ShieldCheck size={14} weight="fill" />
                  <span>SIES GST Accredited</span>
                </div>
                <span className="cdp-campus-notice__year">Est. {community.establishedYear || 2021}</span>
              </div>
              <h4 className="cdp-campus-notice__heading">Official Campus Organization</h4>
              <p className="cdp-campus-notice__body">
                This chapter operates under official sanction of the SIES GST Student Council. All events,
                workshops, and drives adhere to campus safety and non-discrimination charters.
              </p>
              <div className="cdp-campus-notice__seal" aria-hidden="true">
                <div className="cdp-campus-notice__seal-ring" />
                <Buildings size={28} weight="duotone" className="cdp-campus-notice__seal-icon" />
              </div>
            </div>

            {/* Quick Directory Details */}
            <div className="cdp-sidebar-widget">
              <h3 className="cdp-sidebar-widget__heading">
                <Buildings size={14} weight="duotone" />
                <span>Chapter Registry</span>
              </h3>
              <div className="cdp-sidebar-meta-list">
                <div className="cdp-sidebar-meta-row">
                  <span className="cdp-sidebar-meta-row__label">
                    <Sparkle size={14} />
                    <span>Category</span>
                  </span>
                  <strong className="cdp-sidebar-meta-row__value cdp-sidebar-meta-row__value--accent">
                    {categoryObj?.label || community.category}
                  </strong>
                </div>

                <div className="cdp-sidebar-meta-row">
                  <span className="cdp-sidebar-meta-row__label">
                    <UsersThree size={14} />
                    <span>Followers</span>
                  </span>
                  <strong className="cdp-sidebar-meta-row__value">{liveMembers}</strong>
                </div>

                <div className="cdp-sidebar-meta-row">
                  <span className="cdp-sidebar-meta-row__label">
                    <Calendar size={14} />
                    <span>Upcoming Events</span>
                  </span>
                  <strong className="cdp-sidebar-meta-row__value">{upcomingEventsCount}</strong>
                </div>

                {community.location && (
                  <div className="cdp-sidebar-meta-row">
                    <span className="cdp-sidebar-meta-row__label">
                      <MapPin size={14} />
                      <span>Campus Venue</span>
                    </span>
                    <strong className="cdp-sidebar-meta-row__value">{community.location}</strong>
                  </div>
                )}

                {community.leadOrganizer && (
                  <div className="cdp-sidebar-meta-row">
                    <span className="cdp-sidebar-meta-row__label">
                      <User size={14} />
                      <span>Lead Organizer</span>
                    </span>
                    <strong className="cdp-sidebar-meta-row__value">{community.leadOrganizer}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Official Social Links */}
            {community.socials && Object.values(community.socials).some(Boolean) && (
              <div className="cdp-sidebar-widget">
                <h3 className="cdp-sidebar-widget__heading">
                  <Globe size={14} weight="duotone" />
                  <span>Official Channels</span>
                </h3>
                <div className="cdp-socials-list">
                  {community.socials?.github && (
                    <a
                      href={community.socials.github}
                      target="_blank"
                      rel="noreferrer"
                      className="cdp-social-link cdp-social-link--github"
                    >
                      <GithubLogo size={16} weight="fill" />
                      <span>GitHub Organization</span>
                      <ArrowSquareOut size={12} className="cdp-social-link__arrow" />
                    </a>
                  )}
                  {community.socials?.instagram && (
                    <a
                      href={community.socials.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="cdp-social-link cdp-social-link--instagram"
                    >
                      <InstagramLogo size={16} weight="fill" />
                      <span>Instagram Feed</span>
                      <ArrowSquareOut size={12} className="cdp-social-link__arrow" />
                    </a>
                  )}
                  {community.socials?.linkedin && (
                    <a
                      href={community.socials.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="cdp-social-link cdp-social-link--linkedin"
                    >
                      <LinkedinLogo size={16} weight="fill" />
                      <span>LinkedIn Page</span>
                      <ArrowSquareOut size={12} className="cdp-social-link__arrow" />
                    </a>
                  )}
                  {community.socials?.discord && (
                    <a
                      href={community.socials.discord}
                      target="_blank"
                      rel="noreferrer"
                      className="cdp-social-link cdp-social-link--discord"
                    >
                      <DiscordLogo size={16} weight="fill" />
                      <span>Discord Server</span>
                      <ArrowSquareOut size={12} className="cdp-social-link__arrow" />
                    </a>
                  )}
                  {community.socials?.twitter && (
                    <a
                      href={community.socials.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="cdp-social-link cdp-social-link--twitter"
                    >
                      <TwitterLogo size={16} weight="fill" />
                      <span>X / Twitter</span>
                      <ArrowSquareOut size={12} className="cdp-social-link__arrow" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {applyDialogDrive && (
          <DriveApplicationDialog
            drive={applyDialogDrive}
            communityName={community.name}
            onSuccess={handleFullApplicationSuccess}
            onClose={() => setApplyDialogDrive(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
