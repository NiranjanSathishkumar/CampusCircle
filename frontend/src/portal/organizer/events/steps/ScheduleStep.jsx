/**
 * Wizard step 2 — dates, times and venue.
 */
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Buildings, CaretRight, Globe } from '@phosphor-icons/react';
import { CAMPUS_VENUES } from '@/portal/organizer/events/createEventConstants';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// `eventDate` is always a datetime-local value string ("YYYY-MM-DDTHH:mm") —
// the only representation the backend's required Date field can be built
// from reliably. This derives the human-readable label from it rather than
// the other way around, so there's never a "date" the calendar can't parse.
export function formatEventDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const hours12 = d.getHours() % 12 || 12;
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hours12}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
}

// Local YYYY-MM-DDTHH:mm (not toISOString, which shifts to UTC and can
// silently roll the calendar day back for the datetime-local input's value).
function toDatetimeLocalValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function nextWeekday(targetDay, hour, minute, weeksAhead = 0) {
  const d = new Date();
  d.setSeconds(0, 0);
  let daysUntil = (targetDay - d.getDay() + 7) % 7;
  if (daysUntil === 0) daysUntil = 7; // "this/next X" always means a future occurrence
  d.setDate(d.getDate() + daysUntil + weeksAhead * 7);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const QUICK_PRESETS = [
  { label: 'This Saturday · 10:00 AM', compute: () => nextWeekday(6, 10, 0) },
  { label: 'Next Wednesday · 02:00 PM', compute: () => nextWeekday(3, 14, 0) },
  { label: 'Next Friday · 04:00 PM', compute: () => nextWeekday(5, 16, 0) },
  { label: 'In 2 Weeks · 09:00 AM', compute: () => nextWeekday(new Date().getDay(), 9, 0, 2) },
];

export default function ScheduleStep({
  customVenueName,
  eventDate,
  isCustomVenue,
  isVirtual,
  setActiveStep,
  setCustomVenueName,
  setEventDate,
  setIsCustomVenue,
  setIsVirtual,
  setVenue,
  setVirtualLink,
  title,
  venue,
  virtualLink,
}) {
  return (
    <motion.div
      key="step-schedule"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#D8D2C4] rounded-xl p-5 shadow-sm space-y-4"
    >
      <div className="border-b border-[#E6E1D5] pb-3">
        <h2 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A]">
          Event Timing &amp; Venue Logistics
        </h2>
        <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
          Set event calendar schedules, lab bookings, and physical check-in locations.
        </p>
      </div>

      {/* Date & Time Picker */}
      <div className="org-form-group">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="evt-create-date" className="org-form-label mb-0">
            Date &amp; Start Time <span className="text-[#991B1B]">*</span>
          </label>
          <span className="text-[10px] font-mono text-gray-400">
            {eventDate ? formatEventDate(eventDate) : 'Not set yet'}
          </span>
        </div>
        <input
          id="evt-create-date"
          type="datetime-local"
          className="org-form-input font-mono text-xs"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        {/* Date Quick Presets */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] font-mono text-gray-500">Quick Presets:</span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="text-[10px] font-mono bg-[#FAF8F5] border border-[#D8D2C4] px-2 py-0.5 rounded hover:border-[#991B1B] text-gray-700"
              onClick={() => setEventDate(toDatetimeLocalValue(preset.compute()))}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Venue / Campus Location */}
      <div className="org-form-group">
        <div className="flex items-center justify-between mb-1.5">
          <label className="org-form-label mb-0">
            Event Venue Location <span className="text-[#991B1B]">*</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isVirtual}
              onChange={(e) => setIsVirtual(e.target.checked)}
              className="rounded border-[#D8D2C4] text-[#991B1B] focus:ring-[#991B1B]"
            />
            <span>Online / Virtual Link</span>
          </label>
        </div>

        {isVirtual ? (
          <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-lg border border-[#D8D2C4]">
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-blue-600 flex-shrink-0" />
              <input
                type="url"
                className="org-form-input flex-1 text-xs"
                placeholder="https://meet.google.com/xxx-yyyy-zzz or Zoom link"
                value={virtualLink}
                onChange={(e) => setVirtualLink(e.target.value)}
              />
            </div>
            <p className="text-[11px] text-gray-500 font-mono">
              Meeting access links are automatically unlocked in student passbooks after confirming RSVP.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Campus Preset Venue Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMPUS_VENUES.map((cv) => {
                const isSelected = !isCustomVenue && venue === cv.name;
                return (
                  <button
                    key={cv.name}
                    type="button"
                    className={`flex items-start gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] ring-1 ring-[#1A3A2A]'
                        : 'bg-[#FAF8F5] border-[#D8D2C4] hover:border-gray-400'
                    }`}
                    onClick={() => {
                      setIsCustomVenue(false);
                      setVenue(cv.name);
                    }}
                  >
                    <Buildings size={16} className={isSelected ? 'text-[#1A3A2A]' : 'text-gray-500'} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[#0F172A] truncate">{cv.name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {cv.building} · {cv.floor} (Cap: {cv.cap})
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Venue Option */}
            <div className="pt-2 border-t border-[#E6E1D5]">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={isCustomVenue}
                  onChange={(e) => setIsCustomVenue(e.target.checked)}
                  className="rounded border-[#D8D2C4] text-[#991B1B] focus:ring-[#991B1B]"
                />
                <span>Specify Custom / Other Room</span>
              </label>
              {isCustomVenue && (
                <input
                  type="text"
                  className="org-form-input text-xs"
                  placeholder="e.g. Electrical Engineering Project Lab 2, 4th Floor"
                  value={customVenueName}
                  onChange={(e) => setCustomVenueName(e.target.value)}
                />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs"
          onClick={() => setActiveStep('identity')}
        >
          <ArrowLeft size={13} />
          <span>Previous</span>
        </button>
        <button
          type="button"
          className="org-btn org-btn-secondary text-xs"
          onClick={() => setActiveStep('capacity')}
        >
          <span>Next: Capacity &amp; Pricing</span>
          <CaretRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
