import React from "react";
import "../static/StaticPages.css";
import "./LegalPage.css";

const SECTIONS = [
  {
    id: "collection",
    title: "1. Information We Collect",
    content: (
      <>
        <p>When you create a CampusCircle account or use our services, we collect information you provide directly:</p>
        <ul>
          <li><strong>Account Information:</strong> Your name, email address, college name, branch, and year of study.</li>
          <li><strong>Profile Information:</strong> Bio, skills, profile photo, social media handles, and communities you join.</li>
          <li><strong>Content:</strong> Events you create, communities you post in, and messages you send.</li>
          <li><strong>Usage Data:</strong> Pages you visit, features you use, and how you interact with the platform.</li>
        </ul>
        <p>We do <strong>not</strong> collect sensitive personal information such as financial data, Aadhaar numbers, or government IDs.</p>
      </>
    ),
  },
  {
    id: "use",
    title: "2. How We Use Your Information",
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve CampusCircle services</li>
          <li>Personalise your feed, event recommendations, and buddy suggestions</li>
          <li>Send you important notifications about events and communities you follow</li>
          <li>Respond to your support requests and feedback</li>
          <li>Detect, investigate, and prevent fraudulent or harmful activity</li>
          <li>Comply with legal obligations</li>
        </ul>
        <p>We will <strong>never</strong> sell your personal data to third parties for advertising purposes.</p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "3. Information Sharing",
    content: (
      <>
        <p>We share your information only in the following limited circumstances:</p>
        <ul>
          <li><strong>With Other Users:</strong> Your public profile (name, branch, year, skills, bio) is visible to other students on the platform.</li>
          <li><strong>With Service Providers:</strong> We use trusted third-party services for hosting, email delivery, and analytics. These providers are contractually bound to protect your data.</li>
          <li><strong>For Legal Compliance:</strong> If required by law, court order, or government authority, we may disclose your information.</li>
          <li><strong>Business Transfers:</strong> If CampusCircle merges with or is acquired by another company, your data may be transferred as part of that transaction.</li>
        </ul>
      </>
    ),
  },
  {
    id: "security",
    title: "4. Data Security",
    content: (
      <>
        <p>We take the security of your data seriously. Our measures include:</p>
        <ul>
          <li>All data is encrypted in transit using TLS 1.3</li>
          <li>Passwords are hashed using bcrypt with unique salts</li>
          <li>Regular security audits and penetration testing</li>
          <li>Role-based access controls for our internal team</li>
        </ul>
        <p>While we do our best to protect your information, no method of transmission over the internet is 100% secure. We encourage you to use a strong, unique password.</p>
      </>
    ),
  },
  {
    id: "rights",
    title: "5. Your Rights",
    content: (
      <>
        <p>You have the following rights regarding your personal data:</p>
        <ul>
          <li><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
          <li><strong>Correction:</strong> Update or correct inaccurate information via your Profile settings.</li>
          <li><strong>Deletion:</strong> Request permanent deletion of your account and associated data.</li>
          <li><strong>Portability:</strong> Export your data in a machine-readable format.</li>
          <li><strong>Objection:</strong> Opt out of certain data processing activities.</li>
        </ul>
        <p>To exercise any of these rights, contact us at <strong>privacy@campuscircle.in</strong>.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "6. Cookies & Tracking",
    content: (
      <>
        <p>We use cookies and similar technologies to:</p>
        <ul>
          <li>Keep you logged in between sessions</li>
          <li>Remember your preferences (e.g., dark mode, notification settings)</li>
          <li>Understand how users navigate the platform (analytics)</li>
        </ul>
        <p>You can control cookie settings through your browser. Disabling cookies may affect certain features of the platform.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "7. Changes to This Policy",
    content: (
      <p>
        We may update this Privacy Policy from time to time. When we make significant changes, we'll notify you via email or an in-app notification at least 7 days before the changes take effect. Continued use of CampusCircle after that date constitutes acceptance of the updated policy.
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <div className="sp-page">
      <section className="sp-hero legal-hero">
        <div className="sp-hero__eyebrow">
          <i className="fa-solid fa-shield-halved" /> Privacy Policy
        </div>
        <h1 className="sp-hero__title">
          Your privacy,<br /><mark>our promise</mark>
        </h1>
        <p className="sp-hero__subtitle">
          We believe transparency builds trust. Here's exactly what data we collect, why, and how we protect it.
        </p>
      </section>

      <div className="sp-container--narrow">
        <div className="sp-updated">
          <i className="fa-solid fa-calendar" />
          Last updated: July 1, 2025 · Effective immediately
        </div>

        {/* TOC */}
        <div className="sp-toc">
          <p className="sp-toc__title">Table of Contents</p>
          <ul className="sp-toc__list">
            {SECTIONS.map(({ id, title }) => (
              <li key={id}><a href={`#${id}`}>{title}</a></li>
            ))}
          </ul>
        </div>

        {/* Sections */}
        <div className="legal-sections">
          {SECTIONS.map(({ id, title, content }) => (
            <div key={id} id={id} className="sp-card legal-section-card">
              <h2 className="legal-section-title">{title}</h2>
              <div className="sp-prose">{content}</div>
            </div>
          ))}
        </div>

        <div className="legal-contact-note">
          <i className="fa-solid fa-envelope" />
          <span>Questions about this policy? Email us at <strong>privacy@campuscircle.in</strong></span>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;
