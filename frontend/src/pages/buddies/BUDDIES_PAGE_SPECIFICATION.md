# Complete Content & Product Specification: Buddies Page

> **Scope**: All functionality, information, content sections, user actions, data structures, and state scenarios belonging to the **Buddies Page** directory catalog, student profiles, skill-matching filters, connection workflows, and achievement tracking (the complete `buddies` domain).

---

## 1. Purpose of the Page

### What this page is meant to accomplish
The **Buddies Page** serves as the central student discovery and networking directory for the campus ecosystem. It enables students to find peers, study partners, hackathon teammates, project collaborators, and mentors across different academic departments, graduation years, and technical skill sets.

### Why the user would visit it
- **Peer Discovery**: To find students in specific branches (e.g., Computer Science, Mechanical, ECE) or academic years (1st through 4th Year).
- **Skill & Talent Matching**: To discover peers with specific technical skills (e.g., React, Python, Figma, AI/ML, C++, Flutter, UI/UX) for project collaboration or hackathon team building.
- **Evaluation**: To review student profiles, bios, enrolled clubs, technical skill tags, certificates/awards, and social/portfolio links before reaching out.
- **Networking**: To build a personal campus network by following peers, sending buddy requests, and accessing external GitHub/LinkedIn portfolios.

### What problem it solves
- **Eliminates academic silos**: Bridges communication gaps between different departments and graduation batches that rarely interact in standard classes.
- **Simplifies team formation**: Accelerates finding skilled teammates for upcoming hackathons, group projects, and campus competitions.
- **Fosters peer mentorship**: Helps junior students identify senior student leaders and mentors within their field of interest.

---

## 2. Information That Should Exist

### Primary Information (Core Focus)
- **Student Full Name**: Display name of the student.
- **Academic Branch**: Department/Major affiliation (e.g., Computer Science, Electronics & Comm, Electrical & Elec, Mechanical, AI & Data Science, Information Tech).
- **Academic Year**: Current batch standing (`1st Year`, `2nd Year`, `3rd Year`, `4th Year`, `Graduate`).
- **Verification Status**: **Verified Student Badge** confirming enrolled status at the university.
- **Online Presence Indicator**: Real-time online/offline indicator (`Online now` vs. `Offline`).
- **Leadership Badge**: Highlight badge for student organization leaders (e.g., `Technical Lead`, `Design Lead`, `Team Captain`, `Sound Manager`).
- **Short Biography**: Personal intro statement summarizing interests, projects, and goals.
- **Connection State**: Status indicator for student relationships (`Follow` / `Buddy Request` vs. `Following` / `Connected`).

### Secondary Information (Deep Context)
- **Technical & Professional Skill Tags**: Explicit list of skills possessed by the student (e.g., `React`, `Node.js`, `Python`, `Figma`, `AI / ML`, `C++`, `Flutter`, `UI/UX`, `Java`, `Cloud`).
- **Followers Count**: Total number of students following this buddy.
- **Following Count**: Total number of accounts the student follows.
- **Awards & Achievements Count**: Total count of earned hackathon wins, certifications, and awards.
- **Enrolled Communities & Clubs**: List of joined student organizations along with the student's role in each (e.g., Turing Club - Technical Lead, Fine Arts - Design Lead, Hackathon Society - Member).
- **Certificates & Awards List**: Structured items detailing achievement title, issuing organization/platform, and year awarded (e.g., "National IoT Hackathon Winner - IEEE India, 2024").
- **Social & Portfolio Links**: Direct external links to professional profiles:
  - GitHub Username / Organization link
  - LinkedIn Profile handle
  - Instagram Handle

### Contextual Information (Trust & Navigation)
- **Joined Year / Year of Joining**: Original matriculation year for context.
- **Total Student Counter & Pagination Summary**: Total count of matching students found and current pagination page position (e.g., "Page 1 of 3").

---

## 3. Features and Functionality

### Search & Keyword Querying
- **Multi-Field Keyword Search**: Real-time search matching student names, bios, and specific technical skills.
- **Clear Search Trigger**: Instant button to clear search inputs.

### Filter & Scope Controls
- **Branch Filter Dropdown**: Selectable filter for academic department (`All Branches`, `Computer Science`, `Electronics & Comm`, `Electrical & Elec`, `Mechanical`, `AI & Data Science`, `Information Tech`).
- **Academic Year Dropdown**: Filter by batch level (`All Years`, `1st Year`, `2nd Year`, `3rd Year`, `4th Year`).
- **Skill Filter Dropdown**: Filter by specific technical expertise (`All Skills`, `React`, `Node.js`, `Python`, `Figma`, `AI / ML`, `C++`, `Flutter`, `UI/UX`, `Java`, `Cloud`).
- **Clear All Filters Trigger**: Single click to reset branch, year, skill, and search filters back to default.

### Pagination System
- **Cards Per Page Cap**: Standard directory view limited to 30 student cards per page for optimal loading.
- **Page Number Navigation Pills**: Direct page jump buttons.
- **Previous / Next Buttons**: Incremental page navigation with automatic smooth scrolling back to top of grid.
- **Pagination Filter Reset**: Automatic reset to Page 1 whenever any search or filter criteria is modified.

