/**
 * organizerNotifications.utils.js — Maps a raw Notification doc (recipient
 * is this organizer's Community — see backend models/Notification.js +
 * notification.service.js's "Organizer-facing notifications" section) into
 * the {category, title, desc, link} shape the topbar bell dropdown renders.
 * The backend stores no display copy — it's derived here from `type` plus
 * the populated `actor`/`target`.
 */
import { relativeTime } from '@/features/discover/discoverUtils';

function describe(n) {
  const target = n.target || {};
  const actor = n.actor;

  switch (n.type) {
    case 'event_registration': {
      const event = target.event;
      return {
        category: 'registration',
        title: actor?.name ? `${actor.name} registered for your event` : 'New event registration',
        desc: event?.title ? `They signed up for ${event.title}.` : 'A student registered for one of your events.',
        link: event?._id ? `/organizer/events/${event._id}` : '/organizer/events',
      };
    }
    case 'payment_proof_received': {
      const event = target.event;
      return {
        category: 'payment',
        title: actor?.name ? `Payment proof from ${actor.name}` : 'New payment proof submitted',
        desc: event?.title ? `Payment proof submitted for ${event.title}. Verification required.` : 'A student submitted payment proof for verification.',
        link: event?._id ? `/organizer/events/${event._id}?tab=payments` : '/organizer/events',
      };
    }
    case 'recruitment_application': {
      const recruitment = target.recruitment;
      return {
        category: 'recruitment',
        title: recruitment?.title ? `New applicant for ${recruitment.title}` : 'New recruitment application',
        desc: actor?.name ? `${actor.name} submitted an application.` : 'Review it in your recruitment drive.',
        link: recruitment?._id ? `/organizer/recruitment/${recruitment._id}` : '/organizer/recruitment',
      };
    }
    case 'organizer_activated': {
      return {
        category: 'system',
        title: 'Your account was activated',
        desc: 'An administrator reactivated your organizer account.',
        link: '/organizer/settings',
      };
    }
    case 'organizer_deactivated': {
      return {
        category: 'system',
        title: 'Your account was deactivated',
        desc: 'An administrator deactivated your organizer account.',
        link: '/organizer/settings',
      };
    }
    default:
      return { category: 'system', title: 'Notification', desc: '', link: '/organizer/dashboard' };
  }
}

export function mapOrganizerNotification(raw) {
  const { category, title, desc, link } = describe(raw);
  return {
    id: raw._id,
    category,
    title,
    desc,
    link,
    unread: !raw.isRead,
    time: relativeTime(new Date(raw.createdAt)),
  };
}
