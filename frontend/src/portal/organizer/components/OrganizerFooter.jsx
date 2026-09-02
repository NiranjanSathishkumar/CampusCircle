import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Globe,
  ArrowUp,
  ArrowSquareOut,
  CalendarCheck,
  UsersThree,
  Briefcase,
  ChartBar,
  GearSix,
  EnvelopeSimple,
  Buildings,
  QrCode,
  Sparkle,
  LockKey,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';

export default function OrganizerFooter() {
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'GDSC SIES GST';
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="org-footer" aria-label="Organizer Portal Footer">
      {/* ── Top Bar: Community Stamp, Live Security Node & Back-to-Top ── */}
      <div className="org-footer-top-bar">
        <div className="org-footer-brand-wrap">
          <div className="w-8 h-8 rounded-lg bg-[#991B1B] text-white flex items-center justify-center font-bold text-sm shadow-xs font-['Space_Grotesk'] flex-shrink-0">
            {community?.icon || '⚡'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-['Space_Grotesk'] font-bold text-sm text-[#0F172A]">
              <span>{communityName}</span>
              <ShieldCheck size={14} weight="fill" className="text-[#1A3A2A]" />
              <span className="text-[10px] font-mono font-normal text-gray-500 bg-[#FAF8F5] border border-[#D8D2C4] px-1.5 py-0.2 rounded">
                Organizer Workspace
              </span>
            </div>
            <span className="text-[11px] font-mono text-gray-500 block">
              SIES Graduate School of Technology · Student Activity Council (SAC)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Live Node Badge */}
          <div className="org-footer-node-status">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-emerald-900 font-medium">
              SIES GST Node · Session Authenticated · v2.4.0
            </span>
          </div>

          {/* Switch to Student Portal */}
          <Link
            to="/discover"
            className="org-btn org-btn-ghost text-xs !py-1 !px-2.5 text-gray-700 hover:text-[#991B1B]"
            title="Switch to Student Portal View"
          >
            <ArrowSquareOut size={13} />
            <span>Student View</span>
          </Link>

          {/* Back to Top Button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="org-btn org-btn-secondary text-xs !py-1 !px-2.5"
            title="Scroll back to top"
            aria-label="Scroll back to top"
          >
            <ArrowUp size={13} />
            <span>Top</span>
          </button>
        </div>
      </div>

      {/* ── Main Navigation Columns Grid ── */}
      <div className="org-footer-nav-grid">
        {/* Column 1: Event Operations */}
        <div className="org-footer-col">
          <h4 className="org-footer-col-title">
            <CalendarCheck size={14} className="text-[#991B1B]" />
            <span>Event Operations</span>
          </h4>
          <ul className="org-footer-link-list">
            <li>
              <Link to="/organizer/events" className="org-footer-link">
                Campus Events Hub
              </Link>
            </li>
            <li>
              <Link to="/organizer/events/create" className="org-footer-link">
                Event Creation Studio
              </Link>
            </li>
            <li>
              <Link to="/organizer/events/org_ev_1/scan" className="org-footer-link">
                QR Attendance Pass Scanner
              </Link>
            </li>
            <li>
              <Link to="/organizer/posts" className="org-footer-link">
                Announcements &amp; Updates Feed
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: People & Hiring */}
        <div className="org-footer-col">
          <h4 className="org-footer-col-title">
            <UsersThree size={14} className="text-[#0D9488]" />
            <span>Team &amp; Talent</span>
          </h4>
          <ul className="org-footer-link-list">
            <li>
              <Link to="/organizer/roster" className="org-footer-link">
                Committee Leadership Roster
              </Link>
            </li>
            <li>
              <Link to="/organizer/recruitment" className="org-footer-link">
                Recruitment Drives
              </Link>
            </li>
            <li>
              <Link to="/organizer/recruitment" className="org-footer-link">
                Candidate Screening Pipeline
              </Link>
            </li>
            <li>
              <Link to="/organizer/roster" className="org-footer-link">
                Automated Roster Onboarding
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Analytics & Governance */}
        <div className="org-footer-col">
          <h4 className="org-footer-col-title">
            <ChartBar size={14} className="text-[#1A3A2A]" />
            <span>Analytics &amp; Security</span>
          </h4>
          <ul className="org-footer-link-list">
            <li>
              <Link to="/organizer/analytics" className="org-footer-link">
                Performance Analytics &amp; KPIs
              </Link>
            </li>
            <li>
              <Link to="/organizer/settings" className="org-footer-link">
                Community Portal Settings
              </Link>
            </li>
            <li>
              <Link to="/organizer/roster" className="org-footer-link">
                Shared Access Audit Trail
              </Link>
            </li>
            <li>
              <a
                href="https://siesgst.ac.in"
                target="_blank"
                rel="noreferrer"
                className="org-footer-link"
              >
                SAC Guidelines &amp; Protocol
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Institutional Resources */}
        <div className="org-footer-col">
          <h4 className="org-footer-col-title">
            <Buildings size={14} className="text-[#B45309]" />
            <span>Campus Institutional</span>
          </h4>
          <ul className="org-footer-link-list">
            <li>
              <a
                href="https://siesgst.ac.in"
                target="_blank"
                rel="noreferrer"
                className="org-footer-link flex items-center gap-1"
              >
                <Globe size={12} className="text-[#B45309]" />
                <span>SIES GST Official Website</span>
              </a>
            </li>
            <li>
              <a
                href="mailto:helpdesk.organizer@siesgst.ac.in"
                className="org-footer-link flex items-center gap-1"
              >
                <EnvelopeSimple size={12} className="text-[#991B1B]" />
                <span>Organizer Tech Helpdesk</span>
              </a>
            </li>
            <li>
              <Link to="/discover" className="org-footer-link">
                CampusCircle Student Portal
              </Link>
            </li>
            <li>
              <span className="text-[11px] font-mono text-gray-500 block pt-1">
                Nerul, Navi Mumbai · 400706
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* ── Bottom Institutional Copyright Bar ── */}
      <div className="org-footer-bottom-bar">
        <div className="text-xs font-['Plus_Jakarta_Sans'] text-gray-600">
          <span>&copy; {currentYear} </span>
          <strong className="text-[#0F172A] font-['Space_Grotesk']">CampusCircle</strong>
          <span> &middot; SIES Graduate School of Technology &middot; All Rights Reserved.</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
          <span className="flex items-center gap-1 text-[11px]">
            <LockKey size={12} className="text-emerald-700" />
            <span>Encrypted Campus Authority Session</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
