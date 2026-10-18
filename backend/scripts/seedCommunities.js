const mongoose = require("mongoose");
require("dotenv").config();

const Admin = require("../src/models/Admin");
const Community = require("../src/models/Community");
const EmailRegistry = require("../src/models/EmailRegistry");

const dbUrl = process.env.MONGODB_URI || process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

const COMMUNITIES_DATA = [
  {
    name: "Computer Society of India (CSI) SIES GST",
    email: "csi@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "CSI SIES GST is the largest and oldest student technical body on campus, inaugurated in 2009. It encourages students to explore research topics, stay current with emerging technology, and build practical skills through coding contests, hackathons, guest lectures, and hands-on workshops on web development, DSA, and AI/ML. Over 15 years, the chapter has grown into a 400+ member community, run entirely by a rotating student committee, and now hosts the campus's flagship 24-hour national hackathon, HackOver, alongside a year-round calendar of masterclasses, speaker sessions, and open-source sprints.",
    establishedYear: 2009,
    location: "Computer Engineering Lab 2",
    leadOrganizer: "Aarav Mehta",
    tags: ["coding", "hackathons", "webdev", "ai-ml", "workshops", "opensource"],
    isRecruiting: true,
    openRoles: ["Technical Lead", "Event Coordinator", "Content Writer", "Design Lead"],
    logo: { filename: "/media/CSI.jpg" },
    banner: { filename: "/media/Tech Banner - 1.jpg" },
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com/company/csi-siesgst" },
      { platform: "instagram", url: "https://instagram.com/csi.siesgst" },
      { platform: "github", url: "https://github.com/csi-siesgst" },
      { platform: "discord", url: "https://discord.gg/csisiesgst" },
      { platform: "twitter", url: "https://twitter.com/csi_siesgst" }
    ],
    faqs: [
      { question: "Who can join CSI SIES GST?", answer: "Any SIES GST student, from first year onward, can join. No prior coding experience is required for general membership." },
      { question: "How often does CSI conduct events?", answer: "CSI typically runs at least one technical workshop or coding event every month, alongside a flagship annual fest." },
      { question: "Is there a membership fee?", answer: "General membership is free. A nominal fee applies only for select paid workshops that include kits, certifications, or catering." },
      { question: "Do I get a certificate for attending workshops?", answer: "Yes, every checked-in attendee receives a digital certificate of participation within a week of the event." },
      { question: "How can I join the core committee?", answer: "Core committee positions open up at the start of each academic year through an internal application and interview process announced on our social channels." }
    ]
  },
  {
    name: "IEEE Student Branch SIES GST",
    email: "ieee@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "The IEEE Student Branch imparts practical engineering knowledge through industrial visits, technical workshops, and seminars in electronics, communication, and emerging technologies. The chapter has previously organized national-level conferences and continues to connect students with industry professionals and research opportunities.",
    establishedYear: 2017,
    location: "EXTC Seminar Hall",
    leadOrganizer: "Sanya Kapoor",
    tags: ["electronics", "engineering", "seminars", "research", "networking"],
    isRecruiting: true,
    openRoles: ["Branch Secretary", "Technical Coordinator", "Publicity Head"],
    logo: { filename: "/media/ieee_gst_logo.jpg" },
    banner: { filename: "/media/Tech Banner - 2.jpg" },
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com/company/ieee-siesgst" },
      { platform: "instagram", url: "https://instagram.com/ieee.siesgst" }
    ],
    faqs: [
      { question: "Does IEEE membership require an IEEE.org account?", answer: "Campus-level participation is open to all students, though some national events may require a separate IEEE membership." },
      { question: "What kind of events does the branch host?", answer: "Workshops on electronics and communication systems, industrial visits, paper presentation contests, and an annual technical conference." }
    ]
  },
  {
    name: "IETE Student Forum (Techxter)",
    email: "iete@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "IETE, also known as Techxter on campus, is the most recently formed technical chapter and plays an active role in organizing extra-curricular technical events. It hosts workshops, quizzes, and project exhibitions that give students exposure to telecommunication and electronics engineering practice.",
    establishedYear: 2020,
    location: "Electronics Lab 4",
    leadOrganizer: "Rohan Bhatt",
    tags: ["telecom", "electronics", "quizzes", "exhibitions", "workshops"],
    isRecruiting: true,
    openRoles: ["Event Manager", "Social Media Lead"],
    logo: { filename: "/media/IETE.jpg" },
    banner: { filename: "/media/Tech Banner - 3.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/iete.siesgst" },
      { platform: "linkedin", url: "https://linkedin.com/company/iete-siesgst" }
    ],
    faqs: [
      { question: "Is IETE only for EXTC students?", answer: "No, students from any branch interested in telecommunication and electronics topics are welcome to join." }
    ]
  },
  {
    name: "E-Cell (Entrepreneurship Cell)",
    email: "ecell@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "The Entrepreneurship Cell gives budding entrepreneurs a platform to showcase business plans and take their first steps toward launching ventures. Activities include business plan competitions, stock and trading simulations, pitch-deck workshops, and technical product presentation sessions with mentors from the startup ecosystem.",
    establishedYear: 2018,
    location: "Innovation & Incubation Cell",
    leadOrganizer: "Ishaan Verma",
    tags: ["startups", "entrepreneurship", "pitching", "business", "mentorship"],
    isRecruiting: true,
    openRoles: ["Operations Head", "Finance Lead", "Outreach Coordinator", "Content Lead"],
    logo: { filename: "/media/ECell.png" },
    banner: { filename: "/media/Tech Banner - 4.jpg" },
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com/company/ecell-siesgst" },
      { platform: "instagram", url: "https://instagram.com/ecell.siesgst" }
    ],
    faqs: [
      { question: "Do I need a business idea to join E-Cell?", answer: "No, you can join as a core team member and help run events even without a startup idea of your own." },
      { question: "What is the flagship event of E-Cell?", answer: "An annual business plan and pitch competition open to teams across the college." }
    ]
  },
  {
    name: "Google Developer Student Clubs (GDSC) SIES GST",
    email: "gdsc@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "GDSC SIES GST, powered by Google, equips students with technical development skills and leadership capabilities. The club runs study jams, solution challenges, and workshops on Android, web, and cloud technologies, collaborating closely with faculty to give students a holistic path into the developer ecosystem.",
    establishedYear: 2021,
    location: "Computer Center Lab 1",
    leadOrganizer: "Meera Nair",
    tags: ["android", "cloud", "webdev", "studyjams", "leadership"],
    isRecruiting: true,
    openRoles: ["Android Lead", "Web Lead", "Design Lead", "Community Manager"],
    logo: { filename: "/media/GDSC.jpg" },
    banner: { filename: "/media/Tech Banner - 1.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/gdsc.siesgst" },
      { platform: "linkedin", url: "https://linkedin.com/company/gdsc-siesgst" },
      { platform: "discord", url: "https://discord.gg/gdscsiesgst" }
    ],
    faqs: [
      { question: "What is a Study Jam?", answer: "A guided, self-paced learning series on a specific Google technology, followed by a hands-on assessment or mini project." }
    ]
  },
  {
    name: "OWASP Student Chapter SIES GST",
    email: "owasp@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "Founded in August 2025, the OWASP SIES GST chapter is dedicated to making cybersecurity learning fun, interactive, and impactful. Members take part in CTF competitions, ethical hacking workshops, and secure development sessions, building real-world skills in application security open to beginners and experienced students alike.",
    establishedYear: 2024,
    location: "Cyber Security Lab",
    leadOrganizer: "Devansh Rao",
    tags: ["cybersecurity", "ctf", "ethical-hacking", "appsec", "workshops"],
    isRecruiting: true,
    openRoles: ["Chapter Co-Lead", "CTF Coordinator", "Workshop Lead"],
    logo: { filename: "/media/OSWAP.png" },
    banner: { filename: "/media/Tech Banner - 2.jpg" },
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com/company/owasp-siesgst" },
      { platform: "discord", url: "https://discord.gg/owaspsiesgst" }
    ],
    faqs: [
      { question: "Do I need cybersecurity experience to join?", answer: "No, sessions are designed to be beginner-friendly, with separate advanced tracks for experienced members." }
    ]
  },
  {
    name: "ISHRAE Student Chapter",
    email: "ishrae@campus.edu",
    password: "Campus1234",
    category: "Academic & Literary",
    description: "The Indian Society of Heating, Refrigerating and Air Conditioning Engineers (ISHRAE) student chapter promotes research and awareness in HVAC systems and sustainable engineering practices. The chapter conducts technical talks, industry plant visits, and design workshops mainly for Mechanical Engineering students working toward safer, more efficient environmental systems.",
    establishedYear: 2015,
    location: "Mechanical Engineering Dept",
    leadOrganizer: "Kabir Shah",
    tags: ["hvac", "mechanical", "sustainability", "research", "plant-visits"],
    isRecruiting: false,
    openRoles: [],
    logo: { filename: "/media/Logo.png" },
    banner: { filename: "/media/Tech Banner - 4.jpg" },
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com/company/ishrae-siesgst" }
    ],
    faqs: [
      { question: "Is ISHRAE open to non-Mechanical students?", answer: "The chapter primarily draws Mechanical Engineering students, but interested students from other branches can attend open sessions." }
    ]
  },
  {
    name: "SAE Student Chapter",
    email: "sae@campus.edu",
    password: "Campus1234",
    category: "Technology & Development",
    description: "The SAE student chapter gives Mechanical Engineering students hands-on experience with real vehicle design and manufacturing challenges, including Micro-Truck, Baja, Super-Mileage Formula SAE, and Clean Snowmobile projects. Members learn planning, prototyping, and manufacturing skills required to take a product from concept to consumer-industrial market.",
    establishedYear: 2016,
    location: "Mechanical Workshop",
    leadOrganizer: "Yash Deshmukh",
    tags: ["automotive", "manufacturing", "prototyping", "baja", "mechanical"],
    isRecruiting: true,
    openRoles: ["Design Head", "Manufacturing Lead"],
    logo: { filename: "/media/SAE.png" },
    banner: { filename: "/media/Tech Banner - 3.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/sae.siesgst" },
      { platform: "linkedin", url: "https://linkedin.com/company/sae-siesgst" }
    ],
    faqs: [
      { question: "What projects does the SAE chapter build?", answer: "Student teams design and build vehicles for national-level competitions such as Baja SAE and Supra SAE." }
    ]
  },
  {
    name: "Literary Club",
    email: "literaryclub@campus.edu",
    password: "Campus1234",
    category: "Academic & Literary",
    description: "The Literary Club brings together students who share a love for reading, writing, and debate. It organizes the annual literary fest 'Gravitas', compiles the biannual newsletter 'Gazette' and the college magazine 'Samanvay', and runs creative writing, poetry, and public speaking workshops throughout the year.",
    establishedYear: 2016,
    location: "Library Discussion Room",
    leadOrganizer: "Ananya Iyer",
    tags: ["writing", "debate", "poetry", "publishing", "public-speaking"],
    isRecruiting: true,
    openRoles: ["Editor-in-Chief", "Content Writer", "Design Coordinator"],
    logo: { filename: "/media/Literary Club.jpg" },
    banner: { filename: "/media/LC banner.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/literaryclub.siesgst" }
    ],
    faqs: [
      { question: "What is Gravitas?", answer: "Gravitas is the club's annual literary fest featuring competitions in creative writing, debate, and spoken word." },
      { question: "How can I contribute to Samanvay?", answer: "Students can submit articles, poems, or artwork during the open call announced each academic year." }
    ]
  },
  {
    name: "Aarambh - The Theatre Club",
    email: "aarambh@campus.edu",
    password: "Campus1234",
    category: "Arts & Culture",
    description: "Aarambh is the theatre club of SIES GST, created by acting enthusiasts to showcase talent in drama, direction, and stagecraft. The club prepares scripted and improvisational performances for inter- and intra-collegiate theatre competitions, and holds regular workshops on acting technique, voice modulation, and stage presence.",
    establishedYear: 2017,
    location: "Main Auditorium Green Room",
    leadOrganizer: "Vivaan Joshi",
    tags: ["theatre", "drama", "acting", "direction", "performance"],
    isRecruiting: true,
    openRoles: ["Director", "Stage Manager", "Scriptwriter"],
    logo: { filename: "/media/aarambh.jpg" },
    banner: { filename: "/media/Theater Banner.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/aarambh.siesgst" }
    ],
    faqs: [
      { question: "Do I need acting experience to audition?", answer: "No prior experience is required; auditions are open to all students and focus on enthusiasm as much as skill." }
    ]
  },
  {
    name: "Aagmi - The Folk Dance Crew",
    email: "aagmi@campus.edu",
    password: "Campus1234",
    category: "Arts & Culture",
    description: "Aagmi is the folk dance crew of SIES GST, giving energetic students a platform to showcase regional and tribal folk dance styles from across India. The crew rehearses year-round for inter-collegiate folk dance competitions and college fests, blending traditional choreography with powerful group performances.",
    establishedYear: 2018,
    location: "Dance Studio, Student Activity Center",
    leadOrganizer: "Diya Kulkarni",
    tags: ["folk-dance", "choreography", "performance", "culture", "competitions"],
    isRecruiting: true,
    openRoles: ["Choreographer", "Team Coordinator"],
    logo: { filename: "/media/Aagmi.jpg" },
    banner: { filename: "/media/Dance Banner - 1.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/aagmi.siesgst" }
    ],
    faqs: [
      { question: "Are auditions held every year?", answer: "Yes, open auditions are held at the start of each academic year for new members." }
    ]
  },
  {
    name: "Moksh - Dance Group",
    email: "moksh@campus.edu",
    password: "Campus1234",
    category: "Arts & Culture",
    description: "Started in 2011, Moksh is SIES GST's competitive group-dance crew known for power-packed performances at inter-collegiate dance competitions across Mumbai. The group holds regular practice sessions covering multiple dance styles and has built a strong track record of wins through discipline, team spirit, and consistent hard work.",
    establishedYear: 2015,
    location: "Student Activity Center",
    leadOrganizer: "Aditi Rane",
    tags: ["dance", "choreography", "competitions", "performance", "teamwork"],
    isRecruiting: true,
    openRoles: ["Choreographer", "Team Captain"],
    logo: { filename: "/media/Moksh.jpg" },
    banner: { filename: "/media/Dance Banner - 2.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/moksh.siesgst" }
    ],
    faqs: [
      { question: "How competitive is Moksh?", answer: "Moksh regularly competes at inter-collegiate dance competitions across Mumbai and maintains a strong winning track record." }
    ]
  },
  {
    name: "Music Club",
    email: "musicclub@campus.edu",
    password: "Campus1234",
    category: "Arts & Culture",
    description: "The Music Club promotes student participation in musical performance across genres, giving vocalists and instrumentalists a shared platform to practice, jam, and perform. It organizes open-mic nights, band practice sessions, and college-fest performances, welcoming both trained musicians and casual enthusiasts.",
    establishedYear: 2016,
    location: "Music Room, Student Activity Center",
    leadOrganizer: "Arjun Menon",
    tags: ["music", "singing", "instruments", "open-mic", "performance"],
    isRecruiting: true,
    openRoles: ["Band Coordinator", "Event Lead"],
    logo: { filename: "/media/music club.jpg" },
    banner: { filename: "/media/Music Banner.jpg" },
    socialLinks: [
      { platform: "instagram", url: "https://instagram.com/musicclub.siesgst" }
    ],
    faqs: [
      { question: "Can I join if I don't play an instrument?", answer: "Yes, vocalists and anyone interested in event organizing for music nights are equally welcome." }
    ]
  }
];

