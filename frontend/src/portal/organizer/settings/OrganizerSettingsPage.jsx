/**
 * OrganizerSettingsPage.jsx — Organiser Account & Community Profile Portal.
 * Community Profile and Login Audit Trail tabs are wired live to /api/community
 * (info, logo/banner, tags, social links, FAQs, audit-logs). Shared-login
 * password rotation still has no backend endpoint, so that tab stays
 * presentational.
 */
import { useRef, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  ShieldCheck,
  Info,
  Check,
  DeviceMobile,
  Desktop,
  MapPin,
  GithubLogo,
  LinkedinLogo,
  DiscordLogo,
  InstagramLogo,
  XLogo,
  UserCircle,
  Gear,
  Key,
  Plus,
  X,
  PencilSimple,
  Trash,
  Image as ImageIcon,
  CircleNotch,
  Eye,
  EyeSlash,
  Camera,
  Buildings,
  Tag,
  Question,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Warning,
} from '@phosphor-icons/react';
import { useOrganizerAuth } from '@/shared/auth/useOrganizerAuth';
import {
  updateCommunityInfo,
  uploadCommunityLogo,
  removeCommunityLogo,
  uploadCommunityBanner,
  removeCommunityBanner,
  addTag,
  removeTag,
  setSocialLink,
  removeSocialLink,
  addFaq,
  updateFaq,
  removeFaq,
  getAuditLogs,
} from '@/portal/organizer/settings/community.api';
import ImageCropModal from '@/shared/components/ImageCropModal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { ApiError } from '@/shared/api/httpClient';
import '@/layouts/portal/portal-widgets.css';
import './org-settings.css';
import './org-profile-hero.css';

const SOCIAL_PLATFORMS = [
  { id: 'github', label: 'GitHub', icon: GithubLogo },
  { id: 'linkedin', label: 'LinkedIn', icon: LinkedinLogo },
  { id: 'discord', label: 'Discord', icon: DiscordLogo },
  { id: 'instagram', label: 'Instagram', icon: InstagramLogo },
  { id: 'twitter', label: 'Twitter / X', icon: XLogo },
];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3600000);
  if (hrs < 1) return 'Just now';
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// The AuditLog collection only stores userAgent/ipAddress/createdAt - no
// pre-parsed device fields and no per-member attribution (a shared organizer
// login is deliberately login-level, not action-level, accountability - see
// backend/src/models/AuditLog.js). Parsed client-side for display, same as
// the admin's cross-community audit view (AdminAuditLogPage.jsx).
function parseUserAgent(ua = '') {
  let browser = 'Unknown browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'unknown OS';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'macOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad/.test(ua)) os = 'iOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return { label: `${browser} on ${os}`, isMobile: /iPhone|iPad|Android/.test(ua) };
}

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: 'Empty', color: '#D8D2C4' };
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score, label: 'Weak', color: '#991B1B' };
  if (score <= 4) return { score, label: 'Medium', color: '#B45309' };
  return { score, label: 'Strong & Secure', color: '#1A3A2A' };
}

