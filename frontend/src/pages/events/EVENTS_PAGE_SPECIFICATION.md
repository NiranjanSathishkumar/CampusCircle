# Complete Content & Product Specification: Events Page

> **Scope**: All functionality, information, content sections, user actions, data structures, and state scenarios belonging to the **Events Page** catalog, detailed event views, and registration workflow (the complete `events` domain).

---

## 1. Purpose of the Page

### What this page is meant to accomplish
The **Events Page** is the central campus engine for event discovery, evaluation, participation, and management. It enables students to discover all upcoming campus activities—ranging from technical hackathons and academic workshops to cultural battles and sports leagues—and seamlessly register for them.

### Why the user would visit it
- **Discovery**: To see what is happening across campus, filtered by their personal interests, academic domain, or preferred clubs.
- **Evaluation**: To review comprehensive event parameters (dates, venue, schedule, entry fees, eligibility, rules, and host credentials) before committing time or money.
- **Action**: To register individually or as a team, bookmark events for future reference, or share event links with friends and prospective teammates.
- **Support & Logistics**: To get organizer contact information, check venue room numbers, read event FAQs, and clarify event-day requirements.

### What problem it solves
- **Eliminates fragmented promotion**: Consolidates event notices previously scattered across physical posters, social media channels, and group chats into a single source of truth.
- **Clarifies participation rules**: Provides explicit information on team sizes, entry fees, prerequisites, and registration deadlines to eliminate confusion.
- **Prevents overcrowding / capacity issues**: Real-time capacity trackers inform students of seat availability and urgency before arriving at a venue.

---

## 2. Information That Should Exist

### Primary Information (Core Focus)
- **Event Title**: Descriptive name of the event.
- **Event Category**: Classification tag (e.g., Workshop, Competition, Seminar, Cultural, Sports, Tech Talk).
- **Host / Organiser Identity**: Name of the organizing club/lab/society, host icon/avatar, and **Verified Organiser Badge**.
- **Date & Time**: Human-readable date string, starting time, and ending time/duration.
- **Venue & Location**: Physical campus building name, hall/room number, or virtual meeting platform details.
- **Entry Fee / Cost**: Explicit pricing status (`FREE` vs. `PAID` with exact amount).
- **Team Format**: Required participation structure (e.g., `Solo Entry`, `2–4 Teams`, `5–10 Squad`, `10+ Squad`).
- **Live Seat Counter & Progress**: Current registered count, total venue capacity, occupancy percentage, and urgency indicator (`✓ Open`, `🔥 Filling Fast`, `Almost Full`, `Sold Out`).
- **Primary Registration State**: Clear status indicating if the user is unregistered (`Register Now`) or already registered (`✓ You're Registered!`).

### Secondary Information (Deep Context)
- **Topic Tags / Keywords**: Content hashtags for search indexing (e.g., `#Robotics`, `#Figma`, `#AI`, `#Hackathon`, `#Cricket`).
- **Full Narrative Description**: Multi-paragraph introduction covering event objectives, target audience, learning outcomes, and prize incentives.
- **Multi-Phase Schedule / Agenda**: Chronological breakdown of event day (Phase name, session title, time window, description, judges/speakers involved).
- **Guidelines & Rules**: Specific compliance rules (mandatory student ID requirement, arrival buffer time, equipment needed, code of conduct).
- **Frequently Asked Questions (FAQs)**: Accordion list answering common attendee questions regarding eligibility, fees, certificates, team creation, and gear.
- **Bookmark / Saved State**: Indicator showing if the event is stored in the user's personal saved list.

### Contextual Information (Trust & Logistics)
- **Community Affiliation**: Associated campus hub (e.g., Turing Club, Hackathon Society, AI Research Society, Arts Guild, Sports Council, Music Club, Debate Society, Photography Club).
- **Organiser Contact & Help Desk Details**:
  - Lead Coordinator Name and Role Title.
  - Physical Campus Help Desk Location (Building name, room number, floor).
  - Official Support Email Address (with expected response SLA).
  - Helpline / Phone Number (with active operating hours).
