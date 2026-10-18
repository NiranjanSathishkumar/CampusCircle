/**
 * CommunitiesPage.jsx — CampusCircle Student Communities Discovery Hub
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A · Gold #B45309
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (labels)
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import CommunityDetailPanel from '@/features/communities/components/CommunityDetailPanel';
import {
  MagnifyingGlass,
  X,
  ShieldCheck,
  UsersThree,
  Calendar,
  Eye,
  ArrowRight,
  CheckCircle,
  Check,
  Warning,
  ArrowsClockwise,
  Buildings,
  ChatCircleText,
  ArrowSquareOut,
  Flame,
  Code,
  Robot,
  PaintBrush,
  MusicNote,
  Trophy,
  BookOpen,
  Sparkle,
  SortAscending,
  Briefcase,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import PageHubHeader from '@/shared/components/PageHubHeader';
import ViewToggle from '@/shared/components/ViewToggle';
import { useViewMode } from '@/shared/hooks/useViewMode';
import { useViewTransition } from '@/shared/hooks/useViewTransition';
import { COMMUNITY_CATEGORIES, CATEGORY_ICONS } from '@/features/communities/communitiesConstants';
import './communities.css';
import CommunityCard from '@/features/communities/components/CommunityCard';
import CommunityLedgerRow from '@/features/communities/components/CommunityLedgerRow';
import QuickPreviewModal from '@/features/communities/components/CommunityQuickPreviewModal';
import SkeletonCard from '@/features/communities/components/CommunitiesSkeletonCard';
import { ToastContainer, useToasts } from '@/features/communities/components/CommunitiesToasts';
import { sortCommunities } from '@/features/communities/communitiesSort';
import { fetchCommunities, fetchCommunityById, followCommunity, unfollowCommunity, fetchMyFollowedCommunityIds } from '@/features/communities/communities.api';
import { mapCommunities, mapCommunity } from '@/features/communities/communitiesAdapter';
import { ApiError } from '@/shared/api/httpClient';

/* ─────────────────────────────────────────────────────────────
   TOAST SYSTEM
   ───────────────────────────────────────────────────────────── */
