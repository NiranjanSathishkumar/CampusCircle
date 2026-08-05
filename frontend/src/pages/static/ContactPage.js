import React, { useState } from "react";
import "../static/StaticPages.css";
import "./ContactPage.css";

const CHANNELS = [
  {
    icon: "fa-solid fa-envelope",
    title: "Email Us",
    detail: "support@campuscircle.in",
    sub: "We reply within 24 hours",
    color: "#5B4FE9",
    bg: "rgba(91,79,233,0.08)",
    href: "mailto:support@campuscircle.in",
  },
  {
    icon: "fa-brands fa-instagram",
    title: "Instagram",
    detail: "@campuscircle",
    sub: "DM us anytime",
    color: "#e1306c",
    bg: "rgba(225,48,108,0.08)",
    href: "https://instagram.com/campuscircle",
  },
  {
    icon: "fa-brands fa-linkedin",
    title: "LinkedIn",
    detail: "CampusCircle",
    sub: "Follow for updates",
    color: "#0a66c2",
    bg: "rgba(10,102,194,0.08)",
    href: "https://linkedin.com/company/campuscircle",
  },
];

const FAQS = [
  { q: "Is CampusCircle free to use?", a: "Yes — CampusCircle is completely free for students. We offer premium features for organizers and institutions." },
  { q: "How do I report a bug or issue?", a: "Use the contact form on this page or email support@campuscircle.in with a description and screenshot. Our team typically responds within 24 hours." },
  { q: "Can my college officially partner with CampusCircle?", a: "Absolutely. Reach out via the form below and select 'Institution Partnership' as your subject. Our team will be in touch within 2 business days." },
  { q: "How do I delete my account?", a: "Go to Profile → Settings → Delete Account. Your data will be permanently removed within 30 days per our privacy policy." },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="sp-page">
      {/* ── Hero ── */}
      <section className="sp-hero contact-hero">
        <div className="sp-hero__eyebrow">
          <i className="fa-solid fa-headset" /> Get in Touch
        </div>
        <h1 className="sp-hero__title">
          We'd love to <mark>hear from you</mark>
        </h1>
        <p className="sp-hero__subtitle">
          Questions, feedback, partnerships — our team is just a message away.
        </p>
      </section>

      <div className="sp-container">
        {/* ── Channels ── */}
        <div className="contact-channels">
          {CHANNELS.map(({ icon, title, detail, sub, color, bg, href }) => (
            <a key={title} href={href} target="_blank" rel="noreferrer" className="contact-channel-card">
              <div className="contact-channel-icon" style={{ background: bg, color }}>
                <i className={icon} />
              </div>
              <div>
                <p className="contact-channel-title">{title}</p>
                <p className="contact-channel-detail" style={{ color }}>{detail}</p>
                <span className="contact-channel-sub">{sub}</span>
              </div>
              <i className="fa-solid fa-arrow-up-right-from-square contact-channel-arrow" />
            </a>
          ))}
        </div>

        {/* ── Form + FAQ grid ── */}
        <div className="contact-grid">
          {/* Form */}
          <div className="sp-card contact-form-card">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-icon">
                  <i className="fa-solid fa-circle-check" />
                </div>
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button className="contact-submit-btn" onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <>
                <h3 className="sp-section-label">
                  <i className="fa-solid fa-paper-plane" />
                  Send a Message
                </h3>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="contact-field">
                      <label>Your Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Arjun Sharma"
                        value={form.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="contact-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="arjun@college.edu"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="contact-field">
                    <label>Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange} required>
                      <option value="">Select a topic…</option>
                      <option>General Question</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                      <option>Institution Partnership</option>
                      <option>Media / Press</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="contact-field">
                    <label>Message</label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Tell us what's on your mind…"
                      value={form.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button type="submit" className="contact-submit-btn">
                    <i className="fa-solid fa-paper-plane" /> Send Message
                  </button>
                </form>
              </>
            )}
          </div>

          {/* FAQ */}
          <div className="contact-faq-col">
            <h3 className="sp-section-label" style={{ marginBottom: 16 }}>
              <i className="fa-solid fa-circle-question" />
              Frequently Asked
            </h3>
            <div className="contact-faq-list">
              {FAQS.map(({ q, a }, i) => (
                <div
                  key={i}
                  className={`contact-faq-item ${openFaq === i ? "contact-faq-item--open" : ""}`}
                >
                  <button
                    className="contact-faq-q"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {q}
                    <i className={`fa-solid fa-chevron-${openFaq === i ? "up" : "down"}`} />
                  </button>
                  {openFaq === i && (
                    <p className="contact-faq-a">{a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
