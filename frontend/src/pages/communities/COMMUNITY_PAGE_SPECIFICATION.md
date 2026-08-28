# Complete Content & Product Specification: Communities Page

> **Scope**: All functionality, information, content sections, user actions, data structures, and state scenarios belonging to the **Communities Page** directory catalog, detailed community views, quick-preview modal, recruitment application flow, and membership tracking (the complete `communities` domain).

---

## 1. Purpose of the Page

### What this page is meant to accomplish
The **Communities Page** serves as the central student hub for discovering, exploring, joining, and participating in official campus societies, tech guilds, cultural clubs, academic forums, and sports councils. It enables students to find communities aligned with their personal interests, academic majors, or career goals, connect with student leadership, and apply for open staff/executive roles.

### Why the user would visit it
- **Discovery**: To find active campus clubs and societies operating on campus across diverse domains (coding, AI, design, sports, music, debate, photography).
- **Evaluation**: To review club mission statements, active membership counts, established history, executive leadership rosters, social handles, and hosted event schedules before joining.
- **Participation**: To join/follow communities to receive updates, apply for open core team/internship positions during recruitment drives, or reach out to club leads directly.
- **Networking**: To find official Discord/GitHub/LinkedIn/Instagram channels to connect with peers sharing similar interests.

### What problem it solves
- **Centralizes fragmented club promotion**: Replaces scattered social media accounts and word-of-mouth announcements with a single authoritative directory of verified campus organizations.
- **Democratizes recruitment**: Provides clear visibility into which clubs are currently hiring new members or core team roles, along with direct application pathways.
- **Builds campus engagement**: Enables students—especially incoming freshmen and transfer students—to build their social and professional network early in their academic journey.

---

## 2. Information That Should Exist

### Primary Information (Core Focus)
- **Community Name**: Official name of the club or society (e.g., Turing Club, AI Research Society, Hackathon Society, Fine Arts & Design Guild, Sports Council, Music Club, Debate & MUN Society, Photography Club).
- **Tagline**: Concise summary of the club's primary mission or focus area.
- **Category Classification**: Broad domain tag (`Tech & Coding`, `AI & Data`, `Arts & Design`, `Music & Performing`, `Sports & Fitness`, `Academics & Lit`).
- **Verification Status**: **Official Campus Society / Verified Badge** confirming registration with the university student council.
- **Member Count**: Total count of active student members enrolled in the community.
- **Active Hosted Events Count**: Total count of upcoming or currently scheduled events organized by the club.
- **Recruitment Status**: Active hiring indicator (`🔥 Recruiting Now` with specific open roles vs. `✓ Active`).
- **Membership State**: Clear status indicating if the current user is a follower/member (`Following Community`) or non-member (`Join & Follow Club`).

### Secondary Information (Deep Context)
- **Detailed Narrative / "About Us"**: Comprehensive story covering club history, weekly activities, learning workshops, open-source projects, and goals.
- **Establishment Year**: The year the organization was founded on campus.
- **Executive Leadership Roster**: Names, executive role titles (President, Tech Lead, Design Head, Operations Lead), and academic branch/year (e.g., CSE 3rd Year, ECE 2nd Year) of core student leaders.
- **Hosted / Upcoming Events List**: Summary of scheduled events (Title, date, event type e.g., Competition, Workshop, Hackathon, Exhibition, Concert) with direct navigation links to event details.
- **Official Connect & Social Channels**: Direct web links and handles for external and internal platforms:
  - GitHub Organization Handle
  - LinkedIn Page / Group Path
  - Discord Server Invite Link
  - Instagram Official Handle
  - YouTube Channel Handle
- **Recruitment Role Specification**: Detailed list of open roles during active recruitment (e.g., "Web Dev & Core Team", "ML Research Interns", "UI/UX & Graphics Designers", "Vocalists & Drummers").

### Contextual Information (Trust & Interaction)
- **Lead Organizer / Faculty Advisor Metadata**: Name and title of the primary student president or faculty mentor.
- **Direct Messaging Trigger**: Ability to send a direct message inquiry to individual executive team members.
- **Application Status**: Clear status indicator for recruitment submissions (`Apply Now` vs. `Application Sent`).

---

## 3. Features and Functionality

### Search & Discovery Controls
- **Keyword Search Engine**: Instant filtering across community names, taglines, category labels, descriptions, and open recruitment roles.
- **Clear Search Action**: Quick trigger to clear active search queries.

### Filter & Scope Controls
- **Category Pill Selector**: Horizontal filter list to view specific categories (`All Communities`, `Tech & Coding`, `AI & Data`, `Arts & Design`, `Music & Performing`, `Sports & Fitness`, `Academics & Lit`).
- **"Recruiting Now" Toggle Checkbox**: Binary filter constraint to isolate only communities actively hiring new members or staff.
- **Filter Reset Button**: Single click to restore all search and category filters to default settings.

