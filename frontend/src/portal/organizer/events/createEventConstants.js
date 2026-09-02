/**
 * Banner art, campus venues and category options for the create-event wizard.
 */
/* ─────────────────────────────────────────────────────────────
   CURATED POSTER BANNER PRESETS
   ───────────────────────────────────────────────────────────── */
export const BANNER_PRESETS = [
  {
    id: 'preset_code',
    label: 'Cyber & Code',
    url: 'https://picsum.photos/seed/hackcampus-dark-code/900/500',
    category: 'Competition',
  },
  {
    id: 'preset_ai',
    label: 'AI & Data Science',
    url: 'https://picsum.photos/seed/python-ml-laptop-desk/900/500',
    category: 'Workshop',
  },
  {
    id: 'preset_cloud',
    label: 'Cloud & DevOps',
    url: 'https://picsum.photos/seed/gdsc-git-recap/900/500',
    category: 'Seminar',
  },
  {
    id: 'preset_hardware',
    label: 'Hardware & IoT',
    url: 'https://picsum.photos/seed/circuit-board-lab/900/500',
    category: 'Tech Talk',
  },
  {
    id: 'preset_design',
    label: 'Design & UI/UX',
    url: 'https://picsum.photos/seed/gdsc-hackathon-post/900/500',
    category: 'Cultural',
  },
  {
    id: 'preset_stage',
    label: 'Stage & Auditorium',
    url: 'https://picsum.photos/seed/campus-auditorium-hall/900/500',
    category: 'Seminar',
  },
];

/* ─────────────────────────────────────────────────────────────
   SIES GST CAMPUS VENUE PRESETS
   ───────────────────────────────────────────────────────────── */
export const CAMPUS_VENUES = [
  { name: 'Main Auditorium', building: 'Main Building', floor: 'Ground Floor', cap: 500 },
  { name: 'Computer Lab 1 (Cloud & AI)', building: 'Block B', floor: '1st Floor', cap: 60 },
  { name: 'Computer Lab 2 (Software)', building: 'Block B', floor: '2nd Floor', cap: 60 },
  { name: 'Computer Lab 3 (Data Science)', building: 'Block B', floor: '3rd Floor', cap: 50 },
  { name: 'Seminar Hall 1', building: 'Management Block', floor: 'Ground Floor', cap: 120 },
  { name: 'Seminar Hall 2', building: 'Academic Block', floor: '2nd Floor', cap: 100 },
  { name: 'Mechanical CAD Workshop', building: 'Workshop Annexe', floor: 'Ground Floor', cap: 45 },
  { name: 'Open Campus Amphitheatre', building: 'Central Courtyard', floor: 'Ground', cap: 350 },
];

export const CATEGORIES = [
  { id: 'Workshop', label: 'Workshop', icon: '🛠️', color: '#1A3A2A' },
  { id: 'Competition', label: 'Competition', icon: '⚡', color: '#7C2D12' },
  { id: 'Seminar', label: 'Seminar', icon: '🎙️', color: '#1E3A5F' },
  { id: 'Cultural', label: 'Cultural', icon: '🎨', color: '#7E1D5F' },
  { id: 'Sports', label: 'Sports', icon: '🏆', color: '#14532D' },
  { id: 'Tech Talk', label: 'Tech Talk', icon: '💬', color: '#0F766E' },
];
