import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./BuddiesPage.css";
import { SEED_BUDDIES } from "./buddiesData";
import BuddyCard from "./BuddyCard";
import BuddiesHeader from "./BuddiesHeader";
import BuddiesFilterBar from "./BuddiesFilterBar";

const CARDS_PER_PAGE = 30;

function getOrdinalSuffix(n) {
  if (isNaN(n) || n < 1) return "th";
  if (n === 1) return "st";
  if (n === 2) return "nd";
  if (n === 3) return "rd";
  return "th";
}

/* ─────────────────────────────────────────────────────────────
   MAIN BUDDIES PAGE COMPONENT
───────────────────────────────────────────────────────────── */
function BuddiesPage() {
  const [buddies, setBuddies] = useState(SEED_BUDDIES);
  const [followedIds, setFollowedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchStudentsFromBackend() {
      try {
        const { data } = await axios.get("http://localhost:8080/api/profile", {
          withCredentials: true,
        });

        if (data && data.success && Array.isArray(data.students) && data.students.length > 0 && isMounted) {
          const currentYearNow = new Date().getFullYear();
          const dbStudents = data.students.map((u) => {
            const yrNum = u.yearOfJoining ? currentYearNow - u.yearOfJoining + 1 : 3;
            const yearStr = yrNum > 0 && yrNum <= 4 ? `${yrNum}${getOrdinalSuffix(yrNum)} Year` : "Graduate";

            return {
              id: u._id,
              name: u.name,
              branch: u.branch || "Computer Engineering",
              year: yearStr,
              yearOfJoining: u.yearOfJoining,
              bio: u.bio || "Active CampusCircle student member.",
              skills: u.skills || [],
              avatarUrl: u.avatar || null,
              bannerGradient: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 45%, #EC4899 100%)",
              followingCount: 14,
              followersCount: u.followerCount || 0,
              online: true,
            };
          });
          setBuddies(dbStudents);
        }
      } catch (err) {
        console.warn("Using fallback seed buddies data:", err?.response?.data?.message || err.message);
      }
    }

    fetchStudentsFromBackend();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset pagination to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedYear, selectedSkill]);

  const toggleFollow = (id) => {
    setFollowedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filtered = buddies.filter((b) => {
    if (selectedBranch !== "All Branches" && b.branch !== selectedBranch) return false;
    if (selectedYear !== "All Years" && b.year !== selectedYear) return false;
    if (selectedSkill !== "All" && !b.skills.includes(selectedSkill)) return false;
    if (
      searchQuery &&
      !b.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.bio.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const currentCards = filtered.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedBranch("All Branches");
    setSelectedYear("All Years");
    setSelectedSkill("All");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedBranch !== "All Branches" ||
    selectedYear !== "All Years" ||
    selectedSkill !== "All";

  return (
    <div className="buddies-page">
      {/* Header Banner */}
      <BuddiesHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Filter Controls Bar */}
      <BuddiesFilterBar
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedSkill={selectedSkill}
        setSelectedSkill={setSelectedSkill}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
      />

      {/* Student Cards Grid */}
      <section className="buddies-section" ref={sectionRef}>
        <div className="buddies-section-header">
          <h3 className="buddies-section-title">
            <i className="fa-solid fa-users buddies-section-icon" />
            Students ({filtered.length} total{totalPages > 1 ? ` — Page ${currentPage} of ${totalPages}` : ""})
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="buddies-empty">
            <div className="buddies-empty-icon"><i className="fa-solid fa-user-slash" /></div>
            <h4 className="buddies-empty-title">No campus buddies found</h4>
            <p className="buddies-empty-sub">Try searching for a different skill or branch filter.</p>
            <button className="buddies-empty-btn" onClick={clearAllFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="buddies-grid">
              {currentCards.map((student) => {
                const isFollowed = followedIds.includes(student.id);
                return (
                  <BuddyCard
                    key={student.id}
                    student={student}
                    isFollowed={isFollowed}
                    onToggleFollow={toggleFollow}
                  />
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="buddies-pagination">
                <button
                  type="button"
                  className="buddies-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="fa-solid fa-arrow-left" /> Previous 30
                </button>

                <div className="buddies-page-info">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      className={`buddies-page-number-pill ${
                        pageNum === currentPage ? "buddies-page-number-pill--active" : ""
                      }`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="buddies-page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next 30 <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default BuddiesPage;