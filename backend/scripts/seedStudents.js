const mongoose = require("mongoose");
require("dotenv").config();

const { User, BRANCHES } = require("../src/models/User");
const Achievement = require("../src/models/Achievement");
const Follow = require("../src/models/Follow");
const Community = require("../src/models/Community");
const CommunityMembership = require("../src/models/CommunityMembership");

const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

// Matches the simulation "today" used by seedEvents.js, so follower-growth
// history and event dates line up on the same timeline.
const BASE_DATE = new Date("2026-09-01T09:00:00.000+05:30");

// Backdates a follow's createdAt to somewhere in the last ~9 months, skewed
// toward recent months (Math.random() ** 1.8 clusters near 0) so a
// community's follower-growth chart reads as organic upward growth instead
// of one flat spike on the seed run's date.
function randomHistoricalDate() {
  const daysAgo = Math.floor(Math.pow(Math.random(), 1.8) * 270);
  const minutesJitter = Math.floor(Math.random() * 1440);
  return new Date(BASE_DATE.getTime() - daysAgo * 86400000 - minutesJitter * 60000);
}

// Curated high-resolution professional portrait avatars from Unsplash
const MALE_AVATARS = [
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
];

const FEMALE_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
];

// Profile Banners
const PROFILE_BANNERS = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80", // code editor
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80", // matrix cyber
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80", // laptop workspace
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80", // abstract gradient
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80", // startup team
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80", // cloud tech earth
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80", // aesthetic desk
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80", // retro tech
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80", // library student
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80", // musical aesthetic
];

