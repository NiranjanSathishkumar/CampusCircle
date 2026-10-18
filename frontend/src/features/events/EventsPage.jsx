/**
 * EventsPage.jsx — CampusCircle student events hub
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (labels)
 * Dials: DESIGN_VARIANCE:6 / MOTION_INTENSITY:5 / VISUAL_DENSITY:6
 *
 * Backed by the real /api/events surface (events.api.js) — no mock data or
 * localStorage. The backend only filters by tag/search/pagination server-side
 * (see events.validators.js's eventsQuery), so a generous page is fetched
 * once and the community rail / category / payment / team-size filters and
 * sort all run client-side over it, same as the richer UI always assumed.
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import EventDetailPanel from '@/features/events/components/EventDetailPanel';
import {
  MagnifyingGlass,
  X,
  Funnel,
  Warning,
  GraduationCap,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import PageHubHeader from '@/shared/components/PageHubHeader';
import ViewToggle from '@/shared/components/ViewToggle';
import { useViewMode } from '@/shared/hooks/useViewMode';
import { useViewTransition } from '@/shared/hooks/useViewTransition';
import {
  listEvents as apiListEvents,
  listMyRegistrations,
  listMyBookmarks,
  bookmarkEvent,
  unbookmarkEvent,
  trackEventView,
} from '@/features/events/events.api';
import { mapEvent, buildRegistrationIndex } from '@/features/events/eventsMapper';
import { ApiError } from '@/shared/api/httpClient';
import './events.css';
import { GSAPDigitRoll } from '@/features/events/components/EventMotion';
import EventCard from '@/features/events/components/EventCard';
import EventLedgerRow from '@/features/events/components/EventLedgerRow';
import FeaturedEventBanner from '@/features/events/components/FeaturedEventBanner';
import FilterPanel from '@/features/events/components/EventsFilterPanel';
import RegistrationDialog from '@/features/events/components/EventsRegistrationDialog';
import SkeletonCard from '@/features/events/components/EventsSkeletonCard';
import { EmptyNoEvents, EmptyNoResults } from '@/features/events/components/EventsEmptyStates';
import { PAYMENT_OPTIONS, SORT_OPTIONS, TEAM_SIZE_OPTIONS } from '@/features/events/eventsConstants';
import { ToastContainer, useToasts } from '@/features/events/components/EventsToasts';
import { matchesSearch, matchesTeamSize, sortEvents } from '@/features/events/eventsFilters';
import { findScheduleConflict } from '@/features/events/eventsDateUtils';

/* ─────────────────────────────────────────────────────────────
   MAIN EVENTS PAGE
   ───────────────────────────────────────────────────────────── */

