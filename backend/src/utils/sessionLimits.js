// Cap on concurrent refresh-token sessions (devices/browsers) kept per
// account, keyed by role. Exceeding the cap on login evicts the oldest
// session first. Organizers get a higher ceiling since a community account
// is commonly shared by several members logged in at once.
module.exports = {
    student: 3,
    organizer: 10,
    admin: 3,
};
