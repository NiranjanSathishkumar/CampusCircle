import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Ticket,
  CalendarBlank,
  MapPin,
  CheckCircle,
  Circle,
  Envelope,
  Phone,
  GraduationCap,
  UsersThree,
  FileText,
  Clock,
  ArrowSquareOut,
  CurrencyInr,
  UserCheck,
} from '@phosphor-icons/react';
import { listTeamMembers } from '@/portal/organizer/events/events.api';

export default function OrganizerRegistrationSubmissionModal({
  registration,
  event,
  onClose,
  onCheckIn,
  checkingIn,
}) {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    if (!registration?.teamName) {
      setTeamMembers([]);
      return;
    }
    let cancelled = false;
    listTeamMembers(registration.id)
      .then(({ teamMembers: members }) => {
        if (!cancelled) setTeamMembers(members.filter((m) => m.student).map((m) => ({ name: m.student.name, status: m.status })));
      })
      .catch(() => { if (!cancelled) setTeamMembers([]); });
    return () => { cancelled = true; };
  }, [registration?.id, registration?.teamName]);

  if (!registration) return null;

  const isCheckedIn = registration.checkedIn;
  const formAnswers = registration.formAnswers || [];

  return (
    <div
      className="org-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className="org-modal org-submission-modal"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{ maxWidth: 640 }}
      >
        {/* Header */}
        <div className="org-modal-header border-b border-[#D8D2C4] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1A3A2A]/10 text-[#1A3A2A] flex items-center justify-center font-bold font-mono">
              <Ticket size={18} />
            </div>
            <div>
              <h2 id="submission-modal-title" className="org-modal-title text-base font-bold text-[#0F172A]">
                Registration Submission Details
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                Ticket ID: <span className="text-[#991B1B] font-bold">{registration.ticketId}</span> · {event?.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-btn-close p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="org-modal-body p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Student Profile Card */}
          <div className="bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1A3A2A] text-white flex items-center justify-center font-bold text-lg font-['Space_Grotesk']">
                {registration.name ? registration.name.slice(0, 2).toUpperCase() : 'ST'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-['Space_Grotesk'] font-bold text-[#0F172A] text-base">
                    {registration.name}
                  </h3>
                  {isCheckedIn ? (
                    <span className="org-checkin-badge org-checkin-badge--in">
                      <CheckCircle size={12} weight="fill" /> Checked In
                    </span>
                  ) : (
                    <span className="org-checkin-badge org-checkin-badge--pending">
                      <Circle size={12} /> Pending Check-in
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 mt-1 flex-wrap font-mono">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={14} className="text-gray-500" />
                    {registration.branch} · {registration.year}
                  </span>
                  <span>Roll: <strong>{registration.rollNo}</strong></span>
                </div>
              </div>
            </div>

            {/* Check-In Action — one-way, mirrors the real QR check-in; no undo */}
            {!isCheckedIn && (
              <button
                type="button"
                className="org-btn org-btn-primary !bg-[#1A3A2A] !py-1.5 !px-3 text-xs"
                onClick={() => onCheckIn?.(registration)}
                disabled={checkingIn}
              >
                <UserCheck size={14} />
                <span>{checkingIn ? 'Checking In…' : 'Mark Checked In'}</span>
              </button>
            )}
          </div>

          {/* Registration Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#D8D2C4] rounded-lg p-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Submitted On</span>
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                <CalendarBlank size={12} className="text-[#991B1B]" />
                {registration.registeredOn || 'Aug 2026'}
              </span>
            </div>
            <div className="bg-white border border-[#D8D2C4] rounded-lg p-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Payment Tier</span>
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                <CurrencyInr size={12} className="text-[#1A3A2A]" />
                {registration.paymentStatus || 'Free'}
              </span>
            </div>
            <div className="bg-white border border-[#D8D2C4] rounded-lg p-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Email Verified</span>
              <span className="text-xs font-bold text-emerald-700 truncate block mt-0.5" title={registration.email}>
                {registration.email || `${registration.rollNo}@siesgst.ac.in`}
              </span>
            </div>
            <div className="bg-white border border-[#D8D2C4] rounded-lg p-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block">Team Mode</span>
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                <UsersThree size={12} className="text-blue-600" />
                {registration.teamName ? registration.teamName : 'Solo Entry'}
              </span>
            </div>
          </div>

          {/* Team Members info if applicable */}
          {registration.teamName && (
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 font-['Space_Grotesk']">
                <UsersThree size={15} /> Team Roster ({teamMembers.length + 1} Members, incl. pending invites)
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-2.5 py-1 bg-white border border-blue-200 rounded-full text-xs font-semibold text-blue-900 flex items-center gap-1">
                  👑 {registration.name} (Team Lead)
                </span>
                {teamMembers.map((member, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-blue-200 rounded-full text-xs text-gray-700 flex items-center gap-1.5">
                    {member.name}
                    {member.status === 'pending' ? (
                      <span className="text-amber-600 font-semibold">· pending</span>
                    ) : member.status === 'accepted' ? (
                      <CheckCircle size={11} weight="fill" className="text-emerald-600" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Custom Form Answers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#D8D2C4] pb-2">
              <h4 className="font-['Space_Grotesk'] font-bold text-sm text-[#0F172A] flex items-center gap-1.5">
                <FileText size={16} className="text-[#991B1B]" /> Custom Registration Form Responses
              </h4>
              <span className="text-[11px] font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                {formAnswers.length} responses captured
              </span>
            </div>

            {formAnswers.length === 0 ? (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No custom questions were configured for this registration form. Standard student profile data was collected.
              </p>
            ) : (
              <div className="space-y-2.5">
                {formAnswers.map((item, idx) => {
                  const isUrl = item.a && (item.a.startsWith('http://') || item.a.startsWith('https://') || item.a.includes('github.com') || item.a.includes('.com'));
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-[#D8D2C4] rounded-lg p-3 space-y-1 hover:border-[#1A3A2A] transition-colors"
                    >
                      <span className="text-[11px] font-mono font-bold text-[#991B1B] block">
                        Q{idx + 1}. {item.q}
                      </span>
                      {isUrl ? (
                        <a
                          href={item.a.startsWith('http') ? item.a : `https://${item.a}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 font-mono font-medium hover:underline inline-flex items-center gap-1 break-all"
                        >
                          {item.a} <ArrowSquareOut size={12} />
                        </a>
                      ) : (
                        <p className="text-xs text-gray-800 leading-relaxed font-['Plus_Jakarta_Sans'] font-medium bg-[#FAF8F5] p-2 rounded border border-[#E5E0D6]">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="org-modal-footer bg-[#FAF8F5] border-t border-[#D8D2C4] p-3 px-5 flex items-center justify-between">
          <span className="text-[11px] font-mono text-gray-500">
            SIES GST Verified Student RSVP · Pass ID #{registration.ticketId}
          </span>
          <button
            type="button"
            className="org-btn org-btn-secondary !py-1.5 !px-4 text-xs font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