- **Certificate Guarantee**: Explicit confirmation if digital certificates signed by organizers will be awarded.

---

## 3. Features and Functionality

### Search & Keyword Querying
- **Real-Time Text Search**: Filter events instantly by typing keywords matching titles, descriptions, host names, or tags.
- **Clear Search Trigger**: One-click action to reset search input.

### Multi-Dimensional Filtering System
- **Community Category Selector**: Filter events by specific campus community/club.
- **Team Size / Format Filter**: Filter by participation format (`Solo`, `2–4`, `5–10`, `10+`).
- **Payment / Price Filter**: Filter by cost (`Free` vs. `Paid`).
- **Category Filter**: Filter by activity type (`Workshop`, `Competition`, `Seminar`, `Cultural`, `Sports`, `Tech Talk`).
- **Active Filter Management**: Display selected filters as individual removable tags/chips with a global **Clear All** trigger.

### Sorting Controls
- **Upcoming First**: Sort events chronologically by start date (default).
- **Most Popular**: Sort events by highest registration count or percentage occupancy.
- **Recently Added**: Sort events by latest posting date.

### Event Registration Flow
- **Registration Trigger**: Primary button initiating ticket pass confirmation.
- **Modal Confirmation Screen**: Displays event title, host name, fee, and terms before final booking.
- **Ticket Issuance**: Converts status to "Registered", updates seat counter, and saves ticket to user profile ("My Events").

### Bookmarking / Saving System
- **Toggle Bookmark**: Single-click save/unsave action on event cards and detail view for quick access later.

### Sharing & Link Operations
- **Copy Link**: Copies direct URL of the event to clipboard with automated toast feedback.

### Interactive FAQ Accordion
- **Expand / Collapse Toggle**: Clickable questions to reveal or hide detailed answers.

### Navigation & Breadcrumb Scoping
- **Breadcrumb Navigation**: Hierarchical link trail (`Events` > `[Community Name]` > `[Event Title]`).
- **Back Navigation**: Direct trigger returning to the main discovery list with active filters preserved.

---

## 4. Content Sections

### 1. Header & Search Banner
- **Content**: Title badge ("EVENTS HUB"), page title, summary subtitle, search bar with search icon and clear button.
- **Why it matters**: Sets immediate page context and provides instant entry point for targeted searches.

### 2. Community Filter Strip
- **Content**: Horizontal/selectable list of campus communities with icons and labels (e.g., All Events, Turing Club, Hackathon Society, Fine Arts & Design, AI Research Society, Sports Council, Music Club, Debate Society, Photography Club).
- **Why it matters**: Allows users to narrow down events by their favorite club or departmental affiliation.

### 3. Filter & Sort Control Bar
- **Content**: Dropdown triggers for Team Size, Payment, Category, Sort Order, active filter chips display, clear-all button, and total matching event count.
- **Why it matters**: Provides granular control over search results and transparent feedback on active criteria.

### 4. Event Catalog Grid (Discovery List)
- **Content**: Grid of summary cards containing event image, date callout (day & month), category tag, bookmark button, price tag, host avatar with verified checkmark, title, formatted date/time, venue, topic tags, progress bar with registered/capacity numbers, urgency pill, and action buttons ("Details", "Register").
- **Why it matters**: Facilitates rapid scanning and comparison of multiple events.

### 5. Event Detail Top Navigation & Hero Section
- **Content**: Back button, breadcrumb trail, hero image, category pill, payment pill, team format pill.
- **Why it matters**: Establishes context when viewing a specific event and allows quick back-tracking.

### 6. Host & Verified Badge Row
- **Content**: Host logo/avatar, host name, official verified check icon, host sub-label ("Official Campus Host").
- **Why it matters**: Establishes authenticity and trust in the event's organization.

### 7. Quick Facts & Logistics Grid
- **Content**: Key metric cards for Date & Time, Venue Location, Team Format, and Entry Fee.
- **Why it matters**: Delivers essential logistical parameters at a glance without reading long paragraphs.

