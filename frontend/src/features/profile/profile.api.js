/**
 * profile.api.js — Student's own profile: avatar/banner media, achievements,
 * and account deletion. Mounted at /api/profile (see backend routes.js).
 *
 * Plain profile PATCH (name/branch/bio/etc.) lives in shared/auth/auth.api.js
 * as updateStudentProfile — reused directly rather than duplicated here.
 * Every call here is student-authenticated, so `role: 'student'` is passed
 * throughout (see httpClient.js — required for the token to attach and for
 * a 401 to trigger that role's silent refresh).
 */
import { apiFetch } from '@/shared/api/httpClient';

// `file` may be a plain File (unused today) or the cropped Blob ImageCropModal
// hands back — a Blob has no filename of its own, so it's supplied explicitly
// here rather than left for the browser to default to a bare "blob".
export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append('profile_picture', file, 'avatar.jpg');
  return apiFetch('/profile/picture', { method: 'PUT', body: formData, role: 'student' });
};

export const removeProfilePicture = () => apiFetch('/profile/picture', { method: 'DELETE', role: 'student' });

export const uploadProfileBanner = (file) => {
  const formData = new FormData();
  formData.append('profile_banner', file, 'banner.jpg');
  return apiFetch('/profile/banner', { method: 'PUT', body: formData, role: 'student' });
};

export const removeProfileBanner = () => apiFetch('/profile/banner', { method: 'DELETE', role: 'student' });

export const getAchievements = () => apiFetch('/profile/achievements', { method: 'GET', role: 'student' });

export const createAchievement = (data) =>
  apiFetch('/profile/achievements', { method: 'POST', body: data, role: 'student' });

export const updateAchievement = (achievementId, data) =>
  apiFetch(`/profile/achievements/${achievementId}`, { method: 'PATCH', body: data, role: 'student' });

export const deleteAchievement = (achievementId) =>
  apiFetch(`/profile/achievements/${achievementId}`, { method: 'DELETE', role: 'student' });

export const uploadCertificate = (achievementId, file) => {
  const formData = new FormData();
  formData.append('certificate', file);
  return apiFetch(`/profile/achievements/${achievementId}/certificate`, { method: 'PUT', body: formData, role: 'student' });
};

export const removeCertificate = (achievementId) =>
  apiFetch(`/profile/achievements/${achievementId}/certificate`, { method: 'DELETE', role: 'student' });

export const deleteAccount = (password) =>
  apiFetch('/profile', { method: 'DELETE', body: { password }, role: 'student' });

// Any other student's public-facing profile (name/branch/achievements/etc,
// no private fields) — GET /api/profile/:studentId, registered last on the
// backend router so it only catches ids that aren't one of the routes above.
export const getStudentPublicProfile = (studentId) =>
  apiFetch(`/profile/${studentId}`, { method: 'GET', role: 'student' });
