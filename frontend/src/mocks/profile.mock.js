/**
 * profileData.js — CampusCircle Student Profile Data & Helpers
 *
 * Personal details, achievements, bookmarked events, followed clubs, and
 * network (followers/following) are all backend-driven now (see
 * features/profile/profile.api.js, features/events/events.api.js, and
 * features/follows/follows.api.js) — only BRANCH_OPTIONS below is still
 * needed, as the profile edit form's branch dropdown source.
 */

// Mirrors backend/src/models/User.js's BRANCHES enum exactly — the profile
// PATCH endpoint rejects any value outside this list.
export const BRANCH_OPTIONS = [
  'Computer Engineering 1',
  'Computer Engineering 2',
  'Computer Engineering 3',
  'Information Technology 1',
  'Information Technology 2',
  'AI & Data Science',
  'AI & Machine Learning',
  'CSE (IoT, Cyber Security, & Blockchain)',
];