function errorMessage(err, fallback) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function OrganizerSettingsPage() {
  const { community, updateCommunity } = useOrganizerAuth();
  const communityName = community?.name || 'Community';
  // Initials for logo placeholder
  const communityInitials = communityName
    .trim()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'audit'
  // Sub-section nav within the profile tab: info (includes tags), social, faqs
  const [profileSubTab, setProfileSubTab] = useState('info'); // 'info' | 'social' | 'faqs'

  /* ── Login Audit Trail (own community only, /api/community/audit-logs) ── */
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditFetched, setAuditFetched] = useState(false);

  useEffect(() => {
    if (activeTab !== 'audit' || auditFetched) return;
    let cancelled = false;
    setAuditLoading(true);
    setAuditError('');
    getAuditLogs({ limit: 50 })
      .then(({ logs }) => {
        if (cancelled) return;
        setAuditLogs(logs);
        setAuditFetched(true);
      })
      .catch((err) => {
        if (!cancelled) setAuditError(errorMessage(err, 'Could not load login audit trail.'));
      })
      .finally(() => {
        if (!cancelled) setAuditLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeTab, auditFetched]);

  /* ── Enhanced Toast & Alert System ── */
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const triggerToast = (msg, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const message = typeof msg === 'string' ? msg : msg?.message || 'Action completed';
    const resolvedType = typeof msg === 'object' && msg?.type ? msg.type : type;
    setToast({ message, type: resolvedType });
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  /* ── Image Crop Modals State ── */
  const [logoCropFile, setLogoCropFile] = useState(null);
  const [bannerCropFile, setBannerCropFile] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  /* ── Confirmation Dialog State ── */
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  /* ── Community Info form ── */
  const [info, setInfo] = useState({
    description: community?.description || '',
    category: community?.category || '',
    location: community?.location || '',
    establishedYear: community?.establishedYear || '',
    leadOrganizer: community?.leadOrganizer || '',
    isRecruiting: community?.isRecruiting || false,
  });
  const [infoSaved, setInfoSaved] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);

  // useState's initializer only runs on mount, so if OrganizerAuthContext is
  // still resolving the session at that point (community is null/undefined),
  // the form would otherwise stay stuck on empty defaults forever. Re-sync
  // once community's identity resolves - keyed on _id (not the whole object)
  // so unrelated updates elsewhere (tags/social/faqs producing a new
  // community reference via updateCommunity) don't clobber in-progress edits.
  useEffect(() => {
    if (!community) return;
    setInfo({
      description: community.description || '',
      category: community.category || '',
      location: community.location || '',
      establishedYear: community.establishedYear || '',
      leadOrganizer: community.leadOrganizer || '',
      isRecruiting: community.isRecruiting || false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [community?._id]);

  const handleInfoSave = async (e) => {
    e.preventDefault();
    if (isSubmittingInfo) return;
    setInfoError('');
    // category is required on the Community model (unlike the other fields
    // here, which the backend accepts empty) - block the round trip instead
    // of surfacing the backend's generic "category is not allowed to be
    // empty" 400.
    if (!info.category.trim()) {
      setInfoError('Category cannot be empty.');
      triggerToast('Category cannot be empty.', 'error');
      return;
    }
    setIsSubmittingInfo(true);
    try {
      const payload = {
        description: info.description,
        category: info.category,
        location: info.location,
        leadOrganizer: info.leadOrganizer,
        isRecruiting: info.isRecruiting,
      };
      if (info.establishedYear) payload.establishedYear = Number(info.establishedYear);
      const { community: updated } = await updateCommunityInfo(payload);
      updateCommunity(updated);
      setInfoSaved(true);
      triggerToast('✓ Community profile updated successfully');
      setTimeout(() => setInfoSaved(false), 3200);
    } catch (err) {
      setInfoError(errorMessage(err, 'Could not save community profile. Please try again.'));
      triggerToast(errorMessage(err, 'Could not save community profile.'), 'error');
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  /* ── Logo & Banner Image Handlers with Crop Modal ── */
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const logoUrl = community?.logo?.cloudinaryUrl || community?.logo?.filename;
  const bannerUrl = community?.banner?.cloudinaryUrl || community?.banner?.filename;
  // Default placeholder images only ever populate `filename` (a static
  // fallback URL) - `cloudinaryUrl` is set exclusively by an actual upload.
  // Gating "Remove" on that (rather than on logoUrl/bannerUrl truthiness,
  // which is also true for the placeholder) matches the backend's own check
  // in communities.controller.js and avoids the 400 it returns for "no
  // custom logo/banner to remove".
  const hasCustomLogo = Boolean(community?.logo?.cloudinaryUrl);
  const hasCustomBanner = Boolean(community?.banner?.cloudinaryUrl);

  const IMAGE_TYPE_RE = /^image\/(jpeg|png|webp)$/;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const validateImageFile = (file) => {
    if (!IMAGE_TYPE_RE.test(file.type)) {
      triggerToast('Please choose a JPEG, PNG, or WEBP image', 'error');
      return false;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      triggerToast('Image exceeds the 5 MB limit', 'error');
      return false;
    }
    return true;
  };

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !validateImageFile(file)) return;
    setLogoCropFile(file);
  };

  const handleBannerSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !validateImageFile(file)) return;
    setBannerCropFile(file);
  };

  const handleLogoCropConfirm = async (blob) => {
    setIsUploadingLogo(true);
    try {
      const { logo } = await uploadCommunityLogo(blob);
      updateCommunity({ ...community, logo });
      triggerToast('✓ Community logo updated successfully');
      setLogoCropFile(null);
    } catch (err) {
      triggerToast(errorMessage(err, 'Could not upload logo.'), 'error');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleBannerCropConfirm = async (blob) => {
    setIsUploadingBanner(true);
    try {
      const { banner } = await uploadCommunityBanner(blob);
      updateCommunity({ ...community, banner });
      triggerToast('✓ Community banner updated successfully');
      setBannerCropFile(null);
    } catch (err) {
      triggerToast(errorMessage(err, 'Could not upload banner.'), 'error');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  /* ── Dispatched Confirmation Modal Action Handler ── */
  const handleConfirmAction = async () => {
    if (!confirmDialog || isConfirming) return;
    setIsConfirming(true);
    try {
      if (confirmDialog.type === 'logo') {
        const { logo } = await removeCommunityLogo();
        updateCommunity({ ...community, logo });
        triggerToast('Community logo removed');
      } else if (confirmDialog.type === 'banner') {
        const { banner } = await removeCommunityBanner();
        updateCommunity({ ...community, banner });
        triggerToast('Community banner removed');
      } else if (confirmDialog.type === 'tag') {
        const { tags } = await removeTag(confirmDialog.tag);
        updateCommunity({ ...community, tags });
        triggerToast(`Removed tag #${confirmDialog.tag}`);
      } else if (confirmDialog.type === 'faq') {
        const { faqs } = await removeFaq(confirmDialog.id);
        updateCommunity({ ...community, faqs });
        triggerToast('FAQ removed');
      } else if (confirmDialog.type === 'social') {
        const { socialLinks } = await removeSocialLink(confirmDialog.platform);
        updateCommunity({ ...community, socialLinks });
        setSocialDrafts((prev) => ({ ...prev, [confirmDialog.platform]: undefined }));
        triggerToast(`Removed ${confirmDialog.label} link`);
      }
      setConfirmDialog(null);
    } catch (err) {
      triggerToast(errorMessage(err, 'Failed to complete action.'), 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  /* ── Tags ── */
  const [tagInput, setTagInput] = useState('');
  const [tagBusy, setTagBusy] = useState(false);

  const handleAddTag = async (e) => {
    e.preventDefault();
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!tag || tagBusy) return;
    if (community?.tags?.includes(tag)) {
      triggerToast('Tag already added', 'info');
      setTagInput('');
      return;
    }
    setTagBusy(true);
    try {
      const { tags } = await addTag(tag);
      updateCommunity({ ...community, tags });
      setTagInput('');
      triggerToast(`✓ Added tag #${tag}`);
    } catch (err) {
      triggerToast(errorMessage(err, 'Could not add tag.'), 'error');
    } finally {
      setTagBusy(false);
    }
  };

  /* ── Social links ── */
  const [socialDrafts, setSocialDrafts] = useState({});
  const [socialBusyPlatform, setSocialBusyPlatform] = useState(null);

  const socialLinkFor = (platform) => community?.socialLinks?.find((l) => l.platform === platform);
  const draftFor = (platform) =>
    socialDrafts[platform] !== undefined ? socialDrafts[platform] : socialLinkFor(platform)?.url || '';

  const handleSaveSocialLink = async (platform, label) => {
    const url = draftFor(platform).trim();
    if (!url) return;
    setSocialBusyPlatform(platform);
    try {
      const { socialLinks } = await setSocialLink(platform, url);
      updateCommunity({ ...community, socialLinks });
      setSocialDrafts((prev) => ({ ...prev, [platform]: undefined }));
      triggerToast(`✓ ${label || platform} link saved`);
    } catch (err) {
      triggerToast(errorMessage(err, `Could not save ${label || platform} link.`), 'error');
    } finally {
      setSocialBusyPlatform(null);
    }
  };

  /* ── FAQs ── */
  const [faqDraft, setFaqDraft] = useState({ question: '', answer: '' });
  const [faqBusy, setFaqBusy] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [editFaq, setEditFaq] = useState({ question: '', answer: '' });

  const handleAddFaq = async (e) => {
    e.preventDefault();
    const question = faqDraft.question.trim();
    const answer = faqDraft.answer.trim();
    if (!question || !answer || faqBusy) return;
    setFaqBusy(true);
    try {
      const { faqs } = await addFaq(question, answer);
      updateCommunity({ ...community, faqs });
      setFaqDraft({ question: '', answer: '' });
      triggerToast('✓ Added new FAQ');
    } catch (err) {
      triggerToast(errorMessage(err, 'Could not add FAQ.'), 'error');
    } finally {
      setFaqBusy(false);
    }
  };

  const startEditFaq = (faq) => {
    setEditingFaqId(faq._id);
    setEditFaq({ question: faq.question, answer: faq.answer });
  };

  const handleSaveFaqEdit = async (faqId) => {
    setFaqBusy(true);
    try {
      const { faqs } = await updateFaq(faqId, editFaq);
      updateCommunity({ ...community, faqs });
      setEditingFaqId(null);
      triggerToast('✓ Updated FAQ');
    } catch (err) {
      triggerToast(errorMessage(err, 'Could not update FAQ.'), 'error');
    } finally {
      setFaqBusy(false);
    }
  };

  /* ── Password Rotation (presentational only — no backend endpoint yet) ── */
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNextPwd, setShowNextPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const strength = getPasswordStrength(pwd.next);

  // There is no backend endpoint for shared-password rotation yet (see the
  // note below the submit button), so this deliberately does NOT report
  // success or claim sessions were rotated — that would tell the organizer
  // their password changed when nothing was actually saved.
  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPwdError('');
    if (!pwd.current || !pwd.next || !pwd.confirm) {
      setPwdError('All password fields are required.');
      return;
    }
    if (pwd.next.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }
    if (pwd.next !== pwd.confirm) {
      setPwdError('New password and confirmation do not match.');
      return;
    }
    triggerToast('Shared-password rotation is not connected to a backend endpoint yet — no changes were saved.', 'info');
  };

  /* ── Community Profile Completion ── */
  const completionData = useMemo(() => {
    const checks = [
      { id: 'name', label: 'Community Name', done: Boolean(community?.name) },
      { id: 'logo', label: 'Logo uploaded', done: Boolean(community?.logo?.cloudinaryUrl) },
      { id: 'banner', label: 'Banner uploaded', done: Boolean(community?.banner?.cloudinaryUrl) },
      { id: 'description', label: 'About written', done: Boolean(info.description?.trim()) },
      { id: 'category', label: 'Category set', done: Boolean(info.category?.trim()) },
      { id: 'tags', label: 'Tags added', done: Boolean(community?.tags?.length) },
      { id: 'social', label: 'Social link set', done: Boolean(community?.socialLinks?.length) },
    ];
    const completedCount = checks.filter((c) => c.done).length;
    const percentage = Math.round((completedCount / checks.length) * 100);
    return { checks, percentage };
  }, [community, info]);

  return (
    <div className="org-page org-settings-page">
      {/* ── Page Header ── */}
      <div className="org-page-header">
        <div>
          <p className="org-page-eyebrow">
            <Gear size={13} className="inline mr-1 text-[#991B1B]" />
            Account &amp; Security
          </p>
          <h1 className="org-page-title">Organiser Settings</h1>
          <p className="org-page-desc">
            Manage public profile details, rotate shared login credentials for {communityName}, and inspect device audit logs.
          </p>
        </div>
      </div>

      {/* ── Section Filter Tabs ── */}
      <div className="org-tabs mb-6">
        <button
          type="button"
          className={`org-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserCircle size={15} />
          <span>Community Profile</span>
        </button>
        <button
          type="button"
          className={`org-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <Key size={15} />
          <span>Shared Credentials &amp; Security</span>
        </button>
        <button
          type="button"
          className={`org-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Desktop size={15} />
          <span>Login Audit Trail{auditFetched ? ` (${auditLogs.length})` : ''}</span>
        </button>
      </div>

      {/* ── Settings Content Views ── */}
      {activeTab === 'profile' && (
        <div>
          {/* ── Community Hero Card (Interactive Logo & Banner) ── */}
          <div className="org-profile-hero">
            {/* Banner */}
            <div className="org-profile-banner-wrap">
              {bannerUrl && <img src={bannerUrl} alt={`${communityName} banner`} className="org-profile-banner-img" />}
              <div className="org-profile-banner-overlay" aria-hidden="true" />
              <div className="org-profile-banner-btns">
                <label className="org-profile-banner-btn" title="Change community banner">
                  <Camera size={14} />
                  {isUploadingBanner ? 'Uploading…' : 'Edit Banner'}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerSelect}
                    disabled={isUploadingBanner}
                  />
                </label>
                {hasCustomBanner && (
                  <button
                    type="button"
                    className="org-profile-banner-btn"
                    onClick={() => setConfirmDialog({ type: 'banner' })}
                    disabled={isUploadingBanner || isConfirming}
                    title="Remove banner"
                  >
                    <Trash size={14} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Hero Body */}
            <div className="org-profile-summary-body">
              <div className="org-profile-avatar-row">
                {/* Community Logo */}
                <div className="org-profile-logo-wrap">
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${communityName} logo`} className="org-profile-logo-img" />
                  ) : (
                    <div className="org-profile-logo-placeholder">{communityInitials}</div>
                  )}
                  <label className="org-profile-logo-upload-overlay" title="Change community logo">
                    <Camera size={20} />
                    <span>{isUploadingLogo ? 'Uploading…' : 'Change'}</span>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoSelect}
                      disabled={isUploadingLogo}
                    />
                  </label>
                  {hasCustomLogo && (
                    <button
                      type="button"
                      className="org-profile-logo-remove-btn"
                      onClick={() => setConfirmDialog({ type: 'logo' })}
                      disabled={isUploadingLogo || isConfirming}
                      title="Remove logo"
                      aria-label="Remove community logo"
                    >
                      <Trash size={13} />
                    </button>
                  )}
                </div>

                {/* Action buttons */}
                <div className="org-profile-summary-actions">
                  <div className="org-verified-chip">
                    <ShieldCheck size={14} weight="fill" />
                    <span>{community?.isVerified === false ? 'Pending Verification' : 'Admin Verified'}</span>
                  </div>
                </div>
              </div>

              {/* Community identity */}
              <div className="org-profile-identity-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <h1 className="org-profile-community-name">{communityName}</h1>
                </div>

                <div className="org-profile-meta-row">
                  {info.category && (
                    <span className="org-profile-category-chip">
                      <Buildings size={11} />
                      {info.category}
                    </span>
                  )}
                  <span
                    className={`org-profile-recruiting-chip${info.isRecruiting ? '' : ' closed'}`}
                  >
                    <span className={`org-profile-dot${info.isRecruiting ? ' pulsing' : ''}`} />
                    {info.isRecruiting ? 'Recruiting Open' : 'Recruiting Closed'}
                  </span>
                  {info.location && (
                    <>
                      <span className="org-profile-meta-sep">•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={13} style={{ color: '#9CA3AF' }} />
                        {info.location}
                      </span>
                    </>
                  )}
                  {info.establishedYear && (
                    <>
                      <span className="org-profile-meta-sep">•</span>
                      <span>Est. {info.establishedYear}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats bar */}
              <div className="org-profile-stats-bar">
                <div className="org-profile-stat-item">
                  <span className="org-profile-stat-val">{community?.tags?.length ?? 0}</span>
                  <span className="org-profile-stat-lbl">Tags</span>
                </div>
                <div className="org-profile-stat-item">
                  <span className="org-profile-stat-val">{community?.socialLinks?.length ?? 0}</span>
                  <span className="org-profile-stat-lbl">Social Links</span>
                </div>
                <div className="org-profile-stat-item">
                  <span className="org-profile-stat-val">{community?.faqs?.length ?? 0}</span>
                  <span className="org-profile-stat-lbl">FAQs</span>
                </div>
                <div className="org-profile-stat-item">
                  <span className="org-profile-stat-val">{community?.coreTeam?.length ?? 0}</span>
                  <span className="org-profile-stat-lbl">Core Team</span>
                </div>
                <div className="org-profile-stat-item">
                  <span className="org-profile-stat-val" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem' }}>
                    {community?.email ? community.email.split('@')[0] : '—'}
                  </span>
                  <span className="org-profile-stat-lbl">Login Email</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dashboard Grid: Sidebar + Content ── */}
          <div className="org-profile-dashboard-grid">

            {/* Sidebar Navigation */}
            <div className="org-profile-sidebar">
              <nav className="org-profile-tab-rail" aria-label="Community profile sections">
                <button
                  type="button"
                  className={`org-profile-tab-btn ${profileSubTab === 'info' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('info')}
                >
                  <span className="org-profile-tab-label">
                    <Buildings size={15} />
                    Community Info
                  </span>
                </button>
                <button
                  type="button"
                  className={`org-profile-tab-btn ${profileSubTab === 'social' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('social')}
                >
                  <span className="org-profile-tab-label">
                    <LinkIcon size={15} />
                    Social Links
                  </span>
                </button>
                <button
                  type="button"
                  className={`org-profile-tab-btn ${profileSubTab === 'faqs' ? 'active' : ''}`}
                  onClick={() => setProfileSubTab('faqs')}
                >
                  <span className="org-profile-tab-label">
                    <Question size={15} />
                    FAQs
                  </span>
                </button>
              </nav>

              {/* Profile Completion Widget */}
              <div className="org-profile-completion-card">
                <div className="org-profile-completion-header">
                  <span className="org-profile-completion-title">Profile Completion</span>
                  <span className="org-profile-completion-pct">{completionData.percentage}%</span>
                </div>
                <div className="org-profile-completion-bar-wrap">
                  <div
                    className="org-profile-completion-bar"
                    style={{ width: `${completionData.percentage}%` }}
                  />
                </div>
                <ul className="org-profile-completion-checklist">
                  {completionData.checks.map((item) => (
                    <li key={item.id} className={`org-profile-completion-item${item.done ? ' done' : ''}`}>
                      {item.done ? (
                        <CheckCircle size={13} weight="fill" style={{ color: '#1A3A2A', flexShrink: 0 }} />
                      ) : (
                        <X size={13} style={{ color: '#9CA3AF', flexShrink: 0 }} />
                      )}
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Active Content Panel */}
            <div className="org-profile-content-panel">

              {/* ── Sub-tab: Community Info & Tags ── */}
              {profileSubTab === 'info' && (
                <div className="space-y-6">
                  {/* Public Community Info Form */}
                  <form className="org-card org-card-pad" onSubmit={handleInfoSave}>
                    <div className="org-profile-section-header">
                      <div>
                        <h2 className="org-profile-section-title">Public Community Info</h2>
                        <p className="org-profile-section-desc">
                          Displayed to students on the Discover feed and your community page.
                        </p>
                      </div>
                      <div className="org-verified-chip">
                        <ShieldCheck size={14} weight="fill" />
                        <span>Admin Verified</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="org-form-group">
                        <label className="org-form-label">Community Name</label>
                        <input
                          className="org-form-input bg-gray-100/70 text-gray-700 cursor-not-allowed font-bold"
                          value={communityName}
                          disabled
                        />
                        <span className="org-form-hint">
                          Managed by Admin Office. Contact campus administration to modify official club names.
                        </span>
                      </div>

                      <div className="org-form-row">
                        <div className="org-form-group">
                          <label className="org-form-label">Category</label>
                          <input
                            className="org-form-input"
                            value={info.category}
                            onChange={(e) => setInfo({ ...info, category: e.target.value })}
                            placeholder="e.g. Technical & Open Source"
                            required
                          />
                        </div>
                        <div className="org-form-group">
                          <label className="org-form-label">Established Year</label>
                          <input
                            type="number"
                            className="org-form-input"
                            value={info.establishedYear}
                            min={2000}
                            max={new Date().getFullYear()}
                            onChange={(e) => setInfo({ ...info, establishedYear: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="org-form-row">
                        <div className="org-form-group">
                          <label className="org-form-label">Location</label>
                          <div className="org-input-with-icon">
                            <MapPin size={15} className="org-input-icon text-gray-400" />
                            <input
                              className="org-form-input pl-8"
                              value={info.location}
                              onChange={(e) => setInfo({ ...info, location: e.target.value })}
                              placeholder="e.g. SIES GST, Block B"
                            />
                          </div>
                        </div>
                        <div className="org-form-group">
                          <label className="org-form-label">Lead Organiser</label>
                          <input
                            className="org-form-input"
                            value={info.leadOrganizer}
                            onChange={(e) => setInfo({ ...info, leadOrganizer: e.target.value })}
                            placeholder="Name of the current lead organiser"
                          />
                        </div>
                      </div>

                      <div className="org-form-group">
                        <label className="org-form-label">About / Description</label>
                        <textarea
                          className="org-form-textarea"
                          rows={4}
                          maxLength={1000}
                          value={info.description}
                          onChange={(e) => setInfo({ ...info, description: e.target.value })}
                          placeholder="Describe your community mission, events, and student onboarding process…"
                        />
                        <span className="org-form-hint" style={{ textAlign: 'right' }}>
                          {info.description.length} / 1000
                        </span>
                      </div>

                      {/* Recruiting toggle */}
                      <div className="org-profile-toggle-row">
                        <div className="org-profile-toggle-text">
                          <p className="org-profile-toggle-title">Currently Recruiting</p>
                          <p className="org-profile-toggle-desc">
                            Show a &ldquo;Recruiting Open&rdquo; badge on your public profile and Discover card.
                          </p>
                        </div>
                        <label className="org-profile-toggle-switch" aria-label="Toggle recruiting status">
                          <input
                            type="checkbox"
                            checked={info.isRecruiting}
                            onChange={(e) => setInfo({ ...info, isRecruiting: e.target.checked })}
                          />
                          <span className="org-profile-toggle-slider" />
                        </label>
                      </div>

                      {infoError && <p className="org-form-error">{infoError}</p>}

                      <div className="flex items-center justify-between pt-3 border-t border-[#D8D2C4]">
                        {infoSaved && (
                          <span className="org-save-confirm" role="status" aria-live="polite">
                            <Check size={14} weight="bold" /> Saved
                          </span>
                        )}
                        <button
                          type="submit"
                          className="org-btn org-btn-primary ml-auto flex items-center gap-1.5"
                          disabled={isSubmittingInfo}
                        >
                          {isSubmittingInfo ? (
                            <>
                              <CircleNotch size={15} className="animate-spin" />
                              <span>Saving…</span>
                            </>
                          ) : (
                            <span>Save Community Profile</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Discoverability Tags Card (Moved to Community Info tab) */}
                  <div className="org-card org-card-pad">
                    <div className="org-profile-section-header">
                      <div>
                        <h2 className="org-profile-section-title">Discoverability Tags</h2>
                        <p className="org-profile-section-desc">
                          Help students find your community via keyword search and interest filters.
                        </p>
                      </div>
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#991B1B',
                        background: 'rgba(153,27,27,0.08)',
                        border: '1px solid rgba(153,27,27,0.2)',
                        borderRadius: '99px',
                        padding: '0.2rem 0.6rem',
                      }}>
                        {community?.tags?.length ?? 0} tags
                      </span>
                    </div>

                    <div className="org-profile-tag-list" style={{ marginBottom: '1.25rem', minHeight: '3rem' }}>
                      {(community?.tags || []).map((tag) => (
                        <span key={tag} className="org-profile-tag-chip">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setConfirmDialog({ type: 'tag', tag })}
                            aria-label={`Remove tag ${tag}`}
                            title={`Remove #${tag}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                      {(community?.tags || []).length === 0 && (
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontSize: '0.8125rem',
                          color: '#9CA3AF',
                          fontStyle: 'italic',
                        }}>No tags added yet. Add keywords below.</span>
                      )}
                    </div>

                    <form className="flex items-center gap-2" onSubmit={handleAddTag}>
                      <input
                        className="org-form-input text-sm"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="e.g. open-source, hackathon, coding…"
                        maxLength={30}
                      />
                      <button
                        type="submit"
                        className="org-btn org-btn-secondary org-btn-sm"
                        disabled={tagBusy || !tagInput.trim()}
                        style={{ flexShrink: 0 }}
                      >
                        {tagBusy ? (
                          <CircleNotch size={13} className="animate-spin" />
                        ) : (
                          <Plus size={13} weight="bold" />
                        )}
                        <span>Add Tag</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ── Sub-tab: Social Links ── */}
              {profileSubTab === 'social' && (
                <div className="org-card org-card-pad">
                  <div className="org-profile-section-header">
                    <div>
                      <h2 className="org-profile-section-title">Social Links</h2>
                      <p className="org-profile-section-desc">Each platform saves independently.</p>
                    </div>
                  </div>
                  <div>
                    {SOCIAL_PLATFORMS.map(({ id, label, icon: Icon }) => {
                      const saved = socialLinkFor(id);
                      const busy = socialBusyPlatform === id;
                      return (
                        <div key={id} className="org-profile-social-row">
                          <div className="org-profile-social-icon-wrap">
                            <Icon size={16} />
                          </div>
                          <span className="org-profile-social-platform-label">{label}</span>
                          <div className="org-profile-social-input-wrap">
                            <input
                              className="org-form-input text-xs font-mono"
                              value={draftFor(id)}
                              onChange={(e) => setSocialDrafts((prev) => ({ ...prev, [id]: e.target.value }))}
                              placeholder={`${label} URL`}
                            />
                          </div>
                          <button
                            type="button"
                            className="org-btn org-btn-secondary org-btn-sm"
                            onClick={() => handleSaveSocialLink(id, label)}
                            disabled={busy || !draftFor(id).trim()}
                            style={{ flexShrink: 0 }}
                          >
                            {busy ? <CircleNotch size={13} className="animate-spin" /> : <Check size={13} />}
                            <span>Save</span>
                          </button>
                          {saved && (
                            <button
                              type="button"
                              className="org-icon-btn org-icon-btn--danger"
                              onClick={() => setConfirmDialog({ type: 'social', platform: id, label })}
                              disabled={busy || isConfirming}
                              title={`Remove ${label} link`}
                              style={{ flexShrink: 0 }}
                            >
                              <Trash size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Sub-tab: FAQs ── */}
              {profileSubTab === 'faqs' && (
                <div className="org-card org-card-pad">
                  <div className="org-profile-section-header">
                    <div>
                      <h2 className="org-profile-section-title">Frequently Asked Questions</h2>
                      <p className="org-profile-section-desc">
                        Answer common questions students ask before joining or applying.
                      </p>
                    </div>
                    {(community?.faqs || []).length > 0 && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: '#6B7280',
                        background: 'rgba(15,23,42,0.05)',
                        borderRadius: '99px',
                        padding: '0.2rem 0.6rem',
                      }}>
                        {community.faqs.length} FAQs
                      </span>
                    )}
                  </div>

                  {/* FAQ List */}
                  {(community?.faqs || []).length === 0 && (
                    <div style={{
                      padding: '2rem 0',
                      textAlign: 'center',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.875rem',
                      color: '#9CA3AF',
                    }}>
                      No FAQs yet. Add your first question below.
                    </div>
                  )}
                  {(community?.faqs || []).map((faq, idx) => (
                    <div key={faq._id} className="org-profile-faq-item">
                      {editingFaqId === faq._id ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input
                            className="org-form-input text-sm"
                            value={editFaq.question}
                            onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })}
                          />
                          <textarea
                            className="org-form-textarea text-sm"
                            rows={2}
                            value={editFaq.answer}
                            onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="org-btn org-btn-primary org-btn-sm"
                              onClick={() => handleSaveFaqEdit(faq._id)}
                              disabled={faqBusy}
                            >
                              <Check size={13} /> Save
                            </button>
                            <button
                              type="button"
                              className="org-btn org-btn-ghost org-btn-sm"
                              onClick={() => setEditingFaqId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="org-profile-faq-number">{idx + 1}</div>
                          <div className="org-profile-faq-content">
                            <p className="org-profile-faq-question">{faq.question}</p>
                            <p className="org-profile-faq-answer">{faq.answer}</p>
                          </div>
                          <div className="org-profile-faq-actions">
                            <button
                              type="button"
                              className="org-icon-btn"
                              onClick={() => startEditFaq(faq)}
                              title="Edit FAQ"
                            >
                              <PencilSimple size={14} />
                            </button>
                            <button
                              type="button"
                              className="org-icon-btn org-icon-btn--danger"
                              onClick={() => setConfirmDialog({ type: 'faq', id: faq._id, question: faq.question })}
                              disabled={faqBusy || isConfirming}
                              title="Remove FAQ"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {/* Add FAQ form */}
                  <form
                    className="space-y-2"
                    style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #D8D2C4' }}
                    onSubmit={handleAddFaq}
                  >
                    <input
                      className="org-form-input text-sm"
                      value={faqDraft.question}
                      onChange={(e) => setFaqDraft({ ...faqDraft, question: e.target.value })}
                      placeholder="Question…"
                      maxLength={200}
                    />
                    <textarea
                      className="org-form-textarea text-sm"
                      rows={2}
                      value={faqDraft.answer}
                      onChange={(e) => setFaqDraft({ ...faqDraft, answer: e.target.value })}
                      placeholder="Answer…"
                      maxLength={1000}
                    />
                    <button
                      type="submit"
                      className="org-btn org-btn-secondary org-btn-sm"
                      disabled={faqBusy || !faqDraft.question.trim() || !faqDraft.answer.trim()}
                    >
                      <Plus size={13} weight="bold" />
                      <span>Add FAQ</span>
                    </button>
                  </form>
                </div>
              )}

            </div>{/* end content panel */}
          </div>{/* end dashboard grid */}
        </div>
      )}

      {activeTab === 'security' && (
        <form className="org-card org-card-pad space-y-4" onSubmit={handlePasswordSave}>
          <div className="pb-3 border-b border-[#D8D2C4]">
            <h2 className="org-card-title text-base">Shared Login Credentials</h2>
            <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
              Update the shared password used by authorized roster members to access this account.
            </p>
          </div>

          <div className="org-form-group">
            <label className="org-form-label">Shared Login Email</label>
            <input
              className="org-form-input bg-gray-100/70 text-gray-700 font-mono cursor-not-allowed"
              value={community?.email || ''}
              disabled
            />
            <span className="org-form-hint">
              Used by all authorized committee members to sign in to the organizer portal.
            </span>
          </div>

          <div className="org-form-group">
            <label className="org-form-label">
              Current Password <span className="text-[#991B1B]">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrentPwd ? 'text' : 'password'}
                className="org-form-input font-mono text-sm pr-10"
                value={pwd.current}
                onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 transition-colors"
                onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                aria-label={showCurrentPwd ? 'Hide current password' : 'Show current password'}
              >
                {showCurrentPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="org-form-row">
            <div className="org-form-group">
              <label className="org-form-label">
                New Password <span className="text-[#991B1B]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNextPwd ? 'text' : 'password'}
                  className="org-form-input font-mono text-sm pr-10"
                  value={pwd.next}
                  onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 transition-colors"
                  onClick={() => setShowNextPwd(!showNextPwd)}
                  aria-label={showNextPwd ? 'Hide new password' : 'Show new password'}
                >
                  {showNextPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="org-form-group">
              <label className="org-form-label">
                Confirm New Password <span className="text-[#991B1B]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  className="org-form-input font-mono text-sm pr-10"
                  value={pwd.confirm}
                  onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 transition-colors"
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  aria-label={showConfirmPwd ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPwd ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {pwd.next && (
            <div className="org-pwd-strength-wrap">
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-gray-500">Password Strength:</span>
                <span style={{ color: strength.color }} className="font-bold">
                  {strength.label}
                </span>
              </div>
              <div className="org-pwd-strength-bar">
                <div
                  className="org-pwd-strength-fill"
                  style={{
                    width: `${(strength.score / 5) * 100}%`,
                    backgroundColor: strength.color,
                  }}
                />
              </div>
            </div>
          )}

          {pwdError && <p className="org-form-error font-mono text-xs">{pwdError}</p>}

          <div className="org-settings-note">
            <Info size={16} className="text-amber-600 flex-shrink-0" />
            <span>
              <strong>Not yet connected:</strong> shared-password rotation has no backend endpoint yet, so this form is
              still a preview and does not persist changes.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#D8D2C4]">
            <button type="submit" className="org-btn org-btn-primary ml-auto flex items-center gap-1.5">
              <Lock size={15} />
              <span>Update Shared Password</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'audit' && (
        <div className="org-card">
          <div className="org-card-header flex items-center justify-between">
            <div>
              <h2 className="org-card-title">Shared-Login Audit Trail</h2>
              <p className="text-xs text-gray-500 font-['Plus_Jakarta_Sans'] mt-0.5">
                Timestamped logins into {communityName}'s shared organiser account. Since these credentials are
                shared by several people, device/time tracking — not per-action attribution — is the mechanism that
                catches misuse.
              </p>
            </div>
            {auditFetched && (
              <span className="org-badge font-mono text-xs">
                {auditLogs.length} Logged Sessions
              </span>
            )}
          </div>

          {auditError && (
            <div className="p-4 border-b border-[#D8D2C4]">
              <div className="org-settings-note" style={{ color: '#991B1B' }}>
                <Warning size={15} className="flex-shrink-0" />
                <span>{auditError}</span>
              </div>
            </div>
          )}

          {auditLoading ? (
            <div className="p-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <CircleNotch size={16} className="animate-spin" />
              <span>Loading login history…</span>
            </div>
          ) : auditFetched && auditLogs.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No logins recorded yet.</div>
          ) : (
            <div className="org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th scope="col">Device / Browser</th>
                    <th scope="col">IP Address</th>
                    <th scope="col">Time Ago</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const device = parseUserAgent(log.userAgent);
                    return (
                      <tr key={log._id}>
                        <td className="org-table-muted">
                          <span className="inline-flex items-center gap-1.5 font-['Plus_Jakarta_Sans'] text-xs">
                            {device.isMobile ? (
                              <DeviceMobile size={15} className="text-blue-600" />
                            ) : (
                              <Desktop size={15} className="text-emerald-700" />
                            )}
                            {device.label}
                          </span>
                        </td>
                        <td className="font-mono text-xs text-gray-500">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="font-mono text-xs text-gray-500">
                          {timeAgo(log.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: LOGO CROP MODAL ── */}
      <AnimatePresence>
        {logoCropFile && (
          <ImageCropModal
            file={logoCropFile}
            title="Adjust Community Logo"
            saveLabel="Save Logo"
            shape="circle"
            viewportWidth={280}
            viewportHeight={280}
            outputWidth={512}
            outputHeight={512}
            onCancel={() => setLogoCropFile(null)}
            onConfirm={handleLogoCropConfirm}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL: BANNER CROP MODAL ── */}
      <AnimatePresence>
        {bannerCropFile && (
          <ImageCropModal
            file={bannerCropFile}
            title="Adjust Community Banner"
            saveLabel="Save Banner"
            shape="rect"
            viewportWidth={480}
            viewportHeight={160}
            outputWidth={1600}
            outputHeight={533}
            onCancel={() => setBannerCropFile(null)}
            onConfirm={handleBannerCropConfirm}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL: CONFIRM REMOVAL DIALOG ── */}
      <AnimatePresence>
        {confirmDialog && (
          <ConfirmDialog
            title={
              confirmDialog.type === 'logo'
                ? 'Remove Community Logo?'
                : confirmDialog.type === 'banner'
                  ? 'Remove Community Banner?'
                  : confirmDialog.type === 'tag'
                    ? `Remove tag #${confirmDialog.tag}?`
                    : confirmDialog.type === 'faq'
                      ? 'Delete FAQ?'
                      : `Remove ${confirmDialog.label} Link?`
            }
            message={
              confirmDialog.type === 'logo'
                ? 'Your community logo will revert to the default initials avatar. You can upload a new one anytime.'
                : confirmDialog.type === 'banner'
                  ? 'Your community banner will revert to the default gradient cover. You can upload a new one anytime.'
                  : confirmDialog.type === 'tag'
                    ? `Are you sure you want to remove the "#${confirmDialog.tag}" tag? It helps students discover your community on the feed.`
                    : confirmDialog.type === 'faq'
                      ? `"${confirmDialog.question}" will be permanently removed from your community profile FAQs. This cannot be undone.`
                      : `Are you sure you want to remove the ${confirmDialog.label} link from your public profile?`
            }
            confirmLabel={confirmDialog.type === 'faq' ? 'Delete FAQ' : 'Remove'}
            isConfirming={isConfirming}
            onCancel={() => setConfirmDialog(null)}
            onConfirm={handleConfirmAction}
          />
        )}
      </AnimatePresence>

      {/* ── Toast Feedback Alert ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            style={{
              position: 'fixed',
              bottom: '1.5rem',
              right: '1.5rem',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1.125rem',
              background: '#0F172A',
              color: '#F5F2EA',
              borderRadius: '6px',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.3)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 500,
              pointerEvents: 'none',
              maxWidth: 'calc(100vw - 3rem)',
            }}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {toast.type === 'error' ? (
              <XCircle size={17} weight="fill" style={{ color: '#EF4444', flexShrink: 0 }} />
            ) : toast.type === 'info' ? (
              <Info size={17} weight="fill" style={{ color: '#38BDF8', flexShrink: 0 }} />
            ) : (
              <CheckCircle size={17} weight="fill" style={{ color: '#4ADE80', flexShrink: 0 }} />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

