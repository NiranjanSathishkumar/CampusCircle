/**
 * EventAnalyticsTab.jsx — Per-event Capacity & Performance analytics panel.
 * Dynamically computes real stats: confirmed registrations, reserved seats,
 * door check-ins, waitlist length, verified revenue, and fill rates.
 */
import { Check, CurrencyInr, QrCode, UsersThree, Warning, Clock } from '@phosphor-icons/react';

export default function EventAnalyticsTab({
  checkedInCount = 0,
  event = {},
  fillRate = 0,
}) {
  const isPaid = event.payment === 'Paid' || (event.priceAmount && event.priceAmount > 0);
  const confirmedCount = event.confirmedCount ?? event.registeredCount ?? 0;
  const reservedCount = event.reservedCount || 0;
  const capacity = event.capacity || 0;
  const waitlistCount = event.waitlistCount || 0;
  const priceAmount = event.priceAmount || 0;

  // Real verified revenue from confirmed registrations
  const confirmedRevenue = event.confirmedRevenue !== undefined
    ? event.confirmedRevenue
    : isPaid ? confirmedCount * priceAmount : 0;

  const totalOccupiedSeats = confirmedCount + reservedCount;
  const checkInBase = confirmedCount || 1;
  const checkInPercentage = confirmedCount > 0 ? Math.round((checkedInCount / confirmedCount) * 100) : 0;

  return (
    <div id="panel-analytics" role="tabpanel" className="space-y-4">
      {/* Stat cards */}
      <div className="org-analytics-grid">
        {/* Total Registered / Confirmed Card */}
        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
            <UsersThree size={16} style={{ color: '#2563EB' }} />
          </div>
          <p className="org-analytics-stat-label">Confirmed Seats</p>
          <p className="org-analytics-stat-value" style={{ color: '#2563EB' }}>
            {confirmedCount}
          </p>
          <p className="org-analytics-stat-sub">
            {reservedCount > 0
              ? `+ ${reservedCount} reserved slot${reservedCount === 1 ? '' : 's'}`
              : `Out of ${capacity} seats`}
          </p>
        </div>

        {/* Waitlisted Card */}
        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(180, 83, 9, 0.1)' }}>
            <Warning size={16} style={{ color: '#B45309' }} />
          </div>
          <p className="org-analytics-stat-label">Waitlisted</p>
          <p className="org-analytics-stat-value" style={{ color: '#B45309' }}>
            {waitlistCount}
          </p>
          <p className="org-analytics-stat-sub">Over-capacity queue</p>
        </div>

        {/* QR Checked In Card */}
        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(26, 58, 42, 0.1)' }}>
            <QrCode size={16} style={{ color: '#1A3A2A' }} />
          </div>
          <p className="org-analytics-stat-label">QR Checked In</p>
          <p className="org-analytics-stat-value" style={{ color: '#1A3A2A' }}>
            {checkedInCount}
          </p>
          <p className="org-analytics-stat-sub">Scanned at venue door</p>
        </div>

        {/* Revenue Card */}
        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(153, 27, 27, 0.08)' }}>
            <CurrencyInr size={16} style={{ color: '#991B1B' }} />
          </div>
          <p className="org-analytics-stat-label">Verified Revenue</p>
          <p className="org-analytics-stat-value" style={{ color: '#991B1B' }}>
            {!isPaid ? 'Free' : `₹${Number(confirmedRevenue).toLocaleString('en-IN')}`}
          </p>
          <p className="org-analytics-stat-sub">
            {!isPaid ? 'Free Event' : `@ ₹${priceAmount}/ticket (${confirmedCount} verified)`}
          </p>
        </div>
      </div>

      {/* Gauge card */}
      <div className="org-gauge-card">
        <h3 className="org-gauge-card-title">Attendance &amp; Capacity Overview</h3>
        <div className="org-gauge-row">
          <div className="org-gauge-labels">
            <span className="org-gauge-label-left">
              Registered vs Maximum Seats
              {reservedCount > 0 && (
                <span className="text-[11px] font-mono text-gray-500 ml-1">
                  ({confirmedCount} confirmed + {reservedCount} reserved)
                </span>
              )}
            </span>
            <span
              className="org-gauge-label-right"
              style={{ color: fillRate >= 90 ? '#991B1B' : '#1A3A2A' }}
            >
              {totalOccupiedSeats} / {capacity} ({fillRate}%)
            </span>
          </div>
          <div className="org-gauge-track">
            <div
              className="org-gauge-fill"
              style={{
                width: `${fillRate}%`,
                backgroundColor: fillRate >= 90 ? '#991B1B' : '#1A3A2A',
              }}
            />
          </div>
        </div>

        <div className="org-gauge-row">
          <div className="org-gauge-labels">
            <span className="org-gauge-label-left">Venue Door Check-In Ratio</span>
            <span className="org-gauge-label-right" style={{ color: '#0D9488' }}>
              {checkedInCount} / {confirmedCount || 1} Checked In ({checkInPercentage}%)
            </span>
          </div>
          <div className="org-gauge-track">
            <div
              className="org-gauge-fill"
              style={{
                width: `${checkInPercentage}%`,
                backgroundColor: '#0D9488',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
