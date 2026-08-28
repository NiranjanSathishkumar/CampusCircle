# Complete Content & Product Specification: My Events Page

> **Scope**: All functionality, information, content sections, user actions, data structures, and state scenarios belonging to the **My Events Page** ticket wallet, enrollment management, event status tracking, digital pass modal, and registration cancellation workflow (the complete `myevents` domain).

---

## 1. Purpose of the Page

### What this page is meant to accomplish
The **My Events Page** acts as the student's personal event passbook and enrollment management dashboard. It allows students to manage all events they have registered for, view and download official digital ticket passes, track event schedules and countdown timers, review completed event history, and cancel registrations if their plans change.

### Why the user would visit it
- **Access Digital Ticket Passes**: To retrieve unique event admission passes (`TKT-XXXX-XXXX`) for entry check-in at campus venues.
- **Track Upcoming Schedule & Countdowns**: To check how many days or hours remain before an upcoming competition, workshop, or seminar begins.
- **Review Attendance History**: To verify completed events for academic credits, resume entries, or certificate claims.
- **Manage Registrations**: To cancel registrations for upcoming events they can no longer attend, freeing up seat capacity for other students.

### What problem it solves
- **Eliminates lost tickets & lost check-in details**: Consolidates all registered event passes into a single accessible portal rather than searching email inboxes.
- **Prevents no-shows & frees seat capacity**: Simple registration cancellation allows students to relinquish tickets before an event starts, reducing venue empty seats.
- **Provides event-day readiness**: Displays clear venue locations, start times, attendee names, host details, and team formats in one scannable dashboard.

---

## 2. Information That Should Exist

### Primary Information (Core Focus)
- **Event Title**: Descriptive name of the enrolled event.
- **Host / Organiser Identity**: Name of the organizing club/lab/society, host icon, and **Verified Organiser Checkmark**.
- **Date & Start Time**: Formatted event date and time string.
- **Venue & Location**: Physical campus building, room/hall number, or virtual meeting link.
- **Event Status Badge**: Dynamic status indicator (`Completed`, `Today!`, `Tomorrow`, `In X days`).
- **Event Countdown Text**: Real-time relative timing text (`Happening Today!`, `Starts Tomorrow!`, `X days left`, `X days to go`, `Event Completed`).
- **Digital Ticket Pass Actions**: Primary button to open the digital ticket pass (`My Ticket` or `View Ticket`).

### Secondary Information (Deep Context)
- **Unique Ticket Reference ID**: System-generated ticket pass identifier (e.g., `TKT-2026-0825-A1`).
- **Registration Timestamp**: Date when the user originally enrolled in the event (e.g., `2026-07-20`).
- **Event Category & Payment Status**: Classification tag (`Competition`, `Workshop`, `Cultural`, `Sports`) and payment type (`FREE` / `PAID`).
- **Team Format Requirements**: Required team structure (`Solo Entry`, `2–4 Teams`, `5–10 Squad`, `10+ Squad`).
- **Topic Tags**: Hashtags associated with the event (e.g., `#Robotics`, `#Hackathon`, `#Figma`).
- **Attendee Profile Name**: Name of the registered student account holding the ticket pass.

### Contextual Information (Overview Metrics)
- **Total Enrolled Counter**: Cumulative count of all events (upcoming + completed) the user has registered for.
- **Upcoming Events Counter**: Count of active upcoming events scheduled for future dates.
- **Completed Events Counter**: Count of past events successfully attended or concluded.
- **Saved / Bookmarked Events Counter**: Count of bookmarked events stored in the user's wishlist.

---

## 3. Features and Functionality

### Search & Enrolled Event Querying
- **Search Enrolled Events Input**: Filter registered events in real-time by matching keywords in event titles or host names.
- **Clear Search Trigger**: One-click action to reset search text input.

### Status Tab Filtering
- **All Events Tab**: Displays all enrolled events (upcoming and completed combined).
- **Upcoming Tab**: Filters events scheduled for today or future dates, sorted chronologically with nearest events first (`dateA - dateB`).
- **Completed Tab**: Filters events whose dates have passed, sorted with most recently concluded events first (`dateB - dateA`).
- **Tab Counter Badges**: Displays live numerical counts on each tab pill.

### Digital Ticket Pass Modal System
- **View Ticket Modal Trigger**: Opens a dedicated ticket overlay containing full pass details.
- **Ticket Information Details**:
  - Event Title & Category
  - Attendee Name
  - Date & Time
  - Venue Location
  - Team Format
  - Host Name & Verification Icon
  - Unique Ticket Reference ID code
- **Download Ticket Action**: Trigger to save/export the ticket pass for offline venue check-in.

### Registration Cancellation Workflow
- **Cancel Registration Trigger**: Initiates a confirmation dialog for upcoming events (disabled for completed events).
- **Cancellation Confirmation Modal**: Explanatory warning prompt displaying event title and host name, with options to "Keep Ticket" or confirm "Cancel Registration".
- **Seat Capacity Release**: Removing registration updates local enrollment state, decrements overall metrics, and releases seat capacity back to the main event engine.

