/**
 * OrganizerAnalyticsPage.jsx — Community Analytics Dashboard.
 * Features:
 * - Timeframe control (presets + custom date range) that actually scopes
 *   the stat cards and follower growth trend chart below it.
 * - Key performance stat cards with deltas computed from real series data.
 * - Trend, funnel, and composition charts matched to what each metric is.
 * - "By Event" tab embedding per-event analytics inline, so organisers
 *   don't have to leave this page to drill into one event.
 * - Top Events leaderboard that deep-links into that same "By Event" tab.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  UsersThree,
  Ticket,
  ArrowsClockwise,
  ChartBar,
  DownloadSimple,
  TrendUp,
  Sparkle,
  ShieldCheck,
  Funnel,
  Medal,
  ArrowUpRight,
  CalendarCheck,
  CircleNotch,
  Warning,
} from '@phosphor-icons/react';
import { formatCount } from '@/shared/utils/formatters';
import { DEFAULT_TIMEFRAME, resolveTimeframeRange, filterByDateRange, computeSeriesDelta, formatTimeframeLabel } from '@/portal/organizer/analyticsTimeframe';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { getOverviewAnalytics } from '@/portal/organizer/analytics/analytics.api';
import { listCommunityEvents, getEvent, listEventRegistrations } from '@/portal/organizer/events/events.api';
import { mapEventForAnalytics, buildEventAnalytics } from '@/portal/organizer/analytics/analyticsMapper';
import { exportAnalyticsReportXlsx } from '@/portal/organizer/analytics/exportReport';
import StatCard from '@/layouts/portal/components/StatCard';
import EmptyState from '@/layouts/portal/components/EmptyState';
import OrganizerTrendChart from '@/portal/organizer/components/OrganizerTrendChart';
import OrganizerFunnelChart from '@/portal/organizer/components/OrganizerFunnelChart';
import OrganizerCompositionBar from '@/portal/organizer/components/OrganizerCompositionBar';
import OrganizerTimeframeControl from '@/portal/organizer/components/OrganizerTimeframeControl';
import OrganizerEventAnalyticsPanel from '@/portal/organizer/components/OrganizerEventAnalyticsPanel';
import '@/layouts/portal/portal-widgets.css';
import './org-analytics.css';

const EMPTY_OVERVIEW = {
  followerGrowth: [],
  branchComposition: [],
  yearComposition: [],
  engagementFunnel: [],
  topEvents: [],
};

export default function OrganizerAnalyticsPage() {
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'Your Community';
  const [searchParams, setSearchParams] = useSearchParams();

  const [overview, setOverview] = useState(EMPTY_OVERVIEW);
  const [events, setEvents] = useState([]); // [{ id, title }] for the picker
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!community?._id) return;
    setLoading(true);
    setLoadError(null);
    Promise.all([getOverviewAnalytics(), listCommunityEvents(community._id, { limit: 100 })])
      .then(([overviewRes, eventsRes]) => {
        setOverview(overviewRes);
        setEvents((eventsRes.events || []).map((e) => ({ id: e._id, title: e.title })));
      })
      .catch((err) => setLoadError(err.message || 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [community?._id]);

  const { followerGrowth, branchComposition, yearComposition, engagementFunnel, topEvents } = overview;

  // ── View tab: 'overview' | 'byEvent' — URL-synced like every other
  // filter in this portal, so a Top Events click can deep-link here.
  const view = searchParams.get('view') === 'byEvent' ? 'byEvent' : 'overview';
  const selectedEventId = searchParams.get('event') || events[0]?.id;

  const goToEvent = (eventId) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', 'byEvent');
    next.set('event', eventId);
    setSearchParams(next, { replace: false });
  };

  const setView = (nextView) => {
    const next = new URLSearchParams(searchParams);
    if (nextView === 'overview') {
      next.delete('view');
      next.delete('event');
    } else {
      next.set('view', 'byEvent');
      if (!next.get('event')) next.set('event', events[0]?.id);
    }
    setSearchParams(next, { replace: false });
  };

  // ── Timeframe: a single control scopes both tabs' time-series data.
  // (Not URL-synced — a 3-field custom range doesn't fit the existing
  // single-param pattern cleanly, so it stays local state like the
  // rest of this page's non-linkable UI state.)
  const timeframeParam = searchParams.get('tf');
  const timeframe = timeframeParam
    ? { preset: timeframeParam, from: searchParams.get('from') || '', to: searchParams.get('to') || '' }
    : DEFAULT_TIMEFRAME;
  const setTimeframe = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('tf', next.preset);
    if (next.preset === 'custom') {
      params.set('from', next.from);
      params.set('to', next.to);
    } else {
      params.delete('from');
      params.delete('to');
    }
    setSearchParams(params, { replace: true });
  };

  // Depend on the primitive fields, not `timeframe` itself — that object
  // literal is rebuilt fresh from searchParams on every render, so keying
  // the memo on its reference would recompute (and re-filter every chart)
  // on every unrelated re-render instead of only when tf/from/to change.
  const range = useMemo(
    () => resolveTimeframeRange(timeframe),
    [timeframe.preset, timeframe.from, timeframe.to]
  );
  const rangeLabel = formatTimeframeLabel(timeframe, range);

  const filteredFollowerGrowth = useMemo(
    () => filterByDateRange(followerGrowth, range),
    [followerGrowth, range]
  );

  const followersValue = filteredFollowerGrowth.length
    ? filteredFollowerGrowth[filteredFollowerGrowth.length - 1].value
    : community?.followerCount || 0;
  const followersDelta = computeSeriesDelta(filteredFollowerGrowth);

  // StatCard's delta chip renders "{delta}% {deltaPeriod}" — match the
  // phrase to the real timeframe instead of a hardcoded one.
  const deltaPeriodLabel =
    timeframe.preset === '30d'
      ? 'in the last 30 days'
      : timeframe.preset === '90d'
      ? 'in the last 90 days'
      : timeframe.preset === 'custom'
      ? 'in the selected range'
      : 'this semester';

  // Event Registrants / Repeat Attendees come from a single funnel snapshot,
  // not a dated series — looked up by label (not index) so re-ordering the
  // funnel fixture can't silently point a stat card at the wrong stage.
  const eventRegistrants = engagementFunnel.find((f) => f.label === 'Event Registrants');
  const repeatAttendees = engagementFunnel.find((f) => f.label === 'Repeat Attendees');

  // ── "By Event" tab: lazy-fetch the selected event's full detail +
  // registrations only when it's actually being viewed.
  const [eventDetail, setEventDetail] = useState(null);
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [eventDetailLoading, setEventDetailLoading] = useState(false);

  useEffect(() => {
    if (view !== 'byEvent' || !selectedEventId) return;
    setEventDetailLoading(true);
    Promise.all([getEvent(selectedEventId), listEventRegistrations(selectedEventId, { limit: 100 })])
      .then(([eventRes, regRes]) => {
        setEventDetail(mapEventForAnalytics(eventRes.event));
        setEventAnalytics(buildEventAnalytics(eventRes.event, regRes.registrations));
      })
      .catch(() => {
        setEventDetail(null);
        setEventAnalytics(null);
      })
      .finally(() => setEventDetailLoading(false));
  }, [view, selectedEventId]);

  const selectedEventAnalytics = eventAnalytics
    ? { ...eventAnalytics, registrationTimeline: filterByDateRange(eventAnalytics.registrationTimeline, range) }
    : { registrationTimeline: [], branchBreakdown: [], funnel: [] };
  const selectedEvent = eventDetail ? { ...eventDetail, waitlistCount: selectedEventAnalytics.waitlistCount } : null;

  // Export report handler — pulls the same numbers and charts the page
  // shows, scoped to whatever timeframe is currently selected, into a real
  // .xlsx workbook (data tables + chart images), not a text dump.
  const [exporting, setExporting] = useState(false);
  const handleExportReport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      await exportAnalyticsReportXlsx({
        communityName,
        rangeLabel,
        followersValue,
        followersDelta,
        eventRegistrants: eventRegistrants?.value ?? 0,
        repeatAttendees: repeatAttendees?.value ?? 0,
        followerGrowth: filteredFollowerGrowth,
        engagementFunnel,
        branchComposition,
        yearComposition,
        topEvents,
        byEvent:
          view === 'byEvent' && selectedEvent && eventAnalytics
            ? { event: selectedEvent, analytics: selectedEventAnalytics, rangeLabel }
            : null,
      });
    } catch (err) {
      setLoadError(err.message || 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="org-page org-analytics-page">
      {/* ── Header ── */}
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">
            <ChartBar size={13} className="inline mr-1 text-[#991B1B]" />
            Insights · Organiser Intelligence
          </p>
          <h1 className="org-page-title">Community Analytics</h1>
          <p className="org-page-desc">
            Analyze student engagement trends, branch/year distribution, turnout funnels, and individual event performance.
          </p>
        </div>

        <div className="org-page-actions">
          <OrganizerTimeframeControl value={timeframe} onChange={setTimeframe} />
          <button
            type="button"
            className="org-btn org-btn-ghost"
            onClick={handleExportReport}
            disabled={exporting}
          >
            {exporting ? <CircleNotch size={15} className="animate-spin" /> : <DownloadSimple size={15} />}
            <span>{exporting ? 'Preparing…' : 'Export Report'}</span>
          </button>
        </div>
      </div>

      {loadError && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {loadError}
        </p>
      )}

      {/* ── View Tabs ── */}
      <div className="org-analytics-view-tabs">
        <button
          type="button"
          className={`org-analytics-view-tab ${view === 'overview' ? 'is-active' : ''}`}
          onClick={() => setView('overview')}
        >
          <ChartBar size={14} />
          <span>Community Overview</span>
        </button>
        <button
          type="button"
          className={`org-analytics-view-tab ${view === 'byEvent' ? 'is-active' : ''}`}
          onClick={() => setView('byEvent')}
        >
          <CalendarCheck size={14} />
          <span>By Event</span>
        </button>
      </div>

      {loading ? (
        <EmptyState icon={CircleNotch} title="Loading analytics…" desc="Crunching your community's real engagement data." />
      ) : view === 'overview' ? (
        <>
          {/* ── Key Metrics Grid ── */}
          <div className="org-stat-grid mb-6">
            <StatCard
              label="Total Followers"
              value={formatCount(followersValue)}
              delta={followersDelta}
              deltaPeriod={deltaPeriodLabel}
              icon={UsersThree}
              accent="#991B1B"
              subtitle="Subscribed campus students"
            />
            <StatCard
              label="Event Registrants"
              value={formatCount(overview.totalRegistrations ?? eventRegistrants?.value ?? 0)}
              icon={Ticket}
              accent="#0D9488"
              subtitle="Confirmed event RSVPs, all-time"
            />
            <StatCard
              label="Repeat Attendees"
              value={formatCount(repeatAttendees?.value ?? 0)}
              icon={ArrowsClockwise}
              accent="#B45309"
              subtitle="Multi-event active members, all-time"
            />
          </div>

          {/* ── Analytics Visualizations Grid ── */}
          <div className="org-analytics-grid">
            {/* Follower Growth Chart — trend over time, so it's a line, not bars */}
            <div className="org-card org-card-pad">
              <div className="flex items-center justify-between mb-3">
                <h2 className="org-card-title text-sm flex items-center gap-1.5">
                  <TrendUp size={15} className="text-[#991B1B]" />
                  Follower Growth
                </h2>
                <span className="org-card-subtitle">{rangeLabel}</span>
              </div>
              <OrganizerTrendChart
                data={filteredFollowerGrowth}
                accent="#991B1B"
                formatValue={(v) => v.toLocaleString()}
                emptyLabel="No follower data in the selected range."
              />
            </div>

            {/* Engagement Conversion Funnel — ordinal stages with drop-off, not unordered bars */}
            <div className="org-card org-card-pad">
              <div className="flex items-center justify-between mb-3">
                <h2 className="org-card-title text-sm flex items-center gap-1.5">
                  <Funnel size={15} className="text-[#0F172A]" />
                  Student Engagement Funnel
                </h2>
                <span className="org-card-subtitle">All-time conversion</span>
              </div>
              <OrganizerFunnelChart data={engagementFunnel} />
            </div>

            {/* Branch Composition — part-to-whole, so it's a single stacked bar + legend */}
            <div className="org-card org-card-pad">
              <div className="flex items-center justify-between mb-3">
                <h2 className="org-card-title text-sm flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-[#0D9488]" />
                  Branch / Department Distribution
                </h2>
                <span className="org-card-subtitle">Followers by department</span>
              </div>
              <OrganizerCompositionBar data={branchComposition} />
            </div>

            {/* Year Composition — part-to-whole, so it's a single stacked bar + legend */}
            <div className="org-card org-card-pad">
              <div className="flex items-center justify-between mb-3">
                <h2 className="org-card-title text-sm flex items-center gap-1.5">
                  <Sparkle size={15} className="text-[#B45309]" />
                  Academic Year Composition
                </h2>
                <span className="org-card-subtitle">Followers by class year</span>
              </div>
              <OrganizerCompositionBar data={yearComposition} />
            </div>

            {/* Top Events Leaderboard */}
            <div className="org-card org-card-pad org-analytics-span-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="org-card-title text-base flex items-center gap-1.5">
                    <Medal size={16} className="text-amber-500" />
                    Top Performing Events
                  </h2>
                  <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
                    Ranked by student registration numbers. Click an event to view its analytics.
                  </p>
                </div>
              </div>

              {topEvents.length === 0 ? (
                <p className="text-sm text-gray-500">No published events yet.</p>
              ) : (
                <div className="org-top-events-list">
                  {topEvents.map((ev, i) => (
                    <motion.button
                      key={ev.id}
                      whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      className="org-top-events-row"
                      onClick={() => goToEvent(ev.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="org-rank-num">#{i + 1}</span>
                        <div>
                          <span className="org-top-event-name">{ev.title}</span>
                          <span className="org-top-event-meta text-[11px] text-gray-400 font-mono block">
                            {communityName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="org-top-events-count font-mono font-bold">
                          {formatCount(ev.registrations)} Registrations
                        </span>
                        <ArrowUpRight size={14} className="text-gray-400" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── Event Picker ── */}
          <div className="org-analytics-event-picker">
            <label htmlFor="analytics-event-select" className="org-form-label">
              Viewing analytics for
            </label>
            <select
              id="analytics-event-select"
              className="org-form-select"
              value={selectedEventId || ''}
              onChange={(e) => goToEvent(e.target.value)}
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title}
                </option>
              ))}
            </select>
            <span className="org-card-subtitle">{rangeLabel}</span>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-gray-500">Create an event to see its analytics here.</p>
          ) : eventDetailLoading || !selectedEvent ? (
            <EmptyState icon={CircleNotch} title="Loading event analytics…" />
          ) : (
            <OrganizerEventAnalyticsPanel
              event={selectedEvent}
              analytics={selectedEventAnalytics}
              range={range}
              rangeLabel={rangeLabel}
            />
          )}
        </>
      )}
    </div>
  );
}
