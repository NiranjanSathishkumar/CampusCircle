import { SquaresFour, Rows } from '@phosphor-icons/react';

/**
 * ViewToggle — segmented control for switching between the editorial grid-card
 * layout and the compact ledger list layout. Used uniformly across Discover,
 * Events, Communities, Buddies, and My Events.
 */
export default function ViewToggle({ view, onChange, gridLabel = 'Grid', listLabel = 'List' }) {
  return (
    <div className="view-toggle" role="group" aria-label="Switch view layout">
      <button
        type="button"
        className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
        onClick={() => onChange('grid')}
        aria-pressed={view === 'grid'}
        title="Editorial Grid Cards"
      >
        <SquaresFour size={14} weight={view === 'grid' ? 'fill' : 'regular'} />
        <span className="view-toggle-label">{gridLabel}</span>
      </button>
      <button
        type="button"
        className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
        onClick={() => onChange('list')}
        aria-pressed={view === 'list'}
        title="Compact Ledger List View"
      >
        <Rows size={14} weight={view === 'list' ? 'fill' : 'regular'} />
        <span className="view-toggle-label">{listLabel}</span>
      </button>
    </div>
  );
}
