# CampusCircle Backend — Overview

Node.js + Express + MongoDB (Mongoose) backend. This document describes what has
been built so far: entry point, auth, RBAC, controllers, routes, middleware, and
utils. It also lists the data models that exist in `models/` but are **not yet**
wired up to any controller/route (future work).

---

## 1. Entry Point — `app.js`

- Creates the Express app, connects to MongoDB via Mongoose (`MONGO_URI` /
  `DB_URL` env var, falls back to `mongodb://127.0.0.1:27017/campuscircle`).
- Global middleware: `cors` (credentials on, origin from `CLIENT_URL`),
  `express.json()`, `cookie-parser`, `express.urlencoded()`.
- Mounts three routers:
  - `/` → `routes/AuthRoute.js`
  - `/api/profile` → `routes/StudentRoute.js`
  - `/api/organizer` → `routes/OrganizerRoute.js`
- 404 catch-all + a centralized error handler that reads `err.statusCode` /
  `err.message` (see `ExpressError`) and responds with
  `{ success: false, message }`.
- On boot: connects to Mongo, calls `User.syncIndexes()`, then starts
  `app.listen(PORT)` (default 8080).

## 2. Roles & Account Model

There is no single "Account" collection — each role is its own Mongoose model,
and a JWT's `role` claim decides which model to look the user up in:

| Role      | Model                  | How the account is created                       |
|-----------|-------------------------|---------------------------------------------------|
| student   | `models/User.js`        | Public self-signup (`POST /api/signup`)           |
| organizer | `models/Community.js`   | Created by an admin (organizer = a Community doc that also holds login credentials) |
| admin     | `models/Admin.js`       | Created manually/directly in the DB               |

`utils/roleModels.js` maps `"student" | "organizer" | "admin"` → the
corresponding Mongoose model, and is the single lookup table the auth
middleware uses to resolve a JWT into an account.

## 3. Authentication & Authorization

### `middleware/AuthMiddleware.js`

- **`requireAuth`** — reads `Authorization: Bearer <token>`, verifies it with
  `jsonwebtoken` (`JWT_SECRET`), uses `roleModels[decoded.role]` to fetch the
  account, and attaches `req.user` (the account doc) and `req.role`. Returns
  401/404 on missing/invalid token or missing account.
- **`requireRole(...roles)`** — factory returning middleware that 403s unless
  `req.role` is one of the allowed roles. Used to scope a whole router (e.g.
  `router.use(requireRole("student"))`) or a single admin-only route.

### `utils/signToken.js`

`signToken(id, role)` → signs a JWT with payload `{ id, role }`, 7-day
expiry, secret from `process.env.JWT_SECRET`.

### `utils/ensureEmailUnique.js`

`ensureEmailUnique(emailLower)` checks the email against **all three**
account collections (User, Community, Admin) in parallel so the same email
can't be reused across roles. Used by student signup and by admin-created
organizer accounts.

### Auth Controllers (`controllers/*AuthController.js`)

