/**
 * Starter templates offered when creating a recruitment drive.
 * One template = one drive = one position (CommunityRecruitment has no
 * multi-position/openings concept — see recruitment.api.js).
 */
export const STARTER_DRIVE_TEMPLATES = [
  {
    id: 'tpl_design_lead',
    icon: '🎨',
    name: 'Design Lead',
    title: 'Design Lead',
    description: 'Own the visual identity and design systems for community events, posts, and campaigns for the upcoming term.',
    formQuestions: [
      { label: 'Why are you interested in this role?', type: 'textarea', required: true },
      { label: 'Link to your design portfolio', type: 'url', required: true },
    ],
  },
  {
    id: 'tpl_tech_volunteer',
    icon: '⚡',
    name: 'Technical Volunteer',
    title: 'Technical Volunteer',
    description: 'Support workshops, hackathons, and study jams with hands-on technical mentoring and lab assistance.',
    formQuestions: [
      { label: 'What technical stacks are you most comfortable with?', type: 'text', required: true },
      { label: 'Link to your GitHub profile', type: 'url', required: false },
    ],
  },
  {
    id: 'tpl_content_writer',
    icon: '📝',
    name: 'Content Writer',
    title: 'Content & Social Media Writer',
    description: "Craft announcements, recap posts, and social copy that tells the community's story across platforms.",
    formQuestions: [
      { label: 'Link to a writing sample', type: 'url', required: true },
      { label: 'Why do you want to join the content team?', type: 'textarea', required: true },
    ],
  },
  {
    id: 'tpl_event_volunteer',
    icon: '🛡️',
    name: 'Event Day Volunteer',
    title: 'Event Day Volunteer',
    description: 'Help run registration desks, logistics, and on-ground support for flagship events.',
    formQuestions: [
      { label: 'Are you available for full-day event shifts?', type: 'radio', required: true, options: ['Yes', 'No'] },
      { label: 'Have you volunteered at campus events before?', type: 'textarea', required: false },
    ],
  },
];