### 8. Detailed Event Overview ("About This Event")
- **Content**: Descriptive narrative covering event purpose, host background, target audience, learning outcomes, and activities.
- **Why it matters**: Gives prospective attendees the deep context required to decide whether to participate.

### 9. Event Agenda & Schedule Timeline
- **Content**: Chronological phase sequence (e.g., Phase 1: Check-in & Orientation, Phase 2: Challenge Execution, Phase 3: Judging & Awards) with titles and details.
- **Why it matters**: Sets expectations for total time commitment and day-of workflow.

### 10. Guidelines & Rules List
- **Content**: Bulleted list of mandatory requirements (student ID check, arrival buffer, team attendance, certificate terms).
- **Why it matters**: Prevents eligibility misunderstandings and ensures smooth event operation.

### 11. Organiser Help Desk & Contact Section
- **Content**: Contact cards organized into:
  - **People**: Lead Coordinator name and title, physical desk location (room & floor).
  - **Channels**: Official support email with SLA response time, helpline phone number with operational hours.
- **Why it matters**: Gives attendees immediate human recourse for urgent inquiries, special accommodations, or questions.

### 12. Frequently Asked Questions (FAQ) Accordion
- **Content**: Interactive Q&A list covering eligibility, registration fees, solo participation, certificates, and gear requirements.
- **Why it matters**: Resolves common user doubts self-service style without requiring email outreach.

### 13. Registration Action & Sticky Summary Bar
- **Content**: Pricing summary, live seat availability bar, occupancy percentage, primary "Register Now" or "You're Registered!" button, Save/Bookmark toggle, Share link button, and meta list summary.
- **Why it matters**: Keeps the core call-to-action readily available regardless of scroll position.

### 14. Registration Confirmation Dialog / Modal
- **Content**: Confirmation icon, title ("Confirm Registration"), event summary text, host name, Cancel button, and Confirm button.
- **Why it matters**: Prevents accidental registrations and provides clear confirmation of commitment.

---

## 5. User Actions

### Primary Actions
- **Keyword Search**: Type text into the search bar to filter events.
- **Apply Filters**: Select communities, team sizes, payment types, or categories.
- **View Event Details**: Click an event card or "Details" button to open the full event specification.
- **Register for Event**: Click "Register Now" and confirm in the dialog to secure a ticket pass.

### Secondary Actions
- **Bookmark / Save Event**: Toggle bookmark icon on cards or detail view to store in personal wishlist.
- **Share Event**: Click "Share" to copy the event permalink to clipboard.
- **Change Sort Order**: Switch between "Upcoming First", "Most Popular", and "Recently Added".
- **Expand / Collapse FAQs**: Click individual FAQ items to read answers.
- **Contact Organiser**: Click the email mailto link or phone tel link to reach organizers directly.
- **Navigate Back**: Click "Back to Events" or breadcrumbs to return to catalog.

### Optional / Auxiliary Actions
- **Clear Search**: Click `X` icon inside search bar.
- **Remove Single Filter**: Click `X` icon on active filter chip.
- **Clear All Filters**: Click "Clear all" button to reset all filters simultaneously.

---

## 6. States and Scenarios

### First-Time User
- Displays full, unfiltered catalog of upcoming events sorted by "Upcoming First".
- Clear instructions on team participation (e.g., solo attendees can pair up during check-in).

### Returning User
- Preserved bookmark/saved state badges on previously saved event cards.
- Visual registration banner ("You're Registered!") displayed on events already booked.

### Empty Catalog State (No Events in Database)
- Display message stating no active events are currently scheduled.
- Call-to-action to check back later or explore campus communities.

### No Filter Results State
- Clear empty state message ("No events match your filters").
- Subtext encouraging filter adjustment or search clearing.
- Prominent "Reset Filters" action button.

### Loading State
- Skeleton shimmer UI for event grid and detail page layout while fetching data.
- Controls disabled during request execution.

