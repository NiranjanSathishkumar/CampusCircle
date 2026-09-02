/**
 * Wizard step 3 — seats, team size, fees and waitlist.
 */
import { motion } from 'motion/react';
import { ArrowLeft, CaretRight, CheckCircle, CurrencyInr, Ticket, User, UsersThree, Warning } from '@phosphor-icons/react';

export default function CapacityStep({
  allowWaitlist,
  capacity,
  payment,
  priceAmount,
  setActiveStep,
  setAllowWaitlist,
  setCapacity,
  setPayment,
  setPriceAmount,
  setTeamFormat,
  setTeamMax,
  setTeamMin,
  teamFormat,
  teamMax,
  teamMin,
}) {
  return (
    <motion.div
      key="step-capacity"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#D8D2C4] rounded-xl p-5 shadow-sm space-y-4"
    >
      <div className="border-b border-[#E6E1D5] pb-3">
        <h2 className="text-base font-bold font-['Space_Grotesk'] text-[#0F172A]">
          Registration Format, Seating &amp; Pricing
        </h2>
        <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
          Configure entry mode (solo vs. teams), capacity quotas, waitlist automation, and payment tiers.
        </p>
      </div>

      {/* Team Format Mode */}
      <div className="org-form-group">
        <label className="org-form-label">Registration Participation Format</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              teamFormat === 'Solo'
                ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] ring-1 ring-[#1A3A2A]'
                : 'bg-[#FAF8F5] border-[#D8D2C4] hover:border-gray-400'
            }`}
            onClick={() => setTeamFormat('Solo')}
          >
            <User size={20} className={teamFormat === 'Solo' ? 'text-[#1A3A2A]' : 'text-gray-500'} />
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Solo Individual Entry</div>
              <div className="text-[10px] text-gray-500 font-mono">1 Ticket Pass per Student</div>
            </div>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              teamFormat === 'Team'
                ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] ring-1 ring-[#1A3A2A]'
                : 'bg-[#FAF8F5] border-[#D8D2C4] hover:border-gray-400'
            }`}
            onClick={() => setTeamFormat('Team')}
          >
            <UsersThree size={20} className={teamFormat === 'Team' ? 'text-[#1A3A2A]' : 'text-gray-500'} />
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Team Squad Entry</div>
              <div className="text-[10px] text-gray-500 font-mono">Group Passes with Team Leader</div>
            </div>
          </button>
        </div>

        {/* Team Size Limits */}
        {teamFormat === 'Team' && (
          <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg space-y-2">
            <label className="text-xs font-bold text-gray-800 font-['Space_Grotesk'] block">
              Team Member Bounds (Min — Max)
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <span className="text-[10px] font-mono text-gray-500 block mb-0.5">Min Members</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="org-form-input font-mono text-xs"
                  value={teamMin}
                  onChange={(e) => setTeamMin(Number(e.target.value))}
                />
              </div>
              <span className="text-gray-400 font-mono text-xs pt-4">to</span>
              <div className="flex-1">
                <span className="text-[10px] font-mono text-gray-500 block mb-0.5">Max Members</span>
                <input
                  type="number"
                  min="1"
                  max="15"
                  className="org-form-input font-mono text-xs"
                  value={teamMax}
                  onChange={(e) => setTeamMax(Number(e.target.value))}
                />
              </div>
            </div>
            {teamMin > teamMax && (
              <span className="text-xs text-red-600 font-mono flex items-center gap-1 mt-1">
                <Warning size={13} /> Minimum team size cannot exceed maximum team size
              </span>
            )}
          </div>
        )}
      </div>

      {/* Total Seating Capacity */}
      <div className="org-form-group">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="evt-create-cap" className="org-form-label mb-0">
            Total Seat Capacity <span className="text-[#991B1B]">*</span>
          </label>
          <span className="text-[10px] font-mono text-gray-500">Max RSVPs</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="evt-create-cap"
            type="number"
            min="1"
            className="org-form-input font-mono !text-base !font-bold flex-1"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>
        {/* Capacity preset pills */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] font-mono text-gray-500">Presets:</span>
          {[30, 50, 60, 100, 200, 350, 500].map((capNum) => (
            <button
              key={capNum}
              type="button"
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                capacity === capNum
                  ? 'bg-[#0F172A] text-white border-[#0F172A]'
                  : 'bg-[#FAF8F5] border-[#D8D2C4] text-gray-700 hover:border-[#991B1B]'
              }`}
              onClick={() => setCapacity(capNum)}
            >
              {capNum} seats
            </button>
          ))}
        </div>
      </div>

      {/* Waitlist Toggle */}
      <div className="p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#0F172A] block font-['Space_Grotesk']">
            Enable Waitlist Automation
          </span>
          <p className="text-[11px] text-gray-600 font-['Plus_Jakarta_Sans'] mt-0.5">
            Automatically queue students when capacity is filled; promote next in line if cancellations occur.
          </p>
        </div>
        <input
          type="checkbox"
          checked={allowWaitlist}
          onChange={(e) => setAllowWaitlist(e.target.checked)}
          className="rounded border-[#D8D2C4] text-[#991B1B] focus:ring-[#991B1B] w-4 h-4 cursor-pointer"
        />
      </div>

      {/* Payment Type */}
      <div className="org-form-group">
        <label className="org-form-label">Payment Tier</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              payment === 'Free'
                ? 'bg-[#1A3A2A]/5 border-[#1A3A2A] ring-1 ring-[#1A3A2A]'
                : 'bg-[#FAF8F5] border-[#D8D2C4] hover:border-gray-400'
            }`}
            onClick={() => setPayment('Free')}
          >
            <CheckCircle size={20} className={payment === 'Free' ? 'text-[#1A3A2A]' : 'text-gray-500'} />
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Free Registration</div>
              <div className="text-[10px] text-gray-500 font-mono">₹0 Entry Ticket Pass</div>
            </div>
          </button>

          <button
            type="button"
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              payment === 'Paid'
                ? 'bg-[#991B1B]/5 border-[#991B1B] ring-1 ring-[#991B1B]'
                : 'bg-[#FAF8F5] border-[#D8D2C4] hover:border-gray-400'
            }`}
            onClick={() => setPayment('Paid')}
          >
            <CurrencyInr size={20} className={payment === 'Paid' ? 'text-[#991B1B]' : 'text-gray-500'} />
            <div>
              <div className="font-bold text-xs text-[#0F172A]">Paid Entry Pass</div>
              <div className="text-[10px] text-gray-500 font-mono">Custom INR Ticket Fee</div>
            </div>
          </button>
        </div>

        {payment === 'Paid' && (
          <div className="mt-3 p-3 bg-[#FAF8F5] border border-[#D8D2C4] rounded-lg space-y-2">
            <label htmlFor="evt-create-price" className="text-xs font-bold text-gray-800 block">
              Ticket Price per Attendee (₹)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-500">₹</span>
                <input
                  id="evt-create-price"
                  type="number"
                  min="1"
                  className="org-form-input !pl-7 font-mono font-bold text-sm"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(Number(e.target.value))}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Online payment receipts with digital QR passes are sent instantly to student campus emails upon checkout.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs"
          onClick={() => setActiveStep('schedule')}
        >
          <ArrowLeft size={13} />
          <span>Previous</span>
        </button>
        <button
          type="button"
          className="org-btn org-btn-secondary text-xs"
          onClick={() => setActiveStep('agenda')}
        >
          <span>Next: Agenda &amp; Rules</span>
          <CaretRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}
