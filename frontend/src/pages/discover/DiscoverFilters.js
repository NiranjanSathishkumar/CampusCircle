import React, { useState, useRef, useEffect } from "react";
import { DATE_PRESETS, SORT_OPTIONS } from "./discoverData";

function useClickOutside(ref, callback) {
  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, callback]);
}

/* ─────────────────────────────────────────────────────────────
   FILTER DROPDOWN
───────────────────────────────────────────────────────────── */
export function FilterDropdown({ label, icon, options, selected, onSelect, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const count = selected.length;

  return (
    <div className="disc-filter-dropdown" ref={ref}>
      <button
        className={`disc-filter-pill ${count > 0 ? "disc-filter-pill--active" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        <i className={`fa-solid ${icon}`} />
        {label}
        {count > 0 && <span className="disc-filter-count">{count}</span>}
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} disc-filter-chevron`} />
      </button>
      {open && (
        <div className="disc-dropdown-menu">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                className={`disc-dropdown-item ${checked ? "disc-dropdown-item--checked" : ""}`}
                onClick={() => onSelect(opt)}
              >
                <span className={`disc-dd-check ${checked ? "disc-dd-check--on" : ""}`}>
                  {checked && <i className="fa-solid fa-check" />}
                </span>
                {opt}
              </button>
            );
          })}
          {count > 0 && <button className="disc-dropdown-clear" onClick={onClear}>Clear</button>}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DATE FILTER DROPDOWN
───────────────────────────────────────────────────────────── */
export function DateFilterDropdown({ preset, dateFrom, dateTo, onPreset, onDateFrom, onDateTo, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));
  const isActive = preset !== "All Time" || dateFrom || dateTo;

  return (
    <div className="disc-filter-dropdown" ref={ref}>
      <button
        className={`disc-filter-pill ${isActive ? "disc-filter-pill--active" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        <i className="fa-solid fa-calendar-days" />
        {isActive && preset !== "All Time" ? preset : "Date"}
        {isActive && (
          <span className="disc-filter-count">
            <i className="fa-solid fa-check" style={{ fontSize: "0.5rem" }} />
          </span>
        )}
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} disc-filter-chevron`} />
      </button>
      {open && (
        <div className="disc-dropdown-menu disc-date-menu">
          <p className="disc-date-section-label">Quick Select</p>
          {["All Time", ...DATE_PRESETS.filter((p) => p !== "Custom Range")].map((opt) => (
            <button
              key={opt}
              className={`disc-dropdown-item ${preset === opt ? "disc-dropdown-item--checked" : ""}`}
              onClick={() => {
                onPreset(opt);
                if (opt !== "Custom Range") {
                  onDateFrom("");
                  onDateTo("");
                }
              }}
            >
              <span className={`disc-dd-check ${preset === opt ? "disc-dd-check--on" : ""}`}>
                {preset === opt && <i className="fa-solid fa-check" />}
              </span>
              {opt}
            </button>
          ))}

          <div className="disc-date-divider" />
          <p className="disc-date-section-label">Custom Range</p>
          <div className="disc-date-fields">
            <div className="disc-date-field">
              <label className="disc-date-label">From</label>
              <input
                type="date"
                className="disc-date-input"
                value={dateFrom}
                onChange={(e) => {
                  onDateFrom(e.target.value);
                  onPreset("Custom Range");
                }}
              />
            </div>
            <div className="disc-date-field">
              <label className="disc-date-label">To</label>
              <input
                type="date"
                className="disc-date-input"
                value={dateTo}
                onChange={(e) => {
                  onDateTo(e.target.value);
                  onPreset("Custom Range");
                }}
              />
            </div>
          </div>
          {isActive && (
            <button className="disc-dropdown-clear" onClick={onClear}>Clear date filter</button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SORT DROPDOWN
───────────────────────────────────────────────────────────── */
export function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="disc-filter-dropdown" ref={ref}>
      <button className="disc-filter-pill" onClick={() => setOpen((p) => !p)}>
        <i className="fa-solid fa-arrow-up-arrow-down" />
        {value}
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} disc-filter-chevron`} />
      </button>
      {open && (
        <div className="disc-dropdown-menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              className={`disc-dropdown-item ${value === opt ? "disc-dropdown-item--checked" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <span className={`disc-dd-check ${value === opt ? "disc-dd-check--on" : ""}`}>
                {value === opt && <i className="fa-solid fa-check" />}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
