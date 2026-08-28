# Complete Content & Product Specification: Profile Page

> **Scope**: All functionality, information, content sections, user actions, data structures, and state scenarios belonging to the **Profile Page** dashboard, personal details editor, academic identity management, verified certificates showcase, bookmarked discoveries, followed clubs portal, network follower/following management, media upload triggers, and danger zone account actions (the complete `profile` domain).

---

## 1. Purpose of the Page

### What this page is meant to accomplish
The **Profile Page** serves as the student's primary academic dashboard, digital identity hub, and social portfolio. It allows students to manage their official university record (Roll Number, PRN Number, Branch, Year of Joining), customize public bio and skill tags, display verified certificates and credentials, manage bookmarked campus discoveries, oversee followed clubs, track academic connections (followers/following), and update avatar and banner media.

### Why the user would visit it
- **Academic Record & Identity Management**: To view and edit personal academic data (Full Name, Student Email, Roll Number, PRN Number, Department Branch, Year of Joining, Bio, Interest Tags).
- **Showcase Verified Credentials**: To upload and display certificates, awards, and licenses with verification links for peer and recruiter evaluation.
- **Manage Bookmarks & Wishlists**: To view and organize saved events and posts bookmarked while browsing the platform.
- **Manage Club Subscriptions**: To review all followed campus clubs, filter by category, or unfollow clubs.
- **Network Management**: To inspect their follower roster, manage who they are following, and remove followers or unfollow peers.
- **Update Profile Media**: To upload or replace custom profile avatars and cover banners.

### What problem it solves
- **Unifies fragmented student portfolios**: Combines academic credentials, social connections, club memberships, and saved events into a single authoritative dashboard.
- **Automates academic standing calculation**: Automatically computes academic year level (e.g. 1st Year, 2nd Year, 3rd Year, 4th Year, Alumni) based on matriculation year and academic cutover logic.
- **Provides credential verification**: Solves unverified skill claims by storing downloadable certificate images/PDFs alongside official issuer verification URLs.

---

## 2. Information That Should Exist

### Primary Information (Core Focus)
- **Full Name**: Official student name.
- **Student Email Address**: Official campus email string (`student@campus.edu`).
- **Roll Number**: Capitalized student roll code (e.g., `21102B0001`).
- **PRN Number**: Official Permanent Registration Number (e.g., `1202100155`).
- **Branch / Department**: Specified engineering/academic program (e.g., Computer Engineering 1/2/3, IT, AI & Data Science, AI & ML, CSE Cyber/IoT, ECS, EXTC).
- **Year of Joining**: Matriculation year (2015 to current year).
- **Calculated Academic Standing**: Auto-calculated standing badge (`1st Year`, `2nd Year`, `3rd Year`, `4th Year`, `Graduate / Alumni`) with enrollment status (`Active Coursework` vs. `Completed`).
- **Verified Student Badge**: University checkmark badge confirming active student status.
- **Profile Avatar & Banner Media**: Custom uploaded profile picture and cover banner image/gradient.

### Secondary Information (Deep Context)
- **Short Bio**: Personal summary (max 300 characters).
- **Discover Interest Tags**: Hashtags used by the recommendation engine (e.g., `#webdev`, `#ai/ml`, `#hackathons`, `#ui/ux`, `#robotics`).
- **Skills & Tech Stack**: Verified skills array (e.g., `React`, `Python`, `Machine Learning`, `Node.js`, `Figma`, `MongoDB`).
- **Educational Qualifications**: Background items (e.g., "Campus University — B.S. Computer Engineering", "Higher Secondary Certificate — 95.8%").
- **Social & Portfolio URLs**: External links for LinkedIn, GitHub, and Instagram.
- **Verified Certificates List**: Credentials detailing title, issuing organization, issue date, description, certificate image/PDF preview, and external verification link.
- **Bookmarked Discoveries**: Saved events and posts with title, image/placeholder, date badge, and location/meta text.
- **Followed Clubs List**: Subscribed clubs detailing club name, category, description, follower count, member stack, icon, and unfollow trigger.
- **Network Connections**: Roster of followers and following peers detailing avatar, online status, name, degree badge (e.g., `UG 2025`, `Ph.D. 2024`), branch/year title, and action triggers.

