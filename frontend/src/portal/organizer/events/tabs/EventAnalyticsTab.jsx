/**
 * Per-event analytics panel.
 */
import { Check, CurrencyInr, QrCode, UsersThree, Warning } from '@phosphor-icons/react';

export default function EventAnalyticsTab({
  checkedInCount,
  event,
  fillRate,
}) {
  return (
    <div id="panel-analytics" role="tabpanel" className="space-y-4">
      {/* Stat cards */}
      <div className="org-analytics-grid">
        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
            <UsersThree size={16} style={{ color: '#2563EB' }} />
          </div>
          <p className="org-analytics-stat-label">Total Registered</p>
          <p className="org-analytics-stat-value" style={{ color: '#2563EB' }}>{event.registeredCount}</p>
          <p className="org-analytics-stat-sub">Out of {event.capacity} seats</p>
        </div>

        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(180, 83, 9, 0.1)' }}>
            <Warning size={16} style={{ color: '#B45309' }} />
          </div>
          <p className="org-analytics-stat-label">Waitlisted</p>
          <p className="org-analytics-stat-value" style={{ color: '#B45309' }}>{event.waitlistCount}</p>
          <p className="org-analytics-stat-sub">Over-capacity queue</p>
        </div>

        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(26, 58, 42, 0.1)' }}>
            <QrCode size={16} style={{ color: '#1A3A2A' }} />
          </div>
          <p className="org-analytics-stat-label">QR Checked In</p>
          <p className="org-analytics-stat-value" style={{ color: '#1A3A2A' }}>{checkedInCount}</p>
          <p className="org-analytics-stat-sub">Scanned at venue door</p>
        </div>

        <div className="org-analytics-stat-card">
          <div className="org-analytics-stat-icon" style={{ background: 'rgba(153, 27, 27, 0.08)' }}>
            <CurrencyInr size={16} style={{ color: '#991B1B' }} />
          </div>
          <p className="org-analytics-stat-label">Total Revenue</p>
          <p className="org-analytics-stat-value" style={{ color: '#991B1B' }}>
            {event.payment === 'Free' ? '—' : `₹${(event.priceAmount * event.registeredCount).toLocaleString()}`}
          </p>
          <p className="org-analytics-stat-sub">{event.payment} tier</p>
        </div>
      </div>

      {/* Gauge card */}
      <div className="org-gauge-card">
        <h3 className="org-gauge-card-title">Attendance &amp; Capacity Overview</h3>
        <div className="org-gauge-row">
          <div className="org-gauge-labels">
            <span className="org-gauge-label-left">Registered vs Maximum Seats</span>
            <span className="org-gauge-label-right" style={{ color: fillRate >= 90 ? '#991B1B' : '#1A3A2A' }}>
              {event.registeredCount} / {event.capacity} ({fillRate}%)
            </span>
          </div>
          <div className="org-gauge-track">
            <div
              className="org-gauge-fill"
              style={{ width: `${fillRate}%`, backgroundColor: fillRate >= 90 ? '#991B1B' : '#1A3A2A' }}
            />
          </div>
        </div>

        <div className="org-gauge-row">
          <div className="org-gauge-labels">
            <span className="org-gauge-label-left">Venue Door Check-In Ratio</span>
            <span className="org-gauge-label-right" style={{ color: '#0D9488' }}>
              {checkedInCount} / {event.registeredCount || 1} Checked In (
              {event.registeredCount
                ? Math.round((checkedInCount / event.registeredCount) * 100)
                : 0}%)
            </span>
          </div>
          <div className="org-gauge-track">
            <div
              className="org-gauge-fill"
              style={{
                width: `${event.registeredCount ? Math.round((checkedInCount / event.registeredCount) * 100) : 0}%`,
                backgroundColor: '#0D9488',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
