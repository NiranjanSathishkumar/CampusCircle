/**
 * OrganizerEventDetailPage.jsx — Organiser Event Hub.
 * Renders the real event: a read-only "what students see" showcase, the
 * registration form/waiver/questions editor, the registrations roster with
 * real QR check-in, and capacity/performance analytics.
 * Editing the event's own core details (title, dates, venue, banner, ...)
 * happens via the create-event wizard in edit mode, not inline here.
 */
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  CaretRight,
  CalendarBlank,
  MapPin,
  CurrencyInr,
  CheckCircle,
  PencilSimple,
  ChartBar,
  QrCode,
  UsersThree,
  Eye,
  FileText,
  RocketLaunch,
  FloppyDisk,
  Trash,
  CircleNotch,
  X,
} from '@phosphor-icons/react';
import { checkInEvent, deleteEvent, getEvent, listEventRegistrations, updateEvent } from '@/portal/organizer/events/events.api';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import StatusPill from '@/layouts/portal/components/StatusPill';
import EmptyState from '@/layouts/portal/components/EmptyState';
import OrganizerRegistrationFormBuilder from './OrganizerRegistrationFormBuilder';
import OrganizerRegistrationSubmissionModal from './components/OrganizerRegistrationSubmissionModal';
import '@/layouts/portal/portal-widgets.css';
import '@/features/events/events.css';
import './org-events.css';
import EventAnalyticsTab from '@/portal/organizer/events/tabs/EventAnalyticsTab';
import EventRosterTab from '@/portal/organizer/events/tabs/EventRosterTab';
import EventShowcaseTab from '@/portal/organizer/events/tabs/EventShowcaseTab';

function mapEventForDisplay(event) {
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
    description: event.description,
    tags: event.tags || [],
    imageUrl: event.bannerImage?.url,
    dateFormatted: eventDate.toLocaleString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    }),
    teamFormat: event.registrationType === 'team' ? `${event.teamSize?.min}–${event.teamSize?.max} members` : 'Solo',
    payment: event.price === 0 ? 'Free' : 'Paid',
    priceAmount: event.price,
    capacity: event.capacity,
    registeredCount: event.confirmedRegistrationIds?.length || 0,
    questions: (event.formQuestions || []).map((q) => q.label),
    status,
  };
}

function mapRegistration(r) {
  return {
    id: r._id,
    name: r.student?.name || 'Unknown Student',
    email: r.student?.email || '',
    rollNo: r.profileSnapshot?.rollNo || '—',
    branch: r.profileSnapshot?.branch || '—',
    year: r.profileSnapshot?.yearOfJoining || '—',
    ticketId: (r.qrToken || '').slice(0, 8).toUpperCase(),
    qrToken: r.qrToken,
    paymentStatus: r.paymentStatus,
    checkedIn: r.checkedIn,
    teamName: r.teamName || '',
    registeredOn: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : '',
    formAnswers: (r.answers || []).map((a) => ({
      q: a.questionLabel,
      a: Array.isArray(a.value) ? a.value.join(', ') : String(a.value),
    })),
    status: r.status,
  };
}

