import React, { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Discover",    path: "/discover",    icon: "fa-compass" },
  { label: "Events",      path: "/events",      icon: "fa-calendar-days" },
  { label: "Communities", path: "/communities", icon: "fa-users" },
  { label: "Buddies",     path: "/buddies",     icon: "fa-handshake" },
];

const LOGGED_IN_LINKS = [
  { label: "My Events", path: "/myevents", icon: "fa-calendar-check" },
];

function Navbar({ isLoggedIn, onLogin, onSignup, onLogout }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");

  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userProfileId = savedUser?.id || savedUser?._id;
  const profilePath = userProfileId ? `/profile/${userProfileId}` : '/profile';

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate("/discover");
  };

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      icon: "fa-calendar-days",
      color: "#5B4FE9",
      bg: "rgba(91, 79, 233, 0.12)",
      title: "Tech Expo 2025 starts tomorrow",
      desc: "Auditorium Hall A · 10:00 AM",
      time: "2h ago",
      unread: true,
    },
    {
      id: 2,
      icon: "fa-users",
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.12)",
      title: "You joined Dev Club",
      desc: "Welcome to the developer community!",
      time: "5h ago",
      unread: true,
    },
    {
      id: 3,
      icon: "fa-heart",
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.12)",
      title: "Someone liked your post",
      desc: '"AI Research Hackathon 2025 Project"',
      time: "1d ago",
      unread: true,
    },
    {
      id: 4,
      icon: "fa-trophy",
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.12)",
      title: "Certificate Issued",
      desc: "Verified badge added to your profile",
      time: "2d ago",
      unread: false,
    },
  ]);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleReadStatus = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const dismissNotif = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const displayedNotifs = notifications.filter((n) =>
    notifFilter === "unread" ? n.unread : true
  );

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close notif dropdown on outside click */
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  /* Lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className={`cc-navbar${scrolled ? " cc-navbar--scrolled" : ""}`}>
        <div className="cc-navbar__inner">

          {/* ── Brand ── */}
          <div className="cc-navbar__left">
            <NavLink to="/" className="cc-navbar__brand">
              <span className="cc-brand__icon-wrap">
                <i className="fa-solid fa-graduation-cap" />
              </span>
              <span className="cc-brand__text">
                Campus<em>Circle</em>
              </span>
            </NavLink>
          </div>

          {/* ── Center nav links (desktop) ── */}
          <nav className="cc-navbar__links" aria-label="Main navigation">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.path}
                to={l.path}
                className={({ isActive }) =>
                  `cc-nav-link${isActive ? " cc-nav-link--active" : ""}`
                }
              >
                <i className={`fa-solid ${l.icon}`} />
                <span>{l.label}</span>
              </NavLink>
            ))}
            {isLoggedIn && (
              <>
                <span className="cc-nav-divider" />
                {LOGGED_IN_LINKS.map((l) => (
                  <NavLink
                    key={l.path}
                    to={l.path}
                    className={({ isActive }) =>
                      `cc-nav-link${isActive ? " cc-nav-link--active" : ""}`
                    }
                  >
                    <i className={`fa-solid ${l.icon}`} />
                    <span>{l.label}</span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* ── Right: notif + auth + hamburger ── */}
          <div className="cc-navbar__right">

            {/* Notifications */}
            <div className="cc-notif-wrap" ref={notifRef}>
              <button
                className={`cc-nav-icon-btn cc-notif-btn${notifOpen ? " cc-notif-btn--active" : ""}`}
                onClick={() => setNotifOpen((p) => !p)}
                aria-label="Notifications"
              >
                <i className="fa-solid fa-bell" />
                {unreadCount > 0 && (
                  <span className="cc-notif-badge">{unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="cc-notif-dropdown">
                  <div className="cc-notif-arrow" />
                  
                  {/* Header */}
                  <div className="cc-notif-head">
                    <div className="cc-notif-head-left">
                      <span className="cc-notif-title">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="cc-notif-unread-tag">{unreadCount} new</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button className="cc-notif-mark-all" onClick={markAllRead}>
                        <i className="fa-solid fa-check-double" /> Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="cc-notif-tabs">
                    <button
                      className={`cc-notif-tab${notifFilter === "all" ? " cc-notif-tab--active" : ""}`}
                      onClick={() => setNotifFilter("all")}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      className={`cc-notif-tab${notifFilter === "unread" ? " cc-notif-tab--active" : ""}`}
                      onClick={() => setNotifFilter("unread")}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  {/* Notification List */}
                  <div className="cc-notif-list">
                    {displayedNotifs.length === 0 ? (
                      <div className="cc-notif-empty">
                        <div className="cc-notif-empty-icon">
                          <i className="fa-regular fa-bell-slash" />
                        </div>
                        <p className="cc-notif-empty-title">All caught up!</p>
                        <p className="cc-notif-empty-sub">
                          {notifFilter === "unread"
                            ? "No unread notifications at the moment."
                            : "You have no notifications yet."}
                        </p>
                      </div>
                    ) : (
                      displayedNotifs.map((n) => (
                        <div
                          key={n.id}
                          className={`cc-notif-item${n.unread ? " cc-notif-item--unread" : ""}`}
                          onClick={(e) => toggleReadStatus(n.id, e)}
                        >
                          <span
                            className="cc-notif-item-icon"
                            style={{ background: n.bg, color: n.color }}
                          >
                            <i className={`fa-solid ${n.icon}`} />
                          </span>

                          <div className="cc-notif-item-body">
                            <div className="cc-notif-item-head">
                              <p className="cc-notif-item-text">{n.title}</p>
                            </div>
                            <p className="cc-notif-item-desc">{n.desc}</p>
                            <span className="cc-notif-item-time">{n.time}</span>
                          </div>

                          <div className="cc-notif-item-actions">
                            <button
                              className="cc-notif-action-btn"
                              title={n.unread ? "Mark as read" : "Mark as unread"}
                              onClick={(e) => toggleReadStatus(n.id, e)}
                            >
                              <i className={`fa-solid ${n.unread ? "fa-circle-check" : "fa-circle-dot"}`} />
                            </button>
                            <button
                              className="cc-notif-action-btn cc-notif-action-btn--delete"
                              title="Dismiss"
                              onClick={(e) => dismissNotif(n.id, e)}
                            >
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>

                          {n.unread && <span className="cc-notif-dot" />}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="cc-notif-foot">
                    <button className="cc-notif-view-all" onClick={() => setNotifOpen(false)}>
                      View all notifications <i className="fa-solid fa-arrow-right" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auth buttons */}
            <div className="cc-auth-btns">
              {!isLoggedIn ? (
                <>
                  <Link to="/login" className="cc-btn cc-btn--ghost">Login</Link>
                  <Link to="/signup" className="cc-btn cc-btn--primary">Sign up</Link>
                </>
              ) : (
                <>
                  <NavLink to={profilePath} className={({ isActive }) => `cc-avatar${isActive ? " cc-avatar--active" : ""}`} title="My profile">
                    <i className="fa-solid fa-user" />
                  </NavLink>
                  <button className="cc-btn cc-btn--ghost cc-btn--logout" onClick={handleLogoutClick}>
                    <i className="fa-solid fa-right-from-bracket" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className={`cc-nav-icon-btn cc-mobile-menu-btn${mobileOpen ? " cc-mobile-menu-btn--open" : ""}`}
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileOpen}
            >
              <span className="cc-hamburger">
                <span /><span /><span />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {mobileOpen && <div className="cc-mobile-backdrop" onClick={closeMobile} />}
      <div className={`cc-mobile-drawer${mobileOpen ? " cc-mobile-drawer--open" : ""}`}>
        
        {/* Mobile Logged-in User Header */}
        {isLoggedIn && (
          <div className="cc-mobile-user-card">
            <NavLink to={profilePath} onClick={closeMobile} className="cc-mobile-user-info">
              <div className="cc-mobile-user-avatar">
                <i className="fa-solid fa-user" />
              </div>
              <div className="cc-mobile-user-details">
                <span className="cc-mobile-user-name">Alex Thompson</span>
                <span className="cc-mobile-user-role">
                  <i className="fa-solid fa-circle-check" /> Verified Student
                </span>
              </div>
            </NavLink>
            <NavLink to={profilePath} onClick={closeMobile} className="cc-mobile-profile-link" title="My Profile">
              <i className="fa-solid fa-chevron-right" />
            </NavLink>
          </div>
        )}

        {/* Navigation Categories */}
        <div className="cc-mobile-section-label">Explore Campus</div>

        {/* Mobile nav links */}
        <nav className="cc-mobile-nav">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `cc-mobile-nav-link${isActive ? " cc-mobile-nav-link--active" : ""}`
              }
            >
              <span className="cc-mobile-nav-icon">
                <i className={`fa-solid ${l.icon}`} />
              </span>
              <span>{l.label}</span>
              <i className="fa-solid fa-chevron-right cc-mobile-nav-arrow" />
            </NavLink>
          ))}

          {/* Extra logged-in links */}
          {isLoggedIn && (
            <>
              <div className="cc-mobile-section-label" style={{ marginTop: 12 }}>Personal Space</div>
              {LOGGED_IN_LINKS.map((l) => (
                <NavLink
                  key={l.path}
                  to={l.path}
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `cc-mobile-nav-link${isActive ? " cc-mobile-nav-link--active" : ""}`
                  }
                >
                  <span className="cc-mobile-nav-icon">
                    <i className={`fa-solid ${l.icon}`} />
                  </span>
                  <span>{l.label}</span>
                  <i className="fa-solid fa-chevron-right cc-mobile-nav-arrow" />
                </NavLink>
              ))}
              <NavLink
                to={profilePath}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `cc-mobile-nav-link${isActive ? " cc-mobile-nav-link--active" : ""}`
                }
              >
                <span className="cc-mobile-nav-icon">
                  <i className="fa-solid fa-id-card" />
                </span>
                <span>My Profile</span>
                <i className="fa-solid fa-chevron-right cc-mobile-nav-arrow" />
              </NavLink>
            </>
          )}
        </nav>

        {/* Mobile auth footer */}
        <div className="cc-mobile-auth">
          {!isLoggedIn ? (
            <div className="cc-mobile-auth-grid">
              <Link to="/login" className="cc-btn cc-btn--ghost cc-btn--full" onClick={closeMobile}>
                Login
              </Link>
              <Link to="/signup" className="cc-btn cc-btn--primary cc-btn--full" onClick={closeMobile}>
                Sign up
              </Link>
            </div>
          ) : (
            <button className="cc-btn cc-btn--ghost cc-btn--logout cc-btn--full" onClick={() => { handleLogoutClick(); closeMobile(); }}>
              <i className="fa-solid fa-right-from-bracket" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
