import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  List,
  X,
  CheckCircle,
  Trash,
  SignOut,
  CaretRight,
  Check,
  BellSimpleSlash,
  Compass,
  CalendarDots,
  UsersThree,
  UsersFour,
  CalendarStar,
  User,
  CaretDown,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/useAuth';
import { mediaUrl } from '@/shared/utils/media';
import { CampusCircleMark } from '@/shared/components/CampusCircleLogo';
import { useNotifications } from '@/features/notifications/useNotifications';
import { CATEGORY_MAP } from './navbarConfig';
import './navbar.css';

export default function Navbar({
  user: userProp,
  isLoggedIn: isLoggedInProp,
  onLogout: onLogoutProp,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  // Access global auth context or props fallback
  const auth = useAuth();
  const user = userProp !== undefined ? userProp : auth.user;
  const isLoggedIn = isLoggedInProp !== undefined ? isLoggedInProp : auth.isLoggedIn;
  const triggerLogout = onLogoutProp || auth.logout;
  // user.profilePicture is { filename, cloudinaryUrl, cloudinaryId } from the
  // backend, not a plain URL string — resolve it before handing it to <img>.
  const profilePictureUrl = mediaUrl(user?.profilePicture);

  // Navbar states
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); // 'all' | 'unread'
  const [avatarError, setAvatarError] = useState(false);
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    ensureListLoaded,
    markRead,
    markAllRead,
    dismiss,
  } = useNotifications();

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const currentRoute = location.pathname;

  /* ─────────────────────────────────────────────────────────────
     2. SCROLL DETECTION (window.scrollY > 8)
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ─────────────────────────────────────────────────────────────
     3. CLICK OUTSIDE & ESC KEY HANDLERS (Notification & Profile Panel)
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };

    if (notifOpen || mobileOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifOpen, mobileOpen, profileOpen]);

  /* ─────────────────────────────────────────────────────────────
     4. BODY SCROLL LOCKING & WINDOW RESIZE (Mobile Drawer)
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
        document.body.style.overflow = '';
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileOpen]);

  /* ─────────────────────────────────────────────────────────────
     5. NOTIFICATION COMPUTATIONS & ACTIONS
     ───────────────────────────────────────────────────────────── */
  const totalCount = notifications.length;

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

  /* ─────────────────────────────────────────────────────────────
     6. USER LOGOUT & PROFILE ROUTE RESOLUTION
     ───────────────────────────────────────────────────────────── */
  const userProfilePath = user?.id
    ? `/profile/${user.id}`
    : user?._id
    ? `/profile/${user._id}`
    : '/profile';

  const handleLogoutClick = () => {
    triggerLogout();
    setNotifOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/discover');
  };

  const getUserInitials = (name) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const isLinkActive = (path) => {
    if (path === '/discover' && currentRoute === '/discover') return true;
    if (path === '/' && currentRoute === '/') return true;
    if (path === '/discover') return false; // don't match root
    return currentRoute.startsWith(path);
  };

  const handleNavClick = (routePath) => {
    setMobileOpen(false);
    setNotifOpen(false);
    const target = routePath.startsWith('/') ? routePath : `/${routePath.replace('#', '')}`;
    navigate(target);
  };

  return (
    <header className={`cc-navbar ${scrolled ? 'cc-navbar--elevated' : ''}`} role="banner">
      <div className="cc-navbar-inner">
        {/* BRAND & LOGO */}
        <a
          href="#discover"
          onClick={() => handleNavClick('discover')}
          className="cc-brand-link"
          aria-label="CampusCircle — Home"
        >
          <div className="cc-brand-logo-wrap" aria-hidden="true">
            <CampusCircleMark size={24} />
          </div>
          <span className="cc-brand-title">
            Campus<span className="text-[#059669]">Circle</span>
          </span>
          <span className="cc-brand-tag">SIES GST</span>
        </a>

        {/* PRIMARY DESKTOP NAVIGATION */}
        <nav className="cc-desktop-nav" aria-label="Primary Navigation">
          {[
            { label: 'Discover', path: '/discover', hash: 'discover', Icon: Compass },
            { label: 'Events', path: '/events', hash: 'events', Icon: CalendarDots },
            { label: 'Communities', path: '/communities', hash: 'communities', Icon: UsersThree },
            { label: 'Buddies', path: '/buddies', hash: 'buddies', Icon: UsersFour },
          ].map(({ label, path, hash, Icon }) => {
            const active = isLinkActive(path, `#${hash}`);
            return (
              <a
                key={path}
                href={`#${hash}`}
                onClick={() => handleNavClick(hash)}
                className={`cc-nav-link ${active ? 'cc-nav-link--active' : ''}`}
              >
                {active && (
                  <motion.span
                    layoutId="cc-nav-pill"
                    className="cc-nav-link-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="cc-nav-link-inner">
                  <Icon size={15} weight={active ? 'fill' : 'regular'} className="cc-nav-link-icon" />
                  {label}
                </span>
              </a>
            );
          })}

          {/* AUTHENTICATED LINKS */}
          {isLoggedIn && (() => {
            const active = isLinkActive('/myevents', '#myevents');
            return (
              <a
                href="#myevents"
                onClick={() => handleNavClick('myevents')}
                className={`cc-nav-link ${active ? 'cc-nav-link--active' : ''}`}
              >
                {active && (
                  <motion.span
                    layoutId="cc-nav-pill"
                    className="cc-nav-link-pill"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="cc-nav-link-inner">
                  <CalendarStar size={15} weight={active ? 'fill' : 'regular'} className="cc-nav-link-icon" />
                  <span className="cc-nav-indicator-dot" />
                  My Events
                </span>
              </a>
            );
          })()}
        </nav>

        {/* CONTROLS & AUTHENTICATION ACTIONS */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATION CENTER BELL (ALWAYS AVAILABLE OR LOGGED IN) */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={handleToggleNotifOpen}
              className={`cc-bell-btn ${notifOpen ? 'cc-bell-btn--active' : ''}`}
              aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              aria-expanded={notifOpen}
              aria-controls="cc-notification-dropdown"
            >
              <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} />
              {unreadCount > 0 && (
                <span className="cc-bell-badge" aria-live="polite">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* NOTIFICATION PANEL DROPDOWN */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  id="cc-notification-dropdown"
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="cc-notification-panel"
                  role="region"
                  aria-label="Notification center"
                >
                  {/* Panel Header */}
                  <div className="cc-notif-header">
                    <h2 className="cc-notif-title">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="cc-notif-count-chip">{unreadCount} new</span>
                      )}
                    </h2>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="cc-notif-mark-all-btn"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Panel Filter Tabs */}
                  <div className="cc-notif-filters" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={notifFilter === 'all'}
                      onClick={() => setNotifFilter('all')}
                      className={`cc-notif-filter-tab ${notifFilter === 'all' ? 'cc-notif-filter-tab--active' : ''}`}
                    >
                      All ({totalCount})
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={notifFilter === 'unread'}
                      onClick={() => setNotifFilter('unread')}
                      className={`cc-notif-filter-tab ${notifFilter === 'unread' ? 'cc-notif-filter-tab--active' : ''}`}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification Items List */}
                  <div className="cc-notif-list">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notif) => {
                        const CategoryConfig = CATEGORY_MAP[notif.category] || CATEGORY_MAP.system;
                        const CategoryIcon = CategoryConfig.icon;

                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotifItemClick(notif)}
                            className={`cc-notif-item ${notif.unread ? 'cc-notif-item--unread' : ''}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div
                              className="cc-notif-icon-box"
                              style={{
                                color: CategoryConfig.color,
                                backgroundColor: CategoryConfig.bg,
                              }}
                            >
                              <CategoryIcon size={18} weight="bold" />
                            </div>

                            <div className="cc-notif-content">
                              <div className="cc-notif-item-title">
                                <span>{notif.title}</span>
                                {notif.unread && <span className="cc-notif-unread-dot" />}
                              </div>
                              <p className="cc-notif-item-desc">{notif.desc}</p>

                              <div className="cc-notif-item-meta">
                                <span className="cc-notif-time">{notif.time}</span>
                                <div className="cc-notif-actions">
                                  {notif.unread && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleMarkRead(notif.id, e)}
                                      className="cc-notif-action-btn"
                                      title="Mark as read"
                                      aria-label="Mark as read"
                                    >
                                      <CheckCircle size={14} weight="bold" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => handleDismiss(notif.id, e)}
                                    className="cc-notif-action-btn cc-notif-action-btn--delete"
                                    title="Dismiss notification"
                                    aria-label="Dismiss notification"
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
                      /* Empty States */
                      <div className="cc-notif-empty" role="status">
                        <div className="cc-notif-empty-icon">
                          <BellSimpleSlash size={24} />
                        </div>
                        <h3 className="cc-notif-empty-title">
                          {notifLoading
                            ? 'Loading notifications…'
                            : notifFilter === 'unread'
                            ? 'No unread notifications at the moment.'
                            : 'All caught up!'}
                        </h3>
                        <p className="cc-notif-empty-desc">
                          {notifLoading
                            ? ''
                            : notifFilter === 'unread'
                            ? 'You have read all your campus updates and alerts.'
                            : 'You have zero notifications right now. Check back later!'}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* AUTHENTICATION CONTROLS */}
          {isLoggedIn ? (
            /* LOGGED IN USER STATE — Profile Dropdown */
            <div className="hidden sm:flex items-center" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className={`cc-user-shortcut ${profileOpen ? 'cc-user-shortcut--open' : ''}`}
                aria-label="Account menu"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {profilePictureUrl && !avatarError ? (
                  <img
                    src={profilePictureUrl}
                    alt={user.name || 'User Profile'}
                    onError={() => setAvatarError(true)}
                    className="cc-avatar"
                  />
                ) : (
                  <div className="cc-avatar">
                    {getUserInitials(user?.name)}
                  </div>
                )}
                <span className="cc-user-name">{user?.name || 'Student'}</span>
                <CaretDown
                  size={12}
                  weight="bold"
                  className={`cc-user-caret ${profileOpen ? 'cc-user-caret--open' : ''}`}
                />
              </button>

              {/* Profile dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="cc-profile-dropdown"
                    role="menu"
                  >
                    {/* Identity Header */}
                    <div className="cc-profile-dd-identity">
                      {profilePictureUrl && !avatarError ? (
                        <img src={profilePictureUrl} alt={user.name} onError={() => setAvatarError(true)} className="cc-profile-dd-avatar" />
                      ) : (
                        <div className="cc-profile-dd-avatar">{getUserInitials(user?.name)}</div>
                      )}
                      <div className="cc-profile-dd-meta">
                        <span className="cc-profile-dd-name">{user?.name || 'Student'}</span>
                        <span className="cc-profile-dd-role">✦ Verified Student</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="cc-profile-dd-menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setProfileOpen(false); handleNavClick(userProfilePath); }}
                        className="cc-profile-dd-item"
                      >
                        <span className="cc-profile-dd-item-icon">
                          <User size={14} weight="duotone" />
                        </span>
                        View Profile
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => { setProfileOpen(false); handleNavClick('myevents'); }}
                        className="cc-profile-dd-item"
                      >
                        <span className="cc-profile-dd-item-icon">
                          <CalendarStar size={14} weight="duotone" />
                        </span>
                        My Events
                      </button>

                      <div className="cc-profile-dd-divider" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleLogoutClick}
                        className="cc-profile-dd-item cc-profile-dd-item--danger"
                      >
                        <span className="cc-profile-dd-item-icon">
                          <SignOut size={14} weight="bold" />
                        </span>
                        Log Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* LOGGED OUT STATE */
            <div className="hidden sm:flex items-center gap-2">
              <a
                href="#login"
                onClick={() => handleNavClick('login')}
                className="cc-auth-login-link"
              >
                Login
              </a>
              <a
                href="#signup"
                onClick={() => handleNavClick('signup')}
                className="cc-auth-signup-link"
              >
                Sign Up
              </a>
            </div>
          )}

          {/* MOBILE HAMBURGER MENU TOGGLE */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="cc-mobile-toggle"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="cc-mobile-navigation-drawer"
          >
            {mobileOpen ? <X size={20} weight="bold" /> : <List size={20} weight="bold" />}
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-IN NAVIGATION DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="cc-drawer-backdrop"
              aria-hidden="true"
            />

            {/* Mobile Navigation Drawer Panel */}
            <motion.div
              id="cc-mobile-navigation-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="cc-mobile-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Drawer"
            >
              {/* Drawer Header */}
              <div className="cc-drawer-header">
                <div className="flex items-center gap-2">
                  <div className="cc-brand-logo-wrap" style={{ width: '1.85rem', height: '1.85rem' }}>
                    <CampusCircleMark size={22} />
                  </div>
                  <span className="cc-brand-title" style={{ fontSize: '1.05rem' }}>
                    Campus<span className="text-[#059669]">Circle</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="cc-drawer-close-btn"
                  aria-label="Close drawer menu"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* Logged-In User Identity Banner */}
              {isLoggedIn && (
                <div className="cc-drawer-user-card">
                  {profilePictureUrl && !avatarError ? (
                    <img
                      src={profilePictureUrl}
                      alt={user.name || 'User Avatar'}
                      onError={() => setAvatarError(true)}
                      className="cc-drawer-avatar-lg"
                    />
                  ) : (
                    <div className="cc-drawer-avatar-lg">
                      {getUserInitials(user?.name)}
                    </div>
                  )}

                  <div className="cc-drawer-user-info">
                    <h3 className="cc-drawer-user-name">{user?.name || 'Student User'}</h3>
                    <div className="cc-drawer-status-badge">
                      <Check size={10} weight="bold" /> Verified Student
                    </div>
                  </div>
                </div>
              )}

              {/* Drawer Content Body */}
              <div className="cc-drawer-body">
                {/* GROUP 1: EXPLORE CAMPUS */}
                <div>
                  <h4 className="cc-drawer-group-label">Explore Campus</h4>
                  <div className="cc-drawer-nav-list">
                    {[
                      { label: 'Discover', hash: 'discover', path: '/discover', Icon: Compass },
                      { label: 'Events', hash: 'events', path: '/events', Icon: CalendarDots },
                      { label: 'Communities', hash: 'communities', path: '/communities', Icon: UsersThree },
                      { label: 'Buddies', hash: 'buddies', path: '/buddies', Icon: UsersFour },
                    ].map(({ label, hash, path, Icon }) => {
                      const active = isLinkActive(path, `#${hash}`);
                      return (
                        <a
                          key={path}
                          href={`#${hash}`}
                          onClick={() => handleNavClick(hash)}
                          className={`cc-drawer-nav-link ${active ? 'cc-drawer-nav-link--active' : ''}`}
                        >
                          <span className="cc-drawer-nav-link-inner">
                            <span className={`cc-drawer-nav-icon-wrap ${active ? 'cc-drawer-nav-icon-wrap--active' : ''}`}>
                              <Icon size={16} weight={active ? 'fill' : 'regular'} />
                            </span>
                            {label}
                          </span>
                          <CaretRight size={13} className="cc-drawer-nav-caret" />
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* GROUP 2: PERSONAL SPACE (LOGGED IN) */}
                {isLoggedIn && (
                  <div>
                    <h4 className="cc-drawer-group-label">Personal Space</h4>
                    <div className="cc-drawer-nav-list">
                      {[
                        { label: 'My Events', hash: 'myevents', path: '/myevents', Icon: CalendarStar },
                        { label: 'My Profile', href: userProfilePath, path: '/profile', Icon: User },
                      ].map(({ label, hash, href, path, Icon }) => {
                        const active = isLinkActive(path);
                        const clickTarget = hash || href;
                        return (
                          <a
                            key={path}
                            href={hash ? `#${hash}` : href}
                            onClick={(e) => { if (href) e.preventDefault(); handleNavClick(clickTarget); }}
                            className={`cc-drawer-nav-link ${active ? 'cc-drawer-nav-link--active' : ''}`}
                          >
                            <span className="cc-drawer-nav-link-inner">
                              <span className={`cc-drawer-nav-icon-wrap ${active ? 'cc-drawer-nav-icon-wrap--active' : ''}`}>
                                <Icon size={16} weight={active ? 'fill' : 'regular'} />
                              </span>
                              {label}
                            </span>
                            <CaretRight size={13} className="cc-drawer-nav-caret" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="cc-drawer-footer">
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="btn-primary w-full py-2.5 text-xs font-semibold justify-center shadow-sm"
                    style={{ backgroundColor: '#991B1B', borderColor: '#991B1B' }}
                  >
                    <SignOut size={16} weight="bold" /> Log Out Session
                  </button>
                ) : (
                  <>
                    <a
                      href="#login"
                      onClick={() => handleNavClick('login')}
                      className="btn-secondary w-full text-center justify-center font-semibold py-2.5 text-xs"
                    >
                      Login
                    </a>
                    <a
                      href="#signup"
                      onClick={() => handleNavClick('signup')}
                      className="btn-primary w-full text-center justify-center font-semibold py-2.5 text-xs shadow-sm"
                    >
                      Student Signup
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
