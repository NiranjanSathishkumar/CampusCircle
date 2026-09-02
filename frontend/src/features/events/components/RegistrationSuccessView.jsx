/**
 * RegistrationSuccessView.jsx
 * The payoff screen shown inside the registration dialog once a ticket is confirmed.
 * Features:
 * - DOM Confetti burst
 * - GSAP ScrambleText ticket ID animation
 * - Scannable QR code SVG
 * - Realistic boarding-pass style ticket pass card with perforated notches
 * - One-click ticket ID copy to clipboard with toast
 * - Teammate invite summary
 */
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { QRCodeSVG } from 'qrcode.react';
import {
  Check,
  CheckCircle,
  Copy,
  DownloadSimple,
  Sparkle,
  Ticket,
  UsersThree,
} from '@phosphor-icons/react';

gsap.registerPlugin(ScrambleTextPlugin);

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function ConfettiBurst({ fire }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!fire || !containerRef.current || prefersReducedMotion()) return;
    const container = containerRef.current;
    const colors = ['#991B1B', '#B45309', '#1A3A2A', '#0F172A', '#F5F2EA', '#10B981'];
    const pieces = [];
    const count = 30;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'reg-confetti-piece';
      el.style.background = colors[i % colors.length];
      if (i % 3 === 0) el.style.borderRadius = '50%';
      container.appendChild(el);
      pieces.push(el);
    }

    const tl = gsap.timeline({ onComplete: () => pieces.forEach((p) => p.remove()) });
    pieces.forEach((el) => {
      const angle = gsap.utils.random(-150, -30) * (Math.PI / 180);
      const distance = gsap.utils.random(80, 220);
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      gsap.set(el, {
        x: 0,
        y: 0,
        opacity: 1,
        scale: gsap.utils.random(0.6, 1.3),
        rotation: gsap.utils.random(0, 360),
      });
      tl.to(
        el,
        {
          x,
          y,
          rotation: `+=${gsap.utils.random(180, 520)}`,
          duration: gsap.utils.random(0.6, 0.95),
          ease: 'power2.out',
        },
        0
      ).to(
        el,
        {
          y: '+=120',
          opacity: 0,
          duration: 0.55,
          ease: 'power1.in',
        },
        '>-0.15'
      );
    });

    return () => {
      tl.kill();
      pieces.forEach((p) => p.remove());
    };
  }, [fire]);

  return <div className="reg-confetti-stage" ref={containerRef} aria-hidden="true" />;
}

function ScrambleTicketId({ ticketId }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || !ticketId) return;
    if (prefersReducedMotion()) {
      ref.current.textContent = ticketId;
      return;
    }
    const tween = gsap.to(ref.current, {
      duration: 1.1,
      delay: 0.25,
      scrambleText: { text: ticketId, chars: 'upperCase', revealDelay: 0.15, speed: 0.4 },
      ease: 'power1.out',
    });
    return () => tween.kill();
  }, [ticketId]);

  return <span ref={ref} className="reg-ticket-token">{ticketId}</span>;
}

export default function RegistrationSuccessView({
  event,
  ticketId,
  status = 'confirmed',
  teamMembers = [],
  onDone,
}) {
  const filledTeammates = (teamMembers || []).filter(Boolean);
  const isWaitlisted = status === 'waitlisted';
  const [copied, setCopied] = useState(false);

  const handleCopyToken = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <>
      <div className="reg-success-body">
        <ConfettiBurst fire={!!ticketId && !isWaitlisted} />

        <motion.div
          className="reg-success-icon-badge"
          initial={{ scale: 0.4, opacity: 0, rotate: -25 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.05 }}
          style={
            isWaitlisted
              ? { background: 'rgba(180, 83, 9, 0.12)', borderColor: 'rgba(180, 83, 9, 0.3)', color: '#B45309' }
              : undefined
          }
        >
          <CheckCircle size={32} weight="fill" />
        </motion.div>

        <motion.h2
          className="reg-success-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          {isWaitlisted ? 'Waitlist Reservation Confirmed' : 'Registration Confirmed!'}
        </motion.h2>

        <p className="reg-success-subtitle">
          {isWaitlisted
            ? "You've been added to the priority waitlist. We'll alert you if a seat opens up."
            : 'Your official digital access pass is generated and ready for check-in.'}
        </p>

        {/* ── Realistic Digital Boarding Pass ── */}
        <div className="reg-ticket-pass-card">
          <div className="reg-ticket-top">
            <div className="reg-ticket-event-info">
              <p className="reg-ticket-host">{event.hostName || 'SIES GST Community'}</p>
              <h4 className="reg-ticket-event-name">{event.title}</h4>
              <p style={{ fontSize: '0.6875rem', color: '#64748B', margin: '0.25rem 0 0' }}>
                {event.dateFormatted || 'Upcoming Event'} {event.venue ? `· ${event.venue}` : ''}
              </p>
            </div>
            <span
              className="reg-ticket-status-pill"
              style={
                isWaitlisted
                  ? { background: 'rgba(180, 83, 9, 0.1)', color: '#B45309', borderColor: 'rgba(180, 83, 9, 0.25)' }
                  : undefined
              }
            >
              {isWaitlisted ? 'Waitlisted' : 'Verified Pass'}
            </span>
          </div>

          <div className="reg-ticket-bottom">
            <div className="reg-ticket-qr-wrap">
              <QRCodeSVG
                value={ticketId || 'CAMPUS-CIRCLE-PASS'}
                size={58}
                bgColor="transparent"
                fgColor="#0F172A"
                level="M"
                title={`QR Pass ${ticketId}`}
              />
            </div>

            <div className="reg-ticket-details">
              <span className="reg-ticket-label">
                <Ticket size={11} weight="fill" /> {isWaitlisted ? 'Waitlist Token' : 'Digital Ticket ID'}
              </span>
              <div className="reg-ticket-token-row">
                <ScrambleTicketId ticketId={ticketId || 'CC-PASS-0000'} />
                <button
                  type="button"
                  className="reg-ticket-copy-btn"
                  onClick={handleCopyToken}
                  title="Copy Ticket ID"
                  aria-label="Copy ticket ID"
                >
                  {copied ? <Check size={12} style={{ color: '#10B981' }} /> : <Copy size={12} />}
                </button>
              </div>
              {filledTeammates.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2, fontSize: '0.6875rem', color: '#1A3A2A', fontWeight: 600 }}>
                  <UsersThree size={12} weight="bold" />
                  <span>{filledTeammates.length} teammate invite{filledTeammates.length === 1 ? '' : 's'} dispatched</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="reg-ticket-pass-note">
          Saved directly to <strong>My Events</strong> on your student dashboard. Show the QR code at the registration desk for fast check-in.
        </p>
      </div>

      <div className="events-dialog-footer">
        <button
          type="button"
          className="events-dialog-confirm"
          style={{ flex: 1 }}
          onClick={onDone}
        >
          <Check size={15} weight="bold" />
          <span>Done &amp; View Pass in My Events</span>
        </button>
      </div>
    </>
  );
}
