/**
 * BuddiesPage.jsx — CampusCircle Student Discovery & Networking Directory
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (labels)
 * Dials: DESIGN_VARIANCE:6 / MOTION_INTENSITY:5 / VISUAL_DENSITY:6
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import BuddyDetailPanel from '@/features/buddies/components/BuddyDetailPanel';
import {
  MagnifyingGlass,
  X,
  ShieldCheck,
  Users,
  UserPlus,
  CheckCircle,
  Check,
  Warning,
  ArrowsClockwise,
  User,
  CaretLeft,
  CaretRight,
  GraduationCap,
  Sparkle,
  ArrowRight,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import PageHubHeader from '@/shared/components/PageHubHeader';
import ViewToggle from '@/shared/components/ViewToggle';
import { useViewMode } from '@/shared/hooks/useViewMode';
import { useViewTransition } from '@/shared/hooks/useViewTransition';
import {
  BRANCH_OPTIONS,
  YEAR_OPTIONS,
  SKILL_OPTIONS,
} from '@/features/buddies/buddiesConstants';
import {
  fetchBuddies,
  fetchBuddyById,
  fetchMyFollowedBuddyIds,
  followBuddy,
  unfollowBuddy,
} from '@/features/buddies/buddies.api';
import { mapBuddy, mapBuddies } from '@/features/buddies/buddiesAdapter';
import { ApiError } from '@/shared/api/httpClient';
import './buddies.css';
import BuddyLedgerRow from '@/features/buddies/components/BuddyLedgerRow';
import SkeletonCard from '@/features/buddies/components/BuddiesSkeletonCard';
import StudentCard from '@/features/buddies/components/StudentCard';
import { ToastContainer, useToasts } from '@/features/buddies/components/BuddiesToasts';

const CARDS_PER_PAGE = 30;

/* ─────────────────────────────────────────────────────────────
   MAIN BUDDIES PAGE
   ───────────────────────────────────────────────────────────── */