// Rich personas blueprint
const STUDENT_PERSONAS = [
  // ── AI & ML / Data Science ──────────────────────────────────
  {
    name: "Aarav Patel",
    gender: "male",
    branch: "AI & Machine Learning",
    yearOfJoining: 2023, // 4th Year
    bio: "Final year AI researcher & Full-stack ML engineer. President of CSI SIES GST. Specializing in Edge AI, PyTorch quantizations, and LLM orchestration with LangChain.",
    skills: ["PyTorch", "Python", "FastAPI", "Next.js", "Docker", "ONNX", "LangChain", "OpenCV"],
    interestTags: ["ai", "machine-learning", "edge-ai", "hackathons", "research", "webdev"],
    achievements: [
      { title: "1st Place Winner — Smart India Hackathon (SIH) 2025", issuer: "Ministry of Education & AICTE", dateEarned: new Date("2025-12-15"), description: "Built an AI-driven smart traffic congestion routing system with real-time video analytics." },
      { title: "Published IEEE Conference Paper on MobileNet Compression", issuer: "IEEE Bombay Section", dateEarned: new Date("2025-09-20"), verificationLink: "https://ieeexplore.ieee.org" }
    ],
    communityRoles: [{ email: "csi@campus.edu", label: "President" }, { email: "gdsc@campus.edu", label: "AI Lead" }]
  },
  {
    name: "Sneha Kulkarni",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2024, // 3rd Year
    bio: "Data Science explorer & ML enthusiast. Kaggle Notebooks Grandmaster in the making. Building predictive analytics models for environmental clean energy systems.",
    skills: ["Python", "TensorFlow", "Scikit-Learn", "SQL", "Pandas", "Streamlit", "PowerBI", "Tableau"],
    interestTags: ["datascience", "ai", "machine-learning", "kaggle", "python", "analytics"],
    achievements: [
      { title: "Top 5 Finalist — Google Solution Challenge 2025", issuer: "Google Developer Student Clubs", dateEarned: new Date("2025-05-10"), description: "Created an automated crop disease classification platform for regional farmers." }
    ],
    communityRoles: [{ email: "gdsc@campus.edu", label: "Data Science Lead" }]
  },
  {
    name: "Ishaan Mehta",
    gender: "male",
    branch: "AI & Data Science",
    yearOfJoining: 2025, // 2nd Year
    bio: "Computer Vision nerd and robotics enthusiast. Exploring autonomous navigation, ROS2, and YOLOv8 real-time object tracking.",
    skills: ["Python", "C++", "OpenCV", "ROS2", "PyTorch", "Linux", "NumPy", "Git"],
    interestTags: ["computervision", "robotics", "ai", "ros", "python", "dsa"],
    achievements: [
      { title: "Winner — Techxter '25 Autonomous Rover Expo", issuer: "IETE SIES GST", dateEarned: new Date("2025-10-18") }
    ],
    communityRoles: [{ email: "iete@campus.edu", label: "Robotics Coordinator" }]
  },
  {
    name: "Kavya Nair",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2024, // 3rd Year
    bio: "NLP enthusiast & GenAI builder. Developing open-source RAG agents and multi-lingual Indian language translation tools.",
    skills: ["Python", "HuggingFace", "Transformers", "FastAPI", "ChromaDB", "React", "Docker"],
    interestTags: ["genai", "nlp", "transformers", "llm", "opensource", "ai"],
    achievements: [
      { title: "HackOver 4.0 Best AI Track Winner", issuer: "CSI SIES GST", dateEarned: new Date("2025-09-28") }
    ],
    communityRoles: [{ email: "csi@campus.edu", label: "AI Specialist" }]
  },

  // ── Computer Engineering / Full-Stack & Systems ──────────────
  {
    name: "Rohan Gupta",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Full-Stack architect & open source contributor. Passionate about distributed systems, Next.js 15, GraphQL, and microservice resilience.",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "GraphQL", "PostgreSQL", "Kafka", "Docker"],
    interestTags: ["webdev", "fullstack", "nextjs", "distributed-systems", "opensource", "react"],
    achievements: [
      { title: "Top Contributor — Hacktoberfest 2025", issuer: "DigitalOcean & GitHub", dateEarned: new Date("2025-10-31") },
      { title: "AWS Certified Developer – Associate", issuer: "Amazon Web Services", dateEarned: new Date("2025-07-14"), verificationLink: "https://aws.amazon.com/verification" }
    ],
    communityRoles: [{ email: "csi@campus.edu", label: "Technical Lead" }, { email: "siesiet@gmail.com", label: "Web Admin" }]
  },
  {
    name: "Priya Sharma",
    gender: "female",
    branch: "Computer Engineering 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Frontend engineer & UI/UX designer. Crafting hyper-responsive web experiences, design systems in Figma, and fluid micro-animations with GSAP.",
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "GSAP", "UI/UX", "Next.js", "Vite"],
    interestTags: ["frontend", "ui/ux", "design", "figma", "webdev", "react"],
    achievements: [
      { title: "Best Design Award — Mumbai UI/UX Hackathon 2025", issuer: "Designers Guild Mumbai", dateEarned: new Date("2025-11-20") }
    ],
    communityRoles: [{ email: "gdsc@campus.edu", label: "Design Lead" }]
  },
  {
    name: "Devansh Rao",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2023, // 4th Year
    bio: "Offensive security researcher & Chapter Lead at OWASP SIES GST. Specializing in Web Application Exploitation, Binary Pwn, and smart contract auditing.",
    skills: ["Burp Suite", "Python", "Solidity", "Linux", "Ghidra", "Reverse Engineering", "Wireshark", "C"],
    interestTags: ["cybersecurity", "ethical-hacking", "ctf", "owasp", "web3", "appsec"],
    achievements: [
      { title: "Top 10 Global Finalist — InCTF National Cyber Tournament", issuer: "Amrita Center for Cyber Security", dateEarned: new Date("2025-12-05") },
      { title: "Certified Ethical Hacker (CEH v12)", issuer: "EC-Council", dateEarned: new Date("2025-04-18") }
    ],
    communityRoles: [{ email: "owasp@campus.edu", label: "Chapter Lead" }]
  },
  {
    name: "Ananya Iyer",
    gender: "female",
    branch: "Computer Engineering 3",
    yearOfJoining: 2024, // 3rd Year
    bio: "Competitive programmer (Candidate Master on Codeforces) and algorithms tutor. President of Literary Club & national parliamentary debater.",
    skills: ["C++", "Java", "DSA", "Algorithms", "Competitive Programming", "Python", "Public Speaking"],
    interestTags: ["competitive-coding", "dsa", "cpp", "algorithms", "debate", "literary"],
    achievements: [
      { title: "Codeforces Candidate Master (Rating 1942)", issuer: "Codeforces", dateEarned: new Date("2025-08-14") },
      { title: "Winner — Gravitas Parliamentary Debate '25", issuer: "Literary Club SIES GST", dateEarned: new Date("2025-10-12") }
    ],
    communityRoles: [{ email: "literaryclub@campus.edu", label: "President" }]
  },
  {
    name: "Siddharth Verma",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Cloud & DevOps engineer. Passionate about Kubernetes clusters, infrastructure as code with Terraform, and zero-downtime CI/CD deployment pipelines.",
    skills: ["Go", "Docker", "Kubernetes", "AWS", "Terraform", "CI/CD", "Prometheus", "Linux"],
    interestTags: ["cloud", "devops", "kubernetes", "golang", "aws", "docker"],
    achievements: [
      { title: "Certified Kubernetes Administrator (CKA)", issuer: "Cloud Native Computing Foundation (CNCF)", dateEarned: new Date("2025-11-10"), verificationLink: "https://cncf.io/certification/cka" }
    ],
    communityRoles: [{ email: "gdsc@campus.edu", label: "Cloud Lead" }]
  },
  {
    name: "Tanvi Deshmukh",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "Mobile app developer building cross-platform experiences in Flutter & Kotlin Multiplatform. Community coordinator and hackathon organizer.",
    skills: ["Flutter", "Dart", "Kotlin", "Firebase", "Android", "REST APIs", "Git", "Figma"],
    interestTags: ["mobile", "flutter", "apps", "android", "firebase", "ui/ux"],
    achievements: [
      { title: "Published 2 Production Apps on Google Play Store (10k+ downloads)", issuer: "Google Play Console", dateEarned: new Date("2025-06-25") }
    ],
    communityRoles: [{ email: "gdsc@campus.edu", label: "Mobile Coordinator" }]
  },

  // ── Cultural & Arts Prodigies ────────────────────────────────
  {
    name: "Vivaan Joshi",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Theatre director, actor, and General Secretary of Aarambh Theatre Club. Directing prize-winning street plays (Nukkad Natak) and stage proscenium productions.",
    skills: ["Theatre Direction", "Voice Modulation", "Scriptwriting", "Stage Presence", "Acting", "Video Editing"],
    interestTags: ["theatre", "drama", "acting", "filmmaking", "culture", "writing"],
    achievements: [
      { title: "Best Director & 1st Prize — Mood Indigo Nukkad Natak '25", issuer: "IIT Bombay", dateEarned: new Date("2025-12-28") },
      { title: "Best Script Award — Mumbai Inter-Collegiate Drama Fest", issuer: "Indian National Theatre", dateEarned: new Date("2025-03-15") }
    ],
    communityRoles: [{ email: "aarambh@campus.edu", label: "General Secretary" }]
  },
  {
    name: "Aditi Rane",
    gender: "female",
    branch: "Computer Engineering 2",
    yearOfJoining: 2023, // 4th Year
    bio: "Captain of Moksh Dance Crew. Professional western hip-hop & urban choreographer. Competing and winning collegiate dance championships across Mumbai.",
    skills: ["Hip-Hop Choreography", "Urban Dance", "Popping & Locking", "Team Leadership", "Stage Management"],
    interestTags: ["dance", "hiphop", "choreography", "performing-arts", "fitness", "music"],
    achievements: [
      { title: "Gold Trophy — Mumbai University Inter-Collegiate Dance Cup", issuer: "University of Mumbai", dateEarned: new Date("2025-02-20") }
    ],
    communityRoles: [{ email: "moksh@campus.edu", label: "Captain" }]
  },
  {
    name: "Arjun Menon",
    gender: "male",
    branch: "AI & Machine Learning",
    yearOfJoining: 2024, // 3rd Year
    bio: "Vocalist, songwriter, and lead guitarist at Music Club SIES GST. Blending Indian classical raga scales with modern acoustic indie rock.",
    skills: ["Acoustic Guitar", "Lead Vocals", "Music Production", "Logic Pro", "Audio Engineering", "Songwriting"],
    interestTags: ["music", "singing", "guitar", "audio-production", "band", "sound"],
    achievements: [
      { title: "Winner — SIES Idol Acoustic Showdown", issuer: "SIES GST Music Club", dateEarned: new Date("2025-04-10") }
    ],
    communityRoles: [{ email: "musicclub@campus.edu", label: "Club Head" }]
  },
  {
    name: "Diya Kulkarni",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2024, // 3rd Year
    bio: "Classical Bharatnatyam dancer & lead choreographer for Aagmi Folk Dance Crew. Passionate about regional Indian folk heritage and fusion arts.",
    skills: ["Bharatnatyam", "Folk Dance", "Choreography", "Stage Coordination", "Costume Design"],
    interestTags: ["folk-dance", "classical", "culture", "dance", "heritage", "performing-arts"],
    achievements: [
      { title: "Visharad in Bharatnatyam (Distinction)", issuer: "Gandharva Mahavidyalaya", dateEarned: new Date("2024-05-15") }
    ],
    communityRoles: [{ email: "aagmi@campus.edu", label: "Lead Choreographer" }]
  },

  // ── Hardware, Automotive & Mechanical ────────────────────────
  {
    name: "Yash Deshmukh",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Captain at SAE Student Chapter. Vehicle dynamics specialist, CAD modeler, and telemetry software developer for our national Baja ATV buggy.",
    skills: ["SolidWorks", "ANSYS", "Vehicle Dynamics", "CAN Bus", "Arduino", "MATLAB", "Telemetry"],
    interestTags: ["automotive", "baja", "mechanical", "cad", "hardware", "iot"],
    achievements: [
      { title: "National Rank 7 — Baja SAE India Drivetrain Design", issuer: "SAE India", dateEarned: new Date("2025-01-22") }
    ],
    communityRoles: [{ email: "sae@campus.edu", label: "Team Captain" }]
  },
  {
    name: "Kabir Shah",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2024, // 3rd Year
    bio: "President at ISHRAE Chapter. Green energy advocate, IoT sensor telemetry developer, and sustainable HVAC automation specialist.",
    skills: ["IoT Systems", "Embedded C", "Microcontrollers", "HVAC Design", "Python", "MQTT", "Grafana"],
    interestTags: ["hvac", "sustainability", "iot", "green-energy", "sensors", "hardware"],
    achievements: [
      { title: "1st Prize — National Sustainable Energy Design Challenge", issuer: "ISHRAE Mumbai Chapter", dateEarned: new Date("2025-08-30") }
    ],
    communityRoles: [{ email: "ishrae@campus.edu", label: "President" }]
  },
  {
    name: "Ishaan Verma",
    gender: "male",
    branch: "Information Technology 2",
    yearOfJoining: 2023, // 4th Year
    bio: "President of E-Cell SIES GST. Founder of an early-stage B2B SaaS startup. Passionate about product management, venture capital, and venture creation.",
    skills: ["Product Management", "Financial Modeling", "Pitch Decks", "Business Strategy", "Go-To-Market", "React"],
    interestTags: ["startups", "entrepreneurship", "venture-capital", "product", "business", "fintech"],
    achievements: [
      { title: "Top 3 Finalist — Eureka! Asia's Largest Business Model Competition", issuer: "E-Cell IIT Bombay", dateEarned: new Date("2025-02-12") }
    ],
    communityRoles: [{ email: "ecell@campus.edu", label: "President" }]
  },
  {
    name: "Siddhesh Wagh",
    gender: "male",
    branch: "Computer Engineering 3",
    yearOfJoining: 2024, // 3rd Year
    bio: "Sports Secretary at Tech Council & collegiate turf futsal captain. Backend developer passionate about high-concurrency Go microservices.",
    skills: ["Go", "PostgreSQL", "Redis", "Futsal", "Team Strategy", "Docker", "REST APIs"],
    interestTags: ["sports", "futsal", "cricket", "golang", "backend", "databases"],
    achievements: [
      { title: "Champion — Mumbai Inter-Collegiate Futsal Tournament", issuer: "Mumbai University Sports Board", dateEarned: new Date("2025-11-15") }
    ],
    communityRoles: [{ email: "siesiet@gmail.com", label: "Sports Secretary" }]
  },

  // ── Strategy, Media & Public Speaking ────────────────────────
  {
    name: "Natasha Fernandes",
    gender: "female",
    branch: "Computer Engineering 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "FIDE-rated chess player and Secretary of the Campus Chess Club. Also builds chess-engine analysis tools on the side using Stockfish bindings.",
    skills: ["Chess Strategy", "Python", "Stockfish API", "Opening Theory", "Event Coordination"],
    interestTags: ["chess", "strategy-games", "python", "boardgames", "esports"],
    achievements: [
      { title: "Runner-Up — Mumbai University Inter-Collegiate Chess Championship", issuer: "University of Mumbai", dateEarned: new Date("2025-09-05") }
    ],
    communityRoles: [{ email: "chess@campus.edu", label: "Secretary" }]
  },
  {
    name: "Aman Chauhan",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2023, // 4th Year
    bio: "President of the Finance & Investment Club. Runs a student equity research desk and mock trading simulations; interned as a junior analyst last summer.",
    skills: ["Financial Modeling", "Equity Research", "Excel", "Valuation", "Public Speaking", "Python"],
    interestTags: ["finance", "investing", "stockmarket", "economics", "fintech"],
    achievements: [
      { title: "Winner — Zerodha Varsity Campus Trading Challenge", issuer: "Zerodha", dateEarned: new Date("2025-06-18") }
    ],
    communityRoles: [{ email: "financeclub@campus.edu", label: "President" }]
  },
  {
    name: "Riya Kapoor",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2024, // 3rd Year
    bio: "Street and portrait photographer, Creative Head of the Photography Club. Shoots and edits event coverage for every major campus fest.",
    skills: ["Photography", "Lightroom", "Photoshop", "Adobe Premiere Pro", "Composition", "Event Coverage"],
    interestTags: ["photography", "visualarts", "editing", "filmmaking", "creativity"],
    achievements: [
      { title: "Best Photo Story — Mood Indigo Lens Fest 2025", issuer: "IIT Bombay", dateEarned: new Date("2025-12-29") }
    ],
    communityRoles: [{ email: "photographyclub@campus.edu", label: "Creative Head" }]
  },
  {
    name: "Karan Bhatia",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Secretary-General of the Model United Nations Society. Three-time Best Delegate awardee, now mentoring first-years on parliamentary procedure and diplomacy.",
    skills: ["Public Speaking", "Diplomacy", "Research", "Negotiation", "Policy Writing"],
    interestTags: ["mun", "debate", "diplomacy", "publicspeaking", "geopolitics"],
    achievements: [
      { title: "Best Delegate — SIES MUN 2025", issuer: "SIES MUN Society", dateEarned: new Date("2025-08-22") },
      { title: "Best Delegate — Christ University MUN", issuer: "Christ University Bangalore", dateEarned: new Date("2025-01-30") }
    ],
    communityRoles: [{ email: "mun@campus.edu", label: "Secretary-General" }]
  },
  {
    name: "Zoya Sheikh",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "Captain of the Campus Quiz Club. Loves general knowledge, pop culture trivia, and setting quizzes for inter-collegiate fests.",
    skills: ["Quizzing", "Research", "Trivia Curation", "Hosting", "Team Management"],
    interestTags: ["quizzing", "trivia", "generalknowledge", "hosting", "culture"],
    achievements: [
      { title: "Winner — Mumbai Collegiate Quiz League", issuer: "Quiz Club Mumbai", dateEarned: new Date("2025-10-09") }
    ],
    communityRoles: [{ email: "quizclub@campus.edu", label: "Captain" }]
  },

  // ── Athletics & Team Sports ───────────────────────────────────
  {
    name: "Vedant Pandey",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2024, // 3rd Year
    bio: "Point guard and Vice-Captain of the men's basketball team. Balances match practice with backend work on blockchain settlement systems.",
    skills: ["Basketball Strategy", "Solidity", "Team Leadership", "Fitness Training", "Node.js"],
    interestTags: ["basketball", "sports", "blockchain", "fitness", "teamwork"],
    achievements: [
      { title: "Semifinalist — Mumbai University Basketball League", issuer: "University of Mumbai", dateEarned: new Date("2025-11-02") }
    ],
    communityRoles: [{ email: "basketballclub@campus.edu", label: "Vice-Captain" }]
  },
  {
    name: "Isha Choudhury",
    gender: "female",
    branch: "Computer Engineering 3",
    yearOfJoining: 2025, // 2nd Year
    bio: "State-level badminton player representing the college in university tournaments. Also volunteers as a fitness and nutrition peer coach.",
    skills: ["Badminton", "Footwork Drills", "Sports Nutrition", "Discipline", "Coaching"],
    interestTags: ["badminton", "sports", "fitness", "nutrition", "coaching"],
    achievements: [
      { title: "Bronze Medal — Maharashtra State University Badminton Championship", issuer: "Maharashtra University Sports Association", dateEarned: new Date("2025-04-27") }
    ],
    communityRoles: [{ email: "badmintonclub@campus.edu", label: "Team Member" }]
  },
  {
    name: "Farhan Ansari",
    gender: "male",
    branch: "AI & Machine Learning",
    yearOfJoining: 2023, // 4th Year
    bio: "Competitive swimmer turned open-water enthusiast. Captains the swim team and studies applied ML for athletic performance tracking.",
    skills: ["Swimming", "Endurance Training", "Python", "Wearable Data Analysis", "Team Captaincy"],
    interestTags: ["swimming", "sports", "sportsanalytics", "fitness", "ai"],
    achievements: [
      { title: "Gold — 200m Freestyle, Mumbai University Aquatics Meet", issuer: "University of Mumbai", dateEarned: new Date("2025-03-08") }
    ],
    communityRoles: [{ email: "swimclub@campus.edu", label: "Captain" }]
  },
  {
    name: "Tanya Saxena",
    gender: "female",
    branch: "Information Technology 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "All-rounder on the women's cricket team and Sports Council member. Off the field, works on sports-analytics dashboards for the club.",
    skills: ["Cricket", "Team Strategy", "Data Visualization", "PowerBI", "Leadership"],
    interestTags: ["cricket", "sports", "analytics", "leadership", "teamwork"],
    achievements: [
      { title: "Player of the Series — Inter-Collegiate Women's Cricket Cup", issuer: "Mumbai University Sports Board", dateEarned: new Date("2025-02-16") }
    ],
    communityRoles: [{ email: "cricketclub@campus.edu", label: "All-Rounder" }]
  },
  {
    name: "Gaurav Venkatesh",
    gender: "male",
    branch: "Computer Engineering 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Striker and vice-captain of the football team, chasing a hat-trick season. Also maintains the club's match-stats tracker web app.",
    skills: ["Football Tactics", "React", "Firebase", "Sports Statistics", "Leadership"],
    interestTags: ["football", "sports", "webdev", "statistics", "teamwork"],
    achievements: [
      { title: "Top Scorer — SIES GST Inter-Departmental Football Cup", issuer: "SIES GST Sports Council", dateEarned: new Date("2025-09-14") }
    ],
    communityRoles: [{ email: "footballclub@campus.edu", label: "Vice-Captain" }]
  },

  // ── Emerging Tech & Social Impact ─────────────────────────────
  {
    name: "Rahul Sen",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2024, // 3rd Year
    bio: "Web3 builder shipping DeFi primitives and NFT ticketing systems. Core contributor to the campus Blockchain Society's testnet hackathon series.",
    skills: ["Solidity", "Hardhat", "Ethers.js", "Rust", "Smart Contracts", "React"],
    interestTags: ["web3", "blockchain", "defi", "smartcontracts", "hackathons"],
    achievements: [
      { title: "Winner — ETHIndia Campus Track", issuer: "ETHIndia", dateEarned: new Date("2025-12-07") }
    ],
    communityRoles: [{ email: "blockchainsociety@campus.edu", label: "Core Contributor" }]
  },
  {
    name: "Esha Banerjee",
    gender: "female",
    branch: "Computer Engineering 1",
    yearOfJoining: 2025, // 2nd Year
    bio: "Indie game developer building narrative-driven 2D titles in Godot and Unity. Runs weekly game-jam sessions for the campus GameDev Guild.",
    skills: ["Unity", "Godot", "C#", "Game Design", "Pixel Art", "GDScript"],
    interestTags: ["gamedev", "indiegames", "unity", "gamedesign", "pixelart"],
    achievements: [
      { title: "Best Narrative Design — Global Game Jam Mumbai 2026", issuer: "Global Game Jam", dateEarned: new Date("2026-01-25") }
    ],
    communityRoles: [{ email: "gamedevguild@campus.edu", label: "Organizer" }]
  },
  {
    name: "Nikhil Roy",
    gender: "male",
    branch: "Information Technology 2",
    yearOfJoining: 2023, // 4th Year
    bio: "Runs a 40k-subscriber tech YouTube channel reviewing dev tools and breaking down system design. Media Coordinator for the Tech Council.",
    skills: ["Video Editing", "DaVinci Resolve", "Scriptwriting", "System Design", "Public Speaking"],
    interestTags: ["contentcreation", "youtube", "techreview", "media", "systemdesign"],
    achievements: [
      { title: "Featured Creator — YouTube Campus Creator Spotlight", issuer: "YouTube India", dateEarned: new Date("2025-07-19") }
    ],
    communityRoles: [{ email: "techcouncil@campus.edu", label: "Media Coordinator" }]
  },
  {
    name: "Avani Tiwari",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2024, // 3rd Year
    bio: "AR/VR developer prototyping immersive campus-tour and lab-simulation experiences in Unity with Meta Quest SDKs.",
    skills: ["Unity", "ARCore", "Meta Quest SDK", "C#", "3D Modeling", "Blender"],
    interestTags: ["arvr", "immersivetech", "unity", "3dmodeling", "innovation"],
    achievements: [
      { title: "1st Prize — Immersive Tech Expo, Techxter '25", issuer: "SIES GST Tech Council", dateEarned: new Date("2025-10-19") }
    ],
    communityRoles: [{ email: "techcouncil@campus.edu", label: "AR/VR Lead" }]
  },
  {
    name: "Omkar Yadav",
    gender: "male",
    branch: "Computer Engineering 3",
    yearOfJoining: 2025, // 2nd Year
    bio: "Founder of the Green Campus Initiative — leads e-waste drives, rooftop composting, and a solar-monitoring IoT dashboard for the hostel block.",
    skills: ["IoT", "Arduino", "Sustainability Auditing", "Project Management", "Python"],
    interestTags: ["sustainability", "greentech", "iot", "socialimpact", "climate"],
    achievements: [
      { title: "Winner — Maharashtra Youth Climate Action Grant", issuer: "Maharashtra Pollution Control Board", dateEarned: new Date("2025-06-05") }
    ],
    communityRoles: [{ email: "greencampus@campus.edu", label: "Founder" }]
  },
  {
    name: "Bhavya Singh",
    gender: "female",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2023, // 4th Year
    bio: "Lead mechanical-electrical integrator for the Robotics Club's competition-bot team, wiring sensor arrays and tuning PID control loops.",
    skills: ["Embedded C", "PID Control", "Sensor Fusion", "Soldering", "ROS", "CAD"],
    interestTags: ["robotics", "hardware", "embedded", "competitions", "engineering"],
    achievements: [
      { title: "Finalist — Robocon India Regional Qualifiers", issuer: "IIT Bombay / ABU Robocon", dateEarned: new Date("2025-02-28") }
    ],
    communityRoles: [{ email: "roboticsclub@campus.edu", label: "Hardware Lead" }]
  },
  {
    name: "Chaitanya Hegde",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "President of the campus Toastmasters chapter. Coaches juniors on impromptu speaking and has delivered 30+ evaluated speeches.",
    skills: ["Public Speaking", "Impromptu Speaking", "Mentoring", "Storytelling", "Event Hosting"],
    interestTags: ["publicspeaking", "toastmasters", "communication", "leadership", "mentoring"],
    achievements: [
      { title: "Area Level Winner — Toastmasters International Speech Contest", issuer: "Toastmasters International District 91", dateEarned: new Date("2025-05-31") }
    ],
    communityRoles: [{ email: "toastmasters@campus.edu", label: "President" }]
  },
  {
    name: "Drishti Mahajan",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2023, // 4th Year
    bio: "Data engineer building ETL pipelines and warehouse models. Interned on a real-time analytics pipeline processing millions of events daily.",
    skills: ["Apache Spark", "Airflow", "SQL", "Python", "dbt", "AWS Redshift"],
    interestTags: ["dataengineering", "bigdata", "etl", "analytics", "cloud"],
    achievements: [
      { title: "Best Data Pipeline — Walmart Sparkathon Campus Round", issuer: "Walmart Global Tech", dateEarned: new Date("2025-08-09") }
    ],
    communityRoles: [{ email: "gdsc@campus.edu", label: "Data Engineering Lead" }]
  },

  // ── Literary, Media & Performing Arts ─────────────────────────
  {
    name: "Meher Chatterjee",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Poet and Editor-in-Chief of the campus literary magazine. Performs at open-mic circuits across Mumbai and is compiling her first anthology.",
    skills: ["Creative Writing", "Poetry", "Editing", "Spoken Word", "InDesign"],
    interestTags: ["poetry", "creativewriting", "literature", "spokenword", "publishing"],
    achievements: [
      { title: "Winner — Kommune Spoken Word Slam Mumbai", issuer: "Kommune India", dateEarned: new Date("2025-07-27") }
    ],
    communityRoles: [{ email: "literaryclub@campus.edu", label: "Editor-in-Chief" }]
  },
  {
    name: "Rutuja Pawar",
    gender: "female",
    branch: "Computer Engineering 1",
    yearOfJoining: 2025, // 2nd Year
    bio: "Editor of the campus newspaper, breaking stories on student governance and campus life. Trained in investigative reporting and page layout.",
    skills: ["Journalism", "Investigative Reporting", "Interviewing", "Adobe InDesign", "Fact-Checking"],
    interestTags: ["journalism", "media", "writing", "reporting", "campusnews"],
    achievements: [
      { title: "Best Campus Publication Award — Mumbai Collegiate Press Meet", issuer: "Mumbai Press Club", dateEarned: new Date("2025-11-21") }
    ],
    communityRoles: [{ email: "journalismclub@campus.edu", label: "Editor" }]
  },
  {
    name: "Aryan Kohli",
    gender: "male",
    branch: "Computer Engineering 2",
    yearOfJoining: 2023, // 4th Year
    bio: "Filmmaker directing short documentaries on campus life and Mumbai's street culture. President of the Film Society, runs the annual short-film fest.",
    skills: ["Cinematography", "DaVinci Resolve", "Screenwriting", "Directing", "Sound Design"],
    interestTags: ["filmmaking", "documentary", "cinematography", "storytelling", "media"],
    achievements: [
      { title: "Best Documentary — Mumbai University Short Film Festival", issuer: "University of Mumbai", dateEarned: new Date("2025-03-22") }
    ],
    communityRoles: [{ email: "filmclub@campus.edu", label: "President" }]
  },
  {
    name: "Ira Deshpande",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2025, // 2nd Year
    bio: "Painter and mixed-media artist leading the Fine Arts Circle. Exhibits work themed around technology and human memory at campus art walks.",
    skills: ["Acrylic Painting", "Mixed Media", "Digital Illustration", "Procreate", "Curation"],
    interestTags: ["painting", "fineart", "illustration", "exhibitions", "creativity"],
    achievements: [
      { title: "Featured Artist — Kala Ghoda Student Art Showcase", issuer: "Kala Ghoda Association", dateEarned: new Date("2026-02-08") }
    ],
    communityRoles: [{ email: "finearts@campus.edu", label: "Circle Lead" }]
  },
  {
    name: "Simran Kaur",
    gender: "female",
    branch: "Information Technology 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Fashion design lead sketching and stitching outfits for the annual college fashion show. Runs a small sustainable-upcycling clothing label on Instagram.",
    skills: ["Fashion Design", "Pattern Making", "Textile Sourcing", "Sketching", "Sustainable Fashion"],
    interestTags: ["fashion", "design", "sustainability", "styling", "creativity"],
    achievements: [
      { title: "Best Collection — SIES GST Annual Fashion Extravaganza", issuer: "SIES GST Cultural Committee", dateEarned: new Date("2025-12-19") }
    ],
    communityRoles: [{ email: "fashionclub@campus.edu", label: "Design Lead" }]
  },
  {
    name: "Rehan Sheikh",
    gender: "male",
    branch: "Computer Engineering 3",
    yearOfJoining: 2024, // 3rd Year
    bio: "Head chef of the Culinary Club, hosting monthly pop-up food stalls and MasterChef-style cook-offs to fund campus charity drives.",
    skills: ["Culinary Arts", "Event Catering", "Recipe Development", "Food Styling", "Team Coordination"],
    interestTags: ["culinary", "food", "cooking", "events", "hospitality"],
    achievements: [
      { title: "Winner — Inter-Collegiate MasterChef Challenge", issuer: "Mumbai Culinary Collective", dateEarned: new Date("2025-09-13") }
    ],
    communityRoles: [{ email: "culinaryclub@campus.edu", label: "Head Chef" }]
  },
  {
    name: "Yuvika Malhotra",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2023, // 4th Year
    bio: "Stand-up comedian and Improv Club president. Writes campus-life satire sets and hosts the college's monthly open-mic comedy night.",
    skills: ["Stand-Up Comedy", "Improv", "Scriptwriting", "Hosting", "Audience Engagement"],
    interestTags: ["comedy", "standup", "improv", "hosting", "entertainment"],
    achievements: [
      { title: "Winner — Canvas Laugh Club Campus Open Mic", issuer: "Canvas Laugh Club", dateEarned: new Date("2025-05-17") }
    ],
    communityRoles: [{ email: "comedyclub@campus.edu", label: "President" }]
  },
  {
    name: "Advika Rathore",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "Bedroom producer and DJ spinning house and Indie-electronic sets at campus fests. Also engineers audio for the Music Club's recording sessions.",
    skills: ["Ableton Live", "DJing", "Sound Engineering", "Music Production", "Mixing & Mastering"],
    interestTags: ["djing", "musicproduction", "electronicmusic", "audioengineering", "events"],
    achievements: [
      { title: "Headliner Set — SIES GST Sundowner Music Fest", issuer: "SIES GST Cultural Committee", dateEarned: new Date("2025-11-08") }
    ],
    communityRoles: [{ email: "musicproduction@campus.edu", label: "Resident DJ" }]
  },
  {
    name: "Om Prakash Nair",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Tabla player and secretary of the Indian Classical Music Ensemble, performing fusion sets that blend classical taal with live-coded electronic beats.",
    skills: ["Tabla", "Rhythm Composition", "Ableton Live", "Classical Music Theory", "Ensemble Direction"],
    interestTags: ["classicalmusic", "tabla", "fusion", "music", "culture"],
    achievements: [
      { title: "1st Prize — Sur Singar Inter-Collegiate Classical Music Competition", issuer: "Mumbai University Cultural Board", dateEarned: new Date("2025-02-01") }
    ],
    communityRoles: [{ email: "classicalmusic@campus.edu", label: "Secretary" }]
  },

  // ── Sports, Fitness & Adventure ────────────────────────────────
  {
    name: "Reyansh Kulkarni",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2025, // 2nd Year
    bio: "Table tennis singles champion representing the college at zonal and university tournaments; trains juniors every Sunday at the sports complex.",
    skills: ["Table Tennis", "Reflex Training", "Match Strategy", "Coaching", "Discipline"],
    interestTags: ["tabletennis", "sports", "coaching", "fitness", "competitions"],
    achievements: [
      { title: "Gold Medal — Mumbai University Zonal Table Tennis Championship", issuer: "University of Mumbai", dateEarned: new Date("2025-10-03") }
    ],
    communityRoles: [{ email: "tabletennisclub@campus.edu", label: "Team Captain" }]
  },
  {
    name: "Anvi Bhosale",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2024, // 3rd Year
    bio: "Setter and captain of the women's volleyball team, leading a squad that made it to the university semifinals for the first time in a decade.",
    skills: ["Volleyball", "Team Captaincy", "Match Analysis", "Fitness Coaching", "Strategy"],
    interestTags: ["volleyball", "sports", "leadership", "fitness", "teamwork"],
    achievements: [
      { title: "Semifinalist — Mumbai University Women's Volleyball League", issuer: "University of Mumbai", dateEarned: new Date("2025-12-11") }
    ],
    communityRoles: [{ email: "volleyballclub@campus.edu", label: "Captain" }]
  },
  {
    name: "Dev Ahluwalia",
    gender: "male",
    branch: "Computer Engineering 2",
    yearOfJoining: 2023, // 4th Year
    bio: "Sprinter on the athletics team clocking sub-11-second 100m runs. Studies biomechanics data from wearables to shave off fractions of a second.",
    skills: ["Sprinting", "Biomechanics", "Wearable Data Analysis", "Strength Training", "Python"],
    interestTags: ["athletics", "sprinting", "sports", "biomechanics", "fitness"],
    achievements: [
      { title: "Gold — 100m Sprint, Mumbai University Athletics Meet", issuer: "University of Mumbai", dateEarned: new Date("2025-01-19") }
    ],
    communityRoles: [{ email: "athleticsclub@campus.edu", label: "Team Member" }]
  },
  {
    name: "Kiara D'Souza",
    gender: "female",
    branch: "Information Technology 1",
    yearOfJoining: 2025, // 2nd Year
    bio: "Black-belt Taekwondo practitioner and self-defense workshop coordinator, teaching free weekend classes for women on campus.",
    skills: ["Taekwondo", "Self-Defense Training", "Discipline", "Workshop Facilitation", "First Aid"],
    interestTags: ["martialarts", "taekwondo", "selfdefense", "fitness", "safety"],
    achievements: [
      { title: "Gold Medal — State Taekwondo Poomsae Championship", issuer: "Maharashtra Taekwondo Association", dateEarned: new Date("2025-06-29") }
    ],
    communityRoles: [{ email: "martialarts@campus.edu", label: "Workshop Coordinator" }]
  },
  {
    name: "Anahita Rao",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2024, // 3rd Year
    bio: "Certified yoga instructor running free sunrise sessions before lectures. Studies the physiological effects of mindfulness on exam-season stress.",
    skills: ["Yoga Instruction", "Mindfulness Coaching", "Anatomy", "Wellness Programming", "Public Speaking"],
    interestTags: ["yoga", "wellness", "mindfulness", "fitness", "mentalhealth"],
    achievements: [
      { title: "200-Hour Yoga Teacher Training Certification", issuer: "Yoga Alliance International", dateEarned: new Date("2025-05-04") }
    ],
    communityRoles: [{ email: "yogaclub@campus.edu", label: "Instructor" }]
  },

  // ── Service, Civic & Social Impact ─────────────────────────────
  {
    name: "Cadet Aryan Thakur",
    gender: "male",
    branch: "Computer Engineering 3",
    yearOfJoining: 2023, // 4th Year
    bio: "Senior Under Officer in the NCC Naval Wing, leading drill parades and disaster-relief drills. Balances rigorous NCC camps with backend coursework.",
    skills: ["Leadership", "Drill Command", "Disaster Response", "Discipline", "Team Coordination"],
    interestTags: ["ncc", "leadership", "disciplinedservices", "disastermanagement", "civicduty"],
    achievements: [
      { title: "Best Cadet — NCC Republic Day Camp Contingent", issuer: "National Cadet Corps, Maharashtra Directorate", dateEarned: new Date("2026-01-26") }
    ],
    communityRoles: [{ email: "ncc@campus.edu", label: "Senior Under Officer" }]
  },
  {
    name: "Samaira Joshi",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "NSS volunteer coordinator organizing blood donation camps and rural literacy drives; logged over 300 hours of community service.",
    skills: ["Volunteer Coordination", "Public Health Outreach", "Event Planning", "Fundraising", "Teaching"],
    interestTags: ["nss", "socialservice", "volunteering", "publichealth", "community"],
    achievements: [
      { title: "Best NSS Volunteer of the Year", issuer: "Nehru Yuva Kendra Sangathan, Mumbai", dateEarned: new Date("2025-08-15") }
    ],
    communityRoles: [{ email: "nss@campus.edu", label: "Volunteer Coordinator" }]
  },
  {
    name: "Krishna Iyer",
    gender: "male",
    branch: "AI & Data Science",
    yearOfJoining: 2023, // 4th Year
    bio: "Moot Court Society convenor arguing constitutional law problems at national rounds; aspires to pair a tech background with legal-tech startups.",
    skills: ["Legal Research", "Oral Advocacy", "Drafting", "Constitutional Law", "Public Speaking"],
    interestTags: ["mootcourt", "law", "legaltech", "advocacy", "publicspeaking"],
    achievements: [
      { title: "Best Speaker — National Moot Court Competition, GLC Mumbai", issuer: "Government Law College Mumbai", dateEarned: new Date("2025-09-27") }
    ],
    communityRoles: [{ email: "mootcourt@campus.edu", label: "Convenor" }]
  },
  {
    name: "Vaishnavi Kamble",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2025, // 2nd Year
    bio: "Peer counsellor with the campus Psychology & Wellness Circle, running stress-management workshops and destigmatizing mental-health conversations.",
    skills: ["Active Listening", "Peer Counselling", "Workshop Design", "Research Methods", "Empathy"],
    interestTags: ["psychology", "mentalhealth", "wellness", "counselling", "peersupport"],
    achievements: [
      { title: "Certificate in Peer Support Facilitation", issuer: "iCall Psychosocial Helpline, TISS", dateEarned: new Date("2025-07-11") }
    ],
    communityRoles: [{ email: "psychclub@campus.edu", label: "Peer Counsellor" }]
  },

  // ── STEM Frontiers & Niche Tech ─────────────────────────────────
  {
    name: "Advaith Krishnan",
    gender: "male",
    branch: "AI & Data Science",
    yearOfJoining: 2024, // 3rd Year
    bio: "Amateur astronomer running the campus Astronomy Club's telescope nights, and building light-curve analysis pipelines for exoplanet transit data.",
    skills: ["Astrophysics", "Python", "Telescope Operation", "Data Analysis", "Astrophotography"],
    interestTags: ["astronomy", "astrophysics", "space", "python", "science"],
    achievements: [
      { title: "Finalist — ISRO AstroSat Student Data Challenge", issuer: "Indian Space Research Organisation", dateEarned: new Date("2025-04-05") }
    ],
    communityRoles: [{ email: "astronomyclub@campus.edu", label: "Telescope Lead" }]
  },
  {
    name: "Neel Choksi",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2025, // 2nd Year
    bio: "Mathematics Olympiad coach and president of the Math Circle, obsessed with combinatorics and number theory proofs.",
    skills: ["Combinatorics", "Number Theory", "Proof Writing", "Problem Setting", "Mentoring"],
    interestTags: ["mathematics", "olympiad", "combinatorics", "numbertheory", "mentoring"],
    achievements: [
      { title: "Gold Medal — Inter-Collegiate Mathematics Olympiad", issuer: "Ramanujan Mathematical Society", dateEarned: new Date("2025-03-30") }
    ],
    communityRoles: [{ email: "mathclub@campus.edu", label: "President" }]
  },
  {
    name: "Ridhima Vora",
    gender: "female",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2023, // 4th Year
    bio: "Bioinformatics researcher aligning protein-structure datasets with ML pipelines; co-authored a preprint on genomic variant classification.",
    skills: ["Python", "BioPython", "Genomics", "Machine Learning", "R", "Statistics"],
    interestTags: ["bioinformatics", "biotech", "genomics", "machinelearning", "research"],
    achievements: [
      { title: "Best Poster — National Bioinformatics Symposium", issuer: "Bioinformatics Society of India", dateEarned: new Date("2025-11-14") }
    ],
    communityRoles: [{ email: "biotechclub@campus.edu", label: "Research Lead" }]
  },
  {
    name: "Aryan Bafna",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Quantum computing enthusiast implementing variational algorithms on Qiskit simulators; runs the Quantum Study Circle's weekly reading group.",
    skills: ["Qiskit", "Linear Algebra", "Python", "Quantum Algorithms", "Research Writing"],
    interestTags: ["quantumcomputing", "qiskit", "physics", "research", "algorithms"],
    achievements: [
      { title: "Top 10 — IBM Quantum Challenge India", issuer: "IBM Quantum", dateEarned: new Date("2025-10-27") }
    ],
    communityRoles: [{ email: "quantumclub@campus.edu", label: "Study Circle Lead" }]
  },
  {
    name: "Nivedita Ghosh",
    gender: "female",
    branch: "Computer Engineering 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "Maintainer of the campus Free & Open Source Software group, running install-fests and contributing patches to a Linux desktop-environment project.",
    skills: ["Linux", "C", "Git", "Open Source Contribution", "Shell Scripting", "GTK"],
    interestTags: ["opensource", "linux", "foss", "programming", "community"],
    achievements: [
      { title: "Top Contributor — GNOME Outreachy Preparatory Cohort", issuer: "GNOME Foundation", dateEarned: new Date("2025-06-16") }
    ],
    communityRoles: [{ email: "foss@campus.edu", label: "Maintainer" }]
  },
  {
    name: "Reuben Pinto",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2024, // 3rd Year
    bio: "Builds and flies FPV racing drones, and prototypes autonomous delivery-drone navigation stacks for the Drone Technology Club.",
    skills: ["Drone Assembly", "FPV Piloting", "PX4/ArduPilot", "Embedded C", "Computer Vision"],
    interestTags: ["drones", "fpv", "robotics", "hardware", "autonomoussystems"],
    achievements: [
      { title: "Winner — Drone Racing League Campus Circuit", issuer: "Drone Federation of India", dateEarned: new Date("2025-12-20") }
    ],
    communityRoles: [{ email: "droneclub@campus.edu", label: "Technical Lead" }]
  },
  {
    name: "Tanish Oberoi",
    gender: "male",
    branch: "Computer Engineering 3",
    yearOfJoining: 2023, // 4th Year
    bio: "Makerspace coordinator running 3D-printing and laser-cutting workshops; prototypes assistive-tech devices for students with motor disabilities.",
    skills: ["3D Printing", "Fusion 360", "Laser Cutting", "Rapid Prototyping", "Assistive Tech Design"],
    interestTags: ["makerspace", "3dprinting", "prototyping", "assistivetech", "design"],
    achievements: [
      { title: "1st Prize — Assistive Technology Design Sprint", issuer: "IIT Bombay TechFest", dateEarned: new Date("2025-08-24") }
    ],
    communityRoles: [{ email: "makerspace@campus.edu", label: "Coordinator" }]
  },
  {
    name: "Diya Bhatt",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Aerodynamics lead on the Formula Student electric-vehicle team, running CFD simulations to trim drag on the car's bodywork.",
    skills: ["CFD Simulation", "SolidWorks", "Aerodynamics", "MATLAB", "Team Collaboration"],
    interestTags: ["formulastudent", "automotive", "aerodynamics", "engineering", "ev"],
    achievements: [
      { title: "Best Aero Package Award — Formula Bharat", issuer: "Formula Bharat", dateEarned: new Date("2026-01-18") }
    ],
    communityRoles: [{ email: "formulastudent@campus.edu", label: "Aero Lead" }]
  },
  {
    name: "Vihaan Salvi",
    gender: "male",
    branch: "AI & Data Science",
    yearOfJoining: 2025, // 2nd Year
    bio: "Ranked Valorant player and shot-caller for the campus Esports Society, also streams scrims and coaches the rookie roster.",
    skills: ["Esports Strategy", "Team Shot-Calling", "Streaming (OBS)", "VOD Review", "Coaching"],
    interestTags: ["esports", "gaming", "valorant", "streaming", "competitions"],
    achievements: [
      { title: "Champions — Skyesports Campus Clash Valorant Cup", issuer: "Skyesports", dateEarned: new Date("2025-09-07") }
    ],
    communityRoles: [{ email: "esportsclub@campus.edu", label: "Team Captain" }]
  },
  {
    name: "Mira Vaidya",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2023, // 4th Year
    bio: "Dungeon Master and founder of the Tabletop RPG Society, designing original D&D campaigns and running weekly game nights for 40+ regulars.",
    skills: ["Game Mastering", "Worldbuilding", "Narrative Design", "Event Organizing", "Improv"],
    interestTags: ["tabletoprpg", "dnd", "boardgames", "worldbuilding", "community"],
    achievements: [
      { title: "Best Original Campaign — India Tabletop Con", issuer: "India Tabletop Gaming Community", dateEarned: new Date("2025-11-30") }
    ],
    communityRoles: [{ email: "tabletopclub@campus.edu", label: "Founder" }]
  },
  {
    name: "Arnav Thackeray",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Producer and host of the SIES GST campus radio show, mixing tech-culture interviews with a weekly indie-music countdown.",
    skills: ["Audio Production", "Podcast Hosting", "Audacity", "Scriptwriting", "RSS/Distribution"],
    interestTags: ["podcasting", "radio", "audio", "media", "broadcasting"],
    achievements: [
      { title: "Best Campus Podcast — Mumbai Student Media Awards", issuer: "Mumbai Student Media Council", dateEarned: new Date("2025-10-16") }
    ],
    communityRoles: [{ email: "campusradio@campus.edu", label: "Producer & Host" }]
  },
  {
    name: "Saanvi Kelkar",
    gender: "female",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2025, // 2nd Year
    bio: "Polyglot running the Foreign Languages Circle's French and German conversation tables, preparing for a DELF certification alongside her coursework.",
    skills: ["French", "German", "Translation", "Cross-Cultural Communication", "Event Hosting"],
    interestTags: ["languages", "french", "german", "linguistics", "culture"],
    achievements: [
      { title: "DELF B2 Certification (French)", issuer: "Alliance Française de Bombay", dateEarned: new Date("2025-06-21") }
    ],
    communityRoles: [{ email: "languageclub@campus.edu", label: "Conversation Table Lead" }]
  },

  // ── Adventure, Water & Combat Sports ────────────────────────────
  {
    name: "Ojas Kelkar",
    gender: "male",
    branch: "AI & Data Science",
    yearOfJoining: 2024, // 3rd Year
    bio: "Captain of the Water Sports Club, training the campus kayaking crew for coastal-water regattas and running pool-safety certification drives.",
    skills: ["Kayaking", "Water Safety", "Endurance Training", "Team Captaincy", "Event Planning"],
    interestTags: ["watersports", "kayaking", "sports", "fitness", "outdoors"],
    achievements: [
      { title: "Bronze — Mumbai Coastal Kayaking Regatta", issuer: "Yachting Association of Maharashtra", dateEarned: new Date("2025-10-11") }
    ],
    communityRoles: [{ email: "watersportsclub@campus.edu", label: "Captain" }]
  },
  {
    name: "Anushka Bhide",
    gender: "female",
    branch: "Computer Engineering 3",
    yearOfJoining: 2025, // 2nd Year
    bio: "Flanker and vice-captain of the women's rugby team, one of the college's newest sports societies fighting for varsity recognition.",
    skills: ["Rugby", "Tackling Technique", "Team Strategy", "Fitness Conditioning", "Leadership"],
    interestTags: ["rugby", "sports", "fitness", "teamwork", "contactsports"],
    achievements: [
      { title: "Most Valuable Player — Mumbai Collegiate Rugby 7s", issuer: "Mumbai Rugby Football Union", dateEarned: new Date("2025-12-06") }
    ],
    communityRoles: [{ email: "rugbyclub@campus.edu", label: "Vice-Captain" }]
  },
  {
    name: "Rayaan Merchant",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Recurve archer representing the college at state meets, and secretary of the Archery Club, which he helped found in his first year.",
    skills: ["Archery", "Focus Training", "Equipment Tuning", "Coaching", "Discipline"],
    interestTags: ["archery", "sports", "precision", "fitness", "concentration"],
    achievements: [
      { title: "Silver Medal — Maharashtra State University Archery Meet", issuer: "Maharashtra Archery Association", dateEarned: new Date("2025-02-09") }
    ],
    communityRoles: [{ email: "archeryclub@campus.edu", label: "Secretary" }]
  },
  {
    name: "Ishika Thakkar",
    gender: "female",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2024, // 3rd Year
    bio: "Foil fencer and captain of the Fencing Club, drawn to the sport's blend of split-second tactics and footwork discipline.",
    skills: ["Fencing", "Footwork", "Tactical Awareness", "Reflex Training", "Team Captaincy"],
    interestTags: ["fencing", "sports", "combatsports", "discipline", "strategy"],
    achievements: [
      { title: "Gold — Foil Individual, Mumbai University Fencing Championship", issuer: "University of Mumbai", dateEarned: new Date("2025-11-23") }
    ],
    communityRoles: [{ email: "fencingclub@campus.edu", label: "Captain" }]
  },
  {
    name: "Neelesh Bora",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2025, // 2nd Year
    bio: "Squash player climbing the state junior rankings, splitting time between court drills and the Squash Club's fitness scouting programme.",
    skills: ["Squash", "Court Positioning", "Match Fitness", "Scouting", "Sports Analytics"],
    interestTags: ["squash", "sports", "fitness", "racketsports", "competitions"],
    achievements: [
      { title: "Quarterfinalist — Maharashtra State Junior Squash Championship", issuer: "Maharashtra Squash Rackets Association", dateEarned: new Date("2025-05-19") }
    ],
    communityRoles: [{ email: "squashclub@campus.edu", label: "Team Member" }]
  },
  {
    name: "Radhika Sane",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2023, // 4th Year
    bio: "President of the Cycling Club, organizing weekend century rides and a campus bicycle-repair co-op that fixes rides for free.",
    skills: ["Endurance Cycling", "Bike Maintenance", "Route Planning", "Community Organizing", "Fitness Coaching"],
    interestTags: ["cycling", "fitness", "sustainability", "outdoors", "community"],
    achievements: [
      { title: "Finisher — Mumbai Cyclothon 160km Ultra Category", issuer: "Times of India Mumbai Cyclothon", dateEarned: new Date("2025-12-14") }
    ],
    communityRoles: [{ email: "cyclingclub@campus.edu", label: "President" }]
  },
  {
    name: "Yug Trivedi",
    gender: "male",
    branch: "Information Technology 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Trip lead for the Trekking & Mountaineering Club, having summited three Sahyadri forts and led a basic mountaineering course cohort.",
    skills: ["Trekking Logistics", "Navigation", "Wilderness First Aid", "Risk Assessment", "Leadership"],
    interestTags: ["trekking", "mountaineering", "outdoors", "adventure", "leadership"],
    achievements: [
      { title: "Basic Mountaineering Course — Distinction Grade", issuer: "Nehru Institute of Mountaineering", dateEarned: new Date("2025-06-30") }
    ],
    communityRoles: [{ email: "trekkingclub@campus.edu", label: "Trip Lead" }]
  },
  {
    name: "Samiksha Ranade",
    gender: "female",
    branch: "Computer Engineering 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "Bouldering enthusiast and founder of the campus Rock Climbing Club, coordinating weekend trips to Sahyadri crags for beginners.",
    skills: ["Bouldering", "Lead Climbing", "Belaying", "Route Setting", "Risk Management"],
    interestTags: ["rockclimbing", "bouldering", "outdoors", "adventure", "fitness"],
    achievements: [
      { title: "Winner — Women's Open Category, Mumbai Bouldering League", issuer: "Indian Mountaineering Foundation", dateEarned: new Date("2025-09-21") }
    ],
    communityRoles: [{ email: "climbingclub@campus.edu", label: "Founder" }]
  },
  {
    name: "Armaan Contractor",
    gender: "male",
    branch: "AI & Data Science",
    yearOfJoining: 2023, // 4th Year
    bio: "Handler and captain of the Ultimate Frisbee team, championing the sport's spirit-of-the-game ethos across Mumbai's college circuit.",
    skills: ["Ultimate Frisbee", "Disc Throwing", "Team Strategy", "Sportsmanship", "Fitness Coaching"],
    interestTags: ["ultimatefrisbee", "sports", "fitness", "teamwork", "outdoors"],
    achievements: [
      { title: "Champions — Mumbai Ultimate Frisbee Collegiate League", issuer: "UPAI (Ultimate Players Association of India)", dateEarned: new Date("2025-01-12") }
    ],
    communityRoles: [{ email: "frisbeeclub@campus.edu", label: "Captain" }]
  },
  {
    name: "Trisha Kolhatkar",
    gender: "female",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2024, // 3rd Year
    bio: "Competitive powerlifter and founder of the Strength Sports Circle, coaching a growing cohort of women new to the campus gym.",
    skills: ["Powerlifting", "Strength Programming", "Coaching", "Nutrition Planning", "Form Correction"],
    interestTags: ["powerlifting", "strengthtraining", "fitness", "coaching", "gym"],
    achievements: [
      { title: "State Record — 63kg Category Deadlift, Maharashtra Powerlifting Championship", issuer: "Powerlifting Association of Maharashtra", dateEarned: new Date("2025-08-03") }
    ],
    communityRoles: [{ email: "strengthclub@campus.edu", label: "Founder" }]
  },

  // ── Craft, Movement & Niche Creative Arts ───────────────────────
  {
    name: "Naina Bhagwat",
    gender: "female",
    branch: "Computer Engineering 3",
    yearOfJoining: 2025, // 2nd Year
    bio: "Contemporary and ballet-trained dancer leading the Movement Arts Collective's experimental pieces blending classical ballet lines with modern choreography.",
    skills: ["Contemporary Dance", "Ballet Technique", "Choreography", "Stage Direction", "Improvisation"],
    interestTags: ["contemporarydance", "ballet", "choreography", "performingarts", "movement"],
    achievements: [
      { title: "Best Choreography — Mumbai Contemporary Dance Intercollegiate", issuer: "Danceworx Performing Arts Academy", dateEarned: new Date("2025-11-16") }
    ],
    communityRoles: [{ email: "movementarts@campus.edu", label: "Artistic Director" }]
  },
  {
    name: "Rishabh Talwar",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Beatboxer and founder of the a cappella crew Vocal Circuit, arranging voice-only covers that layer beatbox loops under harmonized vocals.",
    skills: ["Beatboxing", "Vocal Arrangement", "Looping", "Harmony", "Live Performance"],
    interestTags: ["beatboxing", "acappella", "music", "vocals", "performance"],
    achievements: [
      { title: "Winner — All India Beatbox Championship, College Circuit", issuer: "Indian Beatbox Community", dateEarned: new Date("2025-07-05") }
    ],
    communityRoles: [{ email: "vocalcircuit@campus.edu", label: "Founder" }]
  },
  {
    name: "Ahana Sarin",
    gender: "female",
    branch: "Computer Engineering 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Modern calligrapher and lettering artist selling commissioned wedding invites and campus-event signage under her own small studio.",
    skills: ["Calligraphy", "Hand Lettering", "Brush Pen Art", "Procreate", "Small Business Management"],
    interestTags: ["calligraphy", "lettering", "handmadeart", "design", "smallbusiness"],
    achievements: [
      { title: "Featured Artist — Chalk & Ink Calligraphy Fair, Mumbai", issuer: "Chalk & Ink Collective", dateEarned: new Date("2025-03-02") }
    ],
    communityRoles: [{ email: "artscircle@campus.edu", label: "Calligraphy Lead" }]
  },
  {
    name: "Yashraj Bhalerao",
    gender: "male",
    branch: "AI & Machine Learning",
    yearOfJoining: 2025, // 2nd Year
    bio: "Potter running the campus Ceramics Studio's open-wheel sessions, glazing functional stoneware sold at the annual craft mela to fund studio clay.",
    skills: ["Wheel Throwing", "Glazing", "Kiln Firing", "Studio Management", "Handbuilding"],
    interestTags: ["pottery", "ceramics", "craft", "handmade", "art"],
    achievements: [
      { title: "Best Functional Ware — SIES GST Craft Mela", issuer: "SIES GST Cultural Committee", dateEarned: new Date("2025-10-25") }
    ],
    communityRoles: [{ email: "ceramicsstudio@campus.edu", label: "Studio Coordinator" }]
  },
  {
    name: "Ivana Pereira",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2023, // 4th Year
    bio: "2D/3D animator producing short animated shorts in Blender and After Effects; leads the Animation Guild's annual 48-hour animation jam.",
    skills: ["Blender", "After Effects", "2D Animation", "Character Rigging", "Storyboarding"],
    interestTags: ["animation", "blender", "motiongraphics", "storytelling", "digitalart"],
    achievements: [
      { title: "Best Short Film — India Student Animation Awards", issuer: "Animation Society of India", dateEarned: new Date("2025-09-30") }
    ],
    communityRoles: [{ email: "animationguild@campus.edu", label: "Guild Lead" }]
  },
  {
    name: "Kartik Suryavanshi",
    gender: "male",
    branch: "Computer Engineering 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Muralist repainting the college's boundary walls and subway underpasses with the Street Art Collective, blending social themes with bold typography.",
    skills: ["Mural Painting", "Spray Art", "Typography", "Stencil Cutting", "Public Art Permissions"],
    interestTags: ["streetart", "mural", "publicart", "graffiti", "visualarts"],
    achievements: [
      { title: "Public Art Grant — Mumbai Street Art Festival", issuer: "St+art India Foundation", dateEarned: new Date("2026-02-01") }
    ],
    communityRoles: [{ email: "streetartcollective@campus.edu", label: "Lead Muralist" }]
  },

  // ── Radio, Nature & Frontier Science ─────────────────────────────
  {
    name: "Manasi Ketkar",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2025, // 2nd Year
    bio: "Licensed amateur radio operator running the campus HAM Radio Club's emergency-communication drills and satellite ground-station experiments.",
    skills: ["Amateur Radio Operation", "RF Circuits", "Morse Code", "Emergency Comms", "Antenna Building"],
    interestTags: ["hamradio", "rf", "electronics", "emergencycomms", "radio"],
    achievements: [
      { title: "Amateur Station Operator's Certificate", issuer: "Wireless Planning & Coordination Wing, DoT", dateEarned: new Date("2025-04-14") }
    ],
    communityRoles: [{ email: "hamradioclub@campus.edu", label: "Station Operator" }]
  },
  {
    name: "Devrat Solanki",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2023, // 4th Year
    bio: "Birdwatcher and founder of the Wildlife Conservation Circle, running monthly Sanjay Gandhi National Park bird counts and campus biodiversity surveys.",
    skills: ["Bird Identification", "Field Surveying", "Citizen Science", "Photography", "Conservation Advocacy"],
    interestTags: ["birdwatching", "wildlife", "conservation", "nature", "biodiversity"],
    achievements: [
      { title: "Top Contributor — eBird India Great Backyard Bird Count", issuer: "Bombay Natural History Society", dateEarned: new Date("2026-02-15") }
    ],
    communityRoles: [{ email: "wildlifecircle@campus.edu", label: "Founder" }]
  },
  {
    name: "Aaradhya Phadke",
    gender: "female",
    branch: "Computer Engineering 3",
    yearOfJoining: 2024, // 3rd Year
    bio: "Runs the campus Urban Farming Society's rooftop vegetable beds and a hydroponics pilot, donating produce to the hostel mess kitchen.",
    skills: ["Urban Farming", "Hydroponics", "Composting", "Soil Science", "Volunteer Coordination"],
    interestTags: ["urbanfarming", "gardening", "hydroponics", "sustainability", "foodsecurity"],
    achievements: [
      { title: "Best Campus Sustainability Project — Maharashtra Green Campus Awards", issuer: "Maharashtra State Biodiversity Board", dateEarned: new Date("2025-11-05") }
    ],
    communityRoles: [{ email: "urbanfarming@campus.edu", label: "Project Lead" }]
  },
  {
    name: "Sarthak Bapat",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2025, // 2nd Year
    bio: "Runs the campus Meteorology Club's weather station, publishing daily microclimate forecasts and monsoon-onset predictions for the college.",
    skills: ["Weather Forecasting", "Data Logging", "Python", "Statistical Modeling", "Sensor Calibration"],
    interestTags: ["meteorology", "weather", "climatescience", "dataanalysis", "science"],
    achievements: [
      { title: "Best Student Forecast Model — India Meteorological Department Student Challenge", issuer: "India Meteorological Department", dateEarned: new Date("2025-06-10") }
    ],
    communityRoles: [{ email: "meteorologyclub@campus.edu", label: "Station Chief" }]
  },
  {
    name: "Prisha Athalye",
    gender: "female",
    branch: "AI & Machine Learning",
    yearOfJoining: 2023, // 4th Year
    bio: "Payload lead on the college's CanSat team, designing miniaturized satellite sensors for a national student space-launch competition.",
    skills: ["CanSat Design", "Embedded Systems", "Telemetry", "PCB Design", "Systems Engineering"],
    interestTags: ["cansat", "spacetech", "satellites", "embedded", "engineering"],
    achievements: [
      { title: "2nd Place — Indian CanSat Student Competition", issuer: "Indian Institute of Space Science and Technology", dateEarned: new Date("2025-05-27") }
    ],
    communityRoles: [{ email: "spacetechclub@campus.edu", label: "Payload Lead" }]
  },
  {
    name: "Rudra Vaishnav",
    gender: "male",
    branch: "Computer Engineering 1",
    yearOfJoining: 2024, // 3rd Year
    bio: "Builds autonomous underwater vehicles for the Underwater Robotics Team, tuning ballast and vision-guided navigation for pool trial runs.",
    skills: ["Underwater Robotics", "ROS", "Computer Vision", "Waterproofing Design", "C++"],
    interestTags: ["underwaterrobotics", "auv", "robotics", "engineering", "autonomoussystems"],
    achievements: [
      { title: "Finalist — SAUVC Singapore AUV Challenge, India Qualifiers", issuer: "Singapore AUV Challenge", dateEarned: new Date("2025-12-02") }
    ],
    communityRoles: [{ email: "underwaterrobotics@campus.edu", label: "Systems Lead" }]
  },
  {
    name: "Sanika Gokhale",
    gender: "female",
    branch: "Information Technology 2",
    yearOfJoining: 2025, // 2nd Year
    bio: "Powertrain engineer on the Formula SAE combustion team, tuning fuel maps and gearbox ratios for the car's endurance run.",
    skills: ["Engine Tuning", "Powertrain Design", "MATLAB", "Data Acquisition", "Mechanical CAD"],
    interestTags: ["formulasae", "automotive", "powertrain", "motorsport", "engineering"],
    achievements: [
      { title: "Best Powertrain Design Award — Formula SAE India", issuer: "SAE India", dateEarned: new Date("2026-01-30") }
    ],
    communityRoles: [{ email: "formulasaeclub@campus.edu", label: "Powertrain Lead" }]
  },
  {
    name: "Yashvi Oswal",
    gender: "female",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2023, // 4th Year
    bio: "Strategy programmer on the RoboCup soccer-robotics squad, writing multi-agent path-planning code for the small-size league bots.",
    skills: ["Multi-Agent Systems", "Path Planning", "Python", "Robot Operating System", "Game Theory"],
    interestTags: ["robocup", "robotics", "multiagentsystems", "ai", "competitions"],
    achievements: [
      { title: "Top 8 — RoboCup Asia-Pacific Small Size League", issuer: "RoboCup Federation", dateEarned: new Date("2025-08-18") }
    ],
    communityRoles: [{ email: "robocupteam@campus.edu", label: "Strategy Lead" }]
  },

  // ── Civic Craft, Hospitality & Everyday Culture ──────────────────
  {
    name: "Aftab Sayyed",
    gender: "male",
    branch: "Computer Engineering 2",
    yearOfJoining: 2024, // 3rd Year
    bio: "Runs free Indian Sign Language classes through the Accessibility Advocacy Circle and is building a campus-navigation app for hearing-impaired students.",
    skills: ["Indian Sign Language", "Accessibility Design", "React Native", "Workshop Facilitation", "Inclusive Design"],
    interestTags: ["signlanguage", "accessibility", "inclusion", "advocacy", "socialimpact"],
    achievements: [
      { title: "Best Inclusive Tech Project — National Accessibility Hackathon", issuer: "Barrier Break Technology Solutions", dateEarned: new Date("2025-09-06") }
    ],
    communityRoles: [{ email: "accessibilitycircle@campus.edu", label: "Program Lead" }]
  },
  {
    name: "Ekta Bhandari",
    gender: "female",
    branch: "AI & Data Science",
    yearOfJoining: 2025, // 2nd Year
    bio: "Founder of the Reading Circle, curating a rotating monthly book pick and hosting author-adjacent discussion nights in the campus library.",
    skills: ["Curation", "Discussion Facilitation", "Reviewing", "Event Hosting", "Community Building"],
    interestTags: ["bookclub", "reading", "literature", "discussion", "community"],
    achievements: [
      { title: "Best New Student Club — SIES GST Annual Club Awards", issuer: "SIES GST Student Council", dateEarned: new Date("2025-04-22") }
    ],
    communityRoles: [{ email: "readingcircle@campus.edu", label: "Founder" }]
  },
  {
    name: "Rutvik Chitnis",
    gender: "male",
    branch: "Information Technology 1",
    yearOfJoining: 2023, // 4th Year
    bio: "Go-to anchor and emcee for every major campus fest, known for improvised crowd work and bilingual hosting across English and Marathi.",
    skills: ["Event Anchoring", "Emceeing", "Improvisation", "Bilingual Hosting", "Stage Presence"],
    interestTags: ["anchoring", "emceeing", "hosting", "events", "publicspeaking"],
    achievements: [
      { title: "Best Anchor — Mumbai Inter-Collegiate Fest Circuit Awards", issuer: "Mumbai Collegiate Events Association", dateEarned: new Date("2025-12-27") }
    ],
    communityRoles: [{ email: "eventsanchoring@campus.edu", label: "Lead Anchor" }]
  },
  {
    name: "Pranoti Adsul",
    gender: "female",
    branch: "Computer Engineering 3",
    yearOfJoining: 2024, // 3rd Year
    bio: "Woodworker running the Makerspace's carpentry bay, building furniture and prop sets for the theatre society out of reclaimed timber.",
    skills: ["Woodworking", "Joinery", "Power Tools", "Furniture Design", "Upcycling"],
    interestTags: ["woodworking", "carpentry", "diy", "craft", "sustainability"],
    achievements: [
      { title: "1st Prize — Reclaimed Furniture Design Challenge", issuer: "SIES GST Makerspace", dateEarned: new Date("2025-07-20") }
    ],
    communityRoles: [{ email: "makerspace@campus.edu", label: "Carpentry Lead" }]
  },
  {
    name: "Yohan Cooper",
    gender: "male",
    branch: "AI & Machine Learning",
    yearOfJoining: 2025, // 2nd Year
    bio: "Runs the student-founded on-campus coffee cart, roasting single-origin beans and training baristas from the Hospitality Club roster.",
    skills: ["Espresso Extraction", "Latte Art", "Bean Sourcing", "Small Business Operations", "Customer Service"],
    interestTags: ["coffee", "barista", "hospitality", "entrepreneurship", "foodculture"],
    achievements: [
      { title: "3rd Place — Mumbai Collegiate Latte Art Throwdown", issuer: "Café Culture Mumbai", dateEarned: new Date("2025-10-04") }
    ],
    communityRoles: [{ email: "hospitalityclub@campus.edu", label: "Cart Founder" }]
  },
  {
    name: "Ameya Ranadive",
    gender: "male",
    branch: "CSE (IoT, Cyber Security, & Blockchain)",
    yearOfJoining: 2023, // 4th Year
    bio: "Leads the Heritage Walks Society's weekend tours through South Mumbai's Art Deco and Gothic districts, researching archival building records.",
    skills: ["Heritage Research", "Public Tour Guiding", "Archival Research", "Storytelling", "Photography"],
    interestTags: ["heritage", "history", "museumstudies", "architecture", "culture"],
    achievements: [
      { title: "Best Heritage Documentation Project — Mumbai Heritage Conservation Society Student Award", issuer: "Mumbai Heritage Conservation Society", dateEarned: new Date("2025-11-09") }
    ],
    communityRoles: [{ email: "heritagewalks@campus.edu", label: "Tour Lead" }]
  }
];

