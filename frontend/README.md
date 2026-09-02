# CampusCircle

A campus engagement platform for SIES Graduate School of Technology — event discovery, peer networking, and community directories in one place. See [PRODUCT.md](PRODUCT.md) for product scope and principles.

## Stack

- React 19 + Vite 6
- Tailwind CSS 4
- Vanilla CSS per page/feature

## Getting started

```bash
npm install
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build to dist/
npm run preview  # preview the production build
npm run lint      # run eslint
```

## Project structure

The app has three audiences — students (public), organizers, and admins. The top
level of `src/` mirrors that split.

```
src/
  app/                    # composition root
    main.jsx              #   React entry
    App.jsx               #   route table + top-level providers
    global.css            #   Tailwind entry, design tokens, base styles

  shared/                 # used by two or more of the three audiences
    components/           #   presentational primitives (Logo, ViewToggle, ...)
    behaviors/            #   mounted-but-invisible (ScrollToTop, redirects, ...)
    auth/                 #   AuthContext + useAuth / useAdminAuth / useOrganizerAuth
    hooks/                #   useFocusTrap, useViewMode, useViewTransition
    utils/                #   formatting helpers used by more than one audience

  layouts/                # page chrome
    public/               #   Navbar, Footer + their config
    portal/               #   shell shared by BOTH portals below
      portal-shell.css    #     sidebar / topbar frame (barrel: @imports shell/)
      portal-widgets.css  #     shared stat/chart/badge/form widget styles (barrel: @imports widgets/)
      components/         #     EmptyState, StatCard, BarList, StatusPill

  features/               # student-facing, one folder per feature
    events/               #   EventsPage.jsx — the route component only
      eventsService.js    #   feature logic
      eventsConstants.js  #   option sets
      eventsFilters.js    #   search / sort / format helpers
      components/         #   EventCard, EventDetailPanel, EventsToasts, ...
      events.css          #   barrel: @imports styles/ in cascade order
      styles/             #   events-base, -header, -toolbar, -catalog, ...
    landing/ auth/ discover/ communities/ buddies/ my-events/ profile/ legal/

  portal/
    admin/                # AdminLayout + dashboard, students, communities, audit-log, settings
    organizer/            # OrganizerLayout + dashboard, events, roster, recruitment,
                          #   analytics, posts, achievements, settings

  mocks/                  # stand-in data until the backend lands (*.mock.js)

public/
  media/                  # static assets served as-is
```

### Conventions

**Imports use the `@/` alias, never `../..`.** `@/` resolves to `src/` (configured in
[vite.config.js](vite.config.js) and [jsconfig.json](jsconfig.json)). Only same-folder
imports stay relative:

```js
import StatCard from '@/layouts/portal/components/StatCard';
import './adm-dashboard.css';
```

**Dependencies point inward.** `features/` and `portal/` may import from `shared/`,
`layouts/`, and `mocks/` — never from each other. If two features need the same thing,
it moves up to `shared/` or `layouts/portal/`, it does not get imported sideways.

**Filenames are unique across the whole repo.** No two files share a basename, so
fuzzy-open and editor tabs are never ambiguous. A CSS file is named for the class
prefix it contains, which is what makes portal styles distinguishable:

| File | Class prefix |
|---|---|
| `features/events/events.css` | `.events-` |
| `portal/organizer/events/org-events.css` | `.org-` |
| `portal/admin/dashboard/adm-dashboard.css` | `.adm-` |
| `layouts/public/navbar.css` | `.cc-` |

**A `*Page` is a route; anything else is a component.** `EventDetailPanel`,
`CommunityDetailPanel`, and `BuddyDetailPanel` render *inside* their list page rather
than at their own route, so they live in `components/` and are not named `*Page`.

**Mock data is marked as such.** Everything in `mocks/` is `*.mock.js` so the modules
to delete when the API arrives are obvious at a glance. Real logic lives in services
(e.g. [eventsService.js](src/features/events/eventsService.js)).

**A page file holds the route component and nothing else.** Constants, helpers and
child components each live in their own module beside it. Where a page renders a set
of alternatives — wizard steps, dashboard tabs, builder modes — each one is its own
file under `steps/`, `tabs/` or a named folder:

```
portal/organizer/events/
  OrganizerCreateEventPage.jsx     # wizard shell + state
  steps/IdentityStep.jsx           # one file per step
  createEventTemplates.js
```

State stays in the page and is passed down explicitly. Long prop lists are deliberate:
they make the coupling visible instead of hiding it behind shared mutable scope. Moving
state into the child would also change behaviour, since a conditionally-rendered child
unmounts and would lose it on every tab switch.

**Large stylesheets are barrels.** A `<feature>.css` over ~800 lines becomes a list of
`@import`s pointing at `styles/`, split on its existing section comments:

```css
/* Events hub styles.
   Split into 10 sections; imported in cascade order. */
@import './styles/events-base.css';
@import './styles/events-header.css';
```

Order is the cascade, so parts must stay contiguous and keep their original sequence —
append a new part at the position its rules need, never re-sort the list. Components do
not import CSS; the page that owns the barrel does, exactly once. Keep `styles/` flat —
if a section itself gets split, its parts stay flat too (`events-detail-hero.css`, not
a nested `styles/detail/`); a barrel that imports another barrel is a sign to merge the
two lists into one, one level deep.

**"Shared" is a claim, not a default.** Only put a file in `shared/` (or name a barrel
`portal-widgets.css` / `portal-shell.css` rather than something portal-specific) if it
is actually used from more than one place that name promises. `shared/utils/dateRange.js`
and `dateUtils.js` used to live there but were each read by exactly one feature —
they're now `portal/organizer/analyticsTimeframe.js` and `features/events/eventsDateUtils.js`.
Before adding to `shared/`, grep for existing users of the name you're about to reuse;
before *leaving* something in `shared/`, check it still has two.
