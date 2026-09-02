/**
 * Registered attendees for this event. Field names mirror the populated
 * Registration doc — see mapRegistration() in OrganizerEventDetailPage.
 */
import { Check, CheckCircle, Circle, FileText, MagnifyingGlass, UserCheck, UsersThree, Warning } from '@phosphor-icons/react';
import EmptyState from '@/layouts/portal/components/EmptyState';

export default function EventRosterTab({
  checkedInCount,
  checkingInId,
  filtered,
  handleCheckIn,
  registrations,
  search,
  setSearch,
  setSelectedSubmission,
  waitlistCount,
}) {
  return (
    <div id="panel-roster" role="tabpanel" className="space-y-4">
      {/* Summary stats bar */}
      <div className="org-roster-summary">
        <div className="org-roster-summary-item">
          <UsersThree size={14} style={{ color: '#2563EB' }} />
          <span>Confirmed:</span>
          <span className="org-roster-summary-val" style={{ color: '#2563EB' }}>{registrations.length}</span>
        </div>
        <div className="org-roster-summary-item">
          <CheckCircle size={14} style={{ color: '#1A3A2A' }} />
          <span>Checked In:</span>
          <span className="org-roster-summary-val" style={{ color: '#1A3A2A' }}>{checkedInCount}</span>
        </div>
        <div className="org-roster-summary-item">
          <Circle size={14} style={{ color: '#B45309' }} />
          <span>Pending:</span>
          <span className="org-roster-summary-val" style={{ color: '#B45309' }}>{registrations.length - checkedInCount}</span>
        </div>
        <div className="org-roster-summary-item">
          <Warning size={14} style={{ color: '#991B1B' }} />
          <span>Waitlisted:</span>
          <span className="org-roster-summary-val" style={{ color: '#991B1B' }}>{waitlistCount}</span>
        </div>
      </div>

      <div className="org-card">
        <div className="org-card-header flex-wrap gap-3">
          <div>
            <h2 className="org-card-title">Registered Students Roster</h2>
            <span className="org-card-subtitle">
              Showing {filtered.length} of {registrations.length} confirmed RSVPs
            </span>
          </div>

          {/* Roster Search Input */}
          <div className="org-search-wrap" style={{ maxWidth: 260 }}>
            <MagnifyingGlass size={14} className="org-search-icon" />
            <input
              className="org-search-input"
              placeholder="Search name, roll no, ticket ID…"
              aria-label="Search name, roll no, or ticket ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title="No matching student registrations"
            desc="No registrations match your search keyword."
          />
        ) : (
          <div className="org-table-wrap">
            <table className="org-table" aria-label="Student Registrations Table">
              <thead>
                <tr>
                  <th scope="col">Student Name</th>
                  <th scope="col" className="org-hide-mobile">Roll No.</th>
                  <th scope="col" className="org-hide-mobile">Branch &amp; Year</th>
                  <th scope="col">Ticket ID</th>
                  <th scope="col">Payment</th>
                  <th scope="col">Check-In</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                    <td>
                      <button
                        type="button"
                        className="text-left hover:text-[#991B1B] font-semibold text-[#0F172A] transition-colors inline-flex items-center gap-1.5"
                        onClick={() => setSelectedSubmission(r)}
                        title="Click to view full form submission details"
                      >
                        <span>{r.name}</span>
                        <FileText size={13} className="text-gray-400 hover:text-[#991B1B]" />
                      </button>
                    </td>
                    <td className="org-table-muted org-hide-mobile" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem' }}>{r.rollNo}</td>
                    <td className="org-table-muted org-hide-mobile" style={{ fontSize: '0.8125rem' }}>{r.branch} · {r.year}</td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#6B7280' }}>{r.ticketId}</td>
                    <td>
                      <span className="org-badge">{r.paymentStatus}</span>
                    </td>
                    <td>
                      {r.checkedIn ? (
                        <span className="org-checkin-badge org-checkin-badge--in">
                          <CheckCircle size={12} weight="fill" /> Checked In
                        </span>
                      ) : (
                        <span className="org-checkin-badge org-checkin-badge--pending">
                          <Circle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className="org-btn org-btn-ghost !py-1 !px-2 text-xs text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded"
                          onClick={() => setSelectedSubmission(r)}
                          title="View custom form answers"
                        >
                          <FileText size={13} />
                          <span className="org-hide-mobile">View Form</span>
                        </button>
                        {!r.checkedIn && (
                          <button
                            type="button"
                            className="org-checkin-action-btn org-checkin-action-btn--toggle"
                            onClick={() => handleCheckIn(r)}
                            disabled={checkingInId === r.id}
                            title="Check in this student (QR check-in is one-way — no undo)"
                          >
                            <UserCheck size={13} />
                            <span>{checkingInId === r.id ? 'Checking In…' : 'Check In'}</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