// Names generator database for generating 70+ additional realistic student accounts
const FIRST_NAMES_MALE = [
  "Aarav", "Rohan", "Devansh", "Ishaan", "Yash", "Siddharth", "Kabir", "Arjun", "Utkarsh", "Aditya",
  "Akash", "Aniket", "Bhavya", "Chaitanya", "Deepak", "Gaurav", "Harsh", "Jay", "Manish", "Nikhil",
  "Omkar", "Parth", "Rahul", "Siddhesh", "Varun", "Vedant", "Aman", "Chetan", "Farhan", "Hrithik",
  "Kunal", "Mayank", "Pranav", "Sahil", "Vivan", "Zeeshan", "Karan", "Sameer", "Tanmay", "Ayush"
];

const FIRST_NAMES_FEMALE = [
  "Priya", "Ananya", "Sneha", "Kavya", "Meera", "Aditi", "Tanvi", "Riya", "Divya", "Natasha",
  "Aarohi", "Anandi", "Avani", "Esha", "Isha", "Kritika", "Pooja", "Rhea", "Tanya", "Zoya",
  "Bhumi", "Drishti", "Gayatri", "Ishita", "Janhavi", "Lavanya", "Neha", "Radhika", "Tanisha", "Yamini",
  "Nisha", "Shreya", "Simran", "Anushka", "Diya", "Sanya", "Mansi", "Pallavi", "Gauri", "Shruti"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Iyer", "Gupta", "Kulkarni", "Mehta", "Nair", "Verma", "Reddy", "Nambiar",
  "Deshmukh", "Rao", "Joshi", "Kapoor", "Sen", "Banerjee", "Choudhury", "Saxena", "Fernandez", "Agarwal",
  "Bhatia", "Chauhan", "Desai", "Dutta", "Gowda", "Hegde", "Jain", "Mahajan", "Menon", "Mishra",
  "Pandey", "Roy", "Sengupta", "Shah", "Singh", "Tiwari", "Venkatesh", "Wagh", "Yadav", "Shetty"
];

