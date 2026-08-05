export const CURRENT_USER = {
  role: "organizer",       // "student" | "organizer"
  name: "Turing Club",
  avatarUrl: null,
  clubIcon: "fa-microchip",
  accentColor: "#5B4FE9",
};

export const COMMUNITIES = [
  { id: "all",       label: "All",               icon: "fa-fire",        color: "#f97316" },
  { id: "turing",    label: "Turing Club",        icon: "fa-microchip",   color: "#5B4FE9" },
  { id: "hackathon", label: "Hackathon Society",  icon: "fa-laptop-code", color: "#0ea5e9" },
  { id: "arts",      label: "Fine Arts & Design", icon: "fa-paintbrush",  color: "#ec4899" },
  { id: "ai",        label: "AI Research",        icon: "fa-brain",       color: "#f59e0b" },
  { id: "sports",    label: "Sports Council",     icon: "fa-trophy",      color: "#10b981" },
  { id: "music",     label: "Music Club",         icon: "fa-music",       color: "#a855f7" },
  { id: "debate",    label: "Debate Society",     icon: "fa-comments",    color: "#475569" },
  { id: "photo",     label: "Photography Club",   icon: "fa-camera",      color: "#d97706" },
];

export const POST_TYPES  = ["Announcement", "Event", "Achievement", "Workshop", "Update", "Notice"];
export const SORT_OPTIONS = ["Latest First", "Most Liked", "Most Commented"];
export const DATE_PRESETS = ["Today", "This Week", "This Month", "This Year", "Custom Range"];