### Error State (e.g., Invalid Event ID in URL)
- "Event Not Found" error view with warning icon.
- Explanatory message ("The event you are looking for does not exist or has been removed.").
- Primary recovery button ("Back to Events").

### Successful Registration State
- Modal closes with success notification toast ("Ticket confirmed! Saved to My Events 🎟️").
- Registration button state transforms immediately into a green "You're Registered!" badge.
- Seat counter increments by 1 and progress bar width recalculates.

### Incomplete / Missing Data Scenarios
- **Missing Image**: Uses vibrant default category gradient fallback.
- **Missing Host Logo/Color**: Uses default lab icon and brand color.
- **Unspecified Venue/Time**: Displays "TBA" (To Be Announced) with organizer contact notice.

### Logged-In vs. Logged-Out Users
- **Logged-In**: Smooth one-click registration confirmation and persistent bookmarks tied to account.
- **Logged-Out**: Clicking "Register" or "Save" prompts a lightweight authentication modal/redirect, returning seamlessly to the event after login.

---

## 7. Data and Contextual Requirements

### Backend / Database Sourced Data
- **Event Core Attributes**: `id`, `title`, `category`, `community_id`, `tags` (array), `imageUrl`, `date` (ISO string), `dateFormatted`, `venue`, `description`.
- **Pricing Attributes**: `payment` (`FREE` | `PAID`), `price_amount`, `currency`.
- **Registration Attributes**: `registered_count`, `capacity`, `statusBadge` (`Open`, `Filling Fast`, `Almost Full`, `Sold Out`).
- **Host Attributes**: `hostName`, `hostIcon`, `hostColor`, `isVerified` (boolean).
- **Timeline / Agenda**: `agenda` array containing `{ phase: string, title: string, desc: string }`.
- **Rules**: `rules` array of strings.
- **FAQs**: `faqs` array containing `{ q: string, a: string }`.
- **Contact Info**: `contact` object containing `leadName`, `leadRole`, `deskLocation`, `email`, `phone`, `operatingHours`.

### User-Generated & Session Data
- `registeredIds`: Array of event IDs user has successfully registered for.
- `savedIds`: Array of event IDs bookmarked by user.
- `searchQuery`: Active search text string.
- `activeCommunity`: Selected community ID string (default: `"all"`).
- `teamSizes`: Array of selected team size filter strings.
- `payments`: Array of selected payment filter strings.
- `categories`: Array of selected category filter strings.
- `sortBy`: Selected sort option string.

### Data Relationships
- **Event to Community**: Many-to-One (Each event belongs to one primary community/club).
- **Event to Host**: Many-to-One (An event is published by a specific campus host).
- **Event to User Registrations**: Many-to-Many (Users can register for multiple events; events track registered users).
- **Event to Agenda Phases**: One-to-Many (An event contains multiple schedule phases).

---

## 8. Edge Cases

- **Sold Out Event (`registered >= capacity`)**:
  - Registration button changes to disabled "Sold Out" or opens a "Join Waitlist" workflow.
  - Status badge explicitly highlights "Sold Out".
- **Past / Concluded Event**:
  - Start date is in the past. Registration controls are disabled and badge reads "Event Concluded".
- **Rescheduled or Cancelled Event**:
  - Prominent alert banner at the top of detail page explaining cancellation or date changes.
- **Team Format Scenarios (Solo vs. Team)**:
  - For team events, user registration allows registering individual intent while detailing how team members link tickets during check-in.
- **Time Conflict Detection**:
  - System warns user if attempting to register for two events occurring at overlapping times on the same date.
- **Unverified External Organisers**:
  - Verified check icon is hidden; cautionary info pill notes external host status.

---

## 9. Content That Should NOT Be on the Page

