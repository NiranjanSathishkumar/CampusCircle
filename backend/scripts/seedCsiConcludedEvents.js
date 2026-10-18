/**
 * seedCsiConcludedEvents.js
 *
 * Seeds 2 realistic concluded events for Computer Society of India (CSI) SIES GST:
 * 1. "State-Level Cloud & DevOps Architecture Summit 2026" (Free Seminar, 82 confirmed, 76 checked in -> ~93% attendance, 10 waitlisted)
 * 2. "Hands-On GenAI & LLM Fine-Tuning Bootcamp" (Paid Workshop @ Rs 150, 58 confirmed, 54 checked in -> ~93% attendance, 8 waitlisted, Rs 8,700 verified revenue)
 *
 * Features realistic multi-branch distribution, multi-year distribution,
 * staggered weekly registration timelines, verified UPI payment records,
 * and high repeat-attendee overlap for rich community analytics.
 */

const mongoose = require("mongoose");
const crypto = require("crypto");
require("dotenv").config({ path: __dirname + "/../.env" });

const Event = require("../src/models/Event");
const Community = require("../src/models/Community");
const Registration = require("../src/models/Registration");
const { User } = require("../src/models/User");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campuscircle";

function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString("hex");
}

function randomUtr() {
  const digits = Math.floor(100000000000 + Math.random() * 900000000000);
  return `UTR${digits}`;
}

// Random timestamp between start and end dates
function randomDateBetween(start, end) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
}

