import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CurrencyInr,
  QrCode,
  Copy,
  Check,
  CheckCircle,
  Clock,
  Warning,
  UploadSimple,
  Image as ImageIcon,
  Ticket,
  ArrowRight,
  ShieldCheck,
  XCircle,
  FileImage,
  ArrowSquareOut,
  Sparkle,
  Eye,
  X,
} from '@phosphor-icons/react';
import { uploadPaymentProof } from '@/features/events/events.api';

// Helper to format remaining milliseconds into mm:ss
function formatRemaining(ms) {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function PaidRegistrationPaymentView({
  event,
  registration: initialReg,
  onDone,
  onUpdated,
}) {
  const [reg, setReg] = useState(initialReg);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showProofLightbox, setShowProofLightbox] = useState(false);

  const fileInputRef = useRef(null);

  // Synchronize internal reg if parent registration prop updates
  useEffect(() => {
    if (initialReg) setReg(initialReg);
  }, [initialReg]);

  // Time remaining on slot reservation (30 min window)
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!reg?.slotExpiresAt) return null;
    return Math.max(0, new Date(reg.slotExpiresAt).getTime() - Date.now());
  });

  useEffect(() => {
    if (!reg?.slotExpiresAt || reg.paymentStatus === 'confirmed') return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, new Date(reg.slotExpiresAt).getTime() - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [reg?.slotExpiresAt, reg?.paymentStatus]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (filePreview?.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    };
  }, [filePreview]);

  const priceAmount = event.price_amount || event.price || 0;
  const upiId = event.upiId || 'siesgst.events@okhdfcbank';
  const paymentInstructions =
    event.paymentInstructions ||
    'Scan the QR code using Google Pay, PhonePe, Paytm, or any UPI app. Enter the exact registration fee. Save your payment transaction screenshot and upload it below as verification proof.';

  const qrImageUrl = event.paymentQrCode?.url || event.paymentQrUrl;

  const handleCopyUpi = () => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId).then(() => {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    });
  };

  const handleCopyTxId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopiedTxId(true);
      setTimeout(() => setCopiedTxId(false), 2000);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    setUploadError('');

    // Strict image format validation (JPG, JPEG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Please upload an image (JPG, PNG, or WebP). PDF or text files are not accepted.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please upload a smaller image.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    if (filePreview?.startsWith('blob:')) URL.revokeObjectURL(filePreview);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile || !reg?._id) return;
    setUploading(true);
    setUploadError('');
    try {
      const res = await uploadPaymentProof(reg._id, selectedFile);
      setReg(res.registration);
      setSelectedFile(null);
      setFilePreview(null);
      setUploadSuccess(true);
      if (onUpdated) onUpdated(res.registration);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload payment proof. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isConfirmed = reg?.paymentStatus === 'confirmed';
  const isProofSubmitted = reg?.paymentStatus === 'proof_submitted';
  const isRejected = reg?.paymentStatus === 'rejected';
  const isPending = !isProofSubmitted && !isConfirmed && !isRejected;

  return (
    <div className="events-dialog-body space-y-4">
      {/* ── Status Banner ── */}
      <div className="rounded-xl border p-4 bg-white shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 font-['Space_Grotesk'] uppercase tracking-wider">
            Registration &amp; Payment Status
          </span>
          {/* Reservation Timer if applicable */}
          {timeLeft !== null && timeLeft > 0 && !isConfirmed && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-mono font-semibold">
              <Clock size={13} className="animate-spin text-blue-600" />
              <span>Reserved for {formatRemaining(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Dynamic Status Display */}
        {isConfirmed ? (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} weight="bold" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 font-['Space_Grotesk']">
                Payment Confirmed &amp; Registration Active
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                Your payment has been verified by the organizer and your ticket pass is active.
              </div>
            </div>
          </div>
        ) : isProofSubmitted ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Clock size={22} weight="bold" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-950 font-['Space_Grotesk']">
                Payment Proof Submitted — Verification Pending
              </div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                The organizer is reviewing your payment. You can preview your submitted screenshot below.
              </div>
            </div>
          </div>
        ) : isRejected ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 text-red-800 flex items-center justify-center shrink-0 mt-0.5">
              <XCircle size={22} weight="bold" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-red-950 font-['Space_Grotesk']">
                Payment Proof Rejected by Organizer
              </div>
              {reg.paymentRejectionReason && (
                <div className="text-xs text-red-800 mt-1 bg-red-100/70 p-2 rounded border border-red-200 font-mono">
                  <strong>Reason:</strong> {reg.paymentRejectionReason}
                </div>
              )}
              <div className="text-[11px] text-red-700 mt-1">
                Please review your previously uploaded screenshot below and upload a clear, valid payment proof.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
              <Clock size={22} weight="bold" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-950 font-['Space_Grotesk']">
                Slot Reserved — Payment Required
              </div>
              <div className="text-[11px] text-blue-800 mt-0.5">
                Your seat has been reserved. Please complete payment and upload the screenshot proof.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Currently Uploaded Payment Screenshot Preview ── */}
      {reg?.paymentProof?.url && (
        <div className="p-4 bg-white border border-[#D8D2C4] rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900 font-['Space_Grotesk'] flex items-center gap-1.5">
              <FileImage size={16} className="text-[#1A3A2A]" />
              <span>Your Uploaded Payment Screenshot</span>
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {reg.paymentProof.uploadedAt
                ? `Uploaded ${new Date(reg.paymentProof.uploadedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`
                : ''}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF8F5] p-3 rounded-lg border border-[#E6E1D5]">
            {/* Clickable Image Preview Thumbnail */}
            <div
              className="relative w-32 h-32 rounded-lg overflow-hidden bg-white border border-[#D8D2C4] shadow-xs cursor-pointer group shrink-0"
              onClick={() => setShowProofLightbox(true)}
              title="Click to view full screenshot"
            >
              <img
                src={reg.paymentProof.url}
                alt="Submitted payment screenshot"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-semibold gap-1">
                <Eye size={15} />
                <span>View Full</span>
              </div>
            </div>

            {/* Meta & Status Details */}
            <div className="flex-1 space-y-1.5 text-center sm:text-left w-full">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <span className="text-xs font-bold text-gray-800 font-mono truncate max-w-[220px]">
                  {reg.paymentProof.filename || 'payment_proof.jpg'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowProofLightbox(true)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#1A3A2A] hover:underline font-semibold cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Preview Full Image</span>
                </button>
                <a
                  href={reg.paymentProof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 font-semibold"
                >
                  <ArrowSquareOut size={13} />
                  <span>Open in tab</span>
                </a>
              </div>

              <div className="text-[11px]">
                {isConfirmed ? (
                  <span className="text-emerald-700 font-bold flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle size={14} weight="fill" /> Verified &amp; Approved by Organizer
                  </span>
                ) : isRejected ? (
                  <span className="text-red-700 font-bold flex items-center justify-center sm:justify-start gap-1">
                    <XCircle size={14} weight="fill" /> Proof was rejected. Please upload a new screenshot below.
                  </span>
                ) : (
                  <span className="text-amber-800 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <Clock size={14} weight="fill" /> Awaiting Organizer Verification
                  </span>
                )}
              </div>

              {reg.transactionId && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                  <span><strong>UTR / Ref:</strong> {reg.transactionId}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyTxId(reg.transactionId)}
                    className="text-gray-400 hover:text-gray-700 ml-1 cursor-pointer"
                    title="Copy UTR ID"
                  >
                    {copiedTxId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Event Summary & Amount Card ── */}
      <div className="p-4 bg-white border border-[#D8D2C4] rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">
            Payable Amount
          </span>
          <div className="flex items-baseline gap-1 text-2xl font-black font-['Space_Grotesk'] text-[#0F172A] mt-0.5">
            <CurrencyInr size={22} weight="bold" />
            <span>{priceAmount}</span>
          </div>
          <span className="text-[11px] text-gray-500 font-mono">
            {event.title}
          </span>
        </div>

        {/* UPI Copy Capsule */}
        {upiId && (
          <div className="text-right">
            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block mb-1">
              Organizer UPI ID / VPA
            </span>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D2C4] bg-[#FAF8F5] hover:bg-gray-100 text-xs font-mono font-bold text-gray-800 transition-colors shadow-2xs cursor-pointer"
              title="Click to copy UPI address"
            >
              {copiedUpi ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-gray-500" />
                  <span>{upiId}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── QR Code & Instructions Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Organizer QR Code Frame */}
        <div className="p-4 bg-white border border-[#D8D2C4] rounded-xl shadow-sm flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-xs font-bold text-gray-800 font-['Space_Grotesk'] flex items-center gap-1.5">
            <QrCode size={16} /> Scan to Pay with Any UPI App
          </span>

          <div className="relative p-3 bg-white rounded-xl border-2 border-dashed border-[#1A3A2A]/40 shadow-sm max-w-[220px]">
            {qrImageUrl ? (
              <img
                src={qrImageUrl}
                alt="Event Payment QR Code"
                className="w-full h-auto aspect-square object-contain rounded-lg"
              />
            ) : (
              <div className="w-44 h-44 bg-neutral-50 rounded-lg flex flex-col items-center justify-center p-3 text-center border border-gray-200">
                <QrCode size={40} className="text-[#1A3A2A]/70 mb-2" />
                <span className="text-xs font-bold text-gray-800">Scan via UPI</span>
                <span className="text-[10px] text-gray-500 font-mono mt-1 break-all">
                  {upiId}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 font-mono mt-1">
                  ₹{priceAmount}
                </span>
              </div>
            )}
          </div>

          <p className="text-[10px] text-gray-500 font-mono max-w-[200px]">
            Supported on GPay, PhonePe, Paytm, BHIM &amp; all mobile banking UPI apps.
          </p>
        </div>

        {/* Instructions & Steps */}
        <div className="p-4 bg-[#FAF8F5] border border-[#D8D2C4] rounded-xl shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-gray-900 font-['Space_Grotesk'] uppercase tracking-wider mb-2">
              Payment Instructions
            </h4>
            <div className="text-xs text-gray-700 whitespace-pre-line leading-relaxed space-y-2">
              {paymentInstructions}
            </div>
          </div>

          <div className="p-2.5 bg-white border border-gray-200 rounded-lg space-y-1">
            <span className="text-[10px] font-bold text-gray-800 uppercase font-mono block">
              Required Proof Format
            </span>
            <p className="text-[11px] text-gray-600">
              Only image files (<strong>JPG, JPEG, PNG, WebP</strong>) under 5MB are accepted. Ensure the transaction amount, date, and UTR / Reference ID are readable.
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment Proof Upload Section (if not yet confirmed) ── */}
      {!isConfirmed && (
        <div className="p-4 bg-white border border-[#D8D2C4] rounded-xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 font-['Space_Grotesk'] flex items-center gap-1.5">
              <UploadSimple size={15} />
              <span>
                {isRejected
                  ? 'Upload New Payment Screenshot'
                  : reg?.paymentProof?.url
                  ? 'Replace / Re-upload Screenshot Proof'
                  : 'Upload Payment Screenshot Proof'}
              </span>
            </h4>
            <span className="text-[10px] font-mono text-gray-400">JPG, PNG, WebP &bull; Max 5MB</span>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
              selectedFile
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-[#D8D2C4] hover:border-[#1A3A2A] bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
            }`}
          >
            {filePreview ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-[#D8D2C4] bg-white shadow-xs">
                  <img
                    src={filePreview}
                    alt="Selected payment proof"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-gray-800 block truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-[#1A3A2A] hover:underline cursor-pointer"
                >
                  Choose a different file
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer space-y-2 py-3"
              >
                <div className="w-10 h-10 rounded-full bg-[#1A3A2A]/10 text-[#1A3A2A] flex items-center justify-center mx-auto">
                  <ImageIcon size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block">
                    {reg?.paymentProof?.url
                      ? 'Click to select a new screenshot, or drag & drop here'
                      : 'Click to select payment screenshot, or drag & drop here'}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                    Accepted: JPG, JPEG, PNG, WebP (up to 5MB)
                  </span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Validation or Upload Error */}
          {uploadError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
              <Warning size={16} className="shrink-0 text-red-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle size={16} className="shrink-0 text-emerald-600" />
              <span>Proof submitted successfully! Awaiting verification.</span>
            </div>
          )}

          {/* Submit Action */}
          {selectedFile && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleUploadProof}
                disabled={uploading}
                className="org-btn org-btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Clock size={14} className="animate-spin" />
                    <span>Uploading Proof…</span>
                  </>
                ) : (
                  <>
                    <UploadSimple size={14} weight="bold" />
                    <span>Submit Payment Proof for Verification</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Active Ticket Pass (when confirmed) ── */}
      {isConfirmed && reg?.qrToken && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs font-['Space_Grotesk']">
            <Ticket size={16} /> Official Entry Ticket Issued
          </div>
          <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-[10px] text-gray-400 block">TICKET PASS CODE</span>
              <span className="font-bold text-gray-800">{reg.qrToken.slice(0, 16)}…</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Active &bull; Confirmed
            </span>
          </div>
        </div>
      )}

      {/* ── Lightbox Modal for Full Proof View ── */}
      <AnimatePresence>
        {showProofLightbox && reg?.paymentProof?.url && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#D8D2C4]"
            >
              <div className="p-4 border-b border-[#E6E1D5] flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2">
                  <FileImage size={18} className="text-[#1A3A2A]" />
                  <span className="text-xs font-bold text-[#0F172A] font-['Space_Grotesk']">
                    Submitted Screenshot: {reg.paymentProof.filename || 'payment_proof.jpg'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={reg.paymentProof.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="org-btn org-btn-ghost text-xs !py-1 !px-2 flex items-center gap-1"
                  >
                    <ArrowSquareOut size={13} /> Open Original
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowProofLightbox(false)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 bg-neutral-900 flex items-center justify-center min-h-[300px]">
                <img
                  src={reg.paymentProof.url}
                  alt="Payment screenshot proof"
                  className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>

              <div className="p-3 border-t border-[#E6E1D5] bg-[#FAF8F5] flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500">
                  {reg.paymentProof.uploadedAt
                    ? `Uploaded: ${new Date(reg.paymentProof.uploadedAt).toLocaleString('en-IN')}`
                    : ''}
                </span>
                <button
                  type="button"
                  onClick={() => setShowProofLightbox(false)}
                  className="org-btn org-btn-secondary text-xs !py-1 !px-3"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-2 border-t border-[#E6E1D5]">
        <div className="text-[11px] text-gray-500 font-mono">
          Event ID: {event.id?.slice(0, 8)} &bull; Registration: {reg?._id?.slice(0, 8)}
        </div>
        <button
          type="button"
          onClick={onDone}
          className="org-btn org-btn-secondary text-xs !py-1.5 cursor-pointer"
        >
          {isConfirmed ? 'View in My Events' : 'Close & Continue Later'}
        </button>
      </div>
    </div>
  );
}
