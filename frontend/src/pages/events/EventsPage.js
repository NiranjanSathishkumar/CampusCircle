import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EventsPage.css";
import {
  COMMUNITIES,
  TEAM_SIZE_OPTIONS,
  PAYMENT_OPTIONS,
  CATEGORY_OPTIONS,
  SAMPLE_EVENTS,
} from "./eventsData";
import { FilterDropdown, SortDropdown } from "./EventFilters";
import EventCard from "./EventCard";
import EventCommunityStrip from "./EventCommunityStrip";
import EventRegisterModal from "./EventRegisterModal";

/* ── Main EventsPage ─────────────────────────────────────── */
function EventsPage() {
  const navigate = useNavigate();
  const [activeCommunity, setActiveCommunity] = useState("all");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeCommunity]);
  const [teamSizes, setTeamSizes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("Upcoming First");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllFilters, setShowAllFilters] = useState(false);

  const toggleFilter = (setter) => (val) =>
    setter((prev) => (prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]));

  const clearAll = () => {
    setTeamSizes([]);
    setPayments([]);
    setCategories([]);
    setActiveCommunity("all");
    setSearchQuery("");
  };

  const totalActive =
    teamSizes.length +
    payments.length +
    categories.length +
    (activeCommunity !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0);

  /* Filter + sort */
  let filtered = SAMPLE_EVENTS.filter((e) => {
    if (activeCommunity !== "all" && e.community !== activeCommunity) return false;
    if (teamSizes.length && !teamSizes.includes(e.teamSize)) return false;
    if (payments.length && !payments.includes(e.payment)) return false;
    if (categories.length && !categories.includes(e.category)) return false;
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (sortBy === "Most Popular") filtered = [...filtered].sort((a, b) => b.registered - a.registered);
  if (sortBy === "Recently Added") filtered = [...filtered].sort((a, b) => b.id - a.id);
  if (sortBy === "Upcoming First") filtered = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));

  const [registerEvent, setRegisterEvent] = useState(null);
  const [, setRegisteredIds] = useState([]);

  const handleRegisterConfirm = (eventId) => {
    setRegisteredIds((prev) => [...prev, eventId]);
    setRegisterEvent(null);
  };

  return (
    <div className="ev-page">
      {/* ── Page header ── */}
      <div className="ev-page-header">
        <span className="ev-header-badge">
          <i className="fa-solid fa-calendar-days" /> EVENTS HUB
        </span>
        <h1 className="ev-page-title">Competitions, Workshops & Activities</h1>
        <p className="ev-page-sub">Discover competitions, workshops, hackathons, and campus activities.</p>
        <div className="ev-search-wrap">
          <i className="fa-solid fa-magnifying-glass ev-search-icon" />
          <input
            className="ev-search-input"
            placeholder="Search events, topics, or hosts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="ev-search-clear" onClick={() => setSearchQuery("")}>
              <i className="fa-solid fa-xmark" />
            </button>
          )}
        </div>
      </div>

      {/* ── Community filter boxes ── */}
      <EventCommunityStrip
        activeCommunity={activeCommunity}
        setActiveCommunity={setActiveCommunity}
      />

      {/* ── Filter bar ── */}
      <div className="ev-filter-bar">
        <div className="ev-filter-pills">
          {/* All filters toggle (mobile) */}
          <button
            className={`ev-filter-pill ev-filter-pill--all ${showAllFilters ? "ev-filter-pill--active" : ""}`}
            onClick={() => setShowAllFilters((p) => !p)}
          >
            <i className="fa-solid fa-sliders ev-filter-pill-icon" />
            Filters
            {totalActive > 0 && <span className="ev-filter-count">{totalActive}</span>}
          </button>

          <div className={`ev-filter-dropdowns ${showAllFilters ? "ev-filter-dropdowns--open" : ""}`}>
            <FilterDropdown
              label="Team Size"
              icon="fa-people-group"
              options={TEAM_SIZE_OPTIONS}
              selected={teamSizes}
              onSelect={toggleFilter(setTeamSizes)}
              onClear={() => setTeamSizes([])}
            />
            <FilterDropdown
              label="Payment"
              icon="fa-tag"
              options={PAYMENT_OPTIONS}
              selected={payments}
              onSelect={toggleFilter(setPayments)}
              onClear={() => setPayments([])}
            />
            <FilterDropdown
              label="Category"
              icon="fa-layer-group"
              options={CATEGORY_OPTIONS}
              selected={categories}
              onSelect={toggleFilter(setCategories)}
              onClear={() => setCategories([])}
            />
            <SortDropdown value={sortBy} onChange={setSortBy} />
          </div>
        </div>

        {/* Active filter chips + clear */}
        {totalActive > 0 && (
          <div className="ev-active-chips">
            {activeCommunity !== "all" && (
              <span className="ev-active-chip">
                {COMMUNITIES.find((c) => c.id === activeCommunity)?.label}
                <button onClick={() => setActiveCommunity("all")}>
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            )}
            {[...teamSizes, ...payments, ...categories].map((v) => (
              <span key={v} className="ev-active-chip">
                {v}
                <button
                  onClick={() => {
                    setTeamSizes((p) => p.filter((x) => x !== v));
                    setPayments((p) => p.filter((x) => x !== v));
                    setCategories((p) => p.filter((x) => x !== v));
                  }}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </span>
            ))}
            <button className="ev-clear-all" onClick={clearAll}>
              Clear all
            </button>
          </div>
        )}

        <p className="ev-results-count">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""} found{filtered.length > 15 ? " — showing 15" : ""}
        </p>
      </div>

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div className="ev-empty">
          <div className="ev-empty-icon">
            <i className="fa-regular fa-calendar-xmark" />
          </div>
          <h3 className="ev-empty-title">No events match your filters</h3>
          <p className="ev-empty-sub">Try adjusting your filters or search query.</p>
          <button className="ev-empty-btn" onClick={clearAll}>
            <i className="fa-solid fa-rotate-left" /> Reset Filters
          </button>
        </div>
      )}

      {/* ── All Events ── */}
      {filtered.length > 0 && (
        <section className="ev-section">
          <h2 className="ev-section-title">
            <i className="fa-solid fa-calendar-days ev-section-icon" />
            All Events
          </h2>
          <div className="ev-grid">
            {filtered.slice(0, 15).map((e) => (
              <EventCard
                key={e.id}
                event={e}
                onOpenDetail={(evt) => navigate(`/events/${evt.id}`)}
                onRegister={setRegisterEvent}
              />
            ))}
          </div>
        </section>
      )}

      {/* Registration Confirmation Modal */}
      <EventRegisterModal
        event={registerEvent}
        onClose={() => setRegisterEvent(null)}
        onConfirm={handleRegisterConfirm}
      />
    </div>
  );
}

export default EventsPage;