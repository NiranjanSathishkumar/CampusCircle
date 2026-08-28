# Complete Content & Product Specification: Navbar Component

> **Scope**: All functionality, information, content sections, user actions, data structures, state scenarios, and notification controls belonging to the global **Navbar Component** and mobile navigation drawer (the complete `Navbar` domain).

---

## 1. Purpose of the Component

### What this component is meant to accomplish
The **Navbar Component** serves as the persistent top-level navigation anchor, brand header, user authentication control panel, and notification center across the entire web application. It enables seamless navigation between main campus hubs (Discover, Events, Communities, Buddies, My Events, Profile), manages user login/logout states, and delivers real-time notifications for campus activities.

### Why the user would interact with it
- **Global Navigation**: To move quickly between core sections of the app (Discover, Events, Communities, Buddies, My Events, Profile) from any page.
- **Check Notifications**: To view alerts for upcoming registered events, club membership approvals, post likes, and issued certificates.
- **Manage Authentication**: To log in, sign up, view their personal profile, or log out.
- **Mobile Access**: To access a full-featured navigation drawer on mobile viewports.

### What problem it solves
- **Eliminates navigation friction**: Provides single-click access to all primary features regardless of current scroll position or active page.
- **Centralizes notification management**: Prevents missed event deadlines by aggregating real-time reminders into a single bell drop-down.
- **Provides persistent identity awareness**: Displays current user avatar, verified status, and login state at all times.

---

## 2. Information That Should Exist

### Primary Information (Core Focus)
- **Brand Identity**: Application logo (graduation-cap icon) and brand title (`CampusCircle`).
- **Primary Public Navigation Items**:
  - `Discover` (`/discover`)
  - `Events` (`/events`)
  - `Communities` (`/communities`)
  - `Buddies` (`/buddies`)
- **Authenticated Personal Navigation Items**:
  - `My Events` (`/myevents`)
  - `My Profile` (`/profile` or `/profile/:id`)
- **Notification Center Indicator**: Bell button displaying an active numerical badge for unread notifications.
- **Authentication State Controls**:
  - **Logged-Out**: `Login` link (`/login`) and `Sign up` link (`/signup`).
  - **Logged-In**: User avatar image/placeholder link, user profile shortcut, and `Logout` action button.
- **Mobile Navigation Trigger**: Hamburger menu control for small viewports.

### Secondary Information (Dropdowns & Drawers)
- **Notification Panel Content**:
  - Header: Title ("Notifications"), unread tag (`X new`), and "Mark all read" bulk action trigger.
  - Filter Tabs: `All (total count)` and `Unread (unread count)`.
  - Notification Item: Category icon, title, descriptive subtext, relative time string (e.g. "2h ago", "1d ago"), unread status indicator dot, read/unread toggle button, and dismiss/delete button.
  - Footer: "View all notifications" trigger.
- **Mobile Drawer User Summary**:
  - User avatar, full user name, verified badge status ("Verified Student"), and direct profile link chevron.
  - Categorized section headers ("Explore Campus", "Personal Space").

---

## 3. Features and Functionality

### Global Route Navigation & Active Route Highlighting
- **Active Page Detection**: Automatically highlights the active navigation item corresponding to current URL route (`NavLink` integration).
- **Sub-Route Resolution**: Dynamically resolves the logged-in user's profile path (e.g., `/profile/123` based on authenticated session data in `localStorage`).

### Scroll-Aware Header Elevation
- **Scroll Detection**: Monitors page scroll position (`window.scrollY > 8`) to apply header shadow elevation when scrolling down content.

### Interactive Notification Center
- **Toggle Dropdown**: Single-click on the bell button opens or closes the notification dropdown panel.
- **Outside Click Dismissal**: Automatically closes the notification panel when user clicks anywhere outside the notification container.
- **Unread Badge Counter**: Displays total count of unread notifications; badge disappears when unread count reaches zero.
- **Filter Notifications**: Switch view between `All` items and `Unread` items.
- **Individual Read/Unread Toggle**: Click item or toggle icon to switch read status for a specific notification.
- **Dismiss Notification**: Delete individual notification from list.
- **Bulk Mark All Read**: Single click converts all unread notifications to read status.

### Authentication & Session Management
- **Dynamic View State**: Renders Login/Sign up buttons when logged out; renders User Avatar and Logout button when logged in.
- **Logout Execution**: Triggers logout callback (`onLogout`), clears user session tokens, and navigates seamlessly to `/discover`.

### Responsive Mobile Drawer System
- **Hamburger Toggle**: Button to toggle mobile menu drawer (`aria-expanded` state).
- **Body Scroll Locking**: Automatically disables background page scrolling (`overflow: hidden`) while mobile drawer is open.
- **Backdrop Dismissal**: Click backdrop overlay to close mobile drawer.
- **Auto-Close on Navigation**: Clicking any mobile navigation link closes the drawer automatically.

---

## 4. Content Sections

### 1. Brand Logo & Title Block
- **Content**: Graduation cap icon and brand title string (`CampusCircle`).
- **Why it matters**: Anchors brand identity and serves as home link.

### 2. Desktop Navigation Bar
- **Content**: Public links (Discover, Events, Communities, Buddies) and conditional authenticated links (My Events).
- **Why it matters**: Provides main navigation routes for desktop viewports.

### 3. Notification Hub & Dropdown Panel
- **Content**: Notification bell button with unread count badge, dropdown panel header with "Mark all read", filter tabs (All, Unread), notifications list with icons, titles, descriptions, timestamps, read/unread toggles, delete buttons, empty state ("All caught up!"), and footer link.
- **Why it matters**: Keeps students updated on time-sensitive campus events, club approvals, and social interactions.