### Buddy Connection / Follow Workflow
- **Follow / Buddy Request Trigger**: Single-click action on cards or profile view to connect with a student.
- **State Synchronization**: Immediate UI feedback showing "Following" status.
- **Feedback Toast**: Toast notification confirming connection requests (e.g., "Buddy request sent to Priya Krishnan!" or "Unfollowed Aditya Menon").

### Profile Permalinks & Link Sharing
- **Copy Profile Link**: One-click URL clipboard copying for student profile pages with toast feedback.
- **External Portfolio Navigation**: Direct links opening GitHub, LinkedIn, and Instagram in new tabs.

---

## 4. Content Sections

### 1. Page Header & Search Banner
- **Content**: Badge ("CAMPUS DIRECTORY"), page title ("Connect with Campus Buddies"), sub-headline, and keyword search bar with search icon and clear trigger.
- **Why it matters**: Sets directory purpose and provides instant entry point for finding peers.

### 2. Multi-Select Filter Bar
- **Content**: Dropdown menus for Academic Branch, Academic Year, and Technical Skill, accompanied by a "Clear Filters" button when active filters exist.
- **Why it matters**: Allows precise filtering to locate specific talent for team formation.

### 3. Student Directory Grid
- **Content**: Grid of student cards featuring cover gradients, lead badges, avatar icons, online status dots, verified checkmarks, student names, branch & year strings, bio snippets, top skill tags (+ overflow counts), followers/following numbers, and primary "Follow" buttons.
- **Why it matters**: Presents scannable peer profiles for rapid networking.

### 4. Pagination Control Bar
- **Content**: "Previous 30" button, numeric page pills, "Next 30" button, and page summary text.
- **Why it matters**: Manages large student directory datasets cleanly.

### 5. Profile Hero & Banner Section
- **Content**: Gradient cover banner, overlapping avatar icon, online status dot, verified student checkmark, leadership badge, student name, academic branch & year, bio, primary "Follow" button, and "Share" profile link button.
- **Why it matters**: Delivers top-level identity for a specific student's profile page.

### 6. Profile Metrics Strip
- **Content**: Metric counters for Followers, Following, Awards, and Enrolled Clubs.
- **Why it matters**: Quantifies student engagement, peer reputation, and campus involvement.

### 7. Skills & Technologies Section
- **Content**: List of verified skill pills showcasing the student's technical expertise.
- **Why it matters**: Highlights technical competencies for project matching.

### 8. Communities & Clubs Section
- **Content**: List of student organizations the buddy belongs to, showing club names and roles (e.g., Member, Lead).
- **Why it matters**: Reveals extracurricular involvement and shared club interests.

### 9. Certificates & Awards Section
- **Content**: List of earned recognitions featuring award icons, titles, issuing organizations, and dates.
- **Why it matters**: Establishes peer credibility and highlights notable achievements.

### 10. Quick Info & Socials Sidebar
- **Content**: Quick info section (Branch, Year, Online Status indicator) and social/portfolio link list (GitHub, LinkedIn, Instagram with external launch icons).
- **Why it matters**: Gives instant access to off-platform portfolios and contact channels.

---

## 5. User Actions

### Primary Actions
- **Search Students**: Search by student name, bio keywords, or skill names.
- **Apply Filters**: Select branch, academic year, or specific technical skill.
- **Follow / Send Buddy Request**: Click "Follow" on student cards or profile views to connect.
- **View Student Profile**: Click a student card to navigate to their dedicated profile page.

### Secondary Actions
- **Navigate Pagination**: Click Previous/Next or specific page pills.
- **Share Profile**: Click "Share" to copy profile permalink to clipboard.
- **External Portfolio Access**: Click GitHub, LinkedIn, or Instagram links to view external work.
- **Back Navigation**: Click "Back to Buddies" to return to directory listing.

### Optional / Auxiliary Actions
- **Clear Search**: Click `X` icon in search bar.
- **Reset All Filters**: Click "Clear Filters" or "Reset Filters" button in empty state.

---

## 6. States and Scenarios

### First-Time User
- Displays complete directory of registered campus students across all branches and years.
- Clear search bar and filter controls encouraging exploration.

### Returning User
- Preserved follow states: connected students display `Following` status.

### Empty Directory State (No Students Registered)
- Message stating no student accounts exist in system.

### No Filter Results State
- Clear message ("No campus buddies found").
- Subtext suggesting broader search terms or alternate skill/branch filters.
- Prominent "Reset Filters" action button.

### Loading State
- Shimmers/skeletons for student card grid, profile hero, and sidebar while fetching data from backend API.

### Error State (e.g., Invalid Student ID in URL)
- "Student Not Found" view with warning icon.
- Explanatory message ("This profile does not exist or may have been removed.").
- Recovery button ("Back to Buddies").

### Successful Connection State
- Follow button transforms immediately to "Following".
- Toast notification feedback ("Buddy request sent to [Student Name]!").
- Follower count increments by 1.

