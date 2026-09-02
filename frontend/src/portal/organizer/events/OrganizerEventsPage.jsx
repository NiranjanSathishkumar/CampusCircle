import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  CalendarCheck,
  ChartBar,
  QrCode,
  PencilSimple,
  CaretRight,
  MagnifyingGlass,
  SquaresFour,
  Table,
  ListDashes,
  CalendarBlank,
  MapPin,
  UsersThree,
  Ticket,
  Clock,
  ArrowUpRight,
  Sparkle,
  CheckCircle,
  Warning,
  Funnel,
  ShareNetwork,
  Copy,
  Check,
  X,
  Buildings,
  User,
  SlidersHorizontal,
  CurrencyInr,
  CircleNotch,
  Trash,
} from '@phosphor-icons/react';
import { listCommunityEvents, deleteEvent } from './events.api';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { formatCount } from '@/shared/utils/formatters';
import StatusPill from '@/layouts/portal/components/StatusPill';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-events.css';

/**
 * Maps a backend Event doc to the shape this page's cards/list/table render.
 * `waitlistCount` has no backend source yet (would need a per-event
 * registrations query the list endpoint doesn't do) — left at 0 rather than
 * fabricated; the roster tab (Phase 3) is where the real count will live.
 */
function mapEvent(event) {
  const eventDate = new Date(event.eventDate);
  const isPast = eventDate.getTime() < Date.now();

  let status = 'published';
  if (event.status === 'draft') status = 'draft';
  else if (isPast) status = 'completed';

  return {
    id: event._id,
    title: event.title,
    category: event.category,
    venue: event.venue,
    tags: event.tags || [],
    imageUrl: event.bannerImage?.url,
    eventDate: event.eventDate,
    dateFormatted: eventDate.toLocaleString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    }),
    teamFormat: event.registrationType === 'team'
      ? `${event.teamSize?.min}–${event.teamSize?.max} members`
      : 'Solo',
    payment: event.price === 0 ? 'Free' : 'Paid',
    priceAmount: event.price,
    capacity: event.capacity,
    registeredCount: event.confirmedRegistrationIds?.length || 0,
    waitlistCount: 0,
    status,
    createdOn: event.createdAt,
  };
}

/* Category Metadata & Icons */
const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: '✦', color: '#0F172A' },
  { id: 'Workshop', label: 'Workshop', icon: '🛠️', color: '#1A3A2A' },
  { id: 'Competition', label: 'Competition', icon: '⚡', color: '#7C2D12' },
  { id: 'Seminar', label: 'Seminar', icon: '🎙️', color: '#1E3A5F' },
  { id: 'Cultural', label: 'Cultural', icon: '🎨', color: '#7E1D5F' },
  { id: 'Sports', label: 'Sports', icon: '🏆', color: '#14532D' },
  { id: 'Tech Talk', label: 'Tech Talk', icon: '💬', color: '#0F766E' },
];

