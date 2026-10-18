# CampusCircle — Backend Technical Overview & Architecture Reference

> **Target Directory:** `/backend`  
> **System:** CampusCircle API & Data Tier  
> **Framework:** Express 5.2.1 on Node.js with Mongoose 9.9.1 / MongoDB 6.0+

---

## 1. Quick Architectural Summary

The CampusCircle backend is structured around a **feature-sliced, role-segregated RESTful API** serving three user tiers:
1. **Student** (`User` model, prefix: `/api/profile`, `/api/feed`, `/api/events`, `/api/buddies`, `/api/recruitment`, `/api/follows`)
2. **Community Organizer** (`Community` model, prefix: `/api/community`, `/api/events`, `/api/feed`, `/api/recruitment`)
3. **Institutional Administrator** (`Admin` model, prefix: `/api/admin`)

Public endpoints for authentication are unified under `/api` (`/api/login`, `/api/signup`, `/api/refresh`, `/api/organizer/login`, `/api/admin/login`), with public discovery for communities under `/api/communities`.

---

## 2. Server Initialization & Background Jobs (`server.js`)

At boot, `server.js` establishes the database connection and registers three recurring cron sweepers before binding to `PORT`:

```javascript
async function startServer() {
    await connectDB();
    startAutoDeleteContentJob();    // Hourly content cleanup
    startEventReminderJob();        // 15-minute event notification sweeper
    startExpireReservedSlotsJob();   // 2-minute slot reservation expiration sweeper
    app.listen(port, () => console.log(`Server listening on Port: ${port}`));
}
```

### Background Jobs Breakdown:
1. **Content Auto-Deletion (`jobs/autoDeleteContent.job.js`)**:
   - **Interval**: Hourly (`60 * 60 * 1000` ms).
   - **Post Sweeper**: Hard-deletes posts where `expiresAt <= new Date()`. Cascades deletion to Cloudinary media assets, flat comments, likes, and notifications via `deletePostCascade`.
   - **Event & Recruitment Sweeper**: Soft-deletes events and recruitment drives (`isActive: false`) to preserve historical registrations, payment logs, and applicant records.
2. **Event Reminders Engine (`jobs/eventReminder.job.js`)**:
   - **Interval**: 15 minutes (`15 * 60 * 1000` ms).
   - **Windows**: `2d` (48h-24h before event) and `1d` (24h-0h before event).
   - **Fan-out**: Queries published active events in those windows and dispatches `event_reminder` notifications to all confirmed leaders and accepted team members. Tracks keys in `event.remindersSent`. Rescheduling an event automatically clears this array so reminders re-fire for the new date.
3. **Slot Reservation Timeout Sweeper (`jobs/expireReservedSlots.job.js`)**:
   - **Interval**: 2 minutes (`2 * 60 * 1000` ms).
   - **Logic**: Queries registrations where `status: "reserved"`, `paymentStatus: { $in: ["pending", "rejected"] }`, and `slotExpiresAt <= new Date()`. Automatically cancels the registration, frees the slot from `confirmedRegistrationIds`, and promotes the next waitlisted student.

---

## 3. Authentication & Session Security Architecture

### Role-Partitioned Cookies & Token Rotation (`utils/refreshAuth.js`)
- **Cookie Names**: `refreshToken_student`, `refreshToken_organizer`, `refreshToken_admin`.
- **Security Flags**: `httpOnly: true`, `secure: production`, `sameSite: production ? "none" : "lax"`, `maxAge: 7 days`.
- **Clear Cookie Bug Prevention**: Strips `maxAge` on `clearCookie` to prevent browsers from interpreting `Max-Age` over `Expires` and resurrecting dead sessions.
- **Positional MongoDB Rotation**:
  ```javascript
  const account = await Model.findOneAndUpdate(
      { _id: decoded.id, refreshTokens: token },
      { $set: { "refreshTokens.$": newRefreshToken } },
      { returnDocument: "after" }
  );
  ```
  Guarantees atomic, race-condition-free rotation.
- **Concurrent Device Limits (`utils/sessionLimits.js`)**:
  - Student: 3 concurrent devices.
  - Organizer: 10 concurrent devices (supports shared club committee logins).
  - Admin: 3 concurrent devices.
  Oldest sessions are evicted FIFO via `{ $push: { refreshTokens: { $each: [token], $slice: -limit } } }`.

