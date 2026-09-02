/**
 * OrganizerLayout.jsx — Enhanced Organizer Portal Shell
 * Implements a high-craft sidebar & topbar with desktop rail collapse,
 * notification center dropdown, quick search bar, quick action CTA,
 * profile/community menu, and motion layout transitions.
 * Fully consistent with the CampusCircle Student Interface design system.
 */
import { useEffect, useState, useRef } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  List,
  X,
  SignOut,
  ShieldCheck,
  CaretRight,
  CaretLeft,
  CaretDown,
  ArrowSquareOut,
  Bell,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  Trash,
  SidebarSimple,
  CalendarPlus,
  Megaphone,
  UserPlus,
  Lightning,
  Sparkle,
  GearSix,
  User,
} from '@phosphor-icons/react';
import {
  ORGANIZER_NAV_GROUPS,
  ORGANIZER_CATEGORY_MAP,
} from './organizerNavConfig';
import { ORGANIZER_EVENTS, ROSTER_MEMBERS, ORGANIZER_POSTS } from '@/mocks/organizer.mock';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { useOrganizerNotifications } from '@/portal/organizer/notifications/useOrganizerNotifications';
import { CampusCircleMark } from '@/shared/components/CampusCircleLogo';
import OrganizerFooter from '@/portal/organizer/components/OrganizerFooter';
import '@/layouts/portal/portal-shell.css';

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || 'OC';
}

