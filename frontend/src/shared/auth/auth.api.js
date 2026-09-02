import { apiFetch } from '@/shared/api/httpClient';

// Public — mounted at /api
export const checkEmailAvailability = (email) =>
  apiFetch(`/check-email?email=${encodeURIComponent(email)}`, { method: 'GET', auth: false });

// Student — mounted at /api
export const studentSignup = (data) => apiFetch('/signup', { method: 'POST', body: data, auth: false });
export const studentLogin = (data) => apiFetch('/login', { method: 'POST', body: data, auth: false });
export const studentRefresh = () => apiFetch('/refresh', { method: 'POST', auth: false });
export const studentLogout = () => apiFetch('/logout', { method: 'POST', role: 'student' });
export const getStudentProfile = () => apiFetch('/profile', { method: 'GET', role: 'student' });
export const updateStudentProfile = (data) => apiFetch('/profile', { method: 'PATCH', body: data, role: 'student' });

// Organizer — mounted at /api/organizer (auth) and /api/community (profile)
export const organizerLogin = (data) => apiFetch('/organizer/login', { method: 'POST', body: data, auth: false });
export const organizerRefresh = () => apiFetch('/organizer/refresh', { method: 'POST', auth: false });
export const organizerLogout = () => apiFetch('/organizer/logout', { method: 'POST', role: 'organizer' });
export const getCommunityProfile = () => apiFetch('/community', { method: 'GET', role: 'organizer' });

// Admin — mounted at /api/admin
export const adminLogin = (data) => apiFetch('/admin/login', { method: 'POST', body: data, auth: false });
export const adminRefresh = () => apiFetch('/admin/refresh', { method: 'POST', auth: false });
export const adminLogout = () => apiFetch('/admin/logout', { method: 'POST', role: 'admin' });
export const getAdminProfile = () => apiFetch('/admin/me', { method: 'GET', role: 'admin' });