### Cross-Role Email Collision Arbitrator (`models/EmailRegistry.js` & `utils/ensureEmailUnique.js`)
MongoDB unique indexes cannot enforce uniqueness across different collections. CampusCircle uses `EmailRegistry`:
- `email`: unique, lowercase.
- `role`: enum (`student`, `organizer`, `admin`).
- Registration atomically claims the email via `EmailRegistry.create({ email, role })`.
- Collisions throw `11000` immediately. If subsequent profile creation fails, `releaseEmail(email)` deletes the reservation.

---

## 4. Key Business Logic Implementations

### Atomic Capacity Concurrency Gate (`features/events/registrations.controller.js`)
```javascript
const reserved = await Event.findOneAndUpdate(
    { _id: event._id, $expr: { $lt: [{ $size: "$confirmedRegistrationIds" }, "$capacity"] } },
    { $push: { confirmedRegistrationIds: registrationId } },
    { new: true }
);
```
- Completely prevents race conditions and overbooking.
- Over-capacity attempts transition to `status: "waitlisted"` automatically if `event.allowWaitlist` is true.

### Waitlist Promotion Engine (`cancelRegistrationCore`)
When a confirmed registration is cancelled:
1. Atomically marks status `cancelled` (`status: { $ne: "cancelled" }`).
2. Finds the oldest waitlist entry (`status: "waitlisted"`, sorted by `createdAt: 1`).
3. Promotes that registration to `confirmed` (or `reserved` if paid), pushes it into `confirmedRegistrationIds`, pulls the cancelled registration out, and dispatches a `waitlist_promotion` or `payment_required` notification.

### Manual UPI Payment Verification Flow
1. Paid event registrations start as `status: "reserved"`, `paymentStatus: "pending"`, with `slotExpiresAt: now + 30 minutes`.
2. Student submits screenshot via `/payment-proof` $\rightarrow$ `paymentStatus: "proof_submitted"`.
3. Organizer verifies via `/verify-payment`:
   - **Confirm**: Sets `paymentStatus: "confirmed"`, `status: "confirmed"`, generates 16-byte `qrToken`, and sends `notifyPaymentConfirmed`.
   - **Reject (cancel: false)**: Extends slot by 24 hours (`slotExpiresAt: now + 24 hours`) and sends rejection reason.
   - **Reject (cancel: true)**: Releases slot and promotes oldest waitlist candidate.

### QR Attendance Gate Scanner (`features/events/checkin.controller.js`)
- Resolves `qrToken` across both `Registration` (leaders/solo) and `TeamMember` (teammates).
- Validates:
  - Event matching.
  - Team member status is `"accepted"`.
  - Registration status is strictly `"confirmed"`.
  - Payment status is strictly `"confirmed"`, `"paid"`, or `"not_required"`.
- Idempotent: Subsequent scans return `{ alreadyCheckedIn: true, checkedInAt }`.

---

## 5. Input Validation & Express 5 Compatibility (`middleware/validate.js`)

- Uses Joi schemas with `stripUnknown: true` to prevent mass-assignment vulnerabilities.
- **Express 5 Fix**: Express 5 makes `req.query` a getter-only property. CampusCircle redefines the property descriptor via `Object.defineProperty(req, "query", { value, configurable: true, enumerable: true })`, ensuring type-coerced and sanitized query parameters are not silently lost.

---

## 6. Integration Test Suite (`tests/`)

Tests are run using Node.js's native test runner (`node --test --test-concurrency=1 tests/**/*.test.js`):
- `01_auth.test.js`: Signup, login, invalid credentials, rate limiting, token refresh, multi-device session eviction.
- `02_profiles_and_communities.test.js`: Profile CRUD, avatar uploads, achievements, club creation, deactivation.
- `03_social_and_feed.test.js`: Posts, media attachments, comments, likes counter synchronization.
- `04_events_and_registrations.test.js`: Atomic capacity gating, waitlisting, team rosters, cancellations.
- `05_recruitment.test.js`: Recruitment drives, applications, 1-click member selection and promotion.
- `06_notifications_and_edge_cases.test.js`: Fan-out notifications, TTL indexes, edge case handling.
- `07_manual_payment_flow.test.js`: End-to-end UPI proof upload, organizer review, approval ticket issuance, rejection extensions.

---

For complete user-facing feature descriptions and frontend implementation details, refer to [FINAL_PROJECT_DOCUMENTATION.md](file:///d:/CampusCircle/FINAL_PROJECT_DOCUMENTATION.md).
