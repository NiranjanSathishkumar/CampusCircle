/**
 * ProfilePage.jsx — CampusCircle Student Profile Dashboard
 * Design: Operate mode · Warm institutional editorial
 * Palette: Parchment #F5F2EA · Ink #0F172A · Crimson #991B1B · Forest #1A3A2A
 * Type: Space Grotesk (display) · Plus Jakarta Sans (body) · JetBrains Mono (labels)
 * Dials: DESIGN_VARIANCE:6 / MOTION_INTENSITY:5 / VISUAL_DENSITY:6
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/layouts/public/Navbar';
import Footer from '@/layouts/public/Footer';
import {
  User,
  ShieldCheck,
  PencilSimple,
  Camera,
  GraduationCap,
  Sparkle,
  GridFour,
  List,
  Plus,
  Trash,
  CheckCircle,
  X,
  BookmarkSimple,
  UsersThree,
  UserPlus,
  MagnifyingGlass,
  ArrowSquareOut,
  Question,
  Warning,
  Check,
  House,
  CaretRight,
  UploadSimple,
  Link as LinkIcon,
  Eye,
  Buildings,
  LinkedinLogo,
  GithubLogo,
  InstagramLogo,
  DotsThreeVertical,
  Sliders,
  Briefcase,
} from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/AuthContext';
import { updateStudentProfile } from '@/shared/auth/auth.api';
import {
  uploadProfilePicture,
  removeProfilePicture,
  uploadProfileBanner,
  removeProfileBanner,
  getAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  uploadCertificate,
  removeCertificate,
  deleteAccount,
} from '@/features/profile/profile.api';
import {
  fetchFollowing,
  fetchFollowers,
  followUser,
  unfollowUser,
  unfollowCommunity,
} from '@/features/follows/follows.api';
import ImageCropModal from '@/features/profile/components/ImageCropModal';
import ConfirmDialog from '@/features/profile/components/ConfirmDialog';
import PublicProfileView from '@/features/profile/PublicProfileView';
import { listMyBookmarks, unbookmarkEvent } from '@/features/events/events.api';
import './profile.css';
import AchievementsTab from '@/features/profile/tabs/AchievementsTab';
import BookmarkedTab from '@/features/profile/tabs/BookmarkedTab';
import FollowedClubsTab from '@/features/profile/tabs/FollowedClubsTab';
import NetworkTab from '@/features/profile/tabs/NetworkTab';
import PersonalDetailsTab from '@/features/profile/tabs/PersonalDetailsTab';
import RecruitmentTab from '@/features/profile/tabs/RecruitmentTab';

/* ─────────────────────────────────────────────────────────────
   BACKEND <-> UI MAPPING HELPERS
   ───────────────────────────────────────────────────────────── */
function formatSocialUrl(url) {
  if (!url || !url.trim()) return '';
  let str = url.trim();
  if (!/^https?:\/\//i.test(str)) {
    str = `https://${str}`;
  }
  return str;
}

