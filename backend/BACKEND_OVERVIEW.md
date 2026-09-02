# CampusCircle Backend — Overview

Node.js + Express + MongoDB (Mongoose) backend. This document describes what has
been built so far: entry point, auth, RBAC, controllers, routes, middleware, and
utils. It also lists the data models that exist in `src/models/` but are **not yet**
wired up to any controller/route (future work).

---

## 1. Project Layout & Entry Point

```
backend/
  server.js                 # boot: connect DB, then listen
  scripts/seed.js           # standalone dev seeder
  src/
    app.js                  # builds + exports the Express app (no listen)
    routes.js               # mounts every feature router
    config/                 # env, db, cloudinary, paths
    models/                 # shared Mongoose layer, cross-referenced by every feature
    middleware/             # auth, upload, syncToCloudinary, errorHandler
    features/               # one folder per domain: routes + controller(s) + validators
      auth/  students/  communities/  admin/          # built
      feed/  events/  recruitment/  follows/          # scaffolded, not built
      notifications/  payments/                       # scaffolded, not built
    services/               # notification + audit fan-out, scaffolded
    validators/             # Joi fragments shared across features
    utils/
  tests/
  uploads/                  # multer disk staging before Cloudinary sync
```

Code is grouped by **feature**, not by role. An upcoming domain like events is
driven by both organizers (create/manage) and students (register), so it gets a
single `features/events/` folder instead of being split across role controllers.
Models stay central rather than living inside features, because they are heavily
cross-referenced: `Notification` is polymorphic, and `answer.schema` is shared
by `Registration` and `CommunityApplication`.

**Entry point:**

- `src/app.js` builds the Express app and exports it **without listening**, so
  tests can drive it directly (e.g. with supertest).
- Global middleware: `cors` (credentials on, origin from `CLIENT_URL`),
  `express.json()`, `cookie-parser`, `express.urlencoded()`.
- `src/routes.js` mounts the feature routers:
  - `/api` → `src/features/auth/auth.routes.js`
  - `/api/admin` → `src/features/admin/admin.routes.js`
  - `/api/profile` → `src/features/students/students.routes.js`
  - `/api/community` → `src/features/communities/communities.routes.js`

  Auth mounts first on purpose — it declares exact public paths (e.g.
  `/api/organizer/login`) that sit under prefixes whose routers are role-guarded.
  `/api/organizer` itself is auth-only (login/refresh/logout); the organizer's
  own community lives at `/api/community`, mirroring `/api/profile` for students.
- `src/middleware/errorHandler.js` provides the 404 catch-all and the centralized
  handler that reads `err.statusCode` / `err.message` (see `ExpressError`) and
  responds with `{ success: false, message }`.
- `server.js` connects to Mongo via `src/config/db.js` (which also runs
  `User.syncIndexes()`), then starts `app.listen(PORT)` (default 8080).
- `src/config/env.js` is the one place `process.env` is read at boot. JWT secrets
  are deliberately excluded — they stay as call-time `process.env` reads inside
  `signToken` / `refreshAuth` so tests can override them.

## 2. Roles & Account Model

There is no single "Account" collection — each role is its own Mongoose model,
and a JWT's `role` claim decides which model to look the user up in:

| Role      | Model                  | How the account is created                       |
|-----------|-------------------------|---------------------------------------------------|
| student   | `src/models/User.js`        | Public self-signup (`POST /api/signup`)           |
| organizer | `src/models/Community.js`   | Created by an admin (organizer = a Community doc that also holds login credentials) |
| admin     | `src/models/Admin.js`       | Created manually/directly in the DB               |

`src/utils/roleModels.js` maps `"student" | "organizer" | "admin"` → the
corresponding Mongoose model, and is the single lookup table the auth
middleware uses to resolve a JWT into an account.

## 3. Authentication & Authorization

### `src/middleware/auth.js`

- **`requireAuth`** — reads `Authorization: Bearer <token>`, verifies it with
  `jsonwebtoken` (`JWT_SECRET`), uses `roleModels[decoded.role]` to fetch the
  account, and attaches `req.user` (the account doc) and `req.role`. Returns
  401/404 on missing/invalid token or missing account.
- **`requireRole(...roles)`** — factory returning middleware that 403s unless
  `req.role` is one of the allowed roles. Used to scope a whole router (e.g.
  `router.use(requireRole("student"))`) or a single admin-only route.

### `src/utils/signToken.js`

`signToken(id, role)` → signs a JWT with payload `{ id, role }`, 7-day
expiry, secret from `process.env.JWT_SECRET`.

### `src/utils/ensureEmailUnique.js`

