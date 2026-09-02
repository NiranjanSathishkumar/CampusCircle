/**
 * StatusPage.jsx — full-viewport "official notice" state for error/edge
 * conditions (404, network loss, auth failures). Styled after the
 * registrar-stamp motif used across the brand (dashed stamp border, mono
 * uppercase code) so these read as intentional CampusCircle pages rather
 * than a framework's default error screen.
 */
import { Link } from 'react-router-dom';
import CampusCircleLogo from './CampusCircleLogo';

const STAMP_COLORS = {
  crimson: { border: '#991B1B', text: '#991B1B', shadow: 'rgba(153, 27, 27, 0.06)' },
  ink: { border: '#0F172A', text: '#0F172A', shadow: 'rgba(15, 23, 42, 0.06)' },
  gold: { border: '#B45309', text: '#B45309', shadow: 'rgba(180, 83, 9, 0.06)' },
};

export default function StatusPage({
  icon: Icon,
  code,
  tone = 'crimson',
  title,
  description,
  primaryAction,
  secondaryAction,
  children,
}) {
  const colors = STAMP_COLORS[tone] || STAMP_COLORS.crimson;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[#F5F2EA] text-center">
      <Link to="/" className="mb-10">
        <CampusCircleLogo variant="horizontal" size={26} />
      </Link>

      {code && (
        <div
          className="inline-flex items-center justify-center gap-2 mb-6 px-4 py-1.5 -rotate-2 select-none"
          style={{
            border: `2px dashed ${colors.border}`,
            color: colors.text,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            borderRadius: '2px',
            boxShadow: `0 0 0 3px ${colors.shadow}`,
          }}
        >
          {Icon && <Icon size={14} weight="bold" />}
          {code}
        </div>
      )}

      <h1
        className="font-['Space_Grotesk'] font-bold text-[#0F172A] mb-3"
        style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}
      >
        {title}
      </h1>

      <p className="text-[#6B7280] max-w-md mb-8 leading-relaxed" style={{ fontSize: '0.9375rem' }}>
        {description}
      </p>

      {children}

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
