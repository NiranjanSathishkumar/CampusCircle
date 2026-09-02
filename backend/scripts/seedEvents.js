const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();

const Event = require("../src/models/Event");
const Community = require("../src/models/Community");
const Registration = require("../src/models/Registration");
const TeamMember = require("../src/models/TeamMember");
const Bookmark = require("../src/models/Bookmark");
const Like = require("../src/models/Like");
const { User } = require("../src/models/User");

const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

// Current simulation base date: Sept 1, 2026
const BASE_DATE = new Date("2026-09-01T09:00:00.000+05:30");

function makeDate(daysFromBase, hour = 10, minute = 0) {
  const d = new Date(BASE_DATE.getTime());
  d.setDate(d.getDate() + daysFromBase);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// 22 Detailed Realistic Events Data Blueprint
const RAW_EVENTS_BLUEPRINT = [
  // ── CSI SIES GST ─────────────────────────────────────────────
  {
    communityKey: "csi@campus.edu",
    title: "HackOver 5.0 — 24-Hour National Hackathon",
    category: "Competition",
    registrationType: "team",
    teamSize: { min: 2, max: 4 },
    price: 0,
    capacity: 75, // team slots
    daysFromBase: 25, // Sept 26, 2026
    durationHours: 32, // ends next day evening
    regDeadlineDays: 20,
    venue: "Main Auditorium & Computing Complex Labs 1–4, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80",
    tags: ["hackathon", "webdev", "ai", "blockchain", "iot", "competition"],
    description:
      "HackOver 5.0 is CSI SIES GST's flagship 24-hour national hackathon bringing together over 300 passionate student developers, designers, and innovators. Tackle challenging problem statements across 5 tracks: Generative AI for Good, Sustainable Smart Cities, Healthcare 2.0, Open Innovation, and Decentralized Systems. Participants receive 24/7 dedicated mentor support from senior industry engineers, high-speed campus fiber internet, midnight pizza and coffee sprints, official hackathon tees, and access to $1,00,000+ in cloud sponsor credits and cash prize pools.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText:
      "I agree to adhere to the HackOver Code of Conduct. I acknowledge that all code submitted must be authored during the 24-hour hacking period and respect open-source licensing standards. I will respect campus property and equipment at all times.",
    confirmationMessage:
      "Welcome to HackOver 5.0! Your team entry has been recorded. Please check your email and join the official Discord server using the link in your pass for track briefings, mentor schedules, and team channels.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Aarav Mehta",
      leadRole: "Hackathon Convener & CSI Lead",
      email: "csi@campus.edu",
      phone: "+91 98201 45678",
      deskLocation: "CSI Tech Desk, Computer Engineering Dept",
      building: "Main Academic Building",
      room: "Lab 2",
      floor: "3rd Floor",
      emailSLA: "Within 4 hours",
      operatingHours: "09:00 AM – 07:00 PM (Mon–Sat)",
    },
    agenda: [
      { phase: "09:00 AM – 10:30 AM", title: "Registration & Kit Distribution", desc: "Team check-in at registration desks, swag bag distribution, and networking breakfast." },
      { phase: "10:30 AM – 11:30 AM", title: "Opening Ceremony & Problem Tracks", desc: "Welcome address by Principal & Industry keynote speaker; problem tracks officially revealed." },
      { phase: "11:30 AM (Day 1)", title: "Hacking Begins (24-Hour Timer Starts)", desc: "Teams set up in assigned lab workstations and begin ideation and development." },
      { phase: "04:30 PM – 06:30 PM", title: "Mentor Checkpoint 1: Architecture Review", desc: "Domain experts conduct 10-minute reviews per team to validate approach and technical feasibility." },
      { phase: "11:30 PM – 12:30 AM", title: "Midnight Coding Sprint & Mini Trivia", desc: "Red Bull energy boost, midnight snacks, and lightning developer mini-games." },
      { phase: "07:00 AM – 09:00 AM", title: "Mentor Checkpoint 2: Prototype Verification", desc: "Validation of working prototype builds and deployment health checks." },
      { phase: "11:30 AM (Day 2)", title: "Hacking Concludes & Code Freeze", desc: "Final Git repository submission and deployment link verification on submission portal." },
      { phase: "01:00 PM – 04:30 PM", title: "Live Demos & Jury Evaluations", desc: "Top 15 shortlisted teams present 5-minute live demos followed by jury Q&A in the auditorium." },
      { phase: "05:00 PM – 06:00 PM", title: "Awards Ceremony & Closing", desc: "Announcement of track winners, overall champions, prize disbursement, and certificates." }
    ],
    rules: [
      "All team members must be enrolled undergraduate/graduate students with valid college ID cards.",
      "Teams must consist of 2 to 4 members. Cross-branch and cross-year teams are allowed.",
      "All project code, design mockups, and backend assets must be created fresh during the 24-hour hackathon window.",
      "Open-source libraries, APIs, and frameworks are allowed provided they are publicly accessible and cited.",
      "Plagiarism or submission of pre-built commercial solutions results in immediate team disqualification.",
      "Laptops, chargers, and any specialized development hardware (e.g. Microcontrollers) must be brought by teams.",
      "Consuming alcohol, smoking, or disorderly conduct on campus grounds is strictly prohibited."
    ],
    faqs: [
      { q: "Is there any registration fee for HackOver 5.0?", a: "No, HackOver 5.0 is completely free for all shortlisted student teams, including meals, snacks, and swag." },
      { q: "Can team members be from different colleges?", a: "Yes! Inter-college teams are fully permitted. Every member must present their respective college ID card at check-in." },
      { q: "Will internet and power outlets be provided?", a: "Yes, every team desk is equipped with dedicated multi-pin power strips and high-speed Wi-Fi and Ethernet ports." },
      { q: "What should we bring to the venue?", a: "Bring your laptops, chargers, extension cords, personal toiletries, water bottles, and government/college photo IDs." },
      { q: "Will hardware kits be provided for IoT projects?", a: "Basic sensors, breadboards, and jumper wires are available at the hardware desk on request, but you should bring your own primary boards (ESP32/Raspberry Pi)." }
    ],
    formQuestions: [
      {
        label: "Selected Problem Track",
        type: "select",
        required: true,
        placeholder: "Choose a track",
        helpText: "Select your primary problem track",
        options: ["Generative AI & LLMs", "Sustainable Smart Cities", "Healthcare 2.0", "Open Innovation", "Decentralized Web & Blockchain"]
      },
      {
        label: "Team GitHub / Portfolio URL",
        type: "url",
        required: true,
        placeholder: "https://github.com/team-lead",
        helpText: "Link to your team leader or team organization repository"
      },
      {
        label: "Dietary Preferences for Meals",
        type: "radio",
        required: true,
        options: ["Vegetarian", "Jain", "Non-Vegetarian"]
      },
      {
        label: "Brief Solution Concept (2–3 sentences)",
        type: "textarea",
        required: true,
        placeholder: "Describe the core idea and technical stack your team plans to leverage...",
        helpText: "Helps us pair you with the best-suited mentor during the check-in round."
      }
    ]
  },
  {
    communityKey: "csi@campus.edu",
    title: "Full-Stack Next.js 15 & GraphQL Masterclass",
    category: "Workshop",
    registrationType: "solo",
    price: 150,
    capacity: 60,
    daysFromBase: 11, // Sept 12, 2026
    durationHours: 6.5,
    regDeadlineDays: 9,
    venue: "Computer Engineering Lab 2, 3rd Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    tags: ["nextjs", "react", "graphql", "webdev", "fullstack", "javascript"],
    description:
      "Level up your web engineering expertise in this intensive, hands-on masterclass led by senior full-stack developers. Discover Next.js 15 App Router architecture, React Server Components (RSC), Server Actions for mutation ergonomics, Apollo Server GraphQL schemas, and PostgreSQL integration via Prisma ORM. By the end of the day, every participant will build, test, and deploy a production-ready real-time collaborative application to Vercel.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Registration confirmed! Please ensure Node.js v20+ and VS Code are installed on your laptop prior to attending.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Priya Sharma",
      leadRole: "Technical Workshop Head, CSI",
      email: "csi@campus.edu",
      phone: "+91 98201 11223",
      deskLocation: "Lab 2 Reception",
      building: "Main Academic Building",
      room: "Lab 2",
      floor: "3rd Floor",
      emailSLA: "Within 6 hours",
      operatingHours: "10:00 AM – 05:00 PM",
    },
    agenda: [
      { phase: "10:00 AM – 11:15 AM", title: "Next.js 15 Foundations & App Router", desc: "Understanding React Server Components, client boundaries, streaming SSR, and file-system routing." },
      { phase: "11:30 AM – 01:00 PM", title: "GraphQL APIs with Apollo Server & Subscriptions", desc: "Building type-safe GraphQL schemas, query resolvers, mutations, and WebSocket subscriptions." },
      { phase: "01:00 PM – 02:00 PM", title: "Lunch Break & Code Troubleshooting", desc: "Complimentary sandwich lunch and 1-on-1 environment setup help." },
      { phase: "02:00 PM – 03:45 PM", title: "Building the Live Collaborative Canvas App", desc: "Hands-on implementation of optimistic UI updates, auth session handling, and database persistence." },
      { phase: "03:45 PM – 04:30 PM", title: "CI/CD Deployment & Performance Audits", desc: "Configuring Vercel preview environments, Lighthouse audits, and certificate distribution." }
    ],
    rules: [
      "Participants must bring their own laptops with Wi-Fi capability and admin privileges.",
      "Pre-install Node.js (LTS version 20.x or higher), Git, and Visual Studio Code.",
      "Lab desktop machines are available only as backup in case of battery/hardware failure.",
      "Attendance is mandatory for all 4 practical modules to qualify for the certificate of completion."
    ],
    faqs: [
      { q: "Is prior knowledge of React required?", a: "Familiarity with basic JavaScript (ES6 syntax) and foundational React concepts (useState, props) is recommended." },
      { q: "Will study materials and source code be shared?", a: "Yes, complete step-by-step GitHub starter templates and solution branches will be provided to all attendees." },
      { q: "Is lunch provided with the registration fee?", a: "Yes, the ₹150 registration fee includes lunch, refreshments, workshop kit, and a verified certificate." }
    ],
    formQuestions: [
      {
        label: "Laptop Operating System",
        type: "select",
        required: true,
        options: ["macOS", "Windows 11 / 10", "Linux (Ubuntu / Fedora / Arch)"]
      },
      {
        label: "Current React Experience Level",
        type: "radio",
        required: true,
        options: ["Beginner (learning hooks)", "Intermediate (built 1-2 web apps)", "Advanced (comfortable with SSR/fullstack)"]
      },
      {
        label: "T-Shirt Size for Workshop Merchandise",
        type: "select",
        required: true,
        options: ["S (Small)", "M (Medium)", "L (Large)", "XL (Extra Large)", "XXL"]
      }
    ]
  },

  // ── IEEE STUDENT BRANCH SIES GST ─────────────────────────────
  {
    communityKey: "ieee@campus.edu",
    title: "Edge AI & Embedded Vision on Raspberry Pi 5",
    category: "Workshop",
    registrationType: "solo",
    price: 200,
    capacity: 45,
    daysFromBase: 17, // Sept 18, 2026
    durationHours: 6.5,
    regDeadlineDays: 15,
    venue: "EXTC Seminar Hall & Embedded Systems Lab, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
    tags: ["edge-ai", "raspberrypi", "computervision", "embedded", "iot", "python"],
    description:
      "Bridging machine learning and hardware engineering, this hands-on workshop walks through deploying optimized convolutional neural networks and YOLOv8 models directly on Raspberry Pi 5 single-board computers. Learn model quantization with ONNX Runtime, hardware acceleration using Coral USB accelerators, real-time object tracking with OpenCV, and camera sensor calibration. Hardware development kits provided in the lab for all practical exercises.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "I agree to handle all electronics test benches, Raspberry Pi boards, and optical sensors with care and follow ESD safety guidelines.",
    confirmationMessage: "You're registered for Edge AI! Lab kits will be assigned at the door. Please bring a laptop with Python 3.10+ installed.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Sanya Kapoor",
      leadRole: "IEEE Student Branch Chair",
      email: "ieee@campus.edu",
      phone: "+91 98202 33445",
      deskLocation: "EXTC Department IEEE Desk",
      building: "Main Academic Building",
      room: "Lab 4",
      floor: "2nd Floor",
      emailSLA: "Within 12 hours",
      operatingHours: "10:00 AM – 04:30 PM",
    },
    agenda: [
      { phase: "09:30 AM – 10:45 AM", title: "Edge Computing Principles & RPi 5 Architecture", desc: "Understanding compute constraints, memory bandwidth, and thermal considerations on single board computers." },
      { phase: "11:00 AM – 12:30 PM", title: "Model Quantization & ONNX Optimization", desc: "Converting PyTorch/TensorFlow models to INT8 quantized ONNX graphs for low-latency inference." },
      { phase: "12:30 PM – 01:30 PM", title: "Networking Lunch & Hardware Pairing", desc: "Connect with peers, enjoy catered lunch, and set up lab kits." },
      { phase: "01:30 PM – 03:15 PM", title: "Real-time Object Detection & Sensor Telemetry", desc: "Live video stream processing using OpenCV pipeline with GPIO trigger integration." },
      { phase: "03:30 PM – 04:00 PM", title: "Project Showcase & Mini Challenge", desc: "Speed optimization competition for object tracking accuracy under varying light levels." }
    ],
    rules: [
      "Lab hardware kits (Raspberry Pi 5, CSI camera modules, sensors) must remain inside the lab.",
      "Static electricity prevention wristbands provided must be worn during chip handling.",
      "Work in pairs when connecting high-current power adapters to avoid ground loop damage."
    ],
    faqs: [
      { q: "Do I need to buy a Raspberry Pi?", a: "No, complete hardware kits and camera modules will be provided during the session for all participants." },
      { q: "What software should I install beforehand?", a: "Install Python 3.10+, Visual Studio Code, and the VS Code Remote-SSH extension." }
    ],
    formQuestions: [
      {
        label: "Prior Python & Embedded Experience",
        type: "radio",
        required: true,
        options: ["Beginner in Python", "Comfortable with Python and OpenCV", "Hands-on experience with Arduino/RPi/Microcontrollers"]
      },
      {
        label: "Do you have an active IEEE Student Membership Number?",
        type: "text",
        required: false,
        placeholder: "Enter 8-digit IEEE ID or leave blank if non-member",
        helpText: "Active IEEE members receive special branch discounts at future symposia."
      }
    ]
  },
  {
    communityKey: "ieee@campus.edu",
    title: "Symposium on Quantum Computing & Silicon Photonics",
    category: "Seminar",
    registrationType: "solo",
    price: 0,
    capacity: 120,
    daysFromBase: 39, // Oct 10, 2026
    durationHours: 4.5,
    regDeadlineDays: 36,
    venue: "Main Auditorium, Ground Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80",
    tags: ["quantum", "silicon-photonics", "physics", "semiconductor", "research", "ieee"],
    description:
      "Join world-renowned researchers and senior IEEE Bombay Section fellows for an inspiring symposium on next-generation computing paradigms. Key topics include superconducting transmon qubits, topological quantum error correction, silicon photonics on-chip waveguides, optical interconnects replacing copper in data centers, and IBM Qiskit quantum algorithms.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Pass generated! Please arrive 15 minutes before the opening keynote to receive your delegate badge.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Dr. K. Venkatesh",
      leadRole: "IEEE Branch Counselor",
      email: "ieee@campus.edu",
      phone: "+91 98202 99887",
      deskLocation: "EXTC Faculty Lounge",
      building: "Main Academic Building",
      room: "Room 208",
      floor: "2nd Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "11:00 AM – 04:00 PM",
    },
    agenda: [
      { phase: "11:00 AM – 11:20 AM", title: "Inauguration & Lamp Lighting", desc: "Welcome address by IEEE Chair and Dean of Research." },
      { phase: "11:20 AM – 12:40 PM", title: "Keynote 1: Fault-Tolerant Quantum Computing Architectures", desc: "Prof. R. Deshmukh (TIFR) on surface codes, physical vs logical qubits, and cryogenic control." },
      { phase: "12:40 PM – 01:40 PM", title: "High Tea & Research Poster Exhibition", desc: "Networking reception featuring graduate student research posters and live Qiskit simulations." },
      { phase: "01:40 PM – 03:00 PM", title: "Keynote 2: Silicon Photonics in Hyperscale AI Clusters", desc: "Industry Director (Intel Labs) on co-packaged optics and 800Gbps photonic transceivers." },
      { phase: "03:00 PM – 03:30 PM", title: "Fireside Panel & Student Q&A", desc: "Career paths in quantum engineering, nanofabrication, and post-graduate fellowship opportunities." }
    ],
    rules: [
      "Please keep mobile phones on silent mode during technical keynote presentations.",
      "Auditorium doors close 5 minutes prior to the opening keynote.",
      "Delegate badges must be worn visibly at all times."
    ],
    faqs: [
      { q: "Is this symposium open to first-year students?", a: "Yes, keynotes are structured to provide both intuitive high-level overviews and rigorous deep dives." },
      { q: "Will certificates be provided?", a: "Yes, IEEE-stamped certificates of attendance will be emailed to all checked-in delegates." }
    ],
    formQuestions: [
      {
        label: "Your Primary Area of Research Interest",
        type: "select",
        required: true,
        options: ["Quantum Algorithms & Qiskit", "Nanophotonics & Optical Computing", "Semiconductor Device Physics", "General Tech Exploration"]
      }
    ]
  },

  // ── GDSC SIES GST ─────────────────────────────────────────────
  {
    communityKey: "gdsc@campus.edu",
    title: "Android 15 Compose & Kotlin Multiplatform Bootcamp",
    category: "Workshop",
    registrationType: "solo",
    price: 0,
    capacity: 55,
    daysFromBase: 7, // Sept 8, 2026
    durationHours: 4,
    regDeadlineDays: 5,
    venue: "Computer Center Lab 1, 2nd Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1200&auto=format&fit=crop&q=80",
    tags: ["android", "kotlin", "jetpack-compose", "kmp", "mobile", "gdsc"],
    description:
      "Get up to speed with modern mobile engineering standards with Google Developer Student Clubs. Explore declarative UI patterns in Jetpack Compose, state hoisting, Material 3 animations, Coroutines & Flow, and cross-platform logic sharing across Android and iOS using Kotlin Multiplatform (KMP). Build an interactive campus companion app with local Room database and remote REST synchronization.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "You're in! Ensure Android Studio Ladybug or newer is installed with an active Android Virtual Device (AVD).",
    sendEmailReceipt: true,
    contact: {
      leadName: "Meera Nair",
      leadRole: "GDSC Lead",
      email: "gdsc@campus.edu",
      phone: "+91 98203 44556",
      deskLocation: "Computer Center Reception",
      building: "Main Academic Building",
      room: "CC Lab 1",
      floor: "2nd Floor",
      emailSLA: "Within 6 hours",
      operatingHours: "01:00 PM – 06:00 PM",
    },
    agenda: [
      { phase: "01:30 PM – 02:30 PM", title: "Modern Android & Jetpack Compose Fundamentals", desc: "Building dynamic UI with Composables, State, Modifiers, and Material 3 design tokens." },
      { phase: "02:30 PM – 03:30 PM", title: "Asynchronous Architecture with Kotlin Coroutines & Flow", desc: "ViewModel lifecycle, repository pattern, and reactive network requests with Retrofit." },
      { phase: "03:45 PM – 04:45 PM", title: "Kotlin Multiplatform (KMP) Architecture", desc: "Sharing domain logic, models, and networking libraries seamlessly across platforms." },
      { phase: "04:45 PM – 05:30 PM", title: "Deployment, APK Signing & Google Play Guidelines", desc: "Best practices for release builds, Play Console policies, and GDSC study badge issuance." }
    ],
    rules: [
      "Bring your personal laptop with Android Studio installed and configured with at least 8GB RAM.",
      "Physical Android devices with developer options enabled are encouraged for faster testing."
    ],
    faqs: [
      { q: "Can I participate if I only have a Windows laptop?", a: "Yes, Kotlin and Jetpack Compose for Android run smoothly on Windows, Linux, and macOS." },
      { q: "Will GDSC Google Developer Badges be awarded?", a: "Yes! Completing the bootcamp project unlocks official Google Cloud and Android developer profile badges." }
    ],
    formQuestions: [
      {
        label: "Android Studio Installation Status",
        type: "radio",
        required: true,
        options: ["Installed and verified with emulator", "Installed but need emulator setup help", "Not yet installed"]
      },
      {
        label: "Preferred Learning Track",
        type: "select",
        required: true,
        options: ["Native Android (Kotlin & Jetpack Compose)", "Cross-Platform (Kotlin Multiplatform KMP)", "Both equally"]
      }
    ]
  },
  {
    communityKey: "gdsc@campus.edu",
    title: "Cloud Run & GenAI Solution Challenge 2026",
    category: "Competition",
    registrationType: "team",
    teamSize: { min: 2, max: 4 },
    price: 0,
    capacity: 50,
    daysFromBase: 45, // Oct 16, 2026
    durationHours: 28,
    regDeadlineDays: 40,
    venue: "Innovation & Incubation Cell, Room 204, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80",
    tags: ["gcp", "genai", "cloud", "gemini", "solution-challenge", "google"],
    description:
      "The Google Solution Challenge invites student teams to build impactful cloud applications that advance one or more of the United Nations 17 Sustainable Development Goals. Utilize Google Cloud Platform (GCP), Cloud Run containerized microservices, Vertex AI, Gemini 1.5 Pro multimodal models, and Firebase. Top teams receive direct mentorship from Google Developer Experts and entry into global GDSC prize rounds.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "We agree that all code submitted will be published under an open-source license and adhere to Google's AI Safety Principles.",
    confirmationMessage: "Team registration approved! Check your dashboard for Google Cloud $50 free credit vouchers.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Meera Nair",
      leadRole: "GDSC Community Lead",
      email: "gdsc@campus.edu",
      phone: "+91 98203 77889",
      deskLocation: "Innovation Cell Front Desk",
      building: "Innovation Hub",
      room: "Room 204",
      floor: "2nd Floor",
      emailSLA: "Within 12 hours",
      operatingHours: "10:00 AM – 05:00 PM",
    },
    agenda: [
      { phase: "10:00 AM – 11:30 AM", title: "Opening Briefing & GCP Credit Activation", desc: "Track introduction, UN SDG criteria explanation, and student GCP coupon provisioning." },
      { phase: "11:30 AM – 04:00 PM", title: "Sprint 1: Model Tuning & API Prototyping", desc: "Building Vertex AI agent pipelines and Function Calling schemas with Gemini API." },
      { phase: "04:00 PM – 09:00 PM", title: "Sprint 2: Full-Stack Integration & Cloud Run Deploy", desc: "Dockerizing microservices and deploying with zero-downtime auto-scaling." },
      { phase: "09:00 AM (Day 2)", title: "Pitch Demos & Impact Scoring", desc: "5-minute pitch presentations before a jury of Google Developer Experts and Faculty." }
    ],
    rules: [
      "Projects must address at least 1 UN Sustainable Development Goal.",
      "Must utilize at least 2 Google Cloud or Firebase technologies in the backend architecture.",
      "Teams must submit a 2-minute demo video along with the GitHub repository."
    ],
    faqs: [
      { q: "Will GCP cloud credits be provided?", a: "Yes, every registered team receives Google Cloud voucher codes to cover infrastructure costs." }
    ],
    formQuestions: [
      {
        label: "Target UN Sustainable Development Goal",
        type: "select",
        required: true,
        options: ["SDG 3: Good Health & Well-being", "SDG 4: Quality Education", "SDG 7: Affordable & Clean Energy", "SDG 11: Sustainable Cities", "SDG 13: Climate Action"]
      },
      {
        label: "Team Project GitHub Repository / Pitch Draft",
        type: "url",
        required: true,
        placeholder: "https://github.com/org/project-name"
      }
    ]
  },

  // ── OWASP SIES GST ───────────────────────────────────────────
  {
    communityKey: "owasp@campus.edu",
    title: "CyberSiege CTF 2026 — Capture The Flag Tournament",
    category: "Competition",
    registrationType: "team",
    teamSize: { min: 1, max: 3 },
    price: 0,
    capacity: 65,
    daysFromBase: 19, // Sept 20, 2026
    durationHours: 10,
    regDeadlineDays: 16,
    venue: "Cyber Security Lab & Virtual Portal, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    tags: ["ctf", "cybersecurity", "websec", "reverse-engineering", "cryptography", "owasp"],
    description:
      "Gear up for CyberSiege CTF, SIES GST's most anticipated collegiate security competition. Test your ethical hacking prowess across challenging categories including Web Security (XSS, SQLi, SSRF, IDOR), Reverse Engineering (Ghidra & Radare2), Binary Exploitation (Buffer Overflows, ROP chains), Modern Cryptography (RSA attacks, Elliptic Curves), Digital Forensics, and OSINT. Real-time dynamic scoring matrix with first-blood bonuses and hardware hacking gadgets for winners.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "I certify that all offensive security tools and exploitation techniques will be strictly confined to the authorized CyberSiege CTF target infrastructure. Any attacks against college network assets or out-of-scope machines will result in disciplinary action.",
    confirmationMessage: "Team registered for CyberSiege CTF! Your team token and CTFd login credentials will be emailed 1 hour before the opening countdown.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Devansh Rao",
      leadRole: "OWASP Chapter Lead",
      email: "owasp@campus.edu",
      phone: "+91 98204 55667",
      deskLocation: "Cyber Security Lab, 4th Floor",
      building: "Main Academic Building",
      room: "Lab 5",
      floor: "4th Floor",
      emailSLA: "Within 2 hours during event",
      operatingHours: "08:00 AM – 09:00 PM",
    },
    agenda: [
      { phase: "09:30 AM – 10:00 AM", title: "Rules Briefing & Scoreboard Sync", desc: "Flag format explanation, dynamic scoring decay curve, and platform sanity test." },
      { phase: "10:00 AM – 01:00 PM", title: "Round 1: Web Exploitation & OSINT Warmup", desc: "First wave of challenges unlocked across all 6 skill categories." },
      { phase: "01:00 PM – 02:00 PM", title: "Tactical Lunch & Scoreboard Freeze", desc: "Scoreboard hidden for the top 5 teams to build suspense." },
      { phase: "02:00 PM – 06:30 PM", title: "Round 2: Hard Binary Exploitation & Crypto Bosses", desc: "High-point challenges and hidden boss flags go live." },
      { phase: "07:00 PM – 08:00 PM", title: "Scoreboard Reveal, Writeup Talks & Awards", desc: "Top hackers present short writeups of critical exploits; prize distribution." }
    ],
    rules: [
      "Attacking the CTFd scoreboard infrastructure or other competitors' workstations is strictly forbidden.",
      "Sharing flags or solutions between distinct teams results in zero-score disqualification.",
      "Automated heavy-rate denial of service (DoS/DDoS) against challenge servers is prohibited.",
      "Flag format is always flag{...} unless explicitly specified in challenge notes."
    ],
    faqs: [
      { q: "Is CyberSiege suitable for complete CTF beginners?", a: "Yes! There are dedicated 'Warmup' and 'Easy' tier challenges designed to help beginners earn their first points." },
      { q: "What tools should we have ready?", a: "Kali Linux or Parrot OS VM, Burp Suite Community, Ghidra, Python 3 with pwntools, Wireshark, and CyberChef." }
    ],
    formQuestions: [
      {
        label: "Primary Team Specialization",
        type: "select",
        required: true,
        options: ["Web Exploitation & AppSec", "Reverse Engineering & Pwn", "Cryptography & Forensics", "General Balanced Squad"]
      },
      {
        label: "CTFtime Team URL (if applicable)",
        type: "url",
        required: false,
        placeholder: "https://ctftime.org/team/..."
      }
    ]
  },
  {
    communityKey: "owasp@campus.edu",
    title: "Defending Web Apps: OWASP Top 10 Hands-on Clinic",
    category: "Workshop",
    registrationType: "solo",
    price: 100,
    capacity: 50,
    daysFromBase: 35, // Oct 6, 2026
    durationHours: 5,
    regDeadlineDays: 32,
    venue: "Cyber Security Lab, 4th Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
    tags: ["appsec", "ethical-hacking", "burpsuite", "owasp", "security", "websec"],
    description:
      "A hands-on vulnerability analysis and secure coding masterclass using OWASP Juice Shop and Burp Suite Professional. Learn how attackers discover and exploit Broken Access Controls (IDOR), SQL injection bypasses, Server-Side Request Forgery (SSRF), JWT token forging, and Cross-Site Scripting (XSS). Learn defensive remediation strategies, parameterized queries, and Content Security Policy (CSP) implementation.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "I agree to use the security testing tools only against the isolated lab containers provided during this workshop.",
    confirmationMessage: "Registration confirmed! Please install Burp Suite Community Edition on your machine before the session.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Devansh Rao",
      leadRole: "OWASP Lead",
      email: "owasp@campus.edu",
      phone: "+91 98204 11223",
      deskLocation: "Cyber Lab 5 Desk",
      building: "Main Academic Building",
      room: "Lab 5",
      floor: "4th Floor",
      emailSLA: "Within 6 hours",
      operatingHours: "10:00 AM – 04:00 PM",
    },
    agenda: [
      { phase: "10:00 AM – 11:30 AM", title: "Burp Suite Interception & HTTP Recon", desc: "Setting up browser proxies, analyzing request headers, and fuzzing endpoints with Intruder." },
      { phase: "11:45 AM – 01:00 PM", title: "Exploiting Injection & Broken Authentication", desc: "SQLmap deep dive, blind SQL injection extraction, and JWT signature bypass." },
      { phase: "01:00 PM – 02:00 PM", title: "Networking Lunch", desc: "Discussion on AppSec careers and bug bounty hunting tips." },
      { phase: "02:00 PM – 03:00 PM", title: "Remediation & Secure Code Audits", desc: "Patching vulnerable NodeJS/Python code and configuring WAF rules." }
    ],
    rules: [
      "All exploits must be performed against local Dockerized instances only.",
      "Bring personal laptops with Docker Desktop installed."
    ],
    faqs: [
      { q: "Is prior hacking experience needed?", a: "Basic understanding of how web applications and HTTP requests work is all that is required." }
    ],
    formQuestions: [
      {
        label: "Do you have Burp Suite or OWASP ZAP installed?",
        type: "radio",
        required: true,
        options: ["Yes, Burp Suite Community", "Yes, OWASP ZAP", "Need assistance installing"]
      }
    ]
  },

  // ── E-CELL (ENTREPRENEURSHIP CELL) ───────────────────────────
  {
    communityKey: "ecell@campus.edu",
    title: "VentureCraft '26 — Startup Pitch & Investor Demo Day",
    category: "Competition",
    registrationType: "team",
    teamSize: { min: 2, max: 5 },
    price: 250,
    capacity: 30, // team slots
    daysFromBase: 53, // Oct 24, 2026
    durationHours: 8,
    regDeadlineDays: 48,
    venue: "Main Auditorium & Executive Boardroom, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&auto=format&fit=crop&q=80",
    tags: ["startups", "pitching", "angel-investors", "business", "entrepreneurship", "ecell"],
    description:
      "VentureCraft is SIES GST's flagship entrepreneurial showdown connecting ambitious student innovators with venture capitalists, prominent angel investors, and incubators. Pitch your early-stage tech, SaaS, deep-tech, or social venture in front of our distinguished jury. Finalists compete for ₹2,50,000 in non-dilutive seed grants, 6 months of free co-working and legal incorporation support at SIES Incubation Center, and fast-tracked angel funding rounds.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "VentureCraft pitch registration received! Your deck review slot and executive mentor briefing will be communicated via email.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Ishaan Verma",
      leadRole: "President, E-Cell",
      email: "ecell@campus.edu",
      phone: "+91 98205 66778",
      deskLocation: "Innovation & Incubation Cell Office",
      building: "Innovation Hub",
      room: "Room 102",
      floor: "1st Floor",
      emailSLA: "Within 12 hours",
      operatingHours: "10:00 AM – 06:00 PM",
    },
    agenda: [
      { phase: "09:00 AM – 10:00 AM", title: "Founder Registration & Pitch Deck Submission", desc: "Final deck validation, audio-visual check, and investor round-table seating." },
      { phase: "10:00 AM – 01:00 PM", title: "Preliminary Pitch Round (Track A: Tech & Track B: Consumer/Social)", desc: "Each team gets 6 minutes to pitch followed by 4 minutes of intense jury Q&A." },
      { phase: "01:00 PM – 02:00 PM", title: "Networking Lunch with Angel Investors", desc: "Private networking buffet between founders and attending venture partners." },
      { phase: "02:15 PM – 05:00 PM", title: "Grand Finale: Top 8 Finalist Pitches on Main Stage", desc: "Top finalists pitch on the auditorium stage with live term-sheet interest indications." },
      { phase: "05:00 PM – 06:00 PM", title: "Seed Grant Announcement & Incubation Onboarding", desc: "Awarding of seed grants, incubation letters, and investor closing remarks." }
    ],
    rules: [
      "Startups can be at idea stage, prototype stage, or early revenue stage.",
      "Pitch decks must not exceed 12 slides (Problem, Solution, TAM/SAM/SOM, Tech Stack, Business Model, Competitors, Financials, Team).",
      "All presentations must be delivered live by registered student founders."
    ],
    faqs: [
      { q: "Does E-Cell take equity in competing startups?", a: "No, VentureCraft grants are 100% non-dilutive equity-free prize money." },
      { q: "Can solo founders participate?", a: "Teams of at least 2 members are required to encourage co-founder collaboration." }
    ],
    formQuestions: [
      {
        label: "Startup Venture Name & Tagline",
        type: "text",
        required: true,
        placeholder: "e.g. EcoRoute — AI-powered municipal waste routing"
      },
      {
        label: "Startup Sector / Domain",
        type: "select",
        required: true,
        options: ["FinTech & Web3", "HealthTech & BioTech", "CleanTech & Sustainability", "EdTech & Learning", "B2B SaaS & AI Tools", "Consumer & D2C"]
      },
      {
        label: "Current Startup Stage",
        type: "radio",
        required: true,
        options: ["Idea / Conceptual Stage", "Working Prototype / MVP Built", "Early Beta Users / Pilot Testing", "Generating Revenue"]
      },
      {
        label: "Pitch Deck Link (Google Slides or PDF URL)",
        type: "url",
        required: true,
        placeholder: "https://drive.google.com/..."
      }
    ]
  },
  {
    communityKey: "ecell@campus.edu",
    title: "Fireside Chat: From Campus Dorm to Series A Startup",
    category: "Tech Talk",
    registrationType: "solo",
    price: 0,
    capacity: 150,
    daysFromBase: 14, // Sept 15, 2026
    durationHours: 2.5,
    regDeadlineDays: 12,
    venue: "Seminar Hall 1, 1st Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop&q=80",
    tags: ["startups", "founder-story", "venture-capital", "product", "growth", "techtalk"],
    description:
      "An unscripted, candid fireside talk with SIES GST alumnus and founder of a $12M-backed FinTech scaleup. Learn the raw realities of cold-emailing initial investors, validating user demand before writing code, navigating founder conflicts, and scaling systems to over 500,000 monthly active users. Open AMA session included.",
    collectProfileData: false,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Seat reserved! Arrive by 04:15 PM for priority auditorium seating.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Ishaan Verma",
      leadRole: "E-Cell President",
      email: "ecell@campus.edu",
      phone: "+91 98205 11223",
      deskLocation: "Innovation Cell",
      building: "Innovation Hub",
      room: "Room 102",
      floor: "1st Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "10:00 AM – 04:00 PM",
    },
    agenda: [
      { phase: "04:30 PM – 04:45 PM", title: "Welcome & Speaker Introduction", desc: "Brief retrospective on speaker's journey from SIES GST student to founder." },
      { phase: "04:45 PM – 05:45 PM", title: "Fireside Discussion: The 0-to-1 Journey", desc: "Finding product-market fit, handling early rejections, and hiring engineering talent." },
      { phase: "05:45 PM – 06:30 PM", title: "Open Audience AMA & 1-on-1 Chats", desc: "Direct question and answer round with audience members." }
    ],
    rules: [
      "Audience seating is strictly first-come, first-served on the day of the talk."
    ],
    faqs: [
      { q: "Can I pitch my startup idea to the speaker?", a: "Yes! There will be 20 minutes of informal 1-on-1 networking after the session." }
    ],
    formQuestions: [
      {
        label: "One burning question you'd like to ask the founder",
        type: "textarea",
        required: true,
        placeholder: "What was your biggest pivot before achieving product-market fit?"
      }
    ]
  },

  // ── IETE STUDENT FORUM (TECHXTER) ────────────────────────────
  {
    communityKey: "iete@campus.edu",
    title: "Techxter 2026: National Technical Project Expo",
    category: "Competition",
    registrationType: "team",
    teamSize: { min: 2, max: 4 },
    price: 200,
    capacity: 40,
    daysFromBase: 47, // Oct 18, 2026
    durationHours: 8,
    regDeadlineDays: 42,
    venue: "Engineering Quadrangle & Electronics Lab 4, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80",
    tags: ["project-expo", "hardware", "iot", "robotics", "electronics", "telecom"],
    description:
      "Techxter 2026 is SIES GST's annual national technical project exhibition providing undergraduate engineering students a prestigious stage to exhibit functioning hardware prototypes, embedded IoT devices, robotics models, and telecom innovations. Evaluated by senior IEEE/IETE technical committee members and industry R&D directors with ₹60,000 in category awards.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "We agree to operate all electrical circuits within safe voltage limits (<50V unless enclosed in grounded protective chassis).",
    confirmationMessage: "Project booth allocated! Your team table number and power specifications have been logged.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Rohan Bhatt",
      leadRole: "IETE Convener",
      email: "iete@campus.edu",
      phone: "+91 98206 77889",
      deskLocation: "Electronics Lab 4 Entry",
      building: "Main Academic Building",
      room: "Lab 4",
      floor: "2nd Floor",
      emailSLA: "Within 12 hours",
      operatingHours: "09:00 AM – 05:00 PM",
    },
    agenda: [
      { phase: "09:30 AM – 10:30 AM", title: "Booth Setup & Hardware Inspection", desc: "Teams arrange hardware prototypes, poster stands, and power supplies in their assigned booths." },
      { phase: "10:30 AM – 01:00 PM", title: "Jury Round 1: Technical & Circuit Verification", desc: "Judges evaluate schematic design, component selection, and live hardware demonstration." },
      { phase: "01:00 PM – 02:00 PM", title: "Lunch Break", desc: "Lunch served to all registered exhibitors." },
      { phase: "02:00 PM – 04:30 PM", title: "Open Public Expo & Industry Evaluation", desc: "Students and visiting industry recruiters explore booths and vote for People's Choice Award." },
      { phase: "04:45 PM – 05:30 PM", title: "Valedictory & Prize Distribution", desc: "Best Project in Hardware, Best IoT Solution, and Innovation Champion trophies awarded." }
    ],
    rules: [
      "Every project booth must display a functioning live prototype and a standard A1-sized technical poster.",
      "Projects using open flames, dangerous chemicals, or exposed high-voltage AC lines are prohibited."
    ],
    faqs: [
      { q: "Will 230V AC power and extension sockets be available?", a: "Yes, each booth is supplied with a dedicated 230V power point and extension strip." }
    ],
    formQuestions: [
      {
        label: "Project Title & Brief Hardware Description",
        type: "textarea",
        required: true,
        placeholder: "e.g. Autonomous Solar-Powered Agricultural Rover with LoRa Telemetry"
      },
      {
        label: "Hardware Domain Category",
        type: "select",
        required: true,
        options: ["IoT & Smart Agriculture", "Robotics & Automation", "Bio-Medical & Assistive Tech", "Telecommunications & RF", "Power & Clean Energy"]
      }
    ]
  },

  // ── SAE STUDENT CHAPTER ──────────────────────────────────────
  {
    communityKey: "sae@campus.edu",
    title: "Baja SAE Powertrain Design & Telemetry Workshop",
    category: "Workshop",
    registrationType: "solo",
    price: 150,
    capacity: 40,
    daysFromBase: 29, // Sept 30, 2026
    durationHours: 6,
    regDeadlineDays: 26,
    venue: "Mechanical Workshop & CAD Center, Ground Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
    tags: ["automotive", "cad", "telemetry", "baja", "mechanical", "sae"],
    description:
      "Dive into high-performance off-road automotive engineering with the team behind SIES GST's national Baja SAE buggy. Master continuously variable transmission (CVT) tuning, gearbox ratio optimization, brake bias calculation, suspension kinematics in Lotus Shark, and live CAN-bus telemetry sensor logging using Arduino and Grafana dashboards.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "I agree to wear closed-toe safety shoes inside the mechanical workshop and follow lab safety instructions.",
    confirmationMessage: "Workshop seat confirmed! Please wear safety footwear on the day of the session.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Yash Deshmukh",
      leadRole: "Captain, Team SAE",
      email: "sae@campus.edu",
      phone: "+91 98207 88990",
      deskLocation: "SAE Workshop Office",
      building: "Mechanical Workshop Building",
      room: "CAD Lab",
      floor: "Ground Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "10:00 AM – 05:00 PM",
    },
    agenda: [
      { phase: "10:00 AM – 11:30 AM", title: "Baja Vehicle Dynamics & Drivetrain Math", desc: "Torsional stress calculation, gear reduction ratios, and CVT engagement RPM analysis." },
      { phase: "11:45 AM – 01:15 PM", title: "CAD / FEA Modeling of Custom Gearboxes", desc: "SolidWorks stress analysis, weight reduction pocketing, and bearing selection." },
      { phase: "01:15 PM – 02:00 PM", title: "Workshop Lunch", desc: "Lunch break and buggy walkaround." },
      { phase: "02:00 PM – 04:00 PM", title: "Hands-on Teardown & Live Telemetry Logging", desc: "Live disassembly of Briggs & Stratton engine + CVT and telemetry sensor wiring." }
    ],
    rules: [
      "Closed-toe shoes and safety glasses are mandatory inside the fabrication area."
    ],
    faqs: [
      { q: "Is this workshop open to students outside Mechanical Engineering?", a: "Yes! Students interested in automotive electronics, telemetry software, and CAD design are welcome." }
    ],
    formQuestions: [
      {
        label: "Department & Year of Study",
        type: "text",
        required: true,
        placeholder: "e.g. Mechanical Engineering 2nd Year"
      },
      {
        label: "CAD Software Experience Level",
        type: "select",
        required: true,
        options: ["Beginner (learning 3D modeling)", "SolidWorks / Fusion 360 proficient", "Advanced FEA & CFD user"]
      }
    ]
  },

  // ── ISHRAE STUDENT CHAPTER ───────────────────────────────────
  {
    communityKey: "ishrae@campus.edu",
    title: "Industrial HVAC & Cleanroom Standards Field Seminar",
    category: "Seminar",
    registrationType: "solo",
    price: 0,
    capacity: 80,
    daysFromBase: 65, // Nov 5, 2026
    durationHours: 3,
    regDeadlineDays: 60,
    venue: "Mechanical Seminar Hall, 2nd Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1200&auto=format&fit=crop&q=80",
    tags: ["hvac", "sustainability", "mep", "green-building", "cleanroom", "ishrae"],
    description:
      "A specialized technical seminar on energy-efficient chilled water systems, psychrometric load analysis, and ISO cleanroom air filtration standards for semiconductor fab units and pharmaceutical manufacturing facilities. Guest keynote by Chief MEP Consultant from Blue Star Ltd.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Registration confirmed for the ISHRAE Technical Seminar.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Kabir Shah",
      leadRole: "ISHRAE Student Chapter President",
      email: "ishrae@campus.edu",
      phone: "+91 98208 11234",
      deskLocation: "Mechanical Department Office",
      building: "Main Academic Building",
      room: "Room 214",
      floor: "2nd Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "11:00 AM – 03:00 PM",
    },
    agenda: [
      { phase: "02:00 PM – 02:20 PM", title: "Opening Address & ISHRAE Overview", desc: "Introduction to green building certifications (LEED / IGBC)." },
      { phase: "02:20 PM – 03:45 PM", title: "Industrial Psychrometrics & Cleanroom HVAC", desc: "Air handling unit (AHU) sizing, HEPA filtration stages, and positive pressure design." },
      { phase: "04:00 PM – 05:00 PM", title: "Case Study: Net-Zero Energy Buildings", desc: "Variable refrigerant flow (VRF) innovations and student career prospects in MEP consulting." }
    ],
    rules: [
      "Please occupy seats 10 minutes prior to session commencement."
    ],
    faqs: [
      { q: "Will certificates be provided by ISHRAE Mumbai Chapter?", a: "Yes, verified e-certificates will be provided to all attendees." }
    ],
    formQuestions: [
      {
        label: "Your primary career goal in Thermal / Energy Systems",
        type: "text",
        required: true,
        placeholder: "e.g. Sustainable green building design & energy auditing"
      }
    ]
  },

  // ── LITERARY CLUB ────────────────────────────────────────────
  {
    communityKey: "literaryclub@campus.edu",
    title: "Gravitas '26 — Parliamentary Debate & Spoken Word Slam",
    category: "Cultural",
    registrationType: "solo",
    price: 50,
    capacity: 60,
    daysFromBase: 41, // Oct 12, 2026
    durationHours: 6,
    regDeadlineDays: 38,
    venue: "Library Discussion Hall & Open Amphitheatre, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop&q=80",
    tags: ["debate", "poetry", "spokenword", "literary", "public-speaking"],
    description:
      "Gravitas '26 is the annual literary festival celebrating eloquence, rhetoric, critical thought, and poetic expression. Featuring two headline tournaments: the Asian Parliamentary Debate on contemporary geopolitical and philosophical motions, and the Sunset Spoken Word Slam where student bards perform original slam poetry, spoken word verses, and monologues.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Registered for Gravitas '26! Motion sheets and performance rules will be shared on October 10.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Ananya Iyer",
      leadRole: "President, Literary Club",
      email: "literaryclub@campus.edu",
      phone: "+91 98209 22334",
      deskLocation: "Central Library Information Desk",
      building: "Library Building",
      room: "Discussion Room",
      floor: "1st Floor",
      emailSLA: "Within 12 hours",
      operatingHours: "10:00 AM – 05:00 PM",
    },
    agenda: [
      { phase: "11:00 AM – 11:30 AM", title: "Debate Adjudication Briefing", desc: "Briefing on Asian Parliamentary rules, point of information (POI) guidelines, and scoring criteria." },
      { phase: "11:30 AM – 02:00 PM", title: "Preliminary Debate Rounds 1 & 2", desc: "Simultaneous debate matches across 4 library committee chambers." },
      { phase: "02:00 PM – 02:45 PM", title: "Networking Lunch & Refreshments", desc: "Catered lunch for all debaters and slam poets." },
      { phase: "03:00 PM – 04:30 PM", title: "Sunset Spoken Word & Poetry Slam", desc: "Original poetry performances under amphitheatre stage lights." },
      { phase: "04:30 PM – 05:00 PM", title: "Grand Debate Final & Award Ceremony", desc: "Final motion showdown, best speaker citations, and cash prizes." }
    ],
    rules: [
      "Parliamentary speeches are timed at 7 minutes per speaker with protected minutes.",
      "Poetry slam pieces must be original work within a 3-minute time limit.",
      "Unparliamentary language or hate speech is strictly disqualified."
    ],
    faqs: [
      { q: "Can I enter both the debate and the poetry slam?", a: "Yes, schedules are coordinated so participants can compete in both events." }
    ],
    formQuestions: [
      {
        label: "Select your competition category",
        type: "select",
        required: true,
        options: ["Asian Parliamentary Debate", "Spoken Word / Poetry Slam", "Both Debate & Poetry Slam"]
      },
      {
        label: "Language of Poetry Performance (for Slam entrants)",
        type: "select",
        required: false,
        options: ["English", "Hindi", "Marathi", "Multilingual"]
      }
    ]
  },

  // ── AARAMBH - THE THEATRE CLUB ───────────────────────────────
  {
    communityKey: "aarambh@campus.edu",
    title: "Rangmanch: Inter-College Street Play Competition (Nukkad Natak)",
    category: "Cultural",
    registrationType: "team",
    teamSize: { min: 6, max: 15 },
    price: 300,
    capacity: 20,
    daysFromBase: 74, // Nov 14, 2026
    durationHours: 8,
    regDeadlineDays: 68,
    venue: "College Central Courtyard & Open Amphitheatre, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&auto=format&fit=crop&q=80",
    tags: ["theatre", "nukkad-natak", "street-play", "drama", "social-issues", "acting"],
    description:
      "Rangmanch is SIES GST's grand annual street theatre festival where dynamic troupes battle it out through high-octane Nukkad Natak performances. Portray impactful social themes using powerful voice projection, synchronized formations, live acoustic instruments (Dholak, Duff, Manjira), and compelling dialogues. Witness Mumbai's finest collegiate dramatic energy live in the central courtyard!",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "Our troupe agrees to adhere to the time limits and avoid use of fire, synthetic colors, or hazardous props in the open arena.",
    confirmationMessage: "Troupe entry confirmed! Your performance slot and green room assignment will be finalized on Nov 10.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Vivaan Joshi",
      leadRole: "General Secretary, Aarambh",
      email: "aarambh@campus.edu",
      phone: "+91 98200 44332",
      deskLocation: "Main Auditorium Green Room",
      building: "Auditorium Wing",
      room: "Green Room 1",
      floor: "Ground Floor",
      emailSLA: "Within 12 hours",
      operatingHours: "01:00 PM – 07:00 PM",
    },
    agenda: [
      { phase: "10:00 AM – 11:00 AM", title: "Troupe Registration & Sound Check", desc: "Green room allocation, acoustic instrument checks, and slot draw." },
      { phase: "11:00 AM – 02:00 PM", title: "Morning Street Play Showdowns", desc: "Performances by teams 1 through 10 in the central courtyard." },
      { phase: "02:00 PM – 02:45 PM", title: "Lunch Break", desc: "Refreshments and lunch for all registered artists." },
      { phase: "02:45 PM – 05:15 PM", title: "Afternoon Street Play Showdowns", desc: "Performances by teams 11 through 20." },
      { phase: "05:30 PM – 06:00 PM", title: "Awards Ceremony", desc: "Best Troupe, Best Script, and Best Actor/Director awards presented by celebrity theatre judges." }
    ],
    rules: [
      "Performance time limit: 12 minutes (+ 2 minutes setup/clearance). Negative marks for exceeding 14 minutes.",
      "Live music only (Dholak, Duff, Harmonica, Flute). No pre-recorded electronic tracks or microphones.",
      "Costume must include traditional Kurta/Jeans or coordinated street theatre attire."
    ],
    faqs: [
      { q: "Can we use props?", a: "Yes, handheld props like Dupattas, sticks (Lathis), banners, and signs are allowed." }
    ],
    formQuestions: [
      {
        label: "Street Play Title & Core Social Theme",
        type: "textarea",
        required: true,
        placeholder: "e.g. 'Awaaz' — A play addressing digital mental health and cyberbullying"
      },
      {
        label: "Live Instruments Used by Troupe",
        type: "text",
        required: true,
        placeholder: "e.g. Dholak, 2x Duff, Gully percussions"
      }
    ]
  },

  // ── MOKSH - DANCE GROUP ──────────────────────────────────────
  {
    communityKey: "moksh@campus.edu",
    title: "StepUp '26 — Western & Street Dance Showdown",
    category: "Cultural",
    registrationType: "team",
    teamSize: { min: 4, max: 12 },
    price: 250,
    capacity: 25,
    daysFromBase: 82, // Nov 22, 2026
    durationHours: 6.5,
    regDeadlineDays: 76,
    venue: "Main Auditorium Stage, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&auto=format&fit=crop&q=80",
    tags: ["dance", "hiphop", "streetdance", "choreography", "battle", "moksh"],
    description:
      "StepUp '26 is SIES GST's mega inter-collegiate western and street dance competition. Experience heart-pounding beats, gravity-defying stunts, slick hip-hop formations, popping, locking, and house routines on our state-of-the-art auditorium stage equipped with professional concert lighting and acoustic sound systems. Special 1v1 All-Styles cipher showdown during intermission!",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "Our dance crew certifies that all aerial stunts have been safely rehearsed and we take responsibility for safe execution.",
    confirmationMessage: "Dance crew registered! Please submit your edited audio track (MP3/WAV, 320kbps) by Nov 18.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Aditi Rane",
      leadRole: "Captain, Moksh",
      email: "moksh@campus.edu",
      phone: "+91 98200 55667",
      deskLocation: "Student Activity Center Studio",
      building: "Student Activity Center",
      room: "Dance Studio",
      floor: "1st Floor",
      emailSLA: "Within 6 hours",
      operatingHours: "02:00 PM – 08:00 PM",
    },
    agenda: [
      { phase: "02:00 PM – 03:00 PM", title: "Stage Rehearsals & Lighting Cues", desc: "1-minute stage mark-up and lighting check for each competing crew." },
      { phase: "03:15 PM – 05:45 PM", title: "Main Crew Choreography Battles", desc: "High-voltage group dance showcases in front of celebrity choreographer judges." },
      { phase: "06:00 PM – 07:15 PM", title: "1v1 All-Styles Open Cipher", desc: "Top 8 individual dancers battle head-to-head on live DJ tracks." },
      { phase: "07:30 PM – 08:30 PM", title: "Results Announcement & Moksh Showcase", desc: "Special guest showcase performance and trophy presentations." }
    ],
    rules: [
      "Group routine time limit: 5 to 7 minutes.",
      "Audio tracks must be submitted 4 days prior via the upload link; bring a backup on a USB pen drive.",
      "Powder, liquids, fire, and hazardous stage props are strictly prohibited."
    ],
    faqs: [
      { q: "What is the stage dimension?", a: "The main auditorium stage is 40 feet wide by 28 feet deep with non-slip vinyl flooring." }
    ],
    formQuestions: [
      {
        label: "Dance Style / Genre",
        type: "select",
        required: true,
        options: ["Hip-Hop / Urban Choreography", "Popping & Locking", "Contemporary / Lyrical", "Fusion / All-Styles"]
      },
      {
        label: "Audio Track Google Drive Link",
        type: "url",
        required: true,
        placeholder: "https://drive.google.com/..."
      }
    ]
  },

  // ── MUSIC CLUB ───────────────────────────────────────────────
  {
    communityKey: "musicclub@campus.edu",
    title: "Acoustica — Unplugged Open Mic & Acoustic Jam Night",
    category: "Cultural",
    registrationType: "solo",
    price: 0,
    capacity: 100,
    daysFromBase: 21, // Sept 22, 2026
    durationHours: 3.5,
    regDeadlineDays: 19,
    venue: "Student Activity Center Terrace & Music Lounge, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
    tags: ["music", "openmic", "acoustic", "singing", "band", "jam"],
    description:
      "An enchanting evening of acoustic melodies, soulful vocal solos, fingerstyle guitar instrumentals, and open collaborative jams under fairy lights on the SAC terrace. Whether you're an experienced singer-songwriter testing out original tunes or an enthusiastic vocalist eager to perform your favorite indie acoustic covers, Acoustica is the place to be.",
    collectProfileData: false,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "You're registered for Acoustica! Arrive by 04:45 PM for mic checks if you registered to perform.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Arjun Menon",
      leadRole: "Head, Music Club",
      email: "musicclub@campus.edu",
      phone: "+91 98200 66778",
      deskLocation: "Music Room 1",
      building: "Student Activity Center",
      room: "Music Room",
      floor: "Ground Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "03:00 PM – 07:00 PM",
    },
    agenda: [
      { phase: "05:00 PM – 05:30 PM", title: "Acoustic Tuning & Terrace Seating", desc: "Warmup acoustic sets and welcome chai & snacks." },
      { phase: "05:30 PM – 07:15 PM", title: "Live Open Mic Performances", desc: "15 curated acoustic vocalists and instrumental solos." },
      { phase: "07:30 PM – 08:30 PM", title: "The Grand Jam: Music Club Band", desc: "Collaborative ensemble jam featuring guitars, cajon, keyboard, and guest student vocalists." }
    ],
    rules: [
      "Open mic performers get a maximum of 5 minutes (1 song).",
      "Only acoustic and semi-acoustic instruments allowed (acoustic guitar, cajon, violin, ukulele, keyboard)."
    ],
    faqs: [
      { q: "Can I just attend as an audience member?", a: "Absolutely! Audience members are warmly welcome to register for free and enjoy the music." }
    ],
    formQuestions: [
      {
        label: "Attending as Audience or Performer?",
        type: "radio",
        required: true,
        options: ["Audience Member", "Solo Vocalist Performer", "Instrumentalist Performer", "Duo Acoustic Act"]
      },
      {
        label: "Song Title / Instrument Details (if performing)",
        type: "text",
        required: false,
        placeholder: "e.g. Acoustic cover of 'Yellow' by Coldplay (Acoustic Guitar + Vocals)"
      }
    ]
  },

  // ── SIESIT TECH COUNCIL ──────────────────────────────────────
  {
    communityKey: "siesiet@gmail.com",
    title: "Campus Sports Arena '26 — 5v5 Futsal & Box Cricket Cup",
    category: "Sports",
    registrationType: "team",
    teamSize: { min: 5, max: 7 },
    price: 500,
    capacity: 32, // team slots
    daysFromBase: 32, // Oct 3, 2026
    durationHours: 32,
    regDeadlineDays: 28,
    venue: "College Turf & Multi-Purpose Sports Complex, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&auto=format&fit=crop&q=80",
    tags: ["futsal", "cricket", "sports", "football", "tournament", "council"],
    description:
      "SIES GST's premier weekend sports carnival! Grab your departmental squad to battle in fast-paced 5v5 Futsal on the state-of-the-art synthetic turf, or compete in the high-scoring Box Cricket league. Running over two action-packed days with professional referees, live score broadcasting, MVP cash prizes, winner trophies, and custom champion jerseys.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: true,
    waiverText: "All team members certify that they are physically fit to participate in competitive athletic matches and agree to play with good sportsmanship.",
    confirmationMessage: "Team registered for Sports Arena '26! Fixture schedules will be released on Sept 30.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Siddhesh Wagh",
      leadRole: "Sports Secretary, Tech Council",
      email: "siesiet@gmail.com",
      phone: "+91 98200 77889",
      deskLocation: "Sports Council Desk, Ground Floor",
      building: "Sports Complex",
      room: "Sports Office",
      floor: "Ground Floor",
      emailSLA: "Within 6 hours",
      operatingHours: "08:00 AM – 06:00 PM",
    },
    agenda: [
      { phase: "08:30 AM – 09:30 AM", title: "Captain Check-In & Fixture Toss", desc: "Jersey verification, toss, and referee rules briefing." },
      { phase: "09:30 AM – 01:30 PM", title: "Group Stage Knockouts (Round of 32 & 16)", desc: "Simultaneous 20-minute matches across Futsal and Box Cricket grounds." },
      { phase: "01:30 PM – 02:30 PM", title: "Lunch Break & Energy Hydration", desc: "Electrolyte drinks and high-protein sports lunch." },
      { phase: "02:30 PM – 06:00 PM", title: "Quarter-Finals & Semi-Finals", desc: "Top 8 squads battle for championship berths." },
      { phase: "04:30 PM (Day 2)", title: "Grand Finals & Trophy Presentation", desc: "Championship matches followed by medal ceremony and Player of Tournament honors." }
    ],
    rules: [
      "Teams must consist of 5 active players and up to 2 rolling substitutes.",
      "Turf shoes or flat-soled sneakers are required on the synthetic turf (no metal studs).",
      "Referee decisions are final and binding on all disciplinary matters."
    ],
    faqs: [
      { q: "Can a player represent two teams?", a: "No, a student may only be listed on one team roster across the tournament." }
    ],
    formQuestions: [
      {
        label: "Sport Tournament Selection",
        type: "select",
        required: true,
        options: ["5v5 Turf Futsal Cup", "6v6 Box Cricket League"]
      },
      {
        label: "Team Jersey Color Preference",
        type: "text",
        required: true,
        placeholder: "e.g. Navy Blue / Black"
      }
    ]
  },
  {
    communityKey: "siesiet@gmail.com",
    title: "Mastering System Design & Distributed Microservices",
    category: "Tech Talk",
    registrationType: "solo",
    price: 0,
    capacity: 130,
    daysFromBase: 57, // Oct 28, 2026
    durationHours: 2.5,
    regDeadlineDays: 54,
    venue: "Auditorium, 1st Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
    tags: ["system-design", "microservices", "kafka", "scalability", "backend", "techtalk"],
    description:
      "A deep technical breakdown by a Staff Backend Architect from a tier-1 technology giant. Demystify high-throughput distributed architectures, event-driven messaging with Apache Kafka, idempotent payment flows, database sharding strategies, CAP theorem trade-offs, and distributed tracing with OpenTelemetry. Perfect for students preparing for high-impact backend engineering interviews.",
    collectProfileData: false,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Pass issued! System design architecture cheatsheet will be emailed after the talk.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Siddhesh Wagh",
      leadRole: "Tech Council Head",
      email: "siesiet@gmail.com",
      phone: "+91 98200 88990",
      deskLocation: "Tech Council Room",
      building: "Main Academic Building",
      room: "Room 105",
      floor: "1st Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "11:00 AM – 04:00 PM",
    },
    agenda: [
      { phase: "03:30 PM – 04:30 PM", title: "Architecture Case Study: 1 Million RPS Flash Sale System", desc: "Caching layers (Redis), rate limiters, connection pools, and database connection pooling." },
      { phase: "04:30 PM – 05:15 PM", title: "Event-Driven Microservices & SAGA Pattern", desc: "Handling distributed transactions and eventual consistency with Kafka." },
      { phase: "05:15 PM – 06:00 PM", title: "Live System Design Interview Walkthrough & Q&A", desc: "Live mock design of TinyURL / Uber backend with audience participation." }
    ],
    rules: [
      "Auditorium doors open at 03:00 PM."
    ],
    faqs: [
      { q: "Is this talk beneficial for 2nd and 3rd year students?", a: "Yes, all core concepts are introduced from fundamental network principles up to production scale." }
    ],
    formQuestions: [
      {
        label: "What backend language / framework do you primarily use?",
        type: "select",
        required: true,
        options: ["Node.js / Express / NestJS", "Java / Spring Boot", "Python / FastAPI / Django", "Go / Rust", "C++ / Systems"]
      }
    ]
  },

  // ── AAGMI - THE FOLK DANCE CREW ──────────────────────────────
  {
    communityKey: "aagmi@campus.edu",
    title: "Dharohar: Classical & Folk Dance Showcase",
    category: "Cultural",
    registrationType: "solo",
    price: 0,
    capacity: 75,
    daysFromBase: 88, // Nov 28, 2026
    durationHours: 3.5,
    regDeadlineDays: 85,
    venue: "Main Auditorium, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&auto=format&fit=crop&q=80",
    tags: ["classical", "folk-dance", "heritage", "culture", "performance", "aagmi"],
    description:
      "Dharohar brings India's vibrant cultural heritage to life through mesmerizing folk and classical dance performances. Witness traditional Garba, dynamic Maharashtrian Lavani, energetic Punjabi Bhangra, and graceful Bharatnatyam routines curated and performed by SIES GST's award-winning folk crew Aagmi along with guest collegiate troupes.",
    collectProfileData: false,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Complimentary pass issued for Dharohar Showcase.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Diya Kulkarni",
      leadRole: "Lead Choreographer, Aagmi",
      email: "aagmi@campus.edu",
      phone: "+91 98200 99001",
      deskLocation: "Dance Studio SAC",
      building: "Student Activity Center",
      room: "Studio 2",
      floor: "1st Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "02:00 PM – 06:00 PM",
    },
    agenda: [
      { phase: "04:00 PM – 04:30 PM", title: "Classical Invocation: Nataraj Vandana", desc: "Graceful Bharatnatyam and Kathak opening routines." },
      { phase: "04:30 PM – 06:00 PM", title: "Regional Folk Dance Extravaganza", desc: "Spectacular Lavani, Rajasthani Ghoomar, and Garba group routines." },
      { phase: "06:15 PM – 07:30 PM", title: "Grand Bhangra Finale & Audience Folk Circle", desc: "High-energy Bhangra performance followed by an open folk dance circle." }
    ],
    rules: [
      "Traditional Indian attire is encouraged for attendees."
    ],
    faqs: [
      { q: "Is entry free for students and parents?", a: "Yes, admission is completely free for all campus students and faculty." }
    ],
    formQuestions: [
      {
        label: "Number of guest family members accompanying you",
        type: "number",
        required: true,
        placeholder: "0"
      }
    ]
  },

  // ── CONCLUDED / PAST EVENTS (August 2026) ─────────────────────
  {
    communityKey: "csi@campus.edu",
    title: "Intro to Git, GitHub & Open Source Contribution",
    category: "Workshop",
    registrationType: "solo",
    price: 0,
    capacity: 70,
    daysFromBase: -18, // Aug 14, 2026
    durationHours: 3.5,
    regDeadlineDays: -20,
    venue: "Computer Engineering Lab 1, 3rd Floor, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=1200&auto=format&fit=crop&q=80",
    tags: ["git", "github", "opensource", "workshop", "csi"],
    description:
      "A comprehensive beginner workshop guiding freshmen through Git version control, branching strategies, resolving merge conflicts, crafting meaningful pull requests, and making their first open-source contributions during Hacktoberfest preparation.",
    collectProfileData: true,
    allowWaitlist: false,
    requireWaiver: false,
    confirmationMessage: "Workshop completed.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Aarav Mehta",
      leadRole: "CSI Lead",
      email: "csi@campus.edu",
      phone: "+91 98201 45678",
      deskLocation: "CSI Desk",
      building: "Main Academic Building",
      room: "Lab 1",
      floor: "3rd Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "10:00 AM – 04:00 PM",
    },
    agenda: [
      { phase: "02:00 PM – 03:30 PM", title: "Git Basics & Local Repositories", desc: "init, add, commit, branch, merge, and rebase." },
      { phase: "03:45 PM – 05:30 PM", title: "Collaborating on GitHub & Pull Requests", desc: "Forking, upstream tracking, and opening PRs." }
    ],
    rules: ["Bring personal laptop."],
    faqs: [{ q: "Was certificate provided?", a: "Yes, verified certificates were sent to all checked-in attendees." }],
    formQuestions: [
      {
        label: "GitHub Username",
        type: "text",
        required: true,
        placeholder: "octocat"
      }
    ]
  },
  {
    communityKey: "gdsc@campus.edu",
    title: "AI Prompt Engineering & LLM Agents 101",
    category: "Workshop",
    registrationType: "solo",
    price: 0,
    capacity: 65,
    daysFromBase: -10, // Aug 22, 2026
    durationHours: 3.5,
    regDeadlineDays: -12,
    venue: "Innovation & Incubation Cell, Room 204, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80",
    tags: ["ai", "genai", "promptengineering", "llm", "agents", "gdsc"],
    description:
      "A hands-on exploration of Prompt Engineering frameworks, chain-of-thought prompting, ReAct agent architectures, and calling external APIs using Gemini and LangChain Python.",
    collectProfileData: true,
    allowWaitlist: false,
    requireWaiver: false,
    confirmationMessage: "Workshop completed.",
    sendEmailReceipt: false,
    contact: {
      leadName: "Meera Nair",
      leadRole: "GDSC Lead",
      email: "gdsc@campus.edu",
      phone: "+91 98203 44556",
      deskLocation: "Innovation Cell",
      building: "Innovation Hub",
      room: "Room 204",
      floor: "2nd Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "10:00 AM – 04:00 PM",
    },
    agenda: [
      { phase: "02:00 PM – 03:30 PM", title: "Prompt Engineering & Few-Shot Techniques", desc: "System prompts, guardrails, and structured JSON output." },
      { phase: "03:45 PM – 05:30 PM", title: "Autonomous Agents with LangChain", desc: "Tool use, vector search embeddings, and memory." }
    ],
    rules: ["Basic Python knowledge."],
    faqs: [{ q: "Is the recording available?", a: "Yes, presentation slides and code notebooks are archived on the GDSC portal." }],
    formQuestions: [
      {
        label: "Primary interest in AI",
        type: "select",
        required: true,
        options: ["Building AI web apps", "Research & LLM fine-tuning", "General curiosity"]
      }
    ]
  },
  {
    communityKey: "csi@campus.edu",
    title: "DSA & Competitive Programming Bootcamp",
    category: "Workshop",
    registrationType: "solo",
    price: 0,
    capacity: 90,
    daysFromBase: -46, // Jul 17, 2026
    durationHours: 6,
    regDeadlineDays: -48,
    venue: "Computer Engineering Lab 2 & 3, SIES GST",
    bannerUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&auto=format&fit=crop&q=80",
    tags: ["dsa", "competitiveprogramming", "algorithms", "workshop", "csi"],
    description:
      "A full-day bootcamp on core data structures and algorithms — arrays, trees, graphs, dynamic programming, and greedy techniques — capped off with a live Codeforces-style contest so attendees can immediately apply what they learned under time pressure. Aimed at first- and second-year students preparing for placement coding rounds and competitive programming ratings.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage: "Thanks for registering for the DSA & CP Bootcamp! Bring a laptop with your preferred IDE set up — Codeforces handles will be collected at check-in.",
    sendEmailReceipt: true,
    contact: {
      leadName: "Aarav Mehta",
      leadRole: "CSI Lead",
      email: "csi@campus.edu",
      phone: "+91 98201 45678",
      deskLocation: "CSI Tech Desk, Computer Engineering Dept",
      building: "Main Academic Building",
      room: "Lab 2",
      floor: "3rd Floor",
      emailSLA: "Within 24 hours",
      operatingHours: "09:00 AM – 05:00 PM",
    },
    agenda: [
      { phase: "09:30 AM – 11:00 AM", title: "Arrays, Strings & Two-Pointer Patterns", desc: "Sliding window, prefix sums, and common interview traps." },
      { phase: "11:15 AM – 01:00 PM", title: "Trees, Graphs & Traversals", desc: "BFS/DFS, topological sort, and union-find." },
      { phase: "01:00 PM – 01:45 PM", title: "Lunch Break", desc: "Networking lunch for all registered participants." },
      { phase: "01:45 PM – 03:15 PM", title: "Dynamic Programming & Greedy Techniques", desc: "Memoization, tabulation, and recognizing DP sub-structures." },
      { phase: "03:30 PM – 05:30 PM", title: "Live Rated Contest", desc: "5-problem Codeforces-style contest with live leaderboard and prizes for the top 10 finishers." }
    ],
    rules: [
      "Bring a personal laptop with a C++/Java/Python IDE pre-installed.",
      "The live contest at the end is individual — no team submissions or collaboration.",
      "Use of AI coding assistants during the rated contest segment is not permitted."
    ],
    faqs: [
      { q: "Do I need prior DSA knowledge?", a: "Basic programming familiarity (loops, functions, arrays) is enough — the morning sessions build up from fundamentals." },
      { q: "Is there a certificate for this bootcamp?", a: "Yes, all checked-in attendees receive a digital certificate, and the top 10 contest finishers get a CSI merit certificate." }
    ],
    formQuestions: [
      {
        label: "Codeforces / LeetCode Handle",
        type: "text",
        required: false,
        placeholder: "your_handle",
        helpText: "Optional — used to seed the live contest leaderboard."
      },
      {
        label: "Preferred Language",
        type: "select",
        required: true,
        options: ["C++", "Java", "Python"]
      }
    ]
  }
];