### Contextual Information (Overview Metrics)
- **Followers Count**: Total count of academic followers.
- **Following Count**: Total count of peers being followed.
- **Clubs Count**: Total count of subscribed communities.
- **Certificates Count**: Total count of verified achievements.

---

## 3. Features and Functionality

### Dashboard Navigation System
- **Sidebar Tab Selector**: Switch main right panel view across 5 primary tabs:
  1. `Profile Details` (`personalDetails`)
  2. `Achievements` (`achievements`)
  3. `Bookmarks` (`bookmarked`)
  4. `Clubs` (`followedClubs`)
  5. `Network` (`network`)
- **Live Tab Count Badges**: Displays item counts next to sidebar nav items (Achievements count, Bookmarks count, Clubs count, Network combined count).
- **Breadcrumb Trail**: Hierarchical navigation path (`Home` > `Academic Dashboard`).

### Profile Media Editing
- **Avatar Upload**: Camera icon button overlaying avatar to upload profile picture (`multipart/form-data` endpoint `/api/profile/update_profile_picture`).
- **Cover Banner Upload**: Camera icon button overlaying banner to upload custom cover photo (`multipart/form-data` endpoint `/api/profile/update_profile_banner`).

### Personal Details Editing & Validation
- **Edit Mode Toggle**: "Edit Details" button toggling form inputs vs. view-only displays.
- **Form Field Controls**:
  - Name, Email, Roll Number (auto-capitalized), PRN Number (auto-capitalized), Year of Joining (min 2015, max current year).
  - Branch selection dropdown.
  - Interactive hashtag input for Interest Tags (press Enter or comma to add; click `X` to remove).
  - Interactive skill tag input for Skills & Tech Stack (press Enter/comma to add; click `X` to remove).
  - Interactive list input for Education entries (press Enter to add; click trash icon to remove).
  - Character counter for Bio (300 character limit).
  - Social link input fields (LinkedIn, GitHub, Instagram URLs).
- **Validation & Error Alerting**: Ensures required fields (Name, Email, Roll No, PRN No, Year of Joining) are filled before API patch submission; displays success/error banners.
- **Danger Zone Account Action**: "Delete Account" button with confirmation prompt that triggers account cleanup endpoints (`remove_profile_picture`, `remove_profile_banner`) and logs out.

### Verified Achievements & Certificate Management
- **View Toggle**: Switch certificate display between **Grid View** and **List View**.
- **Upload Certificate Modal Trigger**: Clickable card opening "Add Certificate" dialog.
- **Add Certificate Modal**:
  - Image/PDF file picker with preview display (max 5 MB).
  - Certificate title input (required).
  - Issuing Organization input (required).
  - Issue Month/Year date picker.
  - Optional description text area.
  - Save button with spinning loader state.
- **Certificate Lightbox Overlay**: Click any certificate card to open full-screen lightbox viewing image/PDF, title, issuer, issue date, and description.
- **Verification Link Action**: External arrow link navigating to official certificate verification URL.
- **Delete Certificate Action**: Trash icon trigger with confirming delete state.

### Bookmarked Discoveries Management
- **Sub-Tab Pills**: Filter saved items between `Events` and `Posts`.
- **View Details Action**: Direct navigation trigger to the original event or post.
- **Unbookmark Action**: Bookmark icon toggle to remove item from saved list.

### Followed Clubs Portal
- **Category Filter Pills**: Filter subscribed clubs by `All`, `Science`, `Arts`, `Tech`.
- **Keyword Search Bar**: Filter clubs by name or category.
- **Unfollow Club Action**: Toggle button to unfollow community.
- **Discover / Start Club Triggers**: Buttons to explore new clubs (`/communities`) or initiate a new club request.

