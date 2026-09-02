/**
 * OrganizerEventAnalyticsPage.jsx — Per-Event Analytics Dashboard.
 * Features:
 * - Event Spotlight Header with live date/venue badges & back link.
 * - Timeframe control (presets + custom date range) scoping the
 *   registration timeline and its derived RSVP delta.
 * - Key metric cards, registration trend, branch breakdown, and
 *   attendance funnel, rendered via the shared OrganizerEventAnalyticsPanel
 *   (also embedded in the community Analytics page's "By Event" tab).
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarBlank, CircleNotch, MapPin, QrCode } from '@phosphor-icons/react';
import { getEvent, listEventRegistrations } from '@/portal/organizer/events/events.api';
import { mapEventForAnalytics, buildEventAnalytics } from '@/portal/organizer/analytics/analyticsMapper';
import OrganizerEventAnalyticsPanel from '@/portal/organizer/components/OrganizerEventAnalyticsPanel';
import OrganizerTimeframeControl from '@/portal/organizer/components/OrganizerTimeframeControl';
import EmptyState from '@/layouts/portal/components/EmptyState';
import { DEFAULT_TIMEFRAME, resolveTimeframeRange, filterByDateRange, formatTimeframeLabel } from '@/portal/organizer/analyticsTimeframe';
import '@/layouts/portal/portal-widgets.css';
import './org-analytics.css';

export default function OrganizerEventAnalyticsPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [timeframe, setTimeframe] = useState(DEFAULT_TIMEFRAME);
  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    Promise.all([getEvent(eventId), listEventRegistrations(eventId, { limit: 100 })])
      .then(([eventRes, regRes]) => {
        setEvent(mapEventForAnalytics(eventRes.event));
        setAnalytics(buildEventAnalytics(eventRes.event, regRes.registrations));
      })
      .catch((err) => setLoadError(err.message || 'Failed to load this event'))
      .finally(() => setLoading(false));
  }, [eventId]);

  const range = useMemo(() => resolveTimeframeRange(timeframe), [timeframe]);
  const rangeLabel = formatTimeframeLabel(timeframe, range);

  const filteredAnalytics = analytics
    ? { ...analytics, registrationTimeline: filterByDateRange(analytics.registrationTimeline, range) }
    : { registrationTimeline: [], branchBreakdown: [], funnel: [] };
  const panelEvent = event ? { ...event, waitlistCount: filteredAnalytics.waitlistCount } : null;

  if (loading) {
    return (
      <div className="org-page">
        <EmptyState icon={CircleNotch} title="Loading event analytics…" />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="org-page">
        <EmptyState
          title="Event Analytics Not Found"
          desc={loadError || 'The selected event listing may have been deleted or moved.'}
          action={
            <button className="org-btn org-btn-primary" onClick={() => navigate('/organizer/events')}>
              Back to Events
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="org-page org-analytics-page">
      {/* Back Navigation Link */}
      <button
        type="button"
        className="org-back-link"
        onClick={() => navigate(`/organizer/events/${event.id}`)}
      >
        <ArrowLeft size={14} />
        <span>Back to {event.title}</span>
      </button>

      {/* Page Header */}
      <div className="org-page-header">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="org-event-cat-chip font-mono">{event.category || 'Workshop'}</span>
            <span className="text-xs font-mono text-gray-500">• Event Intelligence Report</span>
          </div>
          <h1 className="org-page-title">{event.title}</h1>
          <div className="flex items-center gap-4 text-xs font-['Plus_Jakarta_Sans'] text-gray-600 mt-1 flex-wrap">
            <span className="flex items-center gap-1">
              <CalendarBlank size={14} className="text-[#991B1B]" />
              {event.dateFormatted}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} className="text-[#0D9488]" />
              {event.venue}
            </span>
          </div>
        </div>

        <div className="org-page-actions">
          <OrganizerTimeframeControl value={timeframe} onChange={setTimeframe} />
          <button
            type="button"
            className="org-btn org-btn-primary"
            onClick={() => navigate(`/organizer/events/${event.id}/scan`)}
          >
            <QrCode size={15} />
            <span>Launch Ticket Scanner</span>
          </button>
        </div>
      </div>

      <OrganizerEventAnalyticsPanel event={panelEvent} analytics={filteredAnalytics} range={range} rangeLabel={rangeLabel} />
    </div>
  );
}