A per-collection unique index can't enforce uniqueness *across* User,
Community, and Admin, so a plain read-then-write pre-check across all three
is racy: two signups for different roles at the same instant could both
read "available" before either write lands. `reserveEmail(emailLower, role)`
closes that race by atomically inserting into `EmailRegistry`
(`src/models/EmailRegistry.js`) first — its own unique index on `email` lets
only one concurrent caller win for a given address — then falls back to a
live check across all three collections to catch accounts that predate the
registry. Returns `false` (email taken) or `true` (reservation held).
`releaseEmail(emailLower)` rolls back the reservation if the account
document then fails to save. Used by student signup and by admin-created
organizer accounts.

### Auth Controllers (`src/features/auth/auth.controller.js`)

- **`auth.student`**
  - `signup` — validates required fields, checks email uniqueness
    cross-role, hashes password with `bcrypt`, creates a `User`.
  - `login` — looks up `User` by email (`+password` explicitly selected
    since it's hidden by default), compares hash, issues a token with
    `role: "student"`.
- **`auth.organizer.login`** — same pattern but queries `Community`
  directly (organizer credentials live on the community document itself),
  issues a token with `role: "organizer"`.
- **`auth.admin.login`** — same pattern against `Admin`, issues a
  token with `role: "admin"`. No public admin signup route.
- **`admin.controller.createOrganizer` (in `src/features/admin/`)** — admin-only (`requireAuth` +
  `requireRole("admin")`). Validates required fields, enforces cross-role
  email uniqueness, hashes the password, creates a `Community` document
  (which *is* the organizer account) stamped with `createdBy: req.user._id`.

### `src/features/auth/auth.routes.js`

| Method | Path                         | Guard                          | Handler                          |
|--------|-------------------------------|---------------------------------|-----------------------------------|
| POST   | `/api/signup`                 | public                          | `auth.student.signup`    |
| POST   | `/api/login`                  | public                          | `auth.student.login`     |
| POST   | `/api/organizer/login`        | public                          | `auth.organizer.login`   |
| POST   | `/api/admin/login`            | public                          | `auth.admin.login`       |
| POST   | `/api/admin/organizers`       | router-level `requireAuth` + `requireRole("admin")` | `admin.controller.createOrganizer` |

## 4. Student Profile — `src/features/students/students.routes.js` + `src/features/students/students.controller.js`

All routes under `/api/profile/*` are gated by `requireAuth` +
`requireRole("student")`, so every handler works off `req.user` (the logged-in
`User`).

| Method | Path                                          | Handler                  |
|--------|------------------------------------------------|---------------------------|
| GET    | `/`                                              | `getUserProfile`          |
| PATCH  | `/`                                              | `updateUserProfile`       |
| PUT    | `/picture`                                       | `uploadProfilePicture`    |
| DELETE | `/picture`                                       | `removeProfilePicture`    |
| PUT    | `/banner`                                        | `uploadProfileBanner`     |
| DELETE | `/banner`                                        | `removeProfileBanner`     |
| PUT    | `/achievements/:achievementId/certificate`      | `uploadCertificate`       |
| DELETE | `/achievements/:achievementId/certificate`      | `removeCertificate`       |

Notable behavior:
- `updateUserProfile` no longer hand-maintains a field whitelist. The updatable
  set is declared in `students.validators.js` and enforced by `validate()`
  (see §6), which strips everything else — so `role`, `password` and
  `isProfileComplete` cannot be mass-assigned — and applies the lowercase/
  uppercase normalization. The controller keeps the business logic: a single
  `$or` query catching email/rollNo/prnNo conflicts against *other* users
  before saving.
- Image uploads (`profile_picture`, `profile_banner`, achievement
  `certificate`) go through `multer` (disk storage into `backend/uploads/`,
  5MB limit, mimetype-filtered) then `syncToCloudinary` middleware, then the
  controller. Certificates additionally allow PDF/Word mimetypes.
- Removing a picture/banner/certificate deletes the old file both locally and
  on Cloudinary (`src/utils/fileStorage.deleteEverywhere`) before resetting to
  the shared default asset (pictures/banners only — certificates just clear).
- Uploading a new certificate is scoped by `{ _id: achievementId, student: user._id }`
  so one student can't attach a file to another student's achievement.

## 5. Organizer / Community Management — `src/features/communities/`

All routes under `/api/community/*` are gated by `requireAuth` +
`requireRole("organizer")`, plus a small middleware that aliases
`req.community = req.user` (the logged-in `Community` doc). The router
represents the caller's own single community (no `:id` — same singleton
pattern as `/api/profile`), so paths carry no repeated `community`/`profile`
noun and no HTTP-verb prefix; the method already says GET/PUT/DELETE.

Handlers are split across two controllers in that folder:
`communities.controller.js` holds the community profile plus logo/banner media,
and `coreTeam.controller.js` holds the array-of-subdocument editors (core team,
tags, social links, FAQs). Both share the single `communities.validators.js`.
`communities.routes.js` imports from all three.

