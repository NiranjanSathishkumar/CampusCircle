# CampusCircle — Design System & Visual Direction

*This document is written to be pasted directly into AI design tools (v0, Galileo, Lovable, Figma AI, etc.) to keep every screen visually consistent. A ready-to-use summary prompt is at the very end.*

---

## 1. Design Philosophy

CampusCircle should feel like **the platform students actually want to open**, not another portal the college makes them use. The bar isn't "looks nice" — it's "looks like something a real, funded startup built for Gen Z," the same energy as Luma, Partiful, or Discord, not the navy-and-white template energy of a typical college website.

Three words to hold onto through every screen: **Bold. Warm. Alive.**

---

## 2. Color System

Avoid the reflexive "college blue" — it reads institutional and dull by default. Instead, anchor on a vibrant primary with a warm accent for contrast and energy.

| Token | Hex | Usage |
|---|---|---|
| Primary (Electric Indigo) | `#5B4FE9` | Primary buttons, links, active states, nav highlights |
| Accent (Sunset Coral) | `#FF6B5A` | CTAs that need to pop — "Register," confetti, badges |
| Ink (near-black) | `#12121A` | Body text, dark surfaces (nav bar, footers) |
| Surface (off-white) | `#FAFAFA` | Page background — not pure white, softer |
| Success | `#2ED573` | Payment success, checked-in status |
| Warning | `#FFB020` | Waitlist, "filling up" capacity indicator |
| Error | `#E8483C` | Failed payment, form errors |
| Neutral-100 → 900 | grayscale ramp | Borders, secondary text, disabled states |

**Rule of thumb:** Indigo is the "brand" color (always present, calm-confident). Coral is the "energy" color (used sparingly, only where you want the eye to go — CTAs, celebratory moments, urgency). Using coral everywhere kills its impact — restraint is what makes it feel exciting when it does appear.

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display/Headings | **Space Grotesk** (or Clash Display) | Geometric, confident, distinct from the serif/Times feel of institutional sites |
| Body/UI text | **Inter** | Highly readable at small sizes — forms, dashboards, long text |

**Scale:** Display 48/40 · H1 32 · H2 24 · H3 20 · Body 16 · Caption 13 (all in px, line-height ~1.4-1.5 for body). Use bold (600-700) headings against regular (400) body — the contrast itself reads as "modern."

---

## 4. Spacing, Shape & Elevation

- **Spacing scale:** 4px base unit (4, 8, 12, 16, 24, 32, 48, 64) — consistent rhythm across every screen
- **Corner radius:** generous — 12px for inputs/small elements, 16-20px for cards, fully rounded (`9999px`) for pills/tags/primary buttons. Sharp corners read corporate/dull; soft rounded shapes read modern and approachable
- **Shadows:** soft, layered, low-opacity (`0 4px 20px rgba(0,0,0,0.06)`) — never harsh drop shadows. On hover, lift cards slightly (translateY + larger shadow) for a tactile feel

---

## 5. Iconography & Imagery

- **Icons:** rounded-stroke icon set (Lucide or Phosphor), consistent stroke width throughout — never mix icon styles
- **Photography:** real, vibrant campus/event photography for hero banners and event cards — bright, candid, energetic shots, not stiff posed stock photos
- **Illustration:** simple, flat-color illustrations (matching the Indigo/Coral palette) for empty states ("No events yet," "You haven't followed anyone") — keeps even empty screens feeling designed, not broken
- **Avoid entirely:** generic corporate clipart (handshake graphics, generic "diverse students smiling at laptop" stock photos) — this is the single fastest way to look like a dull institutional site

---

## 6. Motion & Microinteractions

Small animations are what separate "looks like a form" from "feels like a product":
- Buttons: subtle scale-down on press (0.97), smooth color transition on hover
- Cards: lift + shadow increase on hover
- **Registration success screen: confetti burst animation** around the QR code — this is a cheap, high-impact moment worth actually building; it's the emotional peak of the user journey
- Page transitions: fade/slide, never a hard reload feel
- Loading states: skeleton screens (shimmering placeholder shapes), not spinners — spinners read dated

---

## 7. Component Notes

- **Buttons:** Primary = filled Indigo, fully rounded, bold text. Secondary = outline, Indigo border/text. Destructive actions = Error red, used sparingly
- **Tags/Chips:** rounded pill shape, tinted background (e.g. light indigo bg + indigo text) rather than solid fill for anything non-primary — keeps a feed full of tags from feeling noisy
- **Capacity indicator:** a slim progress bar under each event card, color-shifting green → amber → coral as it fills — turns a boring number ("32/50") into a visual, slightly urgent cue
- **Forms:** clear top-aligned labels (not placeholder-only), rounded inputs, Indigo focus ring, inline validation instead of error summaries at the top
- **Navigation:** sticky top bar with a subtle frosted-glass blur on scroll — a small detail that reads distinctly modern

---

## 8. Screen-Specific Direction

**Discover Feed (Home)** — the most "energetic" screen. Card-wall layout, colorful tag chips, a featured-events carousel banner up top. This is the screen that should feel most alive.

**Event Detail** — large hero image, bold title, the capacity progress bar, and (if a registration deadline exists) a countdown — urgency drives action.

**Registration Confirmation** — the celebration moment. Confetti, a large QR code, bold "You're in! 🎉" messaging. Don't undersell this screen — it's the payoff for the whole registration flow.

**Student Profile** — warmer and more editorial than a typical resume page: a soft accent-colored banner, colorful skill-tag pills, but still restrained enough to read as professional (this page may be judged by other students, and eventually recruiters).

**Admin Dashboard & Analytics** — deliberately more restrained than student-facing screens. Admins live here for extended sessions and need clarity over energy: a clean light content area, a dark or neutral sidebar, and the Indigo/Coral palette used only for chart highlights and key stats — not decoratively. Professional, not dull; calm, not sterile.

---

## 9. Do's and Don'ts

| Do | Don't |
|---|---|
| Bold Indigo/Coral color blocks | Navy-and-white "official" gradient headers |
| Space Grotesk / geometric headings | Times New Roman or default serif anywhere |
| Generous whitespace, rounded shapes | Cramped layouts, sharp corporate rectangles |
| Real, candid campus photography | Generic corporate stock clipart |
| Microinteractions (hover lift, confetti) | Static pages with zero motion |
| Skeleton loading states | Spinner-only loading, or no loading state at all |

---

## 10. Ready-to-Paste AI Design Prompt

Use this as a starting brief in your AI design tool of choice, then paste individual screen descriptions from the project's Detailed Project Report on top of it:

> Design a modern, energetic web platform for college students called CampusCircle. Visual style: bold and vibrant, not corporate or institutional. Primary color: electric indigo (#5B4FE9). Accent color: sunset coral (#FF6B5A), used sparingly for CTAs and celebratory moments. Background: soft off-white (#FAFAFA). Typography: Space Grotesk for headings (bold, geometric), Inter for body text. Generous rounded corners (12-20px), soft layered shadows, pill-shaped tags and buttons. Real vibrant photography over stock clipart. Include hover lift effects on cards and buttons. The overall feel should be closer to Luma, Partiful, or Discord than a typical university website — think startup-energy, not institutional-portal energy.
