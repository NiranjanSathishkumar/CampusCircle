import { LockKey } from '@phosphor-icons/react';
import LegalPageLayout from './LegalPageLayout';

const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    blocks: [
      {
        type: 'p',
        text: 'CampusCircle enforces a domain lock — every account must be tied to a valid @siesgst.ac.in institutional email address. This page explains how that lock is enforced, what security measures protect the platform, and what students can do to keep their own accounts secure.',
      },
    ],
  },
  {
    id: 'domain-lock',
    title: 'Domain Lock Enforcement',
    blocks: [
      {
        type: 'list',
        items: [
          { strong: 'Signup filtering:', text: 'the registration form validates the email domain client- and server-side; addresses outside @siesgst.ac.in are rejected before an account is created.' },
          { strong: 'Verification link:', text: 'a one-time confirmation link is sent to the institutional inbox and must be used to activate the account, confirming the student controls that mailbox.' },
          { strong: 'Continuous checks:', text: 'if an institutional address is deactivated by SIES GST IT Services (e.g. after graduation), the linked CampusCircle account loses access at the next sign-in.' },
        ],
      },
      {
        type: 'note',
        text: 'The domain lock is the technical backbone of the Closed Campus Policy — it is what keeps event feeds, community directories, and Buddy connections restricted to real, current SIES GST students.',
      },
    ],
  },
  {
    id: 'authentication',
    title: 'Authentication & Session Security',
    blocks: [
      {
        type: 'list',
        items: [
          { strong: 'Password handling:', text: 'passwords are never stored in plain text; they are hashed before being persisted.' },
          { strong: 'Session expiry:', text: 'login sessions time out after a period of inactivity and can be manually ended from any device via Logout.' },
          { strong: 'Digital QR Pass:', text: 'each student’s QR credential is uniquely tied to their verified account and is used only for in-person event check-in — it is not a substitute login credential.' },
        ],
      },
    ],
  },
  {
    id: 'data-protection',
    title: 'Data Protection in Transit & at Rest',
    blocks: [
      {
        type: 'p',
        text: 'All traffic between a student’s device and CampusCircle is encrypted in transit. Stored student data — profiles, RSVPs, community activity — resides in access-controlled infrastructure, with administrative access limited to authorised platform and IT Services personnel on a need-to-know basis.',
      },
    ],
  },
  {
    id: 'monitoring',
    title: 'Platform Monitoring & Abuse Prevention',
    blocks: [
      {
        type: 'p',
        text: 'CampusCircle monitors for patterns consistent with account abuse — repeated failed logins, automated signup attempts, and irregular QR Pass scan activity — and may temporarily lock an account pending manual review when such patterns are detected.',
      },
    ],
  },
  {
    id: 'incident-reporting',
    title: 'Reporting a Security Incident',
    blocks: [
      {
        type: 'p',
        text: 'If you suspect a security issue — unauthorised access to your account, a phishing attempt impersonating CampusCircle, or a suspected vulnerability — report it immediately through the Help & Grievance Desk. Security-related reports are prioritised and escalated to SIES GST IT Services.',
      },
    ],
  },
  {
    id: 'best-practices',
    title: 'Account Security Best Practices',
    blocks: [
      {
        type: 'list',
        items: [
          { text: 'Never share your CampusCircle password or your Digital QR Pass with another student — the QR Pass is your personal proof of closed-campus verification.' },
          { text: 'Log out of shared or public devices, such as computer lab systems, after use.' },
          { text: 'Be cautious of messages asking you to "re-verify" your account outside the official CampusCircle domain — legitimate verification only happens through your @siesgst.ac.in inbox.' },
          { text: 'Keep your recovery details in Profile settings current in case you need to regain access to your account.' },
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Security Contact',
    blocks: [
      {
        type: 'p',
        text: 'For anything security-related that cannot wait for a routine support response, contact the Help & Grievance Desk and flag the request as security-related so it can be routed accordingly.',
      },
    ],
  },
];

export default function SecurityDomainLockPage() {
  return (
    <LegalPageLayout
      icon={LockKey}
      eyebrow="SIES GST Closed-Campus Ecosystem"
      title="Security & Domain Lock"
      description="How CampusCircle enforces the @siesgst.ac.in domain lock and protects student accounts, sessions, and data."
      effectiveDate="July 1, 2025"
      lastUpdated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