---

## 4. Content Sections

### 1. Header & Page Intro
- **Content**: Badge ("MY EVENTS"), main page title ("Your Registered Events"), descriptive subtitle, search bar with search icon and clear trigger.
- **Why it matters**: Establishes personal ticket management context and provides immediate keyword search capability.

### 2. Enrollment Summary Statistics Cards
- **Content**: Grid of metric cards:
  - **Total Enrolled**: Total registered event count.
  - **Upcoming**: Active future event count.
  - **Completed**: Past concluded event count.
  - **Saved**: Bookmarked wishlist event count.
- **Why it matters**: Gives the student a high-level summary of their event participation history and upcoming commitments.

### 3. Status Navigation Bar (Filter Tabs)
- **Content**: Tab buttons for `All Events`, `Upcoming`, and `Completed`, each with icon and live count badge.
- **Why it matters**: Allows students to separate active upcoming tickets from historical completed events.

### 4. Enrolled Event Cards List
- **Content**: List of enrolled event cards, featuring event image, status badge, host avatar, host name with verified icon, event title, date/time, venue, category tag, hashtag pills, countdown text block, "My Ticket" / "View Ticket" button, and "Cancel" button (for upcoming events).
- **Why it matters**: Displays essential ticket and schedule details in a scannable list format.

### 5. Empty State & Exploration Callout
- **Content**: Empty state icon, contextual title ("You haven't enrolled in any events yet" / "No upcoming events"), explanatory text, and primary button ("Explore Events") linking to `/events`.
- **Why it matters**: Guides users with zero enrollments back to the main discovery catalog.

### 6. Digital Ticket Pass Modal
- **Content**: Ticket icon, modal title ("Your Event Ticket"), event title, divider line, detailed rows (Attendee, Date, Venue, Team, Host, Type/Payment), bold ticket ID string (`TKT-XXXX-XXXX-XX`), Close button, and Download button.
- **Why it matters**: Serves as the official admission pass for venue entry check-in.

### 7. Registration Cancellation Confirmation Dialog
- **Content**: Warning icon, title ("Cancel Registration?"), explanatory message warning that cancellation cannot be undone, "Keep Ticket" button, and red "Cancel Registration" confirm button.
- **Why it matters**: Prevents accidental ticket cancellations while enabling intentional registration drops.

---

## 5. User Actions

### Primary Actions
- **Search Enrolled Events**: Type keywords into search input to locate specific registered tickets.
- **Switch Status Tabs**: Toggle between `All Events`, `Upcoming`, and `Completed`.
- **View Ticket Pass**: Click "My Ticket" or "View Ticket" on any event card to open the ticket overlay.
- **Cancel Registration**: Click "Cancel", then confirm in the dialog to drop an upcoming event enrollment.

### Secondary Actions
- **Download Ticket Pass**: Click "Download" inside the ticket modal to save pass data.
- **Close Ticket / Cancellation Modals**: Click "Close", "Keep Ticket", `X` button, or backdrop overlay.
- **Explore Events Hub**: Click "Explore Events" button in empty states to navigate to `/events`.

### Optional / Auxiliary Actions
- **Clear Search Input**: Click `X` icon inside search bar.

---

## 6. States and Scenarios

### First-Time User (Zero Enrollments)
- Displays empty state view informing the user they haven't enrolled in any events yet.
- Prominent "Explore Events" action button directing them to the events discovery page.

### Active Enrolled User (Upcoming Events Available)
- Header stats show active counts.
- Upcoming events sorted with nearest start dates first (`dateA - dateB`).
- Countdown badges highlight urgent timing (`Happening Today!`, `Starts Tomorrow!`, `X days left`).
- "My Ticket" and "Cancel" buttons fully active.

### Completed Events Scenario
- Events whose date has passed automatically transition to `Completed` status.
- Countdown label reads `Event Completed`.
- "Cancel" button is removed; action changes to "View Ticket".
- Completed tab sorts events with most recent past events first (`dateB - dateA`).

### Search / Filter No Results Scenario
- Searching for a non-existent title displays "No matching events found" empty state.
- Switching to an empty tab (e.g., Completed tab when no past events exist) displays tab-specific empty messages.

### Loading State
- Shimmer skeletons for stats cards and event card list during backend ticket retrieval.

### Successful Cancellation Scenario
- Confirmed cancellation removes event card from list immediately.
- Updates stats counters (Total Enrolled -1, Upcoming -1).
- If list becomes empty, transitions seamlessly to empty state view.

### Logged-In vs. Logged-Out Users
- **Logged-In**: Full access to personal ticket pass wallet.
- **Logged-Out**: Redirects to login page, as ticket management requires authenticated identity.

---

## 7. Data and Contextual Requirements

