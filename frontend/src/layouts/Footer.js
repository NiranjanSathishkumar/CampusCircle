import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css";

const FOOTER_NAV = [
  {
    heading: "Explore",
    links: [
      { label: "Discover",    path: "/discover" },
      { label: "Events",      path: "/events" },
      { label: "Communities", path: "/communities" },
      { label: "Buddies",     path: "/buddies" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "My Profile",  path: "/profile" },
      { label: "My Events",   path: "/myevents" },
      { label: "Sign Up",     path: "/signup" },
      { label: "Login",       path: "/login" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us",       path: "/about" },
      { label: "Contact",        path: "/contact" },
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms of Use",   path: "/terms" },
    ],
  },
];

const SOCIALS = [
  { icon: "fa-brands fa-instagram", label: "Instagram", href: "https://instagram.com" },
  { icon: "fa-brands fa-linkedin",  label: "LinkedIn",  href: "https://linkedin.com" },
  { icon: "fa-brands fa-x-twitter", label: "X",         href: "https://x.com" },
  { icon: "fa-brands fa-github",    label: "GitHub",    href: "https://github.com" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cc-footer">
      {/* Top wave divider */}
      <div className="cc-footer__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="cc-footer__inner">
        {/* ── Brand column ── */}
        <div className="cc-footer__brand-col">
          <div className="cc-footer__logo">
            <div className="cc-footer__logo-icon">
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <span className="cc-footer__logo-text">
              Campus<span>Circle</span>
            </span>
          </div>
          <p className="cc-footer__tagline">
            Your campus, connected. Discover events, join communities, and find your people.
          </p>

          {/* Social icons */}
          <div className="cc-footer__socials">
            {SOCIALS.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="cc-footer__social-btn"
              >
                <i className={icon} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Nav columns ── */}
        <div className="cc-footer__nav-grid">
          {FOOTER_NAV.map(({ heading, links }) => (
            <div key={heading} className="cc-footer__nav-col">
              <h4 className="cc-footer__nav-heading">{heading}</h4>
              <ul className="cc-footer__nav-list">
                {links.map(({ label, path }) => (
                  <li key={label}>
                    <NavLink to={path} className="cc-footer__nav-link">
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="cc-footer__bottom">
        <span>© {year} CampusCircle. All rights reserved.</span>
        <span className="cc-footer__bottom-made">
          Made with <i className="fa-solid fa-heart" /> for students
        </span>
      </div>
    </footer>
  );
}

export default Footer;
