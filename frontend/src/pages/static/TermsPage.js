import React from "react";
import "../static/StaticPages.css";
import "./LegalPage.css";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: (
      <p>
        By accessing or using CampusCircle (the "Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms constitute a legally binding agreement between you and CampusCircle Pvt. Ltd. ("we", "our", or "us").
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: (
      <>
        <p>To use CampusCircle, you must:</p>
        <ul>
          <li>Be at least 16 years of age</li>
          <li>Be currently enrolled at, or affiliated with, a recognised educational institution</li>
          <li>Provide accurate and complete registration information</li>
          <li>Not have previously had your account suspended or terminated</li>
        </ul>
        <p>By using the Service, you represent and warrant that you meet all of the above eligibility requirements.</p>
      </>
    ),
  },
  {
    id: "account",
    title: "3. Account Responsibilities",
    content: (
      <>
        <p>You are responsible for:</p>
        <ul>
          <li>Maintaining the confidentiality of your account password</li>
          <li>All activities that occur under your account</li>
          <li>Notifying us immediately of any unauthorised use of your account</li>
          <li>Ensuring your profile information remains accurate and up to date</li>
        </ul>
        <p>You may not share your account credentials with others or create accounts on behalf of third parties.</p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "4. Acceptable Use & Prohibited Conduct",
    content: (
      <>
        <p>You agree not to use CampusCircle to:</p>
        <ul>
          <li>Post content that is illegal, harassing, defamatory, or discriminatory</li>
          <li>Impersonate any person or entity, or falsely represent your affiliation</li>
          <li>Spam, phish, or distribute malware</li>
          <li>Scrape, crawl, or reverse-engineer any part of the platform</li>
          <li>Use the Service for commercial solicitation without written permission</li>
          <li>Interfere with or disrupt the integrity or performance of the Service</li>
        </ul>
        <p>Violations may result in immediate account suspension or termination without notice.</p>
      </>
    ),
  },
  {
    id: "content",
    title: "5. User-Generated Content",
    content: (
      <>
        <p>
          You retain ownership of content you post on CampusCircle. By posting content, you grant us a non-exclusive, royalty-free, worldwide licence to use, display, and distribute that content solely for the purpose of operating and improving the Service.
        </p>
        <p>
          You represent that you have all necessary rights to post any content you submit. We reserve the right to remove any content that violates these Terms or our community guidelines, without notice or liability.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "6. Intellectual Property",
    content: (
      <p>
        All trademarks, logos, and service marks displayed on CampusCircle are our registered or unregistered trademarks or those of third parties. Nothing in these Terms grants you any right to use our intellectual property without our prior written consent. The platform's design, code, and proprietary features are protected by copyright law.
      </p>
    ),
  },
  {
    id: "disclaimer",
    title: "7. Disclaimers & Limitation of Liability",
    content: (
      <>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be error-free, uninterrupted, or secure.
        </p>
        <p>
          To the maximum extent permitted by applicable law, CampusCircle shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of — or inability to use — the Service.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "8. Termination",
    content: (
      <p>
        We reserve the right to suspend or terminate your access to the Service at any time, for any reason, including violation of these Terms. You may also delete your account at any time via Profile → Settings → Delete Account. Upon termination, your right to use the Service ceases immediately.
      </p>
    ),
  },
  {
    id: "governing",
    title: "9. Governing Law",
    content: (
      <p>
        These Terms are governed by and construed in accordance with the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka, India.
      </p>
    ),
  },
  {
    id: "contact",
    title: "10. Contact",
    content: (
      <p>
        For questions about these Terms, please contact us at <strong>legal@campuscircle.in</strong> or write to CampusCircle Pvt. Ltd., 100 Koramangala 4th Block, Bengaluru — 560034, India.
      </p>
    ),
  },
];

function TermsPage() {
  return (
    <div className="sp-page">
      <section className="sp-hero legal-hero">
        <div className="sp-hero__eyebrow">
          <i className="fa-solid fa-file-contract" /> Terms of Use
        </div>
        <h1 className="sp-hero__title">
          The rules that keep<br /><mark>everyone safe</mark>
        </h1>
        <p className="sp-hero__subtitle">
          Please read these Terms carefully. By using CampusCircle, you agree to be bound by them.
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
          <span>Legal questions? Email us at <strong>legal@campuscircle.in</strong></span>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;
