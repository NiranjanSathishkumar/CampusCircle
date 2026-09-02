/**
 * Branch and academic-year option sets for the signup form.
 */
// Mirrors backend/src/models/User.js's BRANCHES enum exactly — the value
// sent here is stored as-is (no code-to-name translation happens server
// side), so these two lists have to stay in sync by hand.
export const SIES_BRANCHES = [
  { id: 'Computer Engineering 1', name: 'Computer Engineering 1' },
  { id: 'Computer Engineering 2', name: 'Computer Engineering 2' },
  { id: 'Computer Engineering 3', name: 'Computer Engineering 3' },
  { id: 'Information Technology 1', name: 'Information Technology 1' },
  { id: 'Information Technology 2', name: 'Information Technology 2' },
  { id: 'AI & Data Science', name: 'AI & Data Science' },
  { id: 'AI & Machine Learning', name: 'AI & Machine Learning' },
  { id: 'CSE (IoT, Cyber Security, & Blockchain)', name: 'CSE (IoT, Cyber Security, & Blockchain)' },
];

export const ACADEMIC_YEARS = [
  { id: 'FE', label: 'First Year (FE)' },
  { id: 'SE', label: 'Second Year (SE)' },
  { id: 'TE', label: 'Third Year (TE)' },
  { id: 'BE', label: 'Final Year (BE)' },
];