### Sorting Mechanisms
- **Most Popular**: Sort communities by total member count descending (default).
- **Name (A–Z)**: Sort communities alphabetically by name.
- **Most Active Events**: Sort communities by the number of currently scheduled active events descending.

### Community Membership / Follow Workflow
- **Follow / Join Toggle**: Single-click action on cards, detail page, or quick modal to join or leave a community.
- **State Synchronization**: Immediate UI feedback across all views (card grid, modal, detail page, and sidebar) reflecting current membership status.
- **Notification Toast**: Feedback toast confirming membership status changes (e.g., "Joined Turing Club community! 🛡️" or "Left Turing Club").

### Recruitment Application Flow
- **Role Inquiry & Application Trigger**: "Apply Now" button presented when a club is in recruiting mode.
- **Application Submission State**: Updates button state to "Application Sent" and records user intent.

### Quick Preview Modal System
- **Quick-View Modal Trigger**: Open a lightweight modal dialog from the community card without losing catalog context.
- **Tabbed Modal Navigation**:
  - **About Tab**: Mission statement, recruitment banner, and official social handles.
  - **Leads & Mentors Tab**: Executive roster with direct message buttons.
  - **Events Tab**: Hosted upcoming events list with direct event view triggers.

### Link Sharing Operations
- **Share Permalinks**: One-click URL clipboard copying for community detail pages with toast notification.

---

## 4. Content Sections

### 1. Page Header & Search Banner
- **Content**: Title badge ("CAMPUS HUB"), page title ("Student Communities & Clubs"), descriptive sub-headline, search bar with search icon and clear button.
- **Why it matters**: Introduces the campus community landscape and provides instant search access.

### 2. Category Filter & Control Bar
- **Content**: Interactive category pills (All, Tech, AI, Arts, Music, Sports, Academics), "Recruiting Now" checkbox, and Sort dropdown selector ("Most Popular", "Name (A-Z)", "Most Active Events").
- **Why it matters**: Enables users to quickly filter by domain interest or hiring availability.

### 3. Community Directory Grid (Catalog List)
- **Content**: Grid of community summary cards featuring cover images/gradients, category badges, "Recruiting" pills, Follow/Following buttons, club icons, names, taglines, member counts, active event counts, and "Explore Club" triggers.
- **Why it matters**: Presents scannable overviews of all clubs for easy comparison.

### 4. Community Detail Hero & Breadcrumb Section
- **Content**: Breadcrumb trail (`Communities` > `[Category Name]` > `[Community Name]`), top-level cover banner image, category chip, recruitment status, and direct back button.
- **Why it matters**: Establishes navigation context for deep-dive investigation of a single club.

### 5. Verified Identity & Headline Section
- **Content**: Club icon avatar, official name, verified checkmark badge, tagline, and sub-label ("Official Student Organization").
- **Why it matters**: Confirms official registration and legitimizes club activities.

### 6. Metric & Logistics Grid
- **Content**: Summary cards for Active Members count, Active Events count, Established Year, and Lead Organizer name.
- **Why it matters**: Offers quantitative proof of club activity and size at a glance.

### 7. "About This Community" Narrative Section
- **Content**: Full descriptive paragraphs explaining the club's story, weekly activities, workshops, open projects, and culture.
- **Why it matters**: Explains the value proposition of joining the club.

### 8. Recruitment Callout Section (Conditional)
- **Content**: Highlighted callout containing recruitment icon, title ("Currently Recruiting Members!"), specific open roles list, and action button ("Apply Now" / "Application Sent").
- **Why it matters**: Drives student participation during hiring drives and simplifies application discovery.

### 9. Executive Leadership & Mentors Roster Section
- **Content**: Cards for core student leads detailing name, leadership role (President, Tech Lead, Design Head, etc.), academic branch/year, avatar icon, and direct message trigger.
- **Why it matters**: Humanizes the club by introducing the students running it and providing direct points of contact.

### 10. Hosted & Upcoming Events Section
- **Content**: List of scheduled events hosted by the club, displaying event type pill (Competition, Workshop, Hackathon, Exhibition, Concert), event title, date string, and "View Event" navigation button.
- **Why it matters**: Shows prospective members what activities the club actively produces.

### 11. Official Connect & Social Channels Section
- **Content**: External link cards for GitHub, LinkedIn, Instagram, Discord, and YouTube, displaying platform logos, official handles, and external link arrow triggers.
- **Why it matters**: Connects students to off-platform discussion groups, repositories, and media feeds.

### 12. Sticky Community Sidebar
- **Content**: Member count display, recruitment status pill, primary "Join & Follow Club" button, Share button, Apply button, and quick meta summary (Category, Members, Active Events, Lead, Founded Year).
- **Why it matters**: Keeps essential conversion actions accessible while scrolling through lengthy club descriptions.

