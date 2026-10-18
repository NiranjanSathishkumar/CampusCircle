import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CurrencyInr,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MagnifyingGlass,
  ArrowClockwise,
  Warning,
  Receipt,
  DownloadSimple,
  ArrowSquareOut,
  X,
  User,
  ShieldCheck,
  FileImage,
  CalendarBlank,
  PencilSimple,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { listEventPaymentVerifications, verifyPayment } from '@/portal/organizer/events/events.api';
import EmptyState from '@/layouts/portal/components/EmptyState';

const STATUS_FILTERS = [
  { id: 'all', label: 'All Records' },
  { id: 'proof_submitted', label: 'Pending Verification', badge: 'needs-action' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'pending', label: 'Awaiting Proof' },
];

const PRESET_REJECTION_REASONS = [
  'Transaction ID / UTR not found in bank statement',
  'Screenshot is blurry or illegible',
  'Incorrect payment amount transferred',
  'Duplicate or already used screenshot proof',
  'Payment made to incorrect UPI ID / Account',
];

export default function EventPaymentVerificationTab({ event, onRefresh, showToast }) {
  const eventId = event?._id || event?.id;
  const price = event?.price || 0;

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {
      totalPaidRegistrations: 0,
      proofSubmittedCount: 0,
      confirmedCount: 0,
      rejectedCount: 0,
      pendingProofCount: 0,
      totalRevenue: 0,
    },
    registrations: [],
  });

  // Modal states
  const [activeProofModal, setActiveProofModal] = useState(null); // Registration object for image preview
  const [rejectingReg, setRejectingReg] = useState(null); // Registration being rejected
  const [rejectionReason, setRejectionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [rejectCancelSeat, setRejectCancelSeat] = useState(false); // false = grant 24h grace; true = release seat immediately

  // Confirm with Transaction ID modal
  const [confirmingReg, setConfirmingReg] = useState(null);
  const [confirmTxId, setConfirmTxId] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');

  // Edit payment details modal (for adding/updating transaction ID at any time)
  const [editingDetailsReg, setEditingDetailsReg] = useState(null);
  const [editTxId, setEditTxId] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [copiedId, setCopiedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchVerifications = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await listEventPaymentVerifications(eventId, { status: filter });
      const summary = res.summary || {
        totalPaidRegistrations: res.counts?.totalPaid ?? res.counts?.totalPaidRegistrations ?? 0,
        proofSubmittedCount: res.counts?.pendingVerification ?? res.counts?.proofSubmittedCount ?? 0,
        confirmedCount: res.counts?.confirmed ?? res.counts?.confirmedCount ?? 0,
        rejectedCount: res.counts?.rejected ?? res.counts?.rejectedCount ?? 0,
        pendingProofCount: res.counts?.paymentRequired ?? res.counts?.pendingProofCount ?? 0,
        totalRevenue: res.counts?.totalRevenue ?? 0,
      };
      setData({
        summary,
        registrations: res.registrations || [],
      });
    } catch (err) {
      if (showToast) showToast(`Error: ${err.message || 'Failed to load verifications'}`);
    } finally {
      setLoading(false);
    }
  }, [eventId, filter, showToast]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  // Client-side search filtering
  const filteredRegistrations = useMemo(() => {
    if (!search.trim()) return data.registrations;
    const q = search.toLowerCase();
    return data.registrations.filter((r) => {
      const name = r.student?.name?.toLowerCase() || '';
      const email = r.student?.email?.toLowerCase() || '';
      const rollNo = r.profileSnapshot?.rollNo?.toLowerCase() || '';
      const branch = r.profileSnapshot?.branch?.toLowerCase() || '';
      const txId = r.transactionId?.toLowerCase() || '';
      return (
        name.includes(q) ||
        email.includes(q) ||
        rollNo.includes(q) ||
        branch.includes(q) ||
        txId.includes(q)
      );
    });
  }, [data.registrations, search]);

  const handleCopyTxId = (txId) => {
    if (!txId) return;
    navigator.clipboard.writeText(txId);
    setCopiedId(txId);
    if (showToast) showToast(`Copied "${txId}" to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openConfirmModal = (reg) => {
    setConfirmingReg(reg);
    setConfirmTxId(reg.transactionId || '');
    setConfirmNotes(reg.paymentNotes || '');
  };

  const handleConfirmSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!confirmingReg || actionLoadingId) return;

    setActionLoadingId(confirmingReg._id);
    try {
      await verifyPayment(confirmingReg._id, {
        action: 'confirm',
        transactionId: confirmTxId.trim(),
        paymentNotes: confirmNotes.trim(),
      });
      if (showToast) showToast(`✓ Payment confirmed for ${confirmingReg.student?.name || 'student'}. Ticket issued!`);
      setConfirmingReg(null);
      await fetchVerifications();
      if (onRefresh) onRefresh();
    } catch (err) {
      if (showToast) showToast(`Failed to confirm: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (reg) => {
    setRejectingReg(reg);
    setRejectionReason(PRESET_REJECTION_REASONS[0]);
    setCustomReason('');
    setRejectCancelSeat(false);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingReg || actionLoadingId) return;

    const finalReason = rejectionReason === 'Other' ? customReason.trim() : rejectionReason;
    if (!finalReason) {
      if (showToast) showToast('Please select or specify a reason for rejection.');
      return;
    }

    setActionLoadingId(rejectingReg._id);
    try {
      await verifyPayment(rejectingReg._id, {
        action: 'reject',
        reason: finalReason,
        cancelRegistration: rejectCancelSeat,
      });
      if (showToast) {
        showToast(
          rejectCancelSeat
            ? `Payment rejected and slot released for ${rejectingReg.student?.name || 'student'}.`
            : `Payment proof rejected for ${rejectingReg.student?.name || 'student'}. Notified to re-upload.`
        );
      }
      setRejectingReg(null);
      await fetchVerifications();
      if (onRefresh) onRefresh();
    } catch (err) {
      if (showToast) showToast(`Failed to reject: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openEditDetailsModal = (reg) => {
    setEditingDetailsReg(reg);
    setEditTxId(reg.transactionId || '');
    setEditNotes(reg.paymentNotes || '');
  };

  const handleUpdateDetailsSubmit = async (e) => {
    e.preventDefault();
    if (!editingDetailsReg || actionLoadingId) return;

    setActionLoadingId(editingDetailsReg._id);
    try {
      await verifyPayment(editingDetailsReg._id, {
        action: 'update_details',
        transactionId: editTxId.trim(),
        paymentNotes: editNotes.trim(),
      });
      if (showToast) showToast(`✓ Payment details updated.`);
      setEditingDetailsReg(null);
      await fetchVerifications();
      if (onRefresh) onRefresh();
    } catch (err) {
      if (showToast) showToast(`Failed to update details: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (reg) => {
    if (reg.paymentStatus === 'confirmed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle size={13} weight="fill" /> Confirmed
        </span>
      );
    }
    if (reg.paymentStatus === 'proof_submitted') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
          <Clock size={13} weight="fill" /> Verification Pending
        </span>
      );
    }
    if (reg.paymentStatus === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
          <XCircle size={13} weight="fill" /> {reg.status === 'cancelled' ? 'Declined & Cancelled' : 'Proof Rejected'}
        </span>
      );
    }
    if (reg.status === 'reserved') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Clock size={13} /> Slot Reserved (Awaiting Proof)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
        {reg.paymentStatus || 'Pending'}
      </span>
    );
  };

  const summary = data.summary;

  return (
    <div className="space-y-6">
      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Verification Card */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            summary.proofSubmittedCount > 0
              ? 'bg-amber-50/80 border-amber-300 shadow-sm'
              : 'bg-white border-[#D8D2C4]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 font-['Space_Grotesk'] uppercase tracking-wider">
              Pending Verification
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                summary.proofSubmittedCount > 0 ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Clock size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-['Space_Grotesk'] text-[#0F172A]">
              {summary.proofSubmittedCount || 0}
            </span>
            <span className="text-xs text-gray-500">proofs waiting</span>
          </div>
        </div>

        {/* Confirmed Card */}
        <div className="p-4 rounded-xl bg-white border border-[#D8D2C4] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 font-['Space_Grotesk'] uppercase tracking-wider">
              Confirmed Payments
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-['Space_Grotesk'] text-[#0F172A]">
              {summary.confirmedCount || 0}
            </span>
            <span className="text-xs text-gray-500">tickets issued</span>
          </div>
        </div>

        {/* Rejected Card */}
        <div className="p-4 rounded-xl bg-white border border-[#D8D2C4] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600 font-['Space_Grotesk'] uppercase tracking-wider">
              Rejected Proofs
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-800 flex items-center justify-center">
              <XCircle size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-['Space_Grotesk'] text-[#0F172A]">
              {summary.rejectedCount || 0}
            </span>
            <span className="text-xs text-gray-500">declined</span>
          </div>
        </div>

        {/* Total Verified Revenue */}
        <div className="p-4 rounded-xl bg-[#1A3A2A]/5 border border-[#1A3A2A]/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1A3A2A] font-['Space_Grotesk'] uppercase tracking-wider">
              Confirmed Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#1A3A2A] text-white flex items-center justify-center">
              <CurrencyInr size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-['Space_Grotesk'] text-[#1A3A2A]">
              ₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-500">@ ₹{price}/ticket</span>
          </div>
        </div>
      </div>

      {/* ── Filter Bar & Search ── */}
      <div className="bg-white border border-[#D8D2C4] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab filter buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((f) => {
              const active = filter === f.id;
              let count = null;
              if (f.id === 'proof_submitted') count = summary.proofSubmittedCount;
              else if (f.id === 'confirmed') count = summary.confirmedCount;
              else if (f.id === 'rejected') count = summary.rejectedCount;
              else if (f.id === 'pending') count = summary.pendingProofCount;
              else if (f.id === 'all') count = summary.totalPaidRegistrations;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'bg-[#FAF8F5] text-gray-700 hover:bg-gray-200/70 border border-[#E6E1D5]'
                  }`}
                >
                  <span>{f.label}</span>
                  {typeof count === 'number' && count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        active
                          ? 'bg-white/20 text-white'
                          : f.badge === 'needs-action'
                          ? 'bg-amber-200 text-amber-900 font-bold'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={fetchVerifications}
            disabled={loading}
            className="org-btn org-btn-ghost text-xs self-start sm:self-auto"
            title="Refresh verification list"
          >
            <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlass
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="org-form-input !pl-9 text-xs"
            placeholder="Search by student name, roll number, email, UTR / Transaction ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Registrations List / Table ── */}
      {loading && filteredRegistrations.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#D8D2C4] rounded-xl">
          <Clock size={32} className="animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-mono">Loading payment verification records…</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white border border-[#D8D2C4] rounded-xl p-8 text-center">
          <Receipt size={40} className="text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800 font-['Space_Grotesk']">
            No verification records found
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {filter !== 'all'
              ? `No registrations currently match the "${STATUS_FILTERS.find((f) => f.id === filter)?.label}" filter.`
              : 'When students register for this paid event and submit payment proofs, they will appear here for verification.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#D8D2C4] rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E6E1D5] bg-[#FAF8F5] text-gray-600 font-bold font-['Space_Grotesk'] uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Student Details</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Proof</th>
                  <th className="py-3 px-3">Transaction ID / UTR</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Submitted At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E1D5]">
                {filteredRegistrations.map((reg) => {
                  const student = reg.student || {};
                  const profile = reg.profileSnapshot || {};
                  const proof = reg.paymentProof;
                  const isProofSubmitted = reg.paymentStatus === 'proof_submitted';
                  const isConfirmed = reg.paymentStatus === 'confirmed';
                  const isRejected = reg.paymentStatus === 'rejected';
                  const isLoading = actionLoadingId === reg._id;

                  return (
                    <tr
                      key={reg._id}
                      className={`hover:bg-[#FAF8F5]/60 transition-colors ${
                        isProofSubmitted ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0F172A] text-xs">
                          {student.name || 'Anonymous Student'}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono flex items-center gap-2 mt-0.5">
                          <span>{profile.rollNo ? `Roll: ${profile.rollNo}` : student.email}</span>
                          {profile.branch && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>{profile.branch}</span>
                            </>
                          )}
                        </div>
                        {reg.teamName && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                            Team: <span className="font-semibold text-gray-600">{reg.teamName}</span>
                          </div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        ₹{reg.amountPaid || price}
                      </td>

                      {/* Proof Thumbnail */}
                      <td className="py-3 px-3">
                        {proof?.url ? (
                          <button
                            type="button"
                            onClick={() => setActiveProofModal(reg)}
                            className="group relative flex items-center gap-2 p-1 rounded-lg border border-[#D8D2C4] bg-[#FAF8F5] hover:border-[#1A3A2A] hover:shadow-sm transition-all cursor-pointer"
                            title="Click to view full screenshot proof"
                          >
                            <div className="w-10 h-10 rounded overflow-hidden bg-gray-200 shrink-0 relative">
                              <img
                                src={proof.url}
                                alt="Payment proof preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="text-left pr-1">
                              <span className="text-[10px] font-bold text-[#1A3A2A] flex items-center gap-0.5 group-hover:underline">
                                <Eye size={12} /> View Proof
                              </span>
                              <span className="text-[9px] font-mono text-gray-400 block truncate max-w-[90px]">
                                {proof.filename || 'screenshot.jpg'}
                              </span>
                            </div>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[11px]">
                            <FileImage size={15} />
                            <span>No proof yet</span>
                          </div>
                        )}
                      </td>

                      {/* Transaction ID / UTR Column */}
                      <td className="py-3 px-3">
                        {reg.transactionId ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E6E1D5] px-2 py-1 rounded-md">
                            <span className="font-mono text-xs font-bold text-gray-800">
                              {reg.transactionId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTxId(reg.transactionId)}
                              className="text-gray-400 hover:text-gray-700 transition-colors"
                              title="Copy transaction ID"
                            >
                              {copiedId === reg.transactionId ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditDetailsModal(reg)}
                              className="text-gray-400 hover:text-[#1A3A2A] transition-colors ml-0.5"
                              title="Edit transaction ID or notes"
                            >
                              <PencilSimple size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEditDetailsModal(reg)}
                            className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#1A3A2A] font-mono transition-colors border border-dashed border-gray-300 hover:border-gray-400 px-2 py-0.5 rounded cursor-pointer"
                            title="Add Transaction ID / UTR"
                          >
                            <PencilSimple size={11} />
                            <span>+ Add UTR / ID</span>
                          </button>
                        )}
                        {reg.paymentNotes && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5 max-w-[150px] truncate" title={reg.paymentNotes}>
                            Note: {reg.paymentNotes}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {getStatusBadge(reg)}
                        {isRejected && reg.paymentRejectionReason && (
                          <div className="text-[10px] text-red-600 mt-1 max-w-[180px] truncate" title={reg.paymentRejectionReason}>
                            Reason: {reg.paymentRejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Submitted At */}
                      <td className="py-3 px-3 text-[11px] font-mono text-gray-500 whitespace-nowrap">
                        {proof?.uploadedAt
                          ? new Date(proof.uploadedAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : new Date(reg.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isConfirmed ? (
                          <div className="inline-flex items-center gap-1.5">
                            <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                              <ShieldCheck size={14} /> Verified &amp; Issued
                            </div>
                            <button
                              type="button"
                              onClick={() => openEditDetailsModal(reg)}
                              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              title="Edit transaction details"
                            >
                              <PencilSimple size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {/* Confirm Button */}
                            <button
                              type="button"
                              onClick={() => openConfirmModal(reg)}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 bg-[#1A3A2A] hover:bg-[#12281D] text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm disabled:opacity-50 cursor-pointer"
                              title="Confirm received payment and issue student ticket"
                            >
                              <CheckCircle size={13} weight="bold" />
                              <span>Confirm</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              type="button"
                              onClick={() => openRejectModal(reg)}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                              title="Reject invalid or unreceived payment"
                            >
                              <XCircle size={13} weight="bold" />
                              <span>{isRejected ? 'Edit Rejection' : 'Reject'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Payment Proof Fullscreen Preview Modal ── */}
      <AnimatePresence>
        {activeProofModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-[#D8D2C4]"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#E6E1D5] flex items-center justify-between bg-[#FAF8F5]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1A3A2A]/10 text-[#1A3A2A] flex items-center justify-center">
                    <Receipt size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] font-['Space_Grotesk']">
                      Payment Proof — {activeProofModal.student?.name || 'Student'}
                    </h3>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Amount Due: ₹{price} • Roll: {activeProofModal.profileSnapshot?.rollNo || '—'}
                      {activeProofModal.transactionId && ` • UTR: ${activeProofModal.transactionId}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeProofModal.paymentProof?.url && (
                    <a
                      href={activeProofModal.paymentProof.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="org-btn org-btn-ghost text-xs !py-1 !px-2 flex items-center gap-1"
                      title="Open full resolution in new tab"
                    >
                      <ArrowSquareOut size={14} />
                      <span className="hidden sm:inline">Open Full Image</span>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveProofModal(null)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Image Preview Body */}
              <div className="flex-1 overflow-auto p-4 bg-neutral-900 flex items-center justify-center min-h-[300px]">
                {activeProofModal.paymentProof?.url ? (
                  <img
                    src={activeProofModal.paymentProof.url}
                    alt="Payment screenshot proof"
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="text-gray-400 text-xs font-mono">No image available</div>
                )}
              </div>

              {/* Modal Footer with Quick Actions */}
              <div className="p-4 border-t border-[#E6E1D5] bg-[#FAF8F5] flex items-center justify-between">
                <div>
                  {getStatusBadge(activeProofModal)}
                </div>

                <div className="flex items-center gap-2">
                  {activeProofModal.paymentStatus !== 'confirmed' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const reg = activeProofModal;
                          setActiveProofModal(null);
                          openRejectModal(reg);
                        }}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        Reject Proof
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const reg = activeProofModal;
                          setActiveProofModal(null);
                          openConfirmModal(reg);
                        }}
                        className="px-3 py-1.5 bg-[#1A3A2A] hover:bg-[#12281D] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <CheckCircle size={14} weight="bold" />
                        <span>Confirm Payment</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveProofModal(null)}
                    className="org-btn org-btn-ghost text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Payment & Add Details Modal ── */}
      <AnimatePresence>
        {confirmingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#D8D2C4] space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <CheckCircle size={20} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] font-['Space_Grotesk']">
                      Confirm Payment &amp; Issue Ticket
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {confirmingReg.student?.name} &bull; ₹{price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmingReg(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Confirming this payment will mark the registration as active, issue an official QR entry pass, and notify the student.
              </p>

              <form onSubmit={handleConfirmSubmit} className="space-y-3">
                <div className="org-form-group">
                  <label htmlFor="confirm-tx-id" className="org-form-label">
                    Transaction ID / UTR Number <span className="org-form-hint">(recommended)</span>
                  </label>
                  <input
                    id="confirm-tx-id"
                    type="text"
                    className="org-form-input text-xs font-mono"
                    placeholder="e.g. 428190284712 or UPI Ref ID"
                    value={confirmTxId}
                    onChange={(e) => setConfirmTxId(e.target.value)}
                  />
                  <p className="text-[11px] text-gray-400 font-mono mt-1">
                    Enter the bank UTR or UPI reference from the payment proof for future reconciliation.
                  </p>
                </div>

                <div className="org-form-group">
                  <label htmlFor="confirm-notes" className="org-form-label">
                    Verification Notes <span className="org-form-hint">(optional)</span>
                  </label>
                  <input
                    id="confirm-notes"
                    type="text"
                    className="org-form-input text-xs"
                    placeholder="e.g. Verified in HDFC Current A/C"
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D5]">
                  <button
                    type="button"
                    onClick={() => setConfirmingReg(null)}
                    className="org-btn org-btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === confirmingReg._id}
                    className="px-4 py-2 bg-[#1A3A2A] hover:bg-[#12281D] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle size={15} weight="bold" />
                    <span>Confirm &amp; Issue Ticket</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Payment Details Modal (UTR & Notes) ── */}
      <AnimatePresence>
        {editingDetailsReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#D8D2C4] space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                    <PencilSimple size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] font-['Space_Grotesk']">
                      Edit Payment Details
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {editingDetailsReg.student?.name} &bull; ₹{price}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDetailsReg(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateDetailsSubmit} className="space-y-3">
                <div className="org-form-group">
                  <label htmlFor="edit-tx-id" className="org-form-label">
                    Transaction ID / UTR Number
                  </label>
                  <input
                    id="edit-tx-id"
                    type="text"
                    className="org-form-input text-xs font-mono"
                    placeholder="e.g. 428190284712 or UPI Ref ID"
                    value={editTxId}
                    onChange={(e) => setEditTxId(e.target.value)}
                  />
                </div>

                <div className="org-form-group">
                  <label htmlFor="edit-notes" className="org-form-label">
                    Internal Verification Remarks
                  </label>
                  <textarea
                    id="edit-notes"
                    rows={2}
                    className="org-form-input text-xs"
                    placeholder="e.g. Verified in bank statement on 28th Sept"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D5]">
                  <button
                    type="button"
                    onClick={() => setEditingDetailsReg(null)}
                    className="org-btn org-btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === editingDetailsReg._id}
                    className="org-btn org-btn-primary text-xs"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Rejection Modal (with Grace Period vs Release Seat option) ── */}
      <AnimatePresence>
        {rejectingReg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#D8D2C4] space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                    <Warning size={20} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] font-['Space_Grotesk']">
                      Reject Payment Proof
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {rejectingReg.student?.name} (₹{price})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectingReg(null)}
                  className="text-gray-400 hover:text-gray-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRejectSubmit} className="space-y-3">
                {/* Rejection Handling Mode */}
                <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#E6E1D5] space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">
                    Choose Action for this Registration:
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-start gap-2 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="rejectCancelSeat"
                        checked={!rejectCancelSeat}
                        onChange={() => setRejectCancelSeat(false)}
                        className="mt-0.5 text-red-600"
                      />
                      <div>
                        <span className="font-bold text-gray-900 block">
                          Request Re-upload (24h Grace Period)
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Notifies the student with the reason. Their seat remains reserved for 24 hours so they can upload a valid screenshot.
                        </span>
                      </div>
                    </label>
                    <label className="flex items-start gap-2 text-xs cursor-pointer pt-1 border-t border-gray-200">
                      <input
                        type="radio"
                        name="rejectCancelSeat"
                        checked={rejectCancelSeat}
                        onChange={() => setRejectCancelSeat(true)}
                        className="mt-0.5 text-red-600"
                      />
                      <div>
                        <span className="font-bold text-red-900 block">
                          Decline &amp; Release Seat to Waitlist
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          Cancels this registration immediately and promotes the next student in line on the waitlist.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <label className="text-xs font-bold text-gray-800 block">
                  Select Reason for Rejection
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {PRESET_REJECTION_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        rejectionReason === reason
                          ? 'bg-red-50/60 border-red-300 font-semibold text-red-900'
                          : 'bg-[#FAF8F5] border-[#D8D2C4] text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rejectionReason"
                        checked={rejectionReason === reason}
                        onChange={() => setRejectionReason(reason)}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}

                  <label
                    className={`flex items-start gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      rejectionReason === 'Other'
                        ? 'bg-red-50/60 border-red-300 font-semibold text-red-900'
                        : 'bg-[#FAF8F5] border-[#D8D2C4] text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      checked={rejectionReason === 'Other'}
                      onChange={() => setRejectionReason('Other')}
                      className="mt-0.5 text-red-600 focus:ring-red-500"
                    />
                    <span>Other (provide custom explanation)</span>
                  </label>
                </div>

                {rejectionReason === 'Other' && (
                  <textarea
                    rows={2}
                    className="org-form-input text-xs w-full mt-1"
                    placeholder="Describe why this payment proof cannot be accepted…"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    required
                  />
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E6E1D5]">
                  <button
                    type="button"
                    onClick={() => setRejectingReg(null)}
                    className="org-btn org-btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === rejectingReg._id}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle size={15} weight="bold" />
                    <span>{rejectCancelSeat ? 'Cancel & Release Seat' : 'Reject & Notify Student'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
