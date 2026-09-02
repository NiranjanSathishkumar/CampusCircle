/**
 * DiscoverPage — CampusCircle's primary campus feed & community hub
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A · Gold #B45309
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (labels)
 * Dials: DESIGN_VARIANCE:6 / MOTION_INTENSITY:5 / VISUAL_DENSITY:6
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import {
  MagnifyingGlass,
  X,
  CaretLeft,
  CaretRight,
  Funnel,
  SortAscending,
  ArrowClockwise,
  SignIn,
  Calendar,
  CaretDown,
  CircleNotch,
  UsersThree,
} from '@phosphor-icons/react';
import ViewToggle from '@/shared/components/ViewToggle';
import { useViewMode } from '@/shared/hooks/useViewMode';
import { useViewTransition } from '@/shared/hooks/useViewTransition';
import { useAuth } from '@/shared/auth/useAuth';
import './discover.css';
import ImageLightbox from '@/features/discover/components/ImageLightbox';
import PostCard from '@/features/discover/components/PostCard';
import PostLedgerRow from '@/features/discover/components/PostLedgerRow';
import PostModal from '@/features/discover/components/PostModal';
import SkeletonCard from '@/features/discover/components/DiscoverSkeletonCard';
import ToastContainer from '@/features/discover/components/DiscoverToastContainer';
import { getDiscoverFeed, likePost, unlikePost } from '@/features/discover/feed.api';
import { CampusPulseWidget, FeaturedCommunities, PublishingNote, TrendingTopics } from '@/features/discover/components/DiscoverSidebar';
import { DATE_PRESETS, POST_TYPES, SORT_OPTIONS } from '@/features/discover/discoverConstants';
import { mapPost, passesDateFilter } from '@/features/discover/discoverUtils';

/* ─────────────────────────────────────────────────────────────
   MAIN DISCOVER PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */

const FEED_PAGE_SIZE = 12;
const ALL_COMMUNITIES_OPTION = { id: 'all', name: 'All', icon: '✦', color: '#991B1B' };

const headerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const headerItem = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function DiscoverPage() {

  const { postId: urlPostId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, initializing } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const reduceMotion = useReducedMotion();

  const searchInputRef = useRef(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [followedOnly, setFollowedOnly] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState('all');
  const [activeTypes, setActiveTypes] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [sortMode, setSortMode] = useState('latest');
  const [feedView, setFeedView] = useViewMode('cc_view_discover');
  const feedRef = useRef(null);
  const switchFeedView = useViewTransition(feedRef, feedView, '.discover-card, .cc-ledger-row');

  // Dropdowns
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [dateDropOpen, setDateDropOpen] = useState(false);
  const [sortDropOpen, setSortDropOpen] = useState(false);

  // Modal / Lightbox
  const [activePost, setActivePost] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const stripRef = useRef(null);

  // Toast Helper
  const addToast = useCallback((message) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  // Debounce the search box before it hits the server as a `search` param.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch page 1 whenever the student's server-side filters (tag / search /
  // followedOnly) change, or once auth finishes resolving. The feed route is
  // student-only, so a logged-out visitor never fetches. By default Discover
  // shows every active community's posts — followedOnly narrows that down,
  // it isn't a gate on the feed.
  useEffect(() => {
    if (initializing) return;
    if (!isLoggedIn) {
      setPosts([]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    getDiscoverFeed({ page: 1, limit: FEED_PAGE_SIZE, tag: activeTag, search: debouncedSearch, followedOnly })
      .then(({ posts: apiPosts, totalPages }) => {
        if (cancelled) return;
        setPosts(apiPosts.map(mapPost));
        setPage(1);
        setHasMore(1 < totalPages);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, initializing, activeTag, debouncedSearch, followedOnly]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    getDiscoverFeed({ page: nextPage, limit: FEED_PAGE_SIZE, tag: activeTag, search: debouncedSearch, followedOnly })
      .then(({ posts: apiPosts, totalPages }) => {
        setPosts(ps => [...ps, ...apiPosts.map(mapPost)]);
        setPage(nextPage);
        setHasMore(nextPage < totalPages);
      })
      .catch(() => addToast('Could not load more posts. Please try again.'))
      .finally(() => setLoadingMore(false));
  }, [page, hasMore, loadingMore, activeTag, debouncedSearch, followedOnly, addToast]);

  // Post opening via URL param
  useEffect(() => {
    if (urlPostId) {
      const found = posts.find(p => p.id === urlPostId);
      if (found) setActivePost(found);
    }
  }, [urlPostId, posts]);

  // Post Actions
  const handleLike = useCallback((id) => {
    const toggle = (p) => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p;
    const wasLiked = posts.find(p => p.id === id)?.liked;
    setPosts(ps => ps.map(toggle));
    setActivePost(ap => ap ? toggle(ap) : ap);

    const request = wasLiked ? unlikePost(id) : likePost(id);
    request.catch(() => {
      setPosts(ps => ps.map(toggle));
      setActivePost(ap => ap ? toggle(ap) : ap);
      addToast('Could not update like — please try again.');
    });
  }, [posts, addToast]);

  const handleShare = useCallback((id) => {
    const url = `${window.location.origin}/discover/posts/${id}`;
    navigator.clipboard.writeText(url).catch(() => { });
    addToast('Post link copied to clipboard');
  }, [addToast]);

  const handleCommentPosted = useCallback((postId) => {
    setPosts(ps => ps.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setActivePost(ap => ap?.id === postId ? { ...ap, comments: ap.comments + 1 } : ap);
    addToast('Comment published');
  }, [addToast]);

  const handleCloseModal = useCallback(() => {
    setActivePost(null);
    setShowLightbox(false);
    navigate('/discover');
  }, [navigate]);

  // Filtered & Sorted Posts (community/type/date/sort are applied client-side
  // over whatever pages have been loaded so far — only `tag`/`search` are
  // real server-side query params on the feed endpoint).
  const filteredPosts = posts.filter(post => {
    if (activeCommunity !== 'all' && post.communityId !== activeCommunity) return false;
    if (activeTypes.length > 0 && !activeTypes.includes(post.type)) return false;
    if (!passesDateFilter(post, dateFilter, customFrom, customTo)) return false;
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortMode === 'latest') return b.timestamp - a.timestamp;
    if (sortMode === 'liked') return b.likes - a.likes;
    if (sortMode === 'commented') return b.comments - a.comments;
    return 0;
  });

  const displayedPosts = sortedPosts;

  const activeFilterCount = [
    activeCommunity !== 'all' ? 1 : 0,
    activeTypes.length,
    dateFilter !== 'all' ? 1 : 0,
    activeTag ? 1 : 0,
    followedOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleTagClick = useCallback((tag) => setActiveTag(tag), []);
  const handleCommunityClick = useCallback((id) => setActiveCommunity(id), []);

  const clearAllFilters = () => {
    setSearch(''); setActiveTag(null); setFollowedOnly(false); setActiveCommunity('all'); setActiveTypes([]);
    setDateFilter('all'); setCustomFrom(''); setCustomTo(''); setSortMode('latest');
  };

  const scrollStrip = (dir) => {
    stripRef.current?.scrollBy({ left: dir * 180, behavior: 'smooth' });
  };

  const handleView = useCallback((post) => {
    setActivePost(post);
    navigate(`/discover/posts/${post.id}`);
  }, [navigate]);

  const pinnedPosts = displayedPosts.filter(p => p.pinned);
  const regularPosts = displayedPosts.filter(p => !p.pinned);

  // Communities / trending tags shown in the strip and sidebar are derived
  // from whatever posts have actually loaded — there's no standalone
  // "list all communities" or "trending tags" endpoint to source them from.
  const communityOptions = useMemo(() => {
    const map = new Map();
    posts.forEach(p => {
      if (!map.has(p.communityId)) {
        map.set(p.communityId, { id: p.communityId, name: p.communityName, icon: p.communityIcon, color: p.communityColor });
      }
    });
    return [ALL_COMMUNITIES_OPTION, ...Array.from(map.values())];
  }, [posts]);

  const featuredCommunities = useMemo(() => {
    const map = new Map();
    posts.forEach(p => {
      const existing = map.get(p.communityId);
      if (existing) existing.postCount += 1;
      else map.set(p.communityId, { id: p.communityId, name: p.communityName, icon: p.communityIcon, color: p.communityColor, postCount: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.postCount - a.postCount).slice(0, 5);
  }, [posts]);

  const trendingTags = useMemo(() => {
    const counts = new Map();
    posts.forEach(p => p.tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [posts]);

  const communityCount = communityOptions.length - 1;
  const todaysPostCount = posts.filter(p => p.timestamp.toDateString() === new Date().toDateString()).length;
  const postsThisWeek = posts.filter(p => passesDateFilter(p, 'week')).length;

  const role = initializing ? 'loading' : isLoggedIn ? 'student' : 'logged-out';

  return (
    <div className="discover-page pt-16">
      <Navbar />
      <ToastContainer toasts={toasts} />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {showLightbox && activePost && activePost.images.length > 0 && (
          <ImageLightbox
            images={activePost.images}
            startIndex={lightboxIndex}
            onClose={() => setShowLightbox(false)}
          />
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {activePost && !showLightbox && (
          <PostModal
            post={activePost}
            onClose={handleCloseModal}
            onLike={handleLike}
            onShare={handleShare}
            onCommentPosted={handleCommentPosted}
            onOpenLightbox={(i) => { setLightboxIndex(i); setShowLightbox(true); }}
          />
        )}
      </AnimatePresence>

      {/* ─── PAGE HEADER & HERO SEARCH ─────────────────────── */}
      <header className="ledger-header-bg page-hub-header" role="banner">
        <motion.div
          className="discover-container"
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          variants={headerStagger}
        >
          <div className="flex items-start justify-between gap-6 flex-wrap mb-5">
            <motion.div variants={headerItem} className="flex items-stretch gap-3.5 min-w-0">
              <div className="min-w-0">
                {/* Shared eyebrow pill — same as page-hub-eyebrow */}
                <p className="page-hub-eyebrow" aria-label="SIES GST Campus · Campus Life Stream">
                  <span className="page-hub-pulse-dot" aria-hidden="true" />
                  <span>SIES GST Campus · Campus Life Stream</span>
                </p>
                <h1 className="page-hub-title">
                  Discover Campus Life
                </h1>
                <p className="page-hub-desc">
                  Official stories, event notices, and achievements from every student organization.
                </p>
              </div>
            </motion.div>

            {/* Live Feed Stats */}
            <motion.div
              variants={headerItem}
              className="hidden md:flex items-center gap-5 flex-shrink-0 pt-1"
              role="group"
              aria-label="Feed activity"
            >
              <div className="text-right">
                <p className="font-mono font-bold text-[#0F172A] text-2xl leading-none tabular-nums">{communityCount}</p>
                <p className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase tracking-wider mt-1.5">Communities</p>
              </div>
              <div className="w-px self-stretch bg-[#D8D2C4]" aria-hidden="true" />
              <div className="text-right">
                <p className="font-mono font-bold text-[#0F172A] text-2xl leading-none tabular-nums">{todaysPostCount}</p>
                <p className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase tracking-wider mt-1.5">Posted Today</p>
              </div>
            </motion.div>
          </div>
          {/* Hero Search Bar */}
          <motion.div variants={headerItem} className="pt-5 border-t border-[#D8D2C4]/60">
            <div className="relative">
              <MagnifyingGlass size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              <input
                ref={searchInputRef}
                id="discover-search"
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search announcements, hackathons, or club updates... (Press '/' to focus)"
                aria-label="Search the campus feed"
                className="w-full pl-11 pr-12 py-3 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:bg-[#F5F2EA] transition-all shadow-inner"
              />
              {search ? (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A] transition-colors p-1 active:scale-90"
                >
                  <X size={14} />
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[0.5rem] text-[#9CA3AF] border border-[#D8D2C4] px-1.5 py-0.5 rounded-sm bg-[#F5F2EA] pointer-events-none hidden sm:inline">
                  /
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* ─── MAIN FEED CONTENT ────────────────────────────────────────── */}
      <div className="discover-container py-6 space-y-6">

        {/* Role Banners */}
        <AnimatePresence mode="wait">
          {role === 'logged-out' && (
            <motion.div
              key="guest"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="bg-[#0F172A] text-white rounded-sm p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap border border-[#0F172A] shadow-md"
            >
              <div className="flex items-center gap-3">
                <SignIn size={22} className="flex-shrink-0 text-[#F59E0B]" />
                <div>
                  <p className="font-display font-bold text-sm">Browsing in Guest Mode</p>
                  <p className="font-sans text-white/70 text-xs mt-0.5">Log in with your SIES GST account to see, like, save, comment on, and share campus stories.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-[#991B1B] text-white rounded-sm font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#7F1D1D] transition-colors active:scale-95 shadow-sm"
              >
                Sign In to Account
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── COMPACT FILTER BAR ──────────────────────────────── */}
        <div className="bg-[#F0EDE5] border border-[#D8D2C4] p-2.5 md:p-3 rounded-sm space-y-2 shadow-sm">

          {/* Community Horizontal Filter Strip */}
          <div className="community-strip-container">
            <button
              onClick={() => scrollStrip(-1)}
              aria-label="Scroll communities left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm flex items-center justify-center text-[#6B7280] hover:text-[#0F172A] shadow-sm transition-colors"
            >
              <CaretLeft size={13} />
            </button>

            <div className="community-strip-mask community-strip-mask-left" />

            <div ref={stripRef} className="community-strip-scroll" role="list" aria-label="Community Filters">
              {communityOptions.map(c => (
                <button
                  key={c.id}
                  role="listitem"
                  onClick={() => setActiveCommunity(c.id)}
                  aria-pressed={activeCommunity === c.id}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm border font-mono text-xs uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${activeCommunity === c.id ? 'text-white border-transparent shadow-sm font-bold' : 'bg-[#F0EDE5] border-[#D8D2C4] text-[#6B7280] hover:border-[#9CA3AF] hover:text-[#0F172A]'}`}
                  style={activeCommunity === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
                >
                  <span className="text-xs">{c.icon}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

            <div className="community-strip-mask community-strip-mask-right" />

            <button
              onClick={() => scrollStrip(1)}
              aria-label="Scroll communities right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm flex items-center justify-center text-[#6B7280] hover:text-[#0F172A] shadow-sm transition-colors"
            >
              <CaretRight size={13} />
            </button>
          </div>

          {/* Filter Controls Toolbar (Type, Date, Sort) */}
          <div className="pt-2 border-t border-[#D8D2C4]/70">
            <div className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Feed filter options">

              {/* Post Type Dropdown */}
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button
                  onClick={() => { setTypeDropOpen(o => !o); setDateDropOpen(false); setSortDropOpen(false); }}
                  aria-expanded={typeDropOpen}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-xs uppercase tracking-wider transition-all active:scale-95 ${activeTypes.length > 0 ? 'bg-[#991B1B] text-white border-[#991B1B] font-bold' : 'bg-[#F5F2EA] border-[#D8D2C4] text-[#4B5563] hover:text-[#0F172A] hover:border-[#9CA3AF]'}`}
                >
                  <Funnel size={13} />
                  Type{activeTypes.length > 0 && ` (${activeTypes.length})`}
                  <CaretDown size={11} />
                </button>
                <AnimatePresence>
                  {typeDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1.5 left-0 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm shadow-xl z-30 min-w-[180px] p-2"
                    >
                      {POST_TYPES.map(pt => (
                        <button
                          key={pt.id}
                          onClick={() => setActiveTypes(types => types.includes(pt.id) ? types.filter(x => x !== pt.id) : [...types, pt.id])}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-[#F0EDE5] transition-colors"
                        >
                          <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0 ${activeTypes.includes(pt.id) ? 'border-[#991B1B] bg-[#991B1B]' : 'border-[#D8D2C4]'}`}>
                            {activeTypes.includes(pt.id) && <span className="text-white text-[0.4rem] leading-none">✓</span>}
                          </div>
                          <pt.icon size={11} weight="fill" style={{ color: pt.color }} />
                          <span className="font-mono text-xs uppercase tracking-wider text-[#0F172A]">{pt.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Date Dropdown */}
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button
                  onClick={() => { setDateDropOpen(o => !o); setTypeDropOpen(false); setSortDropOpen(false); }}
                  aria-expanded={dateDropOpen}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-xs uppercase tracking-wider transition-all active:scale-95 ${dateFilter !== 'all' ? 'bg-[#1A3A2A] text-white border-[#1A3A2A] font-bold' : 'bg-[#F5F2EA] border-[#D8D2C4] text-[#4B5563] hover:text-[#0F172A] hover:border-[#9CA3AF]'}`}
                >
                  <Calendar size={13} />
                  {dateFilter === 'all' ? 'Date' : DATE_PRESETS.find(d => d.id === dateFilter)?.label}
                  <CaretDown size={11} />
                </button>
                <AnimatePresence>
                  {dateDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1.5 left-0 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm shadow-xl z-30 min-w-[200px] p-2"
                    >
                      {DATE_PRESETS.map(dp => (
                        <button
                          key={dp.id}
                          onClick={() => { setDateFilter(dp.id); if (dp.id !== 'custom') { setCustomFrom(''); setCustomTo(''); } }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-colors ${dateFilter === dp.id ? 'bg-[#1A3A2A] text-white font-bold' : 'text-[#6B7280] hover:bg-[#F0EDE5] hover:text-[#0F172A]'}`}
                        >
                          {dp.label}
                        </button>
                      ))}
                      {dateFilter === 'custom' && (
                        <div className="px-2.5 pt-2 pb-1 border-t border-[#D8D2C4] mt-1 space-y-2">
                          <div>
                            <label htmlFor="date-from" className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase tracking-wider block mb-0.5">From</label>
                            <input
                              id="date-from"
                              type="date"
                              value={customFrom}
                              onChange={e => setCustomFrom(e.target.value)}
                              className="w-full px-2 py-1 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm text-xs text-[#0F172A]"
                            />
                          </div>
                          <div>
                            <label htmlFor="date-to" className="font-mono text-[0.48rem] text-[#9CA3AF] uppercase tracking-wider block mb-0.5">To</label>
                            <input
                              id="date-to"
                              type="date"
                              value={customTo}
                              min={customFrom}
                              onChange={e => setCustomTo(e.target.value)}
                              className="w-full px-2 py-1 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm text-xs text-[#0F172A]"
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown */}
              <div className="relative" onMouseDown={e => e.stopPropagation()}>
                <button
                  onClick={() => { setSortDropOpen(o => !o); setTypeDropOpen(false); setDateDropOpen(false); }}
                  aria-expanded={sortDropOpen}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-[#D8D2C4] bg-[#F5F2EA] font-mono text-xs uppercase tracking-wider text-[#4B5563] hover:text-[#0F172A] hover:border-[#9CA3AF] transition-all active:scale-95"
                >
                  <SortAscending size={13} />
                  {SORT_OPTIONS.find(s => s.id === sortMode)?.label}
                  <CaretDown size={11} />
                </button>
                <AnimatePresence>
                  {sortDropOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full mt-1.5 left-0 bg-[#F5F2EA] border border-[#D8D2C4] rounded-sm shadow-xl z-30 min-w-[180px] p-2"
                    >
                      {SORT_OPTIONS.map(so => (
                        <button
                          key={so.id}
                          onClick={() => { setSortMode(so.id); setSortDropOpen(false); }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-sm font-mono text-xs uppercase tracking-wider transition-colors ${sortMode === so.id ? 'bg-[#0F172A] text-white font-bold' : 'text-[#6B7280] hover:bg-[#F0EDE5] hover:text-[#0F172A]'}`}
                        >
                          {so.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Following Only Toggle */}
              <button
                onClick={() => setFollowedOnly(v => !v)}
                aria-pressed={followedOnly}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border font-mono text-xs uppercase tracking-wider transition-all active:scale-95 ${followedOnly ? 'bg-[#1A3A2A] text-white border-[#1A3A2A] font-bold' : 'bg-[#F5F2EA] border-[#D8D2C4] text-[#4B5563] hover:text-[#0F172A] hover:border-[#9CA3AF]'}`}
              >
                <UsersThree size={13} weight={followedOnly ? 'fill' : 'regular'} />
                Following Only
              </button>

              {/* Result Counter Badge */}
              <span className="ml-auto font-mono text-[0.58rem] text-[#6B7280] uppercase tracking-wider font-bold" aria-live="polite">
                Showing {displayedPosts.length} of {posts.length} loaded posts
              </span>

              {/* Grid / List view toggle */}
              <ViewToggle view={feedView} onChange={(v) => switchFeedView(setFeedView, v)} gridLabel="Editorial" listLabel="Ledger" />
            </div>

            {/* Active Filter Chips Bar */}
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-[#D8D2C4]/70 overflow-hidden items-center"
                >
                  <span className="font-mono text-[0.5rem] text-[#9CA3AF] uppercase tracking-wider mr-1">Active Filters:</span>
                  {followedOnly && (
                    <span className="inline-flex items-center gap-1 bg-[#1A3A2A] text-white font-mono text-[0.55rem] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold">
                      Following Only
                      <button onClick={() => setFollowedOnly(false)} aria-label="Remove following-only filter" className="ml-0.5 hover:text-[#FEF2F2]"><X size={10} /></button>
                    </span>
                  )}
                  {activeTag && (
                    <span className="inline-flex items-center gap-1 bg-[#991B1B] text-white font-mono text-[0.55rem] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold">
                      #{activeTag}
                      <button onClick={() => setActiveTag(null)} aria-label="Remove tag filter" className="ml-0.5 hover:text-[#FEF2F2]"><X size={10} /></button>
                    </span>
                  )}
                  {activeCommunity !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-[#0F172A] text-white font-mono text-[0.55rem] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold">
                      {communityOptions.find(c => c.id === activeCommunity)?.name}
                      <button onClick={() => setActiveCommunity('all')} aria-label="Remove community filter" className="ml-0.5 hover:text-[#FEF2F2]"><X size={10} /></button>
                    </span>
                  )}
                  {activeTypes.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 bg-[#991B1B] text-white font-mono text-[0.55rem] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold">
                      {t}
                      <button onClick={() => setActiveTypes(types => types.filter(x => x !== t))} aria-label={`Remove ${t} filter`} className="ml-0.5 hover:text-[#FEF2F2]"><X size={10} /></button>
                    </span>
                  ))}
                  {dateFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-[#1A3A2A] text-white font-mono text-[0.55rem] uppercase tracking-wider px-2 py-0.5 rounded-sm font-bold">
                      {DATE_PRESETS.find(d => d.id === dateFilter)?.label}
                      <button onClick={() => { setDateFilter('all'); setCustomFrom(''); setCustomTo(''); }} aria-label="Remove date filter" className="ml-0.5 hover:text-[#FEF2F2]"><X size={10} /></button>
                    </span>
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-1 font-mono text-[0.55rem] text-[#6B7280] uppercase tracking-wider px-2 py-0.5 border border-[#D8D2C4] rounded-sm hover:text-[#991B1B] hover:border-[#991B1B] transition-colors ml-auto bg-[#F5F2EA]"
                  >
                    <X size={10} /> Clear All
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── GRID FOR FEED AND SIDEBAR ────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_310px] gap-6">

          {/* ─── MAIN FEED COLUMN ──────────────────────────────────────── */}
          <div className="min-w-0">

            {/* Feed Section Title */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#D8D2C4]" />
              <span className="font-mono font-bold text-[0.52rem] text-[#9CA3AF] uppercase tracking-widest flex-shrink-0">
                Timeline Stream
              </span>
              <div className="flex-1 h-px bg-[#D8D2C4]" />
            </div>

            {/* Skeleton Loading State */}
            {(loading || initializing) && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Error State */}
            {!loading && !initializing && error && (
              <div className="text-center py-16 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-6" role="alert">
                <Warning size={36} className="text-[#991B1B] mx-auto mb-3" />
                <p className="font-display font-bold text-[#0F172A] text-base mb-2">Could not load campus feed</p>
                <p className="font-sans text-[#6B7280] text-sm mb-4">Please check your network connection and retry.</p>
                <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-sm font-mono text-xs uppercase tracking-wider hover:bg-[#1E293B] transition-colors">
                  <ArrowClockwise size={14} /> Retry Loading
                </button>
              </div>
            )}

            <div ref={feedRef}>
            {/* Feed Items */}
            {!loading && !initializing && !error && feedView === 'list' && displayedPosts.length > 0 && (
              <main aria-label="Campus posts feed">
                <div className="cc-ledger" role="list" aria-label="Campus posts ledger">
                  <AnimatePresence>
                    {displayedPosts.map((post, idx) => (
                      <PostLedgerRow
                        key={post.id}
                        index={idx}
                        post={post}
                        onLike={handleLike}
                        onView={handleView}
                        onCommunityClick={handleCommunityClick}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </main>
            )}

            {/* Feed Items */}
            {!loading && !initializing && !error && feedView === 'grid' && (
              <main aria-label="Campus posts feed">
                {/* Pinned Posts */}
                {pinnedPosts.length > 0 && (
                  <section className="mb-5 space-y-4" aria-label="Pinned announcements">
                    <AnimatePresence>
                      {pinnedPosts.map(post => (
                        <PostCard
                          key={post.id} post={post}
                          onLike={handleLike} onShare={handleShare}
                          onView={handleView} onTagClick={handleTagClick} onCommunityClick={handleCommunityClick}
                          onCommentPosted={handleCommentPosted}
                        />
                      ))}
                    </AnimatePresence>
                  </section>
                )}

                {/* Regular Posts */}
                {regularPosts.length > 0 && (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {regularPosts.map(post => (
                        <PostCard
                          key={post.id} post={post}
                          onLike={handleLike} onShare={handleShare}
                          onView={handleView} onTagClick={handleTagClick} onCommunityClick={handleCommunityClick}
                          onCommentPosted={handleCommentPosted}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </main>
            )}
            </div>

            {/* Load More */}
            {!loading && !initializing && !error && hasMore && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F0EDE5] border border-[#D8D2C4] text-[#0F172A] rounded-sm font-mono text-xs uppercase tracking-wider hover:border-[#991B1B] hover:text-[#991B1B] transition-colors disabled:opacity-50"
                >
                  {loadingMore ? <CircleNotch size={14} className="animate-spin" /> : null}
                  {loadingMore ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}

            {/* Empty States */}
            {!loading && !initializing && !error && role === 'logged-out' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-6"
              >
                <SignIn size={36} className="text-[#9CA3AF] mx-auto mb-3" />
                <p className="font-display font-bold text-[#0F172A] text-base mb-1">Sign in to see your campus feed</p>
                <p className="font-sans text-[#6B7280] text-xs">Log in to browse campus posts, like, comment, and follow communities.</p>
              </motion.div>
            )}

            {!loading && !initializing && !error && role !== 'logged-out' && posts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-6"
              >
                <MagnifyingGlass size={36} className="text-[#9CA3AF] mx-auto mb-3" />
                <p className="font-display font-bold text-[#0F172A] text-base mb-1">
                  {followedOnly ? 'No posts from communities you follow' : 'No posts yet'}
                </p>
                <p className="font-sans text-[#6B7280] text-xs mb-4">
                  {followedOnly
                    ? 'Follow more communities, or turn off "Following Only" to see every campus post.'
                    : 'Nothing has been posted to Discover yet — check back soon.'}
                </p>
                {followedOnly && (
                  <button
                    onClick={() => setFollowedOnly(false)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-sm font-mono text-xs uppercase tracking-wider hover:bg-[#1E293B] transition-colors active:scale-95"
                  >
                    Show All Posts
                  </button>
                )}
              </motion.div>
            )}

            {!loading && !initializing && !error && role !== 'logged-out' && posts.length > 0 && filteredPosts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-6"
              >
                <MagnifyingGlass size={36} className="text-[#9CA3AF] mx-auto mb-3" />
                <p className="font-display font-bold text-[#0F172A] text-base mb-1">No posts match your filters</p>
                <p className="font-sans text-[#6B7280] text-xs mb-4">Try clearing your active filters or searching for broader terms.</p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-sm font-mono text-xs uppercase tracking-wider hover:bg-[#1E293B] transition-colors active:scale-95"
                >
                  Reset All Filters
                </button>
              </motion.div>
            )}
          </div>

          {/* ─── SIDEBAR COLUMN (Desktop) ───────────────────────────────── */}
          <aside className="space-y-5 hidden xl:block" aria-label="Sidebar Widgets">
            <CampusPulseWidget communityCount={communityCount} postsThisWeek={postsThisWeek} />
            {trendingTags.length > 0 && <TrendingTopics tags={trendingTags} onTagClick={handleTagClick} />}
            {featuredCommunities.length > 0 && <FeaturedCommunities communities={featuredCommunities} onCommunityClick={handleCommunityClick} />}
            <PublishingNote />
          </aside>

        </div>
      </div>
      <Footer compact />
    </div>
  );
}
