import React, { useState, useRef, useEffect } from "react";
import { SORT_OPTIONS } from "./eventsData";

/* ── Dropdown component ──────────────────────────────────── */
export function FilterDropdown({ label, icon, options, selected, onSelect, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeCount = selected.length;

  return (
    <div className="ev-filter-dropdown" ref={ref}>
      <button
        className={`ev-filter-pill ${activeCount > 0 ? "ev-filter-pill--active" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        <i className={`fa-solid ${icon} ev-filter-pill-icon`} />
        {label}
        {activeCount > 0 && <span className="ev-filter-count">{activeCount}</span>}
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} ev-filter-chevron`} />
      </button>

      {open && (
        <div className="ev-dropdown-menu">
          {options.map((opt) => {
            const checked = selected.includes(opt);
            return (
              <button
                key={opt}
                className={`ev-dropdown-item ${checked ? "ev-dropdown-item--checked" : ""}`}
                onClick={() => onSelect(opt)}
              >
                <span className={`ev-dropdown-check ${checked ? "ev-dropdown-check--on" : ""}`}>
                  {checked && <i className="fa-solid fa-check" />}
                </span>
                {opt}
              </button>
            );
          })}
          {activeCount > 0 && (
            <button className="ev-dropdown-clear" onClick={onClear}>
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sort dropdown ───────────────────────────────────────── */
export function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="ev-filter-dropdown" ref={ref}>
      <button className="ev-filter-pill" onClick={() => setOpen((p) => !p)}>
        <i className="fa-solid fa-arrow-up-arrow-down ev-filter-pill-icon" />
        {value}
        <i className={`fa-solid fa-chevron-${open ? "up" : "down"} ev-filter-chevron`} />
      </button>
      {open && (
        <div className="ev-dropdown-menu">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt}
              className={`ev-dropdown-item ${value === opt ? "ev-dropdown-item--checked" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              <span className={`ev-dropdown-check ${value === opt ? "ev-dropdown-check--on" : ""}`}>
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