### 13. Quick-Preview Community Modal
- **Content**: Dual-column modal containing cover background, club avatar, quick stats summary, follow button, and tabbed content navigation (About, Leads & Mentors, Events).
- **Why it matters**: Allows users to inspect club details without navigating away from their filtered catalog view.

---

## 5. User Actions

### Primary Actions
- **Search Communities**: Type keywords into the search bar to locate specific clubs or skills.
- **Select Category**: Click a category pill to restrict results to a specific domain.
- **Toggle Recruitment Filter**: Check "Recruiting Now" to view hiring clubs only.
- **Follow / Join Community**: Click "Follow" / "Join" on cards, modals, or detail views to become a member.
- **Apply for Open Roles**: Click "Apply Now" in the recruitment banner to submit an interest application.
- **Explore Community Details**: Click a card or "Explore Club" button to navigate to the full detail view.

### Secondary Actions
- **Open Quick Preview Modal**: Trigger the preview modal directly from catalog cards.
- **Switch Modal Tabs**: Toggle between About, Leads & Mentors, and Events tabs inside the modal.
- **Message Core Lead**: Click the "Message" button on a lead card to initiate direct communication.
- **View Hosted Event**: Click "View Event" on an upcoming event item to open its event detail page.
- **Share Community Link**: Click "Share" to copy the direct URL permalink to clipboard.
- **External Social Navigation**: Click GitHub, LinkedIn, Instagram, Discord, or YouTube cards to open official external channels in a new tab.

### Optional / Auxiliary Actions
- **Clear Search Bar**: Click `X` icon inside search input.
- **Reset All Filters**: Click "Reset Filters" button in empty state.
- **Sort Directory**: Select a sorting order from the dropdown ("Most Popular", "Name (A-Z)", "Most Active Events").

---

## 6. States and Scenarios

### First-Time User
- Presented with full directory sorted by "Most Popular".
- Default followed state shows unjoined status (`Join & Follow Club`).
- Prominent discovery search and category pills to guide exploration.

### Returning User
- Preserved membership state: clubs previously joined display green `Following Community` badges.
- Application status preserved: roles applied for show `Application Sent`.

### Empty Directory State (No Communities in Database)
- System message explaining no communities are registered currently.

### No Filter Results State
- Clear message ("No communities found").
- Subtext encouraging broader search queries or clearing the "Recruiting Now" filter.
- Prominent "Reset Filters" action button.

### Loading State
- Skeleton shimmers for directory cards, detail page layout, and modal panes while loading data.
- Controls disabled during active data fetching.

### Error State (e.g., Invalid Community ID in URL)
- "Community Not Found" error view with warning icon.
- Subtext ("The club or community you are looking for does not exist or has been removed.").
- Primary recovery button ("Back to Communities").

### Successful Join / Follow State
- Instant button text update to "Following Community".
- Toast notification confirmation ("Joined [Community Name] community! 🛡️").
- Incremented member count (+1) across card, detail page, and sidebar metrics.

### Successful Role Application State
- Button text updates immediately to "Application Sent" and becomes disabled to prevent duplicate submissions.
- Toast confirmation of application submission.

### Incomplete / Missing Data Scenarios
- **Missing Cover Image**: Falls back to styled gradient background.
- **Missing Social Handles**: Hides individual missing platform cards gracefully.
- **No Active Events**: Displays friendly text ("No upcoming events scheduled at the moment.").
- **No Executive Roster Listed**: Displays placeholder note ("No core team profiles listed.").

### Logged-In vs. Logged-Out Users
- **Logged-In**: Seamless one-click joining/following, direct role application, and messaging.
- **Logged-Out**: Clicking "Join" or "Apply Now" triggers an authentication prompt, preserving target intent post-login.

---

## 7. Data and Contextual Requirements

### Backend / Database Sourced Data
- **Community Core Attributes**: `id`, `name`, `tagline`, `category` (slug), `categoryLabel`, `icon`, `accentColor`, `coverGradient`, `coverImage`, `members` (count), `activeEvents` (count), `recruiting` (boolean), `recruitingRole` (string/null), `established` (year string), `about` (string).
- **Leadership Roster**: `leads` array containing `{ name: string, role: string, branch: string, avatarUrl: string/null }`.
- **Social Handles**: `socials` object containing `{ github?: string, linkedin?: string, discord?: string, instagram?: string, youtube?: string }`.
- **Hosted Events Reference**: `upcomingEvents` array containing `{ title: string, date: string, type: string, eventId: string }`.