- **`StudentAuthController`**
  - `Signup` — validates required fields, checks email uniqueness
    cross-role, hashes password with `bcrypt`, creates a `User`.
  - `Login` — looks up `User` by email (`+password` explicitly selected
    since it's hidden by default), compares hash, issues a token with
    `role: "student"`.
- **`OrganizerAuthController.Login`** — same pattern but queries `Community`
  directly (organizer credentials live on the community document itself),
  issues a token with `role: "organizer"`.
- **`AdminAuthController.Login`** — same pattern against `Admin`, issues a
  token with `role: "admin"`. No public admin signup route.
- **`AdminController.CreateOrganizer`** — admin-only (`requireAuth` +
  `requireRole("admin")`). Validates required fields, enforces cross-role
  email uniqueness, hashes the password, creates a `Community` document
  (which *is* the organizer account) stamped with `createdBy: req.user._id`.

### `routes/AuthRoute.js`

| Method | Path                         | Guard                          | Handler                          |
|--------|-------------------------------|---------------------------------|-----------------------------------|
| POST   | `/api/signup`                 | public                          | `StudentAuthController.Signup`    |
| POST   | `/api/login`                  | public                          | `StudentAuthController.Login`     |
| POST   | `/api/organizer/login`        | public                          | `OrganizerAuthController.Login`   |
| POST   | `/api/admin/login`            | public                          | `AdminAuthController.Login`       |
| POST   | `/api/admin/organizers`       | `requireAuth` + `requireRole("admin")` | `AdminController.CreateOrganizer` |

## 4. Student Profile — `routes/StudentRoute.js` + `controllers/StudentController.js`

All routes under `/api/profile/*` are gated by `requireAuth` +
`requireRole("student")`, so every handler works off `req.user` (the logged-in
`User`).

| Method | Path                                          | Handler                  |
|--------|------------------------------------------------|---------------------------|
| GET    | `/get_profile`                                  | `getUserProfile`          |
| PATCH  | `/update_profile`                               | `updateUserProfile`       |
| PUT    | `/update_profile_picture`                       | `uploadProfilePicture`    |
| PUT    | `/update_profile_banner`                        | `uploadProfileBanner`     |
| DELETE | `/remove_profile_picture`                       | `removeProfilePicture`    |
| DELETE | `/remove_profile_banner`                        | `removeProfileBanner`     |
| PUT    | `/achievements/:achievementId/certificate`      | `uploadCertificate`       |
| DELETE | `/achievements/:achievementId/certificate`      | `removeCertificate`       |

Notable behavior:
- `updateUserProfile` whitelists updatable fields (`name`, `email`, `rollNo`,
  `prnNo`, `branch`, `yearOfJoining`, `bio`, `skills`, `education`,
  `socialLinks`, `interestTags`) to block mass-assignment of internal fields
  like `role`. It also runs a single `$or` query to catch email/rollNo/prnNo
  conflicts against *other* users before saving, normalizing email to
  lowercase and rollNo/prnNo to uppercase.
- Image uploads (`profile_picture`, `profile_banner`, achievement
  `certificate`) go through `multer` (disk storage into `backend/uploads/`,
  5MB limit, mimetype-filtered) then `syncToCloudinary` middleware, then the
  controller. Certificates additionally allow PDF/Word mimetypes.
- Removing a picture/banner/certificate deletes the old file both locally and
  on Cloudinary (`utils/fileStorage.deleteEverywhere`) before resetting to
  the shared default asset (pictures/banners only — certificates just clear).
- Uploading a new certificate is scoped by `{ _id: achievementId, student: user._id }`
  so one student can't attach a file to another student's achievement.

## 5. Organizer / Community Management — `routes/OrganizerRoute.js` + `controllers/OrganizerController.js`

All routes under `/api/organizer/*` are gated by `requireAuth` +
`requireRole("organizer")`, plus a small middleware that aliases
`req.community = req.user` (the logged-in `Community` doc). Most routes are
exposed under both a `snake_case` and a `kebab-case` alias
(e.g. `/core_team` and `/core-team`) for the same handler.

| Area          | Method(s)            | Path                                  | Handler                     |
|----------------|------------------------|-----------------------------------------|-------------------------------|
| Profile        | GET                    | `/get_info`, `/get_profile`            | `getCommunityInfo`            |
| Profile        | PATCH                  | `/update_info`, `/update_profile`      | `updateCommunityInfo`         |
| Logo           | PUT / DELETE           | `/update_logo` / `/remove_logo`        | `uploadLogo` / `removeLogo`   |
| Banner         | PUT / DELETE           | `/update_banner` / `/remove_banner`    | `uploadBanner` / `removeBanner` |
| Core team      | POST                   | `/core_team`, `/core-team`             | `addCoreTeamMember`           |
| Core team      | PATCH / DELETE         | `/core_team/:studentId`                | `updateCoreTeamMemberRole` / `removeCoreTeamMember` |
| Tags           | POST / DELETE          | `/tags`, `/tags/:tag`                  | `addTag` / `removeTag`        |
| Social links   | POST / PUT / DELETE    | `/social_links[/:platform]`            | `setSocialLink` / `removeSocialLink` |
| FAQs           | POST / PATCH / PUT / DELETE | `/faqs`, `/faqs/:faqId`           | `addFaq` / `updateFaq` / `removeFaq` |

Notable behavior:
- `updateCommunityInfo` whitelists fields (`name`, `description`, `logo`,
  `banner`, `category`, `location`, `establishedYear`, `isRecruiting`,
  `leadOrganizer`, `email`), checks name/email conflicts against other
  communities, and also catches Mongoose `ValidationError` / duplicate-key
  (11000) errors on save and turns them into clean 400s.
- Core team, tags, social links, and FAQs are all array-of-subdocument fields
  on `Community` with enforced caps (50 core team members, 20 tags, 10 social
  links, 20 FAQs) — the controller checks the cap before pushing.
- Core team lookups tolerate a legacy `member.student` key in addition to the
  current `member.user` key, for backwards compatibility.
- FAQ update/remove use Mongoose's subdocument `.id()` / `.deleteOne()`
  helpers rather than manual array filtering.

## 6. Middleware

- **`middleware/AuthMiddleware.js`** — `requireAuth`, `requireRole` (see §3).
- **`middleware/syncToCloudinary.js`** — factory `syncToCloudinary(folder, resourceType = "image")`.
  Runs after `multer` has written file(s) to local disk; uploads each
  (`req.file` or `req.files`) to Cloudinary under `campuscircle/<folder>`,
  and attaches `file.cloudinary = { url, publicId }` for the controller to
  persist. On upload failure, cleans up the local temp file(s) and forwards
  the error.

## 7. Utils

| File                        | Purpose |
|------------------------------|---------|
| `utils/wrapAsync.js`         | Wraps an async route handler so a rejected promise calls `next(err)` instead of crashing — avoids repeating try/catch in every controller. |
| `utils/ExpressError.js`      | Small `Error` subclass carrying `statusCode`, consumed by `app.js`'s centralized error handler. |
| `utils/signToken.js`         | JWT issuing helper (see §3). |
| `utils/roleModels.js`        | `role → Model` lookup table (see §2). |
| `utils/ensureEmailUnique.js` | Cross-collection (User/Community/Admin) email uniqueness check (see §3). |
| `utils/fileStorage.js`       | `deleteLocalFile`, `deleteCloudFile`, `deleteEverywhere` — removes an uploaded asset from local disk and/or Cloudinary; swallows/logs errors rather than throwing, since cleanup failures shouldn't block the request. |

## 8. Cloudinary Config — `cloudConfig.js`

Configures the `cloudinary` SDK from env vars (`CLOUD_NAME`, `CLOUD_API_KEY`,
`CLOUD_API_SECRET`) and exports a `CloudinaryStorage` instance (folder
`campuscircle`, `png/jpg/jpeg` only) — currently unused directly since the
routes use local `multer.diskStorage` + the separate `syncToCloudinary`
middleware instead, but `cloudinary` itself is imported by
`syncToCloudinary.js` and `utils/fileStorage.js`.

## 9. Data Models — Wired vs. Not Yet Wired

**Wired to controllers/routes today:**
- `User` (student account + profile)
- `Community` (organizer account + community profile)
- `Admin`
- `Achievement` (student achievements + certificate upload)

**Defined in `models/` but not yet connected to any controller or route**
(schema-only, groundwork for upcoming features):
- `Post`, `Comment`, `Like`, `Bookmark`, `Follow` — social/Discover feed layer.
  `Post.likesCount` / `commentsCount` are denormalized counters kept in sync
  via `Like`/`Comment` post-save/delete hooks.
- `Event`, `Registration`, `TeamMember`, `Bookmark` — event creation,
  registration (with waitlisting), and team-based registration via
  QR-token check-in (`TeamMember.qrToken`).
- `CommunityRecruitment`, `CommunityApplication`, `CommunityMembership` —
  organizer recruitment drives, applicant answers (shared `answer.schema.js`
  / `formQuestion.schema.js` between Registration and CommunityApplication),
  and the resulting membership roster.
- `Notification` — polymorphic in-app notifications (`community_post`,
  `post_like`, `post_comment`, `waitlist_promotion`).
- `AuditLog` — per-community login history with a 180-day TTL index;
  login-level accountability only (shared organizer logins aren't attributed
  to an individual person).

These models are fully designed (validation, indexes, cross-collection sync
hooks) but have no corresponding routes/controllers yet — that's the next
layer of backend work.

## 10. Misc

- `seed.js` — standalone script (not wired into `app.js`) that seeds the
  `User` collection with randomly generated realistic student profiles for
  local development/testing.
