/**
 * Wizard step 6 — Live Event Preview & Launch Studio.
 * Unifies the live student ticket pass, campus discovery card, full landing
 * page showcase, and pre-flight readiness checklist in one full-width tab.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Ticket,
  Laptop,
  Globe,
  CheckCircle,
  Warning,
  CalendarBlank,
  MapPin,
  UsersThree,
  CurrencyInr,
  QrCode,
  Clock,
  Buildings,
  Phone,
  Envelope,
  User,
  Sparkle,
  Tag,
  FileText,
  Check,
  CheckSquare,
  ArrowLeft,
  PencilSimple,
  RocketLaunch,
  FloppyDisk,
  ShieldCheck,
  Question,
  CaretRight,
  ListBullets,
  CircleNotch,
} from '@phosphor-icons/react';
import { formatEventDate } from '@/portal/organizer/events/steps/ScheduleStep';

export default function PreviewStep({
  title,
  tagline,
  category,
  eventDate,
  registrationDeadline,
  venue,
  isCustomVenue,
  customVenueName,
  isVirtual,
  virtualLink,
  bannerPreviewUrl,
  tags = [],
  teamFormat,
  teamMin,
  teamMax,
  capacity,
  allowWaitlist,
  payment,
  priceAmount,
  paymentQrPreviewUrl,
  upiId,
  paymentInstructions,
  description,
  agenda = [],
  rules = [],
  contact = {},
  faqs = [],
  customQuestions = [],
  requireWaiver,
  waiverText,
  communityName,
  validation,
  setActiveStep,
  handleSaveEvent,
  isPublishing,
  isSavingDraft,
  submitError,
}) {
  // Preview mode: 'ticket' | 'feed' | 'showcase' | 'checklist'
  const [previewMode, setPreviewMode] = useState('showcase');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const displayVenue = isVirtual
    ? `Online · ${virtualLink || 'Meeting link provided upon RSVP'}`
    : isCustomVenue
    ? customVenueName || 'Campus Venue'
    : venue || 'Campus Venue';

  const previewDateFormatted = formatEventDate(eventDate) || 'Date & Time TBD';
  const deadlineFormatted = registrationDeadline ? formatEventDate(registrationDeadline) : null;

  return (
    <motion.div
      key="step-preview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* ── Top Header & Readiness Summary Bar ── */}
      <div className="bg-white border border-[#D8D2C4] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700">
                <Sparkle size={12} className="text-[#991B1B]" />
                Step 6 of 6 · Live Review
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                  validation.canPublish
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {validation.canPublish ? (
                  <>
                    <CheckCircle size={12} weight="fill" className="text-emerald-600" />
                    Ready to Publish
                  </>
                ) : (
                  <>
                    <Warning size={12} weight="fill" className="text-amber-500" />
                    Action Required
                  </>
                )}
              </span>
            </div>
            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[#0F172A]">
              Live Student Preview &amp; Pre-Flight Review
            </h2>
            <p className="text-xs text-gray-600 font-['Plus_Jakarta_Sans'] mt-0.5">
              Experience your event listing exactly as students will see it across campus passes, discovery feeds, and registration pages.
            </p>
          </div>

          {/* Readiness Score Progress Pill */}
          <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#D8D2C4] p-3 rounded-xl min-w-[210px] justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-gray-500">Readiness Score</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-2xl font-bold font-['Space_Grotesk'] ${
                    validation.score >= 80
                      ? 'text-emerald-700'
                      : validation.score >= 50
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}
                >
                  {validation.score}%
                </span>
                <span className="text-[11px] font-mono text-gray-400">/ 100%</span>
              </div>
            </div>
            <button
              type="button"
              className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                previewMode === 'checklist'
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-white border-[#D8D2C4] text-gray-700 hover:border-gray-400'
              }`}
              onClick={() => setPreviewMode('checklist')}
            >
              {validation.canPublish ? 'View Checklist' : 'Fix Issues →'}
            </button>
          </div>
        </div>

        {/* Quick jump to sections row */}
        <div className="mt-4 pt-3.5 border-t border-[#E6E1D5] flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider">
            Jump to Edit:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveStep('identity')}
              className="text-xs font-medium px-2 py-1 rounded bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700 hover:bg-white hover:border-gray-400 transition-colors flex items-center gap-1"
            >
              <PencilSimple size={12} /> Identity
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('schedule')}
              className="text-xs font-medium px-2 py-1 rounded bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700 hover:bg-white hover:border-gray-400 transition-colors flex items-center gap-1"
            >
              <PencilSimple size={12} /> Schedule
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('capacity')}
              className="text-xs font-medium px-2 py-1 rounded bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700 hover:bg-white hover:border-gray-400 transition-colors flex items-center gap-1"
            >
              <PencilSimple size={12} /> Tickets
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('agenda')}
              className="text-xs font-medium px-2 py-1 rounded bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700 hover:bg-white hover:border-gray-400 transition-colors flex items-center gap-1"
            >
              <PencilSimple size={12} /> Agenda
            </button>
            <button
              type="button"
              onClick={() => setActiveStep('questions')}
              className="text-xs font-medium px-2 py-1 rounded bg-[#FAF8F5] border border-[#D8D2C4] text-gray-700 hover:bg-white hover:border-gray-400 transition-colors flex items-center gap-1"
            >
              <PencilSimple size={12} /> RSVP Form
            </button>
          </div>
        </div>
      </div>

      {/* ── Preview Mode Selector Tabs ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center p-1 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl shadow-xs gap-1">
          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewMode === 'showcase'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
            onClick={() => setPreviewMode('showcase')}
          >
            <Globe size={14} />
            <span>Full Event Showcase</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewMode === 'ticket'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
            onClick={() => setPreviewMode('ticket')}
          >
            <Ticket size={14} />
            <span>Student Ticket Pass</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewMode === 'feed'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
            onClick={() => setPreviewMode('feed')}
          >
            <Laptop size={14} />
            <span>Feed Discovery Card</span>
          </button>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewMode === 'checklist'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
            onClick={() => setPreviewMode('checklist')}
          >
            <CheckCircle size={14} />
            <span>Pre-Flight Checklist</span>
            {!validation.canPublish && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
        </div>

        <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
          Live simulation · Real-time updates as you edit
        </span>
      </div>

      {/* ── PREVIEW VIEW 1: Full Event Showcase ── */}
      {previewMode === 'showcase' && (
        <motion.div
          key="prev-showcase"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D8D2C4] rounded-2xl overflow-hidden shadow-sm"
        >
          {/* Hero Banner */}
          <div className="relative min-h-[220px] sm:min-h-[280px] bg-slate-900 flex flex-col justify-end p-6 sm:p-8 text-white overflow-hidden">
            {bannerPreviewUrl ? (
              <img
                src={bannerPreviewUrl}
                alt={title || 'Event Cover'}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#1A3A2A]/40 to-slate-950 flex items-center justify-center">
                <span className="text-4xl opacity-20">⚡</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="relative z-10 space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/20 uppercase">
                  {category || 'Workshop'}
                </span>
                <span className="bg-[#991B1B] text-white text-[11px] font-mono px-2.5 py-1 rounded-full font-bold">
                  {payment === 'Free' ? 'FREE ENTRY' : `₹${priceAmount}`}
                </span>
                <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/20">
                  {teamFormat === 'Team' ? `Team Format (${teamMin}–${teamMax})` : 'Individual Solo'}
                </span>
                <span className="bg-emerald-600/90 text-white text-[11px] font-mono px-2.5 py-1 rounded-full font-bold">
                  {allowWaitlist ? 'Waitlist Enabled' : 'Fixed Capacity'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Space_Grotesk'] leading-tight">
                {title || 'Untitled Campus Event'}
              </h1>

              {tagline && (
                <p className="text-sm sm:text-base text-gray-200 font-['Plus_Jakarta_Sans'] font-medium">
                  {tagline}
                </p>
              )}

              <div className="text-xs font-mono text-gray-300 flex items-center gap-2 pt-1">
                <span>Organized by:</span>
                <strong className="text-white underline decoration-[#991B1B] decoration-2">
                  {communityName}
                </strong>
              </div>
            </div>
          </div>

          {/* Quick Key Facts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E1D5] bg-[#FAF8F5] border-b border-[#E6E1D5] p-3.5 sm:p-4 text-xs">
            <div className="p-2 sm:px-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Date &amp; Time</span>
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <CalendarBlank size={14} className="text-[#991B1B] flex-shrink-0" />
                <span className="truncate">{previewDateFormatted}</span>
              </div>
            </div>
            <div className="p-2 sm:px-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Location</span>
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <MapPin size={14} className="text-[#991B1B] flex-shrink-0" />
                <span className="truncate">{displayVenue}</span>
              </div>
            </div>
            <div className="p-2 sm:px-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Capacity</span>
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <UsersThree size={14} className="text-[#991B1B] flex-shrink-0" />
                <span>{capacity} Seats Available</span>
              </div>
            </div>
            <div className="p-2 sm:px-3">
              <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">RSVP Cutoff</span>
              <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                <Clock size={14} className="text-[#991B1B] flex-shrink-0" />
                <span className="truncate">{deadlineFormatted || 'Open until event start'}</span>
              </div>
            </div>
          </div>

          {/* Showcase Body Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Description & Overview */}
            <section className="space-y-3">
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A] border-b border-[#E6E1D5] pb-2 flex items-center gap-2">
                <Sparkle size={16} className="text-[#991B1B]" />
                About This Event &amp; Overview
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed font-['Plus_Jakarta_Sans'] whitespace-pre-line">
                {description || 'No description provided yet.'}
              </p>
              {tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 bg-[#FAF8F5] border border-[#D8D2C4] px-2.5 py-1 rounded-full text-xs font-mono text-gray-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Agenda Timeline */}
            <section className="space-y-3">
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A] border-b border-[#E6E1D5] pb-2 flex items-center gap-2">
                <ListBullets size={16} className="text-[#991B1B]" />
                Event Agenda &amp; Timeline Phases ({agenda.length})
              </h3>
              {agenda.length === 0 ? (
                <p className="text-xs text-gray-500 italic bg-[#FAF8F5] p-3 rounded-lg border border-[#D8D2C4]">
                  No agenda timeline added yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {agenda.map((ag, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl hover:border-gray-400 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#1A3A2A] text-white text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#991B1B]">
                            {ag.phase}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold font-['Space_Grotesk'] text-[#0F172A]">
                          {ag.title}
                        </h4>
                        {ag.desc && (
                          <p className="text-xs text-gray-600 font-['Plus_Jakarta_Sans'] leading-relaxed pt-0.5">
                            {ag.desc}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Rules & Campus Code */}
            <section className="space-y-3">
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A] border-b border-[#E6E1D5] pb-2 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#991B1B]" />
                Event Rules &amp; Entry Guidelines ({rules.length})
              </h3>
              {rules.length === 0 ? (
                <p className="text-xs text-gray-500 italic bg-[#FAF8F5] p-3 rounded-lg border border-[#D8D2C4]">
                  No specific guidelines configured.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg text-xs text-gray-800"
                    >
                      <Check size={14} className="text-emerald-700 flex-shrink-0 mt-0.5 font-bold" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Coordinator Support Desk Info */}
            <section className="space-y-3">
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A] border-b border-[#E6E1D5] pb-2 flex items-center gap-2">
                <User size={16} className="text-[#991B1B]" />
                Coordinator Desk &amp; Attendee Support
              </h3>
              <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Lead Coordinator</span>
                  <div className="font-bold text-[#0F172A]">{contact.leadName || 'Club Organiser'}</div>
                  <div className="text-gray-500 text-[11px]">{contact.leadRole || communityName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Direct Contacts</span>
                  <div className="text-gray-700 flex items-center gap-1.5">
                    <Envelope size={13} className="text-[#991B1B]" />
                    <span className="truncate">{contact.email || 'organizer@campuscircle.app'}</span>
                  </div>
                  <div className="text-gray-700 flex items-center gap-1.5 mt-0.5">
                    <Phone size={13} className="text-[#991B1B]" />
                    <span>{contact.phone || '+91 98201 12345'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Venue Helpdesk</span>
                  <div className="text-gray-700 flex items-center gap-1.5">
                    <Buildings size={13} className="text-[#991B1B]" />
                    <span>{contact.deskLocation || 'Tech Lab Foyer'}</span>
                  </div>
                  <div className="text-gray-500 text-[11px] font-mono mt-0.5">
                    Hours: {contact.operatingHours || '10 AM – 5 PM'}
                  </div>
                </div>
              </div>
            </section>

            {/* FAQs Accordion */}
            {faqs.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A] border-b border-[#E6E1D5] pb-2 flex items-center gap-2">
                  <Question size={16} className="text-[#991B1B]" />
                  Frequently Asked Questions ({faqs.length})
                </h3>
                <div className="space-y-2">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="border border-[#D8D2C4] rounded-xl overflow-hidden bg-[#FAF8F5]"
                      >
                        <button
                          type="button"
                          className="w-full text-left p-3.5 flex items-center justify-between gap-3 font-semibold text-xs text-[#0F172A] font-['Space_Grotesk'] hover:bg-white/50 transition-colors"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        >
                          <span>{faq.q}</span>
                          <span className="text-gray-400 font-mono text-xs">
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="p-3.5 pt-0 text-xs text-gray-600 font-['Plus_Jakarta_Sans'] leading-relaxed border-t border-[#E6E1D5] bg-white">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Custom Registration Form Preview */}
            <section className="space-y-3">
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A] border-b border-[#E6E1D5] pb-2 flex items-center gap-2">
                <FileText size={16} className="text-[#991B1B]" />
                Attendee RSVP Form Questions ({customQuestions.length})
              </h3>
              <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-4 space-y-3">
                <div className="p-2.5 bg-white border border-[#D8D2C4] rounded-lg text-xs text-gray-600 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#1A3A2A] flex-shrink-0" />
                  <span>
                    Verified Student Roll Number, Full Name, Branch, and Email will be captured automatically.
                  </span>
                </div>

                {customQuestions.length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-2">
                    No custom questionnaire questions added. Attendees register with profile details.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {customQuestions.map((q, idx) => (
                      <div key={q.id || idx} className="p-3 bg-white border border-[#D8D2C4] rounded-lg space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#0F172A]">
                            {idx + 1}. {q.label} {q.required && <span className="text-red-600">*</span>}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {q.type} · {q.scope || 'member'}
                          </span>
                        </div>
                        {q.placeholder && (
                          <div className="text-[11px] text-gray-400 font-mono italic">
                            Placeholder: "{q.placeholder}"
                          </div>
                        )}
                        {q.options && q.options.length > 0 && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap pt-1">
                            <span>Options:</span>
                            {q.options.map((opt, oIdx) => (
                              <span key={oIdx} className="bg-gray-100 px-2 py-0.5 rounded font-mono text-[10px]">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {requireWaiver && (
                  <div className="pt-2 border-t border-[#D8D2C4]">
                    <div className="flex items-start gap-2 text-xs text-gray-700 bg-white p-2.5 rounded border border-[#D8D2C4]">
                      <CheckSquare size={16} className="text-[#991B1B] flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Entry Waiver Agreement (Mandatory Checkbox):</span>
                        <span className="text-[11px] text-gray-600 italic">"{waiverText}"</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </motion.div>
      )}

      {/* ── PREVIEW VIEW 2: Student Ticket Pass ── */}
      {previewMode === 'ticket' && (
        <motion.div
          key="prev-ticket"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="bg-white border-2 border-[#D8D2C4] rounded-3xl overflow-hidden shadow-lg relative">
            {/* Poster Art Banner Header */}
            <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
              {bannerPreviewUrl ? (
                <img
                  src={bannerPreviewUrl}
                  alt={title || 'Event Cover'}
                  className="w-full h-full object-cover opacity-90"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono">
                  No banner uploaded
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-white/20">
                  {category}
                </span>
                <span className="bg-[#991B1B] text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  {payment === 'Free' ? 'FREE RSVP' : `₹${priceAmount}`}
                </span>
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-white font-bold font-['Space_Grotesk'] text-lg leading-tight line-clamp-2">
                  {title || 'Untitled Campus Event'}
                </h3>
              </div>
            </div>

            {/* Ticket Pass Body */}
            <div className="p-6 space-y-4 bg-[#FAF8F5]">
              <div className="flex items-center justify-between text-xs font-mono text-gray-500 border-b border-[#E6E1D5] pb-3">
                <span className="flex items-center gap-1.5 font-bold text-[#1A3A2A]">
                  ⚡ {communityName}
                </span>
                <span className="bg-white px-2 py-0.5 rounded border border-[#D8D2C4] text-[10px] text-gray-600">
                  PASS: CC-TICKET-PREVIEW
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Date &amp; Time</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <CalendarBlank size={14} className="text-[#991B1B] flex-shrink-0" />
                    <span>{previewDateFormatted}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Venue</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <MapPin size={14} className="text-[#991B1B] flex-shrink-0" />
                    <span className="truncate">{displayVenue}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Format</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    <UsersThree size={14} className="text-[#991B1B] flex-shrink-0" />
                    <span>{teamFormat === 'Team' ? `Team (${teamMin}–${teamMax})` : 'Individual Solo'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-0.5">Attendee</span>
                  <div className="flex items-center gap-1.5 font-bold text-gray-800 font-mono">
                    <User size={14} className="text-[#991B1B] flex-shrink-0" />
                    <span>Student Pass Holder</span>
                  </div>
                </div>
              </div>

              {tagline && (
                <p className="text-xs text-gray-600 italic bg-white p-3 rounded-xl border border-[#E6E1D5]">
                  "{tagline}"
                </p>
              )}

              {/* Perforated Divider */}
              <div className="relative py-2 flex items-center justify-between">
                <div className="w-full border-t-2 border-dashed border-[#D8D2C4]" />
              </div>

              {/* QR Verification Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white border border-[#D8D2C4] rounded-xl flex items-center justify-center text-[#0F172A] shadow-xs">
                    <QrCode size={36} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block uppercase">Door Check-In Pass</span>
                    <span className="text-xs font-bold text-gray-800 font-mono">Scan at Venue Desk</span>
                    <span className="text-[10px] text-emerald-700 block font-mono">Verified Attendee Pass</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold block">
                    Total: {capacity} Seats
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── PREVIEW VIEW 3: Feed Discovery Card ── */}
      {previewMode === 'feed' && (
        <motion.div
          key="prev-feed"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white border border-[#D8D2C4] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-40 bg-slate-800 relative">
              {bannerPreviewUrl ? (
                <img src={bannerPreviewUrl} alt="" className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-mono">
                  No banner uploaded
                </div>
              )}
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                  {category}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className="bg-[#1A3A2A] text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                  {payment === 'Free' ? 'Free' : `₹${priceAmount}`}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wider block">
                {communityName}
              </span>
              <h4 className="font-['Space_Grotesk'] font-bold text-base text-[#0F172A] leading-snug">
                {title || 'Untitled Campus Event'}
              </h4>
              {tagline && (
                <p className="text-xs text-gray-600 line-clamp-2">
                  {tagline}
                </p>
              )}

              <div className="text-xs text-gray-600 space-y-1.5 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <CalendarBlank size={13} className="text-[#991B1B]" />
                  <span>{previewDateFormatted}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#991B1B]" />
                  <span className="truncate">{displayVenue}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E6E1D5] flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500">0 of {capacity} registered</span>
                <span className="font-bold text-[#991B1B] flex items-center gap-1">
                  View Details &amp; Register →
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── PREVIEW VIEW 4: Pre-Flight Readiness Checklist ── */}
      {previewMode === 'checklist' && (
        <motion.div
          key="prev-checklist"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-[#D8D2C4] rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A]">
                Pre-Flight Publishing Readiness
              </h3>
              <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans']">
                Complete all mandatory publishing criteria before opening registrations to campus students.
              </p>
            </div>
            <span
              className={`text-sm font-mono font-bold px-3 py-1 rounded-full border ${
                validation.score >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {validation.score}% Complete
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {validation.items.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  item.valid
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-amber-50/40 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  {item.valid ? (
                    <CheckCircle size={18} weight="fill" className="text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Warning size={18} weight="fill" className="text-amber-500 flex-shrink-0" />
                  )}
                  <span className={item.valid ? 'text-gray-800 font-medium' : 'text-amber-900 font-semibold'}>
                    {item.label}
                  </span>
                </div>

                {!item.valid && item.step && (
                  <button
                    type="button"
                    className="text-xs font-mono font-bold text-[#991B1B] hover:underline flex-shrink-0"
                    onClick={() => setActiveStep(item.step)}
                  >
                    Edit →
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D8D2C4] flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-gray-700 font-['Plus_Jakarta_Sans']">
              {validation.canPublish
                ? '✨ All mandatory fields are satisfied! You can now publish your event listing live to the student directory.'
                : '⚠️ Please complete all required items above before publishing.'}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="org-btn org-btn-secondary text-xs"
                onClick={() => handleSaveEvent('draft')}
                disabled={isSavingDraft || isPublishing}
              >
                <FloppyDisk size={14} />
                <span>{isSavingDraft ? 'Saving…' : 'Save as Draft'}</span>
              </button>

              <button
                type="button"
                className="org-btn org-btn-primary text-xs"
                onClick={() => handleSaveEvent('published')}
                disabled={isPublishing || !validation.canPublish}
              >
                <RocketLaunch size={14} />
                <span>{isPublishing ? 'Publishing…' : 'Publish Event Listing'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Bottom Step Navigation Bar ── */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs"
          onClick={() => setActiveStep('questions')}
        >
          <ArrowLeft size={13} />
          <span>Back to RSVP Form</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="org-btn org-btn-secondary text-xs"
            onClick={() => handleSaveEvent('draft')}
            disabled={isSavingDraft || isPublishing}
          >
            <FloppyDisk size={14} />
            <span>{isSavingDraft ? 'Saving Draft…' : 'Save as Draft'}</span>
          </button>

          <button
            type="button"
            className="org-btn org-btn-primary text-xs shadow-md shadow-[#991B1B]/20"
            onClick={() => handleSaveEvent('published')}
            disabled={isPublishing || isSavingDraft}
          >
            {isPublishing ? (
              <CircleNotch size={14} className="animate-spin" />
            ) : (
              <RocketLaunch size={14} />
            )}
            <span>{isPublishing ? 'Publishing Event…' : 'Publish Event Listing'}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
