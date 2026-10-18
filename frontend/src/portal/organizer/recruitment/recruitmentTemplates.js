/**
 * recruitmentTemplates.js
 * Standard community roles & drive blueprints for campus communities.
 * Roles are well-defined labels modeled after standard engineering and collegiate
 * student chapters (CSI, ACM, IEEE, GDSC, Student Councils).
 *
 * NOTE: These roles are informational labels for recruitment and membership roster;
 * they do not grant administrative or elevated access permissions.
 */

export const ROLE_DEPARTMENTS = [
  { id: 'all', label: 'All Roles', icon: '✨' },
  { id: 'leadership', label: 'Executive Council', icon: '👑' },
  { id: 'technical', label: 'Technical & Web', icon: '⚡' },
  { id: 'design', label: 'Design & Media', icon: '🎨' },
  { id: 'events', label: 'Events & Ops', icon: '🎯' },
  { id: 'outreach', label: 'PR & Outreach', icon: '📣' },
  { id: 'finance', label: 'Finance & Sponsor', icon: '💰' },
];

export const STANDARD_COMMUNITY_ROLES = [
  // ── Executive Council ──
  {
    id: 'role_chairperson',
    title: 'Lead Organiser / Chairperson',
    shortName: 'Chairperson',
    department: 'leadership',
    wing: 'Executive Council',
    level: 'Council Head',
    icon: '👑',
    tag: 'Executive Council',
    description: 'Provide overarching strategic direction, liaise with collegiate faculty and department heads, and guide the executive committee in planning annual student initiatives and flagship summits.',
    formQuestions: [
      { label: 'Prior student leadership or committee experience', type: 'textarea', required: true },
      { label: 'What is your strategic vision for the chapter in the upcoming academic term?', type: 'textarea', required: true },
      { label: 'How would you handle conflict or bandwidth issues within core team leads?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_vice_chairperson',
    title: 'Co-Lead / Vice Chairperson',
    shortName: 'Vice Chairperson',
    department: 'leadership',
    wing: 'Executive Council',
    level: 'Council Head',
    icon: '⭐',
    tag: 'Executive Council',
    description: 'Work alongside the Lead Organiser to supervise departmental leads, streamline task allocations, and drive quality standards across all community events and student deliverables.',
    formQuestions: [
      { label: 'Describe a complex team initiative you helped coordinate or lead.', type: 'textarea', required: true },
      { label: 'Which community wings do you feel most comfortable mentoring?', type: 'select', required: true, options: ['Technical & Engineering', 'Design & Creatives', 'Events & Logistics', 'PR & Sponsorship'] },
      { label: 'Expected weekly time commitment (hours/week)', type: 'select', required: true, options: ['6–8 hours/week', '8–12 hours/week', '12+ hours/week'] },
    ],
  },
  {
    id: 'role_gen_secretary',
    title: 'General Secretary',
    shortName: 'General Secretary',
    department: 'leadership',
    wing: 'Executive Council',
    level: 'Core Council',
    icon: '📋',
    tag: 'Core Council',
    description: 'Maintain official chapter records, council minutes of meetings (MoMs), event agendas, annual performance documentation, and official communication with institutional authorities.',
    formQuestions: [
      { label: 'Experience with official documentation, minutes of meetings, or executive reporting', type: 'textarea', required: true },
      { label: 'How comfortable are you with Google Workspace / MS Office / Notion?', type: 'select', required: true, options: ['Advanced / Power User', 'Intermediate', 'Beginner'] },
    ],
  },
  {
    id: 'role_treasurer',
    title: 'Treasurer & Financial Controller',
    shortName: 'Treasurer',
    department: 'finance',
    wing: 'Finance & Treasury',
    level: 'Core Council',
    icon: '💰',
    tag: 'Finance Wing',
    description: 'Manage community financial budgets, event ticketing accounts, vendor invoices, reimbursement audits, and financial reporting for university and committee charters.',
    formQuestions: [
      { label: 'Have you handled budgeting, cash flows, or financial reconciliations before?', type: 'textarea', required: true },
      { label: 'Link to spreadsheet / accounting work or relevant coursework', type: 'url', required: false },
    ],
  },

  // ── Technical & Engineering ──
  {
    id: 'role_tech_lead',
    title: 'Technical Lead',
    shortName: 'Technical Lead',
    department: 'technical',
    wing: 'Technical',
    level: 'Domain Head',
    icon: '⚡',
    tag: 'Technical Wing',
    description: 'Lead technical curriculum design, organize hands-on workshops and code camps, coordinate hackathon tracks, and architect internal software products developed by the chapter.',
    formQuestions: [
      { label: 'What technical stacks and programming domains are you most proficient in?', type: 'text', required: true },
      { label: 'Link to your GitHub profile or personal engineering portfolio', type: 'url', required: true },
      { label: 'Describe a workshop topic or project you would want to lead for students.', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_web_lead',
    title: 'Web & Full-Stack Development Lead',
    shortName: 'Web Lead',
    department: 'technical',
    wing: 'Technical',
    level: 'Domain Head',
    icon: '🌐',
    tag: 'Technical Wing',
    description: 'Build and maintain community web portals, dynamic registration platforms, event microsites, and custom web tools powering collegiate operations.',
    formQuestions: [
      { label: 'Which web frameworks and technologies do you use regularly?', type: 'text', required: true },
      { label: 'Links to deployed web projects or GitHub repositories you authored', type: 'url', required: true },
    ],
  },
  {
    id: 'role_app_lead',
    title: 'Mobile App Development Lead',
    shortName: 'App Lead',
    department: 'technical',
    wing: 'Technical',
    level: 'Domain Head',
    icon: '📱',
    tag: 'Technical Wing',
    description: 'Lead mobile engineering efforts in Flutter, React Native, or Android, guiding students through app development projects and hackathon builds.',
    formQuestions: [
      { label: 'Mobile frameworks or languages you specialize in (Flutter, React Native, Kotlin, Swift)', type: 'text', required: true },
      { label: 'Link to Play Store, App Store, or GitHub APK repositories', type: 'url', required: true },
    ],
  },
  {
    id: 'role_tech_associate',
    title: 'Technical Associate & Mentor',
    shortName: 'Tech Associate',
    department: 'technical',
    wing: 'Technical',
    level: 'Associate',
    icon: '💻',
    tag: 'Technical Wing',
    description: 'Provide hands-on debugging, 1-on-1 student assistance during coding bootcamps, maintain laboratory setup, and assist in coding contest problem creation.',
    formQuestions: [
      { label: 'What programming languages are you comfortable assisting beginners with?', type: 'text', required: true },
      { label: 'Link to your GitHub / LeetCode / HackerRank profile', type: 'url', required: false },
    ],
  },

  // ── Design & Creative ──
  {
    id: 'role_design_lead',
    title: 'Design & Creatives Lead',
    shortName: 'Design Lead',
    department: 'design',
    wing: 'Design & Creative',
    level: 'Domain Head',
    icon: '🎨',
    tag: 'Design Wing',
    description: 'Set visual direction, color palettes, and typographic standards. Supervise poster design, digital marketing banners, merchandise, and event keynote visuals.',
    formQuestions: [
      { label: 'Link to your design portfolio (Behance, Dribbble, Figma, Drive)', type: 'url', required: true },
      { label: 'Which tools are in your everyday design stack?', type: 'text', required: true },
      { label: 'Share an example of a brand or design system you admire and why.', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_uiux_designer',
    title: 'UI/UX & Product Designer',
    shortName: 'UI/UX Designer',
    department: 'design',
    wing: 'Design & Creative',
    level: 'Domain Lead',
    icon: '✨',
    tag: 'Design Wing',
    description: 'Create responsive user flows, wireframes, and polished mockups for digital platforms, mobile apps, and hackathon presentation interfaces.',
    formQuestions: [
      { label: 'Link to your Figma portfolio, case study, or prototype', type: 'url', required: true },
      { label: 'What is your process when converting user requirements into UI screens?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_multimedia_editor',
    title: 'Video & Motion Graphics Editor',
    shortName: 'Video Editor',
    department: 'design',
    wing: 'Design & Creative',
    level: 'Associate',
    icon: '🎬',
    tag: 'Design Wing',
    description: 'Edit cinematic event teasers, student reels, speaker interview clips, and aftermovies using Premiere Pro, After Effects, or DaVinci Resolve.',
    formQuestions: [
      { label: 'Link to video editing samples or motion graphics reel', type: 'url', required: true },
      { label: 'Video editing software and hardware specifications you work with', type: 'text', required: true },
    ],
  },

  // ── Events & Operations ──
  {
    id: 'role_events_head',
    title: 'Events & Operations Head',
    shortName: 'Events Head',
    department: 'events',
    wing: 'Operations & Events',
    level: 'Domain Head',
    icon: '🎯',
    tag: 'Operations Wing',
    description: 'Plan the end-to-end execution of conferences, technical symposiums, and cultural fests — including venue permissions, schedules, A/V management, and crisis handling.',
    formQuestions: [
      { label: 'Previous experience in event planning, stage management, or logistics', type: 'textarea', required: true },
      { label: 'How do you handle unexpected delays or technical glitches during live events?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_event_coordinator',
    title: 'Event Operations Coordinator',
    shortName: 'Event Coordinator',
    department: 'events',
    wing: 'Operations & Events',
    level: 'Associate',
    icon: '📍',
    tag: 'Operations Wing',
    description: 'Coordinate venue layout, guest reception, speaker mic allocation, registration check-in queues, and certificate distribution for assigned community events.',
    formQuestions: [
      { label: 'Availability for on-campus event coordination (including weekends)', type: 'select', required: true, options: ['Fully Available', 'Available with prior notice', 'Limited'] },
      { label: 'Have you coordinated logistics or registrations at college events before?', type: 'textarea', required: false },
    ],
  },
  {
    id: 'role_event_volunteer',
    title: 'Event Day Operations Volunteer',
    shortName: 'Event Volunteer',
    department: 'events',
    wing: 'Operations & Events',
    level: 'Volunteer',
    icon: '🛡️',
    tag: 'Operations Wing',
    description: 'Serve on the front line during flagship conferences and workshops — managing attendee seating, QR scanning at entry, and kit distributions.',
    formQuestions: [
      { label: 'Are you available for full-day event shifts on flagship conference days?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { label: 'What motivated you to volunteer with our community?', type: 'textarea', required: true },
    ],
  },

  // ── Public Relations, Sponsorship & Content ──
  {
    id: 'role_pr_lead',
    title: 'Public Relations (PR) & Outreach Lead',
    shortName: 'PR Lead',
    department: 'outreach',
    wing: 'PR & Outreach',
    level: 'Domain Head',
    icon: '📣',
    tag: 'Outreach Wing',
    description: 'Drive publicity campaigns across university departments, coordinate class-to-class announcements, establish tie-ups with partner colleges, and manage community guest relations.',
    formQuestions: [
      { label: 'Experience in campus publicity, public speaking, or student representation', type: 'textarea', required: true },
      { label: 'How would you pitch an upcoming flagship hackathon to first-year engineering students?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_sponsorship_lead',
    title: 'Corporate Sponsorship & Partnerships Lead',
    shortName: 'Sponsorship Lead',
    department: 'finance',
    wing: 'Finance & Sponsorship',
    level: 'Domain Head',
    icon: '🤝',
    tag: 'Sponsorship Wing',
    description: 'Prospect tech companies and startups, draft professional sponsorship brochures, negotiate cash/in-kind partner perks, and steward sponsor relationships.',
    formQuestions: [
      { label: 'Experience with pitch decks, corporate outreach, cold emailing, or sponsorship', type: 'textarea', required: true },
      { label: 'Link to a pitch deck, presentation, or outreach document you created', type: 'url', required: false },
    ],
  },
  {
    id: 'role_content_writer',
    title: 'Content & Editorial Writer',
    shortName: 'Content Writer',
    department: 'outreach',
    wing: 'Content & Media',
    level: 'Associate',
    icon: '📝',
    tag: 'Content Wing',
    description: 'Craft engaging announcement copy, technical newsletter articles, speaker intros, social media captions, and post-event press coverage.',
    formQuestions: [
      { label: 'Link to writing samples, articles, blogs, or social media copy', type: 'url', required: true },
      { label: 'Why do you want to write for this community?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'role_social_media_lead',
    title: 'Social Media & Community Engagement Lead',
    shortName: 'Social Media Lead',
    department: 'outreach',
    wing: 'Content & Media',
    level: 'Domain Lead',
    icon: '📲',
    tag: 'Media Wing',
    description: 'Grow the community’s digital footprint on Instagram, LinkedIn, and Discord through viral content strategies, story takeovers, and engagement tracking.',
    formQuestions: [
      { label: 'Links to social accounts, campaigns, or pages you manage or contributed to', type: 'url', required: true },
      { label: 'Share an idea for a social media campaign to boost workshop attendance.', type: 'textarea', required: true },
    ],
  },
];

/**
 * Quick starter blueprints shown in primary 1-click grid
 */
export const STARTER_DRIVE_TEMPLATES = [
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_tech_lead'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_design_lead'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_events_head'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_pr_lead'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_content_writer'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_web_lead'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_sponsorship_lead'),
  STANDARD_COMMUNITY_ROLES.find((r) => r.id === 'role_event_volunteer'),
].filter(Boolean);

/**
 * Finds a standard community role definition matching a given title or label.
 */
export function findStandardRole(title = '') {
  if (!title) return null;
  const clean = title.trim().toLowerCase();
  return (
    STANDARD_COMMUNITY_ROLES.find((r) => r.title.toLowerCase() === clean || r.shortName.toLowerCase() === clean) ||
    STANDARD_COMMUNITY_ROLES.find((r) => clean.includes(r.shortName.toLowerCase()) || r.title.toLowerCase().includes(clean)) ||
    null
  );
}
