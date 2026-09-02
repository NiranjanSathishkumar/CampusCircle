/**
 * roster.api.js — Core team management for the organizer's own community.
 * Add/update-role/remove are mounted at /api/community/core-team (see
 * community.api.js). Member display data (name, branch, email, avatar, ...)
 * isn't stored on the core team record itself — it's just { user, role } —
 * so each member is enriched by looking their student id up via
 * /api/profile/lookup (mounted in the students feature, requireAuth only —
 * usable by any authenticated role, organizer included). That's the same
 * endpoint AddMemberModal uses to preview a student before adding them, so
 * using it here too keeps a member's data identical whether it was just
 * added this session or loaded fresh on a page reload.
 *
 * getStudentPublicProfile (the privacy allow-list without email/rollNo/phone)
 * is kept for contexts without an existing organizer relationship to the
 * student - it's intentionally not used for the roster's own members.
 */
import { apiFetch } from '@/shared/api/httpClient';

export {
  addCoreTeamMember,
  updateCoreTeamMemberRole,
  removeCoreTeamMember,
} from '@/portal/organizer/settings/community.api';

export const getStudentPublicProfile = (studentId) =>
  apiFetch(`/profile/${studentId}`, { method: 'GET', role: 'organizer' });

export const lookupStudent = ({ email, studentId }) => {
  const params = new URLSearchParams();
  if (email) params.set('email', email.trim());
  if (studentId) params.set('studentId', studentId.trim());
  return apiFetch(`/profile/lookup?${params.toString()}`, { method: 'GET', role: 'organizer' });
};