| Area          | Method(s)            | Path                                  | Handler                     |
|----------------|------------------------|-----------------------------------------|-------------------------------|
| Profile        | GET / PATCH            | `/`                                     | `getCommunityInfo` / `updateCommunityInfo` |
| Logo           | PUT / DELETE           | `/logo`                                 | `uploadLogo` / `removeLogo`   |
| Banner         | PUT / DELETE           | `/banner`                               | `uploadBanner` / `removeBanner` |
| Core team      | POST                   | `/core-team`                            | `addCoreTeamMember`           |
| Core team      | PATCH / DELETE         | `/core-team/:studentId`                 | `updateCoreTeamMemberRole` / `removeCoreTeamMember` |
| Tags           | POST / DELETE          | `/tags`, `/tags/:tag`                   | `addTag` / `removeTag`        |
| Social links   | POST / PUT / DELETE    | `/social-links[/:platform]`             | `setSocialLink` / `removeSocialLink` |
| FAQs           | POST / PATCH / PUT / DELETE | `/faqs`, `/faqs/:faqId`            | `addFaq` / `updateFaq` / `removeFaq` |

Notable behavior:
- `updateCommunityInfo` takes its updatable set from
  `communities.validators.js` rather than an inline whitelist. Note `logo` and
  `banner` are deliberately **not** updatable through this route any more —
  they belong to the upload/remove routes, which also sync Cloudinary and clean
  up the replaced file. The controller still checks name/email conflicts against
  other communities and turns Mongoose `ValidationError` / duplicate-key (11000)
  failures on save into clean 400s.
- Core team, tags, social links, and FAQs are all array-of-subdocument fields
  on `Community` with enforced caps (50 core team members, 20 tags, 10 social
  links, 20 FAQs) — the controller checks the cap before pushing.
- Core team lookups tolerate a legacy `member.student` key in addition to the
  current `member.user` key, for backwards compatibility.
- FAQ update/remove use Mongoose's subdocument `.id()` / `.deleteOne()`
  helpers rather than manual array filtering.

## 6. Middleware

- **`src/middleware/auth.js`** — `requireAuth`, `requireRole` (see §3).
- **`src/middleware/upload.js`** — shared `multer` disk-storage config (5MB cap,
  `uploads/` destination, randomized filenames) plus two ready-made uploaders:
  `uploadImage` (jpeg/png/webp) and `uploadDocument` (images + PDF/Word, used for
  achievement certificates). `createUploader(regex)` builds more. Route files
  import these instead of restating multer config per router.
  It also creates `uploads/` at load if missing, so a fresh clone (where the
  gitignored directory does not exist) does not ENOENT on its first upload.
- **`src/middleware/errorHandler.js`** — `notFound` 404 catch-all + the
  centralized error handler (see §1).
- **`src/middleware/validate.js`** — `validate(schema, source = "body")` runs a
  Joi schema against `req.body` / `req.params`. Three jobs:
  1. **Rejects bad input** with `400` and
     `{ message, errors: [{ field, message }] }`. `message` is the first error,
     preserving the response shape clients already read; `errors` is additive,
     for per-field form highlighting. `abortEarly: false`, so one round-trip
     reports every problem.
  2. **Strips unknown keys** (`stripUnknown`) — this *is* the mass-assignment
     guard. Controllers no longer keep `allowedUpdates` arrays.
  3. **Normalizes** (`convert`) — trim/lowercase/uppercase declared in the
     schema, so controllers receive clean values.

  Schemas live beside the code they guard: `features/<domain>/<domain>.validators.js`,
  with shared fragments (`objectId`, `email`, `newPassword`, `url`, `year`) in
  `src/validators/common.js`. Enum fragments (`BRANCHES`, the social-platform
  lists) are imported from the models so the schema can't drift from Mongoose.

  Two deliberate choices worth knowing:
  - **Login does not reuse the signup password rules.** Enforcing a minimum
    length there would turn a wrong password into a validation error and reject
    accounts predating the policy.
  - **Route params are validated before `multer` runs** on upload routes, so a
    malformed id costs no file write or Cloudinary upload.
- **`src/middleware/syncToCloudinary.js`** — factory `syncToCloudinary(folder, resourceType = "image")`.
  Runs after `multer` has written file(s) to local disk; uploads each
  (`req.file` or `req.files`) to Cloudinary under `campuscircle/<folder>`,
  and attaches `file.cloudinary = { url, publicId }` for the controller to
  persist. **Discards the local temp file on both paths** — on success because
  Cloudinary is now the system of record, on failure because the file is junk.
  `uploads/` is therefore a staging area that stays empty at rest, never an
  archive. Errors are forwarded to `next(err)`.

## 7. Utils