// Helper to generate a realistic answer value matching question type
function generateMockAnswerValue(q, student) {
  switch (q.type) {
    case "select":
    case "radio":
      if (Array.isArray(q.options) && q.options.length > 0) {
        return q.options[Math.floor(Math.random() * q.options.length)];
      }
      return "Default Option";
    case "checkbox":
      if (Array.isArray(q.options) && q.options.length > 0) {
        return [q.options[0]];
      }
      return ["Option 1"];
    case "number":
      return Math.floor(Math.random() * 4) + 1;
    case "url":
      return `https://github.com/${student.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")}`;
    case "textarea":
      return `Detailed response submitted by ${student.name} describing project goals and technical approaches.`;
    case "text":
    default:
      return `${student.name} — ${student.branch || "Computer Engineering"}`;
  }
}

async function seedEvents() {
  try {
    console.log("Connecting to MongoDB at:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Connected successfully.\n");

    // 1. Fetch all existing Communities
    const communities = await Community.find({}).lean();
    if (communities.length === 0) {
      console.error("No communities found! Please run `node scripts/seedCommunities.js` first.");
      process.exit(1);
    }
    const communityMap = new Map();
    for (const c of communities) {
      communityMap.set(c.email.toLowerCase(), c);
    }

    // 2. Fetch all existing Students
    const students = await User.find({}).lean();
    if (students.length === 0) {
      console.error("No student users found! Please run `node scripts/seed.js` first.");
      process.exit(1);
    }
    console.log(`Loaded ${communities.length} communities and ${students.length} student accounts.`);

    // Find prime test account (niranjan@gmail.com or first student)
    const primeTestUser = students.find((s) => s.email.toLowerCase() === "niranjan@gmail.com") || students[0];
    console.log(`Primary demo account identified: ${primeTestUser.name} (${primeTestUser.email})\n`);

    // 3. Clear existing Event-related collections
    console.log("Purging existing event records...");
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await TeamMember.deleteMany({});
    await Bookmark.deleteMany({});
    await Like.deleteMany({ targetType: "Event" });
    console.log("Clean slate ready for realistic event seeding.\n");

    console.log(`Seeding ${RAW_EVENTS_BLUEPRINT.length} rich realistic events...`);

    let createdEventsCount = 0;
    let totalRegistrationsCount = 0;
    let totalTeamMembersCount = 0;
    let totalBookmarksCount = 0;
    let totalLikesCount = 0;

    for (let i = 0; i < RAW_EVENTS_BLUEPRINT.length; i++) {
      const blueprint = RAW_EVENTS_BLUEPRINT[i];
      const comm = communityMap.get(blueprint.communityKey.toLowerCase()) || communities[i % communities.length];

      const eventDate = makeDate(blueprint.daysFromBase, 10, 0);
      const eventEndDate = makeDate(
        blueprint.daysFromBase + (blueprint.durationHours > 24 ? Math.floor(blueprint.durationHours / 24) : 0),
        blueprint.durationHours > 24 ? 18 : 10 + Math.floor(blueprint.durationHours % 24),
        0
      );
      const registrationDeadline = makeDate(blueprint.regDeadlineDays, 23, 59);

      // Create Event model instance
      const eventDoc = new Event({
        community: comm._id,
        title: blueprint.title,
        category: blueprint.category,
        description: blueprint.description,
        bannerImage: {
          url: blueprint.bannerUrl,
          filename: `event-banner-${i + 1}`,
          cloudinaryId: `events/seed_${i + 1}`,
        },
        venue: blueprint.venue,
        eventDate,
        eventEndDate,
        registrationDeadline,
        contact: blueprint.contact,
        agenda: blueprint.agenda,
        rules: blueprint.rules,
        faqs: blueprint.faqs,
        tags: blueprint.tags,
        registrationType: blueprint.registrationType,
        teamSize: blueprint.teamSize || undefined,
        capacity: blueprint.capacity,
        price: blueprint.price,
        collectProfileData: blueprint.collectProfileData,
        allowWaitlist: blueprint.allowWaitlist,
        requireWaiver: blueprint.requireWaiver,
        waiverText: blueprint.waiverText,
        confirmationMessage: blueprint.confirmationMessage,
        sendEmailReceipt: blueprint.sendEmailReceipt,
        formQuestions: blueprint.formQuestions || [],
        confirmedRegistrationIds: [],
        likesCount: 0,
        viewCount: Math.floor(Math.random() * 250) + 80,
        registrationStartedCount: Math.floor(Math.random() * 60) + 20,
        isActive: true,
        status: "published",
        autoDeleteAfterMonths: 3,
      });

      await eventDoc.save();

      // ── Populate Registrations & Team Members ──
      // Vary fullness across events:
      // Event 0 (Hackathon): 92% full (Filling fast / almost full)
      // Event 1 (Next.js): 75% full (Filling fast)
      // Event 2 (Edge AI): 100% full (Sold out with waitlist)
      // Event 6 (CyberSiege): 80% full
      // Event 8 (VentureCraft): 100% full (Sold Out)
      // Others: 30% - 60% full
      let targetConfirmedSlots = 0;
      let targetWaitlistSlots = 0;

      if (blueprint.daysFromBase < 0) {
        // Past event: 85% full, all completed
        targetConfirmedSlots = Math.floor(blueprint.capacity * 0.85);
      } else if (i === 0) {
        targetConfirmedSlots = Math.floor(blueprint.capacity * 0.92); // HackOver 5.0
        targetWaitlistSlots = 4;
      } else if (i === 2) {
        targetConfirmedSlots = blueprint.capacity; // Edge AI sold out
        targetWaitlistSlots = 6;
      } else if (i === 7) {
        targetConfirmedSlots = blueprint.capacity; // CyberSiege sold out
        targetWaitlistSlots = 5;
      } else if (i === 9) {
        targetConfirmedSlots = blueprint.capacity; // VentureCraft sold out
        targetWaitlistSlots = 3;
      } else {
        const ratios = [0.35, 0.5, 0.65, 0.78, 0.82, 0.45];
        targetConfirmedSlots = Math.max(2, Math.floor(blueprint.capacity * ratios[i % ratios.length]));
        if (targetConfirmedSlots >= blueprint.capacity && blueprint.allowWaitlist) {
          targetWaitlistSlots = 2;
        }
      }

      // Track students used in this specific event to guarantee no duplicates
      const usedInEvent = new Set();

      // Determine prime test user role for this event
      const isPrimeLeader = (i === 0 || i === 1 || i === 16);
      const isPrimeWaitlist = (i === 2);

      const confirmedRegistrations = [];

      // Available student pool (excluding prime user if prime user is specifically placed)
      const availableStudents = students.filter((s) => !s._id.equals(primeTestUser._id)).sort(() => 0.5 - Math.random());
      let availIndex = 0;

      // Helper to fetch next available student for this event
      function getNextStudent() {
        while (availIndex < availableStudents.length) {
          const cand = availableStudents[availIndex++];
          const strId = String(cand._id);
          if (!usedInEvent.has(strId)) {
            usedInEvent.add(strId);
            return cand;
          }
        }
        return null;
      }

      // Create Confirmed Registrations
      for (let s = 0; s < targetConfirmedSlots; s++) {
        let currentStudent = null;
        if (s === 0 && isPrimeLeader) {
          currentStudent = primeTestUser;
          usedInEvent.add(String(primeTestUser._id));
        } else {
          currentStudent = getNextStudent();
        }

        if (!currentStudent) break;

        // Build answers for this registration
        const answers = eventDoc.formQuestions.map((q) => ({
          question: q._id,
          questionLabel: q.label,
          questionType: q.type,
          value: generateMockAnswerValue(q, currentStudent),
        }));

        const isPaid = eventDoc.price > 0;
        const reg = new Registration({
          event: eventDoc._id,
          student: currentStudent._id,
          teamName: blueprint.registrationType === "team" ? `Team ${currentStudent.name.split(" ")[0]} Tech` : undefined,
          status: "confirmed",
          answers,
          profileSnapshot: {
            name: currentStudent.name,
            email: currentStudent.email,
            rollNo: currentStudent.rollNo,
            prnNo: currentStudent.prnNo,
            branch: currentStudent.branch,
            yearOfJoining: currentStudent.yearOfJoining,
          },
          paymentStatus: isPaid ? "paid" : "not_required",
          amountPaid: isPaid ? eventDoc.price : 0,
          razorpayOrderId: isPaid ? `order_${crypto.randomBytes(8).toString("hex")}` : undefined,
          razorpayPaymentId: isPaid ? `pay_${crypto.randomBytes(8).toString("hex")}` : undefined,
          qrToken: crypto.randomBytes(16).toString("hex"),
          checkedIn: blueprint.daysFromBase < 0, // checked in if past event
          checkedInAt: blueprint.daysFromBase < 0 ? new Date(eventDate.getTime() + 15 * 60000) : undefined,
        });

        await reg.save();
        confirmedRegistrations.push(reg._id);
        totalRegistrationsCount++;

        // If team registration, create additional accepted team members
        if (blueprint.registrationType === "team" && blueprint.teamSize) {
          const teamMemberCount = Math.min(2, Math.floor(Math.random() * (blueprint.teamSize.max - blueprint.teamSize.min + 1)) + (blueprint.teamSize.min - 1));
          for (let m = 0; m < teamMemberCount; m++) {
            const teammate = getNextStudent();
            if (!teammate) break;

            const memberAnswers = eventDoc.formQuestions.map((q) => ({
              question: q._id,
              questionLabel: q.label,
              questionType: q.type,
              value: generateMockAnswerValue(q, teammate),
            }));

            const teamMember = new TeamMember({
              registration: reg._id,
              student: teammate._id,
              event: eventDoc._id,
              answers: memberAnswers,
              status: "accepted",
              respondedAt: new Date(reg.createdAt.getTime() + 30 * 60000),
              qrToken: crypto.randomBytes(16).toString("hex"),
              checkedIn: blueprint.daysFromBase < 0,
              checkedInAt: blueprint.daysFromBase < 0 ? new Date(eventDate.getTime() + 20 * 60000) : undefined,
            });

            await teamMember.save();
            totalTeamMembersCount++;
          }
        }
      }

      // Create Waitlisted Registrations
      for (let w = 0; w < targetWaitlistSlots; w++) {
        let currentStudent = null;
        if (w === 0 && isPrimeWaitlist) {
          currentStudent = primeTestUser;
          usedInEvent.add(String(primeTestUser._id));
        } else {
          currentStudent = getNextStudent();
        }

        if (!currentStudent) break;

        const answers = eventDoc.formQuestions.map((q) => ({
          question: q._id,
          questionLabel: q.label,
          questionType: q.type,
          value: generateMockAnswerValue(q, currentStudent),
        }));

        const reg = new Registration({
          event: eventDoc._id,
          student: currentStudent._id,
          teamName: blueprint.registrationType === "team" ? `Squad ${currentStudent.name.split(" ")[0]}` : undefined,
          status: "waitlisted",
          answers,
          profileSnapshot: {
            name: currentStudent.name,
            email: currentStudent.email,
            rollNo: currentStudent.rollNo,
            prnNo: currentStudent.prnNo,
            branch: currentStudent.branch,
            yearOfJoining: currentStudent.yearOfJoining,
          },
          paymentStatus: "not_required",
          amountPaid: 0,
          qrToken: crypto.randomBytes(16).toString("hex"),
          checkedIn: false,
        });

        await reg.save();
        totalRegistrationsCount++;
      }

      // ── Populate Likes ──
      const likeCount = Math.floor(Math.random() * 28) + 12;
      const likeStudents = [...students].sort(() => 0.5 - Math.random()).slice(0, likeCount);
      for (const lStudent of likeStudents) {
        try {
          const likeDoc = new Like({
            student: lStudent._id,
            target: eventDoc._id,
            targetType: "Event",
            isActive: true,
          });
          await likeDoc.save();
          totalLikesCount++;
        } catch {
          // ignore any duplicate key race
        }
      }

      // ── Populate Bookmarks ──
      const bookmarkCount = Math.floor(Math.random() * 18) + 6;
      const bookmarkStudents = [...students].sort(() => 0.5 - Math.random()).slice(0, bookmarkCount);
      // Ensure prime test user has bookmarks on some exciting events (e.g. event 0, 4, 7, 13)
      if ((i === 0 || i === 4 || i === 7 || i === 13) && !bookmarkStudents.some((s) => s._id.equals(primeTestUser._id))) {
        bookmarkStudents.push(primeTestUser);
      }

      for (const bStudent of bookmarkStudents) {
        try {
          const bookmarkDoc = new Bookmark({
            student: bStudent._id,
            event: eventDoc._id,
          });
          await bookmarkDoc.save();
          totalBookmarksCount++;
        } catch {
          // ignore duplicate
        }
      }

      // Update event with confirmed registrations list and engagement counts
      eventDoc.confirmedRegistrationIds = confirmedRegistrations;
      eventDoc.likesCount = likeStudents.length;
      await eventDoc.save();

      createdEventsCount++;
      console.log(
        ` [${blueprint.category.padEnd(11)}] ${eventDoc.title.slice(0, 45).padEnd(45)} | Reg: ${confirmedRegistrations.length}/${eventDoc.capacity} | Likes: ${eventDoc.likesCount}`
      );
    }

    console.log(`\n======================================================`);
    console.log(` EVENT SEEDING COMPLETED SUCCESSFULLY`);
    console.log(`======================================================`);
    console.log(`Total Events created:           ${createdEventsCount}`);
    console.log(`Total Registrations created:    ${totalRegistrationsCount}`);
    console.log(`Total Team Members populated:   ${totalTeamMembersCount}`);
    console.log(`Total Bookmarks created:        ${totalBookmarksCount}`);
    console.log(`Total Likes synchronized:       ${totalLikesCount}`);
    console.log(`Demo Account (${primeTestUser.email}): registered & waitlisted across multiple flagship events.`);
    console.log(`======================================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error during event seeding:", err);
    process.exit(1);
  }
}

seedEvents();