async function seedCommunities() {
  try {
    console.log("Connecting to MongoDB at:", dbUrl);
    await mongoose.connect(dbUrl);
    console.log("Connected successfully.\n");

    // Ensure an Admin exists to satisfy the createdBy requirement
    let admin = await Admin.findOne();
    if (!admin) {
      console.log("No Admin found. Creating default Super Admin...");
      admin = new Admin({
        name: "Super Admin",
        email: "admin@campuscircle.com",
        password: "admin_password_123",
      });
      await admin.save();
      console.log("Created Super Admin:", admin.email);
    } else {
      console.log(`Using existing Admin: ${admin.email} (${admin._id})`);
    }

    console.log(`\nSeeding ${COMMUNITIES_DATA.length} communities...`);

    for (const data of COMMUNITIES_DATA) {
      const emailLower = data.email.toLowerCase().trim();

      // Clean any existing registry entry for this email to avoid duplicates
      await EmailRegistry.deleteOne({ email: emailLower });
      await EmailRegistry.create({ email: emailLower, role: "organizer" });

      // Check if community already exists
      let community = await Community.findOne({ email: emailLower });
      if (community) {
        console.log(`Updating existing community: ${data.name} (${emailLower})`);
        Object.assign(community, data, { createdBy: admin._id });
        await community.save();
      } else {
        community = new Community({
          ...data,
          createdBy: admin._id,
        });
        await community.save();
        console.log(` Created: ${data.name} (${emailLower})`);
      }
    }

    console.log(`\n Successfully seeded all ${COMMUNITIES_DATA.length} communities with password 'Campus1234'!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding communities:", err);
    process.exit(1);
  }
}

seedCommunities();