export default function EventsPage({ onNavigateToLogin }) {
  const { eventId: urlEventId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user, initializing } = useAuth();

  // The route renders this page without props, so onNavigateToLogin is
  // normally undefined — falling back to the real /login route is what keeps
  // logged-out Register/Save clicks from silently doing nothing. The prop is
  // still honoured when a parent does supply one.
  const goToLogin = useCallback(() => {
    if (onNavigateToLogin) onNavigateToLogin();
    else navigate('/login');
  }, [onNavigateToLogin, navigate]);

  /* ── View state ── */
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [selectedEventId, setSelectedEventId] = useState(null);

  /* ── Data ── */
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  /* ── This student's registrations/bookmarks (the real per-student state
       the backend tracks — a Map<eventId, registration> plus a Set of
       bookmarked event ids). Refetched after any mutation rather than kept
       in localStorage. ── */
  const [registrationIndex, setRegistrationIndex] = useState(new Map());
  const [savedIds, setSavedIds] = useState(new Set());

  const registeredIds = useMemo(() => new Set(registrationIndex.keys()), [registrationIndex]);
  const waitlistIds = useMemo(() => {
    const s = new Set();
    for (const [id, reg] of registrationIndex) if (reg.status === 'waitlisted') s.add(id);
    return s;
  }, [registrationIndex]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { events } = await apiListEvents({ limit: 100 });
      setEventsData(events.map(mapEvent));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMyState = useCallback(async () => {
    if (!isLoggedIn) {
      setRegistrationIndex(new Map());
      setSavedIds(new Set());
      return;
    }
    try {
      const [{ registrations }, { bookmarks }] = await Promise.all([
        listMyRegistrations({ limit: 100 }),
        listMyBookmarks({ limit: 100 }),
      ]);
      setRegistrationIndex(buildRegistrationIndex(registrations));
      setSavedIds(new Set(bookmarks.map((b) => String(b.event._id))));
    } catch {
      // Non-fatal — the catalog itself still renders; per-student badges
      // just won't reflect real state until the next successful load.
    }
  }, [isLoggedIn]);

  // Wait for AuthContext's silent-refresh-on-mount to settle before firing
  // either fetch: every route here requires a student session (see
  // events.routes.js's router.use(requireAuth)), so firing immediately on
  // mount raced the refresh on every full page load — guaranteed 401s in the
  // console, and (worse) a real bug: loadMyState's registrations/bookmarks
  // fetch could win that race and populate registeredIds/savedIds from a
  // request made before the refreshed token existed, which is what made the
  // "X registered · Y saved" header stat intermittently read wrong.
  useEffect(() => { if (!initializing) loadEvents(); }, [initializing, loadEvents]);
  useEffect(() => { if (!initializing) loadMyState(); }, [initializing, loadMyState]);

  /* ── Discovery state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCommunity, setActiveCommunity] = useState('all');
  const [filters, setFilters] = useState({ teamSizes: [], payments: [], categories: [] });
  const [sortBy, setSortBy] = useState('upcoming');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [catalogView, setCatalogView] = useViewMode('cc_view_events');
  const catalogRef = useRef(null);
  const switchCatalogView = useViewTransition(catalogRef, catalogView, '.event-card, .cc-ledger-row');

  /* ── Search Input Ref & Keyboard Shortcut ── */
  const searchInputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        const input = searchInputRef.current;
        if (!input) return;
        input.focus();

        const wrap = input.closest('.events-search-wrap') || input;
        gsap.fromTo(
          wrap,
          { boxShadow: '0 0 0 4px rgba(153, 27, 27, 0.45)', borderColor: '#991B1B' },
          {
            boxShadow: '0 0 0 0px rgba(153, 27, 27, 0)',
            borderColor: '#D8D2C4',
            duration: 0.75,
            ease: 'power2.out',
          }
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Dialog ── */
  const [pendingRegEventId, setPendingRegEventId] = useState(null);

  /* ── Toasts ── */
  const { toasts, addToast } = useToasts();

  /* ── Handle route parameter changes (/events/detail/:eventId) ── */
  useEffect(() => {
    if (urlEventId) {
      // Set it even when no event matches: the detail branch renders its own
      // "Event Not Found" state, which staying on 'list' made unreachable.
      setSelectedEventId(urlEventId);
      setView('detail');
      // Fire-and-forget engagement beacon for the organizer's analytics
      // funnel — never block/interrupt rendering on it.
      trackEventView(urlEventId).catch(() => {});
    } else {
      setView('list');
      setSelectedEventId(null);
    }
  }, [urlEventId]);

  /* ── Communities actually present among the loaded events, for the rail —
       derived from real data rather than a fixed mock list, since the
       backend has no separate "list all communities with events" endpoint
       and this page already has every event's populated community. ── */
  const eventCommunities = useMemo(() => {
    const byId = new Map();
    eventsData.forEach((ev) => {
      if (ev.community_id && !byId.has(ev.community_id)) {
        byId.set(ev.community_id, { id: ev.community_id, name: ev.hostName, logoUrl: ev.communityLogoUrl });
      }
    });
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [eventsData]);

  /* ── Active filter count ── */
  const activeFilterCount = filters.teamSizes.length + filters.payments.length + filters.categories.length;

  /* ── Filtered + sorted events ── */
  const filteredEvents = useMemo(() => {
    let result = eventsData.filter(ev => {
      if (activeCommunity !== 'all' && ev.community_id !== activeCommunity) return false;
      if (!matchesSearch(ev, searchQuery)) return false;
      if (filters.payments.length) {
        const payMatch = filters.payments.some(p =>
          p === 'free' ? ev.payment === 'Free' : ev.payment === 'Paid'
        );
        if (!payMatch) return false;
      }
      if (filters.categories.length && !filters.categories.includes(ev.category)) return false;
      if (!matchesTeamSize(ev, filters.teamSizes)) return false;
      return true;
    });
    return sortEvents(result, sortBy);
  }, [eventsData, activeCommunity, searchQuery, filters, sortBy]);

  /* ── Active filter chips for display ── */
  const activeChips = useMemo(() => {
    const chips = [];
    filters.teamSizes.forEach(id => {
      const opt = TEAM_SIZE_OPTIONS.find(o => o.id === id);
      if (opt) chips.push({ key: `ts-${id}`, label: opt.label, type: 'teamSizes', value: id });
    });
    filters.payments.forEach(id => {
      const opt = PAYMENT_OPTIONS.find(o => o.id === id);
      if (opt) chips.push({ key: `pay-${id}`, label: opt.label, type: 'payments', value: id });
    });
    filters.categories.forEach(cat => {
      chips.push({ key: `cat-${cat}`, label: cat, type: 'categories', value: cat });
    });
    return chips;
  }, [filters]);

  /* ── Handlers ── */

  const handleToggleFilter = useCallback((type, value) => {
    setFilters(f => {
      const arr = f[type];
      return {
        ...f,
        [type]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters({ teamSizes: [], payments: [], categories: [] });
    setSearchQuery('');
    setActiveCommunity('all');
  }, []);

  const handleRemoveChip = useCallback((chip) => {
    setFilters(f => ({ ...f, [chip.type]: f[chip.type].filter(v => v !== chip.value) }));
  }, []);

  const handleViewDetails = useCallback((eventId) => {
    navigate(`/events/detail/${eventId}`);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate('/events');
  }, [navigate]);

  const handleRegisterFromCard = useCallback((eventId) => {
    if (!isLoggedIn) { goToLogin(); return; }
    setPendingRegEventId(eventId);
  }, [isLoggedIn, goToLogin]);

  // Called once the dialog's own POST /register succeeds — refresh this
  // student's registration state from the server rather than guessing at
  // the result locally (waitlisted vs confirmed is the backend's call).
  const handleRegistrationSuccess = useCallback(() => {
    loadMyState();
    loadEvents();
  }, [loadMyState, loadEvents]);

  const handleToggleSave = useCallback(async (eventId) => {
    if (!isLoggedIn) { goToLogin(); return; }
    const wasSaved = savedIds.has(eventId);
    setSavedIds(ids => {
      const next = new Set(ids);
      if (wasSaved) next.delete(eventId); else next.add(eventId);
      return next;
    });
    try {
      if (wasSaved) {
        await unbookmarkEvent(eventId);
        addToast('Removed from saved events');
      } else {
        await bookmarkEvent(eventId);
        addToast('Event saved to your list');
      }
    } catch (err) {
      // Roll back the optimistic toggle on failure.
      setSavedIds(ids => {
        const next = new Set(ids);
        if (wasSaved) next.add(eventId); else next.delete(eventId);
        return next;
      });
      addToast(err instanceof ApiError ? err.message : 'Could not update saved events');
    }
  }, [isLoggedIn, goToLogin, savedIds, addToast]);

  const handleNavigateToLogin = useCallback(() => {
    addToast('Please log in to continue');
    goToLogin();
  }, [goToLogin, addToast]);

  /* ── Selected event object ── */
  const selectedEvent = useMemo(
    () => eventsData.find(e => e.id === selectedEventId) || null,
    [eventsData, selectedEventId]
  );

  // True only for the very first fetch (no data yet). A later background
  // refresh — e.g. handleRegistrationSuccess re-pulling the catalog after a
  // registration — also flips `loading` true, but shouldn't flash a
  // skeleton over a grid the student is already looking at (and mid a card
  // registration dialog stays open through it, same reasoning as the
  // detail view below).
  const isInitialLoad = loading && eventsData.length === 0;

  /* ── Featured event: the soonest upcoming event with the highest signup
       count — a reasonable "flagship" heuristic now that there's no
       mock-authored featured flag on real data. ── */
  const featuredEvent = useMemo(() => {
    if (!eventsData.length) return null;
    return [...eventsData].sort((a, b) => a.date - b.date || b.registered_count - a.registered_count)[0];
  }, [eventsData]);

  /* ─────────────────────────────────────────────────────────────
     DETAIL VIEW
     ───────────────────────────────────────────────────────────── */
  if (view === 'detail') {
    // Only the very first load (no data yet) earns a full-page skeleton.
    // handleRegistrationSuccess triggers a background loadEvents() refresh
    // after a successful registration to pick up the new seat count — with
    // a bare `if (loading)` here, that refresh's setLoading(true) replaced
    // this entire branch (EventDetailPanel, the open dialog, and the
    // registration success view still on screen inside it) with a loading
    // skeleton the instant the registration succeeded, unmounting
    // everything and wiping out the confirmation the student just earned
    // with no error and no visible outcome at all. Once selectedEvent
    // exists, a later refresh just updates it in place — same component
    // instance, dialog state untouched.
    if (loading && !selectedEvent) {
      return (
        <>
          <Navbar />
          <div style={{ paddingTop: 64 }}>
            <div className="events-detail-inner">
              <div className="events-catalog" aria-busy="true" aria-label="Loading event">
                <SkeletonCard />
              </div>
            </div>
          </div>
        </>
      );
    }

    if (!selectedEvent) {
      return (
        <>
          <Navbar />
          <div style={{ paddingTop: 64 }}>
            <div className="events-detail-inner">
              <div className="events-error-state" role="alert">
                <div className="events-empty-icon" aria-hidden="true">
                  <Warning size={26} />
                </div>
                <h2 className="events-error-title">Event Not Found</h2>
                <p className="events-error-desc">
                  The event you are looking for does not exist or has been removed.
                </p>
                <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }} onClick={handleBack}>
                  Back to Events
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 64 }}>
          <EventDetailPanel
            event={selectedEvent}
            leaderId={user?._id}
            registeredIds={registeredIds}
            savedIds={savedIds}
            waitlistIds={waitlistIds}
            registrationIndex={registrationIndex}
            onRegistrationSuccess={handleRegistrationSuccess}
            onToggleSave={handleToggleSave}
            onBack={handleBack}
            onNavigateToLogin={handleNavigateToLogin}
          />
        </div>
        <Footer compact />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     LIST / DISCOVERY VIEW
     ───────────────────────────────────────────────────────────── */
  return (
    <>
      <Navbar />

      <div className="events-page" style={{ paddingTop: 64 }}>
        <div className="events-page-inner">

          {/* ── Hub Header ── */}
          <PageHubHeader
            eyebrow="SIES GST Campus · Live Hub"
            title="Events Hub"
            description="Discover workshops, competitions, hackathons, and cultural showcases happening across campus communities."
            rightSlot={isLoggedIn && user ? (
              <div className="page-hub-stats-pill">
                <GraduationCap size={15} style={{ color: '#991B1B', flexShrink: 0 }} />
                <span>
                  <GSAPDigitRoll value={registeredIds.size} /> registered · <GSAPDigitRoll value={savedIds.size} /> saved
                </span>
              </div>
            ) : null}
          />

          {/* ── Community rail ── */}
          {eventCommunities.length > 0 && (
            <div className="events-community-rail-wrap" role="navigation" aria-label="Filter by community">
              <div className="events-community-rail" role="tablist" aria-label="Campus communities">
                {[{ id: 'all', name: 'All Events', icon: '✦', color: '#991B1B' }, ...eventCommunities].map(comm => {
                  const isActive = activeCommunity === comm.id;
                  return (
                    <motion.button
                      key={comm.id}
                      className={`events-community-btn ${isActive ? 'active' : ''}`}
                      style={{
                        '--community-color': '#991B1B',
                        '--community-bg': '#991B1B14',
                      }}
                      onClick={() => setActiveCommunity(comm.id)}
                      whileTap={{ scale: 0.95 }}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show ${comm.name} events`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="communityActivePill"
                          className="events-community-pill"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      {comm.logoUrl ? (
                        <img src={comm.logoUrl} alt="" className="events-community-icon" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <span className="events-community-icon" aria-hidden="true">{comm.icon || '✦'}</span>
                      )}
                      <span>{comm.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Search + Sort + Filter toolbar ── */}
          <div className="events-toolbar">
            {/* Search */}
            <div className="events-search-wrap" style={{ flex: '1', minWidth: '220px' }}>
              <MagnifyingGlass size={16} className="events-search-icon" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                className="events-search-input"
                placeholder="Search events, organizers, tags… (Press '/' to focus)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search events"
                id="events-search"
              />
              {searchQuery ? (
                <button
                  className="events-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              ) : (
                <span
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    color: '#9CA3AF',
                    background: '#D8D2C4',
                    padding: '0.125rem 0.375rem',
                    borderRadius: 3,
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                >
                  /
                </span>
              )}
            </div>

            {/* Sort */}
            <select
              className="events-sort-select"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort events"
              id="events-sort"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>

            {/* Filter toggle (mobile) */}
            <button
              className={`events-filter-toggle ${activeFilterCount > 0 ? 'active' : ''}`}
              onClick={() => setFilterPanelOpen(o => !o)}
              aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
              aria-expanded={filterPanelOpen}
              style={{ display: 'flex' }}
              id="events-filter-toggle"
            >
              <Funnel size={14} aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="events-filter-badge" aria-hidden="true">{activeFilterCount}</span>
              )}
            </button>

            {/* Count label */}
            <span className="events-count-label" role="status" aria-live="polite">
              {isInitialLoad ? '—' : `${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''}`}
            </span>

            {/* Grid / List view toggle */}
            <ViewToggle view={catalogView} onChange={(v) => switchCatalogView(setCatalogView, v)} />
          </div>

          {/* ── Active filter chips ── */}
          <AnimatePresence>
            {activeChips.length > 0 && (
              <motion.div
                className="events-filter-chips"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                role="group"
                aria-label="Active filters"
              >
                {activeChips.map(chip => (
                  <span key={chip.key} className="events-filter-chip">
                    {chip.label}
                    <button
                      className="events-filter-chip-remove"
                      onClick={() => handleRemoveChip(chip)}
                      aria-label={`Remove filter: ${chip.label}`}
                    >
                      <X size={9} />
                    </button>
                  </span>
                ))}
                <button className="events-clear-all-btn" onClick={handleClearAllFilters}>
                  Clear all
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main layout: sidebar filter + catalog ── */}
          <div className="events-layout">

            {/* Desktop sidebar filter — visible via CSS grid on lg+ */}
            <FilterPanel filters={filters} onToggleFilter={handleToggleFilter} onClearAll={handleClearAllFilters} />

            {/* Catalog column */}
            <div>
              {!isInitialLoad && !searchQuery && activeCommunity === 'all' && activeFilterCount === 0 && featuredEvent && (
                <FeaturedEventBanner
                  event={featuredEvent}
                  isRegistered={registeredIds.has(featuredEvent.id)}
                  isWaitlisted={waitlistIds.has(featuredEvent.id)}
                  onViewDetails={handleViewDetails}
                  onRegister={handleRegisterFromCard}
                  onNavigateToLogin={handleNavigateToLogin}
                  isLoggedIn={isLoggedIn}
                />
              )}

              <div ref={catalogRef}>
              {isInitialLoad ? (
                /* Skeleton */
                <div className="events-catalog" aria-busy="true" aria-label="Loading events">
                  {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
                </div>
              ) : loadError ? (
                <div className="events-error-state" role="alert">
                  <div className="events-empty-icon" aria-hidden="true">
                    <Warning size={26} />
                  </div>
                  <h2 className="events-error-title">Couldn't load events</h2>
                  <p className="events-error-desc">{loadError}</p>
                  <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }} onClick={loadEvents}>
                    Try Again
                  </button>
                </div>
              ) : filteredEvents.length === 0 ? (
                (searchQuery || activeFilterCount > 0 || activeCommunity !== 'all')
                  ? <EmptyNoResults onReset={handleClearAllFilters} />
                  : <EmptyNoEvents />
              ) : catalogView === 'list' ? (
                <div className="cc-ledger" role="list" aria-label="Event listings">
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event, idx) => (
                      <EventLedgerRow
                        key={event.id}
                        index={idx}
                        event={event}
                        isRegistered={registeredIds.has(event.id)}
                        isSaved={savedIds.has(event.id)}
                        isWaitlisted={waitlistIds.has(event.id)}
                        onViewDetails={handleViewDetails}
                        onRegister={handleRegisterFromCard}
                        onToggleSave={handleToggleSave}
                        onNavigateToLogin={handleNavigateToLogin}
                        isLoggedIn={isLoggedIn}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="events-catalog" role="list" aria-label="Event listings">
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event, idx) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, y: 22, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                        transition={{ type: 'spring', stiffness: 340, damping: 30, delay: Math.min(idx * 0.045, 0.32) }}
                        role="listitem"
                      >
                        <EventCard
                          event={event}
                          isRegistered={registeredIds.has(event.id)}
                          isSaved={savedIds.has(event.id)}
                          isWaitlisted={waitlistIds.has(event.id)}
                          onViewDetails={handleViewDetails}
                          onRegister={handleRegisterFromCard}
                          onToggleSave={handleToggleSave}
                          onNavigateToLogin={handleNavigateToLogin}
                          isLoggedIn={isLoggedIn}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile filter sheet ── */}
      <AnimatePresence>
        {filterPanelOpen && (
          <>
            <motion.div
              className="events-filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFilterPanelOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="events-filter-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Filter events"
            >
              <div className="events-filter-sheet-handle" aria-hidden="true" />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 1rem 0' }}>
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9375rem', color: '#0F172A' }}>
                  Filter Events
                </span>
                <button
                  onClick={() => setFilterPanelOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}
                  aria-label="Close filter panel"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterPanel filters={filters} onToggleFilter={handleToggleFilter} onClearAll={() => { handleClearAllFilters(); setFilterPanelOpen(false); }} />
              <div style={{ padding: '1rem 1rem calc(1rem + env(safe-area-inset-bottom))' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.875rem', padding: '0.6875rem' }}
                  onClick={() => setFilterPanelOpen(false)}
                >
                  Show {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Registration dialog (from card) ── */}
      <AnimatePresence>
        {pendingRegEventId && (() => {
          const pendingEvent = eventsData.find(e => e.id === pendingRegEventId);
          if (!pendingEvent) return null;
          const conflict = registeredIds.has(pendingRegEventId)
            ? null
            : findScheduleConflict(pendingRegEventId, pendingEvent.date, registrationIndex);
          return (
            <RegistrationDialog
              event={pendingEvent}
              leaderId={user?._id}
              conflictTitle={conflict?.eventTitle}
              onSuccess={handleRegistrationSuccess}
              onClose={() => setPendingRegEventId(null)}
            />
          );
        })()}
      </AnimatePresence>

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} />
      <Footer compact />
    </>
  );
}
