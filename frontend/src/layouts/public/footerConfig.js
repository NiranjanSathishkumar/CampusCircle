/**
 * footerConstants.js — Static data for CampusCircle Application & Landing footers
 */

import {
  LinkedinLogo,
  InstagramLogo,
  GithubLogo,
  YoutubeLogo
} from '@phosphor-icons/react';

export const QUICK_UTILITIES = [
  { label: 'Digital QR Pass', href: '#profile', desc: 'Closed-Campus Verification' },
  { label: 'Host an Event', href: '#access', desc: 'Club & Organiser Portal' },
  { label: 'SIES GST Main Website', href: 'https://siesgst.ac.in', target: '_blank', desc: 'Official Campus Portal' },
  { label: 'Academic Calendar', href: '#features', desc: 'Exams & Term Schedule' },
  { label: 'Help & Grievance Desk', href: '#support', desc: 'Student Support Cell' },
];

export const COUNCILS = [
  { label: 'Student Council (GST SC)', href: '#' },
  { label: 'IEEE SIESGST Chapter', href: '#' },
  { label: 'CSI SIESGST Branch', href: '#' },
  { label: 'ACM Student Chapter', href: '#' },
  { label: 'Cultural Council (Lakshya)', href: '#' },
];

export const DEPARTMENTS = [
  { code: 'CE', label: 'Computer Engineering' },
  { code: 'IT', label: 'Information Technology' },
  { code: 'EXTC', label: 'Electronics & Telecom' },
  { code: 'ECS', label: 'Electronics & Computer Sci' },
  { code: 'MECH', label: 'Mechanical Engineering' },
  { code: 'PPT', label: 'Printing & Packaging' },
  { code: 'AIDS', label: 'AI & Data Science' },
];

export const GOVERNANCE = [
  { label: 'Closed Campus Policy', href: '#closed-campus-policy' },
  { label: 'Code of Conduct', href: '#code-of-conduct' },
  { label: 'Student Data Privacy', href: '#student-data-privacy' },
  { label: 'Terms of Service', href: '#terms-of-service' },
  { label: 'Security & Domain Lock', href: '#security-domain-lock' },
];

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: LinkedinLogo },
  { label: 'Instagram', href: 'https://instagram.com', icon: InstagramLogo },
  { label: 'GitHub', href: 'https://github.com', icon: GithubLogo },
  { label: 'YouTube', href: 'https://youtube.com', icon: YoutubeLogo },
];