function isValidHttpUrl(string) {
  if (!string) return true;
  try {
    const parsed = new URL(string);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

// User.socialLinks is stored as [{platform, url}] (see backend/src/models/User.js);
// the form works with a flat {linkedin, github, instagram} object.
function socialLinksArrayToObject(arr) {
  const obj = {};
  (arr || []).forEach(({ platform, url }) => { obj[platform] = url; });
  return obj;
}

function socialLinksObjectToArray(obj) {
  return Object.entries(obj || {})
    .filter(([, url]) => url && url.trim())
    .map(([platform, url]) => ({ platform, url: formatSocialUrl(url) }));
}

// profilePicture/profileBanner are { filename, cloudinaryUrl, cloudinaryId } —
// filename holds the raw default asset URL until the student uploads their own.
function mediaUrl(media) {
  return media?.cloudinaryUrl || media?.filename || '';
}

function mapUserToProfileData(user) {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name || '',
    email: user.email || '',
    rollNo: user.rollNo || '',
    prnNo: user.prnNo || '',
    branch: user.branch || '',
    yearOfJoining: user.yearOfJoining || '',
    bio: user.bio || '',
    interestTags: user.interestTags || [],
    skills: user.skills || [],
    education: user.education || [],
    profilePicture: mediaUrl(user.profilePicture),
    profileBanner: mediaUrl(user.profileBanner),
    // Only a real upload has a cloudinaryUrl — the shared default asset
    // doesn't — so this is how "Remove" knows whether there's anything to
    // remove without hardcoding the default asset's URL here.
    // Backend virtuals (User.js) — checking cloudinaryUrl alone here missed
    // any avatar/banner set via filename only (e.g. seeded accounts with a
    // real photo URL but no Cloudinary upload), so this always read false
    // for those even though the picture shown was genuinely a custom one.
    hasCustomAvatar: Boolean(user.hasCustomAvatar),
    hasCustomBanner: Boolean(user.hasCustomBanner),
    socialLinks: socialLinksArrayToObject(user.socialLinks),
    // Community roles aren't sourced from a real endpoint yet — left empty
    // rather than showing stale/fake chips.
    activeCommunities: [],
    followerCount: user.followerCount || 0,
    followingCount: user.followingCount || 0,
    // Backend virtuals (User.js) — the single source of truth for academic standing.
    currentYear: user.currentYear,
    isEnrolled: user.isEnrolled,
  };
}

function mapAchievementToCert(a) {
  return {
    id: a._id,
    title: a.title,
    issuer: a.issuer || '',
    date: formatAchievementDate(a.dateEarned || a.createdAt),
    dateEarned: a.dateEarned ? a.dateEarned.slice(0, 10) : '',
    description: a.description || '',
    imageUrl: a.certificate?.cloudinaryUrl || '',
    verificationLink: a.verificationLink || '',
  };
}

function formatAchievementDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function mapClubFollowDoc(doc) {
  const c = typeof doc.following === 'object' && doc.following !== null ? doc.following : doc;
  const logoUrl = mediaUrl(c.logo) || (typeof c.logo === 'string' ? c.logo : '');
  return {
    id: String(c._id || c.id || ''),
    name: c.name || 'Campus Community',
    category: c.category || 'General',
    description: c.description || c.tagline || 'Student organization at SIES GST',
    followers: c.followerCount ?? 0,
    membersCount: c.membersCount ?? c.memberCount ?? 0,
    logoUrl,
    icon: logoUrl ? null : '🏢',
    iconBg: 'rgba(26, 58, 42, 0.12)',
    iconColor: '#1A3A2A',
  };
}

// Bookmark.js is events-only (see backend/src/models/Bookmark.js) — there is
// no backend or UI concept of bookmarking a Discover post, so `posts` has no
// real source and is left permanently empty rather than mock data pretending
// otherwise (see BookmarkedTab's own empty state for that sub-tab).
function mapBookmarkDoc(doc) {
  const ev = doc.event || {};
  const dateStr = ev.eventDate
    ? new Date(ev.eventDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  return {
    id: String(ev._id || ''),
    title: ev.title || 'Untitled event',
    category: ev.category || 'Event',
    meta: [dateStr, ev.venue].filter(Boolean).join(' · '),
    hostName: ev.community?.name || 'Campus Community',
    imageUrl: ev.bannerImage?.url || ev.bannerImage?.filename || '',
  };
}

function mapPeerFollowDoc(doc, myFollowingIdsSet, mode = 'following') {
  // If mapping followers: target is doc.follower (who follows me).
  // If mapping following: target is doc.following (whom I follow).
  const target = mode === 'follower' ? (doc.follower ?? doc) : (doc.following ?? doc);
  const u = typeof target === 'object' && target !== null ? target : {};

  const avatarUrl =
    mediaUrl(u.profilePicture) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'Student')}&background=1A3A2A&color=fff&size=256`;
  const id = String(u._id || u.id || (typeof target === 'string' ? target : ''));
  const isFollowingBack = myFollowingIdsSet ? myFollowingIdsSet.has(id) : false;

  return {
    id,
    name: u.name || 'Student',
    title: u.branch ? `Student · ${u.branch}` : 'Student · Campus Member',
    degreeBadge: u.branch ? `${u.branch}${u.yearOfJoining ? ` '` + String(u.yearOfJoining).slice(-2) : ''}` : '',
    avatarUrl,
    branch: u.branch || '',
    year: u.yearOfJoining ? `Joined ${u.yearOfJoining}` : '',
    isFollowingBack,
  };
}

/* ─────────────────────────────────────────────────────────────
   TOAST COMPONENT
   ───────────────────────────────────────────────────────────── */
function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1rem',
            background: '#0F172A',
            color: '#F5F2EA',
            borderRadius: '4px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '0.8125rem',
            fontWeight: 500,
            pointerEvents: 'none',
          }}
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <CheckCircle size={16} weight="fill" style={{ color: '#4ADE80', flexShrink: 0 }} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PROFILE PAGE COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function ProfilePage() {
  const { userId } = useParams();
  const { user, isLoggedIn, initializing, logout, setUser } = useAuth();
  const navigate = useNavigate();

  // /profile/:userId routes here for any student — only render the
  // full editable dashboard when it's the signed-in student's own id
  // (or no :userId at all, i.e. plain /profile); otherwise defer to the
  // read-only public view.
  const isOwnProfile = !userId || Boolean(user && String(user._id) === String(userId));

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState('personalDetails');

  /* ── Profile state — derived directly from the authenticated user ── */
  const profileData = useMemo(() => mapUserToProfileData(user), [user]);

  /* ── Edit mode state ── */
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  /* ── Media upload loading ── */
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [isRemovingBanner, setIsRemovingBanner] = useState(false);

  /* ── Crop modal: holds the picked File until the student confirms the crop ── */
  const [avatarCropFile, setAvatarCropFile] = useState(null);
  const [bannerCropFile, setBannerCropFile] = useState(null);

  /* ── Delete confirmation: null | {type:'avatar'} | {type:'banner'} | {type:'certificate', id, title} ── */
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [isConfirmingRemoval, setIsConfirmingRemoval] = useState(false);

  /* ── Tag / Skill input transient state ── */
  const [newTagInput, setNewTagInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newEduInput, setNewEduInput] = useState('');

  /* ── Achievements state — fetched from the backend on mount ── */
  const [certificates, setCertificates] = useState([]);

  const [certViewMode, setCertViewMode] = useState('grid'); // 'grid' | 'list'
  const [expandedCertificate, setExpandedCertificate] = useState(null);
  const [showUploadCertModal, setShowUploadCertModal] = useState(false);
  const [isUpdatingExistingCert, setIsUpdatingExistingCert] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const lightboxFileInputRef = useRef(null);

  /* ── Edit Achievement (metadata) state — lives inside the lightbox ── */
  const [isEditingAchievement, setIsEditingAchievement] = useState(false);
  const [editAchievementForm, setEditAchievementForm] = useState({
    title: '', issuer: '', dateEarned: '', description: '', verificationLink: '',
  });
  const [editAchievementError, setEditAchievementError] = useState('');
  const [isSavingAchievementEdit, setIsSavingAchievementEdit] = useState(false);

  /* ── Upload Certificate Form state ── */
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    dateEarned: '',
    description: '',
    verificationLink: '',
    file: null,
    imagePreview: '',
  });
  const [certFormError, setCertFormError] = useState('');
  const [isUploadingCert, setIsUploadingCert] = useState(false);

  /* ── Bookmarks state — events live from backend /api/events/bookmarks/mine;
     posts has no backing feature at all (see mapBookmarkDoc), so it stays [] ── */
  const [bookmarks, setBookmarks] = useState({ events: [], posts: [] });
  const [bookmarkSubTab, setBookmarkSubTab] = useState('events'); // 'events' | 'posts'

  /* ── Followed Clubs state — live from backend /api/follows ── */
  const [clubs, setClubs] = useState([]);
  const [clubsLoading, setClubsLoading] = useState(true);
  const [clubCategory, setClubCategory] = useState('All');
  const [clubSearch, setClubSearch] = useState('');

  /* ── Academic Network state — live from backend /api/follows ── */
  const [network, setNetwork] = useState({ followers: [], following: [] });
  const [networkLoading, setNetworkLoading] = useState(true);
  const [networkSubTab, setNetworkSubTab] = useState('followers'); // 'followers' | 'following'
  const [networkSearch, setNetworkSearch] = useState('');

  /* ── Danger zone modal ── */
  const [showDangerModal, setShowDangerModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Toast alert state ── */
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 3500);
  }, []);

  /* ── Fetch backend-backed profile tabs on mount / auth resolution ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;

    // 1. Achievements
    (async () => {
      try {
        const { achievements } = await getAchievements();
        if (!cancelled) setCertificates(achievements.map(mapAchievementToCert));
      } catch {
        // Background fetch
      }
    })();

    // 2. Bookmarked events
    (async () => {
      try {
        const { bookmarks: raw } = await listMyBookmarks({ limit: 100 });
        if (!cancelled) {
          setBookmarks({ events: (raw || []).map(mapBookmarkDoc), posts: [] });
        }
      } catch {
        // Background fetch
      }
    })();

    // 3. Followed clubs
    (async () => {
      setClubsLoading(true);
      try {
        const { following } = await fetchFollowing({ followingType: 'Community', limit: 100 });
        if (!cancelled) {
          setClubs((following || []).map(mapClubFollowDoc));
        }
      } catch {
        if (!cancelled) setClubs([]);
      } finally {
        if (!cancelled) setClubsLoading(false);
      }
    })();

    // 4. Network (followers & following peers)
    if (user?._id) {
      (async () => {
        setNetworkLoading(true);
        try {
          const [followersRes, followingRes] = await Promise.all([
            fetchFollowers('User', user._id, { limit: 100 }).catch(() => ({ followers: [] })),
            fetchFollowing({ followingType: 'User', limit: 100 }).catch(() => ({ following: [] })),
          ]);

          if (!cancelled) {
            const rawFollowers = followersRes.followers || [];
            const rawFollowing = followingRes.following || [];
            const myFollowingIds = new Set(
              rawFollowing
                .map((f) => {
                  const target = f.following;
                  return String(target?._id || target?.id || target || '');
                })
                .filter(Boolean)
            );

            setNetwork({
              followers: rawFollowers.map((f) => mapPeerFollowDoc(f, myFollowingIds, 'follower')),
              following: rawFollowing.map((f) => mapPeerFollowDoc(f, myFollowingIds, 'following')),
            });
          }
        } catch {
          if (!cancelled) setNetwork({ followers: [], following: [] });
        } finally {
          if (!cancelled) setNetworkLoading(false);
        }
      })();
    }

    return () => { cancelled = true; };
  }, [isLoggedIn, user?._id]);

  /* ── Keep the edit-mode draft in sync when profileData changes outside
     of editing (e.g. an avatar upload, or the initial load) ── */
  useEffect(() => {
    if (profileData && !isEditing) setFormData(profileData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  /* ── Academic Standing — derived from backend virtuals (currentYear/isEnrolled).
     isEnrolled is null (not false) until yearOfJoining is set, so that case
     reads as "Pending" instead of misreporting the student as an alumnus. ── */
  const standing = useMemo(() => {
    const isEnrolled = profileData?.isEnrolled;
    const isPending = isEnrolled == null;
    const isActive = Boolean(isEnrolled);
    return {
      standing: isPending ? 'Year —' : isActive ? `Year ${profileData?.currentYear ?? '—'}` : 'Alumni',
      status: isPending ? 'Pending' : isActive ? 'Active' : 'Graduated',
      isActive,
      isPending,
    };
  }, [profileData?.currentYear, profileData?.isEnrolled]);

  /* ── Profile completion computation. Mirrors the backend's isProfileComplete
     (User.js: email + rollNo + prnNo + branch + yearOfJoining) for the core
     identity checks, and uses hasCustomAvatar/hasCustomBanner rather than
     profilePicture/profileBanner — those two are always truthy (they hold
     the shared default asset URL until the student actually uploads one),
     so checking their mere presence always read as "done". ── */
  const completionData = useMemo(() => {
    const checks = [
      { id: 'rollNo', label: 'Roll Number', done: Boolean(profileData?.rollNo) },
      { id: 'prnNo', label: 'PRN Number', done: Boolean(profileData?.prnNo) },
      { id: 'branch', label: 'Branch', done: Boolean(profileData?.branch) },
      { id: 'yearOfJoining', label: 'Year of Joining', done: Boolean(profileData?.yearOfJoining) },
      { id: 'bio', label: 'Bio added', done: Boolean(profileData?.bio) },
      { id: 'avatar', label: 'Profile Avatar', done: Boolean(profileData?.hasCustomAvatar) },
      { id: 'banner', label: 'Profile Banner', done: Boolean(profileData?.hasCustomBanner) },
      { id: 'skills', label: 'Skills listed', done: Boolean(profileData?.skills?.length > 0) },
      { id: 'tags', label: 'Interest Tags', done: Boolean(profileData?.interestTags?.length > 0) },
      { id: 'socials', label: 'Social Links', done: Boolean(profileData?.socialLinks?.linkedin || profileData?.socialLinks?.github) },
    ];
    const completedCount = checks.filter(c => c.done).length;
    const percentage = Math.round((completedCount / checks.length) * 100);
    return { checks, percentage };
  }, [profileData]);

  /* ─────────────────────────────────────────────────────────────
     MEDIA UPLOAD HANDLERS
     Picking a file opens the crop modal (features/profile/components/
     ImageCropModal); the actual upload only fires once the student
     confirms a crop, using the cropped Blob it hands back.
     ───────────────────────────────────────────────────────────── */
  const IMAGE_TYPE_RE = /^image\/(jpeg|png|webp)$/;
  const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

  const validateImageFile = (file) => {
    if (!IMAGE_TYPE_RE.test(file.type)) {
      showToast('Please choose a JPEG, PNG, or WEBP image');
      return false;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      showToast('Image exceeds the 5 MB limit');
      return false;
    }
    return true;
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !validateImageFile(file)) return;
    setAvatarCropFile(file);
  };

  const handleBannerFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !validateImageFile(file)) return;
    setBannerCropFile(file);
  };

  const handleAvatarCropConfirm = async (blob) => {
    setIsUploadingAvatar(true);
    try {
      const { user: updated } = await uploadProfilePicture(blob);
      setUser(updated);
      showToast('Profile picture updated successfully');
      setAvatarCropFile(null);
    } catch (err) {
      showToast(err.message || 'Failed to update profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleBannerCropConfirm = async (blob) => {
    setIsUploadingBanner(true);
    try {
      const { user: updated } = await uploadProfileBanner(blob);
      setUser(updated);
      showToast('Profile banner updated successfully');
      setBannerCropFile(null);
    } catch (err) {
      showToast(err.message || 'Failed to update profile banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRequestRemoveAvatar = () => setConfirmDialog({ type: 'avatar' });
  const handleRequestRemoveBanner = () => setConfirmDialog({ type: 'banner' });

  const handleRequestDeleteCertificate = (certId, e) => {
    e?.stopPropagation();
    const cert = certificates.find(c => c.id === certId);
    setConfirmDialog({ type: 'certificate', id: certId, title: cert?.title || 'this certificate' });
  };

  // Single handler behind the ConfirmDialog below — dispatches on
  // confirmDialog.type so avatar/banner/certificate removal share one
  // confirmation UI instead of three near-identical ones.
  const handleConfirmRemoval = async () => {
    if (!confirmDialog) return;
    setIsConfirmingRemoval(true);
    try {
      if (confirmDialog.type === 'avatar') {
        setIsRemovingAvatar(true);
        const { profilePicture } = await removeProfilePicture();
        setUser(prev => ({ ...prev, profilePicture }));
        showToast('Profile picture removed');
      } else if (confirmDialog.type === 'banner') {
        setIsRemovingBanner(true);
        const { profileBanner } = await removeProfileBanner();
        setUser(prev => ({ ...prev, profileBanner }));
        showToast('Profile banner removed');
      } else if (confirmDialog.type === 'certificate') {
        await deleteAchievement(confirmDialog.id);
        setCertificates(prev => prev.filter(c => c.id !== confirmDialog.id));
        if (expandedCertificate?.id === confirmDialog.id) handleCloseLightbox();
        showToast('Certificate removed');
      }
      setConfirmDialog(null);
    } catch (err) {
      showToast(err.message || 'Failed to remove');
    } finally {
      setIsConfirmingRemoval(false);
      setIsRemovingAvatar(false);
      setIsRemovingBanner(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     PERSONAL DETAILS EDIT HANDLERS
     ───────────────────────────────────────────────────────────── */
  const handleStartEditing = () => {
    setFormData(profileData);
    setFormErrors({});
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setFormData(profileData);
    setFormErrors({});
    setIsEditing(false);
  };

  const handleFormChange = (field, val) => {
    if (field === 'rollNo' || field === 'prnNo') {
      val = val.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [field]: val }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSocialChange = (platform, val) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: val },
    }));
    if (formErrors[platform]) {
      setFormErrors(prev => ({ ...prev, [platform]: null }));
    }
  };

  /* Tag & Skill addition helpers */
  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && newTagInput.trim()) {
      e.preventDefault();
      const tag = newTagInput.trim().replace(/^#+/, '').toLowerCase();
      if (tag) {
        if (!formData.interestTags.includes(tag)) {
          setFormData(prev => ({ ...prev, interestTags: [...prev.interestTags, tag] }));
        }
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      interestTags: prev.interestTags.filter(t => t !== tag),
    }));
  };

  const handleAddSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && newSkillInput.trim()) {
      e.preventDefault();
      const skill = newSkillInput.trim();
      if (!formData.skills.includes(skill)) {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      }
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const handleAddEducation = (e) => {
    if (e.key === 'Enter' && newEduInput.trim()) {
      e.preventDefault();
      const edu = newEduInput.trim();
      setFormData(prev => ({ ...prev, education: [...prev.education, edu] }));
      setNewEduInput('');
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  /* Save Form Submission & Validation */
  const handleSaveProfile = async () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = 'Full Name is required';
    if (!formData.email?.trim()) errors.email = 'Student Email is required';
    if (!formData.branch?.trim()) errors.branch = 'Branch is required';

    // rollNo/prnNo are optional/sparse-unique on the backend (models/User.js)
    // — signup doesn't collect a PRN at all — so only validate format when
    // the student actually entered one, never presence.

    const currentYr = new Date().getFullYear();
    const joining = parseInt(formData.yearOfJoining, 10);
    if (!joining || joining < 2015 || joining > currentYr) {
      errors.yearOfJoining = `Year of Joining must be between 2015 and ${currentYr}`;
    }

    // Social Links URL validation
    const socialEntries = Object.entries(formData.socialLinks || {});
    for (const [platform, rawUrl] of socialEntries) {
      if (rawUrl && rawUrl.trim()) {
        const formatted = formatSocialUrl(rawUrl);
        if (!isValidHttpUrl(formatted)) {
          const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);
          errors[platform] = `Please enter a valid ${platformLabel} URL (e.g. https://${platform}.com/username)`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        rollNo: formData.rollNo.trim(),
        prnNo: formData.prnNo.trim(),
        branch: formData.branch,
        yearOfJoining: joining,
        bio: formData.bio || '',
        skills: formData.skills || [],
        education: formData.education || [],
        interestTags: formData.interestTags || [],
        socialLinks: socialLinksObjectToArray(formData.socialLinks),
      };

      const { user: updated } = await updateStudentProfile(payload);
      setUser(updated);
      setIsEditing(false);
      showToast('Personal details updated successfully!');
    } catch (err) {
      if (err.body?.errors && Array.isArray(err.body.errors)) {
        const mappedErrors = {};
        err.body.errors.forEach(({ field, message }) => {
          if (field.startsWith('socialLinks.')) {
            const match = field.match(/socialLinks\.(\d+)/);
            if (match) {
              const index = parseInt(match[1], 10);
              const platform = socialLinksObjectToArray(formData.socialLinks)[index]?.platform;
              if (platform) {
                mappedErrors[platform] = message;
              }
            }
          } else {
            mappedErrors[field] = message;
          }
        });
        if (Object.keys(mappedErrors).length > 0) {
          setFormErrors(mappedErrors);
          return;
        }
      }
      setFormErrors({ _global: err.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────
     CERTIFICATE / ACHIEVEMENTS HANDLERS
     ───────────────────────────────────────────────────────────── */
  const processCertFile = (file) => {
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      setCertFormError('Please select a valid PNG, JPG, WEBP, or PDF file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCertFormError('File size exceeds the 5 MB limit. Please select a smaller file.');
      return;
    }

    setCertFormError('');
    setCertForm(prev => ({ ...prev, file }));
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setCertForm(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setCertForm(prev => ({ ...prev, imagePreview: '' }));
    }
  };

  const handleCertFileSelect = (e) => {
    const file = e.target.files?.[0];
    processCertFile(file);
  };

  const handleCertDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleCertDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleCertDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processCertFile(file);
    }
  };

  const handleSaveCertificate = async () => {
    if (!certForm.title.trim()) {
      setCertFormError('Certificate title is required');
      return;
    }
    if (!certForm.issuer.trim()) {
      setCertFormError('Issuing organization is required');
      return;
    }

    setIsUploadingCert(true);
    let createdAchievement = null;
    try {
      const { achievement } = await createAchievement({
        title: certForm.title.trim(),
        issuer: certForm.issuer.trim(),
        description: certForm.description.trim(),
        dateEarned: certForm.dateEarned || undefined,
        verificationLink: certForm.verificationLink.trim() || undefined,
      });
      createdAchievement = achievement;

      let finalAchievement = achievement;
      if (certForm.file) {
        const { achievement: withCert } = await uploadCertificate(achievement._id, certForm.file);
        finalAchievement = withCert;
      }

      setCertificates(prev => [mapAchievementToCert(finalAchievement), ...prev]);
      setShowUploadCertModal(false);
      setCertForm({ title: '', issuer: '', dateEarned: '', description: '', verificationLink: '', file: null, imagePreview: '' });
      showToast('Certificate added successfully!');
    } catch (err) {
      // The achievement record itself may have already been created before
      // the certificate upload step failed — undo it so retrying doesn't
      // leave a duplicate/orphaned achievement behind.
      if (createdAchievement) {
        try { await deleteAchievement(createdAchievement._id); } catch { /* best-effort */ }
      }
      setCertFormError(err.message || 'Failed to save certificate');
    } finally {
      setIsUploadingCert(false);
    }
  };

  const handleUploadExistingCertFile = async (achievementId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5 MB limit');
      return;
    }
    setIsUpdatingExistingCert(true);
    try {
      const { achievement: updated } = await uploadCertificate(achievementId, file);
      const mapped = mapAchievementToCert(updated);
      setCertificates(prev => prev.map(c => c.id === achievementId ? mapped : c));
      setExpandedCertificate(mapped);
      showToast('Certificate document uploaded successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to upload certificate document');
    } finally {
      setIsUpdatingExistingCert(false);
    }
  };

  const handleRemoveExistingCertFile = async (achievementId) => {
    setIsUpdatingExistingCert(true);
    try {
      const { achievement: updated } = await removeCertificate(achievementId);
      const mapped = mapAchievementToCert(updated);
      setCertificates(prev => prev.map(c => c.id === achievementId ? mapped : c));
      setExpandedCertificate(mapped);
      showToast('Certificate document removed');
    } catch (err) {
      showToast(err.message || 'Failed to remove certificate document');
    } finally {
      setIsUpdatingExistingCert(false);
    }
  };

  const handleCloseLightbox = () => {
    setExpandedCertificate(null);
    setIsEditingAchievement(false);
    setEditAchievementError('');
  };

  // Opens the lightbox already in edit mode — used both by the edit icon on
  // each achievement card and by the "Edit Details" button inside the
  // lightbox itself.
  const handleEditCertificate = (cert, e) => {
    e?.stopPropagation();
    setExpandedCertificate(cert);
    setEditAchievementForm({
      title: cert.title || '',
      issuer: cert.issuer || '',
      dateEarned: cert.dateEarned || '',
      description: cert.description || '',
      verificationLink: cert.verificationLink || '',
    });
    setEditAchievementError('');
    setIsEditingAchievement(true);
  };

  const handleCancelEditAchievement = () => {
    setIsEditingAchievement(false);
    setEditAchievementError('');
  };

  const handleSaveEditAchievement = async () => {
    if (!expandedCertificate) return;
    if (!editAchievementForm.title.trim()) {
      setEditAchievementError('Certificate title is required');
      return;
    }
    if (!editAchievementForm.issuer.trim()) {
      setEditAchievementError('Issuing organization is required');
      return;
    }

    setIsSavingAchievementEdit(true);
    try {
      const { achievement: updated } = await updateAchievement(expandedCertificate.id, {
        title: editAchievementForm.title.trim(),
        issuer: editAchievementForm.issuer.trim(),
        description: editAchievementForm.description.trim(),
        dateEarned: editAchievementForm.dateEarned || '',
        verificationLink: editAchievementForm.verificationLink.trim() || '',
      });
      const mapped = mapAchievementToCert(updated);
      setCertificates(prev => prev.map(c => c.id === mapped.id ? mapped : c));
      setExpandedCertificate(mapped);
      setIsEditingAchievement(false);
      showToast('Achievement updated successfully!');
    } catch (err) {
      setEditAchievementError(err.message || 'Failed to update achievement');
    } finally {
      setIsSavingAchievementEdit(false);
    }
  };


  /* ─────────────────────────────────────────────────────────────
     BOOKMARKS HANDLERS
     ───────────────────────────────────────────────────────────── */
  const handleRemoveBookmarkEvent = async (eventId) => {
    const target = bookmarks.events.find(e => e.id === eventId);

    // Optimistic update
    setBookmarks(prev => ({ ...prev, events: prev.events.filter(e => e.id !== eventId) }));
    try {
      await unbookmarkEvent(eventId);
      showToast('Event removed from bookmarks');
    } catch (err) {
      if (target) setBookmarks(prev => ({ ...prev, events: [target, ...prev.events] }));
      showToast(err.message || 'Failed to remove bookmark');
    }
  };

  // Posts have no bookmarking feature to remove from — see mapBookmarkDoc.
  const handleRemoveBookmarkPost = () => {};

  /* ─────────────────────────────────────────────────────────────
     FOLLOWED CLUBS HANDLERS
     ───────────────────────────────────────────────────────────── */
  const handleUnfollowClub = async (clubId) => {
    const target = clubs.find(c => c.id === clubId);
    const clubName = target?.name || 'Club';

    // Optimistic update
    setClubs(prev => prev.filter(c => c.id !== clubId));
    try {
      await unfollowCommunity(clubId);
      showToast(`Unfollowed ${clubName}`);
    } catch (err) {
      if (target) setClubs(prev => [...prev, target]);
      showToast(err.message || `Failed to unfollow ${clubName}`);
    }
  };

  const filteredClubs = useMemo(() => {
    return clubs.filter(c => {
      const catMatch = clubCategory === 'All' || c.category.toLowerCase() === clubCategory.toLowerCase();
      const qMatch = !clubSearch.trim() ||
        c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
        c.category.toLowerCase().includes(clubSearch.toLowerCase());
      return catMatch && qMatch;
    });
  }, [clubs, clubCategory, clubSearch]);

  /* ─────────────────────────────────────────────────────────────
     ACADEMIC NETWORK HANDLERS
     ───────────────────────────────────────────────────────────── */
  const handleToggleFollowBack = async (peerId) => {
    const targetFollower = network.followers.find(f => f.id === peerId);
    const wasFollowingBack = Boolean(targetFollower?.isFollowingBack);
    const name = targetFollower?.name || 'Peer';

    // Optimistic toggle
    setNetwork(prev => {
      const nextFollowers = prev.followers.map(f =>
        f.id === peerId ? { ...f, isFollowingBack: !wasFollowingBack } : f
      );
      let nextFollowing = prev.following;
      if (wasFollowingBack) {
        nextFollowing = prev.following.filter(p => p.id !== peerId);
      } else if (targetFollower && !prev.following.some(p => p.id === peerId)) {
        nextFollowing = [...prev.following, { ...targetFollower, isFollowingBack: true }];
      }
      return { followers: nextFollowers, following: nextFollowing };
    });

    try {
      if (wasFollowingBack) {
        await unfollowUser(peerId);
        showToast(`Unfollowed ${name}`);
      } else {
        await followUser(peerId);
        showToast(`Now following ${name}!`);
      }
    } catch (err) {
      // Rollback
      setNetwork(prev => {
        const nextFollowers = prev.followers.map(f =>
          f.id === peerId ? { ...f, isFollowingBack: wasFollowingBack } : f
        );
        let nextFollowing = prev.following;
        if (wasFollowingBack && targetFollower) {
          nextFollowing = [...prev.following, targetFollower];
        } else {
          nextFollowing = prev.following.filter(p => p.id !== peerId);
        }
        return { followers: nextFollowers, following: nextFollowing };
      });
      showToast(err.message || 'Failed to update follow status');
    }
  };

  const handleUnfollowPeer = async (peerId) => {
    const targetPeer = network.following.find(p => p.id === peerId);
    const wasInFollowers = network.followers.some(f => f.id === peerId);
    const name = targetPeer?.name || 'Peer';

    // Optimistic removal
    setNetwork(prev => ({
      followers: prev.followers.map(f =>
        f.id === peerId ? { ...f, isFollowingBack: false } : f
      ),
      following: prev.following.filter(p => p.id !== peerId),
    }));

    try {
      await unfollowUser(peerId);
      showToast(`Unfollowed ${name}`);
    } catch (err) {
      setNetwork(prev => ({
        followers: wasInFollowers
          ? prev.followers.map(f => (f.id === peerId ? { ...f, isFollowingBack: true } : f))
          : prev.followers,
        following: targetPeer && !prev.following.some(p => p.id === peerId)
          ? [...prev.following, targetPeer]
          : prev.following,
      }));
      showToast(err.message || `Failed to unfollow ${name}`);
    }
  };

  const filteredNetworkList = useMemo(() => {
    const list = networkSubTab === 'followers' ? network.followers : network.following;
    if (!networkSearch.trim()) return list;
    const q = networkSearch.toLowerCase();
    return list.filter(u => u.name.toLowerCase().includes(q) || u.branch?.toLowerCase().includes(q));
  }, [network, networkSubTab, networkSearch]);

  /* ─────────────────────────────────────────────────────────────
     DANGER ZONE DELETION HANDLER
     ───────────────────────────────────────────────────────────── */
  const handleCloseDangerModal = () => {
    setShowDangerModal(false);
    setDeletePassword('');
    setDeleteError('');
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');
    try {
      // Deleted while still authenticated — logout() below clears the
      // access token the DELETE request needs.
      await deleteAccount(deletePassword);
      setShowDangerModal(false);
      localStorage.removeItem('cc_profile_bookmarks');
      localStorage.removeItem('cc_profile_clubs');
      localStorage.removeItem('cc_profile_network');
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA]">
        <span className="w-6 h-6 border-2 border-[#991B1B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOwnProfile) {
    return <PublicProfileView studentId={userId} />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />

      <div className="profile-page" style={{ paddingTop: 64 }}>
        <div className="profile-page-inner">

          {/* ── Breadcrumb ── */}
          <div className="profile-breadcrumb" aria-label="Breadcrumb navigation">
            <Link to="/discover" className="profile-breadcrumb-link">Home</Link>
            <CaretRight size={10} className="profile-breadcrumb-sep" aria-hidden="true" />
            <span className="profile-breadcrumb-current">Academic Dashboard</span>
          </div>

          {/* ── Profile Summary / Hero Card ── */}
          <div className="profile-hero-card">
            {/* Banner Area */}
            <div className="profile-banner-wrap">
              <img
                src={profileData.profileBanner || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80'}
                alt="Profile banner"
                className="profile-banner-img"
              />
              <div className="profile-banner-overlay" aria-hidden="true" />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                <label className="profile-banner-upload-btn" style={{ position: 'static' }} title="Change profile banner">
                  <Camera size={14} />
                  {isUploadingBanner ? 'Uploading…' : 'Edit Banner'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerFileSelect} disabled={isUploadingBanner || isRemovingBanner} />
                </label>
                {profileData.hasCustomBanner && (
                  <button
                    type="button"
                    className="profile-banner-upload-btn"
                    style={{ position: 'static' }}
                    onClick={handleRequestRemoveBanner}
                    disabled={isRemovingBanner || isUploadingBanner}
                    title="Remove profile banner"
                  >
                    <Trash size={14} />
                    {isRemovingBanner ? 'Removing…' : 'Remove'}
                  </button>
                )}
              </div>
            </div>

            {/* Header Body */}
            <div className="profile-summary-body">
              <div className="profile-avatar-row">
                {/* Avatar with Upload Overlay */}
                <div className="profile-avatar-wrap">
                  <img
                    src={profileData.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={profileData.name}
                    className="profile-avatar-img"
                  />
                  <label className="profile-avatar-upload-overlay" title="Change profile picture">
                    <Camera size={20} />
                    <span>{isUploadingAvatar ? 'Uploading…' : 'Change'}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarFileSelect} disabled={isUploadingAvatar || isRemovingAvatar} />
                  </label>
                  {profileData.hasCustomAvatar && (
                    <button
                      type="button"
                      className="profile-avatar-remove-btn"
                      onClick={handleRequestRemoveAvatar}
                      disabled={isRemovingAvatar || isUploadingAvatar}
                      title="Remove profile picture"
                    >
                      <Trash size={13} />
                    </button>
                  )}
                </div>

                {/* Primary Action Button */}
                <div className="profile-summary-actions">
                  {!isEditing ? (
                    <button className="btn-primary" onClick={handleStartEditing} style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                      <PencilSimple size={14} />
                      Edit Personal Details
                    </button>
                  ) : (
                    <button className="btn-secondary" onClick={handleCancelEditing} style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
                      Cancel Editing
                    </button>
                  )}
                </div>
              </div>

              {/* Student Identity Overview */}
              <div className="profile-identity-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <h1 className="profile-student-name">{profileData.name}</h1>
                  <span className="stamp-verified" style={{ padding: '0.25rem 0.625rem', fontSize: '0.625rem' }}>
                    <ShieldCheck size={13} weight="fill" />
                    Verified Student
                  </span>
                  <span className={`standing-badge ${standing.isPending ? 'pending' : standing.isActive ? 'active' : 'alumni'}`}>
                    <span className="standing-dot" />
                    {standing.standing} · {standing.status}
                  </span>
                </div>

                <p className="profile-student-sub">
                  <GraduationCap size={16} style={{ color: '#1A3A2A' }} />
                  <span>{profileData.branch}</span>
                  <span style={{ color: '#D8D2C4' }}>•</span>
                  <span>Joined {profileData.yearOfJoining}</span>
                  <span style={{ color: '#D8D2C4' }}>•</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#6B7280' }}>
                    Roll: {profileData.rollNo}
                  </span>
                </p>

                {/* Community Roles */}
                {profileData.activeCommunities?.length > 0 && (
                  <div className="profile-community-roles" aria-label="Active community roles">
                    {profileData.activeCommunities.map(c => (
                      <span key={c.id} className="profile-role-chip">
                        <span>{c.icon}</span>
                        {c.name} — <strong>{c.role}</strong>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stat Counters */}
              <div className="profile-stats-bar">
                <div className="profile-stat-item" onClick={() => setActiveTab('achievements')}>
                  <span className="profile-stat-val">{certificates.length}</span>
                  <span className="profile-stat-lbl">Achievements</span>
                </div>
                <div className="profile-stat-item" onClick={() => setActiveTab('bookmarked')}>
                  <span className="profile-stat-val">{bookmarks.events.length + bookmarks.posts.length}</span>
                  <span className="profile-stat-lbl">Bookmarks</span>
                </div>
                <div className="profile-stat-item" onClick={() => setActiveTab('followedClubs')}>
                  <span className="profile-stat-val">{clubs.length}</span>
                  <span className="profile-stat-lbl">Clubs</span>
                </div>
                <div className="profile-stat-item" onClick={() => setActiveTab('network')}>
                  <span className="profile-stat-val">{network.followers.length}</span>
                  <span className="profile-stat-lbl">Followers</span>
                </div>
                <div className="profile-stat-item" onClick={() => setActiveTab('network')}>
                  <span className="profile-stat-val">{network.following.length}</span>
                  <span className="profile-stat-lbl">Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Dashboard Layout: Sidebar Tabs + Content Panel ── */}
          <div className="profile-dashboard-grid">

            {/* Sidebar Navigation */}
            <div className="profile-tab-sidebar">
              <nav className="profile-tab-rail" aria-label="Profile dashboard navigation">
                <button
                  className={`profile-tab-btn ${activeTab === 'personalDetails' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personalDetails')}
                >
                  <span className="profile-tab-label">
                    <User size={16} />
                    Personal Details
                  </span>
                </button>

                <button
                  className={`profile-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
                  onClick={() => setActiveTab('achievements')}
                >
                  <span className="profile-tab-label">
                    <Sparkle size={16} />
                    Achievements
                  </span>
                  <span className="profile-tab-badge">{certificates.length}</span>
                </button>

                <button
                  className={`profile-tab-btn ${activeTab === 'bookmarked' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookmarked')}
                >
                  <span className="profile-tab-label">
                    <BookmarkSimple size={16} />
                    Bookmarks
                  </span>
                  <span className="profile-tab-badge">{bookmarks.events.length + bookmarks.posts.length}</span>
                </button>

                <button
                  className={`profile-tab-btn ${activeTab === 'followedClubs' ? 'active' : ''}`}
                  onClick={() => setActiveTab('followedClubs')}
                >
                  <span className="profile-tab-label">
                    <UsersThree size={16} />
                    Clubs
                  </span>
                  <span className="profile-tab-badge">{clubs.length}</span>
                </button>

                <button
                  className={`profile-tab-btn ${activeTab === 'network' ? 'active' : ''}`}
                  onClick={() => setActiveTab('network')}
                >
                  <span className="profile-tab-label">
                    <UserPlus size={16} />
                    Network
                  </span>
                  <span className="profile-tab-badge">{network.followers.length + network.following.length}</span>
                </button>

                <button
                  className={`profile-tab-btn ${activeTab === 'recruitment' ? 'active' : ''}`}
                  onClick={() => setActiveTab('recruitment')}
                >
                  <span className="profile-tab-label">
                    <Briefcase size={16} />
                    Recruitment
                  </span>
                </button>
              </nav>

              {/* Profile Completion Callout Widget */}
              <div className="profile-completion-card">
                <div className="profile-completion-header">
                  <span className="profile-completion-title">Profile Completion</span>
                  <span className="profile-completion-pct">{completionData.percentage}%</span>
                </div>
                <div className="profile-completion-bar-wrap">
                  <div className="profile-completion-bar" style={{ width: `${completionData.percentage}%` }} />
                </div>
                <ul className="profile-completion-checklist">
                  {completionData.checks.map(item => (
                    <li key={item.id} className={`profile-completion-item ${item.done ? 'done' : ''}`}>
                      {item.done ? <CheckCircle size={13} weight="fill" /> : <X size={13} style={{ color: '#9CA3AF' }} />}
                      {item.label}
                    </li>
                  ))}
                </ul>
                <a
                  href="#help"
                  onClick={(e) => { e.preventDefault(); showToast('CampusCircle Help Center: contact support@siesgst.ac.in'); }}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#991B1B',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '0.25rem',
                  }}
                >
                  <Question size={14} />
                  Help Center Access
                </a>
              </div>
            </div>

            {/* Active Content Panel */}
            <div className="profile-content-panel">

              {/* ─────────────────────────────────────────────────────────────
                 TAB 1: PERSONAL DETAILS (VIEW & EDIT MODE)
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === 'personalDetails' && (
                <PersonalDetailsTab
                  formData={formData}
                  formErrors={formErrors}
                  handleAddEducation={handleAddEducation}
                  handleAddSkill={handleAddSkill}
                  handleAddTag={handleAddTag}
                  handleCancelEditing={handleCancelEditing}
                  handleFormChange={handleFormChange}
                  handleRemoveEducation={handleRemoveEducation}
                  handleRemoveSkill={handleRemoveSkill}
                  handleRemoveTag={handleRemoveTag}
                  handleSaveProfile={handleSaveProfile}
                  handleSocialChange={handleSocialChange}
                  handleStartEditing={handleStartEditing}
                  isEditing={isEditing}
                  isSaving={isSaving}
                  newEduInput={newEduInput}
                  newSkillInput={newSkillInput}
                  newTagInput={newTagInput}
                  profileData={profileData}
                  setNewEduInput={setNewEduInput}
                  setNewSkillInput={setNewSkillInput}
                  setNewTagInput={setNewTagInput}
                  setShowDangerModal={setShowDangerModal}
                  standing={standing}
                />
              )}

              {/* ─────────────────────────────────────────────────────────────
                 TAB 2: ACHIEVEMENTS & CERTIFICATES
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === 'achievements' && (
                <AchievementsTab
                  certViewMode={certViewMode}
                  certificates={certificates}
                  handleDeleteCertificate={handleRequestDeleteCertificate}
                  handleEditCertificate={handleEditCertificate}
                  setCertViewMode={setCertViewMode}
                  setExpandedCertificate={setExpandedCertificate}
                  setShowUploadCertModal={setShowUploadCertModal}
                />
              )}

              {/* ─────────────────────────────────────────────────────────────
                 TAB 3: BOOKMARKS (EVENTS & POSTS)
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === 'bookmarked' && (
                <BookmarkedTab
                  bookmarkSubTab={bookmarkSubTab}
                  bookmarks={bookmarks}
                  handleRemoveBookmarkEvent={handleRemoveBookmarkEvent}
                  handleRemoveBookmarkPost={handleRemoveBookmarkPost}
                  setBookmarkSubTab={setBookmarkSubTab}
                />
              )}

              {/* ─────────────────────────────────────────────────────────────
                 TAB 4: FOLLOWED CLUBS
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === 'followedClubs' && (
                <FollowedClubsTab
                  clubCategory={clubCategory}
                  clubSearch={clubSearch}
                  clubs={clubs}
                  filteredClubs={filteredClubs}
                  handleUnfollowClub={handleUnfollowClub}
                  setClubCategory={setClubCategory}
                  setClubSearch={setClubSearch}
                  showToast={showToast}
                  loading={clubsLoading}
                />
              )}

              {/* ─────────────────────────────────────────────────────────────
                 TAB 5: ACADEMIC NETWORK (FOLLOWERS & FOLLOWING)
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === 'network' && (
                <NetworkTab
                  filteredNetworkList={filteredNetworkList}
                  handleToggleFollowBack={handleToggleFollowBack}
                  handleUnfollowPeer={handleUnfollowPeer}
                  network={network}
                  networkSearch={networkSearch}
                  networkSubTab={networkSubTab}
                  setNetworkSearch={setNetworkSearch}
                  setNetworkSubTab={setNetworkSubTab}
                  loading={networkLoading}
                />
              )}

              {/* ─────────────────────────────────────────────────────────────
                 TAB 6: RECRUITMENT (APPLICATIONS & MEMBERSHIPS)
                 ───────────────────────────────────────────────────────────── */}
              {activeTab === 'recruitment' && <RecruitmentTab />}

            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 1: UPLOAD CERTIFICATE DIALOG
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showUploadCertModal && (
          <motion.div
            className="cert-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowUploadCertModal(false); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cert-upload-dialog-title"
          >
            <motion.div
              className="cert-modal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="cert-modal-header">
                <div>
                  <h2 className="cert-modal-title" id="cert-upload-dialog-title">
                    <Sparkle size={18} style={{ color: '#991B1B' }} />
                    Upload Verified Achievement
                  </h2>
                  <p style={{ margin: '0.125rem 0 0', fontSize: '0.75rem', color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Add credentials, hackathon honors, or workshop certificates to your portfolio.
                  </p>
                </div>
                <button className="cert-modal-close" onClick={() => setShowUploadCertModal(false)} aria-label="Close dialog">
                  <X size={15} />
                </button>
              </div>

              <div className="cert-modal-body">
                {certFormError && (
                  <div className="events-conflict-notice" role="alert">
                    <Warning size={16} className="events-conflict-icon" />
                    <p className="events-conflict-text">{certFormError}</p>
                  </div>
                )}

                {/* Image / Document Picker */}
                <div className="profile-form-group">
                  <label className="profile-form-label">Certificate Document / Proof (Max 5 MB)</label>
                  {!certForm.file ? (
                    <label
                      className={`cert-dropzone ${isDraggingFile ? 'dragging' : ''}`}
                      onDragOver={handleCertDragOver}
                      onDragLeave={handleCertDragLeave}
                      onDrop={handleCertDrop}
                    >
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={handleCertFileSelect}
                        style={{ display: 'none' }}
                      />
                      <div className="cert-dropzone-icon-wrap">
                        <UploadSimple size={22} weight="bold" />
                      </div>
                      <span className="cert-dropzone-title">
                        {isDraggingFile ? 'Drop certificate here' : 'Click to select or drag & drop certificate'}
                      </span>
                      <span className="cert-dropzone-desc">
                        Official certificates, prize badges, or credentials in high resolution
                      </span>
                      <div className="cert-dropzone-tags">
                        <span className="cert-dropzone-tag">PNG</span>
                        <span className="cert-dropzone-tag">JPG</span>
                        <span className="cert-dropzone-tag">WEBP</span>
                        <span className="cert-dropzone-tag">PDF</span>
                      </div>
                    </label>
                  ) : (
                    <div className="cert-dropzone-preview">
                      <div className="cert-dropzone-preview-header">
                        <div className="cert-dropzone-file-badge">
                          <CheckCircle size={14} weight="fill" style={{ color: '#1A3A2A' }} />
                          <span>{certForm.file?.name}</span>
                          <span className="cert-dropzone-filesize">
                            ({(certForm.file?.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          className="cert-dropzone-remove-btn"
                          onClick={() => setCertForm(prev => ({ ...prev, file: null, imagePreview: '' }))}
                        >
                          <X size={13} /> Remove
                        </button>
                      </div>

                      {certForm.imagePreview && certForm.file?.type?.startsWith('image/') && (
                        <div className="cert-dropzone-preview-img-wrap">
                          <img src={certForm.imagePreview} alt="Preview" className="cert-dropzone-preview-img" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Achievement / Certificate Title *</label>
                  <input
                    type="text"
                    className="profile-form-input"
                    placeholder="e.g. HackCampus 2026 Winner · 1st Place"
                    value={certForm.title}
                    onChange={e => setCertForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="cert-form-row">
                  <div className="profile-form-group">
                    <label className="profile-form-label">Issuing Organization *</label>
                    <input
                      type="text"
                      className="profile-form-input"
                      placeholder="e.g. SIES GST Student Council"
                      value={certForm.issuer}
                      onChange={e => setCertForm(prev => ({ ...prev, issuer: e.target.value }))}
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">Issue Date</label>
                    <input
                      type="date"
                      className="profile-form-input"
                      max={new Date().toISOString().slice(0, 10)}
                      value={certForm.dateEarned}
                      onChange={e => setCertForm(prev => ({ ...prev, dateEarned: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Verification URL / Credential Link</label>
                  <input
                    type="url"
                    className="profile-form-input"
                    placeholder="https://example.com/verify/credential-id"
                    value={certForm.verificationLink}
                    onChange={e => setCertForm(prev => ({ ...prev, verificationLink: e.target.value }))}
                  />
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label">Description / Summary</label>
                  <textarea
                    className="profile-form-textarea"
                    rows={3}
                    placeholder="Describe your achievement, skills showcased, competition tracks, or credential details…"
                    value={certForm.description}
                    onChange={e => setCertForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>

              <div className="cert-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowUploadCertModal(false)}
                  style={{ fontSize: '0.8125rem' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveCertificate}
                  disabled={isUploadingCert}
                  style={{ fontSize: '0.8125rem' }}
                >
                  <Sparkle size={14} />
                  {isUploadingCert ? 'Posting Achievement…' : 'Post Achievement'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 2: CERTIFICATE LIGHTBOX
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {expandedCertificate && (
          <motion.div
            className="cert-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseLightbox}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="cert-lightbox-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ position: 'relative', minHeight: 220, maxHeight: 380, background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {expandedCertificate.imageUrl ? (
                  expandedCertificate.imageUrl.toLowerCase().endsWith('.pdf') ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#F5F2EA' }}>
                      <UploadSimple size={40} style={{ color: '#E4405F', marginBottom: 8 }} />
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9375rem', fontWeight: 600, color: '#F5F2EA', margin: '0 0 0.5rem' }}>
                        PDF Certificate Attached
                      </p>
                      <a
                        href={expandedCertificate.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={{ fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                      >
                        Open PDF Document <ArrowSquareOut size={14} />
                      </a>
                    </div>
                  ) : (
                    <img src={expandedCertificate.imageUrl} alt={expandedCertificate.title} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: 380 }} />
                  )
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#F5F2EA' }}>
                    <Sparkle size={36} style={{ color: 'rgba(245,242,234,0.4)', marginBottom: 8 }} />
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#9CA3AF', margin: '0 0 1rem' }}>
                      No certificate document attached yet
                    </p>
                    <button
                      className="btn-primary"
                      onClick={() => lightboxFileInputRef.current?.click()}
                      disabled={isUpdatingExistingCert}
                      style={{ fontSize: '0.8125rem', margin: '0 auto' }}
                    >
                      <UploadSimple size={15} />
                      {isUpdatingExistingCert ? 'Uploading…' : 'Upload Certificate File'}
                    </button>
                  </div>
                )}
                <button
                  onClick={handleCloseLightbox}
                  style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(15,23,42,0.7)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Hidden file input for uploading/replacing certificate directly on expanded achievement */}
              <input
                type="file"
                ref={lightboxFileInputRef}
                accept="image/jpeg,image/png,image/webp,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file && expandedCertificate) {
                    handleUploadExistingCertFile(expandedCertificate.id, file);
                  }
                }}
              />

              <div style={{ padding: '1.5rem' }}>
                {isEditingAchievement ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {editAchievementError && (
                      <div className="events-conflict-notice" role="alert">
                        <Warning size={16} className="events-conflict-icon" />
                        <p className="events-conflict-text">{editAchievementError}</p>
                      </div>
                    )}
                    <div className="profile-form-group">
                      <label className="profile-form-label">Achievement / Certificate Title *</label>
                      <input
                        type="text"
                        className="profile-form-input"
                        value={editAchievementForm.title}
                        onChange={e => setEditAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="cert-form-row">
                      <div className="profile-form-group">
                        <label className="profile-form-label">Issuing Organization *</label>
                        <input
                          type="text"
                          className="profile-form-input"
                          value={editAchievementForm.issuer}
                          onChange={e => setEditAchievementForm(prev => ({ ...prev, issuer: e.target.value }))}
                        />
                      </div>
                      <div className="profile-form-group">
                        <label className="profile-form-label">Issue Date</label>
                        <input
                          type="date"
                          className="profile-form-input"
                          max={new Date().toISOString().slice(0, 10)}
                          value={editAchievementForm.dateEarned}
                          onChange={e => setEditAchievementForm(prev => ({ ...prev, dateEarned: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Verification URL / Credential Link</label>
                      <input
                        type="url"
                        className="profile-form-input"
                        value={editAchievementForm.verificationLink}
                        onChange={e => setEditAchievementForm(prev => ({ ...prev, verificationLink: e.target.value }))}
                      />
                    </div>
                    <div className="profile-form-group">
                      <label className="profile-form-label">Description / Summary</label>
                      <textarea
                        className="profile-form-textarea"
                        rows={3}
                        value={editAchievementForm.description}
                        onChange={e => setEditAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleCancelEditAchievement}
                        disabled={isSavingAchievementEdit}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleSaveEditAchievement}
                        disabled={isSavingAchievementEdit}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        {isSavingAchievementEdit ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                      {expandedCertificate.title}
                    </h2>
                    <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', fontWeight: 600, color: '#991B1B', margin: '0 0 0.5rem' }}>
                      {expandedCertificate.issuer} {expandedCertificate.date ? `· ${expandedCertificate.date}` : ''}
                    </p>
                    {expandedCertificate.description && (
                      <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.875rem', color: '#374151', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
                        {expandedCertificate.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #D8D2C4' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {expandedCertificate.verificationLink && (
                          <a
                            href={expandedCertificate.verificationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary"
                            style={{ fontSize: '0.8125rem' }}
                          >
                            Official Verification Link <ArrowSquareOut size={14} />
                          </a>
                        )}
                        <button
                          className="btn-secondary"
                          onClick={() => handleEditCertificate(expandedCertificate)}
                          style={{ fontSize: '0.8125rem' }}
                        >
                          <PencilSimple size={14} />
                          Edit Details
                        </button>
                        <button
                          className="btn-secondary"
                          onClick={() => lightboxFileInputRef.current?.click()}
                          disabled={isUpdatingExistingCert}
                          style={{ fontSize: '0.8125rem' }}
                        >
                          <UploadSimple size={14} />
                          {expandedCertificate.imageUrl ? (isUpdatingExistingCert ? 'Updating…' : 'Replace File') : (isUpdatingExistingCert ? 'Uploading…' : 'Attach File')}
                        </button>
                        {expandedCertificate.imageUrl && (
                          <button
                            className="btn-secondary"
                            onClick={() => handleRemoveExistingCertFile(expandedCertificate.id)}
                            disabled={isUpdatingExistingCert}
                            style={{ fontSize: '0.8125rem', color: '#991B1B' }}
                          >
                            <Trash size={14} />
                            Remove File
                          </button>
                        )}
                      </div>

                      <button
                        className="btn-danger"
                        onClick={(e) => handleRequestDeleteCertificate(expandedCertificate.id, e)}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        Delete Achievement
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 3: DANGER ZONE ACCOUNT DELETION CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showDangerModal && (
          <motion.div
            className="events-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDangerModal}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="events-dialog"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="events-dialog-header">
                <h2 className="events-dialog-title" style={{ color: '#991B1B' }}>Confirm Account Deletion</h2>
                <button className="events-dialog-close" onClick={handleCloseDangerModal}><X size={15} /></button>
              </div>
              <div className="events-dialog-body">
                <div className="events-conflict-notice" style={{ background: 'rgba(153,27,27,0.08)', borderColor: 'rgba(153,27,27,0.25)' }}>
                  <Warning size={20} style={{ color: '#991B1B', flexShrink: 0, marginTop: 2 }} />
                  <p className="events-conflict-text" style={{ color: '#991B1B' }}>
                    This action is <strong>irreversible</strong>. Deleting your account will cancel your event registrations, remove your follows, memberships, achievements, and uploaded media, and permanently erase your academic profile from CampusCircle.
                  </p>
                </div>
                <div className="profile-form-group" style={{ marginTop: '0.875rem' }}>
                  <label className="profile-form-label">Confirm your password *</label>
                  <input
                    type="password"
                    className="profile-form-input"
                    placeholder="Enter your current password"
                    value={deletePassword}
                    onChange={e => { setDeletePassword(e.target.value); setDeleteError(''); }}
                  />
                  {deleteError && <span style={{ color: '#991B1B', fontSize: '0.75rem' }}>{deleteError}</span>}
                </div>
              </div>
              <div className="events-dialog-footer">
                <button className="events-dialog-cancel" onClick={handleCloseDangerModal}>Cancel</button>
                <button className="btn-danger" onClick={handleConfirmDeleteAccount} disabled={isDeleting} style={{ flex: 1 }}>
                  {isDeleting ? 'Deleting…' : 'Yes, Delete My Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 4 & 5: AVATAR / BANNER CROP
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {avatarCropFile && (
          <ImageCropModal
            file={avatarCropFile}
            title="Adjust Profile Picture"
            saveLabel="Save Photo"
            shape="circle"
            viewportWidth={280}
            viewportHeight={280}
            outputWidth={512}
            outputHeight={512}
            onCancel={() => setAvatarCropFile(null)}
            onConfirm={handleAvatarCropConfirm}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bannerCropFile && (
          <ImageCropModal
            file={bannerCropFile}
            title="Adjust Profile Banner"
            saveLabel="Save Banner"
            shape="rect"
            viewportWidth={480}
            viewportHeight={148}
            outputWidth={1600}
            outputHeight={493}
            onCancel={() => setBannerCropFile(null)}
            onConfirm={handleBannerCropConfirm}
          />
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 6: REMOVE AVATAR / BANNER / DELETE CERTIFICATE CONFIRMATION
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDialog && (
          <ConfirmDialog
            title={
              confirmDialog.type === 'avatar' ? 'Remove Profile Picture?'
                : confirmDialog.type === 'banner' ? 'Remove Profile Banner?'
                  : 'Delete Certificate?'
            }
            message={
              confirmDialog.type === 'avatar'
                ? 'Your profile picture will revert to the default avatar. You can upload a new one anytime.'
                : confirmDialog.type === 'banner'
                  ? 'Your profile banner will revert to the default banner. You can upload a new one anytime.'
                  : `"${confirmDialog.title}" will be permanently removed from your achievements, along with its uploaded certificate file. This can't be undone.`
            }
            confirmLabel={confirmDialog.type === 'certificate' ? 'Delete Certificate' : 'Remove'}
            isConfirming={isConfirmingRemoval}
            onCancel={() => setConfirmDialog(null)}
            onConfirm={handleConfirmRemoval}
          />
        )}
      </AnimatePresence>

      {/* Toast Alert Container */}
      <Toast message={toastMsg} visible={toastVisible} />
      <Footer compact />
    </>
  );
}
