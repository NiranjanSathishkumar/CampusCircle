import { EVENT_CATEGORIES, PAYMENT_OPTIONS, TEAM_SIZE_OPTIONS } from '@/features/events/eventsConstants';

/* ─────────────────────────────────────────────────────────────
   FILTER PANEL
   ───────────────────────────────────────────────────────────── */

export default function EventsFilterPanel({ filters, onToggleFilter, onClearAll }) {
  const { teamSizes, payments, categories } = filters;

  return (
    <div className="events-filter-panel" aria-label="Event filters">
      <div className="events-filter-header">
        <h3 className="events-filter-title">Filters</h3>
        <button className="events-filter-reset" onClick={onClearAll} aria-label="Clear all filters">
          Reset
        </button>
      </div>

      {/* Team size */}
      <div className="events-filter-section">
        <p className="events-filter-section-title">Team Size</p>
        <div className="events-filter-options" role="group" aria-label="Filter by team size">
          {TEAM_SIZE_OPTIONS.map(opt => (
            <label key={opt.id} className="events-filter-option">
              <input
                type="checkbox"
                checked={teamSizes.includes(opt.id)}
                onChange={() => onToggleFilter('teamSizes', opt.id)}
                aria-label={`Team size: ${opt.label}`}
              />
              <span className="events-filter-option-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="events-filter-section">
        <p className="events-filter-section-title">Payment</p>
        <div className="events-filter-options" role="group" aria-label="Filter by payment">
          {PAYMENT_OPTIONS.map(opt => (
            <label key={opt.id} className="events-filter-option">
              <input
                type="checkbox"
                checked={payments.includes(opt.id)}
                onChange={() => onToggleFilter('payments', opt.id)}
                aria-label={`Payment: ${opt.label}`}
              />
              <span className="events-filter-option-label">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="events-filter-section">
        <p className="events-filter-section-title">Category</p>
        <div className="events-filter-options" role="group" aria-label="Filter by category">
          {EVENT_CATEGORIES.map(cat => (
            <label key={cat} className="events-filter-option">
              <input
                type="checkbox"
                checked={categories.includes(cat)}
                onChange={() => onToggleFilter('categories', cat)}
                aria-label={`Category: ${cat}`}
              />
              <span className="events-filter-option-label">{cat}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