### Academic Network Portal
- **Network Sub-Tabs**: Toggle between `Followers` tab and `Following` tab with live count badges.
- **Network Search Bar**: Search connections by peer name.
- **Follower Roster Actions**: "Follow" button back to follower and "Remove" button to drop follower.
- **Following Roster Actions**: "Following" toggle button to unfollow peer.
- **Peer Profile Permalinks**: Clickable avatar/name navigating to peer profile (`/profile/:id`).

---

## 4. Content Sections

### 1. Breadcrumb & Top Bar
- **Content**: Home link, chevron separator, and page indicator ("Academic Dashboard").
- **Why it matters**: Provides top-level navigation context across the platform.

### 2. Profile Sidebar Navigation Panel
- **Content**: Brand header ("Academic Profile"), verified student badge, navigation list with icons and counts (Profile Details, Achievements, Bookmarks, Clubs, Network), Help Center link, and "Complete Profile" callout.
- **Why it matters**: Serves as the master navigation bar for switching dashboard views.

### 3. Summary Profile Header Banner (Personal Details Tab)
- **Content**: Cover banner image/gradient, banner camera edit button, avatar ring, avatar camera edit button, "Edit Personal Details" button, student name, verified checkmark badge, branch & year pills, bio snippet, quick interactive stats strip (Followers, Following, Clubs, Certificates), active communities list with roles, and skills pills.
- **Why it matters**: Gives a high-level summary of the student's identity and stats at the top of the main personal details view.

### 4. Personal Details Editor Section
- **Content**: Section headings, form fields (Identity & Contact, Academic Identity with calculated standing badge, Discover Interest Tags, Profile & Educational Background, Social Links), validation alerts, and "Danger Zone" account deletion card.
- **Why it matters**: Enables complete self-service management of official university student data.

### 5. Verified Achievements Section
- **Content**: Main title, subtitle, Grid/List view toggle buttons, "Upload Certificate" card, certificate cards list (image/placeholder, title, type icon, issuer, date, description, verification link, delete button), Add Certificate modal, and Certificate Lightbox modal.
- **Why it matters**: Provides verifiable proof of skills and achievements for academic and career opportunities.

### 6. Bookmarks Section
- **Content**: Title, sub-tab pills (`Events`, `Posts`), bookmark cards (image/placeholder, date badge, title, location/meta, details button, remove bookmark button), and empty state view.
- **Why it matters**: Helps students organize saved events and reading materials for future reference.

### 7. Followed Clubs Section
- **Content**: Title, subtitle, filter/search bar (keyword input + category pills: All, Science, Arts, Tech), "Discover New Clubs" button, club cards (icon, name, description, member avatar stack, follower count, unfollow button), and "Start a Club" action card.
- **Why it matters**: Keeps student club subscriptions organized and allows easy club discovery.

### 8. Academic Network Section
- **Content**: Title, network search bar, sub-tabs (`Followers`, `Following` with count badges), student user cards (avatar, online dot, name link, degree badge, title/branch, follow/remove/unfollow actions).
- **Why it matters**: Manages academic connections and peer relationships across campus.

---

## 5. User Actions

### Primary Actions
- **Switch Dashboard Tabs**: Click sidebar nav items to change current view.
- **Edit Personal Details**: Click "Edit Details", modify inputs, and click "Save Changes".
- **Upload Profile Picture / Cover Banner**: Click camera icons overlaying avatar or cover banner.
- **Add Certificate**: Click "Upload Certificate", fill modal inputs, select file preview, and click "Post Certificate".
- **Delete Account**: Click "Delete Account" in Danger Zone and confirm prompt.

