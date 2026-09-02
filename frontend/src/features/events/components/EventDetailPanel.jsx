/**
 * EventDetailPanel.jsx — CampusCircle event detail view
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import {
  ArrowLeft,
  CaretRight,
  Calendar,
  MapPin,
  Users,
  CurrencyInr,
  CheckCircle,
  X,
  BookmarkSimple,
  ShareNetwork,
  Warning,
  ShieldCheck,
  Envelope,
  Phone,
  MapPinArea,
  Clock,
  Check,
  Ticket,
  Link as LinkIcon,
  Info,
  Hash,
  Circle,
  BellRinging,
  Plus,
  Minus,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import { findScheduleConflict } from '@/features/events/eventsDateUtils';
import '@/features/events/events.css';
import {
  GSAPDigitRoll,
  GSAPStatusBadge,
  GSAPProgressBar,
  SplitTitleReveal,
  AgendaTimelineLine,
  MorphChevron,
} from './EventMotion';
import FaqItem from '@/features/events/components/EventFaqItem';
import RegistrationDialog from '@/features/events/components/EventDetailRegistrationDialog';
import Toast from '@/features/events/components/EventDetailToast';

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */

function getProgressColor(pct) {
  if (pct >= 1) return '#374151';
  if (pct >= 0.9) return '#991B1B';
  if (pct >= 0.7) return '#B45309';
  return '#1A3A2A';
}

/* ─────────────────────────────────────────────────────────────
   MAIN EVENT DETAIL PAGE
   ───────────────────────────────────────────────────────────── */