/* ── Main Component ── */
export default function OrganizerEventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'GDSC SIES GST';

  const [rawEvent, setRawEvent] = useState(null);
  const [rawRegistrations, setRawRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('showcase'); // 'showcase' | 'form' | 'roster' | 'analytics'
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);
  const [changingStatus, setChangingStatus] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const loadAll = useCallback(() => {
    setLoading(true);
    setLoadError('');
    return Promise.all([getEvent(eventId), listEventRegistrations(eventId, { limit: 100 })])
      .then(([eventRes, regRes]) => {
        setRawEvent(eventRes.event);
        setRawRegistrations(regRes.registrations);
      })
      .catch((err) => setLoadError(err.message || 'Failed to load this event'))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Global Escape key listener — closes the submission modal first if one's
  // open, only navigates away once nothing else is open to dismiss.
  //
  // The "is a modal open?" read goes through a ref, not a setState updater:
  // updaters must be pure and React runs them again under StrictMode, so
  // navigating from inside one fired the route change twice.
  const selectedSubmissionRef = useRef(null);
  useEffect(() => { selectedSubmissionRef.current = selectedSubmission; }, [selectedSubmission]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (selectedSubmissionRef.current) {
        setSelectedSubmission(null);
        return;
      }
      navigate('/organizer/events');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const event = useMemo(() => (rawEvent ? mapEventForDisplay(rawEvent) : null), [rawEvent]);

  const confirmedRegistrations = useMemo(
    () => rawRegistrations.filter((r) => r.status === 'confirmed').map(mapRegistration),
    [rawRegistrations]
  );
  const waitlistCount = useMemo(
    () => rawRegistrations.filter((r) => r.status === 'waitlisted').length,
    [rawRegistrations]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return confirmedRegistrations;
    const q = search.toLowerCase();
    return confirmedRegistrations.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.ticketId.toLowerCase().includes(q)
    );
  }, [confirmedRegistrations, search]);

  const checkedInCount = useMemo(
    () => confirmedRegistrations.filter((r) => r.checkedIn).length,
    [confirmedRegistrations]
  );

  const fillRate = useMemo(() => {
    if (!event || !event.capacity) return 0;
    return Math.min(Math.round((event.registeredCount / event.capacity) * 100), 100);
  }, [event]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Real, one-way QR check-in (mirrors the Scan page) — updates local state
  // in place rather than a full reload, since only this one record changed.
  const handleCheckIn = async (registration) => {
    setCheckingInId(registration.id);
    try {
      const res = await checkInEvent(eventId, registration.qrToken);
      if (res.alreadyCheckedIn) {
        showToast(`${registration.name} was already checked in.`);
      } else {
        showToast(`✓ ${registration.name} checked in.`);
      }
      setRawRegistrations((prev) =>
        prev.map((r) => (r._id === registration.id ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r))
      );
      setSelectedSubmission((prev) => (prev && prev.id === registration.id ? { ...prev, checkedIn: true } : prev));
    } catch (err) {
      showToast(err.message || 'Check-in failed');
    } finally {
      setCheckingInId(null);
    }
  };

  // Registration form / waiver / questions save — PATCHes the event directly,
  // there's no separate "form" document to persist.
  const handleSaveRegistrationForm = async (patch) => {
    try {
      const { event: updated } = await updateEvent(eventId, patch);
      setRawEvent(updated);
      showToast('✓ Registration form saved.');
    } catch (err) {
      showToast(err.message || 'Failed to save the registration form');
    }
  };

  const handleToggleStatus = async () => {
    if (!rawEvent) return;
    const nextStatus = rawEvent.status === 'draft' ? 'published' : 'draft';
    setChangingStatus(true);
    try {
      const { event: updated } = await updateEvent(eventId, { status: nextStatus });
      setRawEvent(updated);
      showToast(nextStatus === 'published' ? '✓ Event published live.' : '✓ Event moved back to draft.');
    } catch (err) {
      showToast(err.message || 'Failed to change event status');
    } finally {
      setChangingStatus(false);
    }
  };

  // Soft-delete (isActive: false) — registrants, team rosters, and check-in
  // records stay intact; the event just stops showing up to students.
  const handleConfirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteEvent(eventId);
      navigate('/organizer/events');
    } catch (err) {
      showToast(err.message || 'Failed to delete this event');
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${eventId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="org-page">
        <EmptyState icon={Eye} title="Loading event…" desc="Fetching the event hub." />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="org-page">
        <button className="org-back-link" onClick={() => navigate('/organizer/events')}>
          <ArrowLeft size={13} /> Back to Events
        </button>
        <EmptyState
          title="Event listing not found"
          desc={loadError || 'This event may have been removed or deleted.'}
          action={
            <button className="org-btn org-btn-primary" onClick={() => navigate('/organizer/events')}>
              Return to Events Hub
            </button>
          }
        />
      </div>
    );
  }

  const agenda = rawEvent.agenda || [];
  const rules = rawEvent.rules || [];
  const contact = rawEvent.contact || null;
  const faqs = rawEvent.faqs || [];
  const analyticsEvent = { ...event, waitlistCount };

  return (
    <div className="org-page org-event-detail-page">
      {/* Toast Banner */}
      {toastMsg && (
        <div className="org-toast">
          <CheckCircle size={16} style={{ color: '#4ADE80', flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ── Organizer Header Bar ── */}
      <div className="events-breadcrumb flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <button
            className="events-breadcrumb-link"
            onClick={() => navigate('/organizer/events')}
            aria-label="Back to Events"
          >
            Events
          </button>
          <CaretRight size={10} className="events-breadcrumb-sep" />
          <span className="events-breadcrumb-link" style={{ cursor: 'default' }}>
            {communityName}
          </span>
          <CaretRight size={10} className="events-breadcrumb-sep" />
          <span className="events-breadcrumb-current" title={event.title}>
            {event.title}
          </span>
        </div>

        <button
          className="org-back-link !mb-0"
          onClick={() => navigate('/organizer/events')}
          aria-label="Back to events list"
        >
          <ArrowLeft size={13} /> Back to Events Hub
        </button>
      </div>

      {/* ── Organizer Management Header Card ── */}
      <div className="org-event-mgmt-header">
        <div className="org-event-mgmt-header-top">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="org-event-mgmt-header-meta">
              <StatusPill status={event.status} />
              <span className="org-badge">{event.category || 'Workshop'}</span>
              <span className="org-badge">{event.teamFormat}</span>
            </div>
            <h1 className="org-event-mgmt-title">{event.title}</h1>
          </div>

          <div className="org-event-mgmt-actions">
            <button
              type="button"
              className="org-btn org-btn-ghost"
              onClick={() => navigate(`/organizer/events/${eventId}/edit`)}
              title="Edit title, dates, venue, banner, pricing, and more"
            >
              <PencilSimple size={15} /> Edit Event
            </button>
            <button
              type="button"
              className="org-btn org-btn-ghost"
              onClick={() => navigate(`/organizer/analytics/${eventId}`)}
            >
              <ChartBar size={15} /> Analytics
            </button>
            <button
              type="button"
              className="org-btn org-btn-primary"
              onClick={() => navigate(`/organizer/events/${eventId}/scan`)}
            >
              <QrCode size={15} /> Scan Attendance
            </button>
            {(rawEvent.status === 'draft' || rawEvent.status === 'published') && (
              <button
                type="button"
                className="org-btn org-btn-secondary"
                onClick={handleToggleStatus}
                disabled={changingStatus}
                title={rawEvent.status === 'draft' ? 'Publish this event live to students' : 'Unpublish — moves back to draft, hidden from students'}
              >
                {rawEvent.status === 'draft' ? <RocketLaunch size={15} /> : <FloppyDisk size={15} />}
                {rawEvent.status === 'draft' ? 'Publish' : 'Move to Draft'}
              </button>
            )}
            <button
              type="button"
              className="org-btn org-btn-ghost"
              style={{ color: '#991B1B' }}
              onClick={() => setShowDeleteModal(true)}
              title="Delete this event"
            >
              <Trash size={15} /> Delete
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="org-event-mgmt-infobar">
          <div className="org-event-mgmt-infobar-item">
            <CalendarBlank size={13} style={{ color: '#991B1B' }} />
            <span>{event.dateFormatted}</span>
          </div>
          <div className="org-event-mgmt-infobar-item">
            <MapPin size={13} style={{ color: '#1A3A2A' }} />
            <span>{event.venue}</span>
          </div>
          <div className="org-event-mgmt-infobar-item">
            <UsersThree size={13} style={{ color: '#2563EB' }} />
            <span>{event.registeredCount}/{event.capacity} registered</span>
            <span className={`fill-rate-chip${fillRate >= 90 ? ' high' : ''}`}>{fillRate}%</span>
          </div>
          <div className="org-event-mgmt-infobar-item">
            <CurrencyInr size={13} style={{ color: '#B45309' }} />
            <span>{event.payment === 'Free' ? 'Free Entry' : `Rs. ${event.priceAmount}`}</span>
          </div>
        </div>
      </div>

      {/* ── View Navigation Tabs ── */}
      <div className="org-detail-tabs-bar mb-4" role="tablist" aria-label="Event Detail View Navigation">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'showcase'}
          aria-controls="panel-showcase"
          className={`org-detail-tab-btn ${activeTab === 'showcase' ? 'active' : ''}`}
          onClick={() => setActiveTab('showcase')}
        >
          <Eye size={15} />
          <span>Student Showcase Page</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'form'}
          aria-controls="panel-form"
          className={`org-detail-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <FileText size={15} />
          <span>Registration Form</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'roster'}
          aria-controls="panel-roster"
          className={`org-detail-tab-btn ${activeTab === 'roster' ? 'active' : ''}`}
          onClick={() => setActiveTab('roster')}
        >
          <UsersThree size={15} />
          <span>Registrations Roster</span>
          <span className="org-tab-count">{confirmedRegistrations.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'analytics'}
          aria-controls="panel-analytics"
          className={`org-detail-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <ChartBar size={15} />
          <span>Capacity &amp; Performance</span>
        </button>
      </div>

      {activeTab === 'showcase' && (
        <EventShowcaseTab
          agenda={agenda}
          communityName={communityName}
          contact={contact}
          copied={copied}
          event={event}
          faqs={faqs}
          fillRate={fillRate}
          handleShare={handleShare}
          imgError={imgError}
          rules={rules}
          setImgError={setImgError}
          tags={event.tags}
        />
      )}

      {activeTab === 'form' && (
        <div id="panel-form" role="tabpanel">
          <OrganizerRegistrationFormBuilder
            event={rawEvent}
            onSaveForm={handleSaveRegistrationForm}
            communityName={communityName}
          />
        </div>
      )}

      {activeTab === 'roster' && (
        <EventRosterTab
          checkedInCount={checkedInCount}
          checkingInId={checkingInId}
          filtered={filtered}
          handleCheckIn={handleCheckIn}
          registrations={confirmedRegistrations}
          search={search}
          setSearch={setSearch}
          setSelectedSubmission={setSelectedSubmission}
          waitlistCount={waitlistCount}
        />
      )}

      {activeTab === 'analytics' && (
        <EventAnalyticsTab checkedInCount={checkedInCount} event={analyticsEvent} fillRate={fillRate} />
      )}

      <AnimatePresence>
        {selectedSubmission && (
          <OrganizerRegistrationSubmissionModal
            registration={selectedSubmission}
            event={event}
            onClose={() => setSelectedSubmission(null)}
            onCheckIn={handleCheckIn}
            checkingIn={checkingInId === selectedSubmission.id}
          />
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <div
            className="org-modal-overlay"
            onClick={(e) => e.target === e.currentTarget && !deleting && setShowDeleteModal(false)}
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
              aria-labelledby="delete-event-detail-title"
            >
              <div className="org-modal-header">
                <div className="flex items-center gap-2 text-[#991B1B]">
                  <Trash size={18} weight="bold" />
                  <h2 className="org-modal-title" id="delete-event-detail-title">Delete This Event?</h2>
                </div>
                <button className="org-icon-btn" onClick={() => !deleting && setShowDeleteModal(false)} aria-label="Close">
                  <X size={16} />
                </button>
              </div>
              <div className="org-modal-body">
                <p className="text-xs text-gray-700 leading-relaxed font-['Plus_Jakarta_Sans']">
                  Delete <strong>"{event.title}"</strong>? It will stop showing up to students and disappear from
                  your events list immediately. Existing registrations, team rosters, and check-in records are kept
                  — this can't be undone from here.
                </p>
              </div>
              <div className="org-modal-footer">
                <button type="button" className="org-btn org-btn-ghost" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
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