| File                        | Purpose |
|------------------------------|---------|
| `src/utils/wrapAsync.js`         | Wraps an async route handler so a rejected promise calls `next(err)` instead of crashing — avoids repeating try/catch in every controller. |
| `src/utils/ExpressError.js`      | Small `Error` subclass carrying `statusCode`, consumed by `app.js`'s centralized error handler. |
| `src/utils/signToken.js`         | JWT issuing helper (see §3). |
| `src/utils/roleModels.js`        | `role → Model` lookup table (see §2). |
| `src/utils/ensureEmailUnique.js` | `reserveEmail`/`releaseEmail` — atomic cross-collection (User/Community/Admin) email uniqueness guard, backed by `EmailRegistry` (see §3). |
| `src/utils/fileStorage.js`       | `deleteLocalFile`, `deleteCloudFile`, `deleteEverywhere` — removes an uploaded asset from local disk and/or Cloudinary; swallows/logs errors rather than throwing, since cleanup failures shouldn't block the request. Since `syncToCloudinary` now discards local files immediately, `deleteLocalFile` is a safety net for files orphaned by a hard crash mid-request, not the normal path — `deleteCloudFile` does the real work. |

## 8. Cloudinary Config — `src/config/cloudinary.js`

Configures the `cloudinary` SDK from env vars (`CLOUD_NAME`, `CLOUD_API_KEY`,
`CLOUD_API_SECRET`) and exports a `CloudinaryStorage` instance (folder
`campuscircle`, `png/jpg/jpeg` only) — currently unused directly since the
uploaders in `src/middleware/upload.js` use local `multer.diskStorage` + the separate `syncToCloudinary`
middleware instead, but `cloudinary` itself is imported by
`src/middleware/syncToCloudinary.js` and `src/utils/fileStorage.js`.

## 9. Data Models — Wired vs. Not Yet Wired

**Wired to controllers/routes today:**
- `User` (student account + profile)
- `Community` (organizer account + community profile)
- `Admin`
- `Achievement` (student achievements + certificate upload)

**Defined in `src/models/` but not yet connected to any controller or route**
(schema-only, groundwork for upcoming features):
- `Post`, `Comment`, `Like`, `Follow` — social/Discover feed layer.
  `Post.likesCount` / `commentsCount` are denormalized counters kept in sync
  via `Like`/`Comment` post-save/delete hooks.
- `Event`, `Registration`, `TeamMember`, `Bookmark` — event creation,
  registration (with waitlisting), team-based registration via QR-token
  check-in (`TeamMember.qrToken`), and event bookmarking. `Bookmark` is
  events-only, not posts.
- `CommunityRecruitment`, `CommunityApplication`, `CommunityMembership` —
  organizer recruitment drives, applicant answers (shared `answer.schema.js`
  / `formQuestion.schema.js` between Registration and CommunityApplication),
  and the resulting membership roster.
- `Notification` — polymorphic in-app notifications (`community_post`,
  `community_event`, `community_recruitment`, `waitlist_promotion`,
  `role_promotion`, `new_follower`).
- `AuditLog` — per-community login history with a 180-day TTL index;
  login-level accountability only (shared organizer logins aren't attributed
  to an individual person).

These models are fully designed (validation, indexes, cross-collection sync
hooks) but have no corresponding routes/controllers yet — that's the next
layer of backend work.

### Scaffolding for that work

The folders and files are already in place under `src/features/`, each holding a
comment describing what belongs in it and the model constraints that shape it.
They contain no code yet, so nothing imports them and nothing is mounted; the
mount lines sit commented out at the bottom of `src/routes.js`.

| Folder | Models it covers | Notes |
|--------|------------------|-------|
| `features/feed/` | `Post`, `Comment`, `Like` | Posts are community-authored, never student-authored. Counter caches are hook-maintained. |
| `features/events/` | `Event`, `Registration`, `TeamMember`, `Bookmark` | Capacity gate is atomic against `Event.confirmedRegistrationIds`. QR check-in spans two collections. `Bookmark` is events-only. |
| `features/recruitment/` | `CommunityRecruitment`, `CommunityApplication`, `CommunityMembership` | Selecting an applicant must also create a membership — not schema-enforced. |
| `features/follows/` | `Follow` | Polymorphic target (`User` \| `Community`). |
| `features/notifications/` | `Notification` | Read-only surface; creation lives in `services/notification.service.js`. |
| `features/payments/` | payment fields on `Registration` | Razorpay. Webhook needs the raw body. SDK not installed. |
| `features/admin/audit.controller.js` | `AuditLog` | Read surface; writes live in `services/audit.service.js`. |

`src/services/` holds the two pieces of genuinely cross-feature logic:
`notification.service.js` (fan-out, called from feed/events/follows) and
`audit.service.js` (login records, called from the auth flow).

## 10. Misc

- `scripts/seed.js` — standalone script (not wired into `server.js`) that seeds the
  `User` collection with randomly generated realistic student profiles for
  local development/testing.
