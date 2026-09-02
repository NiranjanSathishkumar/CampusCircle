import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChatCircleText, Flame, ShieldCheck, X } from '@phosphor-icons/react';
import { COMMUNITY_CATEGORIES } from '@/features/communities/communitiesConstants';

/* ─────────────────────────────────────────────────────────────
   QUICK PREVIEW MODAL
   ───────────────────────────────────────────────────────────── */
export default function CommunityQuickPreviewModal({
  community,
  isFollowed,
  onToggleFollow,
  onClose,
  onExplore,
  isLoggedIn,
  onNavigateToLogin,
  onShowToast,
}) {
  const [modalTab, setModalTab] = useState('about');
  const modalRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    modalRef.current?.focus();
    const handle = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      prev?.focus?.();
    };
  }, [onClose]);

  if (!community) return null;

  const categoryObj = COMMUNITY_CATEGORIES.find(c => c.id === community.category);

  return (
    <motion.div
      className="comm-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-preview-title"
    >
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        className="comm-modal outline-none"
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover Header */}
        <div className="comm-modal-header">
          {community.coverImage ? (
            <img src={community.coverImage} alt={community.name} className="w-full h-full object-cover" />
          ) : (
            <div style={{ width: '100%', height: '100%', background: community.coverGradient || 'linear-gradient(135deg, #1A3A2A, #0F172A)' }} />
          )}
          <div className="comm-modal-header-overlay" />
          <button className="comm-modal-close-btn" onClick={onClose} aria-label="Close preview modal">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="comm-modal-body">
          {/* Identity Header */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 id="quick-preview-title" className="font-display font-bold text-[#0F172A] text-xl leading-tight m-0">
                    {community.name}
                  </h2>
                  {community.isVerified && <ShieldCheck size={16} weight="fill" className="text-[#1A3A2A] flex-shrink-0" title="Verified Campus Chapter" />}
                </div>
                <span className="inline-block font-mono text-[0.5rem] uppercase tracking-wider text-[#991B1B] bg-[#991B1B]/8 px-2 py-0.5 rounded-sm font-bold mt-1.5">
                  {categoryObj?.label}
                </span>
              </div>
            </div>

            <button
              className={`comm-card-btn-join ${isFollowed ? 'following' : ''}`}
              onClick={() => {
                if (!isLoggedIn) { onNavigateToLogin(); return; }
                onToggleFollow(community.id);
              }}
              style={{ padding: '0.5rem 1rem', flex: 'none' }}
              aria-label={isFollowed ? `Following ${community.name}. Click to leave/unfollow.` : `Join & Follow ${community.name}`}
              title={isFollowed ? 'Click to unfollow' : `Join & Follow ${community.name}`}
            >
              {isFollowed ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12} weight="bold" /> Following
                </span>
              ) : (
                'Join & Follow'
              )}
            </button>
          </div>

          <p className="font-sans text-sm text-[#6B7280] mt-3 mb-0 leading-relaxed">
            {community.tagline}
          </p>

          {/* Modal Tabs */}
          <div className="comm-modal-tabs">
            <button
              className={`comm-modal-tab-btn ${modalTab === 'about' ? 'active' : ''}`}
              onClick={() => setModalTab('about')}
            >
              About
            </button>
            <button
              className={`comm-modal-tab-btn ${modalTab === 'leads' ? 'active' : ''}`}
              onClick={() => setModalTab('leads')}
            >
              Leads ({community.leads?.length || 0})
            </button>
            <button
              className={`comm-modal-tab-btn ${modalTab === 'events' ? 'active' : ''}`}
              onClick={() => setModalTab('events')}
            >
              Events ({community.upcomingEvents?.length || 0})
            </button>
          </div>

          {/* Tab 1: About */}
          {modalTab === 'about' && (
            <div className="space-y-3">
              <p className="font-sans text-xs text-[#374151] leading-relaxed whitespace-pre-line">
                {community.about}
              </p>

              {community.recruiting && (
                <div className="p-3 bg-[#991B1B]/8 border border-[#991B1B]/20 rounded-sm">
                  <span className="font-mono text-xs font-bold text-[#991B1B] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={14} weight="fill" /> Recruiting Open: {community.recruitingRole}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Leads & Mentors */}
          {modalTab === 'leads' && (
            <div className="space-y-2.5">
              {community.leads?.length > 0 ? (
                community.leads.map(leader => (
                  <div key={leader.id} className="comm-leader-card">
                    <img src={leader.avatarUrl} alt={leader.name} className="comm-leader-avatar" />
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-bold text-xs text-[#0F172A] m-0">
                        {leader.name}
                      </p>
                      <p className="font-sans text-[0.7rem] font-semibold text-[#991B1B] m-0">
                        {leader.role}
                      </p>
                      <p className="font-sans text-[0.65rem] text-[#6B7280] m-0">
                        {leader.branch}
                      </p>
                    </div>
                    <button
                      className="px-2.5 py-1.5 bg-[#0F172A] text-white rounded-sm font-mono text-[0.55rem] uppercase tracking-wider flex items-center gap-1 hover:bg-[#1E293B] transition-colors flex-shrink-0"
                      onClick={() => {
                        if (!isLoggedIn) { onNavigateToLogin(); return; }
                        onShowToast(`Opening conversation thread with ${leader.name}`);
                      }}
                    >
                      <ChatCircleText size={11} /> Message
                    </button>
                  </div>
                ))
              ) : (
                <p className="font-sans text-xs text-[#6B7280] italic">
                  No core team profiles listed yet.
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Events */}
          {modalTab === 'events' && (
            <div className="space-y-2.5">
              {community.upcomingEvents?.length > 0 ? (
                community.upcomingEvents.map((ev, i) => (
                  <div key={i} className="bg-[#F0EDE5] border border-[#D8D2C4] rounded-sm p-3 flex items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-[0.48rem] uppercase font-bold text-[#991B1B] bg-[#991B1B]/8 px-1.5 py-0.5 rounded-sm">{ev.type}</span>
                      <p className="font-display font-bold text-xs text-[#0F172A] mt-1 mb-0">
                        {ev.title}
                      </p>
                      <span className="font-mono text-[0.55rem] text-[#6B7280]">
                        {ev.date}
                      </span>
                    </div>
                    <a
                      href={`#events/detail/${ev.eventId}`}
                      onClick={onClose}
                      className="px-2.5 py-1.5 bg-[#0F172A] text-white rounded-sm font-mono text-[0.55rem] uppercase tracking-wider no-underline hover:bg-[#1E293B] transition-colors flex-shrink-0"
                    >
                      View
                    </a>
                  </div>
                ))
              ) : (
                <p className="font-sans text-xs text-[#6B7280] italic">
                  No upcoming events scheduled.
                </p>
              )}
            </div>
          )}

          {/* Modal Footer */}
          <div className="mt-5 pt-3 border-t border-[#D8D2C4] flex justify-end">
            <button
              className="px-4 py-2 bg-[#991B1B] text-white rounded-sm font-mono text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 hover:bg-[#7F1D1D] transition-colors active:scale-95 shadow-sm"
              onClick={() => { onClose(); onExplore(community.id); }}
            >
              Explore Full Page <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
