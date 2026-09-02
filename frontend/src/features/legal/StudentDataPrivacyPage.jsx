import { Fingerprint } from '@phosphor-icons/react';
import LegalPageLayout from './LegalPageLayout';

const SECTIONS = [
  {
    id: 'overview',
    title: 'Overview',
    blocks: [
      {
        type: 'p',
        text: 'This policy explains what student data CampusCircle collects, why it is collected, who can see it, and the rights every SIES GST student has over their own information. It applies to all data generated through account registration, event participation, and community activity on the platform.',
      },
    ],
  },
  {
    id: 'data-collected',
    title: 'Information We Collect',
    blocks: [
      {
        type: 'list',
        items: [
          { strong: 'Profile data:', text: 'name, institutional email, department, year, and profile photo provided at signup or edited in Profile settings.' },
          { strong: 'Activity data:', text: 'event RSVPs, community memberships, Buddy connections, likes, comments, and saved posts.' },
          { strong: 'Attendance data:', text: 'Digital QR Pass scans recorded when checking in to events, used to verify closed-campus attendance.' },
          { strong: 'Communication data:', text: 'newsletter subscription status and in-app notification preferences.' },
          { strong: 'Technical data:', text: 'device type, browser, and session information collected automatically for security and performance monitoring.' },
        ],
      },
    ],
  },
  {
    id: 'how-we-use',
    title: 'How We Use Student Data',
    blocks: [
      {
        type: 'list',
        items: [
          { strong: 'Operate core features,', text: 'such as showing your RSVPs in My Events, matching Buddy requests, and personalising your Discover feed.' },
          { strong: 'Verify closed-campus eligibility', text: 'through institutional email domain checks and QR Pass validation at event entry.' },
          { strong: 'Communicate updates,', text: 'including the weekly Campus Digest (opt-in) and essential account or policy notifications (non-optional).' },
          { strong: 'Maintain platform safety,', text: 'reviewing reported content in line with the Code of Conduct.' },
          { strong: 'Improve the platform,', text: 'using aggregated, de-identified usage patterns to guide product decisions.' },
        ],
      },
    ],
  },
  {
    id: 'sharing',
    title: 'Data Sharing',
    blocks: [
      {
        type: 'p',
        text: 'Student data is never sold, rented, or shared with third-party advertisers. Limited sharing occurs only in the following circumstances:',
      },
      {
        type: 'list',
        items: [
          { strong: 'Event organisers', text: 'see the names and QR check-in status of students who RSVP to their specific event, for attendance and coordination purposes only.' },
          { strong: 'Departments and councils', text: 'may receive aggregated participation statistics for events they run, without access to individual browsing activity.' },
          { strong: 'SIES GST administration', text: 'may be provided data where required for institutional record-keeping, disciplinary review under the Code of Conduct, or legal compliance.' },
          { strong: 'Service providers', text: 'that host infrastructure (such as email delivery for verification) process data strictly under confidentiality obligations.' },
        ],
      },
    ],
  },
  {
    id: 'retention',
    title: 'Data Retention',
    blocks: [
      {
        type: 'p',
        text: 'Account and activity data is retained for the duration of a student’s enrollment. Following graduation or withdrawal, accounts are deactivated per the Closed Campus Policy and associated personal data is archived for a limited compliance window before deletion, except where a student has exercised their right to erasure sooner.',
      },
    ],
  },
  {
    id: 'rights',
    title: 'Your Rights',
    blocks: [
      {
        type: 'p',
        text: 'Every student may, at any time, request the following through Profile settings or the Help & Grievance Desk:',
      },
      {
        type: 'list',
        items: [
          { strong: 'Access:', text: 'a copy of the personal data held about you.' },
          { strong: 'Correction:', text: 'updates to inaccurate profile or account information.' },
          { strong: 'Deletion:', text: 'removal of your account and associated personal data, subject to institutional record-keeping requirements.' },
          { strong: 'Portability:', text: 'an export of your event history and community memberships before account closure.' },
        ],
      },
    ],
  },
  {
    id: 'security',
    title: 'Security Measures',
    blocks: [
      {
        type: 'p',
        text: 'Student data is protected through encrypted transmission, access-controlled databases, and domain-restricted authentication. See the Security & Domain Lock policy for full technical detail on how account and platform security is maintained.',
      },
    ],
  },
  {
    id: 'contact',
    title: 'Contact',
    blocks: [
      {
        type: 'p',
        text: 'Questions about how your data is handled can be directed to the Help & Grievance Desk, which coordinates with SIES GST IT Services and Student Affairs on all privacy-related requests.',
      },
    ],
  },
];

export default function StudentDataPrivacyPage() {
  return (
    <LegalPageLayout
      icon={Fingerprint}
      eyebrow="SIES GST Closed-Campus Ecosystem"
      title="Student Data Privacy"
      description="What personal data CampusCircle collects from SIES GST students, how it is used and shared, and the rights every student has over their information."
      effectiveDate="July 1, 2025"
      lastUpdated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
