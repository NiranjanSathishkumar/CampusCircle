/**
 * OrganizerPostsPage.jsx — Organiser Content Studio.
 * Features:
 * - Content Studio Header with reach analytics.
 * - Multi-category filters (Status & Post Type) + keyword search.
 * - Post cards grid with Framer Motion layout animations.
 * - Composer Modal with Live Student Feed Preview tab.
 * - Quick publish/unpublish toggle actions.
 * Fully aligned with the CampusCircle Student Interface design system.
 */
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Heart,
  ChatCircle,
  PencilSimple,
  Trash,
  X,
  Megaphone,
  MagnifyingGlass,
  GlobeSimple,
  EyeSlash,
  Sparkle,
  Stack,
  Clock,
  Warning,
  CircleNotch,
  Paperclip,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { formatCount } from '@/shared/utils/formatters';
import { ApiError } from '@/shared/api/httpClient';
import StatusPill from '@/layouts/portal/components/StatusPill';
import EmptyState from '@/layouts/portal/components/EmptyState';
import '@/layouts/portal/portal-widgets.css';
import './org-posts.css';
import PostComposerModal from '@/portal/organizer/posts/components/PostComposerModal';
import { EMPTY_DRAFT, TYPE_CONFIG } from '@/portal/organizer/posts/postsConstants';
import { listMyPosts, createPost, updatePost, deletePost, addPostAttachments, removePostAttachment } from '@/portal/organizer/posts/posts.api';

function mapOrgPost(apiPost) {
  const attachments = apiPost.attachments || [];
  const imageAttachment = attachments.find((a) => a.type === 'image');
  return {
    id: apiPost._id,
    type: apiPost.type,
    title: apiPost.title,
    body: apiPost.content,
    isPublished: apiPost.isPublished,
    imageUrl: imageAttachment?.url || null,
    attachments,
    attachmentCount: attachments.length,
    likes: apiPost.likesCount || 0,
    comments: apiPost.commentsCount || 0,
    createdAt: apiPost.createdAt,
  };
}

