import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { SEED_BUDDIES } from "./buddiesData";
import BuddyHero from "./BuddyHero";
import BuddySidebar from "./BuddySidebar";
import "./BuddyProfilePage.css";

function BuddyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const seedMatch = SEED_BUDDIES.find(
    (b) =>
      String(b.id) === String(id) ||
      b.name.toLowerCase().replace(/\s+/g, "-") === String(id).toLowerCase() ||
      b.name.toLowerCase() === String(id).toLowerCase()
  );

  const [student, setStudent] = useState(() => {
    if (seedMatch) return seedMatch;
    const formattedName = id
      ? id.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Student";
    return {
      id: id || "1",
      name: formattedName.length > 2 ? formattedName : `Student #${id}`,
      branch: "Computer Science & Engineering",
      year: "3rd Year",
      bio: "Active student community member & tech contributor at CampusCircle.",
      avatarUrl: null,
      bannerGradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)",
      skills: ["React", "JavaScript", "Python", "Web Development"],
      communities: [
        { name: "Turing Club", role: "Member" },
        { name: "The Coding Collective", role: "Contributor" },
      ],
      followersCount: 142,
      followingCount: 98,
      achievementsCount: 2,
      achievements: [
        { title: "Campus Hackathon Participant", issuer: "CampusCircle", year: "2024" },
      ],
      socials: {
        github: "student",
        linkedin: "in/student",
        instagram: "student_campus",
      },
      online: true,
    };
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchBuddyProfile() {
      if (!id) return;
      try {
        const { data } = await axios.get(`http://localhost:8080/api/profile/${id}`, {
          withCredentials: true,
        });

        if (data && data.success && data.user && isMounted) {
          const u = data.user;
          const socialsObj = {};
          if (Array.isArray(u.socialLinks)) {
            u.socialLinks.forEach((l) => {
              if (l.platform) socialsObj[l.platform] = l.url;
            });
          }

          setStudent({
            id: u._id,
            name: u.name || "Student",
            branch: u.branch || "Computer Science",
            year: u.yearOfJoining ? `Joined ${u.yearOfJoining}` : "Student",
            bio: u.bio || "Active student member",
            avatarUrl: u.avatar || null,
            bannerGradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)",
            skills: u.skills || [],
            communities: [
              { name: "Turing Club", role: "Member" },
            ],
            followersCount: u.followerCount || 0,
            followingCount: 12,
            achievementsCount: 1,
            achievements: [
              { title: "Campus Member", issuer: "CampusCircle", year: "2025" },
            ],
            socials: socialsObj,
            online: true,
          });
        }
      } catch (err) {
        // Silent fallback to seed/mock data
      }
    }

    fetchBuddyProfile();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const [isFollowed, setIsFollowed] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast({ msg, hide: false });
    setTimeout(() => setToast((t) => t ? { ...t, hide: true } : null), 2000);
    setTimeout(() => setToast(null), 2350);
  }, []);

  const handleShare = useCallback(() => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        showToast("✓ Link copied to clipboard");
      });
    } else {
      showToast("✓ Link copied!");
    }
  }, [showToast]);

  /* ── 404 fallback check ── */
  if (!student) {

    return (
      <div className="bpp">
        <div className="bpp-not-found">
          <div className="bpp-not-found__icon">
            <i className="fa-solid fa-user-slash" />
          </div>
          <h2>Student Not Found</h2>
          <p>This profile does not exist or may have been removed.</p>
          <button className="bpp-back" onClick={() => navigate("/buddies")}>
            <i className="fa-solid fa-arrow-left" /> Back to Buddies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bpp">
      {/* ── Back navigation ── */}
      <button className="bpp-back" onClick={() => navigate("/buddies")}>
        <i className="fa-solid fa-arrow-left" /> Back to Buddies
      </button>

      {/* ── Hero Card ── */}
      <BuddyHero
        student={student}
        isFollowed={isFollowed}
        setIsFollowed={setIsFollowed}
        onShare={handleShare}
      />

      {/* ── Main content + sidebar grid ── */}
      <div className="bpp-content">
        {/* Left: main sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Skills */}
          <div className="bpp-section">
            <h3 className="bpp-section-title">
              <i className="fa-solid fa-code" />
              Skills &amp; Technologies
            </h3>
            <div className="bpp-skills-wrap">
              {student.skills.map((sk) => (
                <span key={sk} className="bpp-skill-pill">{sk}</span>
              ))}
            </div>
          </div>

          {/* Communities */}
          <div className="bpp-section">
            <h3 className="bpp-section-title">
              <i className="fa-solid fa-users" />
              Communities &amp; Clubs
            </h3>
            {student.communities.length === 0 ? (
              <p className="bpp-empty-note">No communities joined yet.</p>
            ) : (
              <div className="bpp-comm-list">
                {student.communities.map((c, idx) => (
                  <div key={idx} className="bpp-comm-item">
                    <div className="bpp-comm-icon">
                      <i className="fa-solid fa-users" />
                    </div>
                    <div>
                      <p className="bpp-comm-name">{c.name}</p>
                      <span className="bpp-comm-role">{c.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="bpp-section">
            <h3 className="bpp-section-title">
              <i className="fa-solid fa-trophy" />
              Certificates &amp; Awards
            </h3>
            {student.achievements.length === 0 ? (
              <p className="bpp-empty-note">No achievements posted yet.</p>
            ) : (
              <div className="bpp-ach-list">
                {student.achievements.map((ach, idx) => (
                  <div key={idx} className="bpp-ach-card">
                    <div className="bpp-ach-icon">
                      <i className="fa-solid fa-award" />
                    </div>
                    <div>
                      <h5 className="bpp-ach-title">{ach.title}</h5>
                      <span className="bpp-ach-meta">{ach.issuer} &middot; {ach.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <BuddySidebar student={student} />
      </div>

      {/* ── Toast notification ── */}
      {toast && (
        <div className={`bpp-toast ${toast.hide ? "bpp-toast--hide" : ""}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default BuddyProfilePage;
