/**
 * AdminLayout.jsx — Admin Console shell.
 * Same collapsible sidebar / glass topbar / notification / profile-menu
 * shell as the Organiser Portal (shared via styles/portal-shell.css), with
 * Admin-appropriate content: a five-item nav instead of nine, a single
 * "New Community" quick action instead of a multi-item create menu, and
 * platform-wide (not community-scoped) notifications.
 */
import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  List,
  X,
  SignOut,
  ShieldCheck,
  CaretRight,
  CaretDown,
  ArrowSquareOut,
  Bell,
  Plus,
  MagnifyingGlass,
  CheckCircle,
  Circle,
  Trash,
  SidebarSimple,
  GearSix,
} from '@phosphor-icons/react';
import {
  ADMIN_NAV_GROUPS,
  ADMIN_CATEGORY_MAP,
} from './adminNavConfig';
import { useAdminAuth } from '@/shared/auth/useAdminAuth';
import { CampusCircleMark } from '@/shared/components/CampusCircleLogo';
import '@/layouts/portal/portal-shell.css';

function getInitials(name = '') {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0]?.slice(0, 2).toUpperCase() || 'AD';
}

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('cc_admin_sidebar_collapsed') === 'true');
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth > 960);
  const effectiveCollapsed = collapsed && isDesktop;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 961px)');
    const handleChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('cc_admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
        setDrawerOpen(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleCollapse();
      }
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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const activeGroup = ADMIN_NAV_GROUPS.find((g) => g.items.some((item) => location.pathname.startsWith(item.path)));
  const activeItem = ADMIN_NAV_GROUPS.flatMap((g) => g.items).find((item) => location.pathname.startsWith(item.path));

  const unreadCount = notifications.filter((n) => n.unread).length;
  const filteredNotifications = notifications.filter((n) => (notifFilter === 'unread' ? n.unread : true));

  const handleToggleRead = (id, e) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n)));
  };
  const handleDismiss = (id, e) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };
  const handleMarkAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));

  const handleSignOut = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const adminName = admin?.name || 'Admin Office';
  const adminInitials = getInitials(adminName);

  return (
    <div className={`org-shell ${effectiveCollapsed ? 'org-shell--collapsed' : ''}`}>
      <aside className={`org-sidebar ${effectiveCollapsed ? 'org-sidebar--collapsed' : ''} ${drawerOpen ? 'org-sidebar--open' : ''}`}>
        <div className="org-sidebar-brand">
          <button type="button" className="org-sidebar-brand-link" onClick={() => navigate('/admin/dashboard')} title="CampusCircle Admin Console">
            <div className="org-sidebar-brand-icon" style={{ background: 'transparent' }}>
              <CampusCircleMark size={24} />
            </div>
            {!effectiveCollapsed && (
              <div className="org-sidebar-brand-text">
                <span className="org-sidebar-brand-title">
                  Campus<span className="text-[#059669]">Circle</span>
                </span>
                <span className="org-sidebar-brand-tag">Admin Console</span>
              </div>
            )}
          </button>

          <button type="button" className="org-sidebar-collapse-btn" onClick={handleToggleCollapse} aria-label={effectiveCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'} title={effectiveCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}>
            <SidebarSimple size={16} />
          </button>

          <button type="button" className="org-sidebar-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* Single quick action — Admin only ever creates one kind of thing */}
        <div className="org-sidebar-cta-wrap">
          <button type="button" className="org-sidebar-cta-btn" onClick={() => navigate('/admin/communities?new=1')} title="Create New Community">
            <Plus size={16} weight="bold" />
            {!effectiveCollapsed && <span>New Community</span>}
          </button>
        </div>

        <div className="org-sidebar-community" title={adminName}>
          <span className="org-sidebar-community-icon" style={{ background: 'rgba(15, 23, 42, 0.08)', color: '#0F172A' }}>
            {adminInitials}
          </span>
          {!effectiveCollapsed && (
            <div className="org-sidebar-community-info">
              <span className="org-sidebar-community-name">
                {adminName}
                <ShieldCheck size={14} weight="fill" className="org-verified-icon" title="Platform Admin" />
              </span>
              <span className="org-sidebar-community-meta">Platform Owner · Compulsory Login</span>
            </div>
          )}
        </div>

        <nav className="org-sidebar-nav" aria-label="Admin navigation">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div className="org-sidebar-group" key={group.label}>
              {!effectiveCollapsed && <span className="org-sidebar-group-label">{group.label}</span>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`org-sidebar-link ${isActive ? 'org-sidebar-link--active' : ''}`}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <motion.span layoutId="admin-sidebar-active-pill" className="org-sidebar-active-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <Icon size={18} weight={isActive ? 'fill' : 'regular'} className="relative z-10" />
                    {!effectiveCollapsed && <span className="relative z-10 flex-1">{item.label}</span>}
                    {!effectiveCollapsed && item.badge && <span className="org-sidebar-badge-chip relative z-10">{item.badge}</span>}
                    {!effectiveCollapsed && item.count !== undefined && <span className="org-sidebar-count-chip relative z-10">{item.count}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="org-sidebar-footer">
          <NavLink to="/discover" className="org-sidebar-footer-link" title="Switch to Student View">
            <ArrowSquareOut size={16} />
            {!effectiveCollapsed && <span>Student View</span>}
          </NavLink>
          <button type="button" className="org-sidebar-footer-link org-sidebar-footer-link--danger" onClick={handleSignOut} title="Sign Out">
            <SignOut size={16} />
            {!effectiveCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {drawerOpen && <div className="org-sidebar-backdrop" onClick={() => setDrawerOpen(false)} aria-hidden="true" />}

      <div className="org-main">
        <header className={`org-topbar ${scrolled ? 'org-topbar--elevated' : ''}`}>
          <button type="button" className="org-topbar-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu">
            <List size={20} />
          </button>

          <div className="org-topbar-crumb">
            <span className="org-topbar-crumb-root">Admin</span>
            {activeGroup && (
              <>
                <CaretRight size={11} className="text-gray-400" />
                <span className="org-topbar-crumb-group">{activeGroup.label}</span>
              </>
            )}
            <CaretRight size={11} className="text-gray-400" />
            <span className="org-topbar-crumb-current">{activeItem?.label || 'Dashboard'}</span>
          </div>

          <div className="org-topbar-search">
            <MagnifyingGlass size={15} className="org-topbar-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search communities, students…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="org-topbar-search-input"
            />
            <span className="org-topbar-search-kbd">⌘K</span>
          </div>

          <div className="org-topbar-right">
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className={`org-bell-btn ${notifOpen ? 'org-bell-btn--active' : ''}`}
                aria-label={`Admin Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                aria-haspopup="menu"
                aria-expanded={notifOpen}
              >
                <Bell size={19} weight={unreadCount > 0 ? 'fill' : 'regular'} />
                {unreadCount > 0 && <span className="org-bell-badge" aria-live="polite">{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="org-notification-panel"
                  >
                    <div className="org-notif-header">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-['Space_Grotesk'] text-[#0F172A]">Platform Alerts</span>
                        {unreadCount > 0 && <span className="org-notif-count-chip">{unreadCount} new</span>}
                      </div>
                      {unreadCount > 0 && (
                        <button type="button" onClick={handleMarkAllRead} className="org-notif-mark-all-btn">Mark all read</button>
                      )}
                    </div>

                    <div className="org-notif-filters">
                      <button type="button" onClick={() => setNotifFilter('all')} className={`org-notif-filter-tab ${notifFilter === 'all' ? 'org-notif-filter-tab--active' : ''}`}>
                        All ({notifications.length})
                      </button>
                      <button type="button" onClick={() => setNotifFilter('unread')} className={`org-notif-filter-tab ${notifFilter === 'unread' ? 'org-notif-filter-tab--active' : ''}`}>
                        Unread ({unreadCount})
                      </button>
                    </div>

                    <div className="org-notif-list">
                      {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => {
                          const cat = ADMIN_CATEGORY_MAP[notif.category] || ADMIN_CATEGORY_MAP.system;
                          const CatIcon = cat.icon;
                          return (
                            <div key={notif.id} className={`org-notif-item ${notif.unread ? 'org-notif-item--unread' : ''}`}>
                              <div className="org-notif-icon-box" style={{ color: cat.color, backgroundColor: cat.bg }}>
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
                                    <button type="button" onClick={(e) => handleToggleRead(notif.id, e)} className="org-notif-action-btn" title={notif.unread ? 'Mark as read' : 'Mark as unread'}>
                                      {notif.unread ? <CheckCircle size={14} weight="bold" /> : <Circle size={14} />}
                                    </button>
                                    <button type="button" onClick={(e) => handleDismiss(notif.id, e)} className="org-notif-action-btn org-notif-action-btn--delete" title="Dismiss notification">
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
                            {notifFilter === 'unread' ? 'No unread notifications.' : "You're all caught up. No notifications yet."}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className={`org-profile-trigger ${profileOpen ? 'org-profile-trigger--active' : ''}`}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Admin Account Menu"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <div className="org-profile-avatar" style={{ backgroundColor: 'rgba(15, 23, 42, 0.1)', color: '#0F172A' }}>
                  {adminInitials}
                </div>
                <div className="org-profile-details">
                  <span className="org-profile-name">{adminName}</span>
                  <span className="org-profile-role">Platform Admin</span>
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
                        <span className="font-bold text-sm text-[#0F172A]">{adminName}</span>
                        <ShieldCheck size={14} weight="fill" className="text-[#0F172A]" />
                      </div>
                      <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wide">Compulsory Login · Zero Public View</span>
                    </div>

                    <div className="org-profile-menu-divider" />

                    <div className="p-1">
                      <button type="button" onClick={() => { setProfileOpen(false); navigate('/admin/settings'); }} className="org-profile-menu-item">
                        <GearSix size={16} />
                        <span>Console Settings</span>
                      </button>
                      <button type="button" onClick={() => { setProfileOpen(false); navigate('/discover'); }} className="org-profile-menu-item">
                        <ArrowSquareOut size={16} />
                        <span>Switch to Student View</span>
                      </button>
                    </div>

                    <div className="org-profile-menu-divider" />

                    <div className="p-1">
                      <button type="button" onClick={handleSignOut} className="org-profile-menu-item org-profile-menu-item--danger">
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

        <main className="org-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
