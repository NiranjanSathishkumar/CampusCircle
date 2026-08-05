import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  /* State for Hero Interactive Mockup Tab */
  const [heroTab, setHeroTab] = useState("events"); // 'events' | 'feed' | 'buddies'

  /* State for Category Filter in Taster Section */
  const [selectedCategory, setSelectedCategory] = useState("All");

  const sampleEvents = [
    {
      id: "ev1",
      title: "Campus Hackathon 2025",
      category: "Tech",
      date: "Mar 15, 2025",
      time: "09:00 AM",
      location: "Main Auditorium",
      seatsLeft: 18,
      totalSeats: 150,
      gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
      icon: "fa-laptop-code",
      speaker: "Sponsored by Google Cloud",
    },
    {
      id: "ev2",
      title: "AI & Generative Models Workshop",
      category: "Tech",
      date: "Mar 20, 2025",
      time: "02:00 PM",
      location: "CS Lab 3",
      seatsLeft: 6,
      totalSeats: 40,
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
      icon: "fa-brain",
      speaker: "Dr. A. Sharma (AI Lab Lead)",
    },
    {
      id: "ev3",
      title: "Spring Cultural & Live Concert Fest",
      category: "Culture",
      date: "Apr 02, 2025",
      time: "06:00 PM",
      location: "Open Air Theatre",
      seatsLeft: 120,
      totalSeats: 500,
      gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
      icon: "fa-music",
      speaker: "Featuring Campus Band & Guests",
    },
    {
      id: "ev4",
      title: "Startup Pitch & Incubator Summit",
      category: "Business",
      date: "Apr 10, 2025",
      time: "10:30 AM",
      location: "Incubation Hub",
      seatsLeft: 25,
      totalSeats: 100,
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      icon: "fa-rocket",
      speaker: "Alumni Angel Investors",
    },
  ];

  const testimonials = [
    {
      quote: "CampusCircle helped our Turing Club grow from 20 to 1,200+ active members in one semester!",
      author: "Aditya Menon",
      role: "Lead Developer · 3rd Year CSE",
      avatar: "AM",
      color: "#6366f1",
    },
    {
      quote: "Finding study buddies for Machine Learning exam prep took me less than 2 minutes. Game changer!",
      author: "Priya Krishnan",
      role: "AI Research Lead · 2nd Year Data Science",
      avatar: "PK",
      color: "#0ea5e9",
    },
    {
      quote: "Managing tickets and live seat counts for our annual college fest became completely effortless.",
      author: "Rahul Sharma",
      role: "Cultural Committee Head · 4th Year Mech",
      avatar: "RS",
      color: "#ec4899",
    },
  ];

  const filteredEvents = selectedCategory === "All" 
    ? sampleEvents 
    : sampleEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="land-page">

      {/* ── 1. DARK HERO SECTION WITH NEON MESH GLOW ─────────────── */}
      <section className="land-hero">
        <div className="land-hero-glow land-hero-glow--purple" />
        <div className="land-hero-glow land-hero-glow--cyan" />
        <div className="land-hero-glow land-hero-glow--pink" />

        <div className="land-hero-container">
          <div className="land-hero-content">
            <div className="land-hero-badge">
              <span className="land-hero-badge-pulse" />
              <i className="fa-solid fa-sparkles" />
              <span>Next-Gen Campus Experience Platform</span>
            </div>

            <h1 className="land-hero-title">
              Connect. Collaborate. <br />
              <span className="land-gradient-text">Thrive on Campus.</span>
            </h1>

            <p className="land-hero-subtitle">
              The all-in-one ecosystem for university students. Discover live events, join vibrant 
              student clubs, find study partners, and showcase your achievements.
            </p>

            <div className="land-hero-actions">
              <Link to="/signup" className="land-btn land-btn--primary">
                <span>Join CampusCircle Free</span>
                <i className="fa-solid fa-arrow-right" />
              </Link>
              <Link to="/discover" className="land-btn land-btn--ghost">
                <i className="fa-solid fa-compass" />
                <span>Explore Campus Feed</span>
              </Link>
            </div>

            <div className="land-hero-social-proof">
              <div className="land-avatar-stack">
                <div className="land-avatar" style={{ background: "#6366f1" }}>NS</div>
                <div className="land-avatar" style={{ background: "#0ea5e9" }}>AM</div>
                <div className="land-avatar" style={{ background: "#ec4899" }}>PK</div>
                <div className="land-avatar" style={{ background: "#10b981" }}>RS</div>
              </div>
              <div className="land-proof-info">
                <div className="land-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <i key={s} className="fa-solid fa-star" />
                  ))}
                  <span>5.0</span>
                </div>
                <p>Trusted by <strong>2,400+ students</strong> & <strong>120+ clubs</strong></p>
              </div>
            </div>
          </div>

          {/* ── Interactive Hero UI Simulator Card ── */}
          <div className="land-hero-mockup">
            <div className="land-mockup-window">
              {/* Window Header */}
              <div className="land-mockup-bar">
                <div className="land-mockup-dots">
                  <span className="land-mdot land-mdot--close" />
                  <span className="land-mdot land-mdot--min" />
                  <span className="land-mdot land-mdot--max" />
                </div>
                <div className="land-mockup-tabs">
                  <button
                    className={`land-mtab ${heroTab === "events" ? "land-mtab--active" : ""}`}
                    onClick={() => setHeroTab("events")}
                  >
                    <i className="fa-solid fa-ticket" /> Live Events
                  </button>
                  <button
                    className={`land-mtab ${heroTab === "feed" ? "land-mtab--active" : ""}`}
                    onClick={() => setHeroTab("feed")}
                  >
                    <i className="fa-solid fa-newspaper" /> Feed
                  </button>
                  <button
                    className={`land-mtab ${heroTab === "buddies" ? "land-mtab--active" : ""}`}
                    onClick={() => setHeroTab("buddies")}
                  >
                    <i className="fa-solid fa-handshake" /> Buddy Match
                  </button>
                </div>
              </div>

              {/* Window Content Body */}
              <div className="land-mockup-body">
                {heroTab === "events" && (
                  <div className="land-sim-events">
                    <div className="land-sim-ticket">
                      <div className="land-sim-ticket-accent" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} />
                      <div className="land-sim-ticket-body">
                        <div className="land-sim-tag">Featured Hackathon</div>
                        <h4>Campus AI Hackathon 2025</h4>
                        <p><i className="fa-regular fa-calendar" /> Mar 15 · Main Auditorium</p>
                        <div className="land-sim-progress">
                          <div className="land-sim-bar" style={{ width: "88%" }} />
                        </div>
                        <div className="land-sim-footer">
                          <span>18 seats remaining</span>
                          <button className="land-sim-btn" onClick={() => navigate("/events/ev1")}>Register Now</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {heroTab === "feed" && (
                  <div className="land-sim-feed">
                    <div className="land-sim-post">
                      <div className="land-sim-post-head">
                        <div className="land-sim-user-avatar">TC</div>
                        <div>
                          <h5>Turing Club</h5>
                          <span>2 hours ago · Announcement</span>
                        </div>
                      </div>
                      <p className="land-sim-post-text">
                        🚀 Annual Code Sprint registration is officially live! Grab your spot before seats fill up.
                      </p>
                      <div className="land-sim-post-tags">
                        <span>#Coding</span> <span>#Hackathon</span> <span>#CampusCircle</span>
                      </div>
                    </div>
                  </div>
                )}

                {heroTab === "buddies" && (
                  <div className="land-sim-buddies">
                    <div className="land-sim-match-card">
                      <div className="land-sim-match-avatar" style={{ background: "#0ea5e9" }}>AM</div>
                      <div className="land-sim-match-info">
                        <h4>Aditya Menon</h4>
                        <p>3rd Year CSE · Data Structures & ML</p>
                        <span className="land-sim-match-badge">⚡ 96% Match Compatibility</span>
                      </div>
                      <button className="land-sim-match-btn" onClick={() => navigate("/buddies")}>Connect</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. METRICS & IMPACT BAR ──────────────────────────────── */}
      <section className="land-stats-bar-wrap">
        <div className="land-stats-bar">
          <div className="land-stat-card">
            <span className="land-stat-num">2,400+</span>
            <span className="land-stat-label">Active Students</span>
          </div>
          <div className="land-stat-divider" />
          <div className="land-stat-card">
            <span className="land-stat-num">120+</span>
            <span className="land-stat-label">Student Societies</span>
          </div>
          <div className="land-stat-divider" />
          <div className="land-stat-card">
            <span className="land-stat-num">350+</span>
            <span className="land-stat-label">Monthly Events</span>
          </div>
          <div className="land-stat-divider" />
          <div className="land-stat-card">
            <span className="land-stat-num">98%</span>
            <span className="land-stat-label">Campus Coverage</span>
          </div>
        </div>
      </section>

      {/* ── 3. BENTO GRID FEATURE SHOWCASE ───────────────────────── */}
      <section className="land-section">
        <div className="land-section-header">
          <span className="land-pill-tag"><i className="fa-solid fa-shapes" /> Core Platform Pillars</span>
          <h2 className="land-section-title">Designed for Everything Campus</h2>
          <p className="land-section-subtitle">
            Whether you want to lead a tech club, find an exam study partner, or register for college fests, 
            CampusCircle has you covered.
          </p>
        </div>

        <div className="land-bento-grid">
          {/* Large Bento Card 1: Events */}
          <div className="land-bento-card land-bento-card--large land-bento-card--gradient1" onClick={() => navigate("/events")}>
            <div className="land-bento-content">
              <span className="land-bento-tag"><i className="fa-solid fa-ticket" /> Dedicated Event Hub</span>
              <h3>Discover & Register for College Fests & Workshops</h3>
              <p>Explore detailed event agendas, organiser contacts, interactive FAQs, and live ticket seat trackers.</p>
              <span className="land-bento-link">Browse All Events <i className="fa-solid fa-arrow-right" /></span>
            </div>
            <div className="land-bento-illustration">
              <div className="land-bento-ticket-preview">
                <i className="fa-solid fa-qrcode" />
                <span>Instant E-Ticket Pass</span>
              </div>
            </div>
          </div>

          {/* Large Bento Card 2: Communities */}
          <div className="land-bento-card land-bento-card--large land-bento-card--gradient2" onClick={() => navigate("/communities")}>
            <div className="land-bento-content">
              <span className="land-bento-tag"><i className="fa-solid fa-users" /> Student Clubs</span>
              <h3>Join Communities & Lead Projects</h3>
              <p>Connect with department clubs, tech societies, and cultural guilds with custom officer roles.</p>
              <span className="land-bento-link">Explore Societies <i className="fa-solid fa-arrow-right" /></span>
            </div>
            <div className="land-bento-illustration">
              <div className="land-bento-club-badges">
                <span className="land-cbadge" style={{ background: "#6366f1" }}><i className="fa-solid fa-code" /> Turing</span>
                <span className="land-cbadge" style={{ background: "#0ea5e9" }}><i className="fa-solid fa-microchip" /> AI Soc</span>
                <span className="land-cbadge" style={{ background: "#ec4899" }}><i className="fa-solid fa-palette" /> Arts</span>
              </div>
            </div>
          </div>

          {/* Small Bento Card 3: Discover Feed */}
          <div className="land-bento-card land-bento-card--small" onClick={() => navigate("/discover")}>
            <div className="land-bento-icon" style={{ background: "rgba(91, 79, 233, 0.1)", color: "#6366f1" }}>
              <i className="fa-solid fa-newspaper" />
            </div>
            <h3>Discover Feed</h3>
            <p>Real-time campus updates, announcements, and image posts with full-screen lightbox viewing.</p>
            <span className="land-bento-link">View Feed <i className="fa-solid fa-arrow-right" /></span>
          </div>

          {/* Small Bento Card 4: Study Buddies */}
          <div className="land-bento-card land-bento-card--small" onClick={() => navigate("/buddies")}>
            <div className="land-bento-icon" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
              <i className="fa-solid fa-user-group" />
            </div>
            <h3>Study Buddies</h3>
            <p>Smart peer matching based on course branch, study goals, and technical skill tags.</p>
            <span className="land-bento-link">Find Partner <i className="fa-solid fa-arrow-right" /></span>
          </div>
        </div>
      </section>

      {/* ── 4. INTERACTIVE TASTER CATEGORY FILTER ────────────────── */}
      <section className="land-section land-section--alt">
        <div className="land-section-header">
          <span className="land-pill-tag"><i className="fa-solid fa-bolt" /> Live Preview</span>
          <h2 className="land-section-title">Explore What's Happening Now</h2>
        </div>

        {/* Category Filters */}
        <div className="land-filter-bar">
          {["All", "Tech", "Culture", "Business"].map((cat) => (
            <button
              key={cat}
              className={`land-filter-btn ${selectedCategory === cat ? "land-filter-btn--active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="land-taster-grid">
          {filteredEvents.map((ev) => (
            <div key={ev.id} className="land-taster-card" onClick={() => navigate(`/events/${ev.id}`)}>
              <div className="land-taster-card-header" style={{ background: ev.gradient }}>
                <div className="land-taster-icon">
                  <i className={`fa-solid ${ev.icon}`} />
                </div>
                <span className="land-taster-cat">{ev.category}</span>
              </div>
              <div className="land-taster-body">
                <div className="land-taster-date"><i className="fa-regular fa-calendar" /> {ev.date} · {ev.time}</div>
                <h4 className="land-taster-title">{ev.title}</h4>
                <p className="land-taster-meta"><i className="fa-solid fa-location-dot" /> {ev.location}</p>
                <div className="land-taster-footer">
                  <span className="land-taster-seats">{ev.seatsLeft} Seats Left</span>
                  <span className="land-taster-arrow"><i className="fa-solid fa-arrow-right" /></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. HOW IT WORKS 3-STEP JOURNEY ──────────────────────── */}
      <section className="land-section">
        <div className="land-section-header">
          <span className="land-pill-tag"><i className="fa-solid fa-route" /> Simple 3-Step Journey</span>
          <h2 className="land-section-title">How CampusCircle Works</h2>
        </div>

        <div className="land-steps-grid">
          <div className="land-step-card">
            <div className="land-step-num">01</div>
            <h3>Create Student Profile</h3>
            <p>Sign up with your university email, select your branch and graduation year, and list your top skills.</p>
          </div>
          <div className="land-step-card">
            <div className="land-step-num">02</div>
            <h3>Join Clubs & Connect</h3>
            <p>Browse 120+ active student clubs, match with study buddies, and follow official campus announcements.</p>
          </div>
          <div className="land-step-card">
            <div className="land-step-num">03</div>
            <h3>Register & Attend Events</h3>
            <p>Get instant e-tickets for hackathons and workshops, track event schedules, and build your digital certificate portfolio.</p>
          </div>
        </div>
      </section>

      {/* ── 6. STUDENT VOICES / TESTIMONIALS ─────────────────────── */}
      <section className="land-section land-section--alt">
        <div className="land-section-header">
          <span className="land-pill-tag"><i className="fa-solid fa-comment-dots" /> Student Feedback</span>
          <h2 className="land-section-title">Loved by Student Leaders</h2>
        </div>

        <div className="land-testimonials-grid">
          {testimonials.map((t, idx) => (
            <div key={idx} className="land-testimonial-card">
              <div className="land-quote-icon"><i className="fa-solid fa-quote-left" /></div>
              <p className="land-quote-text">"{t.quote}"</p>
              <div className="land-quote-user">
                <div className="land-quote-avatar" style={{ background: t.color }}>{t.avatar}</div>
                <div>
                  <h4 className="land-quote-author">{t.author}</h4>
                  <p className="land-quote-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. PREMIUM CTA BANNER ────────────────────────────────── */}
      <section className="land-cta-wrap">
        <div className="land-cta-box">
          <div className="land-cta-glow" />
          <div className="land-cta-inner">
            <h2>Ready to Elevate Your College Experience?</h2>
            <p>Join thousands of university students discovering events, connecting in clubs, and matching with study partners.</p>
            <div className="land-cta-btns">
              <Link to="/signup" className="land-btn land-btn--primary land-btn--lg">
                <span>Create Free Student Account</span>
                <i className="fa-solid fa-arrow-right" />
              </Link>
              <Link to="/login" className="land-btn land-btn--ghost land-btn--lg">
                <span>Sign In to Account</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