const SKILL_POOLS = [
  ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS", "MongoDB", "PostgreSQL"],
  ["Python", "PyTorch", "TensorFlow", "FastAPI", "Data Science", "Scikit-Learn", "NumPy"],
  ["Go", "Docker", "Kubernetes", "AWS", "Microservices", "gRPC", "PostgreSQL"],
  ["Java", "Spring Boot", "MySQL", "Kafka", "Redis", "Hibernate", "System Design"],
  ["Figma", "UI/UX", "CSS3", "Tailwind CSS", "Design Systems", "Prototyping", "Wireframing"],
  ["Flutter", "Dart", "Firebase", "iOS", "Android", "REST APIs", "State Management"],
  ["Cybersecurity", "Ethical Hacking", "Python", "Linux", "Burp Suite", "Wireshark", "Network Security"],
  ["C++", "DSA", "Competitive Programming", "Algorithms", "Data Structures", "OOP"],
  ["SolidWorks", "ANSYS", "CAD", "MATLAB", "Automotive Design", "3D Printing"],
  ["IoT", "Arduino", "Raspberry Pi", "Embedded C", "MQTT", "ESP32", "Sensors"]
];

const TAG_POOLS = [
  ["webdev", "react", "fullstack", "nextjs", "javascript", "hackathons"],
  ["ai", "machinelearning", "datascience", "python", "deeplearning"],
  ["cloud", "devops", "aws", "docker", "kubernetes", "linux"],
  ["cybersecurity", "ethicalhacking", "ctf", "security", "linux"],
  ["ui/ux", "figma", "design", "frontend", "webdesign"],
  ["mobile", "flutter", "apps", "android", "firebase"],
  ["dsa", "algorithms", "competitive-coding", "cpp", "coding"],
  ["automotive", "mechanical", "baja", "cad", "engineering"],
  ["robotics", "iot", "hardware", "embedded", "sensors"],
  ["startups", "entrepreneurship", "business", "product", "fintech"]
];