export default function OrganizerEventsPage() {
  const navigate = useNavigate();
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'GDSC SIES GST';
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'rsvps' | 'capacity' | 'created'
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!community?._id) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    listCommunityEvents(community._id)
      .then(({ events: list }) => {
        if (cancelled) return;
        // listCommunityEvents returns every event the organizer owns,
        // deleted ones included (isActive: false) — this page has no
        // archived view, so a deleted event simply isn't shown here at all.
        setEvents(list.filter((e) => e.isActive).map(mapEvent));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.message || 'Failed to load events');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [community?._id]);

  // URL search params state sync
  const viewMode = searchParams.get('view') || 'cards'; // 'cards' | 'list' | 'table'
  const setViewMode = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'cards') next.delete('view');
    else next.set('view', val);
    setSearchParams(next, { replace: true });
  };

  const statusFilter = searchParams.get('status') || 'all';
  const setStatusFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('status');
    else next.set('status', val);
    setSearchParams(next, { replace: true });
  };

  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (val) => {
    const next = new URLSearchParams(searchParams);
    if (!val) next.delete('q');
    else next.set('q', val);
    setSearchParams(next, { replace: true });
  };

  // Toast Notification Trigger
  const triggerToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Computed metrics
  const counts = useMemo(
    () => ({
      all: events.length,
      published: events.filter((e) => e.status === 'published').length,
      draft: events.filter((e) => e.status === 'draft').length,
      completed: events.filter((e) => e.status === 'completed').length,
      totalRSVPs: events.reduce((sum, e) => sum + (e.registeredCount || 0), 0),
      totalCapacity: events.reduce((sum, e) => sum + (e.capacity || 0), 0),
      totalWaitlist: events.reduce((sum, e) => sum + (e.waitlistCount || 0), 0),
    }),
    [events]
  );

  const fillRate = useMemo(() => {
    if (!counts.totalCapacity) return 0;
    return Math.round((counts.totalRSVPs / counts.totalCapacity) * 100);
  }, [counts]);

  // Filtered & Sorted events list
  const filteredEvents = useMemo(() => {
    const list = events.filter((e) => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = e.title.toLowerCase().includes(q);
        const venueMatch = e.venue.toLowerCase().includes(q);
        const tagMatch = e.tags && e.tags.some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !venueMatch && !tagMatch) return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'rsvps') return (b.registeredCount || 0) - (a.registeredCount || 0);
      if (sortBy === 'capacity') return (b.capacity || 0) - (a.capacity || 0);
      if (sortBy === 'created') return new Date(b.createdOn || 0) - new Date(a.createdOn || 0);
      // default: soonest/date
      return new Date(a.eventDate || 0) - new Date(b.eventDate || 0);
    });
  }, [events, statusFilter, categoryFilter, searchQuery, sortBy]);

  // Copy shareable event link
  const handleCopyShareLink = (e, eventId, title) => {
    e.stopPropagation();
    const url = `${window.location.origin}/events/detail/${eventId}`;
    try {
      navigator.clipboard.writeText(url);
      triggerToast(`📋 Link for "${title}" copied to clipboard!`);
    } catch {
      triggerToast(`📋 Event link ready: ${url}`);
    }
  };

  // Delete (soft-delete via DELETE /:eventId — isActive: false). Registrants,
  // team members, and check-ins stay intact server-side; this page has no
  // archived view, so the event is dropped from local state outright rather
  // than relabeled — otherwise it sat right there in the list looking
  // untouched and deleting looked like it did nothing.
  const handleDeleteClick = (e, ev) => {
    e.stopPropagation();
    setDeleteTarget(ev);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteTarget.id);
      setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      triggerToast(`🗑️ "${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      triggerToast(err.message || 'Could not delete this event.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="org-page org-events-page">
      {/* ── Page Header & Primary Actions ── */}
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">
            <CalendarCheck size={14} className="inline mr-1 text-[#991B1B]" />
            Event Operations Center
          </p>
          <h1 className="org-page-title">Campus Events</h1>
          <p className="org-page-desc">
            Manage community listings, launch digital ticket QR scanners for venue door check-in, monitor real-time RSVP fill rates, and review student rosters.
          </p>
        </div>
        <div className="org-page-actions">
          <Link
            to="/organizer/events/org_ev_1/scan"
            className="org-btn org-btn-ghost shadow-xs"
            title="Launch Attendance Scanner"
          >
            <QrCode size={16} className="text-[#991B1B]" />
            <span>Scan Passes</span>
          </Link>

          <button
            className="org-btn org-btn-primary shadow-md shadow-[#991B1B]/20"
            onClick={() => navigate('/organizer/events/create')}
            title="Create a new event in the creation studio"
          >
            <Plus size={16} weight="bold" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* ── Interactive Command Metrics Strip ── */}
      <section className="org-events-metrics-strip" aria-label="Event statistics summary">
        {/* Metric 1: Total Events */}
        <button
          type="button"
          className={`org-events-metric-item text-left transition-all ${statusFilter === 'all' ? 'ring-2 ring-[#0F172A] bg-white rounded-lg p-2' : ''
            }`}
          onClick={() => setStatusFilter('all')}
          title="Filter by all events"
        >
          <div className="flex items-center justify-between">
            <span className="org-events-metric-label">Total Events</span>
            <span className="text-[10px] font-mono text-gray-400">All Time</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-events-metric-val">{counts.all}</span>
            <span className="text-[11px] font-mono text-gray-500">listings</span>
          </div>
        </button>

        {/* Metric 2: Published & RSVP Open */}
        <button
          type="button"
          className={`org-events-metric-item text-left transition-all ${statusFilter === 'published' ? 'ring-2 ring-emerald-600 bg-white rounded-lg p-2' : ''
            }`}
          onClick={() => setStatusFilter('published')}
          title="Filter by published events"
        >
          <div className="flex items-center justify-between">
            <span className="org-events-metric-label">RSVP Open</span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-events-metric-val text-[#1A3A2A]">{counts.published}</span>
            <span className="text-[11px] font-mono text-emerald-700">active events</span>
          </div>
        </button>

        {/* Metric 3: Total RSVPs Collected */}
        <div className="org-events-metric-item">
          <div className="flex items-center justify-between">
            <span className="org-events-metric-label">RSVPs Confirmed</span>
            <span className="text-[10px] font-mono text-[#991B1B] font-bold">
              {fillRate}% filled
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-events-metric-val text-[#991B1B]">
              {formatCount(counts.totalRSVPs)}
            </span>
            <span className="text-[11px] font-mono text-gray-500">
              / {formatCount(counts.totalCapacity)} seats
            </span>
          </div>
        </div>

        {/* Metric 4: Waitlist Demand */}
        <div className="org-events-metric-item">
          <div className="flex items-center justify-between">
            <span className="org-events-metric-label">Waitlist Queue</span>
            <span className="text-[10px] font-mono text-amber-700 font-bold">Over Capacity</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="org-events-metric-val text-amber-800">
              {counts.totalWaitlist}
            </span>
            <span className="text-[11px] font-mono text-amber-700">students queued</span>
          </div>
        </div>
      </section>

      {/* ── Category Quick-Filter Pills Strip ── */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isSelected = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${isSelected
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700 hover:border-gray-400 hover:bg-white'
                }`}
              onClick={() => setCategoryFilter(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar: Search, Status Tabs, Sort & View Mode Switcher ── */}
      <div className="org-events-toolbar">
        {/* Search Input */}
        <div className="org-events-search">
          <MagnifyingGlass size={15} className="org-events-search-icon" />
          <input
            type="text"
            placeholder="Search events by title, venue, or #tag…"
            aria-label="Search events by title, venue, or tag"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="org-events-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-gray-500" />
          <select
            className="org-form-select !h-[38px] !text-xs !rounded-full !py-1 !pl-3 !pr-7 !bg-[#FAF8F5]"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort events by"
          >
            <option value="date">Sort: Upcoming Date</option>
            <option value="rsvps">Sort: Most RSVPs</option>
            <option value="capacity">Sort: Max Capacity</option>
            <option value="created">Sort: Recently Created</option>
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="org-posts-status-tabs">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'published', label: 'Published', count: counts.published },
            { id: 'draft', label: 'Drafts', count: counts.draft },
            { id: 'completed', label: 'Completed', count: counts.completed },
          ].map((t) => (
            <button
              key={t.id}
              className={`org-tab-btn ${statusFilter === t.id ? 'active' : ''}`}
              aria-pressed={statusFilter === t.id}
              onClick={() => setStatusFilter(t.id)}
            >
              {t.label} <span className="org-tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* View Mode Switcher (Cards vs List vs Table) */}
        <div className="org-view-mode-toggle ml-auto" role="group" aria-label="View mode">
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
            aria-pressed={viewMode === 'cards'}
            onClick={() => setViewMode('cards')}
            title="Poster Showcase Cards View"
          >
            <SquaresFour size={14} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            title="Horizontal List Rows View"
          >
            <ListDashes size={14} />
            <span>List</span>
          </button>
          <button
            type="button"
            className={`org-view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            aria-pressed={viewMode === 'table'}
            onClick={() => setViewMode('table')}
            title="Data Table View"
          >
            <Table size={14} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* ── Content Views ── */}
      {loadError && (
        <p className="adm-form-error" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Warning size={14} /> {loadError}
        </p>
      )}

      {loading ? (
        <EmptyState icon={CircleNotch} title="Loading events…" desc="Fetching your community's event listings." />
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No events matching criteria"
          desc="Try adjusting your keyword search or category filter to discover existing event listings."
          action={
            <div className="flex items-center gap-2">
              <button
                className="org-btn org-btn-ghost"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('all');
                }}
              >
                Clear Filters
              </button>
              <button
                className="org-btn org-btn-primary"
                onClick={() => navigate('/organizer/events/create')}
              >
                <Plus size={15} weight="bold" /> Create Event
              </button>
            </div>
          }
        />
      ) : viewMode === 'cards' ? (
        /* ─────────────────────────────────────────────────────────────
           VIEW MODE 1: REDESIGNED POSTER CARDS GRID
           ───────────────────────────────────────────────────────────── */
        <div className="org-event-cards-grid">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((ev) => {
              const registered = ev.registeredCount || 0;
              const cap = ev.capacity || 50;
              const pct = Math.min(Math.round((registered / cap) * 100), 100);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.22 }}
                  className="org-event-poster-card group"
                  key={ev.id}
                  onClick={() => navigate(`/organizer/events/${ev.id}`)}
                >
                  {/* Top Cover Artwork Banner */}
                  <div className="org-poster-art-banner relative h-36 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={ev.imageUrl || 'https://picsum.photos/seed/hackcampus-dark-code/900/500'}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/seed/hackcampus-dark-code/900/500';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

                    {/* Top Overlay Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20 font-bold uppercase tracking-wider">
                        {ev.category || 'Workshop'}
                      </span>
                      <StatusPill status={ev.status} />
                    </div>

                    {/* Bottom Overlay Badges */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 text-white">
                      <span className="text-[10px] font-mono bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-white flex items-center gap-1">
                        <UsersThree size={11} />
                        {ev.teamFormat || 'Solo Entry'}
                      </span>
                      <span className="bg-[#991B1B] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                        {ev.payment === 'Free' ? 'FREE RSVP' : `₹${ev.priceAmount}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="org-poster-body">
                    <div className="flex items-center gap-1 text-[11px] font-mono text-[#1A3A2A] font-bold mb-1">
                      <span>⚡</span>
                      <span>{communityName}</span>
                    </div>

                    <h3 className="org-poster-title-btn line-clamp-2 mb-2">
                      {ev.title}
                    </h3>

                    {/* Date & Venue Metadata */}
                    <div className="space-y-1.5 mb-3.5 text-xs text-gray-600 font-['Plus_Jakarta_Sans']">
                      <div className="flex items-center gap-2">
                        <CalendarBlank size={14} className="text-[#991B1B] flex-shrink-0" />
                        <span className="font-mono text-gray-800 font-medium truncate">
                          {ev.dateFormatted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#0D9488] flex-shrink-0" />
                        <span className="text-gray-700 truncate">{ev.venue}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {ev.tags && ev.tags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mb-3">
                        {ev.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono bg-white border border-[#D8D2C4] text-gray-600 px-1.5 py-0.2 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Capacity Fill Gauge Box */}
                    <div className="org-poster-capacity-box">
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-gray-500">Live RSVP Fill</span>
                        <span className="font-bold text-[#0F172A]">
                          {formatCount(registered)} / {formatCount(cap)} ({pct}%)
                        </span>
                      </div>
                      <div className="org-capacity-track">
                        <div
                          className="org-capacity-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: pct >= 90 ? '#991B1B' : pct >= 70 ? '#B45309' : '#0D9488',
                          }}
                        />
                      </div>
                      {ev.waitlistCount > 0 && (
                        <span className="text-[10px] font-mono text-amber-800 font-bold mt-1 flex items-center gap-1">
                          <Warning size={11} /> +{ev.waitlistCount} students on waitlist
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="org-poster-footer" onClick={(e) => e.stopPropagation()}>
                    <Link
                      to={`/organizer/events/${ev.id}/scan`}
                      className="org-btn org-btn-ghost org-btn-sm !py-1 !px-2.5 !text-xs font-bold text-[#991B1B]"
                      title="Launch Ticket Scanner"
                    >
                      <QrCode size={14} />
                      <span>Scan Passes</span>
                    </Link>

                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        type="button"
                        className="org-icon-btn"
                        onClick={(e) => handleCopyShareLink(e, ev.id, ev.title)}
                        title="Copy student link"
                        aria-label="Copy student link"
                      >
                        <ShareNetwork size={14} />
                      </button>

                      <Link
                        to={`/organizer/analytics/${ev.id}`}
                        className="org-icon-btn"
                        title="View Analytics"
                        aria-label="View Analytics"
                      >
                        <ChartBar size={14} />
                      </Link>

                      <Link
                        to={`/organizer/events/${ev.id}/edit`}
                        className="org-icon-btn text-[#991B1B]"
                        title="Edit in Studio"
                        aria-label="Edit in Studio"
                      >
                        <PencilSimple size={14} />
                      </Link>

                      <Link
                        to={`/organizer/events/${ev.id}`}
                        className="org-icon-btn text-gray-800"
                        title="Open Event Hub & Roster"
                        aria-label="Open Event Hub & Roster"
                      >
                        <CaretRight size={14} />
                      </Link>

                      <button
                        type="button"
                        className="org-icon-btn text-[#991B1B]"
                        onClick={(e) => handleDeleteClick(e, ev)}
                        title="Delete Event"
                        aria-label="Delete Event"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : viewMode === 'list' ? (
        /* ─────────────────────────────────────────────────────────────
           VIEW MODE 2: EXPANDED HORIZONTAL ROW LIST CARDS
           ───────────────────────────────────────────────────────────── */
        <div className="space-y-3">
          {filteredEvents.map((ev) => {
            const registered = ev.registeredCount || 0;
            const cap = ev.capacity || 50;
            const pct = Math.min(Math.round((registered / cap) * 100), 100);

            return (
              <div
                key={ev.id}
                className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-4 hover:border-[#0F172A] hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => navigate(`/organizer/events/${ev.id}`)}
              >
                {/* Left: Thumbnail + Title & Metadata */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800 relative">
                    <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                      {ev.category}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <StatusPill status={ev.status} />
                      <span className="text-xs font-mono text-gray-500">
                        {ev.teamFormat || 'Solo Entry'}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#991B1B]">
                        {ev.payment === 'Free' ? 'Free' : `₹${ev.priceAmount}`}
                      </span>
                    </div>

                    <h3 className="font-['Space_Grotesk'] font-bold text-sm text-[#0F172A] hover:text-[#991B1B] truncate">
                      {ev.title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1 font-mono flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarBlank size={13} className="text-[#991B1B]" />
                        {ev.dateFormatted}
                      </span>
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={13} className="text-[#0D9488]" />
                        {ev.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Capacity Fill Bar */}
                <div className="w-full md:w-48 flex-shrink-0">
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-bold text-[#0F172A]">
                      {registered} / {cap} ({pct}%)
                    </span>
                  </div>
                  <div className="org-capacity-track">
                    <div
                      className="org-capacity-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 90 ? '#991B1B' : pct >= 70 ? '#B45309' : '#0D9488',
                      }}
                    />
                  </div>
                  {ev.waitlistCount > 0 && (
                    <span className="text-[10px] font-mono text-amber-800 block mt-0.5">
                      +{ev.waitlistCount} waitlisted
                    </span>
                  )}
                </div>

                {/* Right: Quick Actions */}
                <div
                  className="flex items-center gap-1.5 flex-shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#E6E1D5]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    to={`/organizer/events/${ev.id}/scan`}
                    className="org-btn org-btn-ghost org-btn-sm text-xs text-[#991B1B]"
                    title="Scan Passes"
                  >
                    <QrCode size={14} />
                    <span>Scan</span>
                  </Link>

                  <Link
                    to={`/organizer/events/${ev.id}`}
                    className="org-btn org-btn-primary org-btn-sm text-xs"
                    title="Manage Roster & Details"
                  >
                    <span>Manage Hub</span>
                    <CaretRight size={12} />
                  </Link>

                  <button
                    type="button"
                    className="org-icon-btn text-[#991B1B]"
                    onClick={(e) => handleDeleteClick(e, ev)}
                    title="Delete Event"
                    aria-label="Delete Event"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           VIEW MODE 3: OPERATIONAL DATA TABLE
           ───────────────────────────────────────────────────────────── */
        <div className="org-card shadow-sm">
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th scope="col">Event Details</th>
                  <th scope="col">Category</th>
                  <th scope="col">Schedule &amp; Venue</th>
                  <th scope="col">RSVP Capacity</th>
                  <th scope="col">Pricing</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => {
                  const registered = ev.registeredCount || 0;
                  const cap = ev.capacity || 50;
                  const pct = Math.min((registered / cap) * 100, 100);

                  return (
                    <tr key={ev.id} className="hover:bg-amber-50/20">
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden flex-shrink-0">
                            <img src={ev.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <Link to={`/organizer/events/${ev.id}`} className="org-event-title-link">
                              {ev.title}
                            </Link>
                            <span className="text-[10px] font-mono text-gray-500 block">
                              {ev.teamFormat || 'Solo Entry'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="org-badge text-[10px] font-mono">{ev.category}</span>
                      </td>
                      <td className="org-table-muted font-mono text-xs whitespace-nowrap">
                        <div>{ev.dateFormatted}</div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[180px]">{ev.venue}</div>
                      </td>
                      <td style={{ minWidth: 150 }}>
                        <div className="org-events-capacity">
                          <div className="org-capacity-track flex-1">
                            <div
                              className="org-capacity-fill"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: pct >= 90 ? '#991B1B' : pct >= 70 ? '#B45309' : '#0D9488',
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs whitespace-nowrap font-bold">
                            {formatCount(registered)}/{formatCount(cap)}
                          </span>
                        </div>
                        {ev.waitlistCount > 0 && (
                          <div className="text-[10px] font-mono text-amber-700">
                            +{ev.waitlistCount} waitlisted
                          </div>
                        )}
                      </td>
                      <td>
                        {ev.payment === 'Free' ? (
                          <span className="org-badge font-mono font-bold text-emerald-700 bg-emerald-50">Free</span>
                        ) : (
                          <span className="org-badge font-mono font-bold text-[#991B1B] bg-red-50">₹{ev.priceAmount}</span>
                        )}
                      </td>
                      <td>
                        <StatusPill status={ev.status} />
                      </td>
                      <td className="text-right">
                        <div className="org-events-row-actions justify-end">
                          <Link
                            to={`/organizer/events/${ev.id}/scan`}
                            className="org-icon-btn text-[#991B1B]"
                            title="Scan Passes"
                          >
                            <QrCode size={14} />
                          </Link>
                          <Link
                            to={`/organizer/analytics/${ev.id}`}
                            className="org-icon-btn"
                            title="Analytics"
                          >
                            <ChartBar size={14} />
                          </Link>
                          <Link
                            to={`/organizer/events/${ev.id}/edit`}
                            className="org-icon-btn"
                            title="Edit in Studio"
                          >
                            <PencilSimple size={14} />
                          </Link>
                          <Link
                            to={`/organizer/events/${ev.id}`}
                            className="org-icon-btn text-gray-800"
                            title="Open Hub"
                          >
                            <CaretRight size={14} />
                          </Link>
                          <button
                            type="button"
                            className="org-icon-btn text-[#991B1B]"
                            onClick={(e) => handleDeleteClick(e, ev)}
                            title="Delete Event"
                            aria-label="Delete Event"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Toast Notification Banner ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-2 text-xs font-mono"
          >
            <CheckCircle size={16} className="text-emerald-400" weight="fill" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="org-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="org-modal"
              style={{ maxWidth: 440 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-event-title"
            >
              <div className="org-modal-header">
                <div className="flex items-center gap-2 text-[#991B1B]">
                  <Trash size={18} weight="bold" />
                  <h2 className="org-modal-title" id="delete-event-title">Delete This Event?</h2>
                </div>
                <button className="org-icon-btn" onClick={() => !deleting && setDeleteTarget(null)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="org-modal-body">
                <p className="text-xs text-gray-700 leading-relaxed font-['Plus_Jakarta_Sans']">
                  Delete <strong>"{deleteTarget.title}"</strong>? It will stop showing up to students and disappear
                  from this list immediately. Existing registrations, team rosters, and check-in records are kept —
                  this can't be undone from the events hub.
                </p>
              </div>
              <div className="org-modal-footer">
                <button type="button" className="org-btn org-btn-ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  Cancel
                </button>
                <button type="button" className="org-btn org-btn-danger-solid" onClick={handleConfirmDelete} disabled={deleting}>
                  {deleting ? <CircleNotch size={15} className="animate-spin" /> : <Trash size={15} />}
                  <span>{deleting ? 'Deleting…' : 'Delete Event'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