export default function OrganizerLayout() {
  const { community, logoutOrganizer } = useOrganizerAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Layout & Navigation state (default collapsed on desktop; hover expands temporarily, button pins permanently)
  const [pinnedExpanded, setPinnedExpanded] = useState(() => {
    return localStorage.getItem('cc_org_sidebar_pinned') === 'true';
  });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 960);

  const isExpanded = !isDesktop || pinnedExpanded || isHovered;
  const effectiveCollapsed = isDesktop && !isExpanded;
  const shellCollapsed = isDesktop && !pinnedExpanded;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Panels & Dropdowns state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    ensureListLoaded,
    markRead,
    markAllRead,
    dismiss,
  } = useOrganizerNotifications();

  const [profileOpen, setProfileOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const quickCreateRef = useRef(null);
  const searchInputRef = useRef(null);

  // Track viewport so the collapsed rail never leaks into the mobile drawer
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)');
    const handleChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // Close mobile drawer and hover overlay on route change
  useEffect(() => {
    setDrawerOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
    setQuickCreateOpen(false);
    setSearchOpen(false);
    setIsHovered(false);
  }, [location.pathname]);

  // Save sidebar pin/collapse state to localStorage
  const handleToggleCollapse = () => {
    setPinnedExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('cc_org_sidebar_pinned', String(next));
      if (!next) {
        setIsHovered(false);
      }
      return next;
    });
  };

  // Track window scroll for elevated glass topbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside and escape keys for panels
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target)) {
        setQuickCreateOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
        setQuickCreateOpen(false);
        setDrawerOpen(false);
        setSearchQuery('');
      }
      // Ctrl+B or Cmd+B to toggle sidebar collapse
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleCollapse();
      }
      // Ctrl+K or Cmd+K to jump into the topbar search (matches the ⌘K hint)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  // Find current active navigation item
  const activeGroup = ORGANIZER_NAV_GROUPS.find((g) =>
    g.items.some((item) => location.pathname.startsWith(item.path))
  );
  const activeItem = ORGANIZER_NAV_GROUPS
    .flatMap((g) => g.items)
    .find((item) => location.pathname.startsWith(item.path));

  // Notification metrics & actions
  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return n.unread;
    return true;
  });

  const handleToggleNotifOpen = () => {
    setNotifOpen((open) => {
      if (!open) ensureListLoaded();
      return !open;
    });
  };

  const handleMarkRead = (id, e) => {
    e?.stopPropagation();
    markRead(id);
  };

  const handleDismiss = (id, e) => {
    e?.stopPropagation();
    dismiss(id);
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const handleNotifItemClick = (notif) => {
    if (notif.unread) markRead(notif.id);
    setNotifOpen(false);
    navigate(notif.link);
  };

  const handleSignOut = () => {
    logoutOrganizer();
    navigate('/organizer/login');
  };

  const communityName = community?.name || 'Organiser Community';
  const communityInitials = getInitials(communityName);

  return (
    <div className={`org-shell ${shellCollapsed ? 'org-shell--collapsed' : ''}`}>
      {/* ── Sidebar (desktop sticky / mobile drawer) ── */}
      <div className={`org-sidebar-wrapper ${shellCollapsed ? 'org-sidebar-wrapper--collapsed' : ''}`}>
        <aside
          className={`org-sidebar ${effectiveCollapsed ? 'org-sidebar--collapsed' : ''} ${
            isHovered && !pinnedExpanded && isDesktop ? 'org-sidebar--hover-expanded' : ''
          } ${pinnedExpanded && isDesktop ? 'org-sidebar--pinned' : ''} ${
            drawerOpen ? 'org-sidebar--open' : ''
          }`}
          onMouseEnter={() => {
            if (isDesktop && !pinnedExpanded) setIsHovered(true);
          }}
          onMouseLeave={() => {
            if (isDesktop && !pinnedExpanded) setIsHovered(false);
          }}
        >
          {/* Brand Header */}
          <div className="org-sidebar-brand">
            <motion.button
              type="button"
              className="org-sidebar-brand-link"
              onClick={() => {
                if (!pinnedExpanded) setIsHovered(false);
                navigate('/organizer/dashboard');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              title="CampusCircle Organiser Portal"
            >
              <motion.div
                className="org-sidebar-brand-icon"
                style={{ background: 'transparent' }}
                whileHover={{ rotate: -6, scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <CampusCircleMark size={24} />
              </motion.div>
              <AnimatePresence initial={false}>
                {!effectiveCollapsed && (
                  <motion.div
                    key="brand-text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="org-sidebar-brand-text"
                  >
                    <span className="org-sidebar-brand-title">
                      Campus<span className="text-[#059669]">Circle</span>
                    </span>
                    <span className="org-sidebar-brand-tag">Organiser Portal</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Desktop collapse / pin button */}
            <motion.button
              type="button"
              className={`org-sidebar-collapse-btn ${pinnedExpanded ? 'org-sidebar-collapse-btn--pinned' : ''}`}
              onClick={handleToggleCollapse}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.12 }}
              aria-label={pinnedExpanded ? 'Collapse sidebar (Ctrl+B)' : 'Keep sidebar open (Ctrl+B)'}
              title={pinnedExpanded ? 'Collapse sidebar (Ctrl+B)' : 'Keep sidebar open (Ctrl+B)'}
            >
              <motion.div
                animate={{ rotate: pinnedExpanded ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className="flex items-center justify-center"
              >
                <SidebarSimple size={16} weight={pinnedExpanded ? 'fill' : 'regular'} />
              </motion.div>
            </motion.button>

            {/* Mobile close button */}
            <button
              type="button"
              className="org-sidebar-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="org-sidebar-cta-wrap" ref={quickCreateRef}>
            <motion.button
              type="button"
              className="org-sidebar-cta-btn"
              onClick={() => setQuickCreateOpen(!quickCreateOpen)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              title="Create New Content"
              aria-haspopup="menu"
              aria-expanded={quickCreateOpen}
            >
              <motion.span
                animate={{ rotate: quickCreateOpen ? 45 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center justify-center flex-shrink-0"
              >
                <Plus size={16} weight="bold" />
              </motion.span>
              <AnimatePresence initial={false}>
                {!effectiveCollapsed && (
                  <motion.span
                    key="cta-text"
                    initial={{ opacity: 0, x: -8, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -8, width: 0 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden whitespace-nowrap font-semibold"
                  >
                    Create New
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence initial={false}>
                {!effectiveCollapsed && (
                  <motion.span
                    key="cta-caret"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    className="ml-auto flex items-center justify-center"
                  >
                    <CaretDown size={12} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <AnimatePresence>
              {quickCreateOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="org-quick-create-menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setQuickCreateOpen(false);
                      if (!pinnedExpanded) setIsHovered(false);
                      navigate('/organizer/events');
                    }}
                    className="org-quick-create-item"
                  >
                    <CalendarPlus size={16} className="text-[#991B1B]" />
                    <div className="text-left">
                      <span className="font-semibold block text-xs">New Event</span>
                      <span className="text-[10px] text-gray-500 block">Draft or publish campus event</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuickCreateOpen(false);
                      if (!pinnedExpanded) setIsHovered(false);
                      navigate('/organizer/posts');
                    }}
                    className="org-quick-create-item"
                  >
                    <Megaphone size={16} className="text-[#0D9488]" />
                    <div className="text-left">
                      <span className="font-semibold block text-xs">New Announcement</span>
                      <span className="text-[10px] text-gray-500 block">Broadcast update to students</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setQuickCreateOpen(false);
                      if (!pinnedExpanded) setIsHovered(false);
                      navigate('/organizer/recruitment');
                    }}
                    className="org-quick-create-item"
                  >
                    <UserPlus size={16} className="text-[#2563EB]" />
                    <div className="text-left">
                      <span className="font-semibold block text-xs">Recruitment Drive</span>
                      <span className="text-[10px] text-gray-500 block">Open committee roles</span>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Community Identity Card */}
          <div className="org-sidebar-community" title={communityName}>
            <motion.span
              className="org-sidebar-community-icon"
              style={{
                background: `${community?.color || '#991B1B'}1A`,
                color: community?.color || '#991B1B',
              }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {community?.icon || communityInitials}
            </motion.span>
            <AnimatePresence initial={false}>
              {!effectiveCollapsed && (
                <motion.div
                  key="community-info"
                  initial={{ opacity: 0, x: -8, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: -8, width: 0 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="org-sidebar-community-info overflow-hidden"
                >
                  <span className="org-sidebar-community-name">
                    {communityName}
                    {community?.isVerified && (
                      <ShieldCheck
                        size={14}
                        weight="fill"
                        className="org-verified-icon"
                        title="Verified Campus Community"
                      />
                    )}
                  </span>
                  <span className="org-sidebar-community-meta">
                    Lead Organiser · {community?.coreTeam?.length || 0} members
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation items */}
          <nav className="org-sidebar-nav" aria-label="Organiser navigation">
            {ORGANIZER_NAV_GROUPS.map((group) => (
              <div className="org-sidebar-group" key={group.label}>
                <AnimatePresence initial={false}>
                  {!effectiveCollapsed && (
                    <motion.span
                      key={`group-label-${group.label}`}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="org-sidebar-group-label"
                    >
                      {group.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`org-sidebar-link ${isActive ? 'org-sidebar-link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      title={effectiveCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined}
                      onClick={() => {
                        if (!pinnedExpanded) setIsHovered(false);
                      }}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="org-sidebar-active-pill"
                          className="org-sidebar-active-pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10 flex-shrink-0 flex items-center justify-center">
                        <Icon size={18} weight={isActive ? 'fill' : 'regular'} />
                      </span>
                      <AnimatePresence initial={false}>
                        {!effectiveCollapsed && (
                          <motion.span
                            key={`nav-label-${item.label}`}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className="relative z-10 flex-1 truncate whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge and/or count chip */}
                      <AnimatePresence initial={false}>
                        {!effectiveCollapsed && item.badge && (
                          <motion.span
                            key={`nav-badge-${item.label}`}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15 }}
                            className="org-sidebar-badge-chip relative z-10"
                          >
                            {item.badge}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <AnimatePresence initial={false}>
                        {!effectiveCollapsed && item.count !== undefined && (
                          <motion.span
                            key={`nav-count-${item.label}`}
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.7 }}
                            transition={{ duration: 0.15 }}
                            className="org-sidebar-count-chip relative z-10"
                          >
                            {item.count}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="org-sidebar-footer">
            <NavLink
              to="/discover"
              className="org-sidebar-footer-link"
              title="Switch to Student View"
              onClick={() => {
                if (!pinnedExpanded) setIsHovered(false);
              }}
            >
              <ArrowSquareOut size={16} className="flex-shrink-0" />
              <AnimatePresence initial={false}>
                {!effectiveCollapsed && (
                  <motion.span
                    key="footer-student"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap"
                  >
                    Student View
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>

            <button
              type="button"
              className="org-sidebar-footer-link org-sidebar-footer-link--danger"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <SignOut size={16} className="flex-shrink-0" />
              <AnimatePresence initial={false}>
                {!effectiveCollapsed && (
                  <motion.span
                    key="footer-signout"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="org-sidebar-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Main Layout Column ── */}
      <div className="org-main">
        {/* Top Navbar */}
        <header className={`org-topbar ${scrolled ? 'org-topbar--elevated' : ''}`}>
          {/* Mobile drawer toggle button */}
          <button
            type="button"
            className="org-topbar-menu-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <List size={20} />
          </button>

          {/* Breadcrumb Trail */}
          <div className="org-topbar-crumb">
            <span className="org-topbar-crumb-root">Organiser</span>
            {activeGroup && (
              <>
                <CaretRight size={11} className="text-gray-400" />
                <span className="org-topbar-crumb-group">{activeGroup.label}</span>
              </>
            )}
            <CaretRight size={11} className="text-gray-400" />
            <span className="org-topbar-crumb-current">
              {activeItem?.label || 'Dashboard'}
            </span>
          </div>

          {/* Topbar Search Bar with Live Command Palette Results */}
          <div className="org-topbar-search relative" ref={searchContainerRef}>
            <MagnifyingGlass size={15} className="org-topbar-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search events, roster, posts…"
              aria-label="Search events, roster, posts"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              className="org-topbar-search-input"
            />
            <span className="org-topbar-search-kbd">⌘K</span>

            {/* Live Search Results Dropdown */}
            <AnimatePresence>
              {searchOpen && searchQuery.trim() && (() => {
                const q = searchQuery.toLowerCase().trim();
                const matchEv = ORGANIZER_EVENTS.filter(
                  (e) => e.title.toLowerCase().includes(q) || e.venue.toLowerCase().includes(q)
                ).slice(0, 3);
                const matchRos = ROSTER_MEMBERS.filter(
                  (m) => m.name.toLowerCase().includes(q) || m.label.toLowerCase().includes(q)
                ).slice(0, 3);
                const matchPost = ORGANIZER_POSTS.filter(
                  (p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
                ).slice(0, 3);
                const total = matchEv.length + matchRos.length + matchPost.length;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="org-search-results-dropdown"
                  >
                    {total === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500 font-mono">
                        No matches found for "{searchQuery}"
                      </div>
                    ) : (
                      <div className="py-2 text-left space-y-2">
                        {matchEv.length > 0 && (
                          <div>
                            <div className="px-3 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Events ({matchEv.length})
                            </div>
                            {matchEv.map((ev) => (
                              <Link
                                key={ev.id}
                                to={`/organizer/events/${ev.id}`}
                                onClick={() => setSearchQuery('')}
                                className="org-search-result-item"
                              >
                                <Sparkle size={14} className="text-[#991B1B]" />
                                <div className="flex-1 truncate">
                                  <span className="font-semibold text-xs text-[#0F172A] block truncate">{ev.title}</span>
                                  <span className="text-[10px] text-gray-500 block truncate">{ev.venue} · {ev.dateFormatted}</span>
                                </div>
                                <CaretRight size={12} className="text-gray-400" />
                              </Link>
                            ))}
                          </div>
                        )}

                        {matchRos.length > 0 && (
                          <div>
                            <div className="px-3 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Committee Roster ({matchRos.length})
                            </div>
                            {matchRos.map((m) => (
                              <Link
                                key={m.id}
                                to="/organizer/roster"
                                onClick={() => setSearchQuery('')}
                                className="org-search-result-item"
                              >
                                <User size={14} className="text-[#0D9488]" />
                                <div className="flex-1 truncate">
                                  <span className="font-semibold text-xs text-[#0F172A] block truncate">{m.name}</span>
                                  <span className="text-[10px] text-gray-500 block truncate">{m.label} · {m.branch}</span>
                                </div>
                                <CaretRight size={12} className="text-gray-400" />
                              </Link>
                            ))}
                          </div>
                        )}

                        {matchPost.length > 0 && (
                          <div>
                            <div className="px-3 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Announcements ({matchPost.length})
                            </div>
                            {matchPost.map((p) => (
                              <Link
                                key={p.id}
                                to="/organizer/posts"
                                onClick={() => setSearchQuery('')}
                                className="org-search-result-item"
                              >
                                <Megaphone size={14} className="text-[#2563EB]" />
                                <div className="flex-1 truncate">
                                  <span className="font-semibold text-xs text-[#0F172A] block truncate">{p.title}</span>
                                  <span className="text-[10px] text-gray-500 block truncate">{p.body}</span>
                                </div>
                                <CaretRight size={12} className="text-gray-400" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* Right Controls */}
          <div className="org-topbar-right">
            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={handleToggleNotifOpen}
                className={`org-bell-btn ${notifOpen ? 'org-bell-btn--active' : ''}`}
                aria-label={`Organizer Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                aria-haspopup="menu"
                aria-expanded={notifOpen}
              >
                <Bell size={19} weight={unreadCount > 0 ? 'fill' : 'regular'} />
                {unreadCount > 0 && (
                  <span className="org-bell-badge" aria-live="polite">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Panel Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="org-notification-panel"
                  >
                    {/* Header */}
                    <div className="org-notif-header">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-['Space_Grotesk'] text-[#0F172A]">
                          Organiser Alerts
                        </span>
                        {unreadCount > 0 && (
                          <span className="org-notif-count-chip">{unreadCount} new</span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="org-notif-mark-all-btn"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="org-notif-filters">
                      <button
                        type="button"
                        onClick={() => setNotifFilter('all')}
                        className={`org-notif-filter-tab ${
                          notifFilter === 'all' ? 'org-notif-filter-tab--active' : ''
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifFilter('unread')}
                        className={`org-notif-filter-tab ${
                          notifFilter === 'unread' ? 'org-notif-filter-tab--active' : ''
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>

                    {/* Notification List */}
                    <div className="org-notif-list">
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => {
                          const cat = ORGANIZER_CATEGORY_MAP[notif.category] || ORGANIZER_CATEGORY_MAP.system;
                          const CatIcon = cat.icon;

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleNotifItemClick(notif)}
                              className={`org-notif-item ${
                                notif.unread ? 'org-notif-item--unread' : ''
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div
                                className="org-notif-icon-box"
                                style={{ color: cat.color, backgroundColor: cat.bg }}
                              >
                                <CatIcon size={16} weight="bold" />
                              </div>

                              <div className="org-notif-content">
                                <div className="org-notif-item-title">
                                  <span>{notif.title}</span>
                                  {notif.unread && <span className="org-notif-unread-dot" />}
                                </div>
                                <p className="org-notif-item-desc">{notif.desc}</p>
                                <div className="org-notif-item-meta">
                                  <span className="org-notif-time">{notif.time}</span>
                                  <div className="org-notif-actions">
                                    {notif.unread && (
                                      <button
                                        type="button"
                                        onClick={(e) => handleMarkRead(notif.id, e)}
                                        className="org-notif-action-btn"
                                        title="Mark as read"
                                      >
                                        <CheckCircle size={14} weight="bold" />
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={(e) => handleDismiss(notif.id, e)}
                                      className="org-notif-action-btn org-notif-action-btn--delete"
                                      title="Dismiss notification"
                                    >
                                      <Trash size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="org-notif-empty">
                          <Bell size={24} className="opacity-40 mb-1" />
                          <p className="text-xs text-gray-500 font-medium">
                            {notifLoading
                              ? 'Loading notifications…'
                              : notifFilter === 'unread'
                              ? 'No unread notifications.'
                              : "You're all caught up. No notifications yet."}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Organizer Profile Dropdown Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className={`org-profile-trigger ${profileOpen ? 'org-profile-trigger--active' : ''}`}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Organizer Account Menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div
                  className="org-profile-avatar"
                  style={{
                    backgroundColor: `${community?.color || '#991B1B'}1E`,
                    color: community?.color || '#991B1B',
                  }}
                >
                  {community?.icon || communityInitials}
                </div>
                <div className="org-profile-details">
                  <span className="org-profile-name">{communityName}</span>
                  <span className="org-profile-role">Lead Organiser</span>
                </div>
                <CaretDown size={12} className="org-profile-caret" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="org-profile-menu"
                  >
                    <div className="org-profile-menu-header">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#0F172A]">
                          {communityName}
                        </span>
                        {community?.isVerified && (
                          <ShieldCheck size={14} weight="fill" className="text-[#1A3A2A]" />
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wide">
                        {community?.isVerified ? 'Verified Organiser Access' : 'Pending Verification'}
                      </span>
                    </div>

                    <div className="org-profile-menu-divider" />

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/organizer/settings');
                        }}
                        className="org-profile-menu-item"
                      >
                        <GearSix size={16} />
                        <span>Portal Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/discover');
                        }}
                        className="org-profile-menu-item"
                      >
                        <ArrowSquareOut size={16} />
                        <span>Switch to Student View</span>
                      </button>
                    </div>

                    <div className="org-profile-menu-divider" />

                    <div className="p-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="org-profile-menu-item org-profile-menu-item--danger"
                      >
                        <SignOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="org-content">
          <Outlet />
        </main>

        {/* Organizer Portal Footer */}
        <OrganizerFooter />
      </div>
    </div>
  );
}