export default function OrganizerPostsPage() {
  const { community } = useOrganizerAuth();
  const communityName = community?.name || 'Your Community';
  const communityId = community?._id;
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const triggerToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const refetch = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    setLoadError(false);
    try {
      const { posts: apiPosts } = await listMyPosts(communityId);
      setPosts(apiPosts.map(mapOrgPost));
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  useEffect(() => { refetch(); }, [refetch]);

  // URL search params state sync
  const statusFilter = searchParams.get('status') || 'all';
  const setStatusFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('status');
    else next.set('status', val);
    setSearchParams(next, { replace: true });
  };

  const typeFilter = searchParams.get('category') || 'all';
  const setTypeFilter = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val === 'all') next.delete('category');
    else next.set('category', val);
    setSearchParams(next, { replace: true });
  };

  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (val) => {
    const next = new URLSearchParams(searchParams);
    if (!val) next.delete('q');
    else next.set('q', val);
    setSearchParams(next, { replace: true });
  };

  const [draft, setDraft] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const deletePostModalRef = useRef(null);
  useFocusTrap(deletePostModalRef, Boolean(postToDelete), () => setPostToDelete(null));

  // Calculated metrics
  const counts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((p) => p.isPublished).length,
      draft: posts.filter((p) => !p.isPublished).length,
      totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.comments || 0), 0),
    }),
    [posts]
  );

  // Filtered post items
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter === 'published' && !p.isPublished) return false;
      if (statusFilter === 'draft' && p.isPublished) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (
        searchQuery.trim() &&
        !p.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.body.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [posts, statusFilter, typeFilter, searchQuery]);

  const openNewPost = () => setDraft({ ...EMPTY_DRAFT });
  const openEditPost = (post) =>
    setDraft({
      ...EMPTY_DRAFT,
      id: post.id,
      type: post.type,
      title: post.title,
      body: post.body,
      isPublished: post.isPublished,
      existingAttachments: post.attachments || [],
    });

  const handleSave = async (draftData, isPublished) => {
    setSaving(true);
    try {
      const payload = {
        title: draftData.title.trim(),
        content: draftData.body.trim(),
        type: draftData.type,
        isPublished,
      };

      let postId = draftData.id;
      if (postId) {
        await updatePost(postId, payload);
      } else {
        const { post } = await createPost(payload);
        postId = post._id;
      }

      if (draftData.removedAttachmentIds.length > 0) {
        await Promise.all(
          draftData.removedAttachmentIds.map((attachmentId) =>
            removePostAttachment(postId, attachmentId).catch(() => {}),
          ),
        );
      }

      if (draftData.newFiles.length > 0) {
        await addPostAttachments(postId, draftData.newFiles.map((f) => f.file));
      }

      await refetch();
      setDraft(null);
      triggerToast(isPublished ? '✓ Post published to Discover feed.' : '📝 Draft saved.');
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      await updatePost(post.id, { isPublished: !post.isPublished });
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, isPublished: !p.isPublished } : p)));
      triggerToast(post.isPublished ? 'Moved back to drafts.' : '✓ Published to Discover feed.');
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not update post status.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      triggerToast('Post deleted.');
    } catch (err) {
      triggerToast(err instanceof ApiError ? err.message : 'Could not delete post.');
    }
  };

  return (
    <div className="org-page org-posts-page">
      {/* ── Page Header ── */}
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">
            <Stack size={13} className="inline mr-1 text-[#991B1B]" />
            Content Studio
          </p>
          <h1 className="org-page-title">Posts & Announcements</h1>
          <p className="org-page-desc">
            Compose and manage community updates published directly to student Discover feeds and subscriber notification feeds.
          </p>
        </div>
        <div className="org-page-actions">
          <button className="org-btn org-btn-primary" onClick={openNewPost}>
            <Plus size={15} weight="bold" />
            <span>Compose Post</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Strip ── */}
      <div className="org-posts-metrics-strip">
        <div className="org-posts-metric-item">
          <span className="org-posts-metric-label">Total Posts</span>
          <span className="org-posts-metric-val">{formatCount(counts.all)}</span>
        </div>
        <div className="org-posts-metric-item">
          <span className="org-posts-metric-label">Published Live</span>
          <span className="org-posts-metric-val text-[#0D9488]">{formatCount(counts.published)}</span>
        </div>
        <div className="org-posts-metric-item">
          <span className="org-posts-metric-label">Active Drafts</span>
          <span className="org-posts-metric-val text-amber-600">{formatCount(counts.draft)}</span>
        </div>
        <div className="org-posts-metric-item">
          <span className="org-posts-metric-label">Student Engagement</span>
          <span className="org-posts-metric-val text-[#991B1B] font-mono text-sm">
            {formatCount(counts.totalLikes)} Likes · {formatCount(counts.totalComments)} Comments
          </span>
        </div>
      </div>

      {/* ── Toolbar: Search & Category Filter Pills ── */}
      <div className="org-posts-toolbar">
        {/* Search */}
        <div className="org-posts-search">
          <MagnifyingGlass size={15} className="org-posts-search-icon" />
          <input
            type="text"
            placeholder="Search by title or body…"
            aria-label="Search announcements by title or body"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="org-posts-search-input"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="org-posts-type-filters">
          <button
            type="button"
            className={`org-type-filter-pill ${typeFilter === 'all' ? 'active' : ''}`}
            aria-pressed={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            All Categories
          </button>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              className={`org-type-filter-pill ${typeFilter === key ? 'active' : ''}`}
              aria-pressed={typeFilter === key}
              onClick={() => setTypeFilter(key)}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="org-posts-status-tabs ml-auto">
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'published', label: 'Published', count: counts.published },
            { id: 'draft', label: 'Drafts', count: counts.draft },
          ].map((t) => (
            <button
              key={t.id}
              className={`org-tab-btn ${statusFilter === t.id ? 'active' : ''}`}
              aria-pressed={statusFilter === t.id}
              onClick={() => setStatusFilter(t.id)}
            >
              {t.label} <span className="org-tab-count">{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading / Error States ── */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-16">
          <CircleNotch size={16} className="animate-spin" /> Loading your posts…
        </div>
      )}

      {!loading && loadError && (
        <EmptyState
          icon={Warning}
          title="Could not load posts"
          desc="Something went wrong fetching your community's posts. Please try again."
          action={
            <button className="org-btn org-btn-primary" onClick={refetch}>
              Retry
            </button>
          }
        />
      )}

      {/* ── Posts Cards Grid ── */}
      {!loading && !loadError && (filteredPosts.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No posts found"
          desc="No community posts match your current search or category filters."
          action={
            <button className="org-btn org-btn-primary" onClick={openNewPost}>
              <Plus size={15} weight="bold" /> Compose Post
            </button>
          }
        />
      ) : (
        <div className="org-posts-grid">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => {
              const cfg = TYPE_CONFIG[post.type] || TYPE_CONFIG.Announcement;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="org-post-card"
                  key={post.id}
                >
                  {/* Image Header with Badge Overlay */}
                  <div className="org-post-card-img-wrap">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title ? `Cover photo for ${post.title}` : 'Announcement cover photo'}
                        className="org-post-card-img"
                        loading="lazy"
                      />
                    ) : (
                      <div className="org-post-card-img org-post-card-img--placeholder">
                        <Megaphone size={28} />
                      </div>
                    )}
                    <span
                      className="org-post-type-badge"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                    {post.attachmentCount > 0 && (
                      <span className="org-post-attach-badge">
                        <Paperclip size={11} /> {post.attachmentCount}
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="org-post-card-body">
                    <div className="org-post-card-meta">
                      <StatusPill status={post.isPublished ? 'published' : 'draft'} />
                      {post.createdAt && (
                        <span className="org-post-date font-mono text-[11px] text-gray-400">
                          <Clock size={11} className="inline mr-1" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="org-post-card-title">{post.title}</h3>
                    <p className="org-post-card-text">{post.body}</p>

                    {/* Footer stats & actions */}
                    <div className="org-post-card-footer">
                      <div className="org-post-card-stats">
                        <span title="Student Likes">
                          <Heart size={14} className="text-[#991B1B]" /> {formatCount(post.likes)}
                        </span>
                        <span title="Comments">
                          <ChatCircle size={14} className="text-[#0D9488]" /> {formatCount(post.comments)}
                        </span>
                      </div>

                      <div className="org-post-card-actions">
                        <button
                          type="button"
                          className="org-icon-btn"
                          onClick={() => handleTogglePublish(post)}
                          title={
                            post.isPublished
                              ? 'Unpublish to Drafts'
                              : 'Publish to Feed'
                          }
                          aria-label="Toggle publish"
                        >
                          {post.isPublished ? (
                            <EyeSlash size={14} />
                          ) : (
                            <GlobeSimple size={14} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="org-icon-btn"
                          onClick={() => openEditPost(post)}
                          title="Edit post"
                          aria-label="Edit post"
                        >
                          <PencilSimple size={14} />
                        </button>
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--danger"
                          onClick={() => setPostToDelete(post)}
                          title="Delete post"
                          aria-label="Delete post"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ))}

      {/* Composer Modal */}
      {draft && (
        <PostComposerModal
          draft={draft}
          onChange={setDraft}
          onClose={() => setDraft(null)}
          onSave={handleSave}
          saving={saving}
          communityName={communityName}
        />
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div
          className="org-modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setPostToDelete(null)}
        >
          <motion.div
            ref={deletePostModalRef}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="org-modal"
            style={{ maxWidth: 440 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-post-title"
          >
            <div className="org-modal-header">
              <div className="flex items-center gap-2 text-red-700">
                <Warning size={20} weight="bold" />
                <h2 className="org-modal-title text-red-900" id="delete-post-title">
                  Delete Announcement Post?
                </h2>
              </div>
              <button
                className="org-icon-btn"
                onClick={() => setPostToDelete(null)}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="org-modal-body">
              <p className="text-xs text-gray-600 leading-relaxed font-['Plus_Jakarta_Sans']">
                Are you sure you want to delete <strong>"{postToDelete.title}"</strong>? This post will be permanently removed from student Discover feeds.
              </p>
            </div>

            <div className="org-modal-footer">
              <button
                type="button"
                className="org-btn org-btn-ghost"
                onClick={() => setPostToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="org-btn org-btn-danger-solid"
                onClick={() => {
                  handleDelete(postToDelete.id);
                  setPostToDelete(null);
                }}
              >
                <Trash size={15} />
                <span>Delete Post</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Toast Notification Banner ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-gray-700 flex items-center gap-2 text-xs font-mono"
          >
            <Sparkle size={16} className="text-emerald-400" weight="fill" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
