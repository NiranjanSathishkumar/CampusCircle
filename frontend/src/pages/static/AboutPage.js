import React from "react";
import { Link } from "react-router-dom";
import "../static/StaticPages.css";
import "./AboutPage.css";

const STATS = [
  { val: "12,000+", lbl: "Students Connected" },
  { val: "180+", lbl: "Campus Events" },
  { val: "60+", lbl: "Active Communities" },
  { val: "98%", lbl: "Satisfaction Rate" },
];

const VALUES = [
  {
    icon: "fa-solid fa-handshake",
    title: "Community First",
    desc: "Every feature we build starts with one question: does this bring students closer together?",
    color: "#5B4FE9",
    bg: "rgba(91,79,233,0.1)",
  },
  {
    icon: "fa-solid fa-bolt",
    title: "Move Fast",
    desc: "Campus life moves at full speed. We ship improvements every week to keep up with you.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    icon: "fa-solid fa-shield-halved",
    title: "Privacy by Design",
    desc: "Your data is yours. We never sell it, never share it without consent, and always encrypt it.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
  },
  {
    icon: "fa-solid fa-universal-access",
    title: "Built for Everyone",
    desc: "Whether you're a freshman or a PhD student, CampusCircle works seamlessly for you.",
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
  },
];

const TEAM = [
  { name: "Niranjan Sathishkumar", role: "Co-founder & CEO", gradient: "linear-gradient(135deg,#667eea,#764ba2)" },
  { name: "Adarsh Thorat", role: "Co-founder & CTO", gradient: "linear-gradient(135deg,#f093fb,#f5576c)" },
  { name: "Atharv Naikdhure", role: "Head of Product", gradient: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  { name: "Patish Kumar Nadar", role: "Lead Designer", gradient: "linear-gradient(135deg,#43e97b,#38f9d7)" },
  { name: "Vikram Menon", role: "Head of Engineering", gradient: "linear-gradient(135deg,#fa709a,#fee140)" },
  { name: "Sneha Krishnan", role: "Community Lead", gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)" },
];

function AboutPage() {
  return (
    <div className="sp-page">
      {/* ── Hero ── */}
      <section className="sp-hero about-hero">
        <div className="sp-hero__eyebrow">
          <i className="fa-solid fa-circle-info" /> Our Story
        </div>
        <h1 className="sp-hero__title">
          Built by students,<br /><mark>for students</mark>
        </h1>
        <p className="sp-hero__subtitle">
          CampusCircle was born in a college dorm room with a single mission — make it impossible to feel alone on campus.
        </p>
      </section>

      {/* ── Stats strip ── */}
      <div className="about-stats-strip">
        {STATS.map(({ val, lbl }) => (
          <div key={lbl} className="about-stat">
            <span className="about-stat-val">{val}</span>
            <span className="about-stat-lbl">{lbl}</span>
          </div>
        ))}
      </div>

      {/* ── Mission ── */}
      <div className="sp-container">
        <div className="about-mission-grid">
          <div className="about-mission-text">
            <h2 className="about-section-heading">Our Mission</h2>
            <p>
              College is the most formative years of your life — but it can also feel overwhelming. Finding your crowd, knowing what's happening, discovering clubs that match your passions... it shouldn't take months of wandering hallways.
            </p>
            <p>
              We built CampusCircle to compress all of that into a single, beautiful platform. One place to discover events, join communities, connect with peers who share your interests, and showcase who you are.
            </p>
            <Link to="/signup" className="about-cta-btn">
              <i className="fa-solid fa-rocket" /> Join CampusCircle Free
            </Link>
          </div>
          <div className="about-mission-illustration">
            <div className="about-illo-card about-illo-card--1">
              <i className="fa-solid fa-calendar-days" />
              <span>80+ Events this month</span>
            </div>
            <div className="about-illo-card about-illo-card--2">
              <i className="fa-solid fa-users" />
              <span>12,000 students online</span>
            </div>
            <div className="about-illo-card about-illo-card--3">
              <i className="fa-solid fa-star" />
              <span>Top Rated Campus App</span>
            </div>
          </div>
        </div>

        {/* ── Values ── */}
        <div className="about-section-heading-wrap">
          <h2 className="about-section-heading">What We Stand For</h2>
          <p className="about-section-sub">Our values aren't just words on a wall — they drive every product decision we make.</p>
        </div>
        <div className="about-values-grid">
          {VALUES.map(({ icon, title, desc, color, bg }) => (
            <div key={title} className="about-value-card">
              <div className="about-value-icon" style={{ background: bg, color }}>
                <i className={icon} />
              </div>
              <h3 className="about-value-title">{title}</h3>
              <p className="about-value-desc">{desc}</p>
            </div>
          ))}
        </div>

        {/* ── Team ── */}
        <div className="about-section-heading-wrap" style={{ marginTop: 60 }}>
          <h2 className="about-section-heading">Meet the Team</h2>
          <p className="about-section-sub">Former students who refused to accept a disconnected campus experience.</p>
        </div>
        <div className="about-team-grid">
          {TEAM.map(({ name, role, gradient }) => (
            <div key={name} className="about-team-card">
              <div className="about-team-avatar" style={{ background: gradient }}>
                <i className="fa-solid fa-user" />
              </div>
              <h4 className="about-team-name">{name}</h4>
              <span className="about-team-role">{role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
