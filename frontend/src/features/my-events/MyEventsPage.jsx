/**
 * MyEventsPage.jsx — CampusCircle Digital Passbook & Registration Management
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (labels)
 * Dials: DESIGN_VARIANCE:6 / MOTION_INTENSITY:5 / VISUAL_DENSITY:6
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import {
  Ticket,
  MagnifyingGlass,
  X,
  Calendar,
  Clock,
  Ticket as TicketIcon,
  Compass,
  Warning,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import PageHubHeader from '@/shared/components/PageHubHeader';
import ViewToggle from '@/shared/components/ViewToggle';
import { useViewMode } from '@/shared/hooks/useViewMode';
import { useViewTransition } from '@/shared/hooks/useViewTransition';
import { computeCountdownStatus, detectTimeConflicts } from '@/features/events/eventsDateUtils';
import { cancelRegistration, listMyBookmarks } from '@/features/events/events.api';
import { ApiError } from '@/shared/api/httpClient';
import './my-events.css';
import CancellationModal from '@/features/my-events/components/CancellationModal';
import DigitalTicketModal from '@/features/my-events/components/DigitalTicketModal';
import ManageTeamModal from '@/features/my-events/components/ManageTeamModal';
import MyEventsLedgerRow from '@/features/my-events/components/MyEventsLedgerRow';
import RegisteredEventCard from '@/features/my-events/components/RegisteredEventCard';
import SkeletonCard from '@/features/my-events/components/MyEventsSkeletonCard';
import TeamInvitesPanel from '@/features/my-events/components/TeamInvitesPanel';
import { ToastContainer, useToasts } from '@/features/my-events/components/MyEventsToasts';
import { buildRegisteredEvents } from '@/features/my-events/myEventsBuilder';

/* ─────────────────────────────────────────────────────────────
   MAIN MY EVENTS PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function MyEventsPage() {
  const { user, isLoggedIn, initializing } = useAuth();

  /* ── Registered events, fetched from the real backend ── */
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadEvents = useCallback(async () => {
    if (!isLoggedIn) { setEvents([]); setLoading(false); return; }
    setLoading(true);
    setLoadError('');
    try {
      setEvents(await buildRegisteredEvents());
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load your registered events.');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'completed'

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogView, setCatalogView] = useViewMode('cc_view_myevents');
  const catalogRef = useRef(null);
  const switchCatalogView = useViewTransition(catalogRef, catalogView, '.myevents-card, .cc-ledger-row');

  /* ── Modal states ── */
  const [ticketEvent, setTicketEvent] = useState(null);
  const [cancelEvent, setCancelEvent] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [manageTeamEvent, setManageTeamEvent] = useState(null);

  /* ── Saved-events count, from the real bookmarks list — the Events Hub
       owns bookmarking itself; this page only displays the total. ── */
  const [savedCount, setSavedCount] = useState(0);
  useEffect(() => {
    if (!isLoggedIn) return;
    listMyBookmarks({ limit: 1 }).then(({ total }) => setSavedCount(total)).catch(() => {});
  }, [isLoggedIn]);

  /* ── Toast system ── */
  const { toasts, addToast } = useToasts();

  /* ── Time conflicts calculation ── */
  const conflictSet = useMemo(() => detectTimeConflicts(events), [events]);

  /* ── Summary Statistics ── */
  const stats = useMemo(() => {
    let upcoming = 0;
    let completed = 0;
    events.forEach(e => {
      const st = computeCountdownStatus(e.rawDate);
      if (st.isPast) completed++;
      else upcoming++;
    });
    return {
      total: events.length,
      upcoming,
      completed,
      saved: savedCount,
    };
  }, [events, savedCount]);

  /* ── Filtered & Sorted Events List ── */
  const filteredEvents = useMemo(() => {
    let list = events.filter(e => {
      const status = computeCountdownStatus(e.rawDate);

      // Tab filtering
      if (activeTab === 'upcoming' && status.isPast) return false;
      if (activeTab === 'completed' && !status.isPast) return false;

      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(q);
        const matchesHost = e.hostName?.toLowerCase().includes(q);
        const matchesCategory = e.category?.toLowerCase().includes(q);
        const matchesVenue = e.venue?.toLowerCase().includes(q);
        const matchesTicket = e.ticketId?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesHost && !matchesCategory && !matchesVenue && !matchesTicket) return false;
      }

      return true;
    });

    // Sorting: Upcoming nearest first, Completed most recent first
    return list.sort((a, b) => {
      const stA = computeCountdownStatus(a.rawDate);
      const stB = computeCountdownStatus(b.rawDate);
      const dateA = new Date(a.rawDate);
      const dateB = new Date(b.rawDate);

      if (stA.isPast && stB.isPast) return dateB - dateA; // Completed: newest first
      return dateA - dateB; // Upcoming: nearest first
    });
  }, [events, activeTab, searchQuery]);

  /* ── Handlers ── */
  const handleConfirmCancel = useCallback(async () => {
    if (!cancelEvent || cancelling) return;
    setCancelling(true);
    try {
      await cancelRegistration(cancelEvent.registrationId);
      addToast('Registration cancelled. Reserved seat released.');
      setCancelEvent(null);
      await loadEvents();
    } catch (err) {
      addToast(err instanceof ApiError ? err.message : 'Could not cancel this registration.');
    } finally {
      setCancelling(false);
    }
  }, [cancelEvent, cancelling, addToast, loadEvents]);

  const handleDownloadTicket = useCallback((eventObj) => {
    const content = `CAMPUSCIRCLE DIGITAL EVENT TICKET\n------------------------------------\nTicket ID: ${eventObj.ticketId}\nEvent: ${eventObj.title}\nCategory: ${eventObj.category}\nHost: ${eventObj.hostName}\nAttendee: ${user?.name || ''}\nDate & Time: ${eventObj.dateFormatted} at ${eventObj.startTime}\nVenue: ${eventObj.venue}\nPayment: ${eventObj.payment}\n------------------------------------\nValid for entry at SIES GST Campus.`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ticket_${eventObj.ticketId}.txt`;
    // The anchor has to be in the document for Firefox to honour the click,
    // and the object URL has to outlive the click — revoking it in the same
    // tick raced the browser's read of the blob and produced empty downloads.
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);

    addToast('Ticket downloaded for offline check-in 🎟️');
  }, [user, addToast]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA]">
        <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />

      <div className="myevents-page" style={{ paddingTop: 64 }}>
        <div className="myevents-inner">

          {/* ── Page Header ── */}
          <PageHubHeader
            eyebrow="SIES GST Campus · Passbook"
            title="Your Registered Events"
            description="Manage your personal event passes, track upcoming dates, access official digital tickets, and review your campus event history."
          />

          {/* ── Pending Team Invites — accept or decline before they land in My Events ── */}
          <TeamInvitesPanel onAccepted={loadEvents} onToast={addToast} />

          {/* ── Enrollment Summary Metrics Grid ── */}
          <div className="myevents-stats-grid">
            {[
              { tab: 'all', val: stats.total, label: 'Total Enrolled', color: undefined },
              { tab: 'upcoming', val: stats.upcoming, label: 'Upcoming', color: '#1A3A2A' },
              { tab: 'completed', val: stats.completed, label: 'Completed', color: '#6B7280' },
              { tab: null, val: stats.saved, label: 'Saved', color: '#991B1B' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                className="myevents-stat-card"
                onClick={s.tab ? () => setActiveTab(s.tab) : undefined}
                style={{ cursor: s.tab ? 'pointer' : 'default' }}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileTap={s.tab ? { scale: 0.97 } : undefined}
              >
                <span className="myevents-stat-val" style={{ color: s.color }}>{loading ? '—' : s.val}</span>
                <span className="myevents-stat-lbl">{s.label}</span>
              </motion.div>
            ))}
          </div>

          {/* ── Status Tabs Rail & Toolbar ── */}
          <div className="myevents-tabs-row">
            <div className="myevents-tab-rail">
              {[
                { id: 'all', label: 'All Events', count: stats.total },
                { id: 'upcoming', label: 'Upcoming', count: stats.upcoming },
                { id: 'completed', label: 'Completed', count: stats.completed },
              ].map(tab => (
                <motion.button
                  key={tab.id}
                  className={`myevents-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.96 }}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="myEventsTabPill"
                      className="myevents-tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span>{tab.label}</span>
                  <span className="myevents-tab-badge">{tab.count}</span>
                </motion.button>
              ))}
            </div>

            {/* Search Input */}
            <div className="events-search-wrap" style={{ flex: '0 1 280px' }}>
              <MagnifyingGlass size={15} className="events-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="events-search-input"
                placeholder="Search registered events, hosts, ticket ID…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search registered events"
              />
              {searchQuery && (
                <button className="events-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={12} />
                </button>
              )}
            </div>

            <ViewToggle view={catalogView} onChange={(v) => switchCatalogView(setCatalogView, v)} />
          </div>

          {/* ── Registered Events Catalog Grid ── */}
          <div ref={catalogRef}>
          {loading ? (
            <div className="myevents-catalog" aria-busy="true" aria-label="Loading registered events">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : loadError ? (
            <div className="myevents-empty-box" role="alert">
              <div className="profile-empty-icon" aria-hidden="true">
                <Warning size={24} />
              </div>
              <h3 className="profile-empty-title">Couldn't load your events</h3>
              <p className="profile-empty-desc">{loadError}</p>
              <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }} onClick={loadEvents}>
                Try Again
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Empty States */
            searchQuery ? (
              <div className="myevents-empty-box" role="status">
                <div className="profile-empty-icon" aria-hidden="true">
                  <MagnifyingGlass size={24} />
                </div>
                <h3 className="profile-empty-title">No matching events found</h3>
                <p className="profile-empty-desc">No registered events match "{searchQuery}". Try adjusting your search term.</p>
                <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }} onClick={() => setSearchQuery('')}>
                  Clear Search
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="myevents-empty-box" role="status">
                <div className="profile-empty-icon" aria-hidden="true">
                  <Compass size={24} />
                </div>
                <h3 className="profile-empty-title">You haven't enrolled in any events yet</h3>
                <p className="profile-empty-desc">Discover workshops, hackathons, and cultural showcases happening across campus and reserve your digital pass.</p>
                <Link to="/events" className="btn-primary" style={{ textDecoration: 'none', marginTop: 4 }}>
                  Explore Events
                </Link>
              </div>
            ) : activeTab === 'upcoming' ? (
              <div className="myevents-empty-box" role="status">
                <div className="profile-empty-icon" aria-hidden="true">
                  <Calendar size={24} />
                </div>
                <h3 className="profile-empty-title">No upcoming registered events</h3>
                <p className="profile-empty-desc">You have no upcoming event registrations scheduled. Browse upcoming events to join new activities.</p>
                <Link to="/events" className="btn-primary" style={{ textDecoration: 'none', marginTop: 4 }}>
                  Explore Events
                </Link>
              </div>
            ) : (
              <div className="myevents-empty-box" role="status">
                <div className="profile-empty-icon" aria-hidden="true">
                  <Clock size={24} />
                </div>
                <h3 className="profile-empty-title">No completed event history yet</h3>
                <p className="profile-empty-desc">Events you attend will appear here after they conclude.</p>
              </div>
            )
          ) : catalogView === 'list' ? (
            <div className="cc-ledger" role="list" aria-label="Registered events passbook">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, idx) => (
                  <MyEventsLedgerRow
                    key={event.id}
                    index={idx}
                    event={event}
                    hasTimeConflict={conflictSet.has(event.id)}
                    onViewTicket={setTicketEvent}
                    onCancel={setCancelEvent}
                    onManageTeam={setManageTeamEvent}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="myevents-catalog" role="list" aria-label="Registered events passbook">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map(event => (
                  <RegisteredEventCard
                    key={event.id}
                    event={event}
                    hasTimeConflict={conflictSet.has(event.id)}
                    onViewTicket={setTicketEvent}
                    onCancel={setCancelEvent}
                    onManageTeam={setManageTeamEvent}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          </div>

        </div>
      </div>

      {/* ── Modal 1: Digital Ticket Pass Modal ── */}
      <AnimatePresence>
        {ticketEvent && (
          <DigitalTicketModal
            event={ticketEvent}
            user={user}
            onClose={() => setTicketEvent(null)}
            onDownload={handleDownloadTicket}
          />
        )}
      </AnimatePresence>

      {/* ── Modal 2: Registration Cancellation Modal ── */}
      <AnimatePresence>
        {cancelEvent && (
          <CancellationModal
            event={cancelEvent}
            onConfirm={handleConfirmCancel}
            confirming={cancelling}
            onClose={() => setCancelEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Modal 3: Team Roster Management (invite/remove, pending vs. accepted) ── */}
      <AnimatePresence>
        {manageTeamEvent && (
          <ManageTeamModal
            event={manageTeamEvent}
            currentUserId={user?._id}
            onClose={() => setManageTeamEvent(null)}
            onChanged={loadEvents}
          />
        )}
      </AnimatePresence>

      {/* ── Toast Container ── */}
      <ToastContainer toasts={toasts} />
      <Footer compact />
    </>
  );
}
