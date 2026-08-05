export function getEventStatus(rawDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(rawDate);
  eventDate.setHours(0, 0, 0, 0);

  const diff = eventDate - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: "Completed", type: "completed" };
  if (days === 0) return { label: "Today!", type: "today" };
  if (days === 1) return { label: "Tomorrow", type: "tomorrow" };
  return { label: `In ${days} days`, type: "upcoming" };
}

export function getCountdownText(rawDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(rawDate);
  eventDate.setHours(0, 0, 0, 0);

  const diff = eventDate - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return { text: "Event Completed", urgent: false, completed: true };
  if (days === 0) return { text: "Happening Today!", urgent: true, completed: false };
  if (days === 1) return { text: "Starts Tomorrow!", urgent: true, completed: false };
  if (days <= 3) return { text: `${days} days left`, urgent: true, completed: false };
  return { text: `${days} days to go`, urgent: false, completed: false };
}