- **Full Event Authoring / Admin Management Tools**: Creating, editing, or deleting events belongs exclusively in the **Organizer / Admin Dashboard**, not on the public discovery/detail view.
- **Ticket Wallet & QR Check-in Scanner**: Viewing full digital ticket QR codes for venue admission belongs in **My Events** (`/myevents`).
- **Community Administration**: Editing community descriptions, managing club leadership, or managing member rosters belongs in the **Community Detail / Admin Page**.
- **Financial Checkout Gateway**: Complex credit card input forms belong in a secure checkout modal/page, keeping the event detail focused on content and intent.
- **General Campus Discussion Feeds**: Unrelated social chatter, general forum posts, and student buddy listings belong in dedicated Social / Community / Buddies sections.

---

## 10. Final Checklist

Use this checklist to audit the complete specification against any existing implementation:

### Page Purpose & Overview
- [ ] Clear title, subtitle, and badge establishing the Events Hub.
- [ ] Unfiltered discovery catalog accessible immediately upon load.

### Discovery & Filtering Capabilities
- [ ] Real-time text search input with search icon and quick clear button.
- [ ] Community selector strip (All Events, Turing Club, Hackathon Society, Fine Arts, AI Research, Sports, Music, Debate, Photography).
- [ ] Dropdown filter for Team Size (`Solo`, `2–4`, `5–10`, `10+`).
- [ ] Dropdown filter for Payment (`Free`, `Paid`).
- [ ] Dropdown filter for Category (`Workshop`, `Competition`, `Seminar`, `Cultural`, `Sports`, `Tech Talk`).
- [ ] Dropdown for Sorting (`Upcoming First`, `Most Popular`, `Recently Added`).
- [ ] Display of active filter chips with individual delete buttons.
- [ ] "Clear all" button to reset all filters.
- [ ] Live counter showing total matching events found.

### Event Cards (Catalog View)
- [ ] Cover image banner with date callout block (Day + Month).
- [ ] Category chip and Price tag (`FREE` / `PAID`).
- [ ] Host avatar icon, host name, and verified organizer checkmark.
- [ ] Team size format pill.
- [ ] Event title and formatted date/time.
- [ ] Venue location text.
- [ ] Hashtag topic pills.
- [ ] Live registration progress tracker (registered count vs. capacity count and visual percentage track).
- [ ] Urgency status pill (`✓ Open`, `🔥 Filling Fast`, `Almost Full`, `Sold Out`).
- [ ] Save/Bookmark button toggle.
- [ ] Secondary action ("Details") and Primary action ("Register").

### Event Detail View
- [ ] Top bar with back navigation button ("Back to Events") and breadcrumb trail.
- [ ] Hero banner image with top/bottom badges for category, price, and team size.
- [ ] Host identity row with logo avatar, host name, verified badge, and host role subtitle.
- [ ] Main event title and topic hashtag pills.
- [ ] Quick info metrics grid (Date & Time, Venue Location, Team Format, Entry Fee).
- [ ] "About This Event" narrative description section.
- [ ] Multi-phase agenda timeline (Phase 1, Phase 2, Phase 3 with titles & descriptions).
- [ ] Mandatory guidelines and rules list.
- [ ] Organiser Contact & Help Desk section (Lead coordinator name/title, desk room number/floor, support email with SLA, support phone number with hours).
- [ ] Expandable FAQ accordion (Eligibility, fees, team format, certificates, gear).
- [ ] Sticky sidebar / action card with price, seat availability progress, primary registration trigger ("Register Now" / "You're Registered!"), Save button, Share button, and quick meta summary.

### Registration Flow & Modal
- [ ] Modal dialog upon clicking "Register Now".
- [ ] Dialog displays event title, host name, and ticket pass terms.
- [ ] Cancel button and Confirm button.
- [ ] Toast notification on confirmation ("Ticket confirmed! Saved to My Events 🎟️").
- [ ] Real-time button state update to "You're Registered!" and seat count increment.

### Scenarios & Edge Cases Handled
- [ ] No results empty state with "Reset Filters" action.
- [ ] Event Not Found error page for invalid IDs.
- [ ] Sold out state (`registered >= capacity`) disabling registration.
- [ ] Bookmark persistence toggle.
- [ ] One-click copy link sharing with feedback toast.
