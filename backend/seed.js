const mongoose = require("mongoose");
const { User } = require("./models/User");
require("dotenv").config();

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/campuscircle";

const BRANCHES = [
  "Computer Engineering 1",
  "Computer Engineering 2",
  "Computer Engineering 3",
  "Information Technology 1",
  "Information Technology 2",
  "AI & Data Science",
  "AI & Machine Learning",
  "CSE (IoT, Cyber Security, & Blockchain)",
];

const FIRST_NAMES = [
  "Alex", "Priya", "Aarav", "Ananya", "Rohan", "Sneha", "Devansh", "Kavya", "Ishaan", "Meera",
  "Yash", "Aditi", "Siddharth", "Tanvi", "Kabir", "Riya", "Arjun", "Divya", "Utkarsh", "Natasha",
  "Aarohi", "Aditya", "Akash", "Anandi", "Aniket", "Avani", "Bhavya", "Chaitanya", "Deepak", "Esha",
  "Gaurav", "Harsh", "Isha", "Jay", "Kritika", "Manish", "Nikhil", "Omkar", "Parth", "Pooja",
  "Rahul", "Rhea", "Siddhesh", "Tanya", "Varun", "Vedant", "Zoya", "Aman", "Bhumi", "Chetan",
  "Drishti", "Farhan", "Gayatri", "Hrithik", "Ishita", "Janhavi", "Kunal", "Lavanya", "Mayank", "Neha",
  "Pranav", "Radhika", "Sahil", "Tanisha", "Vivan", "Yamini", "Zeeshan", "Karan", "Nisha", "Sameer"
];

const LAST_NAMES = [
  "Thompson", "Sharma", "Patel", "Iyer", "Gupta", "Kulkarni", "Mehta", "Nair", "Verma", "Reddy",
  "Nambiar", "Deshmukh", "Rao", "Joshi", "Kapoor", "Sen", "Banerjee", "Choudhury", "Saxena", "Fernandez",
  "Agarwal", "Bhatia", "Chauhan", "Desai", "Dutta", "Gowda", "Hegde", "Jain", "Mahajan", "Menon",
  "Mishra", "Pandey", "Roy", "Sengupta", "Shah", "Singh", "Tiwari", "Venkatesh", "Wagh", "Yadav"
];

const SKILLS_LIST = [
  ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
  ["Python", "PyTorch", "TensorFlow", "Data Science", "Scikit-Learn"],
  ["Go", "Docker", "Kubernetes", "AWS", "Microservices"],
  ["Java", "Spring Boot", "MySQL", "Kafka", "Redis"],
  ["Figma", "UI/UX", "CSS3", "Tailwind CSS", "Design Systems"],
  ["Flutter", "Dart", "Firebase", "iOS", "Android"],
  ["Rust", "C++", "Systems", "WebAssembly", "Linux"],
  ["Cybersecurity", "Ethical Hacking", "Python", "Linux", "Wireshark"],
  ["Vue.js", "Nuxt.js", "Tailwind CSS", "JavaScript", "REST APIs"],
  ["C++", "DSA", "Competitive Programming", "Algorithms", "Java"],
  ["Next.js", "React", "GraphQL", "Tailwind CSS", "Prisma"],
  ["Machine Learning", "OpenCV", "Python", "Deep Learning", "Keras"],
  ["DevOps", "CI/CD", "Docker", "Ansible", "Terraform"]
];

const TAGS_LIST = [
  ["webdev", "react", "fullstack", "hackathons"],
  ["ai", "ml", "python", "datascience"],
  ["cloud", "devops", "aws", "docker"],
  ["java", "backend", "springboot", "databases"],
  ["ui/ux", "figma", "design", "frontend"],
  ["mobile", "flutter", "apps", "firebase"],
  ["rust", "systems", "lowlevel", "cpp"],
  ["security", "cyber", "ethicalhacking", "linux"],
  ["vue", "frontend", "web", "js"],
  ["dsa", "algorithms", "coding", "cpp"],
  ["nextjs", "react", "graphql", "web"],
  ["computervision", "opencv", "ml", "ai"]
];

const AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80"
];

function generateStudents(totalCount = 70) {
  const students = [];

  for (let i = 0; i < totalCount; i++) {
    const fn = FIRST_NAMES[i % FIRST_NAMES.length];
    const ln = LAST_NAMES[i % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    const cleanFn = fn.toLowerCase().replace(/[^a-z]/g, "");
    const cleanLn = ln.toLowerCase().replace(/[^a-z]/g, "");
    const suffix = i >= 20 ? i + 1 : "";
    const email = `${cleanFn}.${cleanLn}${suffix}@campus.edu`;
    const numStr = String(i + 1).padStart(3, "0");
    const rollNo = `CS2023${numStr}`;
    const prnNo = `103221${numStr}`;
    const branch = BRANCHES[i % BRANCHES.length];
    const yearOfJoining = 2023 + (i % 3); // 2023, 2024, or 2025
    const skills = SKILLS_LIST[i % SKILLS_LIST.length];
    const interestTags = TAGS_LIST[i % TAGS_LIST.length];
    const avatar = AVATARS[i % AVATARS.length];
    const bio = `Passionate ${skills[0]} developer and student community member interested in ${interestTags.join(", ")}.`;

    students.push({
      name,
      email,
      password: "Campus1234",
      rollNo,
      prnNo,
      branch,
      yearOfJoining,
      bio,
      avatar,
      skills,
      education: [`B.E. ${branch} — Campus University (${yearOfJoining}-${yearOfJoining + 4})`],
      interestTags,
      socialLinks: [
        { platform: "github", url: `https://github.com/${cleanFn}${cleanLn}` },
        { platform: "linkedin", url: `https://linkedin.com/in/${cleanFn}${cleanLn}` },
      ],
      followerCount: (i * 7 + 13) % 250,
    });
  }

  return students;
}

async function seedDB() {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing dummy students to prevent rollNo duplicate key conflicts
    await User.deleteMany({ email: /@campus\.edu$/ });
    console.log("Cleared old campus student records.");

    const ALL_STUDENTS = generateStudents(70);

    for (const studentData of ALL_STUDENTS) {
      const user = new User(studentData);
      await user.save();
    }

    console.log(`Successfully seeded ${ALL_STUDENTS.length} dummy student records with password Campus1234!`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
}

seedDB();
