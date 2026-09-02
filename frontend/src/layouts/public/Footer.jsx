import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Envelope,
  Globe,
  QrCode,
  ShieldCheck,
  PlusCircle,
  Question
} from '@phosphor-icons/react';
import {
  QUICK_UTILITIES,
  COUNCILS,
  DEPARTMENTS,
  GOVERNANCE,
  SOCIAL_LINKS
} from './footerConfig';
import { CampusCircleMark } from '@/shared/components/CampusCircleLogo';

export default function Footer({ variant = 'full', compact = false }) {
  const year = new Date().getFullYear();
  const isCompact = compact || variant === 'compact';
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setSubscribeStatus('error');
      setErrorMessage('Please enter your @siesgst.ac.in email.');
      return;
    }

    if (!email.toLowerCase().includes('@')) {
      setSubscribeStatus('error');
      setErrorMessage('Please enter a valid campus email address.');
      return;
    }

    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
    }, 800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ============================================================
     COMPACT UNIFIED APP FOOTER (Useful Campus Utilities, No Navbar Repetition)
     ============================================================ */
  if (isCompact) {
    return (
      <footer
        id="app-footer"
        className="bg-[#0B1120] text-[#F5F2EA] relative overflow-hidden font-sans border-t border-[#D8D2C4]/15 mt-auto"
        aria-label="CampusCircle Application Footer"
      >
        <div className="absolute inset-0 ledger-grid-dark pointer-events-none opacity-25" aria-hidden="true" />

        <div className="relative z-10 page-container py-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#D8D2C4]/10">

            {/* Left: Brand Identity & Campus Node Status */}
            <div className="flex items-center gap-3">
              <CampusCircleMark size={28} glow />
              <div>
                <span className="font-display font-bold text-base tracking-tight text-[#F5F2EA] block leading-none">
                  Campus<span className="text-emerald-400">Circle</span>
                </span>
                <span className="font-mono text-[0.625rem] text-[#9CA3AF] tracking-wider uppercase">
                  SIES GST Ecosystem
                </span>
              </div>
            </div>

            {/* Middle: Useful Campus Action Tools (REPLACED REPEATED NAVBAR LINKS) */}
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#9CA3AF]" aria-label="Campus Quick Tools">
              <a
                href="https://siesgst.ac.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#F5F2EA] transition-colors flex items-center gap-1.5"
              >
                <Globe size={14} className="text-[#991B1B]" />
                <span>SIES GST Portal</span>
              </a>

              <a
                href="#access"
                className="hover:text-[#F5F2EA] transition-colors flex items-center gap-1.5"
              >
                <PlusCircle size={14} className="text-[#991B1B]" />
                <span>Host Event</span>
              </a>

              <a
                href="#profile"
                className="hover:text-[#F5F2EA] transition-colors flex items-center gap-1.5"
              >
                <QrCode size={14} className="text-[#991B1B]" />
                <span>Digital QR Pass</span>
              </a>

              <a
                href="#support"
                className="hover:text-[#F5F2EA] transition-colors flex items-center gap-1.5"
              >
                <Question size={14} className="text-[#991B1B]" />
                <span>Help Desk</span>
              </a>

              <a
                href="#signup"
                className="hover:text-[#F5F2EA] transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck size={14} className="text-[#991B1B]" />
                <span>Closed Policy</span>
              </a>
            </nav>

            {/* Right: Socials & Back to Top */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((soc) => {
                  const Icon = soc.icon;
                  return (
                    <a
                      key={soc.label}
                      href={soc.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`SIES GST ${soc.label}`}
                      className="text-[#6B7280] hover:text-[#F5F2EA] transition-colors p-1"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>

              <button
                onClick={scrollToTop}
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#141E33] border border-[#D8D2C4]/15 text-[#9CA3AF] hover:text-[#F5F2EA] hover:border-[#D8D2C4]/30 transition-all font-mono text-xs"
                aria-label="Scroll back to top"
              >
                <span>Top</span>
                <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#6B7280]">
            <p>© {year} CampusCircle · SIES Graduate School of Technology, Navi Mumbai.</p>
            <div className="text-[0.6875rem] flex items-center gap-2 flex-wrap">
              <span>NAAC 'A' Grade · NBA Accredited · Affiliated to Mumbai University</span>
              <span className="text-[#6B7280]/40">·</span>
              <Link to="/organizer/login" className="hover:text-[#9CA3AF] transition-colors">Organiser Portal</Link>
              <span className="text-[#6B7280]/40">·</span>
              <Link to="/admin/login" className="hover:text-[#9CA3AF] transition-colors">Admin Console</Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  /* ============================================================
     FULL LANDING FOOTER (Architectural, Clean & Useful Tools)
     ============================================================ */
  return (
    <footer
      id="signup"
      className="bg-[#0B1120] text-[#F5F2EA] relative overflow-hidden font-sans border-t border-[#D8D2C4]/15"
      aria-label="CampusCircle Landing Page Footer"
    >
      {/* Ambient background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-gradient-to-b from-[#991B1B]/10 via-[#1E293B]/5 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 ledger-grid-dark pointer-events-none opacity-25"
        aria-hidden="true"
      />

      <div className="relative z-10 page-container">

        {/* SECTION 1: STATEMENT HERO & CTA BLOCK */}
        <div className="pt-20 pb-16 border-b border-[#D8D2C4]/10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E293B]/80 border border-[#D8D2C4]/15 text-xs font-mono text-[#9CA3AF]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SIES GST Closed-Campus Ecosystem</span>
            </div>

            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-[#F5F2EA] tracking-tight leading-[1.1]">
              Your verified campus history starts here.
            </h2>

            <p className="text-[#9CA3AF] text-base leading-relaxed max-w-[54ch]">
              Join SIES Graduate School of Technology’s dedicated student hub. Build your digital passport across events, councils, and peer networks.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                id="footer-signup-cta"
                href="#signup"
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-[#991B1B] hover:bg-[#b91c1c] active:scale-[0.98] text-white font-medium text-sm rounded transition-all shadow-md"
              >
                <span>Join CampusCircle</span>
                <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                id="footer-explore-cta"
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#141E33] hover:bg-[#1E293B] border border-[#D8D2C4]/20 text-[#F5F2EA] font-medium text-sm rounded transition-all"
              >
                <span>Explore Platform</span>
              </a>
            </div>
          </div>

          {/* Right Column: Clean Newsletter Subscription */}
          <div className="lg:col-span-5 bg-[#141E33]/90 border border-[#D8D2C4]/15 p-7 rounded-lg shadow-xl space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#9CA3AF] mb-1">
                <Envelope size={14} className="text-[#991B1B]" />
                <span>Campus Digest</span>
              </div>
              <h3 className="font-display font-semibold text-xl text-[#F5F2EA]">
                Get Weekly Event Digest
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                Direct updates on hackathons, workshops, and council announcements sent every Monday.
              </p>
            </div>

            {subscribeStatus === 'success' ? (
              <div className="p-4 bg-emerald-950/70 border border-emerald-500/40 rounded text-emerald-300 text-xs font-medium flex items-center gap-2.5">
                <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                <span>Subscribed! Check your campus inbox for Monday's bulletin.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (subscribeStatus === 'error') setSubscribeStatus('idle');
                  }}
                  placeholder="student@siesgst.ac.in"
                  className="w-full bg-[#0B1120] border border-[#D8D2C4]/20 rounded px-4 py-3 text-sm text-[#F5F2EA] placeholder-[#6B7280] focus:outline-none focus:border-[#991B1B] font-mono transition-colors"
                  aria-label="Enter your SIES GST email"
                />

                <button
                  type="submit"
                  disabled={subscribeStatus === 'loading'}
                  className="w-full py-3 bg-[#991B1B] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {subscribeStatus === 'loading' ? (
                    <span className="font-mono">Subscribing...</span>
                  ) : (
                    <>
                      <span>Subscribe to Digest</span>
                      <ArrowRight size={14} weight="bold" />
                    </>
                  )}
                </button>

                {subscribeStatus === 'error' && (
                  <p className="text-xs text-rose-400 font-mono mt-1">
                    {errorMessage}
                  </p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* SECTION 2: STRUCTURED 5-COLUMN DIRECTORY */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 border-b border-[#D8D2C4]/10 text-xs">

          {/* Column 1: Brand & Identity */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <CampusCircleMark size={28} glow />
              <span className="font-display font-bold text-base text-[#F5F2EA]">
                Campus<span className="text-emerald-400">Circle</span>
              </span>
            </div>
            <p className="text-[#9CA3AF] leading-relaxed text-[0.75rem]">
              SIES Graduate School of Technology closed-campus digital hub.
            </p>
            <p className="font-mono text-[0.6875rem] text-[#6B7280]">
              Nerul, Navi Mumbai - 400706
            </p>
          </div>

          {/* Column 2: Quick Tools & Services (REPLACED REPEATED NAVBAR LINKS) */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#6B7280] font-semibold">
              Campus Utilities
            </h4>
            <ul className="space-y-2 text-[#9CA3AF]">
              {QUICK_UTILITIES.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.target}
                    rel={link.target ? 'noreferrer' : undefined}
                    className="hover:text-[#F5F2EA] transition-colors block"
                  >
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Councils */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#6B7280] font-semibold">
              Councils & Bodies
            </h4>
            <ul className="space-y-2 text-[#9CA3AF]">
              {COUNCILS.map((council) => (
                <li key={council.label}>
                  <a href={council.href} className="hover:text-[#F5F2EA] transition-colors">
                    {council.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Departments */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#6B7280] font-semibold">
              Departments
            </h4>
            <ul className="space-y-2 text-[#9CA3AF]">
              {DEPARTMENTS.map((dept) => (
                <li key={dept.code} className="flex items-center gap-2">
                  <span className="font-mono text-[0.625rem] text-[#F5F2EA] bg-[#141E33] px-1 py-0.5 rounded border border-[#D8D2C4]/10">
                    {dept.code}
                  </span>
                  <span className="truncate">{dept.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Governance */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#6B7280] font-semibold">
              Governance
            </h4>
            <ul className="space-y-2 text-[#9CA3AF]">
              {GOVERNANCE.map((gov) => (
                <li key={gov.label}>
                  <a href={gov.href} className="hover:text-[#F5F2EA] transition-colors">
                    {gov.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* SECTION 3: BOTTOM UTILITY & COPYRIGHT BAR */}
        <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 text-xs text-[#6B7280]">

          {/* Institutional Accreditation */}
          <div className="space-y-1">
            <p className="font-mono text-[0.6875rem]">
              © {year} CampusCircle · SIES Graduate School of Technology. All rights reserved.
            </p>
            <p className="text-[0.625rem] flex items-center gap-2 flex-wrap">
              <span>NAAC 'A' Grade Accredited · NBA Accredited · Affiliated to University of Mumbai (DTE 3211)</span>
              <span className="text-[#6B7280]/40">·</span>
              <Link to="/organizer/login" className="hover:text-[#9CA3AF] transition-colors">Organiser Portal</Link>
              <span className="text-[#6B7280]/40">·</span>
              <Link to="/admin/login" className="hover:text-[#9CA3AF] transition-colors">Admin Console</Link>
            </p>
          </div>

          {/* Social Links & Back to Top */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((soc) => {
                const Icon = soc.icon;
                return (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`SIES GST ${soc.label}`}
                    className="text-[#6B7280] hover:text-[#F5F2EA] transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-3 py-1.5 bg-[#141E33] border border-[#D8D2C4]/15 hover:border-[#D8D2C4]/35 rounded text-[#9CA3AF] hover:text-[#F5F2EA] font-mono text-xs transition-all"
              aria-label="Scroll back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
}
