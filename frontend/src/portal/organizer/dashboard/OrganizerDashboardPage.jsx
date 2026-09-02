/**
 * OrganizerDashboardPage.jsx — Organiser Portal Command Center, wired to
 * GET /api/community/dashboard (see backend dashboard.controller.js).
 * Features:
 * - Community Welcome Hero Header with live status & timeframe filter that
 *   actually scopes the follower/RSVP growth deltas server-side.
 * - Interactive Stat Metric Cards with real percentage deltas & gauges.
 * - Featured Upcoming Event Spotlight Card with live capacity gauge & QR scan trigger.
 * - Partial activity stream (recent registrations + recruitment applications —
 *   there's no backend activity-log for comments/follows/check-ins, so those
 *   entry types were dropped rather than fabricated).
 * - Open Committee Recruitment Overview Widget.
 * - Command Shortcuts Grid with Phosphor icons.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  UsersThree,
  Ticket,
  Briefcase,
  CalendarCheck,
  Megaphone,
  Plus,
  UserPlus,
  QrCode,
  CalendarBlank,
  MapPin,
  CaretRight,
  ArrowUpRight,
  Sparkle,
  TrendUp,
  Clock,
  ChartBar,
  CircleNotch,
  Warning,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { getDashboardOverview } from './dashboard.api';
import { formatCount } from '@/shared/utils/formatters';
import { relativeTime } from '@/features/discover/discoverUtils';
import StatCard from '@/layouts/portal/components/StatCard';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-dashboard.css';

const ACTIVITY_ICON = {
  registration: Ticket,
  application: Briefcase,
};

const EMPTY_OVERVIEW = {
  stats: {
    followers: 0,
    followersDeltaPct: 0,
    activeRegistrations: 0,
    registrationsDeltaPct: 0,
    pendingApplications: 0,
    eventsHosted: 0,
  },
  nextEvent: null,
  activeDrive: null,
  activityFeed: [],
};

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  const { community } = useOrganizerAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Timeframe selector state ('week' | 'month' | 'all') synced with URL —
  // scopes the follower/RSVP growth deltas returned by the backend.
  const timeframe = searchParams.get('timeframe') || 'week';
  const setTimeframe = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'week') next.delete('timeframe');
    else next.set('timeframe', val);
    setSearchParams(next, { replace: true });
  };

  // Activity filter state ('all' | 'registration' | 'application') synced with URL
  const activityFilter = searchParams.get('type') || 'all';
  const setActivityFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('type');
    else next.set('type', val);
    setSearchParams(next, { replace: true });
  };

  const communityName = community?.name || 'Your Community';

  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!community?._id) return;
    setLoading(true);
    setLoadError(null);
    getDashboardOverview(timeframe)
      .then((res) => setOverview(res))
      .catch((err) => setLoadError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [community?._id, timeframe]);

  const { stats, activeDrive, activityFeed } = overview;

  // Map the raw Event doc into the same display shape every other organizer
  // page derives (see OrganizerEventsPage.jsx's mapEvent).
  const nextEvent = useMemo(() => {
    const e = overview.nextEvent;
    if (!e) return null;
    const eventDate = new Date(e.eventDate);
    return {
      ...e,
      dateFormatted: eventDate.toLocaleString('en-IN', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
      }),
    };
  }, [overview.nextEvent]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === 'all') return activityFeed;
    return activityFeed.filter((a) => a.type === activityFilter);
  }, [activityFeed, activityFilter]);

  const timeframePeriodLabel =
    timeframe === 'month' ? 'this month' : timeframe === 'all' ? 'this semester' : 'this week';

  return (
    <div className="org-page org-dashboard-page">
      {/* ── Welcome Command Hero Header ── */}
      <section className="org-welcome-hero">
        <div className="org-welcome-hero-main">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="org-welcome-chip">
              <span className="org-welcome-pulse" />
              Verified Community Session
            </span>
            <span className="org-welcome-date">
              <Clock size={12} className="inline mr-1 opacity-70" />
              Academic Term 2026
            </span>
          </div>

          <h1 className="org-welcome-title">
            Welcome back, <span className="text-[#991B1B]">{communityName}</span>
          </h1>
          <p className="org-welcome-desc">
            Here is your live campus overview — engagement metrics, event RSVPs, member applications, and priority action items for today.
          </p>
        </div>

        {/* Hero Quick Action Buttons */}
        <div className="org-welcome-actions">
          <motion.button
            type="button"
            whileHover={{ y: -1.5, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="org-btn org-btn-ghost shadow-sm"
            onClick={() => navigate('/organizer/posts')}
          >
            <Megaphone size={15} />
            <span>New Announcement</span>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ y: -1.5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="org-btn org-btn-primary shadow-md shadow-[#991B1B]/20"
            onClick={() => navigate('/organizer/events/create')}
          >
            <Plus size={15} weight="bold" />
            <span>Create Event</span>
          </motion.button>
        </div>
      </section>

      {loadError && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {loadError}
        </p>
      )}

      {/* ── Timeframe Bar & Key Metrics ── */}
      <section className="mb-6">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <h2 className="org-section-title">
            <TrendUp size={14} className="text-[#991B1B]" />
            Key Performance Metrics
          </h2>

          <div className="org-timeframe-selector">
            <button
              type="button"
              className={`org-timeframe-btn ${timeframe === 'week' ? 'active' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              This Week
            </button>
            <button
              type="button"
              className={`org-timeframe-btn ${timeframe === 'month' ? 'active' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`org-timeframe-btn ${timeframe === 'all' ? 'active' : ''}`}
              onClick={() => setTimeframe('all')}
            >
              Semester
            </button>
          </div>
        </div>

        {loading ? (
          <EmptyState icon={CircleNotch} title="Loading your dashboard…" desc="Pulling real-time community stats." />
        ) : (
          <div className="org-stat-grid">
            <StatCard
              label="Total Followers"
              value={formatCount(stats.followers)}
              delta={stats.followersDeltaPct}
              deltaPeriod={timeframePeriodLabel}
              icon={UsersThree}
              accent="#991B1B"
              subtitle="Campus student subscribers"
            />
            <StatCard
              label="Active RSVPs"
              value={formatCount(stats.activeRegistrations)}
              delta={stats.registrationsDeltaPct}
              deltaPeriod={timeframePeriodLabel}
              progress={nextEvent && nextEvent.capacity ? Math.round((nextEvent.registeredCount / nextEvent.capacity) * 100) : 0}
              icon={Ticket}
              accent="#0D9488"
              subtitle={`${formatCount(nextEvent?.registeredCount || 0)} registered for next event`}
              onClick={() => navigate('/organizer/events')}
            />
            <StatCard
              label="Pending Applications"
              value={formatCount(stats.pendingApplications)}
              icon={Briefcase}
              accent="#B45309"
              subtitle="Committee recruitment drives"
              onClick={() => navigate('/organizer/recruitment')}
            />
            <StatCard
              label="Events Hosted"
              value={formatCount(stats.eventsHosted)}
              icon={CalendarCheck}
              accent="#2563EB"
              subtitle="Published events that have taken place"
              onClick={() => navigate('/organizer/analytics')}
            />
          </div>
        )}
      </section>

      {/* ── Dashboard Content Grid ── */}
      <div className="org-dashboard-grid">
        {/* Left Column: Event Spotlight & Recent Activity */}
        <div className="flex flex-col gap-5">
          {/* Featured Event Spotlight Card */}
          {loading ? null : nextEvent ? (
            <div className="org-card org-spotlight-card">
              <div className="org-spotlight-header">
                <div className="flex items-center gap-2">
                  <span className="org-spotlight-badge">
                    <Sparkle size={13} weight="fill" />
                    Next Featured Event
                  </span>
                  <span className="org-spotlight-status">
                    {nextEvent.capacity && nextEvent.registeredCount >= nextEvent.capacity ? 'Sold Out' : 'Published & RSVP Open'}
                  </span>
                </div>
                <Link
                  to={`/organizer/events/${nextEvent.id}`}
                  className="org-spotlight-link"
                >
                  View Details <ArrowUpRight size={13} />
                </Link>
              </div>

              <div className="org-spotlight-body">
                <h3 className="org-spotlight-title">{nextEvent.title}</h3>

                <div className="org-spotlight-meta-grid">
                  <div className="org-spotlight-meta-item">
                    <CalendarBlank size={15} className="text-[#991B1B]" />
                    <span>{nextEvent.dateFormatted}</span>
                  </div>
                  <div className="org-spotlight-meta-item">
                    <MapPin size={15} className="text-[#0D9488]" />
                    <span>{nextEvent.venue}</span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                {(() => {
                  const capacityPct = nextEvent.capacity ? Math.round((nextEvent.registeredCount / nextEvent.capacity) * 100) : 0;
                  return (
                    <div className="org-spotlight-capacity">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-['JetBrains_Mono']">
                        <span className="text-gray-600 font-semibold">Registration Capacity</span>
                        <span className="text-[#991B1B] font-bold">
                          {formatCount(nextEvent.registeredCount)} / {formatCount(nextEvent.capacity)} Seats ({capacityPct}%)
                        </span>
                      </div>
                      <div className="org-capacity-track">
                        <div
                          className="org-capacity-fill"
                          style={{
                            width: `${Math.min(100, capacityPct)}%`,
                          }}
                        />
                      </div>
                      {nextEvent.waitlistCount > 0 && (
                        <span className="text-[11px] font-mono text-amber-700 mt-1 block">
                          + {formatCount(nextEvent.waitlistCount)} students currently on waitlist
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Card Footer Quick Controls */}
              <div className="org-spotlight-actions">
                <Link
                  to={`/organizer/events/${nextEvent.id}/scan`}
                  className="org-btn org-btn-ghost org-btn-sm"
                >
                  <QrCode size={15} className="text-[#991B1B]" />
                  <span>Launch QR Ticket Scanner</span>
                </Link>
                <Link
                  to={`/organizer/events/${nextEvent.id}`}
                  className="org-btn org-btn-secondary org-btn-sm ml-auto"
                >
                  <span>Manage RSVPs</span>
                  <CaretRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="org-card org-card-pad text-center py-6">
              <CalendarBlank size={24} className="text-gray-400 mx-auto mb-2" />
              <h3 className="org-card-title text-sm mb-1">No Upcoming Events</h3>
              <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mb-3">
                Create an event listing to feature RSVPs on your organizer dashboard.
              </p>
              <Link to="/organizer/events" className="org-btn org-btn-primary org-btn-sm inline-flex">
                <Plus size={13} weight="bold" /> Schedule Event
              </Link>
            </div>
          )}

          {/* Activity Stream Feed */}
          <div className="org-card">
            <div className="org-card-header">
              <div>
                <h2 className="org-card-title">Recent Activity</h2>
                <span className="org-card-subtitle">Latest registrations & applications</span>
              </div>

              {/* Activity filter tabs */}
              <div className="org-activity-filters">
                <button
                  type="button"
                  className={`org-activity-filter-btn ${activityFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActivityFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`org-activity-filter-btn ${activityFilter === 'registration' ? 'active' : ''}`}
                  onClick={() => setActivityFilter('registration')}
                >
                  RSVPs
                </button>
                <button
                  type="button"
                  className={`org-activity-filter-btn ${activityFilter === 'application' ? 'active' : ''}`}
                  onClick={() => setActivityFilter('application')}
                >
                  Applications
                </button>
              </div>
            </div>

            <div className="org-card-pad org-activity-feed">
              {loading ? (
                <p className="text-sm text-gray-500">Loading activity…</p>
              ) : filteredActivity.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity yet.</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredActivity.map((item) => {
                    const Icon = ACTIVITY_ICON[item.type] || UserPlus;
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="org-activity-row"
                      >
                        <span className="org-activity-icon">
                          <Icon size={15} weight="bold" />
                        </span>
                        <div className="org-activity-content">
                          <p className="org-activity-text">{item.text}</p>
                          <span className="org-activity-time">{relativeTime(new Date(item.time))}</span>
                        </div>

                        {item.type === 'application' && (
                          <Link
                            to="/organizer/recruitment"
                            className="org-btn org-btn-ghost org-btn-sm ml-auto text-xs"
                          >
                            Review
                          </Link>
                        )}
                        {item.type === 'registration' && (
                          <Link
                            to="/organizer/events"
                            className="org-btn org-btn-ghost org-btn-sm ml-auto text-xs"
                          >
                            View
                          </Link>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recruitment Summary & Quick Command Grid */}
        <div className="org-dashboard-side">
          {/* Active Recruitment Drive Card */}
          {!loading && activeDrive && (
            <div className="org-card org-recruitment-card">
              <div className="org-card-header">
                <div>
                  <h2 className="org-card-title">Recruitment Drive</h2>
                  <span className="org-card-subtitle">Active Committee Hiring</span>
                </div>
                <span className="org-drive-chip">Open</span>
              </div>

              <div className="org-card-pad">
                <h3 className="font-bold text-sm text-[#0F172A] mb-1 font-['Space_Grotesk']">
                  {activeDrive.title}
                </h3>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                  {activeDrive.description}
                </p>

                <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-md p-3 mb-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Submissions received</span>
                    <span className="font-bold text-[#991B1B]">{formatCount(activeDrive.applicationsCount)} Candidates</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="org-btn org-btn-primary w-full justify-center"
                  onClick={() => navigate(`/organizer/recruitment/${activeDrive.id}`)}
                >
                  <span>Review Applications ({activeDrive.applicationsCount})</span>
                  <CaretRight size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Action Shortcuts Grid */}
          <div className="org-card">
            <div className="org-card-header">
              <h2 className="org-card-title">Organizer Shortcuts</h2>
              <span className="org-card-subtitle">Quick Portal Commands</span>
            </div>

            <div className="org-shortcut-grid">
              <button
                type="button"
                className="org-shortcut-tile"
                onClick={() => navigate('/organizer/events')}
              >
                <div className="org-shortcut-icon bg-teal-50 text-teal-700">
                  <QrCode size={18} weight="bold" />
                </div>
                <div className="text-left">
                  <span className="org-shortcut-title">Scan QR Tickets</span>
                  <span className="org-shortcut-desc">Check-in event attendees</span>
                </div>
              </button>

              <button
                type="button"
                className="org-shortcut-tile"
                onClick={() => navigate('/organizer/roster')}
              >
                <div className="org-shortcut-icon bg-rose-50 text-rose-700">
                  <UsersThree size={18} weight="bold" />
                </div>
                <div className="text-left">
                  <span className="org-shortcut-title">Manage Roster</span>
                  <span className="org-shortcut-desc">Assign team roles</span>
                </div>
              </button>

              <button
                type="button"
                className="org-shortcut-tile"
                onClick={() => navigate('/organizer/analytics')}
              >
                <div className="org-shortcut-icon bg-blue-50 text-blue-700">
                  <ChartBar size={18} weight="bold" />
                </div>
                <div className="text-left">
                  <span className="org-shortcut-title">Analytics Reports</span>
                  <span className="org-shortcut-desc">Review engagement trends</span>
                </div>
              </button>

              <button
                type="button"
                className="org-shortcut-tile"
                onClick={() => navigate('/organizer/achievements')}
              >
                <div className="org-shortcut-icon bg-amber-50 text-amber-700">
                  <Sparkle size={18} weight="bold" />
                </div>
                <div className="text-left">
                  <span className="org-shortcut-title">Award Badges</span>
                  <span className="org-shortcut-desc">Issue member achievements</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