### Backend / Database Sourced Data
- **User Enrolled Event Entity**:
  - `id`: Event ID reference.
  - `title`: Event title.
  - `hostName`: Host organization name.
  - `hostIcon`: FontAwesome icon class string.
  - `hostColor`: Color hex code for host theme.
  - `dateFormatted`: Human-readable date and time.
  - `rawDate`: ISO format date string (`YYYY-MM-DD`) for date calculations.
  - `venue`: Physical room/building or virtual link.
  - `teamSize`: Participation format (`Solo Entry`, `2–4 Teams`, etc.).
  - `payment`: Pricing status (`FREE` | `PAID`).
  - `category`: Activity classification tag.
  - `tags`: Array of string hashtags.
  - `registered`: Current total registered attendees.
  - `capacity`: Total venue capacity.
  - `imageUrl`: Event cover image URL.
  - `ticketId`: Unique generated ticket reference code (e.g., `TKT-2026-0825-A1`).
  - `registeredOn`: Date user enrolled in event.

### User-Generated & Session Data
- `events`: Array of user's enrolled event objects.
- `activeTab`: Selected status tab string (`"all"`, `"upcoming"`, `"completed"`).
- `searchQuery`: Search string input.
- `ticketEvent`: Selected event object currently displayed in ticket modal (or null).
- `cancelEvent`: Selected event object currently displayed in cancellation dialog (or null).

### Data Relationships
- **User to Enrolled Events**: One-to-Many (A single student profile holds multiple event ticket passes).
- **Ticket Pass to Main Event Engine**: Linked via `id`; canceling a ticket releases 1 seat capacity back to the main event entity.

---

## 8. Edge Cases

- **Same-Day Event ("Happening Today!")**: Countdown logic calculates `days === 0`, applying urgent alert styling and "Today!" status badge.
- **Event Starting Tomorrow ("Starts Tomorrow!")**: Countdown logic calculates `days === 1`, highlighting imminent start time.
- **Overlapping Enrolled Events**: Student is registered for two events at the same date/time; warnings display on both event cards.
- **Virtual / Online Event Venue**: Venue string displays meeting link or platform details (e.g., "Zoom Live Stream / Discord Stage") instead of building room.
- **Postponed Event**: Event date updated by host; card highlights updated schedule with alert tag.

---

## 9. Content That Should NOT Be on the Page

- **Full Event Catalog & Category Exploration**: Unenrolled event discovery belongs on the main **Events Hub** (`/events`), not inside personal enrolled tickets.
- **Organizer Event Creation & Participant Export**: Event hosting management belongs in the **Organizer Dashboard** (`/organizer`).
- **Payment Processing Gateway**: Financial transaction processing belongs in a dedicated payment checkout workflow, keeping My Events focused on ticket viewing and schedule management.

---

## 10. Final Checklist

Use this checklist to audit the complete specification against any existing implementation:

### Page Header & Search
- [ ] Page title ("Your Registered Events"), subtitle, and badge ("MY EVENTS").
- [ ] Real-time search input bar with search icon and clear trigger.

### Enrollment Summary Statistics
- [ ] Total Enrolled metric card with live count.
- [ ] Upcoming Events metric card with live count.
- [ ] Completed Events metric card with live count.
- [ ] Saved Events metric card with live count.

### Status Filter Tabs
- [ ] `All Events` tab with icon and count badge.
- [ ] `Upcoming` tab with icon and count badge.
- [ ] `Completed` tab with icon and count badge.
- [ ] Automatic sorting adjustment (Upcoming: nearest first; Completed: recent first).

### Enrolled Event Cards List
- [ ] Cover image banner with status badge (`Completed`, `Today!`, `Tomorrow`, `In X days`).
- [ ] Host avatar icon, host name, and verified organizer checkmark.
- [ ] Event title and formatted date/time.
- [ ] Venue location text.
- [ ] Category tag and hashtag topic pills.
- [ ] Countdown block (`Happening Today!`, `Starts Tomorrow!`, `X days left`, `Event Completed`).
- [ ] Primary "My Ticket" / "View Ticket" button.
- [ ] "Cancel" button for upcoming events (hidden for completed events).

### Digital Ticket Pass Overlay Modal
- [ ] Modal trigger upon clicking ticket button.
- [ ] Ticket icon, title ("Your Event Ticket"), and event title.
- [ ] Attendee name string.
- [ ] Formatted date and time.
- [ ] Venue location string.
- [ ] Team format string.
- [ ] Host name and category/payment details.
- [ ] Bold unique ticket reference ID (`TKT-XXXX-XXXX-XX`).
- [ ] Close button and Download ticket button.

### Registration Cancellation Workflow
- [ ] Cancellation modal trigger upon clicking "Cancel".
- [ ] Warning icon and title ("Cancel Registration?").
- [ ] Explanatory text showing event title and host name.
- [ ] "Keep Ticket" button and "Cancel Registration" confirm button.
- [ ] State update removing card and decrementing stats on confirmation.

### Empty States & Scenarios Handled
- [ ] Empty state with "Explore Events" button linking to `/events`.
- [ ] Search query empty state.
- [ ] Completed tab empty state.
- [ ] Automatic transition to completed status when event date passes.