async function generateCompleteStudentDatabase() {
  const students = [];
  const password = "Campus1234";
  const usedEmails = new Set();
  const usedRollNos = new Set();
  const usedPrnNos = new Set();

  function getUniqueEmail(baseEmail) {
    let email = baseEmail.toLowerCase();
    let counter = 1;
    while (usedEmails.has(email)) {
      const parts = baseEmail.split("@");
      email = `${parts[0]}${counter}@${parts[1]}`.toLowerCase();
      counter++;
    }
    usedEmails.add(email);
    return email;
  }

  function getUniqueRollNo(baseRoll) {
    let roll = baseRoll;
    let counter = 1;
    while (usedRollNos.has(roll)) {
      roll = `${baseRoll.slice(0, 6)}${String(counter).padStart(2, '0')}`;
      counter++;
    }
    usedRollNos.add(roll);
    return roll;
  }

  function getUniquePrnNo(basePrn) {
    let prn = basePrn;
    let counter = 1;
    while (usedPrnNos.has(prn)) {
      prn = `${basePrn.slice(0, 8)}${String(counter).padStart(2, '0')}`;
      counter++;
    }
    usedPrnNos.add(prn);
    return prn;
  }

  // 1. Primary demo test user (niranjan@gmail.com)
  students.push({
    name: "Niranjan Sathishkumar",
    email: getUniqueEmail("niranjan@gmail.com"),
    password,
    rollNo: getUniqueRollNo("124A9036"),
    prnNo: getUniquePrnNo("1032240936"),
    branch: "AI & Machine Learning",
    yearOfJoining: 2024, // 3rd Year
    bio: "AI & Full-Stack Developer at SIES GST. Passionate about LLM agents, Next.js architecture, and competitive hackathons. Core technical member at CSI & GDSC.",
    skills: ["Next.js", "React", "Python", "FastAPI", "PyTorch", "Docker", "PostgreSQL", "TailwindCSS", "TypeScript"],
    education: ["B.Tech in Artificial Intelligence & Machine Learning — SIES Graduate School of Technology (2024–2028)"],
    interestTags: ["ai", "webdev", "hackathons", "nextjs", "cloud", "competitive-coding"],
    profilePicture: {
      filename: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    },
    profileBanner: {
      filename: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    },
    socialLinks: [
      { platform: "github", url: "https://github.com/niranjan-sathishkumar" },
      { platform: "linkedin", url: "https://linkedin.com/in/niranjan-sathishkumar" },
      { platform: "instagram", url: "https://instagram.com/niranjan_sk" }
    ],
    achievementsData: [
      { title: "Finalist — HackOver 4.0 National Hackathon", issuer: "CSI SIES GST", dateEarned: new Date("2025-09-28"), description: "Built an automated AI campus companion portal with real-time vector embeddings." },
      { title: "Winner — CampusCircle Web Architecture Challenge", issuer: "SIES GST Tech Council", dateEarned: new Date("2026-02-14") }
    ],
    communityRoles: [{ email: "csi@campus.edu", label: "Core Technical Lead" }, { email: "gdsc@campus.edu", label: "Web Lead" }]
  });

  // 2. Predefined rich personas
  for (let i = 0; i < STUDENT_PERSONAS.length; i++) {
    const persona = STUDENT_PERSONAS[i];
    const cleanName = persona.name.toLowerCase().replace(/[^a-z]/g, ".");
    const email = getUniqueEmail(`${cleanName}@campus.edu`);
    const numStr = String(i + 10).padStart(3, "0");
    const rollNo = getUniqueRollNo(`12${persona.yearOfJoining % 100}A${(i % 8) + 1}${numStr}`);
    const prnNo = getUniquePrnNo(`1032${persona.yearOfJoining % 100}0${numStr}`);

    const avatarList = persona.gender === "female" ? FEMALE_AVATARS : MALE_AVATARS;
    const avatar = avatarList[i % avatarList.length];
    const banner = PROFILE_BANNERS[i % PROFILE_BANNERS.length];

    students.push({
      name: persona.name,
      email,
      password,
      rollNo,
      prnNo,
      branch: persona.branch,
      yearOfJoining: persona.yearOfJoining,
      bio: persona.bio,
      skills: persona.skills,
      education: [`B.Tech in ${persona.branch} — SIES Graduate School of Technology (${persona.yearOfJoining}–${persona.yearOfJoining + 4})`],
      interestTags: persona.interestTags,
      profilePicture: { filename: avatar },
      profileBanner: { filename: banner },
      socialLinks: [
        { platform: "github", url: `https://github.com/${persona.name.toLowerCase().replace(/[^a-z]/g, "")}` },
        { platform: "linkedin", url: `https://linkedin.com/in/${persona.name.toLowerCase().replace(/[^a-z]/g, "")}` },
        { platform: "instagram", url: `https://instagram.com/${persona.name.toLowerCase().replace(/[^a-z]/g, "")}` }
      ],
      achievementsData: persona.achievements,
      communityRoles: persona.communityRoles
    });
  }

  // 3. Generate remaining diverse students up to 170 total
  const remainingCount = 170 - students.length;
  for (let i = 0; i < remainingCount; i++) {
    const isFemale = i % 2 === 0;
    const fnList = isFemale ? FIRST_NAMES_FEMALE : FIRST_NAMES_MALE;
    const fn = fnList[i % fnList.length];
    const ln = LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    const cleanFn = fn.toLowerCase().replace(/[^a-z]/g, "");
    const cleanLn = ln.toLowerCase().replace(/[^a-z]/g, "");
    const email = getUniqueEmail(`${cleanFn}.${cleanLn}@campus.edu`);

    const branch = BRANCHES[i % BRANCHES.length];
    const yearOfJoining = 2023 + (i % 4); // 2023 (4th yr), 2024 (3rd yr), 2025 (2nd yr), 2026 (1st yr)
    const numStr = String(i + 40).padStart(3, "0");
    const rollNo = getUniqueRollNo(`12${yearOfJoining % 100}A${(i % 8) + 1}${numStr}`);
    const prnNo = getUniquePrnNo(`1032${yearOfJoining % 100}0${numStr}`);

    const skills = SKILL_POOLS[i % SKILL_POOLS.length];
    const interestTags = TAG_POOLS[i % TAG_POOLS.length];
    const avatarList = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
    const avatar = avatarList[(i + 3) % avatarList.length];
    const banner = PROFILE_BANNERS[(i + 2) % PROFILE_BANNERS.length];

    const bio = `Passionate ${branch} student at SIES GST exploring ${skills.slice(0, 3).join(", ")}. Active participant in campus events and collaborative open-source projects.`;

    students.push({
      name,
      email,
      password,
      rollNo,
      prnNo,
      branch,
      yearOfJoining,
      bio,
      skills,
      education: [`B.Tech in ${branch} — SIES Graduate School of Technology (${yearOfJoining}–${yearOfJoining + 4})`],
      interestTags,
      profilePicture: { filename: avatar },
      profileBanner: { filename: banner },
      socialLinks: [
        { platform: "github", url: `https://github.com/${cleanFn}${cleanLn}` },
        { platform: "linkedin", url: `https://linkedin.com/in/${cleanFn}${cleanLn}` }
      ],
      achievementsData: i % 3 === 0 ? [
        {
          title: `Participant — SIES GST Annual Tech Fest ${Math.min(yearOfJoining + 1, 2025)}`,
          issuer: "SIES GST Technical Council",
          dateEarned: new Date(`${Math.min(yearOfJoining + 1, 2025)}-03-10`)
        }
      ] : []
    });
  }

  return students;
}

