/**
 * Organizer's read-only preview of the public-facing event showcase —
 * exactly what students see. Editing happens via the create-event wizard in
 * edit mode (see OrganizerCreateEventPage / events/:eventId/edit), not
 * inline here — see [[phase-3-showcase-tab-decision]] for why.
 */
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, Circle, CurrencyInr, Envelope, Hash, MapPin, MapPinArea, PencilSimple, Phone, ShareNetwork, ShieldCheck, Ticket, Users } from '@phosphor-icons/react';
import { motion } from 'motion/react';
import FaqAccordionItem from '@/portal/organizer/events/components/OrganizerFaqAccordionItem';
import StatusPill from '@/layouts/portal/components/StatusPill';

export default function EventShowcaseTab({
  agenda,
  communityName,
  contact,
  copied,
  event,
  faqs,
  fillRate,
  handleShare,
  imgError,
  rules,
  setImgError,
  tags,
}) {
  const navigate = useNavigate();

  return (
    <div id="panel-showcase" role="tabpanel" className="org-showcase-preview-frame">
      {/* Preview mode label */}
      <div className="org-showcase-preview-label">
        <span className="org-showcase-preview-label-dot" />
        Student Showcase Preview — this is exactly what students see
      </div>
      <div className="org-showcase-preview-inner">
      <div className="events-detail-inner !p-0">
        <div className="events-detail-layout">
          {/* ── Left Column: Student View Layout ── */}
          <div>
            {/* Hero Banner Container */}
            <motion.div
              className="events-detail-hero"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {!imgError && event.imageUrl ? (
                <img
                  src={event.imageUrl}
                  alt={`Cover for ${event.title}`}
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
                    background: 'linear-gradient(135deg, #1A3A2Acc, #1A3A2A55)',
                    fontSize: '3.5rem',
                  }}
                  role="img"
                >
                  ⚡
                </div>
              )}
              <div className="events-detail-hero-overlay" aria-hidden="true" />

              <div className="events-detail-hero-badges flex-wrap items-center">
                <span className="event-category-badge">{event.category || 'Workshop'}</span>
                <span className={`event-payment-badge ${event.payment === 'Free' ? 'free' : 'paid'}`}>
                  {event.payment === 'Free' ? 'Free' : `Rs. ${event.priceAmount}`}
                </span>
                <span className="event-category-badge">{event.teamFormat || 'Solo'}</span>
              </div>

              <div className="events-detail-hero-top">
                <StatusPill status={event.status} />
              </div>
            </motion.div>

            <h1
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.375rem, 3vw, 2rem)',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                margin: '1rem 0 0.875rem',
              }}
            >
              {event.title}
            </h1>

            {tags.length > 0 && (
              <div className="events-detail-tags mb-4">
                {tags.map((tag) => (
                  <span key={tag} className="events-detail-tag">
                    <Hash size={9} />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Host Organizer Card */}
            <div className="events-organizer-card mb-6">
              <div
                className="events-organizer-avatar"
                style={{ background: 'rgba(26, 58, 42, 0.15)' }}
              >
                ⚡
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="events-organizer-name">{communityName}</p>
                <p className="events-organizer-role">SIES GST · Official Campus Club</p>
              </div>
              <div className="stamp-verified" style={{ alignSelf: 'center' }}>
                <ShieldCheck size={11} weight="fill" />
                Verified
              </div>
            </div>

            {/* Quick Facts Grid */}
            <h2 className="events-detail-section-title">Quick Facts</h2>
            <div className="events-quick-facts mb-6">
              {[
                { icon: <Calendar size={16} className="events-fact-icon" />, label: 'Date & Time', value: event.dateFormatted || 'TBA' },
                { icon: <MapPin size={16} className="events-fact-icon" />, label: 'Venue', value: event.venue || 'TBA' },
                { icon: <Users size={16} className="events-fact-icon" />, label: 'Team Format', value: event.teamFormat || 'Solo' },
                { icon: <CurrencyInr size={16} className="events-fact-icon" />, label: 'Entry Fee', value: event.payment === 'Free' ? 'Free' : `Rs. ${event.priceAmount}` },
              ].map((fact) => (
                <div key={fact.label} className="events-fact-card">
                  {fact.icon}
                  <span className="events-fact-label">{fact.label}</span>
                  <span className="events-fact-value">{fact.value}</span>
                </div>
              ))}
            </div>

            {/* About Section */}
            <div className="events-about-section mb-6">
              <h2 className="events-detail-section-title">About This Event</h2>
              <p className="events-about-text">
                {event.description ||
                  `Join ${communityName} for an interactive ${event.category || 'Workshop'} session. Build hands-on projects, learn key concepts from industry mentors, and network with fellow student developers.`}
              </p>
            </div>

            {/* Custom Registration Questions */}
            <div className="mb-6 pt-4 border-t border-[#D8D2C4]">
              <h2 className="events-detail-section-title">Registration Form Questions</h2>
              {(!event.questions || event.questions.length === 0) ? (
                <p className="text-xs text-gray-500 italic bg-white p-3 rounded-lg border border-[#D8D2C4]">
                  Standard student profile information (Full Name, Roll Number, Branch, Year &amp; Campus Email) is collected automatically upon RSVP.
                </p>
              ) : (
                <div className="space-y-2">
                  {event.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs bg-white p-3 rounded-lg border border-[#D8D2C4]"
                    >
                      <span className="font-mono text-[#991B1B] font-bold">Q{idx + 1}.</span>
                      <span className="text-gray-800 font-medium">{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agenda Timeline */}
            {agenda.length > 0 && (
              <div className="events-agenda-section mb-6">
                <h2 className="events-detail-section-title">Event Schedule</h2>
                <div className="org-agenda-timeline" role="list">
                  {agenda.map((item, i) => (
                    <div key={i} className="org-agenda-item" role="listitem">
                      <div className={`org-agenda-node${i === 0 ? ' active' : ''}`} aria-hidden="true">
                        {i === 0 && <Circle size={6} weight="fill" style={{ color: '#fff' }} />}
                      </div>
                      <p className="org-agenda-phase-label">{item.phase}</p>
                      <p className="org-agenda-title">{item.title}</p>
                      <p className="org-agenda-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Guidelines & Rules */}
            {rules.length > 0 && (
              <div className="events-rules-section mb-6">
                <h2 className="events-detail-section-title">Guidelines &amp; Rules</h2>
                <ul className="org-rules-list" aria-label="Event rules">
                  {rules.map((rule, i) => (
                    <li key={i} className="org-rules-item">
                      <span className="org-rules-item-icon" aria-hidden="true">
                        <Check size={9} weight="bold" />
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Organizer Support (Contact) */}
            {contact && (contact.leadName || contact.email || contact.phone) && (
              <div className="events-contact-section mb-6">
                <h2 className="events-detail-section-title">Organizer Support</h2>
                <div className="org-contact-grid">
                  <div className="org-contact-card">
                    <div className="org-contact-card-header">
                      <div className="org-contact-card-icon">
                        <Users size={15} />
                      </div>
                      <span className="org-contact-card-label">Lead Coordinator</span>
                    </div>
                    <p className="org-contact-name">{contact.leadName}</p>
                    <p className="org-contact-role">{contact.leadRole}</p>
                    {contact.deskLocation && (
                      <div className="org-contact-row">
                        <MapPinArea size={14} />
                        <div>
                          <span className="org-contact-row-label">Help Desk</span>
                          <span className="org-contact-row-val">
                            {contact.deskLocation}{contact.room && ` · Room ${contact.room}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="org-contact-card">
                    <div className="org-contact-card-header">
                      <div className="org-contact-card-icon">
                        <Envelope size={15} />
                      </div>
                      <span className="org-contact-card-label">Contact Channels</span>
                    </div>
                    {contact.email && (
                      <div className="org-contact-row">
                        <Envelope size={14} />
                        <div>
                          <span className="org-contact-row-label">Email</span>
                          <a href={`mailto:${contact.email}`} className="org-contact-link">
                            {contact.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="org-contact-row">
                        <Phone size={14} />
                        <div>
                          <span className="org-contact-row-label">Phone / WhatsApp</span>
                          <a href={`tel:${contact.phone}`} className="org-contact-link">
                            {contact.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="events-faq-section mb-6">
                <h2 className="events-detail-section-title">Frequently Asked Questions</h2>
                <div className="events-faq-list" role="list">
                  {faqs.map((faq, i) => (
                    <FaqAccordionItem key={i} faq={faq} index={i} isEditing={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Sticky Panel ── */}
          <div>
            <div className="events-detail-sidebar">
              <div className="events-sticky-panel">
                <div className="events-sticky-panel-header">
                  <p className="events-sticky-price">
                    {event.payment === 'Free' ? 'Free' : `Rs. ${event.priceAmount}`}
                  </p>
                  <p className="events-sticky-price-sub">
                    {event.payment === 'Free' ? 'No registration fee' : 'per team / person'}
                  </p>
                </div>

                <div className="events-sticky-panel-body">
                  <div className="events-sticky-meta">
                    <div className="events-sticky-meta-row">
                      <Calendar size={15} className="events-sticky-meta-icon" />
                      <span>{event.dateFormatted || 'TBA'}</span>
                    </div>
                    <div className="events-sticky-meta-row">
                      <MapPin size={15} className="events-sticky-meta-icon" />
                      <span>{event.venue || 'TBA'}</span>
                    </div>
                    <div className="events-sticky-meta-row">
                      <Users size={15} className="events-sticky-meta-icon" />
                      <span>{event.teamFormat || 'Solo'}</span>
                    </div>
                  </div>

                  <div className="events-sticky-progress-section">
                    <div className="events-sticky-progress-label">
                      <span className="events-sticky-progress-count">
                        {event.registeredCount} / {event.capacity} registered ({fillRate}%)
                      </span>
                    </div>
                    <div className="org-capacity-track">
                      <div
                        className="org-capacity-fill"
                        style={{
                          width: `${fillRate}%`,
                          backgroundColor: fillRate >= 90 ? '#991B1B' : '#1A3A2A',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="events-sticky-reg-btn registered"
                    onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                  >
                    <PencilSimple size={16} /> Edit Event Details
                  </button>

                  <div className="events-sticky-secondary-actions mt-3">
                    <button
                      type="button"
                      className={`events-sticky-icon-btn ${copied ? 'copied' : ''}`}
                      onClick={handleShare}
                    >
                      {copied ? <Check size={15} /> : <ShareNetwork size={15} />}
                      {copied ? 'Copied!' : 'Share Link'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="org-guarantee-card">
                <p className="org-guarantee-title">Organiser Guarantee</p>
                <div className="org-guarantee-item">
                  <ShieldCheck size={15} style={{ color: '#1A3A2A' }} />
                  <p className="org-guarantee-text">
                    Official {communityName} listing. Registrations sync live with student profiles and attendance scanners.
                  </p>
                </div>
                <div className="org-guarantee-item">
                  <Ticket size={15} style={{ color: '#991B1B' }} />
                  <p className="org-guarantee-text">
                    Instant digital QR passes generated automatically for scanned venue check-in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