### Secondary Actions
- **Open Certificate Lightbox**: Click any certificate card to open full-screen view.
- **Delete Certificate**: Click trash icon on a certificate card.
- **Toggle View Mode**: Switch between Grid and List view in Achievements tab.
- **Unbookmark Item**: Click bookmark icon on saved cards.
- **Unfollow Club**: Click "Following" button on club cards.
- **Filter / Search Clubs & Network**: Type text into search inputs or click category pills.
- **Manage Connections**: Follow back a follower, remove a follower, or unfollow a peer.
- **Navigate to Peer Profile**: Click a peer's avatar or name in the network tab.

### Optional / Auxiliary Actions
- **Add / Remove Interest Hashtags**: Type hashtag and press Enter; click `X` to remove.
- **Add / Remove Skills**: Type skill name and press Enter; click `X` to remove.
- **Add / Remove Education Entries**: Type qualification and press Enter; click trash icon to remove.

---

## 6. States and Scenarios

### View Mode vs. Edit Mode (Personal Details)
- **View Mode**: Inputs rendered as clean text displays (`pdetails-val-display`), email icon badges, capitalized code blocks for Roll/PRN numbers, and read-only tag pills.
- **Edit Mode**: Active form controls enabled (text inputs, selects, hashtag inputs, bio textarea), "Save Changes" and "Cancel" buttons visible in actions bar.

### Academic Cutover Year Calculation
- Automatically computes academic standing based on matriculation year (`yearOfJoining`) and current date:
  - `yr === 1`: `1st Year` (Active Coursework)
  - `yr === 2`: `2nd Year` (Active Coursework)
  - `yr === 3`: `3rd Year` (Active Coursework)
  - `yr === 4`: `4th Year` (Active Coursework)
  - `yr > 4`: `Graduate / Alumni` (Completed)

### Empty States Across Tabs
- **Personal Details**: Empty fields display fallback dash (`—`) or placeholder note ("No bio added yet").
- **Achievements**: Displays "Upload Certificate" card; if empty, encourages uploading first credential.
- **Bookmarks**: Empty state icon with message ("No bookmarked discoveries saved yet").
- **Followed Clubs**: Filter empty state with "Discover New Clubs" link.
- **Network**: Search/sub-tab empty states when no followers or following connections exist.

### Loading & Saving States
- **Form Save**: "Save Changes" button transforms into spinning loader (`Saving Changes…`) while posting to `/api/profile/update_profile`.
- **Certificate Upload**: "Post Certificate" button displays spinner loader while uploading.
- **Avatar/Banner Upload**: Instant local Object URL preview while uploading asynchronously to backend.

### Error & Success Banners
- **Success Alert**: Green alert banner ("Personal details updated successfully!") displayed for 3.5 seconds after successful save.
- **Error Alert**: Red alert banner ("Roll Number is required", "Year of Joining must be between 2015 and 2026") displayed when validation fails or API errors occur.

---

## 7. Data and Contextual Requirements

### Backend / Database Sourced Data (`/api/profile/get_profile`)
- **User Record**: `_id`, `name`, `email`, `rollNo`, `prnNo`, `branch`, `yearOfJoining`, `bio`, `interestTags` (array), `skills` (array), `education` (array), `profilePicture` (media path), `profileBanner` (media path), `socialLinks` array (`{ platform: string, url: string }`).
- **Certificates Data**: Array of certificate objects `{ id, title, issuer, date, description, imageUrl, verificationLink }`.
- **Bookmarks Data**: Array of bookmarked objects `{ id, title, dateBadge, meta, category, imageUrl }`.
- **Followed Clubs Data**: Array of club objects `{ id, name, category, description, followers, icon, iconBg, iconColor, membersCount, imageUrl }`.
- **Network Connections Data**: Arrays for `followers` and `following` containing `{ id, name, title, degreeBadge, online, avatarUrl }`.

### User-Generated & Session Data
- `activeTab`: Selected tab key (`"personalDetails"`, `"achievements"`, `"bookmarked"`, `"followedClubs"`, `"network"`).
- `isEditing`: Boolean state toggling edit mode for personal details form.
- `formData`: Controlled state object reflecting form input values during edit mode.
- `expanded`: Selected certificate ID for lightbox viewing (or null).

