/**
 * OrganizerScanPage.jsx — Event-Day Gate Attendance Command Center.
 * Features:
 * - On-device camera QR scanner (html5-qrcode) with HUD laser scan reticle
 * - Multi-camera toggle (Rear / Front camera)
 * - Synthesized Web Audio API sound feedback (Success / Warning / Error)
 * - Live attendance metrics (Checked-in %, remaining pending, gate velocity)
 * - Real-time rich attendee verification banner/card
 * - Dual operations hub: Live check-in stream & Quick-lookup roster with 1-click check-in
 * - Fullscreen Gate Mode & Attendance CSV export
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ArrowLeft,
  QrCode,
  CheckCircle,
  Warning,
  Camera,
  VideoCamera,
  VideoCameraSlash,
  SpeakerHigh,
  SpeakerSlash,
  MagnifyingGlass,
  UsersThree,
  UserCheck,
  DownloadSimple,
  ArrowsOut,
  ArrowsIn,
  Sparkle,
  X,
  Circle,
  ArrowsClockwise,
  Clock,
  Check,
  Lightning,
} from '@phosphor-icons/react';
import { checkInEvent, getEvent, listEventRegistrations } from '@/portal/organizer/events/events.api';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-events.css';

const QR_READER_ELEMENT_ID = 'org-qr-reader';
const RESCAN_COOLDOWN_MS = 3500;

// Synthesized audio tones using Web Audio API (zero external asset requests)
function playSynthesizedSound(type) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      // Pleasant rising high double chime
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain1.gain.setValueAtTime(0.18, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.18);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.12); // E6
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.35);
    } else if (type === 'duplicate') {
      // Amber dual warning buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.setValueAtTime(360, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.32);
    } else {
      // Error low buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // AudioContext blocked or not supported — safe ignore
  }
}

export default function OrganizerScanPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Camera & Scan Engine State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' or 'user'
  const [cameraError, setCameraError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingInId, setCheckingInId] = useState(null);
  
  // Results & Feeds
  const [manualTicket, setManualTicket] = useState('');
  const [result, setResult] = useState(null); // { status: 'success'|'duplicate'|'not_found', student: {...}, message, at }
  const [scanLog, setScanLog] = useState([]);
  const [sessionScanCount, setSessionScanCount] = useState(0);
  const [lastScanTime, setLastScanTime] = useState(null);

  // UI Hub State
  const [activeTab, setActiveTab] = useState('stream'); // 'stream' | 'roster'
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState('all'); // 'all' | 'pending' | 'checkedIn'
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem('org_scanner_sound') !== 'false';
    } catch {
      return true;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scannerRef = useRef(null);
  const submittingRef = useRef(false);
  const lastScanRef = useRef({ token: '', at: 0 });
  const manualInputRef = useRef(null);

  const loadRoster = () => {
    setLoading(true);
    setLoadError('');
    return Promise.all([getEvent(eventId), listEventRegistrations(eventId, { status: 'confirmed' })])
      .then(([eventRes, regRes]) => {
        setEvent(eventRes.event);
        setRegistrations(regRes.registrations || []);
      })
      .catch((err) => setLoadError(err.message || 'Failed to load this event'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    submittingRef.current = submitting;
  }, [submitting]);

  // Cleanup camera stream on unmount
  useEffect(() => () => {
    const scanner = scannerRef.current;
    if (scanner) {
      scanner.stop().catch(() => {}).finally(() => scanner.clear());
    }
  }, []);

  // Keyboard shortcut: Press `/` to focus manual token entry
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== manualInputRef.current) {
        e.preventDefault();
        manualInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setResult(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('org_scanner_sound', String(next));
    } catch {}
    if (next) playSynthesizedSound('success');
  };

  const checkedInCount = registrations.filter((r) => r.checkedIn).length;
  const attendanceRate = registrations.length > 0 ? Math.round((checkedInCount / registrations.length) * 100) : 0;
  const pendingCount = Math.max(0, registrations.length - checkedInCount);

  // Check-in Execution
  const checkInByToken = async (qrToken, overrideKnownStudent = null) => {
    const trimmedToken = qrToken.trim();
    if (!trimmedToken) return;

    setSubmitting(true);
    // Support matching by full 32-char token, or by short 8-char ticket ID prefix, or case-insensitive ticketId
    const known =
      overrideKnownStudent ||
      registrations.find(
        (r) =>
          r.qrToken === trimmedToken ||
          (r.qrToken && r.qrToken.toLowerCase() === trimmedToken.toLowerCase()) ||
          (r.qrToken && r.qrToken.slice(0, trimmedToken.length).toUpperCase() === trimmedToken.toUpperCase())
      );

    const actualToken = known?.qrToken || trimmedToken;
    const studentInfo = {
      name: known?.student?.name || known?.name || 'Student Attendee',
      rollNo: known?.profileSnapshot?.rollNo || known?.rollNo || '—',
      branch: known?.profileSnapshot?.branch || known?.branch || '—',
      year: known?.profileSnapshot?.yearOfJoining || known?.year || '',
      ticketId: (actualToken || '').slice(0, 8).toUpperCase(),
      email: known?.student?.email || known?.email || '',
      teamName: known?.teamName || '',
    };

    try {
      const res = await checkInEvent(eventId, actualToken);
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastScanTime(nowStr);

      if (res.alreadyCheckedIn) {
        if (soundEnabled) playSynthesizedSound('duplicate');
        setResult({
          status: 'duplicate',
          student: studentInfo,
          message: `${studentInfo.name} has already been checked in. Duplicate pass rejected.`,
          at: nowStr,
        });
      } else {
        if (soundEnabled) playSynthesizedSound('success');
        setSessionScanCount((prev) => prev + 1);
        setResult({
          status: 'success',
          student: studentInfo,
          message: `${studentInfo.name} checked in successfully. Verified Admit!`,
          at: nowStr,
        });
        setScanLog((prev) => [
          {
            ...studentInfo,
            qrToken: trimmedToken,
            at: nowStr,
            method: overrideKnownStudent ? 'Direct Roster' : 'QR Camera',
          },
          ...prev,
        ].slice(0, 30));
      }

      // Refresh roster data
      const regRes = await listEventRegistrations(eventId, { status: 'confirmed' });
      setRegistrations(regRes.registrations || []);
    } catch (err) {
      if (soundEnabled) playSynthesizedSound('error');
      setResult({
        status: 'not_found',
        student: studentInfo,
        message: err.message || 'No matching confirmed registration found for this QR token.',
        at: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setSubmitting(false);
      setCheckingInId(null);
    }
  };

  const handleDecodedText = (decodedText) => {
    const token = decodedText.trim();
    if (!token || submittingRef.current) return;
    const now = Date.now();
    if (lastScanRef.current.token === token && now - lastScanRef.current.at < RESCAN_COOLDOWN_MS) {
      return;
    }
    lastScanRef.current = { token, at: now };
    checkInByToken(token);
  };

  const startCamera = async (facing = cameraFacing) => {
    setCameraError('');
    setCameraStarting(true);
    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {}
        scannerRef.current.clear();
      }
      const scanner = new Html5Qrcode(QR_READER_ELEMENT_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: facing },
        { fps: 12, qrbox: { width: 200, height: 200 } },
        handleDecodedText,
        () => {},
      );
      setCameraActive(true);
      setCameraFacing(facing);
    } catch (err) {
      scannerRef.current = null;
      setCameraActive(false);
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser or use manual entry.'
          : err?.message || 'Could not access a camera device.'
      );
    } finally {
      setCameraStarting(false);
    }
  };

  const stopCamera = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setCameraActive(false);
    if (scanner) {
      try {
        await scanner.stop();
      } catch {}
      scanner.clear();
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    if (cameraActive) {
      startCamera(nextFacing);
    } else {
      setCameraFacing(nextFacing);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualTicket.trim() || submitting) return;
    checkInByToken(manualTicket);
    setManualTicket('');
  };

  // Direct 1-click check-in from Roster Tab
  const handleDirectCheckIn = (registration) => {
    if (!registration.qrToken || registration.checkedIn || submitting) return;
    setCheckingInId(registration._id);
    checkInByToken(registration.qrToken, registration);
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    if (registrations.length === 0) return;
    const headers = ['Student Name', 'Roll Number', 'Branch', 'Year', 'Email', 'Ticket ID', 'Checked In', 'Check In Time'];
    const rows = registrations.map((r) => [
      `"${r.student?.name || r.name || ''}"`,
      `"${r.profileSnapshot?.rollNo || r.rollNo || ''}"`,
      `"${r.profileSnapshot?.branch || r.branch || ''}"`,
      `"${r.profileSnapshot?.yearOfJoining || r.year || ''}"`,
      `"${r.student?.email || r.email || ''}"`,
      `"${(r.qrToken || '').slice(0, 8).toUpperCase()}"`,
      r.checkedIn ? 'Yes' : 'No',
      r.checkedInAt ? `"${new Date(r.checkedInAt).toLocaleString('en-IN')}"` : '—',
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event?.title ? event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'event'}_attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Roster for Tab 2
  const filteredRoster = useMemo(() => {
    return registrations.filter((r) => {
      const name = (r.student?.name || r.name || '').toLowerCase();
      const roll = (r.profileSnapshot?.rollNo || r.rollNo || '').toLowerCase();
      const ticket = (r.qrToken || '').toLowerCase();
      const query = rosterSearch.toLowerCase().trim();
      const matchesSearch = !query || name.includes(query) || roll.includes(query) || ticket.includes(query);

      if (!matchesSearch) return false;
      if (rosterFilter === 'checkedIn') return !!r.checkedIn;
      if (rosterFilter === 'pending') return !r.checkedIn;
      return true;
    });
  }, [registrations, rosterSearch, rosterFilter]);

  if (loading) {
    return (
      <div className="org-page">
        <EmptyState icon={QrCode} title="Loading gate scanner…" desc="Fetching confirmed registrations and preparing audio engine." />
      </div>
    );
  }

  if (loadError || !event) {
    return (
      <div className="org-page">
        <EmptyState title="Event not found" desc={loadError || 'This event may have been deleted or archived.'} />
      </div>
    );
  }

  return (
    <div className={`org-page ${isFullscreen ? 'org-scan-fullscreen-mode' : ''}`}>
      {/* Top Breadcrumb Link */}
      <button
        className="org-back-link"
        onClick={() => (isFullscreen ? setIsFullscreen(false) : navigate(`/organizer/events/${event._id}`))}
      >
        <ArrowLeft size={13} /> {isFullscreen ? 'Exit Fullscreen' : `Back to ${event.title}`}
      </button>

      {/* Main Page Title Header with Integrated Actions */}
      <div className="org-page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="org-page-eyebrow" style={{ margin: 0 }}>On-Ground Gate Scanner</p>
            <span className="org-scan-status-pill is-live">
              <span className="org-pulse-dot" /> LIVE DESK
            </span>
          </div>
          <h1 className="org-page-title">{event.title}</h1>
          <p className="org-page-desc">
            Scan attendee digital QR passes, enter tickets manually, or perform 1-click desk check-ins from the live roster.
          </p>
        </div>

        <div className="org-scan-header-actions">
          <button
            type="button"
            className={`org-scan-pill-btn ${soundEnabled ? 'is-active' : ''}`}
            onClick={toggleSound}
            title={soundEnabled ? 'Audio Feedback is ON' : 'Audio Feedback is Muted'}
          >
            {soundEnabled ? <SpeakerHigh size={14} weight="fill" /> : <SpeakerSlash size={14} />}
            <span>Sound {soundEnabled ? 'ON' : 'Muted'}</span>
          </button>

          <button
            type="button"
            className="org-scan-pill-btn"
            onClick={handleExportCSV}
            title="Download CSV Attendance sheet"
          >
            <DownloadSimple size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="org-scan-pill-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Toggle full gate display mode"
          >
            {isFullscreen ? <ArrowsIn size={14} /> : <ArrowsOut size={14} />}
            <span>{isFullscreen ? 'Normal View' : 'Gate Mode'}</span>
          </button>
        </div>
      </div>

      {/* ── Attendance Metrics Deck (Uniform Heights & Baseline Alignment) ── */}
      <div className="org-scan-stats-grid">
        {/* Card 1: Checked In */}
        <div className="org-scan-stat-card">
          <div className="org-scan-stat-top">
            <span className="org-scan-stat-label">Checked In</span>
            <div className="org-scan-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              <CheckCircle size={15} weight="fill" />
            </div>
          </div>
          <div className="org-scan-stat-val-row">
            <span className="org-scan-stat-val" style={{ color: '#059669' }}>{checkedInCount}</span>
            <span className="org-scan-stat-sub">/ {registrations.length}</span>
          </div>
          <div className="org-scan-stat-footer">
            <div className="org-scan-progress-bar">
              <div className="org-scan-progress-fill" style={{ width: `${attendanceRate}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
        <div className="org-scan-stat-card">
          <div className="org-scan-stat-top">
            <span className="org-scan-stat-label">Gate Turnout</span>
            <div className="org-scan-stat-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' }}>
              <Sparkle size={15} weight="fill" />
            </div>
          </div>
          <div className="org-scan-stat-val-row">
            <span className="org-scan-stat-val">{attendanceRate}%</span>
            <span className="org-scan-stat-sub">fill rate</span>
          </div>
          <div className="org-scan-stat-footer">
            <p className="org-scan-stat-desc">
              {checkedInCount} verified admitted
            </p>
          </div>
        </div>

        {/* Card 3: Pending Arrivals */}
        <div className="org-scan-stat-card">
          <div className="org-scan-stat-top">
            <span className="org-scan-stat-label">Pending Expected</span>
            <div className="org-scan-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#D97706' }}>
              <Circle size={15} />
            </div>
          </div>
          <div className="org-scan-stat-val-row">
            <span className="org-scan-stat-val" style={{ color: '#D97706' }}>{pendingCount}</span>
            <span className="org-scan-stat-sub">students</span>
          </div>
          <div className="org-scan-stat-footer">
            <p className="org-scan-stat-desc">
              Awaiting entrance scan
            </p>
          </div>
        </div>

        {/* Card 4: Gate Velocity / Session Stats */}
        <div className="org-scan-stat-card">
          <div className="org-scan-stat-top">
            <span className="org-scan-stat-label">Session Activity</span>
            <div className="org-scan-stat-icon" style={{ background: 'rgba(153, 27, 27, 0.12)', color: '#991B1B' }}>
              <Lightning size={15} weight="fill" />
            </div>
          </div>
          <div className="org-scan-stat-val-row">
            <span className="org-scan-stat-val">{sessionScanCount}</span>
            <span className="org-scan-stat-sub">scans logged</span>
          </div>
          <div className="org-scan-stat-footer">
            <p className="org-scan-stat-desc">
              {lastScanTime ? `Last scan at ${lastScanTime}` : 'Scanner standing by'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Operations Split Grid (1:1 Equal Width & Height) ── */}
      <div className="org-scan-grid">
        {/* LEFT COLUMN: Camera Scanner & Manual Key */}
        <div className="org-scan-station">
          <div className="org-scan-camera-card">
            {/* Viewport Box */}
            <div className="org-scan-viewport-wrap">
              <div id={QR_READER_ELEMENT_ID} className="org-scan-viewport-el" />

              {cameraActive ? (
                <>
                  {/* HUD Holographic Overlays */}
                  <div className="org-scan-hud-overlay">
                    <div className="org-scan-hud-top">
                      <span className="org-scan-status-pill is-live">
                        <span className="org-pulse-dot" /> CAMERA LIVE
                      </span>
                      <span className="org-scan-status-pill">
                        {cameraFacing === 'environment' ? 'Rear Lens' : 'Front Lens'}
                      </span>
                    </div>

                    <div className="org-scan-hud-bottom">
                      <span className="org-scan-hud-hint">Align QR pass within center crosshair</span>
                    </div>
                  </div>

                  {/* Aiming Reticle with Glowing Corner Brackets & Laser Scan */}
                  <div className="org-scan-reticle">
                    <div className="org-scan-bracket org-scan-bracket--tl" />
                    <div className="org-scan-bracket org-scan-bracket--tr" />
                    <div className="org-scan-bracket org-scan-bracket--bl" />
                    <div className="org-scan-bracket org-scan-bracket--br" />
                    <div className="org-scan-crosshair" />
                    <div className="org-scan-laser-line" />
                  </div>
                </>
              ) : (
                /* Standby View */
                <div className="org-scan-standby">
                  <div className="org-scan-standby-icon-wrap">
                    <Camera size={28} />
                  </div>
                  <h3 className="org-scan-standby-title">
                    {cameraStarting ? 'Initializing camera sensor…' : 'Camera is currently off'}
                  </h3>
                  <p className="org-scan-standby-desc">
                    Click Start Camera to activate real-time digital pass scanning, or enter a ticket ID below.
                  </p>
                </div>
              )}
            </div>

            {/* Camera Error Message if any */}
            {cameraError && (
              <div className="org-scan-camera-error">
                <Warning size={15} />
                <span>{cameraError}</span>
              </div>
            )}

            {/* Camera Control Toolbar */}
            <div className="org-scan-camera-toolbar">
              <button
                type="button"
                className={`org-scan-camera-btn-main ${cameraActive ? 'is-stop' : 'is-start'}`}
                onClick={cameraActive ? stopCamera : () => startCamera()}
                disabled={cameraStarting}
              >
                {cameraActive ? <VideoCameraSlash size={16} /> : <VideoCamera size={16} />}
                <span>
                  {cameraActive ? 'Stop Scanner' : cameraStarting ? 'Connecting…' : 'Activate Camera Scanner'}
                </span>
              </button>

              <button
                type="button"
                className="org-scan-camera-btn-sec"
                onClick={toggleCameraFacing}
                title="Switch Camera (Front / Rear)"
              >
                <ArrowsClockwise size={16} />
              </button>
            </div>

            {/* Manual Ticket Entry */}
            <div className="org-scan-manual-card">
              <form onSubmit={handleManualSubmit}>
                <div className="org-scan-manual-header">
                  <label htmlFor="manual-ticket-input" className="org-scan-manual-label">
                    <span>Manual Ticket Code / QR Token</span>
                  </label>
                  <span className="org-scan-manual-kbd">Press / to focus</span>
                </div>
                <div className="org-scan-manual-row">
                  <div className="org-scan-manual-input-wrap">
                    <QrCode size={15} className="org-scan-manual-icon" />
                    <input
                      id="manual-ticket-input"
                      ref={manualInputRef}
                      className="org-scan-manual-input"
                      placeholder="e.g. 7f8a9b1c or full QR token"
                      value={manualTicket}
                      onChange={(e) => setManualTicket(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="org-btn org-btn-primary"
                    style={{ padding: '0.5625rem 1.125rem', whiteSpace: 'nowrap' }}
                    disabled={submitting || !manualTicket.trim()}
                  >
                    {submitting ? 'Verifying…' : 'Check In'}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Dynamic Verification Card (Scan Result Outcome) ── */}
            {result && (
              <div className={`org-scan-verify-card is-${result.status}`}>
                <div className="org-scan-verify-top">
                  <div className="org-scan-verify-badge">
                    {result.status === 'success' && <><CheckCircle size={13} weight="fill" /> Access Granted</>}
                    {result.status === 'duplicate' && <><Warning size={13} weight="fill" /> Duplicate Entry</>}
                    {result.status === 'not_found' && <><Warning size={13} weight="fill" /> Invalid Pass</>}
                  </div>
                  <button
                    type="button"
                    className="org-scan-verify-dismiss"
                    onClick={() => setResult(null)}
                    title="Dismiss alert"
                  >
                    <X size={13} />
                  </button>
                </div>

                <div className="org-scan-verify-body">
                  <div className="org-scan-verify-avatar">
                    {result.student?.name
                      ? result.student.name.split(' ').map((p) => p[0]).slice(0, 2).join('')
                      : 'CC'}
                  </div>
                  <div className="org-scan-verify-meta">
                    <h4 className="org-scan-verify-name">{result.student?.name || 'Attendee'}</h4>
                    <div className="org-scan-verify-details">
                      {result.student?.rollNo && result.student.rollNo !== '—' && (
                        <span>Roll: <strong>{result.student.rollNo}</strong></span>
                      )}
                      {result.student?.branch && result.student.branch !== '—' && (
                        <span>• {result.student.branch}</span>
                      )}
                      {result.student?.ticketId && (
                        <span className="org-scan-verify-ticket">ID: {result.student.ticketId}</span>
                      )}
                      {result.student?.teamName && (
                        <span>• Team: <strong>{result.student.teamName}</strong></span>
                      )}
                    </div>
                    <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', fontWeight: 500, color: 'inherit' }}>
                      {result.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Operations Hub (Live Stream vs Roster Quick Search) */}
        <div className="org-scan-hub-card">
          <div className="org-scan-hub-tabs">
            <button
              type="button"
              className={`org-scan-hub-tab-btn ${activeTab === 'stream' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('stream')}
            >
              <Clock size={15} />
              <span>Live Stream</span>
              <span className="org-scan-hub-tab-count">{scanLog.length}</span>
            </button>
            <button
              type="button"
              className={`org-scan-hub-tab-btn ${activeTab === 'roster' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('roster')}
            >
              <UsersThree size={15} />
              <span>Roster Quick-Lookup</span>
              <span className="org-scan-hub-tab-count">{registrations.length}</span>
            </button>
          </div>

          <div className="org-scan-hub-content">
            {/* Tab 1: Live Check-in Stream */}
            {activeTab === 'stream' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="org-card-subtitle">Session Timeline</span>
                  <span className="text-xs text-gray-500 font-mono">Real-time gate activity</span>
                </div>

                {scanLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 gap-2 flex-1">
                    <QrCode size={36} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-600">No scans logged in this session yet</p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Scanned student passes and verified entries will appear here chronologically.
                    </p>
                  </div>
                ) : (
                  <div className="org-scan-stream-list">
                    {scanLog.map((entry, idx) => (
                      <div className="org-scan-stream-row" key={entry.qrToken + entry.at + idx}>
                        <div className="org-scan-stream-avatar">
                          {entry.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                        </div>
                        <div className="org-scan-stream-info">
                          <div className="org-scan-stream-name">{entry.name}</div>
                          <div className="org-scan-stream-sub">
                            <span>{entry.rollNo !== '—' ? entry.rollNo : entry.branch}</span>
                            <span>•</span>
                            <span>{entry.at}</span>
                          </div>
                        </div>
                        <span className="org-scan-stream-badge">
                          <Check size={11} weight="bold" /> Admitted
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tab 2: Roster Quick Lookup & Direct Check-in */}
            {activeTab === 'roster' && (
              <>
                {/* Search & Filter bar */}
                <div className="space-y-2">
                  <div className="org-scan-search-bar">
                    <MagnifyingGlass size={14} className="org-scan-search-icon" />
                    <input
                      className="org-scan-search-input"
                      placeholder="Search student name, roll number, or ticket ID…"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                    />
                  </div>

                  <div className="org-scan-filter-pills">
                    <button
                      type="button"
                      className={`org-scan-filter-pill ${rosterFilter === 'all' ? 'is-active' : ''}`}
                      onClick={() => setRosterFilter('all')}
                    >
                      All ({registrations.length})
                    </button>
                    <button
                      type="button"
                      className={`org-scan-filter-pill ${rosterFilter === 'pending' ? 'is-active' : ''}`}
                      onClick={() => setRosterFilter('pending')}
                    >
                      Pending ({pendingCount})
                    </button>
                    <button
                      type="button"
                      className={`org-scan-filter-pill ${rosterFilter === 'checkedIn' ? 'is-active' : ''}`}
                      onClick={() => setRosterFilter('checkedIn')}
                    >
                      Checked In ({checkedInCount})
                    </button>
                  </div>
                </div>

                {filteredRoster.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 gap-1.5 flex-1">
                    <UsersThree size={32} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-600">No matching students found</p>
                    <p className="text-xs text-gray-400">Try a different name, roll no, or filter criteria.</p>
                  </div>
                ) : (
                  <div className="org-scan-roster-list">
                    {filteredRoster.map((r) => {
                      const name = r.student?.name || r.name || 'Student';
                      const roll = r.profileSnapshot?.rollNo || r.rollNo || '—';
                      const branch = r.profileSnapshot?.branch || r.branch || '—';
                      const ticketId = (r.qrToken || '').slice(0, 8).toUpperCase();
                      const isCheckingThis = checkingInId === r._id;

                      return (
                        <div className="org-scan-roster-row" key={r._id}>
                          <div className="min-w-0 flex-1">
                            <div className="org-scan-roster-name">{name}</div>
                            <div className="org-scan-roster-meta">
                              <span>{roll !== '—' ? roll : branch}</span>
                              <span>•</span>
                              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.625rem' }}>{ticketId}</span>
                            </div>
                          </div>

                          {r.checkedIn ? (
                            <span className="org-checkin-badge org-checkin-badge--in" style={{ fontSize: '0.6875rem', padding: '0.2rem 0.5rem' }}>
                              <CheckCircle size={11} weight="fill" /> Admitted
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="org-scan-direct-btn"
                              onClick={() => handleDirectCheckIn(r)}
                              disabled={submitting}
                              title="Perform instant 1-click desk check-in"
                            >
                              <UserCheck size={12} />
                              <span>{isCheckingThis ? 'Admitting…' : 'Check In'}</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

