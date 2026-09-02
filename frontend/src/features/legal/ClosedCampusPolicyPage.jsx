import { ShieldCheck } from '@phosphor-icons/react';
import LegalPageLayout from './LegalPageLayout';

const SECTIONS = [
  {
    id: 'purpose',
    title: 'Purpose & Scope',
    blocks: [
      {
        type: 'p',
        text: 'CampusCircle operates as a closed-campus digital ecosystem exclusively for the SIES Graduate School of Technology (SIES GST) community. This policy defines who may access the platform, how eligibility is verified, and what happens when access conditions are no longer met.',
      },
      {
        type: 'p',
        text: 'The closed-campus model exists to keep event feeds, community discussions, and student directories restricted to verified members of the institution — reducing spam, impersonation, and outside solicitation on a platform built for internal student life.',
      },
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility & Enrollment',
    blocks: [
      {
        type: 'p',
        text: 'Access to CampusCircle is restricted to individuals holding a valid, currently active SIES GST institutional identity. Eligible categories include:',
      },
      {
        type: 'list',
        items: [
          { strong: 'Enrolled students', text: 'across all UG and PG programs (CE, IT, EXTC, ECS, MECH, PPT, AIDS) with an active @siesgst.ac.in email address.' },
          { strong: 'Faculty and department coordinators', text: 'acting in an organiser or moderator capacity for departmental events and announcements.' },
          { strong: 'Recognised student councils and chapters', text: '(Student Council, IEEE, CSI, ACM, cultural bodies) granted organiser access for hosting events and posts.' },
        ],
      },
      {
        type: 'note',
        text: 'Prospective students, alumni, and external vendors do not receive standing platform access. Time-bound guest access may be granted for specific institutional events at the discretion of the Student Affairs office.',
      },
    ],
  },
  {
    id: 'verification',
    title: 'Identity Verification',
    blocks: [
      {
        type: 'p',
        text: 'Every account is verified against the official SIES GST email domain at signup. Registration requests using personal, third-party, or previously affiliated email addresses are automatically rejected.',
      },
      {
        type: 'list',
        items: [
          { strong: 'Domain check:', text: 'only addresses ending in @siesgst.ac.in are accepted at the signup form.' },
          { strong: 'Verification link:', text: 'a confirmation link is sent to the institutional inbox and must be activated within 48 hours.' },
          { strong: 'Digital QR Pass:', text: 'once verified, students receive a scannable QR credential used for in-person event check-ins and closed-campus verification.' },
        ],
      },
    ],
  },
  {
    id: 'access-tiers',
    title: 'Access Tiers',
    blocks: [
      {
        type: 'p',
        text: 'Not all verified members have identical permissions. CampusCircle distinguishes between three access tiers:',
      },
      {
        type: 'list',
        items: [
          { strong: 'Student (default):', text: 'browse Discover, RSVP to events, join communities, connect with Buddies, and manage a personal profile.' },
          { strong: 'Organiser:', text: 'granted to recognised clubs, councils, and chapters to publish events, manage RSVPs, and post community updates.' },
          { strong: 'Administrator:', text: 'held by Student Affairs and platform staff for moderation, verification review, and policy enforcement.' },
        ],
      },
    ],
  },
  {
    id: 'lifecycle',
    title: 'Account Lifecycle & Graduation',
    blocks: [
      {
        type: 'p',
        text: 'Accounts remain active for the duration of a student’s enrollment. On graduation, withdrawal, or transfer, institutional email addresses are deactivated by SIES GST IT Services, which automatically restricts platform access at the next sign-in attempt.',
      },
      {
        type: 'p',
        text: 'Graduating students may request a data export of their event history and community memberships before deactivation by contacting the Help & Grievance Desk.',
      },
    ],
  },
  {
    id: 'violations',
    title: 'Policy Violations',
    blocks: [
      {
        type: 'p',
        text: 'Attempting to circumvent domain verification, sharing login credentials or QR passes with non-members, or creating accounts on behalf of ineligible individuals is treated as a closed-campus violation and is handled under the Code of Conduct enforcement process, up to and including permanent suspension.',
      },
    ],
  },
  {
    id: 'review',
    title: 'Policy Review',
    blocks: [
      {
        type: 'p',
        text: 'This policy is reviewed annually by Student Affairs in coordination with SIES GST IT Services and may be updated to reflect changes in enrollment systems, department structures, or platform capabilities. Material changes are announced via the Campus Digest newsletter and in-app notifications.',
      },
    ],
  },
];

export default function ClosedCampusPolicyPage() {
  return (
    <LegalPageLayout
      icon={ShieldCheck}
      eyebrow="SIES GST Closed-Campus Ecosystem"
      title="Closed Campus Policy"
      description="How CampusCircle defines, verifies, and maintains a platform restricted exclusively to the SIES Graduate School of Technology community."
      effectiveDate="July 1, 2025"
      lastUpdated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
