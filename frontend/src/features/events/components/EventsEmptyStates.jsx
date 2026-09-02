/**
 * Empty states for the events hub.
 */
import { ArrowsClockwise, CalendarBlank, MagnifyingGlass } from '@phosphor-icons/react';

/* ─────────────────────────────────────────────────────────────
   EMPTY STATES
   ───────────────────────────────────────────────────────────── */

export function EmptyNoResults({ onReset }) {
  return (
    <div className="events-empty-state" role="status">
      <div className="events-empty-icon" aria-hidden="true">
        <MagnifyingGlass size={24} />
      </div>
      <h3 className="events-empty-title">No events match your filters</h3>
      <p className="events-empty-desc">
        Try adjusting your search terms or filters to find what you are looking for.
      </p>
      <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }} onClick={onReset}>
        <ArrowsClockwise size={14} />
        Reset Filters
      </button>
    </div>
  );
}

export function EmptyNoEvents() {
  return (
    <div className="events-empty-state" role="status">
      <div className="events-empty-icon" aria-hidden="true">
        <CalendarBlank size={24} />
      </div>
      <h3 className="events-empty-title">No events scheduled yet</h3>
      <p className="events-empty-desc">
        There are no upcoming campus events at the moment. Check back soon or explore campus communities to stay updated.
      </p>
    </div>
  );
}