async function seedStudents() {
  try {
    console.log("Connecting to MongoDB at:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Connected successfully.\n");

    // Fetch communities to link memberships & follows
    const communities = await Community.find({}).lean();
    const communityMap = new Map();
    for (const c of communities) {
      communityMap.set(c.email.toLowerCase(), c);
    }

    console.log("Purging old campus student records and associated follower links...");
    // Clear old achievements, student follows, and campus student users
    await User.deleteMany({ email: { $regex: /@campus\.edu$|niranjan@gmail\.com$/i } });
    await Achievement.deleteMany({});
    await Follow.deleteMany({});
    await CommunityMembership.deleteMany({});

    console.log("Generating 170 rich realistic student records...");
    const studentBlueprints = await generateCompleteStudentDatabase();

    const savedUsers = [];
    const coreTeamByCommunity = new Map();

    for (const blueprint of studentBlueprints) {
      const user = new User({
        name: blueprint.name,
        email: blueprint.email,
        password: blueprint.password,
        rollNo: blueprint.rollNo,
        prnNo: blueprint.prnNo,
        branch: blueprint.branch,
        yearOfJoining: blueprint.yearOfJoining,
        isProfileComplete: true,
        bio: blueprint.bio,
        skills: blueprint.skills,
        education: blueprint.education,
        interestTags: blueprint.interestTags,
        profilePicture: blueprint.profilePicture,
        profileBanner: blueprint.profileBanner,
        socialLinks: blueprint.socialLinks,
        followerCount: 0,
        followingCount: 0,
      });

      await user.save();
      savedUsers.push({ user, blueprint });

      // Create achievements for this student
      if (Array.isArray(blueprint.achievementsData)) {
        for (const achData of blueprint.achievementsData) {
          const ach = new Achievement({
            student: user._id,
            title: achData.title,
            issuer: achData.issuer,
            description: achData.description,
            verificationLink: achData.verificationLink,
            dateEarned: achData.dateEarned,
          });
          await ach.save();
        }
      }

      // Create community memberships if specified
      if (Array.isArray(blueprint.communityRoles)) {
        for (const role of blueprint.communityRoles) {
          const comm = communityMap.get(role.email.toLowerCase());
          if (comm) {
            const membership = new CommunityMembership({
              community: comm._id,
              student: user._id,
              label: role.label || "Member",
              isActive: true,
            });
            await membership.save();

            // Named leadership postings (President, Technical Lead, etc.)
            // also seed the community's Committee Roster (Community.coreTeam),
            // which otherwise stays empty forever — nothing else populates it.
            const commKey = String(comm._id);
            if (!coreTeamByCommunity.has(commKey)) coreTeamByCommunity.set(commKey, []);
            coreTeamByCommunity.get(commKey).push({ user: user._id, role: role.label || "Member" });
          }
        }
      }
    }

    console.log(`Successfully created ${savedUsers.length} student records with achievements and memberships.`);

    // ── Populate Committee Rosters (Community.coreTeam) ──
    console.log("Populating committee rosters from seeded leadership postings...");
    for (const [commId, members] of coreTeamByCommunity.entries()) {
      await Community.updateOne(
        { _id: commId },
        { $set: { coreTeam: members.slice(0, 50) } },
        { runValidators: true }
      );
    }
    console.log(`Populated core teams for ${coreTeamByCommunity.size} communities.`);

    // ── Build realistic follow network graph ──
    console.log("\nBuilding natural peer-to-peer and community follow network graph...");
    let followCount = 0;

    // CSI is the campus's largest, oldest technical body — weight it into the
    // per-student draw pool so it organically ends up with a bigger, richer
    // follower base than newer/smaller communities instead of an even split.
    const FLAGSHIP_WEIGHT = { "csi@campus.edu": 3 };
    const commPool = communities.flatMap((c) =>
      Array(FLAGSHIP_WEIGHT[c.email.toLowerCase()] || 1).fill(c)
    );

    for (let i = 0; i < savedUsers.length; i++) {
      const follower = savedUsers[i].user;

      // Each student follows 4–12 other students
      const numStudentFollows = Math.floor(Math.random() * 8) + 4;
      const targetIndices = new Set();
      while (targetIndices.size < numStudentFollows) {
        const targetIdx = Math.floor(Math.random() * savedUsers.length);
        if (targetIdx !== i) targetIndices.add(targetIdx);
      }

      for (const targetIdx of targetIndices) {
        const targetUser = savedUsers[targetIdx].user;
        try {
          const follow = new Follow({
            follower: follower._id,
            following: targetUser._id,
            followingType: "User",
            isActive: true,
          });
          await follow.save();
          followCount++;
        } catch {
          // ignore duplicate
        }
      }

      // Each student follows 2–5 communities, drawn from the weighted pool
      // and deduped by community id (the pool repeats flagship communities).
      const numCommFollows = Math.floor(Math.random() * 4) + 2;
      const shuffledPool = [...commPool].sort(() => 0.5 - Math.random());
      const pickedComms = [];
      const pickedIds = new Set();
      for (const comm of shuffledPool) {
        if (pickedComms.length >= numCommFollows) break;
        const id = String(comm._id);
        if (pickedIds.has(id)) continue;
        pickedIds.add(id);
        pickedComms.push(comm);
      }

      for (const comm of pickedComms) {
        try {
          const commFollow = new Follow({
            follower: follower._id,
            following: comm._id,
            followingType: "Community",
            isActive: true,
            createdAt: randomHistoricalDate(),
          });
          await commFollow.save();
          followCount++;
        } catch {
          // ignore duplicate
        }
      }
    }

    console.log(`Successfully created ${followCount} follow connections across students and communities.`);

    // Synchronize followerCount and followingCount across all users and communities
    console.log("Synchronizing followerCount and followingCount in DB...");
    const allUsers = await User.find({});
    for (const u of allUsers) {
      const [fCount, ingCount] = await Promise.all([
        Follow.countDocuments({ following: u._id, followingType: "User", isActive: true }),
        Follow.countDocuments({ follower: u._id, isActive: true })
      ]);
      await User.updateOne({ _id: u._id }, { $set: { followerCount: fCount, followingCount: ingCount } });
    }

    const allComms = await Community.find({});
    for (const c of allComms) {
      const fCount = await Follow.countDocuments({ following: c._id, followingType: "Community", isActive: true });
      await Community.updateOne({ _id: c._id }, { $set: { followerCount: fCount } });
    }

    console.log(`\n======================================================`);
    console.log(` STUDENT DATABASE SEEDING COMPLETED`);
    console.log(`======================================================`);
    console.log(`Total Students:          ${savedUsers.length}`);
    console.log(`Total Achievements:      ${await Achievement.countDocuments({})}`);
    console.log(`Total Memberships:       ${await CommunityMembership.countDocuments({})}`);
    console.log(`Total Active Follows:    ${await Follow.countDocuments({ isActive: true })}`);
    console.log(`Default Password:        Campus1234 (all accounts)`);
    console.log(`Primary Demo Account:    niranjan@gmail.com`);
    console.log(`======================================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding students:", err);
    process.exit(1);
  }
}

seedStudents();
