import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DiscoverPage.css";
import {
  CURRENT_USER,
  COMMUNITIES,
  POST_TYPES,
  SEED_POSTS,
  isInDateRange,
} from "./discoverData";
import {
  FilterDropdown,
  DateFilterDropdown,
  SortDropdown,
} from "./DiscoverFilters";
import ComposePanel from "./ComposePanel";
import PostCard from "./PostCard";
import PostModal from "./PostModal";
import DiscoverCommunityStrip from "./DiscoverCommunityStrip";
import DiscoverSidebar from "./DiscoverSidebar";

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
function DiscoverPage() {
  const { id: routePostId } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState(SEED_POSTS);
  const [activeCommunity, setActiveCommunity] = useState("all");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [activeCommunity]);
  const [types, setTypes] = useState([]);
  const [sortBy, setSortBy] = useState("Latest First");
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState("All Time");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modal target post & target image index
  const [modalTarget, setModalTarget] = useState(null); // { post: obj, index: 0 }

  // Sync route parameter :id with modal state
  useEffect(() => {
    if (routePostId) {
      const match = posts.find((p) => String(p.id) === String(routePostId));
      if (match) {
        setModalTarget((prev) => (prev?.post?.id === match.id ? prev : { post: match, index: 0 }));
      }
    }
  }, [routePostId, posts]);

  const isOrganizer = CURRENT_USER.role === "organizer";

  const toggleType = (v) =>
    setTypes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const clearAll = useCallback(() => {
    setTypes([]);
    setActiveCommunity("all");
    setSearch("");
    setPreset("All Time");
    setDateFrom("");
    setDateTo("");
  }, []);

  const handleLike = useCallback(
    (id) =>
      setPosts((p) =>
        p.map((post) =>
          post.id === id
            ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      ),
    []
  );

  const handleBookmark = useCallback(
    (id) =>
      setPosts((p) =>
        p.map((post) => (post.id === id ? { ...post, bookmarked: !post.bookmarked } : post))
      ),
    []
  );

  const handleAddComment = useCallback(
    (postId, comment) =>
      setPosts((p) =>
        p.map((post) =>
          post.id === postId
            ? { ...post, commentList: [...post.commentList, comment], comments: post.comments + 1 }
            : post
        )
      ),
    []
  );

  const handleNewPost = (newPost) => setPosts((p) => [newPost, ...p]);

  const openModal = (post, imgIndex = 0) => {
    setModalTarget({ post, index: imgIndex });
    navigate(`/posts/${post.id}`, { replace: false });
  };

  const closeModal = () => {
    setModalTarget(null);
    if (window.location.pathname.includes("/posts/")) {
      navigate("/discover");
    }
  };

  // Keep modal post synced with latest state
  const syncedModalPost = modalTarget
    ? posts.find((p) => p.id === modalTarget.post.id) || null
    : null;


  const totalActive =
    types.length +
    (activeCommunity !== "all" ? 1 : 0) +
    (search ? 1 : 0) +
    (preset !== "All Time" || dateFrom || dateTo ? 1 : 0);

  /* Filter + sort */
  let filtered = posts.filter((p) => {
    if (activeCommunity !== "all" && p.community !== activeCommunity) return false;
    if (types.length && !types.includes(p.type)) return false;
    if (
      search &&
      !p.content.toLowerCase().includes(search.toLowerCase()) &&
      !p.author.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (!isInDateRange(p.rawDate, preset, dateFrom, dateTo)) return false;
    return true;
  });

  if (sortBy === "Most Liked") filtered = [...filtered].sort((a, b) => b.likes - a.likes);
  if (sortBy === "Most Commented") filtered = [...filtered].sort((a, b) => b.comments - a.comments);

  const pinned = filtered.filter((p) => p.pinned);
  const rest = filtered.filter((p) => !p.pinned);

  // Cap total displayed posts at 15
  const DISPLAY_LIMIT = 15;
  const pinnedDisplay = pinned.slice(0, DISPLAY_LIMIT);
  const restDisplay = rest.slice(0, Math.max(0, DISPLAY_LIMIT - pinnedDisplay.length));
  const totalDisplayed = pinnedDisplay.length + restDisplay.length;

  const handleTagClick = (tag) => {
    setSearch(tag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="disc-page">
      {/* ── FEED column ── */}
      <div className="disc-feed-col">
        {/* Header */}
        <div className="disc-page-header">
          <span className="disc-header-badge">
            <i className="fa-solid fa-fire-flame-curved" /> DISCOVER FEED
          </span>
          <h1 className="disc-page-title">Campus Updates & Stories</h1>
          <p className="disc-page-sub">
            Official campus updates, upcoming events, and stories from active student clubs.
          </p>
          <div className="disc-search-wrap">
            <i className="fa-solid fa-magnifying-glass disc-search-icon" />
            <input
              className="disc-search-input"
              placeholder="Search posts, tags, or clubs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="disc-search-clear" onClick={() => setSearch("")}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>

        {/* Student read-only banner */}
        {!isOrganizer && (
          <div className="disc-readonly-banner">
            <i className="fa-solid fa-shield-check disc-readonly-icon" />
            <div>
              <p className="disc-readonly-title">Read-only Student View</p>
              <p className="disc-readonly-sub">
                Only verified club organisers can post content. You can like, comment, save, and share
                posts with your friends!
              </p>
            </div>
          </div>
        )}

        {/* Compose (Organisers only) */}
        {isOrganizer && <ComposePanel onPost={handleNewPost} />}

        {/* Community strip */}
        <DiscoverCommunityStrip
          activeCommunity={activeCommunity}
          setActiveCommunity={setActiveCommunity}
        />

        {/* Filter bar */}
        <div className="disc-filter-bar">
          <div className="disc-filter-pills">
            <button
              className={`disc-filter-pill disc-filter-pill--all ${showFilters ? "disc-filter-pill--active" : ""}`}
              onClick={() => setShowFilters((p) => !p)}
            >
              <i className="fa-solid fa-sliders" /> Filters
              {totalActive > 0 && <span className="disc-filter-count">{totalActive}</span>}
            </button>
            <div className={`disc-filter-dropdowns ${showFilters ? "disc-filter-dropdowns--open" : ""}`}>
              <FilterDropdown
                label="Post Type"
                icon="fa-layer-group"
                options={POST_TYPES}
                selected={types}
                onSelect={toggleType}
                onClear={() => setTypes([])}
              />
              <DateFilterDropdown
                preset={preset}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onPreset={setPreset}
                onDateFrom={setDateFrom}
                onDateTo={setDateTo}
                onClear={() => {
                  setPreset("All Time");
                  setDateFrom("");
                  setDateTo("");
                }}
              />
              <SortDropdown value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {/* Active chips */}
          {totalActive > 0 && (
            <div className="disc-active-chips">
              {activeCommunity !== "all" && (
                <span className="disc-active-chip">
                  {COMMUNITIES.find((c) => c.id === activeCommunity)?.label}
                  <button onClick={() => setActiveCommunity("all")}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </span>
              )}
              {types.map((v) => (
                <span key={v} className="disc-active-chip">
                  {v}
                  <button onClick={() => toggleType(v)}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </span>
              ))}
              {(preset !== "All Time" || dateFrom || dateTo) && (
                <span className="disc-active-chip">
                  {preset === "Custom Range" ? `${dateFrom || "?"} → ${dateTo || "?"}` : preset}
                  <button
                    onClick={() => {
                      setPreset("All Time");
                      setDateFrom("");
                      setDateTo("");
                    }}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </span>
              )}
              {search && (
                <span className="disc-active-chip">
                  Search: "{search}"
                  <button onClick={() => setSearch("")}>
                    <i className="fa-solid fa-xmark" />
                  </button>
                </span>
              )}
              <button className="disc-clear-all" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}

          <p className="disc-results-count">
            Showing {totalDisplayed} {totalDisplayed === 1 ? "publication" : "publications"}
            {filtered.length > DISPLAY_LIMIT ? ` of ${filtered.length}` : ""}
          </p>
        </div>

        {/* Feed Section Title */}
        <div className="disc-feed-divider-title">
          <i className="fa-solid fa-stream" /> Feed Timeline
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="disc-empty">
            <div className="disc-empty-icon">
              <i className="fa-regular fa-newspaper" />
            </div>
            <h3 className="disc-empty-title">No campus posts found</h3>
            <p className="disc-empty-sub">
              Try broadening your search query, community selection, or date filter.
            </p>
            <button className="disc-empty-btn" onClick={clearAll}>
              <i className="fa-solid fa-rotate-left" /> Reset All Filters
            </button>
          </div>
        )}

        {/* Pinned posts */}
        {pinnedDisplay.length > 0 && (
          <div className="disc-posts-list">
            {pinnedDisplay.map((p, i) => (
              <PostCard
                key={p.id}
                post={p}
                index={i}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onAddComment={handleAddComment}
                onOpenModal={openModal}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}

        {/* Feed posts */}
        {restDisplay.length > 0 && (
          <div className="disc-posts-list">
            {restDisplay.map((p, i) => (
              <PostCard
                key={p.id}
                post={p}
                index={pinnedDisplay.length + i}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onAddComment={handleAddComment}
                onOpenModal={openModal}
                onTagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <DiscoverSidebar
        handleTagClick={handleTagClick}
        setActiveCommunity={setActiveCommunity}
      />

      {/* ── CONSTANT SIZE EXPANDED POST MODAL ── */}
      {syncedModalPost && (
        <PostModal
          post={syncedModalPost}
          initialImageIndex={modalTarget?.index || 0}
          onClose={closeModal}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}

export default DiscoverPage;