// Deterministic or pseudo-random shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const csi = await Community.findOne({ email: "csi@campus.edu" });
  if (!csi) {
    console.error("CSI community (csi@campus.edu) not found in database!");
    process.exit(1);
  }
  console.log(`Found CSI Community: "${csi.name}" (ID: ${csi._id})`);

  // Target event titles
  const EVENT_1_TITLE = "State-Level Cloud & DevOps Architecture Summit 2026";
  const EVENT_2_TITLE = "Hands-On GenAI & LLM Fine-Tuning Bootcamp";

  // Clean up any previous runs of these two events
  const existingEvents = await Event.find({
    community: csi._id,
    title: { $in: [EVENT_1_TITLE, EVENT_2_TITLE] },
  });

  if (existingEvents.length > 0) {
    const existingIds = existingEvents.map((e) => e._id);
    await Registration.deleteMany({ event: { $in: existingIds } });
    await Event.deleteMany({ _id: { $in: existingIds } });
    console.log(`Cleaned up ${existingEvents.length} previous instances of the demonstration events.`);
  }

  // Fetch all available student users
  const allStudents = await User.find({ role: "student" }).lean();
  console.log(`Fetched ${allStudents.length} student users to populate registrations.`);

  if (allStudents.length < 100) {
    console.warn(`Only ${allStudents.length} students found. We need at least 95 students for distinct registrations.`);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. CREATE EVENT 1: State-Level Cloud & DevOps Architecture Summit 2026
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- Creating Event 1: Cloud & DevOps Summit ---");
  const event1Questions = [
    {
      _id: new mongoose.Types.ObjectId(),
      label: "Primary Cloud & DevOps Track of Interest",
      type: "select",
      required: true,
      options: [
        "Kubernetes & Container Orchestration",
        "Infrastructure as Code (Terraform / Pulumi)",
        "Observability & SRE (Prometheus / Grafana)",
        "Cloud Security & Zero-Trust Architecture",
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      label: "Current Experience Level with Cloud Platforms",
      type: "radio",
      required: true,
      options: [
        "Beginner (Exploring cloud concepts)",
        "Intermediate (Built / deployed small projects on AWS/GCP)",
        "Advanced (Hands-on CLI, Docker, or CI/CD pipelines)",
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      label: "Dietary Preference for Delegate Lunch",
      type: "radio",
      required: true,
      options: ["Vegetarian", "Jain", "Non-Vegetarian"],
    },
  ];

  const event1Date = new Date("2026-09-17T09:30:00.000Z"); // 03:00 PM IST
  const event1EndDate = new Date("2026-09-17T17:00:00.000Z");
  const event1Deadline = new Date("2026-09-15T23:59:59.000Z");
  const event1ExpiresAt = new Date("2026-12-17T17:00:00.000Z");

  const event1Doc = new Event({
    community: csi._id,
    title: EVENT_1_TITLE,
    category: "Seminar",
    description:
      "A flagship state-level engineering conference hosted by CSI SIES GST. Uniting distinguished cloud leaders and architects from AWS, Google Cloud, Red Hat, and SRE specialists. Discover real-world microservices architectures, zero-downtime rolling upgrades, Cilium eBPF container networking, and enterprise cost-optimization patterns. Features in-depth post-mortem breakdowns of actual high-scale outages and hands-on architecture walkthroughs.",
    bannerImage: {
      url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
      filename: "cloud-summit-banner.jpg",
    },
    venue: "SIES GST Main Auditorium & Virtual Amphitheater",
    eventDate: event1Date,
    eventEndDate: event1EndDate,
    registrationDeadline: event1Deadline,
    registrationType: "solo",
    capacity: 90,
    price: 0,
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage:
      "Your seat for the Cloud & DevOps Architecture Summit 2026 is confirmed! Please present your digital QR pass at the registration desk for delegate kit collection.",
    sendEmailReceipt: true,
    status: "published",
    isActive: true,
    autoDeleteAfterMonths: 3,
    expiresAt: event1ExpiresAt,
    viewCount: 395,
    registrationStartedCount: 142,
    likesCount: 52,
    tags: ["cloud", "devops", "kubernetes", "aws", "docker", "microservices", "seminar"],
    contact: {
      leadName: "Aarav Patel",
      leadRole: "President & Cloud Track Lead, CSI SIES GST",
      email: "csi@campus.edu",
      phone: "+91 98201 55678",
      deskLocation: "CSI Tech Secretariat, 3rd Floor",
      building: "Engineering Block A",
      room: "Lab 301",
      floor: "3rd Floor",
      emailSLA: "Within 2 hours",
      operatingHours: "09:00 AM – 06:00 PM (Mon–Sat)",
    },
    agenda: [
      {
        phase: "09:00 AM – 09:30 AM",
        title: "Delegate Check-In & Morning Refreshments",
        desc: "QR scanner entry, delegate badge & lanyard collection, and networking tea.",
      },
      {
        phase: "09:30 AM – 10:45 AM",
        title: "Keynote: Multi-Region High-Availability at Scale",
        desc: "Designing resilient distributed applications with AWS multi-region failovers and GCP Anycast routing.",
      },
      {
        phase: "11:00 AM – 12:45 PM",
        title: "Deep Dive: Kubernetes Pod Networking & eBPF",
        desc: "Interactive live demo with Cilium, kernel-level packet inspection, and service mesh performance.",
      },
      {
        phase: "12:45 PM – 01:45 PM",
        title: "Networking Lunch & SRE Career Lounge",
        desc: "Buffet lunch and one-on-one resume reviews with senior DevOps recruiters.",
      },
      {
        phase: "01:45 PM – 03:15 PM",
        title: "Masterclass: GitOps with ArgoCD & Terraform",
        desc: "Automated canary deployments, declarative infrastructure state, and secret rotation.",
      },
      {
        phase: "03:30 PM – 04:30 PM",
        title: "Production Post-Mortem Panel: Lessons from Outages",
        desc: "Senior SREs breakdown real cascading failure events and resilience engineering best practices.",
      },
      {
        phase: "04:30 PM – 05:00 PM",
        title: "Valedictory & Digital Credential Disbursement",
        desc: "Closing address by CSI Faculty Advisor, digital credentials, and group photo.",
      },
    ],
    rules: [
      "Registration passes are non-transferable and tied to your student college identity.",
      "Laptops are recommended for following live architecture diagrams and terminal demos.",
      "Auditorium doors close 10 minutes prior to keynote sessions.",
      "Attendance check-in via QR scan is mandatory to receive your verified digital certificate.",
    ],
    faqs: [
      {
        q: "Who is eligible to attend?",
        a: "The summit is open to all engineering students across Computer, IT, AI&DS, AI&ML, and IoT streams.",
      },
      {
        q: "Is there any entry fee?",
        a: "No, this state-level summit is completely free and sponsored by CSI SIES GST and industry cloud partners.",
      },
      {
        q: "Will certificates be provided?",
        a: "Yes, verified CSI attendance certificates will be issued digitally to all delegates scanned at the door.",
      },
    ],
    formQuestions: event1Questions,
    confirmedRegistrationIds: [],
  });

  await event1Doc.save();
  console.log(`Saved Event 1: "${event1Doc.title}" (_id: ${event1Doc._id})`);

  // Registrations for Event 1:
  // 82 Confirmed + 10 Waitlisted = 92 distinct students
  // 76 checked in out of 82 confirmed = 92.68% (~93% attendance rate!)
  const shuffledStudents = shuffle(allStudents);
  const event1Students = shuffledStudents.slice(0, 92);

  // Staggered timeline across 4 weeks:
  // Week 1 (Aug 24 - Aug 30): 14 students
  // Week 2 (Aug 31 - Sep 06): 22 students
  // Week 3 (Sep 07 - Sep 13): 30 students
  // Week 4 (Sep 14 - Sep 15): 26 students (16 confirmed + 10 waitlisted)
  const timelineRanges1 = [
    { start: "2026-08-24T10:00:00.000Z", end: "2026-08-30T18:00:00.000Z", count: 14 },
    { start: "2026-08-31T10:00:00.000Z", end: "2026-09-06T18:00:00.000Z", count: 22 },
    { start: "2026-09-07T10:00:00.000Z", end: "2026-09-13T18:00:00.000Z", count: 30 },
    { start: "2026-09-14T09:00:00.000Z", end: "2026-09-15T22:00:00.000Z", count: 26 },
  ];

  const event1RegDocs = [];
  let sIndex = 0;

  for (let t = 0; t < timelineRanges1.length; t++) {
    const range = timelineRanges1[t];
    for (let k = 0; k < range.count; k++) {
      const student = event1Students[sIndex];
      const isConfirmed = sIndex < 82; // first 82 are confirmed, 83..92 are waitlisted
      // Among confirmed (0..81), exactly 76 check in (~93%), 6 do not check in
      const isCheckedIn = isConfirmed && sIndex < 76;

      const regCreated = randomDateBetween(range.start, range.end);
      const doorScanTime = isCheckedIn
        ? randomDateBetween("2026-09-17T03:15:00.000Z", "2026-09-17T04:10:00.000Z")
        : null;

      // Realistic answers
      const answers = [
        {
          question: event1Questions[0]._id,
          questionLabel: event1Questions[0].label,
          questionType: event1Questions[0].type,
          value: event1Questions[0].options[sIndex % event1Questions[0].options.length],
        },
        {
          question: event1Questions[1]._id,
          questionLabel: event1Questions[1].label,
          questionType: event1Questions[1].type,
          value: event1Questions[1].options[sIndex % event1Questions[1].options.length],
        },
        {
          question: event1Questions[2]._id,
          questionLabel: event1Questions[2].label,
          questionType: event1Questions[2].type,
          value: event1Questions[2].options[sIndex % event1Questions[2].options.length],
        },
      ];

      event1RegDocs.push({
        event: event1Doc._id,
        student: student._id,
        status: isConfirmed ? "confirmed" : "waitlisted",
        answers,
        profileSnapshot: {
          name: student.name,
          email: student.email,
          rollNo: student.rollNo || `12${26 - (student.yearOfJoining ? 2026 - student.yearOfJoining : 0)}A${1000 + sIndex}`,
          prnNo: student.prnNo || `1032${student.yearOfJoining || 2024}${String(sIndex).padStart(4, "0")}`,
          branch: student.branch || "Computer Engineering 1",
          yearOfJoining: student.yearOfJoining || 2024,
        },
        paymentStatus: "not_required",
        amountPaid: 0,
        qrToken: randomHex(16),
        checkedIn: isCheckedIn,
        checkedInAt: doorScanTime,
        createdAt: regCreated,
        updatedAt: isCheckedIn ? doorScanTime : regCreated,
      });

      sIndex++;
    }
  }

  const insertedRegs1 = await Registration.insertMany(event1RegDocs);
  const confirmedIds1 = insertedRegs1.filter((r) => r.status === "confirmed").map((r) => r._id);
  const checkedInCount1 = insertedRegs1.filter((r) => r.checkedIn).length;
  const waitlistCount1 = insertedRegs1.filter((r) => r.status === "waitlisted").length;

  event1Doc.confirmedRegistrationIds = confirmedIds1;
  await event1Doc.save();

  console.log(`Event 1 registrations created:`);
  console.log(`  Total: ${insertedRegs1.length}`);
  console.log(`  Confirmed: ${confirmedIds1.length}`);
  console.log(`  Checked In: ${checkedInCount1} / ${confirmedIds1.length} (${Math.round((checkedInCount1 / confirmedIds1.length) * 100)}%)`);
  console.log(`  Waitlisted: ${waitlistCount1}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. CREATE EVENT 2: Hands-On GenAI & LLM Fine-Tuning Bootcamp (PAID)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- Creating Event 2: GenAI & LLM Bootcamp (Paid) ---");
  const event2Questions = [
    {
      _id: new mongoose.Types.ObjectId(),
      label: "Primary Machine Learning & AI Framework",
      type: "select",
      required: true,
      options: [
        "PyTorch / HuggingFace Transformers",
        "LangChain / LangGraph & LlamaIndex",
        "TensorFlow & Keras Core",
        "JAX & Flax",
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      label: "Development Hardware & GPU Setup",
      type: "radio",
      required: true,
      options: [
        "Dedicated NVIDIA GPU (RTX 30xx/40xx Series)",
        "Apple Silicon Unified Memory (M1/M2/M3 Pro/Max)",
        "CPU Only (Will rely on Campus Colab GPU instances)",
      ],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      label: "Project GitHub or LinkedIn URL",
      type: "url",
      required: false,
      placeholder: "https://github.com/username",
    },
  ];

  const event2Date = new Date("2026-10-02T10:00:00.000Z"); // 03:30 PM IST
  const event2EndDate = new Date("2026-10-02T17:30:00.000Z");
  const event2Deadline = new Date("2026-09-30T23:59:59.000Z");
  const event2ExpiresAt = new Date("2026-12-31T17:30:00.000Z");

  const event2Doc = new Event({
    community: csi._id,
    title: EVENT_2_TITLE,
    category: "Workshop",
    description:
      "An intensive, project-driven full-day masterclass on applied Generative AI and open-source Large Language Models. Learn to fine-tune 8B-parameter instruction models using parameter-efficient fine-tuning (LoRA / QLoRA with Unsloth and bitsandbytes). Build high-throughput Retrieval-Augmented Generation (RAG) pipelines leveraging pgvector, hybrid semantic search, and Cohere re-ranking. Implement multi-agent workflows with LangGraph and deploy quantised GGUF weights onto local edge runtimes.",
    bannerImage: {
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      filename: "genai-bootcamp-banner.jpg",
    },
    venue: "CSI Advanced Computing Lab (Lab 302), SIES GST",
    eventDate: event2Date,
    eventEndDate: event2EndDate,
    registrationDeadline: event2Deadline,
    registrationType: "solo",
    capacity: 65,
    price: 150,
    upiId: "csi@sbi",
    paymentInstructions:
      "Transfer Rs. 150 via UPI to csi@sbi. Enter the 12-digit UTR/Bank Reference number during registration for immediate slot verification.",
    collectProfileData: true,
    allowWaitlist: true,
    requireWaiver: false,
    confirmationMessage:
      "Payment verified! Your seat for the GenAI & LLM Bootcamp is locked in. Please ensure Python 3.11+, PyTorch, and VS Code are installed on your system.",
    sendEmailReceipt: true,
    status: "published",
    isActive: true,
    autoDeleteAfterMonths: 3,
    expiresAt: event2ExpiresAt,
    viewCount: 325,
    registrationStartedCount: 110,
    likesCount: 38,
    tags: ["genai", "llm", "finetuning", "lora", "python", "langchain", "rag", "workshop"],
    contact: {
      leadName: "Sneha Kulkarni",
      leadRole: "AI/ML Track Lead, CSI SIES GST",
      email: "csi@campus.edu",
      phone: "+91 98201 88990",
      deskLocation: "CSI Tech Secretariat, 3rd Floor",
      building: "Engineering Block A",
      room: "Lab 302",
      floor: "3rd Floor",
      emailSLA: "Within 4 hours",
      operatingHours: "09:00 AM – 06:00 PM (Mon–Sat)",
    },
    agenda: [
      {
        phase: "09:30 AM – 10:00 AM",
        title: "Environment Setup & GPU Benchmarking",
        desc: "CUDA acceleration checks, HuggingFace Hub login tokens, and local repo clones.",
      },
      {
        phase: "10:00 AM – 11:30 AM",
        title: "Module 1: Deep Dive into PEFT, LoRA & QLoRA",
        desc: "Rank decomposition adapters, 4-bit NormalFloat quantization, and memory-saving techniques.",
      },
      {
        phase: "11:45 AM – 01:15 PM",
        title: "Module 2: Hands-On Fine-Tuning Llama-3 with Custom Datasets",
        desc: "Instruction-tuning format, loss convergence tracking with WandB, and merging adapter weights.",
      },
      {
        phase: "01:15 PM – 02:00 PM",
        title: "Networking Lunch & Compute Checkpoint",
        desc: "Buffet lunch while batch training checkpoints finalize on lab workstations.",
      },
      {
        phase: "02:00 PM – 03:45 PM",
        title: "Module 3: Enterprise RAG Pipelines & Semantic Caching",
        desc: "Building chunking pipelines, dense embeddings with pgvector, and cross-encoder re-ranking.",
      },
      {
        phase: "04:00 PM – 05:00 PM",
        title: "Module 4: Agentic Orchestration with LangGraph",
        desc: "Building self-correcting tool-use agents with persistent state and dynamic web search tools.",
      },
      {
        phase: "05:00 PM – 05:30 PM",
        title: "Student Showcase, Code Freeze & Certificate Awards",
        desc: "Live demos of student agents, digital certificate distribution, and closing remarks.",
      },
    ],
    rules: [
      "Bring your personal laptop and charger with root/admin access for package installations.",
      "Workshop seats are strictly capped at 65 to ensure high compute bandwidth and mentor availability.",
      "Participation certificates require full-day attendance verified by the door scan and lab code check.",
    ],
    faqs: [
      {
        q: "What does the registration fee cover?",
        a: "The Rs. 150 registration covers GPU cloud compute credits, training courseware, networking lunch, and refreshments.",
      },
      {
        q: "Can I attend if I don't have a high-end GPU laptop?",
        a: "Yes! High-speed Wi-Fi and cloud GPU instances (Google Colab / Kaggle) are fully configured for all attendees.",
      },
      {
        q: "Will we get access to the recorded materials and slides?",
        a: "Yes, all notebook files, slides, and model weights are accessible via the CSI GitHub organization repository.",
      },
    ],
    formQuestions: event2Questions,
    confirmedRegistrationIds: [],
  });

  await event2Doc.save();
  console.log(`Saved Event 2: "${event2Doc.title}" (_id: ${event2Doc._id})`);

  // Registrations for Event 2:
  // 58 Confirmed + 8 Waitlisted = 66 distinct students
  // 54 checked in out of 58 confirmed = 93.10% (~93% attendance rate!)
  // Repeat Attendees: Pick 42 students from Event 1's checked-in attendees to also be in Event 2's checked-in list!
  // And 24 students from the remaining students pool.
  const event1CheckedInStudents = event1Students.slice(0, 76); // these were checked in to Event 1
  const repeatStudents = event1CheckedInStudents.slice(0, 42); // 42 repeat attendees

  const remainingStudentPool = allStudents.filter(
    (s) => !repeatStudents.some((r) => r._id.toString() === s._id.toString())
  );
  const shuffledRemaining = shuffle(remainingStudentPool);
  const nonRepeatStudents = shuffledRemaining.slice(0, 24); // 66 - 42 = 24

  // Combine into 66 students for Event 2:
  // First 54 will be confirmed & checked in (42 repeats + 12 non-repeats)
  // Next 4 will be confirmed & NOT checked in (4 non-repeats)
  // Next 8 will be waitlisted (8 non-repeats)
  const event2ConfirmedAttended = [...repeatStudents, ...nonRepeatStudents.slice(0, 12)]; // 54 students
  const event2ConfirmedNoShow = nonRepeatStudents.slice(12, 16); // 4 students
  const event2Waitlisted = nonRepeatStudents.slice(16, 24); // 8 students

  const event2StudentsOrdered = [
    ...event2ConfirmedAttended,
    ...event2ConfirmedNoShow,
    ...event2Waitlisted,
  ];

  // Staggered timeline across 4 weeks:
  // Week 1 (Sep 07 - Sep 13): 10 students
  // Week 2 (Sep 14 - Sep 20): 18 students
  // Week 3 (Sep 21 - Sep 27): 22 students
  // Week 4 (Sep 28 - Sep 30): 16 students (8 confirmed + 8 waitlisted)
  const timelineRanges2 = [
    { start: "2026-09-07T10:00:00.000Z", end: "2026-09-13T18:00:00.000Z", count: 10 },
    { start: "2026-09-14T10:00:00.000Z", end: "2026-09-20T18:00:00.000Z", count: 18 },
    { start: "2026-09-21T10:00:00.000Z", end: "2026-09-27T18:00:00.000Z", count: 22 },
    { start: "2026-09-28T09:00:00.000Z", end: "2026-09-30T22:00:00.000Z", count: 16 },
  ];

  const event2RegDocs = [];
  let sIndex2 = 0;

  for (let t = 0; t < timelineRanges2.length; t++) {
    const range = timelineRanges2[t];
    for (let k = 0; k < range.count; k++) {
      const student = event2StudentsOrdered[sIndex2];
      const isConfirmed = sIndex2 < 58; // 58 confirmed, 8 waitlisted
      const isCheckedIn = sIndex2 < 54; // 54 checked in (~93%)

      const regCreated = randomDateBetween(range.start, range.end);
      const paymentVerifiedTime = new Date(regCreated.getTime() + (2 + Math.random() * 4) * 3600 * 1000);
      const doorScanTime = isCheckedIn
        ? randomDateBetween("2026-10-02T03:50:00.000Z", "2026-10-02T04:40:00.000Z")
        : null;

      // Realistic answers
      const answers = [
        {
          question: event2Questions[0]._id,
          questionLabel: event2Questions[0].label,
          questionType: event2Questions[0].type,
          value: event2Questions[0].options[sIndex2 % event2Questions[0].options.length],
        },
        {
          question: event2Questions[1]._id,
          questionLabel: event2Questions[1].label,
          questionType: event2Questions[1].type,
          value: event2Questions[1].options[sIndex2 % event2Questions[1].options.length],
        },
        {
          question: event2Questions[2]._id,
          questionLabel: event2Questions[2].label,
          questionType: event2Questions[2].type,
          value: `https://github.com/${(student.name || "student").toLowerCase().replace(/\s+/g, "")}`,
        },
      ];

      event2RegDocs.push({
        event: event2Doc._id,
        student: student._id,
        status: isConfirmed ? "confirmed" : "waitlisted",
        answers,
        profileSnapshot: {
          name: student.name,
          email: student.email,
          rollNo: student.rollNo || `12${26 - (student.yearOfJoining ? 2026 - student.yearOfJoining : 0)}A${2000 + sIndex2}`,
          prnNo: student.prnNo || `1032${student.yearOfJoining || 2024}${String(sIndex2 + 100).padStart(4, "0")}`,
          branch: student.branch || "AI & Machine Learning",
          yearOfJoining: student.yearOfJoining || 2024,
        },
        paymentStatus: isConfirmed ? "confirmed" : "pending",
        amountPaid: isConfirmed ? 150 : 0,
        transactionId: isConfirmed ? randomUtr() : undefined,
        paymentVerifiedAt: isConfirmed ? paymentVerifiedTime : undefined,
        paymentNotes: isConfirmed ? "UPI payment verified against bank transaction record" : undefined,
        qrToken: randomHex(16),
        checkedIn: isCheckedIn,
        checkedInAt: doorScanTime,
        createdAt: regCreated,
        updatedAt: isCheckedIn ? doorScanTime : paymentVerifiedTime,
      });

      sIndex2++;
    }
  }

  const insertedRegs2 = await Registration.insertMany(event2RegDocs);
  const confirmedIds2 = insertedRegs2.filter((r) => r.status === "confirmed").map((r) => r._id);
  const checkedInCount2 = insertedRegs2.filter((r) => r.checkedIn).length;
  const waitlistCount2 = insertedRegs2.filter((r) => r.status === "waitlisted").length;
  const verifiedRevenue2 = confirmedIds2.length * 150;

  event2Doc.confirmedRegistrationIds = confirmedIds2;
  await event2Doc.save();

  console.log(`Event 2 registrations created:`);
  console.log(`  Total: ${insertedRegs2.length}`);
  console.log(`  Confirmed: ${confirmedIds2.length}`);
  console.log(`  Checked In: ${checkedInCount2} / ${confirmedIds2.length} (${Math.round((checkedInCount2 / confirmedIds2.length) * 100)}%)`);
  console.log(`  Waitlisted: ${waitlistCount2}`);
  console.log(`  Verified Revenue: Rs. ${verifiedRevenue2.toLocaleString("en-IN")}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. VERIFY COMMUNITY ANALYTICS AGGREGATIONS
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n--- Verifying Resulting Community Analytics ---");
  const allCsiEvents = await Event.find({ community: csi._id, isActive: true }).lean();
  const allCsiEventIds = allCsiEvents.map((e) => e._id);
  const totalRegistrants = allCsiEvents.reduce(
    (sum, e) => sum + (e.confirmedRegistrationIds?.length || 0),
    0
  );

  const repeatAttendeeRows = await Registration.aggregate([
    { $match: { event: { $in: allCsiEventIds }, checkedIn: true } },
    { $group: { _id: { student: "$student", event: "$event" } } },
    { $group: { _id: "$_id.student", eventsAttended: { $sum: 1 } } },
    { $match: { eventsAttended: { $gte: 2 } } },
    { $count: "count" },
  ]);

  console.log(`Total Active Events for CSI: ${allCsiEvents.length}`);
  console.log(`Total Confirmed Registrations across all events: ${totalRegistrants}`);
  console.log(`Repeat Attendees (Checked in to 2+ events): ${repeatAttendeeRows[0]?.count || 0}`);

  console.log("\nSeeding completed successfully! CSI community now has rich, realistic showcase data.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error seeding concluded events for CSI:", err);
  process.exit(1);
});