export default function BuddiesPage({ onNavigateToLogin }) {
  const { buddyId: urlBuddyId } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, initializing } = useAuth();

  /* ── View state ── */
  const [view, setView] = useState(urlBuddyId ? 'detail' : 'list'); // 'list' | 'detail'
  const [selectedBuddyId, setSelectedBuddyId] = useState(urlBuddyId || null);

  /* ── Directory Data ── */
  const [buddies, setBuddies] = useState([]);
  const [totalBuddies, setTotalBuddies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  /* ── Detail View Data ── */
  const [detailBuddy, setDetailBuddy] = useState(null);
  const [detailLoading, setDetailLoading] = useState(Boolean(urlBuddyId));
  const [detailError, setDetailError] = useState('');

  /* ── Real-time Follow State (Server-backed) ── */
  const [followedIds, setFollowedIds] = useState(() => new Set());

  /* ── Filters state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [catalogView, setCatalogView] = useViewMode('cc_view_buddies');
  const catalogRef = useRef(null);
  const switchCatalogView = useViewTransition(catalogRef, catalogView, '.buddy-card, .cc-ledger-row');

  /* ── Toast system ── */
  const { toasts, addToast } = useToasts();
  const catalogTopRef = useRef(null);

  /* ── Reset pagination to Page 1 when filters or search change ── */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedYear, selectedSkill]);

  /* ── Load Directory Students + Followed Set from Backend. Waits for
       AuthContext's silent-refresh-on-mount: /students/buddies requires a
       session, so firing before it resolved guaranteed a 401-then-retry on
       every full page load. ── */
  useEffect(() => {
    if (initializing) return;
    let cancelled = false;
    setLoading(true);
    setLoadError('');

    (async () => {
      try {
        const [buddiesRes, followed] = await Promise.all([
          fetchBuddies({
            search: searchQuery,
            branch: selectedBranch,
            year: selectedYear,
            skill: selectedSkill,
            page: currentPage,
            limit: CARDS_PER_PAGE,
          }),
          isLoggedIn ? fetchMyFollowedBuddyIds().catch(() => []) : Promise.resolve([]),
        ]);

        if (cancelled) return;
        const rawList = buddiesRes?.buddies || buddiesRes?.students || [];
        setBuddies(mapBuddies(rawList));
        setTotalBuddies(buddiesRes?.total ?? rawList.length);
        setTotalPages(
          buddiesRes?.totalPages ?? Math.max(1, Math.ceil((buddiesRes?.total ?? rawList.length) / CARDS_PER_PAGE))
        );

        if (isLoggedIn) {
          const initialFollowedIds = new Set([
            ...followed,
            ...rawList.filter((b) => b.isFollowedByMe).map((b) => String(b._id || b.id)),
          ]);
          setFollowedIds(initialFollowedIds);
        }
      } catch (err) {
        if (cancelled) return;
        setLoadError(
          err instanceof ApiError && err.status === 401
            ? 'Log in to explore verified campus buddies and peers.'
            : err instanceof ApiError
              ? err.message
              : 'Could not load campus buddies. Please try again.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchQuery, selectedBranch, selectedYear, selectedSkill, currentPage, isLoggedIn, initializing]);

  /* ── Handle Route Parameter Changes (Detail View) ── */
  useEffect(() => {
    if (!urlBuddyId) {
      setView('list');
      setSelectedBuddyId(null);
      setDetailBuddy(null);
      setDetailError('');
      return;
    }

    setView('detail');
    setSelectedBuddyId(urlBuddyId);
    let cancelled = false;
    setDetailLoading(true);
    setDetailError('');

    (async () => {
      try {
        const res = await fetchBuddyById(urlBuddyId);
        if (cancelled) return;
        const rawStudent = res?.student || res?.user || res;
        const mapped = mapBuddy({
          ...rawStudent,
          achievements: res?.achievements || rawStudent.achievements,
          communities: res?.communities || rawStudent.communities,
        });
        setDetailBuddy(mapped);
      } catch (err) {
        if (cancelled) return;
        setDetailError(
          err instanceof ApiError && err.status === 404
            ? 'This student profile does not exist or may have been removed.'
            : err instanceof ApiError
              ? err.message
              : 'Could not load student profile.'
        );
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [urlBuddyId]);

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedBranch !== 'All Branches' ||
    selectedYear !== 'All Years' ||
    selectedSkill !== 'All';

  /* ── Handlers ── */
  const handleToggleFollow = useCallback(
    async (buddyId) => {
      if (!isLoggedIn) {
        onNavigateToLogin?.();
        return;
      }

      const normalizedId = String(buddyId);
      const target =
        buddies.find((b) => b.id === normalizedId || b._id === normalizedId) ||
        (detailBuddy && (detailBuddy.id === normalizedId || detailBuddy._id === normalizedId) ? detailBuddy : null);
      const name = target ? target.name : 'Student';
      const wasFollowing = followedIds.has(normalizedId);

      // Optimistic update
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (wasFollowing) next.delete(normalizedId);
        else next.add(normalizedId);
        return next;
      });
      setBuddies((prev) =>
        prev.map((b) =>
          b.id === normalizedId || b._id === normalizedId
            ? { ...b, followersCount: Math.max(0, (b.followersCount ?? 0) + (wasFollowing ? -1 : 1)), isFollowed: !wasFollowing }
            : b
        )
      );
      setDetailBuddy((prev) =>
        prev && (prev.id === normalizedId || prev._id === normalizedId)
          ? { ...prev, followersCount: Math.max(0, (prev.followersCount ?? 0) + (wasFollowing ? -1 : 1)), isFollowed: !wasFollowing }
          : prev
      );

      try {
        if (wasFollowing) {
          await unfollowBuddy(normalizedId);
          addToast(`Unfollowed ${name}`);
        } else {
          await followBuddy(normalizedId);
          addToast(`Now following ${name}! 🤝`);
        }
      } catch (err) {
        // If server reports "Already following", our optimistic state (followed) is correct
        if (err instanceof ApiError && err.status === 400 && err.message?.includes('Already following')) {
          setFollowedIds((prev) => new Set(prev).add(normalizedId));
          setBuddies((prev) =>
            prev.map((b) =>
              b.id === normalizedId || b._id === normalizedId ? { ...b, isFollowed: true } : b
            )
          );
          setDetailBuddy((prev) =>
            prev && (prev.id === normalizedId || prev._id === normalizedId)
              ? { ...prev, isFollowed: true }
              : prev
          );
          addToast(`Now following ${name}! 🤝`);
          return;
        }

        // If server reports "not following", our optimistic state (unfollowed) is correct
        if (err instanceof ApiError && err.status === 404 && err.message?.toLowerCase().includes('not following')) {
          setFollowedIds((prev) => {
            const next = new Set(prev);
            next.delete(normalizedId);
            return next;
          });
          setBuddies((prev) =>
            prev.map((b) =>
              b.id === normalizedId || b._id === normalizedId ? { ...b, isFollowed: false } : b
            )
          );
          setDetailBuddy((prev) =>
            prev && (prev.id === normalizedId || prev._id === normalizedId)
              ? { ...prev, isFollowed: false }
              : prev
          );
          addToast(`Unfollowed ${name}`);
          return;
        }

        // True error -> Rollback optimistic update
        setFollowedIds((prev) => {
          const next = new Set(prev);
          if (wasFollowing) next.add(normalizedId);
          else next.delete(normalizedId);
          return next;
        });
        setBuddies((prev) =>
          prev.map((b) =>
            b.id === normalizedId || b._id === normalizedId
              ? { ...b, followersCount: Math.max(0, (b.followersCount ?? 0) + (wasFollowing ? 1 : -1)), isFollowed: wasFollowing }
              : b
          )
        );
        setDetailBuddy((prev) =>
          prev && (prev.id === normalizedId || prev._id === normalizedId)
            ? { ...prev, followersCount: Math.max(0, (prev.followersCount ?? 0) + (wasFollowing ? 1 : -1)), isFollowed: wasFollowing }
            : prev
        );
        addToast(err instanceof ApiError ? err.message : `Could not update follow status for ${name}.`);
      }
    },
    [isLoggedIn, buddies, detailBuddy, followedIds, addToast, onNavigateToLogin]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedBranch('All Branches');
    setSelectedYear('All Years');
    setSelectedSkill('All');
    setCurrentPage(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      catalogTopRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewProfile = useCallback(
    (buddyId) => {
      navigate(`/buddies/detail/${buddyId}`);
    },
    [navigate]
  );

  const handleBackToList = useCallback(() => {
    navigate('/buddies');
  }, [navigate]);

  /* ─────────────────────────────────────────────────────────────
     DETAIL VIEW ROUTE
     ───────────────────────────────────────────────────────────── */
  if (view === 'detail') {
    if (detailLoading) {
      return (
        <>
          <Navbar />
          <div style={{ paddingTop: 64 }}>
            <div className="buddies-inner">
              <SkeletonCard />
            </div>
          </div>
        </>
      );
    }

    if (!detailBuddy || detailError) {
      return (
        <>
          <Navbar />
          <div style={{ paddingTop: 64 }}>
            <div className="buddies-inner">
              <div className="events-error-state" role="alert">
                <div className="events-empty-icon" aria-hidden="true">
                  <Warning size={26} />
                </div>
                <h2 className="events-error-title">{detailError ? 'Could Not Load Profile' : 'Student Not Found'}</h2>
                <p className="events-error-desc">
                  {detailError || 'This profile does not exist or may have been removed.'}
                </p>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem' }}
                  onClick={handleBackToList}
                >
                  Back to Buddies Directory
                </button>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <Navbar />
        <div style={{ paddingTop: 64 }}>
          <BuddyDetailPanel
            buddy={detailBuddy}
            isFollowed={followedIds.has(detailBuddy.id)}
            onToggleFollow={handleToggleFollow}
            onBack={handleBackToList}
            onShowToast={addToast}
            isLoggedIn={isLoggedIn}
            onNavigateToLogin={onNavigateToLogin}
          />
        </div>
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     DIRECTORY DISCOVERY VIEW
     ───────────────────────────────────────────────────────────── */
  return (
    <>
      <Navbar />

      <div className="buddies-page" style={{ paddingTop: 64 }}>
        <div className="buddies-inner" ref={catalogTopRef}>

          {/* ── Page Header ── */}
          <PageHubHeader
            eyebrow="SIES GST Campus · Peer Directory"
            title="Connect with Campus Buddies"
            description="Discover peers, hackathon teammates, study partners, project collaborators, and mentors across all departments at SIES GST."
            rightSlot={
              <div className="page-hub-stats-pill">
                <span>{totalBuddies} Verified Students</span>
              </div>
            }
          />

          {/* ── Filter Toolbar: Search + Branch + Year + Skill + Clear ── */}
          <div className="buddies-toolbar-grid">
            {/* Real-time Search Input */}
            <div className="events-search-wrap" style={{ minWidth: '200px' }}>
              <MagnifyingGlass size={15} className="events-search-icon" aria-hidden="true" />
              <input
                type="search"
                className="events-search-input"
                placeholder="Search students by name, bio, or skill…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search campus buddies"
              />
              {searchQuery && (
                <button
                  className="events-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Branch Filter Select */}
            <select
              className="buddies-select"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label="Filter by department branch"
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Year Filter Select */}
            <select
              className="buddies-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              aria-label="Filter by academic year"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            {/* Skill Filter Select */}
            <select
              className="buddies-select"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              aria-label="Filter by technical skill"
            >
              {SKILL_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Skills' : s}
                </option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                className="buddies-clear-btn"
                onClick={handleClearFilters}
                title="Reset all search and filters"
              >
                <ArrowsClockwise size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* ── Matching Count Bar ── */}
          <div className="buddies-count-bar">
            <span className="events-count-label" role="status" aria-live="polite">
              {loading ? '—' : `${totalBuddies} Campus Buddi${totalBuddies !== 1 ? 'es' : 'y'} Found`}
            </span>

            {totalPages > 1 && (
              <span className="buddies-page-summary">
                Page {currentPage} of {totalPages}
              </span>
            )}

            <ViewToggle view={catalogView} onChange={(v) => switchCatalogView(setCatalogView, v)} />
          </div>

          {/* ── Directory Catalog Grid ── */}
          <div ref={catalogRef}>
            {loading ? (
              <div className="buddies-catalog" aria-busy="true" aria-label="Loading student buddies">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : loadError ? (
              <div className="buddies-empty-box" role="alert">
                <div className="profile-empty-icon" aria-hidden="true">
                  <Warning size={24} style={{ color: '#991B1B' }} />
                </div>
                <h3 className="profile-empty-title">Could Not Load Campus Buddies</h3>
                <p className="profile-empty-desc">{loadError}</p>
                {!isLoggedIn ? (
                  <button
                    className="btn-primary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem', marginTop: 8 }}
                    onClick={() => onNavigateToLogin?.()}
                  >
                    Log In to Continue
                  </button>
                ) : (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem', marginTop: 8 }}
                    onClick={handleClearFilters}
                  >
                    <ArrowsClockwise size={14} /> Retry
                  </button>
                )}
              </div>
            ) : buddies.length === 0 ? (
              <div className="buddies-empty-box" role="status">
                <div className="profile-empty-icon" aria-hidden="true">
                  <MagnifyingGlass size={24} />
                </div>
                <h3 className="profile-empty-title">No campus buddies found.</h3>
                <p className="profile-empty-desc">
                  Try broadening your search query, selecting another academic department, or clearing skills filters.
                </p>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.8125rem', padding: '0.5rem 1.25rem', marginTop: 4 }}
                  onClick={handleClearFilters}
                >
                  <ArrowsClockwise size={14} /> Reset Filters
                </button>
              </div>
            ) : catalogView === 'list' ? (
              <div className="cc-ledger" role="list" aria-label="Campus buddies directory">
                <AnimatePresence mode="popLayout">
                  {buddies.map((student, idx) => (
                    <BuddyLedgerRow
                      key={student.id}
                      index={(currentPage - 1) * CARDS_PER_PAGE + idx}
                      buddy={student}
                      isFollowed={followedIds.has(student.id)}
                      onToggleFollow={handleToggleFollow}
                      onViewProfile={handleViewProfile}
                      isLoggedIn={isLoggedIn}
                      onNavigateToLogin={onNavigateToLogin}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="buddies-catalog" role="list" aria-label="Campus buddies directory">
                <AnimatePresence mode="popLayout">
                  {buddies.map((student, idx) => (
                    <motion.div
                      key={student.id}
                      layout
                      initial={{ opacity: 0, y: 22, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
                      transition={{
                        type: 'spring',
                        stiffness: 340,
                        damping: 30,
                        delay: Math.min(idx * 0.03, 0.3),
                      }}
                      role="listitem"
                    >
                      <StudentCard
                        buddy={student}
                        isFollowed={followedIds.has(student.id)}
                        onToggleFollow={handleToggleFollow}
                        onViewProfile={handleViewProfile}
                        isLoggedIn={isLoggedIn}
                        onNavigateToLogin={onNavigateToLogin}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Pagination Controls Bar ── */}
          {!loading && !loadError && totalPages > 1 && (
            <div className="buddies-pagination">
              <div className="buddies-pagination-nav">
                <motion.button
                  className="buddies-page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  whileTap={currentPage === 1 ? undefined : { scale: 0.94 }}
                  aria-label="Previous page"
                >
                  <CaretLeft size={14} style={{ marginRight: 2 }} /> Previous
                </motion.button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <motion.button
                    key={pageNum}
                    className={`buddies-page-btn ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                  >
                    {pageNum}
                  </motion.button>
                ))}

                <motion.button
                  className="buddies-page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  whileTap={currentPage === totalPages ? undefined : { scale: 0.94 }}
                  aria-label="Next page"
                >
                  Next <CaretRight size={14} style={{ marginLeft: 2 }} />
                </motion.button>
              </div>

              <span className="buddies-page-summary">
                Showing {(currentPage - 1) * CARDS_PER_PAGE + 1}–
                {Math.min(currentPage * CARDS_PER_PAGE, totalBuddies)} of {totalBuddies} buddies
              </span>
            </div>
          )}

        </div>
      </div>

      {/* ── Toast Container ── */}
      <ToastContainer toasts={toasts} />
      <Footer compact />
    </>
  );
}
