import { UsersFour } from '@phosphor-icons/react';
import LegalPageLayout from './LegalPageLayout';

const SECTIONS = [
  {
    id: 'purpose',
    title: 'Purpose',
    blocks: [
      {
        type: 'p',
        text: 'CampusCircle is a shared space for the entire SIES GST community — students, councils, and departments — to organise events, build communities, and connect with peers. This Code of Conduct sets the standard of behaviour expected of every member so that space stays safe, respectful, and useful.',
      },
    ],
  },
  {
    id: 'principles',
    title: 'Core Principles',
    blocks: [
      {
        type: 'list',
        items: [
          { strong: 'Respect:', text: 'engage with fellow students, organisers, and staff courteously, even in disagreement.' },
          { strong: 'Integrity:', text: 'represent yourself, your club, and your work honestly — no impersonation, fake credentials, or misleading event listings.' },
          { strong: 'Inclusivity:', text: 'communities and events on the platform welcome members across departments, years, and backgrounds without discrimination.' },
          { strong: 'Accountability:', text: 'organisers are responsible for the accuracy of the events, posts, and RSVPs they manage.' },
        ],
      },
    ],
  },
  {
    id: 'prohibited-conduct',
    title: 'Prohibited Conduct',
    blocks: [
      {
        type: 'p',
        text: 'The following are not permitted anywhere on CampusCircle, including profiles, community posts, event pages, comments, and direct connections made through Buddies:',
      },
      {
        type: 'list',
        items: [
          { strong: 'Harassment or bullying,', text: 'including targeted comments, unwanted contact, or intimidation of another student or organiser.' },
          { strong: 'Hate speech or discrimination', text: 'based on caste, religion, gender, sexuality, disability, region, or any other protected characteristic.' },
          { strong: 'Impersonation,', text: 'including creating a profile or organiser account pretending to be another student, council, or department.' },
          { strong: 'Spam or unauthorised promotion,', text: 'such as posting unrelated commercial content, referral links, or repeated off-topic messages.' },
          { strong: 'Academic dishonesty facilitation,', text: 'including sharing exam material improperly or coordinating plagiarism through platform communities.' },
          { strong: 'Fraudulent event listings,', text: 'such as fake RSVPs, misrepresented hosts, or events created to collect personal data under false pretences.' },
        ],
      },
    ],
  },
  {
    id: 'content-standards',
    title: 'Content Standards',
    blocks: [
      {
        type: 'p',
        text: 'Posts, photos, and comments shared in Discover feeds or community pages should be relevant to campus life — events, academics, clubs, and student interests. Content must not contain graphic, obscene, or illegal material. Organisers are expected to moderate comments on their own event and community pages in line with this Code.',
      },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting a Concern',
    blocks: [
      {
        type: 'p',
        text: 'Any student can report a post, profile, comment, or event directly from within the app, or escalate a concern to the Help & Grievance Desk. Reports are reviewed by Student Affairs, and reporters may remain anonymous to the reported party.',
      },
      {
        type: 'note',
        text: 'For matters involving personal safety or emergencies, contact SIES GST campus security directly in addition to reporting on the platform — CampusCircle moderation is not a substitute for emergency response.',
      },
    ],
  },
  {
    id: 'enforcement',
    title: 'Enforcement & Sanctions',
    blocks: [
      {
        type: 'p',
        text: 'Violations are reviewed on a case-by-case basis. Depending on severity and history, outcomes may include:',
      },
      {
        type: 'list',
        items: [
          { strong: 'Content removal', text: 'of the offending post, comment, or event listing.' },
          { strong: 'Formal warning', text: 'issued to the account, recorded against the student or organiser profile.' },
          { strong: 'Temporary suspension', text: 'restricting posting, RSVP, or organiser privileges for a defined period.' },
          { strong: 'Permanent removal', text: 'from the platform for severe or repeated violations, referred to Student Affairs for further institutional action where applicable.' },
        ],
      },
    ],
  },
  {
    id: 'appeals',
    title: 'Appeals',
    blocks: [
      {
        type: 'p',
        text: 'A student or organiser who believes a moderation decision was made in error may submit an appeal through the Help & Grievance Desk within 14 days of the decision. Appeals are reviewed by a Student Affairs representative not involved in the original decision.',
      },
    ],
  },
];

export default function CodeOfConductPage() {
  return (
    <LegalPageLayout
      icon={UsersFour}
      eyebrow="SIES GST Closed-Campus Ecosystem"
      title="Code of Conduct"
      description="The behaviour standards every student, organiser, and council is expected to follow across events, communities, and profiles on CampusCircle."
      effectiveDate="July 1, 2025"
      lastUpdated="August 17, 2026"
      sections={SECTIONS}
    />
  );
}
