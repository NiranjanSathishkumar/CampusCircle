import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import ProfileTabs from "./ProfileTabs";
import { SEED_BUDDIES } from "../buddies/buddiesData";
import "./ProfilePage.css";

/**
 * ProfilePage – Premium 2-Column Social & Academic Dashboard.
 * Supports both self-profile (/profile) and student ID profiles (/profile/:id).
 */
function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personalDetails");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeTab, id]);

  const foundStudent = id ? SEED_BUDDIES.find((b) => String(b.id) === String(id)) : null;

  const [profile, setProfile] = useState({
    name: foundStudent ? foundStudent.name : "Alex Thompson",
    branch: foundStudent ? foundStudent.branch : "Computer Science & Engineering",
    year: foundStudent ? foundStudent.year : "3rd Year",
    bio: foundStudent ? foundStudent.bio : "Full-stack builder & AI researcher at Stanford AI Lab. Passionate about open-source and student communities.",
    skills: foundStudent ? foundStudent.skills : ["React", "Python", "Machine Learning", "Node.js", "Figma"],
    communities: foundStudent ? foundStudent.communities : [
      { name: "Turing Club", role: "Lead Developer" },
      { name: "AI Research Society", role: "Vice President" },
    ],
    avatarUrl: foundStudent ? foundStudent.avatarUrl : null,
    bannerUrl: null,
    bannerGradient: foundStudent ? (foundStudent.bannerGradient || "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)") : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)",
  });

  /* ── Full Student Details (User Schema state) ── */
  const [userDetails, setUserDetails] = useState({
    name: foundStudent ? foundStudent.name : "Alex Thompson",
    email: foundStudent ? `${foundStudent.name.toLowerCase().replace(/\s+/g, ".")}@campus.edu` : "alex.thompson@stanford.edu",
    rollNo: foundStudent ? `CS-2024-00${foundStudent.id}` : "CS-2024-042",
    prnNo: foundStudent ? `10322100${foundStudent.id}` : "1032210459",
    branch: foundStudent ? foundStudent.branch : "Computer Science & Engineering",
    yearOfJoining: 2023,
    bio: foundStudent ? foundStudent.bio : "Full-stack builder & AI researcher at Stanford AI Lab. Passionate about open-source and student communities.",
    interestTags: foundStudent ? foundStudent.skills.map((s) => s.toLowerCase()) : ["webdev", "ai/ml", "hackathons", "ui/ux", "robotics"],
    skills: foundStudent ? foundStudent.skills : ["React", "Python", "Machine Learning", "Node.js", "Figma", "MongoDB"],
    education: [
      "Campus University — B.S. Computer Engineering",
      "Higher Secondary Certificate (HSC) — 95.8%",
    ],
    socialLinks: foundStudent?.socials ? [
      { platform: "github", url: `https://github.com/${foundStudent.socials.github}` },
      { platform: "linkedin", url: `https://linkedin.com/${foundStudent.socials.linkedin}` },
    ] : [
      { platform: "linkedin", url: "https://linkedin.com/in/alex-thompson" },
      { platform: "github", url: "https://github.com/alex-thompson" },
      { platform: "instagram", url: "https://instagram.com/alex_builds" },
    ],
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchProfileData() {
      try {
        const endpoint = id
          ? `http://localhost:8080/api/profile/${id}`
          : `http://localhost:8080/api/profile/me`;

        const { data } = await axios.get(endpoint, { withCredentials: true });

        if (data && data.success && data.user && isMounted) {
          const u = data.user;
          setUserDetails({
            id: u._id,
            name: u.name || "",
            email: u.email || "",
            rollNo: u.rollNo || "",
            prnNo: u.prnNo || "",
            branch: u.branch || "Computer Engineering 1",
            yearOfJoining: u.yearOfJoining || 2024,
            bio: u.bio || "",
            interestTags: u.interestTags || [],
            skills: u.skills || [],
            education: u.education || [],
            socialLinks: u.socialLinks || [],
          });

          setProfile((prev) => ({
            ...prev,
            name: u.name || prev.name,
            branch: u.branch || prev.branch,
            bio: u.bio || prev.bio,
            skills: u.skills && u.skills.length > 0 ? u.skills : prev.skills,
            avatarUrl: u.avatar || prev.avatarUrl,
          }));
        }
      } catch (err) {
        console.warn("Backend profile fetch failed, fallback to seed data:", err?.response?.data?.message || err.message);
      }
    }

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [id]);


  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "Google Cloud Professional Architect",
      issuer: "Google Cloud",
      date: "2023-10-14",
      description: "Successfully demonstrated expertise in designing, developing, and managing robust, secure, scalable cloud solutions.",
      imageUrl: null,
      verificationLink: "https://cloud.google.com/certification",
    },
    {
      id: 2,
      title: "Advanced Machine Learning Specialization",
      issuer: "IBM / Coursera",
      date: "2024-01-20",
      description: "Mastered deep learning frameworks, neural network architectures, and advanced statistical modeling techniques.",
      imageUrl: null,
      verificationLink: "https://coursera.org/verify",
    },
    {
      id: 3,
      title: "Undergraduate Research Fellowship",
      issuer: "Stanford University",
      date: "2023-05-15",
      description: "Awarded for outstanding contribution to the 'AI for Social Good' research initiative at the Stanford AI Lab.",
      imageUrl: null,
      verificationLink: "https://stanford.edu/research",
    },
  ]);

  /* ── Tab data states ─────────────── */
  const [bookmarks, setBookmarks] = useState([
    {
      id: 1,
      title: "AI Ethics Symposium 2025",
      dateBadge: "OCT 15",
      meta: "Great Hall, Building A",
      category: "Events",
      imageUrl: null,
    },
    {
      id: 2,
      title: "Logic & Philosophy Mixer",
      dateBadge: "NOV 02",
      meta: "Academic Lounge",
      category: "Events",
      imageUrl: null,
    },
    {
      id: 3,
      title: "Building Scalable Microservices with Go",
      dateBadge: "NOV 18",
      meta: "Tech Hub Auditorium",
      category: "Posts",
      imageUrl: null,
    },
  ]);

  const [followedClubs, setFollowedClubs] = useState([
    {
      id: 1,
      name: "Bio-Engineering Society",
      category: "Science",
      description: "Exploring the intersection of biology and synthetic engineering through collaborative research.",
      followers: 1240,
      icon: "fa-microscope",
      iconBg: "#E8F0FE",
      iconColor: "#1A73E8",
      membersCount: "+12",
      imageUrl: null,
    },
    {
      id: 2,
      name: "The Coding Collective",
      category: "Tech",
      description: "Open-source contributions, weekly hackathons, and algorithmic skill-building workshops.",
      followers: 3800,
      icon: "fa-code",
      iconBg: "#E6F4EA",
      iconColor: "#137333",
      membersCount: "+85",
      imageUrl: null,
    },
    {
      id: 3,
      name: "Digital Arts Guild",
      category: "Arts",
      description: "A community for digital painters, UI designers, and 3D animators to share their portfolios.",
      followers: 950,
      icon: "fa-palette",
      iconBg: "#FCE8E6",
      iconColor: "#C5221F",
      membersCount: "+42",
      imageUrl: null,
    },
    {
      id: 4,
      name: "Urban Planning Forum",
      category: "Science",
      description: "Designing the cities of the future with a focus on sustainability and community mobility.",
      followers: 2100,
      icon: "fa-drafting-compass",
      iconBg: "#FEF7E0",
      iconColor: "#B06000",
      membersCount: "+29",
      imageUrl: null,
    },
    {
      id: 5,
      name: "Neuroscience Hub",
      category: "Science",
      description: "Exploring the intricacies of the human brain through data analysis and peer discussion.",
      followers: 1500,
      icon: "fa-brain",
      iconBg: "#F3E8FD",
      iconColor: "#8E24AA",
      membersCount: "+15",
      imageUrl: null,
    },
  ]);

  const [following, setFollowing] = useState([
    { id: 1, name: "Dr. Sarah Jenkins", title: "Postdoctoral Research, AI Ethics", degreeBadge: "Ph.D. 2024", online: true, avatarUrl: null },
    { id: 2, name: "Marcus Thorne", title: "Senior, Computer Science", degreeBadge: "UG 2025", online: false, avatarUrl: null },
    { id: 3, name: "Elena Rodriguez", title: "Graduate, Biotech Research", degreeBadge: "MS 2023", online: true, avatarUrl: null },
    { id: 4, name: "James Wilson", title: "Junior, Civil Engineering", degreeBadge: "UG 2026", online: false, avatarUrl: null },
  ]);

  const [followers, setFollowers] = useState([
    { id: 1, name: "Rahul Sharma", title: "Senior, Mechanical Engineering", degreeBadge: "UG 2025", online: true, avatarUrl: null },
    { id: 2, name: "Sneha Pillai", title: "Sophomore, Computer Science", degreeBadge: "UG 2027", online: true, avatarUrl: null },
    { id: 3, name: "Kiran Babu", title: "Junior, Electrical Engineering", degreeBadge: "UG 2026", online: false, avatarUrl: null },
    { id: 4, name: "Priya Krishnan", title: "Sophomore, Data Science", degreeBadge: "UG 2027", online: true, avatarUrl: null },
  ]);

  /* ── Backend API Handlers ───────────────────────────── */
  const handleSavePersonalDetails = async (updatedDetails) => {
    try {
      const { data } = await axios.post(
        "http://localhost:8080/api/profile",
        updatedDetails,
        { withCredentials: true }
      );

      if (data && data.success && data.user) {
        const u = data.user;
        setUserDetails({
          id: u._id,
          name: u.name || "",
          email: u.email || "",
          rollNo: u.rollNo || "",
          prnNo: u.prnNo || "",
          branch: u.branch || "",
          yearOfJoining: u.yearOfJoining || 2024,
          bio: u.bio || "",
          interestTags: u.interestTags || [],
          skills: u.skills || [],
          education: u.education || [],
          socialLinks: u.socialLinks || [],
        });

        setProfile((prev) => ({
          ...prev,
          name: u.name || prev.name,
          branch: u.branch || prev.branch,
          bio: u.bio || prev.bio,
          skills: u.skills && u.skills.length > 0 ? u.skills : prev.skills,
        }));
      } else {
        setUserDetails(updatedDetails);
      }
    } catch (err) {
      console.error("Failed to save profile on backend:", err);
      // Fallback to local state update if backend unavailable
      setUserDetails(updatedDetails);
      setProfile((prev) => ({
        ...prev,
        name: updatedDetails.name || prev.name,
        branch: updatedDetails.branch || prev.branch,
        bio: updatedDetails.bio || prev.bio,
        skills: updatedDetails.skills || prev.skills,
      }));
      throw new Error(err?.response?.data?.message || "Failed to save changes to server");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("http://localhost:8080/api/profile", { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Account deletion error:", err);
      alert(err?.response?.data?.message || "Failed to delete account.");
    }
  };

  const handleAvatarChange = async (file) => {
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatarUrl: previewUrl }));
  };

  const handleBannerChange = async (file) => {
    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, bannerUrl: previewUrl }));
  };

  const handleAddAchievement = (newAch) => {
    setAchievements((prev) => [newAch, ...prev]);
  };

  const handleDeleteAchievement = (id) => {
    setAchievements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUnbookmark     = (id) => setBookmarks((p) => p.filter((b) => b.id !== id));
  const handleUnfollowClub   = (id) => setFollowedClubs((p) => p.filter((c) => c.id !== id));
  const handleUnfollow       = (id) => setFollowing((p) => p.filter((u) => u.id !== id));
  const handleRemoveFollower = (id) => setFollowers((p) => p.filter((u) => u.id !== id));

  const stats = {
    followersCount: followers.length,
    followingCount: following.length,
    clubsCount: followedClubs.length,
    achievementsCount: achievements.length,
  };

  const navItems = [
    { key: "personalDetails", label: "Profile Details", icon: "fa-regular fa-user" },
    { key: "achievements",     label: "Achievements",     icon: "fa-solid fa-award", count: achievements.length },
    { key: "bookmarked",       label: "Bookmarks",        icon: "fa-regular fa-bookmark", count: bookmarks.length },
    { key: "followedClubs",    label: "Clubs",            icon: "fa-solid fa-people-group", count: followedClubs.length },
    { key: "network",          label: "Network",          icon: "fa-solid fa-users", count: followers.length + following.length },
  ];

  return (
    <div className="prof-shell">
      {/* ── Breadcrumb Navigation ── */}
      <nav className="prof-breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="prof-breadcrumb-link">
          <i className="fa-solid fa-house" style={{ fontSize: "0.75rem" }} />
          Home
        </Link>
        <i className="fa-solid fa-chevron-right prof-breadcrumb-sep" />
        <span className="prof-breadcrumb-current">Academic Dashboard</span>
      </nav>

      {/* ── 2-Column Dashboard Layout ── */}
      <div className="prof-dashboard">
        {/* ── Left Sidebar Navigation Panel ── */}
        <ProfileSidebar
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* ── Right Main Content Area ── */}
        <main className="prof-main-panel">
          {/* Summary Card Banner Header - shown ONLY on Personal Details tab */}
          {activeTab === "personalDetails" && (
            <ProfileHeader
              profile={profile}
              stats={stats}
              onAvatarChange={handleAvatarChange}
              onBannerChange={handleBannerChange}
              onSelectTab={(tabKey) => setActiveTab(tabKey)}
              editable={true}
            />
          )}

          {/* Active Tab View Panel */}
          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userDetails={userDetails}
            onSavePersonalDetails={handleSavePersonalDetails}
            onDeleteAccount={handleDeleteAccount}
            achievements={achievements}
            onAddAchievement={handleAddAchievement}
            onDeleteAchievement={handleDeleteAchievement}
            bookmarks={bookmarks}
            followedClubs={followedClubs}
            following={following}
            followers={followers}
            onUnbookmark={handleUnbookmark}
            onUnfollowClub={handleUnfollowClub}
            onUnfollow={handleUnfollow}
            onRemoveFollower={handleRemoveFollower}
          />
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;