export default function EventDetailPanel({
  event,
  leaderId,
  registeredIds,
  savedIds,
  waitlistIds,
  registrationIndex,
  onRegistrationSuccess,
  onToggleSave,
  onBack,
  onNavigateToLogin,
}) {
  const { isLoggedIn } = useAuth();
  const [showRegDialog, setShowRegDialog] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const toastTimerRef = useRef(null);

  const liveRegistered = event._liveRegistered ?? event.registered_count;
  const liveStatus = event.statusBadge;
  const pct = Math.min(liveRegistered / event.capacity, 1);

  const isRegistered = registeredIds.has(event.id);
  const isSaved = savedIds.has(event.id);
  const isWaitlisted = waitlistIds?.has(event.id) ?? false;
  const isSoldOut = liveRegistered >= event.capacity;
  const eventConcluded = event.isPast;
  // Sold out with no waitlist is the only capacity state that actually
  // blocks registering — a sold-out-but-waitlisted event still opens the
  // dialog, since the backend (not this button) decides confirmed vs
  // waitlisted when the request lands.
  const blockedSoldOut = isSoldOut && !event.allowWaitlist && !isRegistered;

  // Real cross-event conflict detection: any other registration (confirmed
  // or waitlisted) that falls on the same calendar day.
  const conflictEvent = useMemo(
    () => (isRegistered ? null : findScheduleConflict(event.id, event.date, registrationIndex)),
    [event.id, event.date, registrationIndex, isRegistered]
  );
  const conflictTitle = conflictEvent?.eventTitle ?? null;

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3500);
  }, []);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  const regBtnDisabled = eventConcluded || event.registrationClosed || isRegistered || blockedSoldOut;

  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    if (regBtnDisabled) return;
    setShowRegDialog(true);
  };

  const handleToggleSave = () => {
    if (!isLoggedIn) {
      onNavigateToLogin?.();
      return;
    }
    onToggleSave(event.id);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/detail/${event.id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // No clipboard API (or permission denied) — claiming success here showed
      // "Copied!" over an empty clipboard, so surface the link instead.
      showToast(`Copy this link: ${url}`);
      return;
    }
    setCopied(true);
    showToast('Event link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  /* Registration button state */
  const regBtnLabel = eventConcluded
    ? 'Event Concluded'
    : event.registrationClosed
    ? 'Registration Closed'
    : isRegistered
    ? (isWaitlisted ? "You're Waitlisted" : "You're Registered!")
    : blockedSoldOut
    ? 'Sold Out'
    : isSoldOut
    ? 'Join Waitlist'
    : 'Register Now';

  /* Progress bar color */
  const barColor = getProgressColor(pct);

  return (
    <>
      <div className="events-detail-page">
        {/* ── Navbar is rendered by parent ── */}

        <div className="events-detail-inner">
          {/* Breadcrumb + Back */}
          <motion.div
            className="events-breadcrumb"
            aria-label="Breadcrumb navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              className="events-breadcrumb-link"
              onClick={onBack}
              aria-label="Back to Events"
            >
              Events
            </button>
            <CaretRight size={10} className="events-breadcrumb-sep" aria-hidden="true" />
            <span className="events-breadcrumb-link" style={{ cursor: 'default' }}>
              {event.hostName}
            </span>
            <CaretRight size={10} className="events-breadcrumb-sep" aria-hidden="true" />
            <span className="events-breadcrumb-current" title={event.title}>
              {event.title}
            </span>
          </motion.div>

          <div style={{ paddingBottom: '0.5rem' }}>
            <motion.button
              className="events-back-btn"
              onClick={onBack}
              whileTap={{ scale: 0.96 }}
              whileHover={{ x: -2 }}
              aria-label="Return to events list"
            >
              <ArrowLeft size={14} />
              Back to Events
            </motion.button>
          </div>

          {/* Main content grid */}
          <div className="events-detail-layout">
            {/* ── Left: Main content ── */}
            <div>
              {/* Hero image */}
              <motion.div
                className="events-detail-hero"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {!imgError && event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={`Cover image for ${event.title}`}
                    className="events-detail-hero-img"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div
                    className="events-detail-hero-img"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${event.hostColor}cc, ${event.hostColor}55)`,
                      fontSize: '4rem',
                    }}
                    role="img"
                    aria-label={`${event.hostName} event`}
                  >
                    {event.hostIcon}
                  </div>
                )}
                <div className="events-detail-hero-overlay" aria-hidden="true" />

                {/* Bottom-left: category + payment */}
                <div className="events-detail-hero-badges">
                  <span className="event-category-badge">{event.category}</span>
                  <span className={`event-payment-badge ${event.payment === 'Free' ? 'free' : 'paid'}`}>
                    {event.payment === 'Free' ? 'Free' : `Rs. ${event.price_amount}`}
                  </span>
                  <span className="event-category-badge">{event.teamFormat || 'Solo'}</span>
                </div>

                {/* Top-right: status */}
                <div className="events-detail-hero-top">
                  <GSAPStatusBadge status={liveStatus} style={{ fontSize: '0.625rem', padding: '0.3125rem 0.625rem' }} />
                </div>
              </motion.div>

              {/* Rescheduled notice */}
              {event.isRescheduled && (
                <motion.div
                  className="events-rescheduled-notice"
                  role="alert"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Warning size={18} className="events-rescheduled-icon" weight="fill" />
                  <p className="events-rescheduled-text">{event.rescheduledNotice}</p>
                </motion.div>
              )}

              {/* Past event notice */}
              {eventConcluded && (
                <motion.div
                  className="events-past-notice"
                  role="status"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Info size={18} style={{ color: '#6B7280', flexShrink: 0, marginTop: 1 }} />
                  <p className="events-past-text">This event has concluded. Registration is no longer available.</p>
                </motion.div>
              )}

              {/* Event title */}
              <SplitTitleReveal
                as="h1"
                text={event.title}
                delay={0.15}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(1.375rem, 3vw, 2rem)',
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  margin: '0 0 0.875rem',
                }}
              />

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="events-detail-tags">
                  {event.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      className="events-detail-tag"
                      initial={{ opacity: 0, y: 6, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Hash size={9} />
                      {tag}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* Organizer */}
              <motion.div
                className="events-organizer-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="events-organizer-avatar"
                  style={{ background: event.hostColor + '22' }}
                  aria-hidden="true"
                >
                  {event.hostIcon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="events-organizer-name">{event.hostName}</p>
                  <p className="events-organizer-role">
                    {event.hostName} · SIES GST
                  </p>
                </div>
                <div className="stamp-verified" style={{ alignSelf: 'center' }}>
                  <ShieldCheck size={11} weight="fill" />
                  Verified
                </div>
              </motion.div>

              {/* Quick Facts */}
              <h2 className="events-detail-section-title">
                Quick Facts
              </h2>
              <div className="events-quick-facts">
                {[
                  { icon: <Calendar size={16} className="events-fact-icon" />, label: 'Date & Time', value: event.dateFormatted || 'TBA' },
                  { icon: <MapPin size={16} className="events-fact-icon" />, label: 'Venue', value: event.venue || 'TBA' },
                  { icon: <Users size={16} className="events-fact-icon" />, label: 'Team Format', value: event.teamFormat || 'Solo' },
                  { icon: <CurrencyInr size={16} className="events-fact-icon" />, label: 'Entry Fee', value: event.payment === 'Free' ? 'Free' : `Rs. ${event.price_amount}` },
                ].map((fact, i) => (
                  <motion.div
                    key={fact.label}
                    className="events-fact-card"
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {fact.icon}
                    <span className="events-fact-label">{fact.label}</span>
                    <span className="events-fact-value">{fact.value}</span>
                  </motion.div>
                ))}
              </div>

              {/* About */}
              <motion.div
                className="events-about-section"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="events-detail-section-title">About This Event</h2>
                <p className="events-about-text">{event.description}</p>
              </motion.div>

              {/* Agenda */}
              {event.agenda?.length > 0 && (
                <div className="events-agenda-section">
                  <h2 className="events-detail-section-title">Event Schedule</h2>
                  <div className="events-agenda-list" role="list">
                    <AgendaTimelineLine count={event.agenda.length} />
                    {event.agenda.map((item, i) => (
                      <motion.div
                        key={i}
                        className="events-agenda-item"
                        role="listitem"
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.4, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className={`events-agenda-dot ${i === 0 ? 'active' : ''}`} aria-hidden="true">
                          {i === 0
                            ? <Circle size={10} weight="fill" />
                            : <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D8D2C4', display: 'block' }} />
                          }
                        </div>
                        <div className="events-agenda-content">
                          <p className="events-agenda-phase">{item.phase}</p>
                          <p className="events-agenda-title">{item.title}</p>
                          <p className="events-agenda-desc">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {event.rules?.length > 0 && (
                <div className="events-rules-section">
                  <h2 className="events-detail-section-title">Guidelines & Rules</h2>
                  <ul className="events-rules-list" aria-label="Event rules">
                    {event.rules.map((rule, i) => (
                      <motion.li
                        key={i}
                        className="events-rules-item"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.4), ease: [0.16, 1, 0.3, 1] }}
                      >
                        <span className="events-rules-item-bullet" aria-hidden="true">
                          <Check size={9} weight="bold" />
                        </span>
                        {rule}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact / Support */}
              {event.contact && (
                <div className="events-contact-section">
                  <h2 className="events-detail-section-title">Organizer Support</h2>
                  <div className="events-contact-grid">
                    {/* Coordinator Card */}
                    <motion.div
                      className="events-contact-card"
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="events-contact-card-header">
                        <Users size={16} className="events-contact-card-header-icon" />
                        <span className="events-contact-card-label">Lead Coordinator</span>
                      </div>
                      <div className="events-contact-person-info">
                        <p className="events-contact-name">{event.contact.leadName}</p>
                        <p className="events-contact-role">{event.contact.leadRole}</p>
                      </div>
                      {event.contact.deskLocation && (
                        <div className="events-contact-detail-row">
                          <MapPinArea size={16} className="events-contact-icon" />
                          <div className="events-contact-detail-text">
                            <span className="events-contact-detail-title">Help Desk Location</span>
                            <span className="events-contact-detail-val">
                              {event.contact.deskLocation}
                              {event.contact.room && ` · Room ${event.contact.room}`}
                              {event.contact.floor && `, ${event.contact.floor} Floor`}
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Channels Card */}
                    <motion.div
                      className="events-contact-card"
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="events-contact-card-header">
                        <Envelope size={16} className="events-contact-card-header-icon" />
                        <span className="events-contact-card-label">Contact Channels</span>
                      </div>
                      <div className="events-contact-channels-list">
                        {event.contact.email && (
                          <div className="events-contact-detail-row">
                            <Envelope size={16} className="events-contact-icon" />
                            <div className="events-contact-detail-text">
                              <span className="events-contact-detail-title">Email Inquiry</span>
                              <a href={`mailto:${event.contact.email}`} className="events-contact-link">
                                {event.contact.email}
                              </a>
                              {event.contact.emailSLA && (
                                <span className="events-contact-sla">{event.contact.emailSLA}</span>
                              )}
                            </div>
                          </div>
                        )}
                        {event.contact.phone && (
                          <div className="events-contact-detail-row">
                            <Phone size={16} className="events-contact-icon" />
                            <div className="events-contact-detail-text">
                              <span className="events-contact-detail-title">Phone / WhatsApp</span>
                              <a href={`tel:${event.contact.phone.replace(/\s/g, '')}`} className="events-contact-link">
                                {event.contact.phone}
                              </a>
                              {event.contact.operatingHours && (
                                <span className="events-contact-sla">{event.contact.operatingHours}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* FAQs */}
              {event.faqs?.length > 0 && (
                <div className="events-faq-section">
                  <h2 className="events-detail-section-title">Frequently Asked Questions</h2>
                  <div className="events-faq-list" role="list" aria-label="Frequently asked questions">
                    {event.faqs.map((faq, i) => (
                      <motion.div
                        key={i}
                        role="listitem"
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.35, delay: Math.min(i * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
                      >
                        <FaqItem faq={faq} index={i} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom padding for mobile sticky bar */}
              <div style={{ height: '1rem' }} aria-hidden="true" />
            </div>

            {/* ── Right: Sticky registration panel + Perks (desktop) ── */}
            <div>
              <motion.div
                className="events-detail-sidebar"
                aria-label="Registration summary"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="events-sticky-panel">
                  <div className="events-sticky-panel-header">
                    <p className="events-sticky-price">
                      {event.payment === 'Free' ? 'Free' : `Rs. ${event.price_amount}`}
                    </p>
                    <p className="events-sticky-price-sub">
                      {event.payment === 'Free' ? 'No registration fee' : 'per team / person'}
                    </p>
                  </div>

                  <div className="events-sticky-panel-body">
                    {/* Meta */}
                    <div className="events-sticky-meta">
                      <div className="events-sticky-meta-row">
                        <Calendar size={15} className="events-sticky-meta-icon" aria-hidden="true" />
                        <span>{event.dateFormatted || 'TBA'}</span>
                      </div>
                      <div className="events-sticky-meta-row">
                        <MapPin size={15} className="events-sticky-meta-icon" aria-hidden="true" />
                        <span>{event.venue || 'TBA'}</span>
                      </div>
                      <div className="events-sticky-meta-row">
                        <Users size={15} className="events-sticky-meta-icon" aria-hidden="true" />
                        <span>{event.teamFormat || 'Solo'}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="events-sticky-progress-section" aria-live="polite" aria-atomic="true">
                      <div className="events-sticky-progress-label">
                        <GSAPStatusBadge status={liveStatus} style={{ fontSize: '0.625rem', padding: '0.3125rem 0.625rem' }} />
                        <span className="events-sticky-progress-count">
                          <GSAPDigitRoll value={liveRegistered} /> / {event.capacity} registered
                        </span>
                      </div>
                      <GSAPProgressBar pct={pct} liveRegistered={liveRegistered} capacity={event.capacity} />
                    </div>

                    {/* Primary action */}
                    <motion.button
                      className={`events-sticky-reg-btn ${isRegistered ? 'registered' : ''} ${isWaitlisted ? 'waitlisted' : ''}`}
                      onClick={handleRegisterClick}
                      disabled={regBtnDisabled}
                      whileTap={regBtnDisabled ? undefined : { scale: 0.97 }}
                      aria-label={regBtnLabel}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={regBtnLabel}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                          {isRegistered
                            ? <><CheckCircle size={17} weight="fill" /> {regBtnLabel}</>
                            : !blockedSoldOut && isSoldOut
                            ? <><BellRinging size={17} /> {regBtnLabel}</>
                            : eventConcluded || event.registrationClosed || blockedSoldOut
                            ? regBtnLabel
                            : <><Ticket size={17} /> {regBtnLabel}</>
                          }
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>

                    {/* Secondary actions */}
                    <div className="events-sticky-secondary-actions">
                      <motion.button
                        className={`events-sticky-icon-btn ${isSaved ? 'saved' : ''}`}
                        onClick={handleToggleSave}
                        whileTap={{ scale: 0.95 }}
                        aria-label={isSaved ? 'Remove bookmark' : 'Save event'}
                        aria-pressed={isSaved}
                      >
                        <BookmarkSimple size={15} weight={isSaved ? 'fill' : 'regular'} />
                        {isSaved ? 'Saved' : 'Save'}
                      </motion.button>
                      <motion.button
                        className={`events-sticky-icon-btn ${copied ? 'copied' : ''}`}
                        onClick={handleShare}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Share event link"
                      >
                        {copied ? <Check size={15} /> : <ShareNetwork size={15} />}
                        {copied ? 'Copied!' : 'Share'}
                      </motion.button>
                    </div>

                    {/* Not logged in note */}
                    {!isLoggedIn && (
                      <p style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.5875rem',
                        color: '#9CA3AF',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        textAlign: 'center',
                        margin: 0,
                      }}>
                        Login required to register or save
                      </p>
                    )}
                  </div>
                </div>

                {/* Event Access Guarantee Card */}
                <div style={{
                  background: '#F0EDE5',
                  border: '1.5px solid #D8D2C4',
                  borderRadius: 6,
                  padding: '1.125rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}>
                  <p style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: 0,
                  }}>
                    Campus Event Guarantee
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <ShieldCheck size={16} style={{ color: '#1A3A2A', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.775rem', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                      Official SIES GST event. Registrations synced automatically to your student profile & My Events hub.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <Ticket size={16} style={{ color: '#991B1B', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.775rem', color: '#4B5563', margin: 0, lineHeight: 1.5 }}>
                      Instant QR pass issued upon confirmation for fast check-in at venue entry desks.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Mobile sticky bottom bar ── */}
        <motion.div
          className="events-mobile-sticky-bar"
          aria-label="Quick registration"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="events-mobile-sticky-price">
            <span className="events-mobile-sticky-price-amount">
              {event.payment === 'Free' ? 'Free' : `Rs. ${event.price_amount}`}
            </span>
            <span className="events-mobile-sticky-price-sub">
              {liveRegistered}/{event.capacity} registered
            </span>
          </div>
          <div className="events-mobile-sticky-actions">
            <motion.button
              className={`events-sticky-icon-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleToggleSave}
              whileTap={{ scale: 0.9 }}
              aria-label={isSaved ? 'Remove bookmark' : 'Save event'}
              style={{ padding: '0.5rem 0.625rem' }}
            >
              <BookmarkSimple size={16} weight={isSaved ? 'fill' : 'regular'} />
            </motion.button>
            <motion.button
              className={`events-sticky-reg-btn ${isRegistered ? 'registered' : ''} ${isWaitlisted ? 'waitlisted' : ''}`}
              onClick={handleRegisterClick}
              disabled={regBtnDisabled}
              whileTap={regBtnDisabled ? undefined : { scale: 0.96 }}
              style={{ width: 'auto', padding: '0.5625rem 1.125rem', fontSize: '0.8125rem' }}
              aria-label={regBtnLabel}
            >
              {isRegistered
                ? <><CheckCircle size={15} weight="fill" /> {isWaitlisted ? 'Waitlisted' : 'Registered'}</>
                : !blockedSoldOut && isSoldOut
                ? <><BellRinging size={15} /> Join Waitlist</>
                : eventConcluded
                ? 'Concluded'
                : event.registrationClosed
                ? 'Closed'
                : blockedSoldOut
                ? 'Sold Out'
                : <><Ticket size={15} /> Register</>
              }
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Dialogs & Toasts ── */}
      <AnimatePresence>
        {showRegDialog && (
          <RegistrationDialog
            event={event}
            leaderId={leaderId}
            conflictTitle={conflictTitle}
            onSuccess={onRegistrationSuccess}
            onClose={() => setShowRegDialog(false)}
          />
        )}
      </AnimatePresence>

      <Toast message={toastMsg} visible={toastVisible} />
    </>
  );
}
