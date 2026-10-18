/**
 * Wizard step 3 — seats, team size, fees and waitlist.
 */
import { motion } from 'motion/react';
import { ArrowLeft, CaretRight, CheckCircle, CurrencyInr, Info, QrCode, Ticket, Trash, UploadSimple, User, UsersThree, Warning } from '@phosphor-icons/react';

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
  paymentQrPreviewUrl,
  handlePaymentQrFileChange,
  handleRemovePaymentQr,
  upiId,
  setUpiId,
  paymentInstructions,
  setPaymentInstructions,
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
          <div className="mt-3 p-4 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl space-y-4">
            <div>
              <label htmlFor="evt-create-price" className="text-xs font-bold text-gray-800 block mb-1">
                Ticket Price per Attendee (₹) <span className="text-[#991B1B]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-gray-500">₹</span>
                <input
                  id="evt-create-price"
                  type="number"
                  min="1"
                  className="org-form-input !pl-7 font-mono font-bold text-sm"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(Number(e.target.value))}
                  placeholder="e.g. 99"
                />
              </div>
            </div>

            {/* UPI ID */}
            <div>
              <label htmlFor="evt-upi-id" className="text-xs font-bold text-gray-800 block mb-1">
                Organizer UPI ID / VPA <span className="text-gray-400 font-normal">(Optional for display)</span>
              </label>
              <input
                id="evt-upi-id"
                type="text"
                className="org-form-input font-mono text-xs"
                value={upiId || ''}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. siesgst.council@okhdfcbank or 9820112345@upi"
              />
              <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                Shown to students as an alternate copyable payment address alongside the QR code.
              </span>
            </div>

            {/* Payment QR Code Upload */}
            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Organizer Payment QR Code Image
              </label>
              <div className="space-y-2">
                {paymentQrPreviewUrl ? (
                  <div className="flex items-start gap-4 p-3 bg-white border border-[#D8D2C4] rounded-lg">
                    <div className="relative w-28 h-28 bg-[#FAF8F5] border border-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img
                        src={paymentQrPreviewUrl}
                        alt="Payment QR Code preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <CheckCircle size={15} />
                        <span>Payment QR code active</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        This QR code will be displayed to students during registration so they can scan and pay with any UPI app.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-[11px] font-semibold text-[#1A3A2A] hover:underline cursor-pointer">
                          Replace Image
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                            onChange={handlePaymentQrFileChange}
                          />
                        </label>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={handleRemovePaymentQr}
                          className="text-[11px] font-semibold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#D8D2C4] rounded-xl p-5 cursor-pointer hover:border-[#1A3A2A] hover:bg-[#FAF8F5] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center">
                      <QrCode size={22} />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-gray-800 block">
                        Click to upload Payment QR Code
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                        JPG, JPEG, PNG, or WebP (up to 5MB)
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handlePaymentQrFileChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Payment Instructions */}
            <div>
              <label htmlFor="evt-payment-instructions" className="text-xs font-bold text-gray-800 block mb-1">
                Payment Instructions for Students
              </label>
              <textarea
                id="evt-payment-instructions"
                rows={3}
                className="org-form-input text-xs"
                value={paymentInstructions || ''}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                placeholder="e.g. Scan using GPay / PhonePe / Paytm. In remarks/note, include your Roll No. Upload your payment transaction screenshot below after paying."
              />
              <span className="text-[10px] text-gray-500 font-mono mt-1 block">
                Shown to students on the payment screen. Keep it clear and concise.
              </span>
            </div>

            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-[11px] text-blue-900 leading-snug">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-700" />
              <span>
                <strong>Verification Workflow:</strong> When students register, a slot is reserved for 30 minutes. Once they upload their payment proof screenshot, it will appear under <strong>Payment Verification</strong> in your event dashboard for approval before their ticket is generated.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E6E1D5]">
        <button
          type="button"
          className="org-btn org-btn-ghost text-xs"
          onClick={() => setActiveStep('schedule')}
        >
          <ArrowLeft size={13} />
          <span>Back to Schedule</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="org-btn org-btn-ghost text-xs text-gray-500 hover:text-gray-900"
            onClick={() => setActiveStep('preview')}
          >
            <span className="font-mono">⚡ Quick Preview</span>
          </button>
          <button
            type="button"
            className="org-btn org-btn-primary text-xs"
            onClick={() => setActiveStep('agenda')}
          >
            <span>Next: Agenda &amp; Guidelines</span>
            <CaretRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
