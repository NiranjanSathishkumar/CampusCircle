import { Scales } from '@phosphor-icons/react';
import LegalPageLayout from './LegalPageLayout';

const SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    blocks: [
      {
        type: 'p',
        text: 'By creating an account or otherwise using CampusCircle, you agree to these Terms of Service, the Closed Campus Policy, the Code of Conduct, and the Student Data Privacy policy. If you do not agree, do not register for or use the platform.',
      },
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    blocks: [
      {
        type: 'p',
        text: 'CampusCircle is available only to individuals with a valid, active SIES Graduate School of Technology institutional identity, as defined in the Closed Campus Policy. Registering with an ineligible or falsified email address is a violation of these Terms and grounds for immediate account termination.',
      },
    ],
  },
  {
    id: 'accounts',
    title: 'Account Responsibilities',
    blocks: [
      {
        type: 'list',
        items: [
          { strong: 'Accuracy:', text: 'you agree to provide accurate profile information and keep it up to date.' },
          { strong: 'Credential security:', text: 'you are responsible for maintaining the confidentiality of your login credentials and Digital QR Pass, and for all activity under your account.' },
          { strong: 'One account per student:', text: 'creating duplicate or secondary accounts to circumvent moderation or access limits is not permitted.' },
          { strong: 'Prompt reporting:', text: 'notify the Help & Grievance Desk immediately if you suspect unauthorised access to your account.' },
        ],
      },
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    blocks: [
      {
        type: 'p',
        text: 'Use of CampusCircle is governed by the Code of Conduct. In addition, you agree not to:',
      },
      {
        type: 'list',
        items: [
          { text: 'Attempt to bypass, disable, or interfere with the domain verification or security systems described in the Security & Domain Lock policy.' },
          { text: 'Scrape, harvest, or export student data or event listings for purposes outside normal platform use.' },
          { text: 'Use the platform to promote unrelated commercial products, services, or external ventures without authorisation from Student Affairs.' },
          { text: 'Introduce malware, automated bots, or scripts that interact with the platform outside its intended interface.' },
        ],
      },
    ],
  },
  {
    id: 'user-content',
    title: 'User Content & Listings',
    blocks: [
      {
        type: 'p',
        text: 'You retain ownership of the profile content, posts, comments, and photos you submit ("User Content"). By posting, you grant CampusCircle a non-exclusive licence to display that content within the platform for the purpose of operating Discover feeds, event pages, and community sections.',
      },
      {
        type: 'p',
        text: 'Organisers publishing events or community posts are solely responsible for the accuracy of dates, venues, eligibility criteria, and any fees or registration requirements they list. CampusCircle does not independently verify event details submitted by student councils, chapters, or departments.',
      },
    ],
  },
  {
    id: 'termination',
    title: 'Suspension & Termination',
    blocks: [
      {
        type: 'p',
        text: 'Accounts may be suspended or terminated for violations of these Terms, the Code of Conduct, or the Closed Campus Policy, or automatically upon loss of institutional eligibility (such as graduation or withdrawal). Where reasonably possible, students are notified of enforcement action and may appeal per the Code of Conduct.',
      },
    ],
  },
  {
    id: 'liability',
    title: 'Disclaimers & Limitation of Liability',
    blocks: [
      {
        type: 'p',
        text: 'CampusCircle is provided as a student-facing coordination tool "as is," without warranty of uninterrupted availability. Event attendance, participation, and any arrangements made through Buddy connections or community interactions are undertaken at each student’s own discretion. SIES GST and the CampusCircle platform team are not liable for outcomes arising from third-party events, off-platform arrangements, or user-submitted content, except where required by applicable law.',
      },
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    blocks: [
      {
        type: 'p',
        text: 'These Terms are governed by the laws of India, and disputes are subject to the jurisdiction of courts in Navi Mumbai, Maharashtra, without prejudice to any institutional disciplinary process under SIES GST regulations.',
      },
    ],
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    blocks: [
      {
        type: 'p',
        text: 'These Terms may be updated to reflect changes in platform functionality or institutional policy. Material changes will be announced through the Campus Digest and in-app notification before taking effect. Continued use of CampusCircle after an update constitutes acceptance of the revised Terms.',
      },
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      icon={Scales}
      eyebrow="SIES GST Closed-Campus Ecosystem"
      title="Terms of Service"
      description="The rules governing use of CampusCircle by students, organisers, and councils of SIES Graduate School of Technology."
      effectiveDate="July 1, 2025"
      lastUpdated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