let _toastId = 0;
/* ─────────────────────────────────────────────────────────────
   MAIN COMMUNITIES PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function CommunitiesPage({ onNavigateToLogin }) {
  const { communityId: urlCommunityId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, initializing } = useAuth();
  const searchInputRef = useRef(null);

  /* ── View State ── */
  const [view, setView] = useState('list');
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  /* ── Data ── */
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  /* ── Follow State (server-backed - localStorage isn't a source of truth
     once real accounts and API calls are in play) ── */
  const [followedIds, setFollowedIds] = useState(() => new Set());

  /* ── Discovery Filters State ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [onlyRecruiting, setOnlyRecruiting] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [catalogView, setCatalogView] = useViewMode('cc_view_communities');
  const catalogRef = useRef(null);
  const switchCatalogView = useViewTransition(catalogRef, catalogView, '.comm-card, .cc-ledger-row');

  /* ── Quick Preview Modal State ── */
  const [modalClub, setModalClub] = useState(null);

  /* ── Toast System ── */
  const { toasts, addToast } = useToasts();

  /* ── Load Communities + (if logged in) the student's own follow set.
       Waits for AuthContext's silent-refresh-on-mount: /communities requires
       a session (communities.routes.js), so firing before it resolved
       guaranteed a 401-then-retry on every full page load. ── */
  useEffect(() => {
    if (initializing) return;
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    (async () => {
      try {
        const [{ communities: raw }, followed] = await Promise.all([
          fetchCommunities(),
          isLoggedIn ? fetchMyFollowedCommunityIds().catch(() => []) : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setCommunities(mapCommunities(raw));
        setFollowedIds(new Set(followed));
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError && err.status === 401
            ? 'Log in to browse campus communities.'
            : err instanceof ApiError
              ? err.message
              : 'Could not load communities. Please try again.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, initializing]);

  /* ── Keyboard shortcut '/' to focus search ── */
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

  /* ── Handle Route Parameter Changes ── */
  useEffect(() => {
    if (urlCommunityId) {
      setSelectedCommunityId(urlCommunityId);
      setView('detail');

      // If the community isn't in the loaded directory, fetch it directly
      const exists = communities.some(c => c.id === urlCommunityId);
      if (!exists && !loading) {
        let active = true;
        fetchCommunityById(urlCommunityId)
          .then(({ community: raw }) => {
            if (active && raw) {
              setCommunities(prev => {
                const mapped = mapCommunity(raw);
                return prev.some(c => c.id === mapped.id) ? prev : [...prev, mapped];
              });
            }
          })
          .catch(() => {
            // Error will be caught by detail view not found
          });
        return () => { active = false; };
      }
    } else {
      setView('list');
      setSelectedCommunityId(null);
    }
  }, [urlCommunityId, communities, loading]);

  /* ── Filtered + Sorted Communities ── */
  const filteredCommunities = useMemo(() => {
    let list = communities.filter(c => {
      if (activeCategory !== 'all' && c.category !== activeCategory) return false;
      if (onlyRecruiting && !c.recruiting) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.tagline?.toLowerCase().includes(q) ||
          c.categoryLabel?.toLowerCase().includes(q) ||
          c.about?.toLowerCase().includes(q) ||
          c.recruitingRole?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
    return sortCommunities(list, sortBy);
  }, [communities, activeCategory, onlyRecruiting, searchQuery, sortBy]);

  /* ── Stats computation ── */
  const totalMembers = useMemo(() => communities.reduce((acc, c) => acc + c.members, 0), [communities]);
  const recruitingCount = useMemo(() => communities.filter(c => c.recruiting).length, [communities]);

  /* ── Handlers ── */
  const handleToggleFollow = useCallback(async (communityId) => {
    const target = communities.find(c => c.id === communityId);
    const name = target ? target.name : 'Community';
    const wasFollowing = followedIds.has(communityId);

    // Optimistic update, rolled back below if the request fails - follow
    // state now lives on the server (Follow model), not localStorage.
    setFollowedIds(prev => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(communityId); else next.add(communityId);
      return next;
    });
    setCommunities(prev =>
      prev.map(c =>
        c.id === communityId
          ? { ...c, members: Math.max(0, (c.members ?? 0) + (wasFollowing ? -1 : 1)) }
          : c
      )
    );

    try {
      if (wasFollowing) {
        await unfollowCommunity(communityId);
        addToast(`Unfollowed ${name}`);
      } else {
        await followCommunity(communityId);
        addToast(`Joined & followed ${name}!`);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.message?.includes('Already following')) {
        setFollowedIds(prev => new Set(prev).add(communityId));
        setCommunities(prev =>
          prev.map(c => c.id === communityId ? { ...c, isFollowed: true } : c)
        );
        addToast(`Joined & followed ${name}!`);
        return;
      }

      if (err instanceof ApiError && err.status === 404 && err.message?.toLowerCase().includes('not following')) {
        setFollowedIds(prev => {
          const next = new Set(prev);
          next.delete(communityId);
          return next;
        });
        setCommunities(prev =>
          prev.map(c => c.id === communityId ? { ...c, isFollowed: false } : c)
        );
        addToast(`Unfollowed ${name}`);
        return;
      }

      setFollowedIds(prev => {
        const next = new Set(prev);
        if (wasFollowing) next.add(communityId); else next.delete(communityId);
        return next;
      });
      setCommunities(prev =>
        prev.map(c =>
          c.id === communityId
            ? { ...c, members: Math.max(0, (c.members ?? 0) + (wasFollowing ? 1 : -1)) }
            : c
        )
      );
      addToast(err instanceof ApiError ? err.message : `Could not update follow status for ${name}.`);
    }
  }, [communities, followedIds, addToast]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveCategory('all');
    setOnlyRecruiting(false);
    setSortBy('popular');
  }, []);

  const handleExplore = useCallback((communityId) => {
    navigate(`/communities/detail/${communityId}`);
  }, [navigate]);

  const handleBackToList = useCallback(() => {
    navigate('/communities');
  }, [navigate]);

  /* Selected community object */
  const selectedCommunity = useMemo(
    () => communities.find(c => c.id === selectedCommunityId) || null,
    [communities, selectedCommunityId]
  );

  /* ─────────────────────────────────────────────────────────────
     DETAIL VIEW ROUTE
     ───────────────────────────────────────────────────────────── */
  if (view === 'detail') {
    if (!selectedCommunity && !loading) {
      return (
        <div className="communities-page">
          <Navbar />
          <div className="pt-20">
            <div className="communities-inner">
              <div className="text-center py-16 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-6" role="alert">
                <Warning size={36} className="text-[#991B1B] mx-auto mb-3" />
                <h2 className="font-display font-bold text-[#0F172A] text-xl mb-2">
                  {loadError ? 'Could Not Load Community' : 'Community Not Found'}
                </h2>
                <p className="font-sans text-[#6B7280] text-sm mb-4">
                  {loadError || 'The club or community you are looking for does not exist or has been removed.'}
                </p>
                <button className="px-4 py-2 bg-[#0F172A] text-white rounded-sm font-mono text-xs uppercase tracking-wider" onClick={handleBackToList}>
                  Back to Communities
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!selectedCommunity) {
      // Still loading the directory - avoids a "not found" flash before the
      // fetch in the effect above resolves.
      return (
        <div className="communities-page">
          <Navbar />
          <div className="pt-20"><div className="communities-inner"><SkeletonCard /></div></div>
        </div>
      );
    }

    return (
      <div className="communities-page">
        <Navbar />
        <CommunityDetailPanel
          community={selectedCommunity}
          isFollowed={followedIds.has(selectedCommunity.id)}
          onToggleFollow={handleToggleFollow}
          onBack={handleBackToList}
          onShowToast={addToast}
          isLoggedIn={isLoggedIn}
          onNavigateToLogin={onNavigateToLogin}
        />
        <Footer />
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     DIRECTORY / HUB DISCOVERY VIEW
     ───────────────────────────────────────────────────────────── */
  return (
    <div className="communities-page">
      <Navbar />

      <div className="pt-16">
        <div className="communities-inner">

          {/* ── Page Header ── */}
          <PageHubHeader
            eyebrow="SIES GST Campus · Organizations Registry"
            title={`Campus Clubs & Guilds`}
            description="Official student organizations, tech guilds, creative forums, and competitive campus chapters — verified and managed through SIES GST Student Council."
            rightSlot={
              <div className="page-hub-stats-pill">
                <span>{communities.length} Active Clubs</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{totalMembers.toLocaleString('en-IN')} Members</span>
                {recruitingCount > 0 && (
                  <>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span style={{ color: '#991B1B' }}>{recruitingCount} Recruiting</span>
                  </>
                )}
              </div>
            }
          />

          {/* ── Category Rail — Phosphor icons, not emoji ── */}
          <nav className="comm-category-rail-wrap" aria-label="Filter by community category">
            <div className="comm-category-rail" role="tablist">
              {COMMUNITY_CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const CatIcon = CATEGORY_ICONS[cat.id] || Buildings;
                return (
                  <button
                    key={cat.id}
                    className={`comm-cat-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                    role="tab"
                    aria-selected={isActive}
                  >
                    <CatIcon size={14} weight={isActive ? 'fill' : 'regular'} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* ── Toolbar: Search + Recruitment Toggle + Sort + Count ── */}
          <div className="comm-toolbar">
            {/* Real-time Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
              <input
                ref={searchInputRef}
                id="communities-search"
                type="search"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm text-sm text-[#0F172A] placeholder-[#9CA3AF] focus:outline-none focus:border-[#991B1B] focus:bg-[#F5F2EA] transition-all"
                placeholder="Search clubs, roles, or keywords... (Press '/')"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                aria-label="Search communities"
              />
              {searchQuery ? (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0F172A] p-1 transition-colors" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={13} />
                </button>
              ) : (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[0.48rem] text-[#9CA3AF] border border-[#D8D2C4] px-1.5 py-0.5 rounded-sm bg-[#F5F2EA] pointer-events-none hidden sm:inline">/</span>
              )}
            </div>

            {/* Recruiting Now Toggle */}
            <button
              id="comm-recruiting-toggle"
              onClick={() => setOnlyRecruiting(r => !r)}
              className={`comm-recruiting-toggle ${onlyRecruiting ? 'active' : ''}`}
              title="Show only communities currently recruiting"
              aria-pressed={onlyRecruiting}
            >
              <Flame size={13} className={onlyRecruiting ? 'text-[#991B1B]' : 'text-[#9CA3AF]'} weight={onlyRecruiting ? 'fill' : 'regular'} />
              <span className="comm-switch-label">Recruiting</span>
            </button>

            {/* Sort — custom button group, replaces browser select */}
            <div className="comm-sort-group" role="group" aria-label="Sort communities">
              {[
                { id: 'popular', label: 'Popular' },
                { id: 'name', label: 'A–Z' },
                { id: 'events', label: 'Events' },
              ].map(opt => (
                <button
                  key={opt.id}
                  className={`comm-sort-btn ${sortBy === opt.id ? 'active' : ''}`}
                  onClick={() => setSortBy(opt.id)}
                  aria-pressed={sortBy === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Matching Count */}
            <span className="font-mono text-[0.55rem] text-[#9CA3AF] uppercase tracking-wider font-bold ml-auto" role="status" aria-live="polite">
              {loading ? '—' : `${filteredCommunities.length} club${filteredCommunities.length !== 1 ? 's' : ''}`}
            </span>

            {/* Grid / List view toggle */}
            <ViewToggle view={catalogView} onChange={(v) => switchCatalogView(setCatalogView, v)} />
          </div>

          {/* ── Directory Catalog Grid ── */}
          <div ref={catalogRef}>
          {loading ? (
            <div className="comm-catalog" aria-busy="true" aria-label="Loading communities">
              {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : loadError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="comm-empty-box"
              role="alert"
            >
              <Warning size={32} className="text-[#991B1B] mx-auto mb-3" />
              <h3 className="font-display font-bold text-[#0F172A] text-base mb-1">Could Not Load Communities</h3>
              <p className="font-sans text-xs text-[#6B7280] mb-4">{loadError}</p>
              {!isLoggedIn && (
                <button
                  className="px-4 py-2 bg-[#0F172A] text-white rounded-sm font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#1E293B] transition-colors"
                  onClick={() => onNavigateToLogin?.()}
                >
                  Log In
                </button>
              )}
            </motion.div>
          ) : filteredCommunities.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="comm-empty-box"
              role="status"
            >
              <MagnifyingGlass size={32} className="text-[#9CA3AF] mx-auto mb-3" />
              <h3 className="font-display font-bold text-[#0F172A] text-base mb-1">No communities found</h3>
              <p className="font-sans text-xs text-[#6B7280] mb-4">
                Try broadening your search or toggling off the recruitment filter.
              </p>
              <button
                className="px-4 py-2 bg-[#0F172A] text-white rounded-sm font-mono text-xs uppercase tracking-wider inline-flex items-center gap-1.5 hover:bg-[#1E293B] transition-colors"
                onClick={handleResetFilters}
              >
                <ArrowsClockwise size={13} /> Reset Filters
              </button>
            </motion.div>
          ) : catalogView === 'list' ? (
            <div className="cc-ledger" role="list" aria-label="Campus communities directory">
              <AnimatePresence mode="popLayout">
                {filteredCommunities.map((community, idx) => (
                  <CommunityLedgerRow
                    key={community.id}
                    index={idx}
                    community={community}
                    isFollowed={followedIds.has(community.id)}
                    onToggleFollow={handleToggleFollow}
                    onExplore={handleExplore}
                    onPreview={setModalClub}
                    isLoggedIn={isLoggedIn}
                    onNavigateToLogin={onNavigateToLogin}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="comm-catalog" role="list" aria-label="Campus communities directory">
              <AnimatePresence mode="popLayout">
                {filteredCommunities.map((community, idx) => (
                  <motion.div
                    key={community.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.26, delay: Math.min(idx * 0.04, 0.28), ease: [0.16, 1, 0.3, 1] }}
                    role="listitem"
                  >
                    <CommunityCard
                      community={community}
                      isFollowed={followedIds.has(community.id)}
                      onToggleFollow={handleToggleFollow}
                      onExplore={handleExplore}
                      onPreview={setModalClub}
                      isLoggedIn={isLoggedIn}
                      onNavigateToLogin={onNavigateToLogin}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
          </div>

        </div>
      </div>

      {/* ── Quick Preview Modal ── */}
      <AnimatePresence>
        {modalClub && (
          <QuickPreviewModal
            community={modalClub}
            isFollowed={followedIds.has(modalClub.id)}
            onToggleFollow={handleToggleFollow}
            onClose={() => setModalClub(null)}
            onExplore={handleExplore}
            isLoggedIn={isLoggedIn}
            onNavigateToLogin={onNavigateToLogin}
            onShowToast={addToast}
          />
        )}
      </AnimatePresence>

      {/* ── Toast Container ── */}
      <ToastContainer toasts={toasts} />
      <Footer compact />
    </div>
  );
}