export const TYPE_STYLES = {
  Announcement: { bg: "#fff8ee", text: "#d97706", border: "#fde68a", icon: "fa-bullhorn" },
  Event:        { bg: "#f0f0fc", text: "#5B4FE9", border: "#dddaf8", icon: "fa-calendar-star" },
  Achievement:  { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", icon: "fa-medal" },
  Workshop:     { bg: "#fdf4ff", text: "#a855f7", border: "#e9d5ff", icon: "fa-chalkboard-user" },
  Update:       { bg: "#f0f9ff", text: "#0284c7", border: "#bae6fd", icon: "fa-rotate" },
  Notice:       { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3", icon: "fa-circle-info" },
};

const SAMPLE_COMMENTS = [
  { id: 101, author: "Aditya M.",   avatarUrl: null, text: "Can't wait for this! 🔥",             time: "1h ago" },
  { id: 102, author: "Priya K.",    avatarUrl: null, text: "Registering with my team right now!", time: "45m ago" },
  { id: 103, author: "Rahul S.",    avatarUrl: null, text: "Is there an online participation option?", time: "20m ago" },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export const SEED_POSTS = [
  {
    id: 1, community: "turing", type: "Event",
    author: "Turing Club", authorIcon: "fa-microchip", accentColor: "#5B4FE9",
    rawDate: daysAgo(0), time: "2h ago",
    content: "🚀 Code Clash 2025 registrations are NOW OPEN!\n\nJoin us on Aug 10 for an intense 6-hour competitive coding battle. Open to all branches.\n\n🏆 Prize pool: ₹30,000\n📍 CS Lab, Block A\n👥 Teams of 2–4\n\nCheck out photos from last year's finals!",
    images: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    ],
    tags: ["#CodeClash2025", "#Competitive", "#OpenToAll"],
    likes: 142, comments: SAMPLE_COMMENTS.length, shares: 9,
    liked: false, bookmarked: false, pinned: true,
    commentList: [...SAMPLE_COMMENTS],
  },
  {
    id: 2, community: "ai", type: "Workshop",
    author: "AI Research Society", authorIcon: "fa-brain", accentColor: "#f59e0b",
    rawDate: daysAgo(0), time: "5h ago",
    content: "📚 Intro to Generative AI — Free Workshop!\n\nNo prerequisites needed. Learn prompting, fine-tuning basics, and build your first LLM-powered app in 3 hours.\n\n📅 Aug 5 · 3:00 PM\n📍 Seminar Hall 2\n🆓 Completely free to attend. Seats are strictly first-come, first-served!",
    images: [],
    tags: ["#GenAI", "#FreeWorkshop", "#BeginnerFriendly"],
    likes: 98, comments: 11, shares: 14,
    liked: false, bookmarked: false, pinned: false,
    commentList: [],
  },
  {
    id: 3, community: "hackathon", type: "Announcement",
    author: "Hackathon Society", authorIcon: "fa-laptop-code", accentColor: "#0ea5e9",
    rawDate: daysAgo(1), time: "1d ago",
    content: "🎉 HackFest 36H is here!\n\nOur flagship 36-hour hackathon returns this August. Build anything — web, mobile, AI, IoT — and compete for the top prize.\n\nCheck out our previous hackathon venues and mentor sessions below!",
    images: [
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80"
    ],
    tags: ["#HackFest36H", "#Hackathon", "#BuildAnything"],
    likes: 204, comments: 32, shares: 27,
    liked: true, bookmarked: true, pinned: false,
    commentList: [],
  },
  {
    id: 4, community: "arts", type: "Achievement",
    author: "Fine Arts & Design", authorIcon: "fa-paintbrush", accentColor: "#ec4899",
    rawDate: daysAgo(2), time: "2d ago",
    content: "🥇 Huge congratulations to Priya Krishnan and Aditya Menon for winning the National Design Sprint 2025!\n\nThey represented our club with an incredible UI/UX solution for urban mobility. So proud of you both! 🎨✨",
    images: [
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      "https://images.unsplash.com/photo-1542744094-3a3121699479?w=800&q=80"
    ],
    tags: ["#DesignSprint", "#Proud", "#FineArts"],
    likes: 317, comments: 44, shares: 31,
    liked: false, bookmarked: false, pinned: false,
    commentList: [],
  },
  {
    id: 5, community: "music", type: "Event",
    author: "Music Club", authorIcon: "fa-music", accentColor: "#a855f7",
    rawDate: daysAgo(3), time: "3d ago",
    content: "🎸 Crescendo — Battle of Bands is coming!\n\nSep 1 · 6:30 PM at the Open-Air Amphitheatre.\n\nBring your band. Any genre welcome. The campus will decide who reigns supreme. Registrations close Aug 20.",
    images: [],
    tags: ["#Crescendo", "#BattleOfBands", "#Music"],
    likes: 176, comments: 25, shares: 18,
    liked: false, bookmarked: false, pinned: false,
    commentList: [],
  },
  {
    id: 6, community: "photo", type: "Update",
    author: "Photography Club", authorIcon: "fa-camera", accentColor: "#d97706",
    rawDate: daysAgo(5), time: "5d ago",
    content: "📸 Golden Hour Walk highlights are up!\n\nThank you everyone who joined last weekend. The campus garden looked absolutely stunning. Here are 5 featured shots selected by our lead editor!",
    images: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
      "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80",
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80"
    ],
    tags: ["#GoldenHourWalk2025", "#Photography", "#Campus"],
    likes: 89, comments: 14, shares: 8,
    liked: false, bookmarked: false, pinned: false,
    commentList: [],
  },
];

export function isInDateRange(rawDate, preset, dateFrom, dateTo) {
  if (!rawDate) return true;
  const d = new Date(rawDate);
  const today = new Date(); today.setHours(0, 0, 0, 0);

  if (preset === "All Time" && !dateFrom && !dateTo) return true;

  if (preset === "Today") {
    return d >= today;
  }
  if (preset === "This Week") {
    const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);
    return d >= weekAgo;
  }
  if (preset === "This Month") {
    const monthAgo = new Date(today); monthAgo.setMonth(today.getMonth() - 1);
    return d >= monthAgo;
  }
  if (preset === "This Year") {
    return d.getFullYear() === today.getFullYear();
  }
  if (preset === "Custom Range") {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to   = dateTo   ? new Date(dateTo)   : null;
    if (from && d < from) return false;
    if (to   && d > to)   return false;
    return true;
  }
  return true;
}
