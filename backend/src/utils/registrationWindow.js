// When registration closes for an event.
//
// An explicit registrationDeadline wins; otherwise registration stays open
// until the event itself is over — eventEndDate for an event that spans more
// than one day, eventDate for one that doesn't.
//
// Shared so registerForEvent and the team-roster edits can't drift apart:
// they used to disagree about multi-day events (the roster path forgot
// eventEndDate), so a leader could be locked out of editing their team on
// day two of an event whose registration was still legitimately open.
const registrationDeadlineFor = (event) =>
    event.registrationDeadline || event.eventEndDate || event.eventDate;

const isRegistrationClosed = (event) => new Date() > registrationDeadlineFor(event);

module.exports = { registrationDeadlineFor, isRegistrationClosed };
