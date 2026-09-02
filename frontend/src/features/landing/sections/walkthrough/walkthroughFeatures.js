/**
 * Copy + metadata for each walkthrough step.
 */
import { AddressBook, Bell, Buildings, CalendarCheck, ChartLineUp, Compass, QrCode, UserSwitch } from '@phosphor-icons/react';
import { AnalyticsVisual, BuddiesVisual, CommunitiesVisual, DiscoverVisual, EventsVisual, NotificationsVisual, QRVisual, RecruitmentVisual } from '@/features/landing/sections/walkthrough/WalkthroughVisuals';

export const FEATURES = [
  {
    id: 'discover',
    tab: 'Discover Feed',
    icon: Compass,
    title: 'Your campus, filtered to what you care about.',
    body: 'Tag your interests when you create your profile. The Discover Feed shows events, clubs, and announcements ranked by relevance to your branch, year, and selected tags — no algorithm working against you.',
    detail: 'Interest tags include: Coding, Design, Photography, Sports, Debate, Cultural, Academic, Entrepreneurship, and more. Add or edit tags at any time from your profile.',
    Visual: DiscoverVisual,
  },
  {
    id: 'events',
    tab: 'Events & Registration',
    icon: CalendarCheck,
    title: 'Register solo or bring your team. One flow, end to end.',
    body: 'Solo registration or team slots. Waitlist when capacity fills. Razorpay-secured payment links embedded directly in the registration step — no external redirects, no lost payments.',
    detail: 'Razorpay webhook signature verification on every transaction. Refund eligibility determined per-event by the organiser. Payment status visible on your dashboard.',
    Visual: EventsVisual,
  },
  {
    id: 'qr',
    tab: 'QR Attendance',
    icon: QrCode,
    title: 'Your pass lives in your account. Attendance is automatic.',
    body: 'Registered? A QR code generates for your ticket. The organiser scans at the door. Attendance records instantly — no sign-in sheets, no manual reconciliation at the end of a 200-person event.',
    detail: 'QR codes are tied to your student account and the specific event registration. Single-scan enforcement prevents sharing. Attendance logs are available to organisers immediately.',
    Visual: QRVisual,
  },
  {
    id: 'communities',
    tab: 'Communities',
    icon: Buildings,
    title: 'Every active club at your college, verified.',
    body: 'Admin-verified communities only. Each club page shows its description, active members, upcoming events, and a direct follow or join-request option — no fake clubs, no dead pages.',
    detail: 'Verified status is granted by college administration. Any student can request a new community; approval goes through the Admin portal. Verified badge displayed on all public-facing community pages.',
    Visual: CommunitiesVisual,
  },
  {
    id: 'recruitment',
    tab: 'Recruitment',
    icon: UserSwitch,
    title: 'Open positions. Structured applications. No DMs.',
    body: 'Clubs post open roles — technical, creative, management — with a description and deadline. Students apply through the platform. Organiser reviews in a single dashboard.',
    detail: 'Application responses can include a short text answer, a portfolio link, or a GitHub URL. Organisers can mark applicants as shortlisted, accepted, or rejected. Applicants are notified automatically.',
    Visual: RecruitmentVisual,
  },
  {
    id: 'buddies',
    tab: 'Buddies',
    icon: AddressBook,
    title: 'Find peers by branch, year, or skill.',
    body: 'The Buddies Directory is a searchable index of student profiles. Filter by branch, graduation year, or self-reported skills. View their public profile, then follow if you want to stay connected.',
    detail: 'Profiles show: branch, year, bio, skill tags, GitHub, LinkedIn, and Instagram links (all optional). Achievements are displayed with a "self-reported, unverified" label.',
    Visual: BuddiesVisual,
  },
  {
    id: 'analytics',
    tab: 'Organiser Analytics',
    icon: ChartLineUp,
    title: 'Know your audience. Stop guessing.',
    body: 'Registration counts by branch and year. Attendance rate vs registrations. Followers gained after each event. Interest-tag breakdown of who responded. Actual data, not impressions.',
    detail: "Analytics are available to club organisers and admins only. No individual student data is surfaced to other students. Data is for the organiser's own community events.",
    Visual: AnalyticsVisual,
    visualProps: true, // signals that this Visual needs reduce prop
  },
  {
    id: 'notifications',
    tab: 'Notifications',
    icon: Bell,
    title: 'One signal channel. Only things you opted into.',
    body: 'Notifications for events from communities you follow, direct application status updates, and team registration confirmations. Nothing from communities you did not follow — no broadcast spam.',
    detail: 'Notification preferences are configurable per-category. Platform uses in-app notifications. Email delivery for registration confirmations and payment receipts.',
    Visual: NotificationsVisual,
  },
];