---

## 8. Edge Cases

- **Missing Profile/Banner Images**: System falls back to default icon avatar placeholder and styled gradient banner.
- **Invalid Roll / PRN Input**: Text automatically formatted to uppercase strings.
- **Long Bios**: Textarea enforces a strict 300-character limit with real-time character count.
- **Empty Social Links**: Unfilled social link URLs are excluded from final payload.
- **Alumni Transition**: Entering a Year of Joining > 4 years ago switches student badge to `Graduate / Alumni` and sets `isEnrolled` to false.

---

## 9. Content That Should NOT Be on the Page

- **Public Event Catalog Discovery**: Discovering new events belongs on the main **Events Hub** (`/events`).
- **Public Community Catalog**: Browsing all campus clubs belongs in **Communities** (`/communities`).
- **Private Chat Messaging Threads**: Full message conversations belong in **Messages / Chat**.
- **Admin Management Console**: System-wide administrative settings belong in the **Admin Portal**.

---

## 10. Final Checklist

Use this checklist to audit the complete specification against any existing implementation:

### Page Navigation & Sidebar
- [ ] Breadcrumb path (`Home` > `Academic Dashboard`).
- [ ] Sidebar brand header ("Academic Profile") and verified badge.
- [ ] Sidebar tabs (Profile Details, Achievements, Bookmarks, Clubs, Network) with live count badges.
- [ ] Help Center link and "Complete Profile" callout.

### Profile Header Summary Banner (Personal Details View)
- [ ] Cover banner image/gradient with edit camera button.
- [ ] Avatar ring with edit camera button.
- [ ] "Edit Personal Details" button.
- [ ] Name, verified student badge, branch pill, and year pill.
- [ ] Short bio paragraph.
- [ ] Interactive stats strip (Followers, Following, Clubs, Certificates).
- [ ] Active communities list with role badges.
- [ ] Skills & expertise tag pills.

### Personal Details Tab & Editor
- [ ] Identity & Contact section (Full Name, Student Email).
- [ ] Academic Identity section (Roll No, PRN No, Branch dropdown, Year of Joining input, calculated academic standing badge).
- [ ] Discover Interest Tags manager (hashtag input + tag pills).
- [ ] Profile & Background section (Bio textarea with char counter, Skills input + pills, Education input + list).
- [ ] Social Links section (LinkedIn, GitHub, Instagram URL inputs).
- [ ] Danger Zone card with "Delete Account" button and confirmation alert.
- [ ] Success and error alert banners.
- [ ] Sticky bottom action bar ("Cancel", "Save Changes" with spinner loader).

### Verified Achievements Tab
- [ ] Header title, subtitle, and Grid/List view toggle buttons.
- [ ] "Upload Certificate" card trigger.
- [ ] Certificate cards list (thumbnail/placeholder, title, issuer, date, description, verification link, delete button).
- [ ] Add Certificate Modal (image/PDF picker preview, title, issuer, date, description, Save button).
- [ ] Full-screen Certificate Lightbox modal.

### Bookmarks Tab
- [ ] Title, sub-tab pills (`Events`, `Posts`), and empty state view.
- [ ] Bookmark cards (image/placeholder, date badge, title, location/meta, details button, remove bookmark button).

### Followed Clubs Tab
- [ ] Category filter pills (`All`, `Science`, `Arts`, `Tech`) and keyword search bar.
- [ ] "Discover New Clubs" navigation button.
- [ ] Followed club cards (icon box, name, description, member avatar stack, follower count, unfollow button).
- [ ] "Start a Club" action card.

### Network Tab
- [ ] Network search bar and sub-tabs (`Followers`, `Following` with count badges).
- [ ] User connection cards (avatar, online dot, name link, degree badge, branch/year title, follow/remove/unfollow buttons).