### 4. Desktop Authentication Actions
- **Content**: Login and Sign up buttons (logged out) OR User Avatar link and Logout button with exit icon (logged in).
- **Why it matters**: Manages user session actions and profile access.

### 5. Mobile Navigation Drawer
- **Content**: Hamburger button, backdrop overlay, user identity card (avatar, name, verified badge), "Explore Campus" section links, "Personal Space" section links (My Events, My Profile), and mobile auth buttons.
- **Why it matters**: Ensures complete functionality on mobile viewports.

---

## 5. User Actions

### Primary Actions
- **Navigate Main Hubs**: Click Discover, Events, Communities, Buddies, or My Events.
- **Access Profile**: Click user avatar or "My Profile" link.
- **Log In / Sign Up**: Click "Login" or "Sign up" buttons.
- **Log Out**: Click "Logout" button.
- **Toggle Notifications**: Click notification bell button.

### Secondary Actions
- **Filter Notifications**: Switch between "All" and "Unread" tabs inside dropdown.
- **Mark Notification Read / Unread**: Click individual notification card or checkmark icon.
- **Dismiss Notification**: Click `X` icon on notification card.
- **Mark All Notifications Read**: Click "Mark all read" in notification panel header.
- **Toggle Mobile Drawer**: Click hamburger button or backdrop overlay.

---

## 6. States and Scenarios

### Logged-Out State
- Public navigation links displayed (Discover, Events, Communities, Buddies).
- Personal Space links (My Events) hidden.
- Auth section displays "Login" and "Sign up" buttons.

### Logged-In State
- Public + Personal links displayed (My Events added).
- Auth section displays user avatar image/placeholder and "Logout" button.
- Mobile drawer displays User Identity card ("Verified Student").

### Notification States
- **Has Unread Notifications**: Bell shows badge counter; notification list displays unread dots and highlighted cards.
- **All Notifications Read**: Bell badge hidden; list displays read styling.
- **Empty Notifications**: Displays empty state card ("All caught up!" with bell-slash icon).
- **Filtered Unread Empty**: Displays specific empty note ("No unread notifications at the moment.").

### Header Scroll Elevation State
- Top of page (`scrollY <= 8`): Standard header appearance.
- Scrolled down (`scrollY > 8`): Elevated shadow header appearance.

### Mobile Drawer States
- Closed: Standard header with hamburger icon.
- Open: Backdrop overlay active, drawer slide-in, background body scroll locked (`overflow: hidden`).

---

## 7. Data and Contextual Requirements

### Global Auth State
- `isLoggedIn`: Boolean flag indicating current authentication state.
- `savedUser`: User object stored in `localStorage` containing `id`, `_id`, `name`, `profilePicture`.
- `profilePath`: Resolved route path for current user profile.
- `avatarUrl`: Media URL for uploaded user profile picture.

### Notification Item Data Schema
- `id`: Unique notification identifier.
- `icon`: FontAwesome icon class string.
- `color`: Icon accent color string.
- `bg`: Icon background color string.
- `title`: Notification title text.
- `desc`: Notification descriptive subtext.
- `time`: Relative time string (e.g. "2h ago", "1d ago").
- `unread`: Boolean flag for read status.

---

## 8. Edge Cases

- **User Profile ID Missing**: Falls back gracefully to generic `/profile` route if user ID is missing from local storage.
- **Missing Profile Picture**: Falls back to user icon placeholder when profile image fails to load or is unprovided.
- **Window Resize During Mobile Menu Open**: Resizing window automatically retains correct scroll lock cleanups.
- **All Notifications Dismissed**: Notification list smoothly transitions to empty state view without errors.

---

## 9. Content That Should NOT Be on the Component

- **Full Page Search Bars & Query Results**: Search input forms belong on individual pages (Events search, Buddies search, Communities search).
- **Detailed User Profile Forms**: Full profile editing belongs on the **Profile Page** (`/profile`).
- **Full Event Check-in Details**: Detailed ticket passes belong in **My Events** (`/myevents`).

---

## 10. Final Checklist

Use this checklist to audit the complete specification against any existing implementation:

### Brand & Main Navigation
- [ ] Graduation cap logo and brand title (`CampusCircle`) linking to home (`/`).
- [ ] Active route highlighting on main nav links (Discover, Events, Communities, Buddies).
- [ ] Conditional navigation link for `My Events` when logged in.
- [ ] Scroll-aware header shadow elevation on page scroll.

### Notification Center
- [ ] Bell icon button with unread count badge indicator.
- [ ] Notification dropdown panel with outside-click dismissal.
- [ ] Header with unread count tag and "Mark all read" button.
- [ ] Filter tabs (`All` vs `Unread`).
- [ ] Notification cards with category icon, title, description, timestamp, and unread dot.
- [ ] Read/Unread toggle action per notification.
- [ ] Dismiss/Delete action per notification.
- [ ] Empty state view ("All caught up!").

### Authentication & User Controls
- [ ] Logged-out view displaying Login link and Sign up button.
- [ ] Logged-in view displaying User Avatar link (with active route highlight) and Logout button.
- [ ] Dynamic user profile route resolution (`/profile/:id`).
- [ ] Logout action execution (session clearing + redirect to `/discover`).

### Mobile Drawer Menu
- [ ] Hamburger toggle button with `aria-expanded` attributes.
- [ ] Background body scroll locking while mobile drawer is open.
- [ ] Backdrop click-to-close overlay.
- [ ] User identity header in mobile drawer when logged in.
- [ ] Categorized link sections ("Explore Campus", "Personal Space").
- [ ] Mobile navigation links with icons and right-arrow chevrons.
- [ ] Auto-closing drawer upon mobile link click.
- [ ] Mobile auth buttons in drawer footer.
