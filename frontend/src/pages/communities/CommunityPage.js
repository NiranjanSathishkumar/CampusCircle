import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommunityPage.css";
import { SEED_COMMUNITIES } from "./communitiesData";
import CommunityModal from "./CommunityModal";
import CommunityCard from "./CommunityCard";
import CommunityFilters from "./CommunityFilters";

/* ─────────────────────────────────────────────────────────────
   MAIN COMMUNITY PAGE COMPONENT
───────────────────────────────────────────────────────────── */
function CommunityPage() {
  const navigate = useNavigate();
  const [communities] = useState(SEED_COMMUNITIES);
  const [followedIds, setFollowedIds] = useState(["turing", "ai"]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("Most Popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [modalClub, setModalClub] = useState(null);

  const toggleFollow = (id) => {
    setFollowedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  /* Filter & Sort logic */
  let filtered = communities.filter((c) => {
    if (activeCategory !== "all" && c.category !== activeCategory) return false;
    if (onlyRecruiting && !c.recruiting) return false;
    if (
      searchQuery &&
      !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  if (sortBy === "Most Popular") {
    filtered = [...filtered].sort((a, b) => b.members - a.members);
  } else if (sortBy === "Name (A–Z)") {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "Most Active Events") {
    filtered = [...filtered].sort((a, b) => b.activeEvents - a.activeEvents);
  }

  return (
    <div className="comm-page">
      {/* Search & Category Filter Controls */}
      <CommunityFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onlyRecruiting={onlyRecruiting}
        setOnlyRecruiting={setOnlyRecruiting}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      {/* ── All Communities Grid ── */}
      <section className="comm-section">
        <div className="comm-section-header">
          <h3 className="comm-section-title">
            <i className="fa-solid fa-grid-2 comm-section-icon" />
            All Clubs & Societies ({filtered.length}{filtered.length > 15 ? " — showing 15" : ""})
          </h3>
        </div>

        {filtered.length === 0 ? (
          <div className="comm-empty-state">
            <div className="comm-empty-icon"><i className="fa-solid fa-users-slash" /></div>
            <h4 className="comm-empty-title">No communities found</h4>
            <p className="comm-empty-sub">Try broadening your search term or clearing the recruiting filter.</p>
            <button
              className="comm-empty-btn"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setOnlyRecruiting(false);
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="comm-grid">
            {filtered.slice(0, 15).map((club) => {
              const isFollowed = followedIds.includes(club.id);
              return (
                <CommunityCard
                  key={club.id}
                  club={club}
                  isFollowed={isFollowed}
                  onToggleFollow={toggleFollow}
                  onViewDetails={(c) => navigate(`/communities/${c.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* ── Community Detail Modal ── */}
      {modalClub && (
        <CommunityModal
          club={modalClub}
          followed={followedIds.includes(modalClub.id)}
          onToggleFollow={toggleFollow}
          onClose={() => setModalClub(null)}
        />
      )}
    </div>
  );
}

export default CommunityPage;