### Incomplete / Missing Data Scenarios
- **Missing Avatar**: Displays styled icon fallback with online status dot.
- **Missing Bio**: Displays default member intro text.
- **No Skills Listed**: Hides skills section gracefully.
- **No Achievements**: Displays friendly note ("No achievements posted yet.").
- **No Clubs Joined**: Displays note ("No communities joined yet.").

### Logged-In vs. Logged-Out Users
- **Logged-In**: One-click connection requests, full access to portfolio links and social profiles.
- **Logged-Out**: Clicking "Follow" prompts a login modal, returning seamlessly to the buddy profile post-authentication.

---

## 7. Data and Contextual Requirements

### Backend / Database Sourced Data
- **Student Attributes**: `id`, `name`, `branch`, `year`, `yearOfJoining`, `bio`, `avatarUrl`, `bannerGradient`, `skills` (array), `followingCount`, `followersCount`, `online` (boolean), `leadBadge` (string/null).
- **Community Memberships**: `communities` array containing `{ name: string, role: string }`.
- **Achievements**: `achievements` array containing `{ title: string, issuer: string, year: string }`.
- **Socials**: `socials` object containing `{ github?: string, linkedin?: string, instagram?: string }`.

### User-Generated & Session Data
- `followedIds`: Array of student IDs the user is currently following.
- `searchQuery`: Search string input.
- `selectedBranch`: Active branch filter string (default: `"All Branches"`).
- `selectedYear`: Active year filter string (default: `"All Years"`).
- `selectedSkill`: Active skill filter string (default: `"All"`).
- `currentPage`: Integer representing current pagination page (default: `1`).

### Data Relationships
- **Student to Communities**: Many-to-Many (Students belong to multiple clubs; clubs have many members).
- **Student to Achievements**: One-to-Many (A student holds multiple certificates/awards).
- **Student to Connections (Followers/Following)**: Many-to-Many relationship between user accounts.

---

## 8. Edge Cases

- **Student with No Skills or Bio**: Card and profile handle empty skill arrays and empty bio strings gracefully without visual disruption.
- **Large Follower Counts**: Numbers formatted cleanly (e.g., `1.4k` for 1,420 followers).
- **Graduate / Alum Status**: Year calculation logic handles alumni (`Graduate` standing).
- **Offline Status**: Clear visual fallback when user is offline (`Offline`).

---

## 9. Content That Should NOT Be on the Page

- **Private Direct Messaging Threads**: Full chat history belongs in the dedicated **Messages / Chat** section, not on public profile cards.
- **Student Grade / Transcript Records**: Private academic performance data should never be displayed on public peer directory pages.
- **Event Management Tools**: Hosting or organizing events belongs in the **Events / Organizer** page.

---

## 10. Final Checklist

Use this checklist to audit the complete specification against any existing implementation:

### Page Header & Search
- [ ] Directory title, subtitle, and badge establishing the Campus Directory.
- [ ] Multi-field search input bar with search icon and quick clear button.

### Filter Controls Bar
- [ ] Academic Branch filter dropdown (`All Branches`, CS, ECE, EEE, Mech, AI & DS, IT).
- [ ] Academic Year filter dropdown (`All Years`, 1st, 2nd, 3rd, 4th Year).
- [ ] Skill filter dropdown (`All Skills`, React, Node, Python, Figma, AI/ML, C++, Flutter, UI/UX, Java, Cloud).
- [ ] "Clear Filters" button when active filters exist.

### Directory Grid & Cards
- [ ] Cover banner gradient with optional lead badge.
- [ ] Avatar icon with real-time online status dot.
- [ ] Verified student checkmark badge.
- [ ] Student name, branch, and year string.
- [ ] Personal bio snippet.
- [ ] Top skill tags (+ overflow counter tag).
- [ ] Followers and Following count metrics.
- [ ] Primary "Follow" / "Following" button with toast notification feedback.

### Pagination System
- [ ] 30 cards per page limit.
- [ ] Previous / Next page buttons.
- [ ] Numeric page selector pills.
- [ ] Automatic reset to Page 1 on filter changes.

### Student Profile Page
- [ ] Back button navigation ("Back to Buddies").
- [ ] Hero banner gradient with avatar, online indicator, verified checkmark, lead badge, name, branch, year, and bio.
- [ ] Primary Follow button and Share profile button.
- [ ] Metric counters (Followers, Following, Awards, Clubs).
- [ ] Skills & Technologies section.
- [ ] Joined Communities & Clubs section with roles.
- [ ] Certificates & Awards list (title, issuer, year).
- [ ] Quick Info sidebar (Branch, Year, Online Status).
- [ ] Social & Portfolio links list (GitHub, LinkedIn, Instagram with external launch icons).

### Scenarios & Edge Cases Handled
- [ ] Empty state with "Reset Filters" action.
- [ ] Student Not Found error page for invalid IDs.
- [ ] Follow state synchronization across cards and profile page.
- [ ] Clipboard permalink copy sharing with feedback toast.
