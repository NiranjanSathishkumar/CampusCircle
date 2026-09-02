/**
 * profileData.js — CampusCircle Student Profile Data & Helpers
 *
 * Personal details and achievements are backend-driven (see
 * features/profile/profile.api.js) — only the tabs not yet wired to a real
 * API (bookmarks, followed clubs, network) still source mock data below.
 */

// Mirrors backend/src/models/User.js's BRANCHES enum exactly — the profile
// PATCH endpoint rejects any value outside this list.
export const BRANCH_OPTIONS = [
  'Computer Engineering 1',
  'Computer Engineering 2',
  'Computer Engineering 3',
  'Information Technology 1',
  'Information Technology 2',
  'AI & Data Science',
  'AI & Machine Learning',
  'CSE (IoT, Cyber Security, & Blockchain)',
];

export const INITIAL_BOOKMARKS = {
  events: [
    {
      id: 'ev_001',
      title: 'HackCampus 2026 — 36-Hour Hackathon',
      dateBadge: '16 Aug',
      meta: 'Sat, 16 Aug 2026 · Main Auditorium',
      category: 'Competition',
      imageUrl: 'https://picsum.photos/seed/hackcampus-dark-code/400/250',
      hostName: 'Hackathon Society',
    },
    {
      id: 'ev_004',
      title: 'Canvas & Code — UI/UX Design for Engineers',
      dateBadge: '23 Aug',
      meta: 'Thu, 23 Aug 2026 · Design Studio',
      category: 'Workshop',
      imageUrl: 'https://picsum.photos/seed/ui-design-figma-desk/400/250',
      hostName: 'Fine Arts & Design',
    },
    {
      id: 'ev_009',
      title: 'Inside LLMs — How Large Language Models Actually Work',
      dateBadge: '29 Aug',
      meta: 'Fri, 29 Aug 2026 · Lecture Hall 2',
      category: 'Tech Talk',
      imageUrl: 'https://picsum.photos/seed/neural-network-glow-blue/400/250',
      hostName: 'AI Research Society',
    },
  ],
  posts: [
    {
      id: 'post_101',
      title: 'Turing Club Core Committee Recruitment 2026–27 Announced',
      author: 'Priya Deshmukh',
      authorRole: 'Turing Club Lead',
      date: '10 Aug 2026',
      category: 'Announcement',
      excerpt: 'Applications are officially open for Technical, Event Management, Design, and PR tracks. All 2nd and 3rd year students are eligible to apply.',
    },
    {
      id: 'post_102',
      title: 'SIES GST Library Extends Midnight Study Hours for End-Sem Prep',
      author: 'Academic Council',
      authorRole: 'Campus Administration',
      date: '08 Aug 2026',
      category: 'Campus Update',
      excerpt: 'The central library will remain open until 2:00 AM from Monday to Saturday during the upcoming examination period.',
    },
  ],
};

export const INITIAL_CLUBS = [
  {
    id: 'turing',
    name: 'Turing Club',
    category: 'Tech',
    description: 'The official Computer Engineering student chapter focused on algorithms, open-source projects, and competitive coding.',
    followers: 482,
    membersCount: 64,
    icon: '⌨',
    iconBg: 'rgba(26, 58, 42, 0.12)',
    iconColor: '#1A3A2A',
    imageUrl: 'https://picsum.photos/seed/turing-club-bg/500/300',
  },
  {
    id: 'hackathon',
    name: 'Hackathon Society',
    category: 'Tech',
    description: 'Organizers of HackCampus and campus hackathon teams representing SIES GST across national coding competitions.',
    followers: 610,
    membersCount: 88,
    icon: '⚡',
    iconBg: 'rgba(124, 45, 18, 0.12)',
    iconColor: '#7C2D12',
    imageUrl: 'https://picsum.photos/seed/hackathon-soc-bg/500/300',
  },
  {
    id: 'airesearch',
    name: 'AI Research Society',
    category: 'Science',
    description: 'Interdisciplinary student group studying machine learning, computer vision, natural language processing, and AI ethics.',
    followers: 320,
    membersCount: 42,
    icon: '🤖',
    iconBg: 'rgba(30, 58, 95, 0.12)',
    iconColor: '#1E3A5F',
    imageUrl: 'https://picsum.photos/seed/ai-research-bg/500/300',
  },
  {
    id: 'fineart',
    name: 'Fine Arts & Design',
    category: 'Arts',
    description: 'Promoting visual design, UI/UX, sketching, digital illustration, and campus cultural exhibitions.',
    followers: 395,
    membersCount: 50,
    icon: '🎨',
    iconBg: 'rgba(126, 29, 95, 0.12)',
    iconColor: '#7E1D5F',
    imageUrl: 'https://picsum.photos/seed/fine-arts-bg/500/300',
  },
];

export const INITIAL_NETWORK = {
  followers: [
    {
      id: 'usr_001',
      name: 'Rohan Mehta',
      title: 'Student · Computer Engineering',
      degreeBadge: "BE Comp '26",
      online: true,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      branch: 'Computer Engineering',
      year: '3rd Year',
      isFollowingBack: true,
    },
    {
      id: 'usr_002',
      name: 'Ananya Iyer',
      title: 'Student · Information Technology',
      degreeBadge: "BE IT '27",
      online: false,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      branch: 'Information Technology',
      year: '2nd Year',
      isFollowingBack: false,
    },
    {
      id: 'usr_003',
      name: 'Devansh Verma',
      title: 'Student · AI & Data Science',
      degreeBadge: "BE AI&DS '26",
      online: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      branch: 'Artificial Intelligence & Data Science',
      year: '3rd Year',
      isFollowingBack: true,
    },
    {
      id: 'usr_004',
      name: 'Saniya Patil',
      title: 'Student · Electronics & Telecom',
      degreeBadge: "BE EXTC '25",
      online: false,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      branch: 'Electronics & Telecommunication',
      year: '4th Year',
      isFollowingBack: true,
    },
  ],
  following: [
    {
      id: 'usr_001',
      name: 'Rohan Mehta',
      title: 'Student · Computer Engineering',
      degreeBadge: "BE Comp '26",
      online: true,
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      branch: 'Computer Engineering',
      year: '3rd Year',
    },
    {
      id: 'usr_003',
      name: 'Devansh Verma',
      title: 'Student · AI & Data Science',
      degreeBadge: "BE AI&DS '26",
      online: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      branch: 'Artificial Intelligence & Data Science',
      year: '3rd Year',
    },
    {
      id: 'usr_005',
      name: 'Dr. Ramesh Nair',
      title: 'Faculty Mentor · Computer Dept',
      degreeBadge: 'Professor',
      online: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      branch: 'Computer Engineering',
      year: 'Faculty',
    },
  ],
};
