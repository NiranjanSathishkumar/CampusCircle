import React from 'react';
import { BRANCHES, YEARS, SKILLS_LIST } from './buddiesData';

function BuddiesFilterBar({
  selectedBranch,
  setSelectedBranch,
  selectedYear,
  setSelectedYear,
  selectedSkill,
  setSelectedSkill,
  hasActiveFilters,
  clearAllFilters,
}) {
  return (
    <div className="buddies-filter-bar">
      <div className="buddies-filter-group">
        <div className="buddies-select-wrap">
          <i className="fa-solid fa-graduation-cap buddies-select-icon" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="buddies-select"
          >
            {BRANCHES.map((br) => (
              <option key={br} value={br}>{br}</option>
            ))}
          </select>
        </div>

        <div className="buddies-select-wrap">
          <i className="fa-solid fa-layer-group buddies-select-icon" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="buddies-select"
          >
            {YEARS.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        <div className="buddies-select-wrap">
          <i className="fa-solid fa-code buddies-select-icon" />
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="buddies-select"
          >
            <option value="All">All Skills</option>
            {SKILLS_LIST.map((sk) => (
              <option key={sk} value={sk}>{sk}</option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <button className="buddies-clear-btn" onClick={clearAllFilters}>
          <i className="fa-solid fa-rotate-left" /> Clear Filters
        </button>
      )}
    </div>
  );
}

export default BuddiesFilterBar;