### User-Generated & Session Data
- `followedIds`: Array of community IDs the user is currently following/enrolled in.
- `appliedCommunityIds`: Array of community IDs where user has submitted a recruitment application.
- `searchQuery`: Text search filter input string.
- `activeCategory`: Currently selected category ID string (default: `"all"`).
- `onlyRecruiting`: Boolean flag for filtering hiring communities.
- `sortBy`: Selected sort option string (`"Most Popular"`, `"Name (A–Z)"`, `"Most Active Events"`).
- `modalClub`: Currently selected community object for quick preview modal (or null).

### Data Relationships
- **Community to Events**: One-to-Many (A single community hosts multiple events).
- **Community to Users (Memberships)**: Many-to-Many (Users belong to multiple communities; communities have many members).
- **Community to Core Leads**: One-to-Many (A community has multiple executive team members).

---

## 8. Edge Cases

- **Club Currently Not Recruiting**: Recruiting badge and application buttons are completely hidden; sidebar displays standard `✓ Active` status pill.
- **Newly Established Club (0 Events / Few Members)**: Metrics handle zero values gracefully (`0 Active Events`, `1 Member`) without breaking visual design.
- **External Social Handle Invalidation**: Handles leading `@` symbols or full URL strings gracefully when generating external href links.
- **Multi-Role Recruitment**: Displays multi-role strings (e.g., "Web Dev & Core Team") without truncation.
- **Unverified / Student Initiative Clubs**: Handles unverified clubs by hiding the verified badge.

---

## 9. Content That Should NOT Be on the Page

- **Full Club Management / Admin Panel**: Editing club details, approving member applications, or managing club budgets belongs in the **Organizer / Club Admin Dashboard**.
- **User's Private Message Inbox**: Full multi-thread chat conversations belong in the dedicated **Messages / Chat** section, not on public community detail cards.
- **Event Creation Forms**: Creating new events for a club belongs in the **Event Creation Flow**, accessible via the Organizer Dashboard.
- **Financial Sponsorship Portals**: Processing club dues, merchandise orders, or corporate sponsorship transactions belongs in a dedicated store/checkout workflow.

---

## 10. Final Checklist

Use this checklist to audit the complete specification against any existing implementation:

### Page Header & Search
- [ ] Clear title, subtitle, and badge establishing the Student Communities Hub.
- [ ] Real-time search input bar with search icon and quick clear button.

### Directory Controls & Filtering
- [ ] Category filter pills (`All Communities`, `Tech & Coding`, `AI & Data`, `Arts & Design`, `Music & Performing`, `Sports & Fitness`, `Academics & Lit`).
- [ ] "Recruiting Now" toggle checkbox.
- [ ] Sort dropdown (`Most Popular`, `Name (A-Z)`, `Most Active Events`).
- [ ] Live counter showing matching communities count.
- [ ] Reset Filters button in empty state.

### Directory Cards (Catalog View)
- [ ] Cover banner image with gradient overlay.
- [ ] Category badge and "Recruiting" indicator.
- [ ] Follow/Following toggle button on card.
- [ ] Club icon avatar, official name, and tagline.
- [ ] Member count and active events count metrics.
- [ ] "Explore Club" detail navigation trigger.

### Community Detail View
- [ ] Breadcrumb navigation path and back button ("Back to Communities").
- [ ] Hero banner image with category pill.
- [ ] Host identity row with logo avatar, official name, verified checkmark, and tagline.
- [ ] Quick facts grid (Active Members, Active Events, Established Year, Lead Organizer).
- [ ] "About [Community Name]" narrative section.
- [ ] Conditional recruitment banner with open roles and "Apply Now" button.
- [ ] Executive leadership & core team roster (Name, Role, Branch, Message button).
- [ ] Hosted upcoming events timeline with "View Event" triggers.
- [ ] Official connect channels section (GitHub, LinkedIn, Instagram, Discord, YouTube with handles and external links).
- [ ] Sticky sidebar with member count, status pill, primary Join/Follow button, Share button, Apply button, and metadata list summary.

### Quick Preview Modal
- [ ] Dual-column preview modal triggered from catalog view.
- [ ] Cover image background with club avatar, category chip, name, tagline, and quick stats.
- [ ] Follow button inside modal with toast confirmation.
- [ ] Tabbed navigation (About, Leads & Mentors, Events).
- [ ] About tab: Mission, recruitment callout, social links.
- [ ] Leads tab: Executive roster with direct message buttons.
- [ ] Events tab: Hosted upcoming events list with view triggers.
- [ ] Keyboard accessibility (ESC to close, focus trapping).

### Scenarios & Edge Cases Handled
- [ ] Empty state with filter reset trigger.
- [ ] Community Not Found error page for invalid URL parameters.
- [ ] Non-recruiting club state handling.
- [ ] Follow state synchronization across catalog, modal, detail page, and sidebar.
- [ ] Share permalink clipboard copying with feedback.
