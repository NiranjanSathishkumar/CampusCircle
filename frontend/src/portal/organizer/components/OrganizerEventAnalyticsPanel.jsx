import { useMemo } from 'react';
import {
  Ticket,
  UsersThree,
  ChartLineUp,
  CurrencyInr,
  Funnel,
  ShieldCheck,
} from '@phosphor-icons/react';
import StatCard from '@/layouts/portal/components/StatCard';
import OrganizerTrendChart from './OrganizerTrendChart';
import OrganizerFunnelChart from './OrganizerFunnelChart';
import OrganizerCompositionBar from './OrganizerCompositionBar';
import { filterByDateRange, computeSeriesDelta } from '@/portal/organizer/analyticsTimeframe';

/**
 * OrganizerEventAnalyticsPanel — the stat cards + chart grid for a single
 * event's analytics. Extracted so the same content can render both at its
 * own route (/organizer/analytics/:eventId) and embedded inline in the
 * "By Event" tab of the community Analytics page, without duplicating
 * the stat-grid/chart-grid JSX in two places.
 */
export default function OrganizerEventAnalyticsPanel({ event, analytics, range, rangeLabel }) {
  const filteredTimeline = useMemo(
    () => filterByDateRange(analytics.registrationTimeline, range),
    [analytics.registrationTimeline, range]
  );

  const registrantsDelta = computeSeriesDelta(filteredTimeline);

  const fillPct = event.capacity
    ? Math.round((event.registeredCount / event.capacity) * 100)
    : 0;

  const totalRevenue =
    event.payment === 'Free'
      ? 'Free Entry'
      : `₹${(event.priceAmount * event.registeredCount).toLocaleString()}`;

  return (
    <>
      {/* Key Metric Cards */}
      <div className="org-stat-grid mb-6">
        <StatCard
          label="Total RSVPs"
          value={event.registeredCount}
          delta={registrantsDelta}
          deltaPeriod={rangeLabel ? `over ${rangeLabel}` : undefined}
          icon={Ticket}
          accent="#991B1B"
          subtitle="Confirmed registered attendees"
        />
        <StatCard
          label="Capacity Fill Rate"
          value={`${fillPct}%`}
          progress={fillPct}
          icon={UsersThree}
          accent="#0D9488"
          subtitle={`${event.registeredCount}/${event.capacity} seats filled`}
        />
        <StatCard
          label="Waitlisted Students"
          value={event.waitlistCount}
          icon={ChartLineUp}
          accent="#B45309"
          subtitle="Overflow queue"
        />
        <StatCard
          label="Ticket Revenue"
          value={totalRevenue}
          icon={CurrencyInr}
          accent="#2563EB"
          subtitle={event.payment === 'Free' ? 'Free campus registration' : `₹${event.priceAmount} per ticket`}
        />
      </div>

      {/* Analytics Visualizations Grid */}
      <div className="org-analytics-grid">
        {/* Registration Timeline — trend over time, so it's a line, not bars */}
        <div className="org-card org-card-pad org-analytics-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="org-card-title text-sm flex items-center gap-1.5">
              <Ticket size={15} className="text-[#991B1B]" />
              Registration Timeline
            </h2>
            <span className="org-card-subtitle">RSVPs per Week, selected range</span>
          </div>
          <OrganizerTrendChart
            data={filteredTimeline}
            accent="#991B1B"
            emptyLabel="No registrations recorded in the selected range."
          />
        </div>

        {/* Branch Breakdown — part-to-whole, so it's a single stacked bar + legend */}
        <div className="org-card org-card-pad">
          <div className="flex items-center justify-between mb-3">
            <h2 className="org-card-title text-sm flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#0D9488]" />
              Department Breakdown
            </h2>
            <span className="org-card-subtitle">Student Branches %</span>
          </div>
          <OrganizerCompositionBar
            data={analytics.branchBreakdown}
            emptyLabel="No branch breakdown data recorded yet."
          />
        </div>

        {/* Registration & Check-In Funnel — ordinal stages with drop-off, not unordered bars */}
        <div className="org-card org-card-pad">
          <div className="flex items-center justify-between mb-3">
            <h2 className="org-card-title text-sm flex items-center gap-1.5">
              <Funnel size={15} className="text-[#0F172A]" />
              Attendance Conversion Funnel
            </h2>
            <span className="org-card-subtitle">Views to QR Check-in</span>
          </div>
          <OrganizerFunnelChart data={analytics.funnel} />
        </div>
      </div>
    </>
  );
}
