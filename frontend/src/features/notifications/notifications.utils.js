/**
 * notifications.utils.js — Maps a raw Notification doc (see backend
 * models/Notification.js + notification.service.js for the types that
 * get created) into the {category, title, desc, link} shape the navbar
 * bell dropdown renders. The backend stores no display copy — it's derived
 * here from `type` plus the populated `actor`/`target`.
 */
import { relativeTime } from '@/features/discover/discoverUtils';

function describe(n) {
  const target = n.target || {};
  const actor = n.actor;

  switch (n.type) {
    case 'community_post': {
      const community = target.community;
      return {
        category: 'communities',
        title: community?.name ? `New post in ${community.name}` : 'New community post',
        desc: target.title || '',
        link: target._id ? `/discover/posts/${target._id}` : '/discover',
      };
    }
    case 'community_event': {
      const community = target.community;
      return {
        category: 'events',
        title: community?.name ? `New event from ${community.name}` : 'New event',
        desc: target.title || '',
        link: target._id ? `/events/detail/${target._id}` : '/events',
      };
    }
    case 'community_recruitment': {
      const community = target.community;
      return {
        category: 'communities',
        title: community?.name ? `${community.name} is recruiting` : 'New recruitment drive',
        desc: target.title || '',
        link: community?._id ? `/communities/detail/${community._id}` : '/communities',
      };
    }
    case 'waitlist_promotion': {
      const event = target.event;
      return {
        category: 'events',
        title: "You're off the waitlist!",
        desc: event?.title ? `You're now confirmed for ${event.title}.` : "You're now confirmed for an event.",
        link: event?._id ? `/events/detail/${event._id}` : '/myevents',
      };
    }
    case 'role_promotion': {
      const community = target.community;
      return {
        category: 'communities',
        title: community?.name ? `New role in ${community.name}` : 'Your role changed',
        desc: target.label ? `You're now ${target.label}.` : '',
        link: community?._id ? `/communities/detail/${community._id}` : '/communities',
      };
    }
    case 'new_follower': {
      return {
        category: 'buddies',
        title: actor?.name ? `${actor.name} started following you` : 'You have a new follower',
        desc: 'View their profile.',
        link: actor?._id ? `/profile/${actor._id}` : '/buddies',
      };
    }
    case 'team_invite': {
      const event = target.event;
      return {
        category: 'events',
        title: actor?.name ? `${actor.name} invited you to a team` : "You've been invited to a team",
        desc: event?.title ? `Join their roster for ${event.title}.` : 'Respond from My Events.',
        link: '/myevents',
      };
    }
    case 'team_invite_accepted': {
      const event = target.event;
      return {
        category: 'events',
        title: actor?.name ? `${actor.name} accepted your team invite` : 'A teammate accepted your invite',
        desc: event?.title ? `They're on your roster for ${event.title}.` : '',
        link: '/myevents',
      };
    }
    case 'team_invite_declined': {
      const event = target.event;
      return {
        category: 'events',
        title: actor?.name ? `${actor.name} declined your team invite` : 'A teammate declined your invite',
        desc: event?.title ? `You can invite someone else for ${event.title}.` : '',
        link: '/myevents',
      };
    }
    case 'event_updated': {
      const community = target.community;
      return {
        category: 'events',
        title: target.title ? `${target.title} was updated` : 'An event you registered for was updated',
        desc: community?.name ? `${community.name} edited the event details.` : 'Check the event page for what changed.',
        link: target._id ? `/events/detail/${target._id}` : '/myevents',
      };
    }
    case 'event_reminder': {
      return {
        category: 'events',
        title: target.title ? `Coming up: ${target.title}` : 'An event you registered for is coming up',
        desc: target.eventDate ? `Starts ${new Date(target.eventDate).toLocaleString()}.` : 'Check My Events for details.',
        link: target._id ? `/events/detail/${target._id}` : '/myevents',
      };
    }
    default:
      return { category: 'system', title: 'Notification', desc: '', link: '/discover' };
  }
}

export function mapNotification(raw) {
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
