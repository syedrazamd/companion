# CompanionApp — Master Project Plan
> **Hand this file to any AI tool to instantly understand the full project.**
> No extra explanation needed. Read this file top to bottom before writing any code.

---

## 1. What This App Is

**CompanionApp** is an Uber-like marketplace where users book verified human companions for social activities — mall trips, coffee dates, movies, outdoor walks.

- **NOT** a dating app. **NOT** an escort service.
- A social companionship marketplace. Platonic only.
- Think: Uber's booking UX applied to renting a person's time for social outings.

**Current goal:** Build a complete, polished **frontend demo** to present to the client. No real backend yet. All data is mocked. Goal is to impress, show the full flow, and get client sign-off before building the real backend.

**Two user types:**
1. **User** — books a companion for an activity
2. **Partner** — a verified individual who lists themselves and earns money per booking

**Platform takes a cut** of every booking. Partners set their own hourly rate.

---

## 2. Tech Stack — Exact Versions

```
Framework:     Vite 7 + React 19 + TypeScript 5.9
Routing:       React Router DOM v7
Styling:       Tailwind CSS v4 (via @tailwindcss/vite plugin)
Icons:         Lucide React v1.18
Toasts:        Sonner v2
Utilities:     clsx 2.1 + tailwind-merge 3.4
Build:         vite-plugin-singlefile (single HTML output for demo)
Backend:       NONE yet — all data is mock arrays
```

**Important Tailwind v4 note:** This project uses Tailwind CSS v4 with the new `@import "tailwindcss"` syntax in CSS. There is NO `tailwind.config.js` file. Custom tokens are defined inside `@theme {}` blocks in `src/index.css`. Do NOT create a `tailwind.config.js` — it will break the build.

**Path aliases:** `@/` maps to `src/` — configured in vite.config and tsconfig.

---

## 3. Project File Structure

```
src/
├── App.tsx                          # Root router — all routes defined here
├── main.tsx                         # Entry point
├── index.css                        # Global styles + Tailwind v4 @theme tokens
│
├── pages/                           # One file per page/route
│   ├── HomePage.tsx                 # / — Discovery feed, partner grid
│   ├── ExplorePage.tsx              # /explore — Search + filter
│   ├── BookingsPage.tsx             # /bookings — User booking history
│   ├── ProfilePage.tsx              # /profile — User profile + settings
│   ├── PartnerPage.tsx              # /partner/:id — Partner detail page
│   └── AuthPages.tsx                # /login, /login/verify, /partner-signup
│
├── components/
│   ├── layouts/
│   │   ├── MainLayout.tsx           # Authenticated shell — sidebar + bottom nav
│   │   └── AuthLayout.tsx           # Auth shell — full screen, no nav
│   ├── ui/
│   │   └── index.tsx                # Shared UI primitives (Button, Card, Badge, Avatar etc.)
│   ├── BookingSheet.tsx             # 3-step booking bottom sheet — NOT yet wired to PartnerPage
│   ├── FilterSheet.tsx              # Filter bottom sheet for ExplorePage
│   ├── PartnerCard.tsx              # Reusable partner card used in grids
│   ├── ScheduleMeetingModal.tsx     # Duplicate booking flow on PartnerPage — needs removal
│   └── Shared.tsx                   # ScrollToTop, ErrorBoundary, LoadingBar, EmptyState, skeletons
│
├── lib/
│   ├── types/index.ts               # ALL TypeScript interfaces — single source of truth
│   ├── mock-data/
│   │   ├── partners.ts              # 12 mock Partner objects
│   │   ├── bookings.ts              # 5 mock Booking objects
│   │   ├── reviews.ts               # 20 mock Review objects
│   │   └── user.ts                  # 1 mock UserProfile object
│   ├── hooks/
│   │   └── usePartnerFilters.ts     # Filter + sort logic for partner lists
│   └── toast.ts                     # Typed toast helper wrappers
│
└── utils/
    ├── cn.ts                        # clsx + tailwind-merge utility
    └── index.ts                     # General helper functions
```

---

## 4. TypeScript Types — Single Source of Truth

All types live in `src/lib/types/index.ts`. Never redefine them elsewhere. The key interfaces:

```typescript
type ActivityType = 'mall' | 'coffee' | 'movies' | 'outdoor'
type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
type SortOption = 'rating' | 'price_low' | 'price_high' | 'newest'

interface Partner {
  id: string; name: string; age: number; gender: string; bio: string;
  avatar: string; rating: number; reviewCount: number; hourlyRate: number;
  activities: ActivityType[]; location: string; isVerified: boolean;
  isOnline: boolean; images: string[]; badges: string[]; joinedDate?: string;
}

interface Booking {
  id: string; userId: string; partnerId: string; partner?: Partner;
  activity: ActivityType; date: string; startTime: string; duration: number;
  totalAmount: number; status: BookingStatus; meetingPoint: string;
  cancelReason?: string;
}

interface Review {
  id: string; partnerId: string; userId: string; userName: string;
  userAvatar: string; rating: number; comment: string; date: string;
}

interface UserProfile {
  id: string; name: string; avatar: string; phone: string; isVerified: boolean;
  stats: { totalBookings: number; totalSpent: number;
           favoriteActivity: ActivityType; memberSince: string; }
}

interface FilterState {
  activity: ActivityType | null; minRating: number; maxPrice: number;
  gender: string | null; sortBy: SortOption; verifiedOnly: boolean;
}

interface BookingDraft {
  partnerId: string; activity: ActivityType; date: string;
  startTime: string; duration: number; meetingPoint: string; totalAmount: number;
}
```

---

## 5. Design System — Uber Dark App Style

The entire app must look like **Uber's mobile app** — dark background, white text, white pill CTAs. This is different from Uber's website (which is light). Think premium, dark, minimal.

### 5.1 Color Tokens (define in `src/index.css` inside `@theme {}`)

```css
@theme {
  /* Backgrounds */
  --color-bg-base:      #111111;   /* Page background — darkest */
  --color-bg-surface:   #1c1c1c;   /* Card surface */
  --color-bg-elevated:  #252525;   /* Elevated card / modal */
  --color-bg-input:     #2a2a2a;   /* Input fields */
  --color-bg-pressed:   #333333;   /* Pressed / active state */

  /* Text */
  --color-text-primary:   #ffffff;  /* Headings, primary content */
  --color-text-secondary: #a0a0a0;  /* Supporting text, captions */
  --color-text-muted:     #6b6b6b;  /* Placeholder, fine print */

  /* Borders */
  --color-border:       #2e2e2e;   /* Dividers, card borders */
  --color-border-light: #3a3a3a;   /* Subtle separators */

  /* CTA — polarity-flipped from Uber website */
  --color-cta-bg:       #ffffff;   /* Primary pill background */
  --color-cta-text:     #000000;   /* Primary pill text */
  --color-cta-subtle:   #2a2a2a;   /* Subtle/ghost pill background */

  /* Semantic */
  --color-online:       #22c55e;   /* Online indicator */
  --color-verified:     #3b82f6;   /* Verified badge */
  --color-warning:      #f59e0b;   /* Warnings */
  --color-danger:       #ef4444;   /* Errors, SOS, cancel */
  --color-success:      #22c55e;   /* Success states */

  /* Font */
  --font-sans: "Inter", ui-sans-serif, system-ui, Helvetica Neue, Arial, sans-serif;
}
```

### 5.2 Typography Scale (mirrors Uber's token naming)

| Role | Size | Weight | Use |
|---|---|---|---|
| display-xxl | 52px / lh 64px | 700 | Hero headlines |
| display-xl | 36px / lh 44px | 700 | Section headlines |
| display-lg | 32px / lh 40px | 700 | Card headlines |
| display-md | 24px / lh 32px | 700 | Card titles |
| display-sm | 20px / lh 28px | 700 | Sub-headings |
| body-lg | 18px / lh 24px | 500 | Lead paragraphs |
| body-md | 16px / lh 24px | 400 | Default body |
| body-sm | 14px / lh 20px | 400 | Captions, metadata |
| body-sm-strong | 14px / lh 16px | 500 | Chip labels, bold captions |
| caption | 12px / lh 20px | 400 | Fine print |
| button | 16px / lh 20px | 500 | All button labels |

**Rules:** Sentence-case everywhere. No all-caps headlines. No letter-spacing on headings. Inter weight 700 for all display sizes.

### 5.3 Border Radius Scale

| Token | Value | Use |
|---|---|---|
| none | 0px | Full-bleed sections, raw image edges |
| md | 8px | Input fields |
| lg | 12px | Small secondary cards |
| xl | 16px | All cards, modals, booking sheet |
| pill | 999px | **Every button, chip, badge, pill** — brand signature |
| full | 9999px | Avatar circles only |

**The pill (999px) is the #1 design signature. Every interactive element is a pill.**

### 5.4 Elevation / Shadow

| Level | Shadow | Use |
|---|---|---|
| 0 — Flat | none | Default cards on dark surface |
| 1 — Subtle | `0 4px 16px rgba(0,0,0,0.4)` | Elevated cards |
| 2 — Card | `0 4px 24px rgba(0,0,0,0.6)` | Modals, booking sheet, form cards |
| 3 — Float | `0 2px 8px rgba(0,0,0,0.5)` | Floating pill buttons |

### 5.5 Component Patterns

**Primary CTA Button:**
```
bg: #ffffff  text: #000000  radius: 999px  padding: 12px 20px
font: 16px/500  hover: bg #e5e5e5  active: scale-95
```

**Subtle/Ghost Button:**
```
bg: #2a2a2a  text: #ffffff  radius: 999px  padding: 12px 20px
font: 16px/500  hover: bg #333333
```

**Danger Button (cancel/SOS):**
```
bg: #ef4444  text: #ffffff  radius: 999px  padding: 12px 20px
```

**Card:**
```
bg: #1c1c1c  border: 1px solid #2e2e2e  radius: 16px  padding: 24px
```

**Input Field:**
```
bg: #2a2a2a  text: #ffffff  placeholder: #6b6b6b
radius: 8px  padding: 16px  border: 1px solid #2e2e2e
focus: border-color #ffffff
```

**Bottom Sheet / Modal:**
```
bg: #1c1c1c  radius-top: 24px  shadow: level 2
Handle bar: w-10 h-1 bg-#3a3a3a rounded-full centered at top
```

**Bottom Navigation Bar:**
```
bg: #111111  border-top: 1px solid #2e2e2e
Active icon: #ffffff  Inactive icon: #6b6b6b
Active indicator: small white dot below icon
```

**Skeleton Screens:**
```
bg: #2a2a2a  shimmer: gradient from #2a2a2a via #333333 to #2a2a2a
animation: shimmer 1.5s infinite linear
```

---

## 6. Architecture Rules — Follow Strictly

### Component Rules
1. **Never define a component inside another component** — causes remount on every render
2. **Use `React.memo()`** on any component rendered in a list (PartnerCard, BookingCard, ReviewCard etc.)
3. **Use `useCallback`** for event handlers passed as props to memoized children
4. **Use `useMemo`** for derived/filtered data — never filter inside JSX
5. **Use `useReducer`** for forms with 3+ fields or multi-step flows
6. **No barrel imports** — `import Button from '@/components/ui/Button'` not `from '@/components/ui'`
7. **Lazy load all pages** with `React.lazy()` — already done in App.tsx, keep this pattern

### Data Fetching Pattern (Supabase-ready from day one)
Every data fetch must follow this exact shape so it can be swapped to Supabase later:

```typescript
// ALWAYS write fetches like this — mock now, real later
async function getPartners(filters?: Partial<FilterState>): Promise<Partner[]> {
  // Phase 1 — mock:
  return MOCK_PARTNERS.filter(/* apply filters */)
  
  // Phase 2 — swap to this (do not delete the comment):
  // const { data } = await supabase.from('partners').select('*')
  // return data ?? []
}
```

### State Management
- Local UI state: `useState`
- Multi-step forms / complex state: `useReducer` with typed action union
- Shared filter state: `usePartnerFilters` hook (already exists)
- No Redux, no Zustand, no Context needed for Phase 1

### File Naming
- Pages: `PascalCase.tsx` (e.g. `HomePage.tsx`)
- Components: `PascalCase.tsx` (e.g. `PartnerCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g. `usePartnerFilters.ts`)
- Utils: `camelCase.ts`
- Types: all in `src/lib/types/index.ts`
- Mock data: all in `src/lib/mock-data/`

---

## 7. Known Bugs — Fix These First

Fix these in order before building anything new. These are demo-breaking.

### BUG 1 — CRITICAL: Book button invisible on mobile
**File:** `src/components/PartnerCard.tsx`
**Problem:** The "Schedule"/"Book" button has `md:opacity-0 md:group-hover:opacity-100` classes — this makes it invisible on mobile (there is no hover on touch screens).
**Fix:** Remove the opacity classes entirely. Button must always be visible. On desktop only, apply hover effect to the card shadow/scale — never hide the CTA.

### BUG 2 — CRITICAL: Two booking flows exist, only one should
**Files:** `src/components/BookingSheet.tsx` AND `src/components/ScheduleMeetingModal.tsx`
**Problem:** `BookingSheet.tsx` is a complete 3-step wizard with `useReducer` (correct implementation) but is NOT wired to `PartnerPage.tsx`. Instead, `PartnerPage.tsx` uses `ScheduleMeetingModal.tsx` — a separate, simpler booking flow. This creates two inconsistent UX paths.
**Fix:** 
1. Delete `src/components/ScheduleMeetingModal.tsx`
2. Wire `BookingSheet.tsx` to the "Book Now" button on `PartnerPage.tsx`
3. Pass `partner` as a prop to `BookingSheet` and pre-fill the partner info in step 3 summary

### BUG 3 — HIGH: Violet theme must be fully replaced with dark Uber theme
**Files:** `src/index.css`, ALL page and component files
**Problem:** The entire app uses `violet-600` as the primary color (`#7C3AED`). The design must change to the dark Uber app style described in Section 5 of this document.
**Fix:** 
1. Replace `src/index.css` `@theme` block with the dark token system from Section 5.1
2. Replace all `violet-*` Tailwind classes with the new token-based classes
3. Replace all `bg-white` / `bg-slate-*` / `bg-gray-*` with dark equivalents
4. Replace all `text-slate-*` / `text-gray-*` with `text-white` or `text-[#a0a0a0]`
5. Replace all `border-slate-*` with `border-[#2e2e2e]`
6. The loading spinner in App.tsx `border-violet-600` → `border-white`

### BUG 4 — HIGH: Filter icon in Home search bar has no onClick handler
**File:** `src/pages/HomePage.tsx`
**Problem:** The `SlidersHorizontal` icon in the search bar is rendered but has no `onClick` — it's a silent dead zone in the demo.
**Fix:** Wire it to open the `FilterSheet` component (already built in `src/components/FilterSheet.tsx`). Import and use it on HomePage with the same pattern as ExplorePage.

### BUG 5 — MEDIUM: No 404 handling for unknown partner IDs
**File:** `src/pages/PartnerPage.tsx`
**Problem:** If someone navigates to `/partner/unknown-id`, the page renders nothing silently.
**Fix:** After `getPartnerById(id)` returns null/undefined, redirect to `/explore` with a toast: `toast.error("Companion not found")` then `navigate('/explore', { replace: true })`.

### BUG 6 — MEDIUM: Supabase swap comments missing on all fetches
**Files:** All files in `src/lib/mock-data/` and any function that returns mock data
**Problem:** Every fetch function must have the commented Supabase equivalent so the backend developer knows exactly what query to write.
**Fix:** Add the comment pattern from Section 6 (Architecture Rules) to every mock data fetch.

### BUG 7 — LOW: Barrel import in PartnerCard
**File:** `src/components/PartnerCard.tsx`
**Problem:** Uses barrel import `from '@/components/ui'` instead of direct imports.
**Fix:** Change to individual imports e.g. `import Button from '@/components/ui/Button'`

---

## 8. Missing Features — Build After Bug Fixes

Build these in the order listed. Each is a self-contained feature.

---

### FEATURE 1: Dark Theme Redesign (do alongside Bug 3)
Complete visual overhaul to Uber dark app style. Every screen.

**Key changes across all screens:**
- Page background: `#111111`
- All cards: `#1c1c1c` with `1px solid #2e2e2e` border
- All primary buttons: white pill (`#ffffff` bg, `#000000` text, `999px` radius)
- All secondary buttons: dark pill (`#2a2a2a` bg, `#ffffff` text)
- Bottom nav: `#111111` bg, white active icons, gray inactive icons
- Inputs: `#2a2a2a` bg, white text, `#2e2e2e` border, white focus border
- Skeleton shimmer: `#2a2a2a` → `#333333` gradient
- Remove ALL violet colors from the entire app

---

### FEATURE 2: Landing / Marketing Page
**Route:** `/landing` (or `/` if user is not logged in — redirect logic)
**Purpose:** The page the client sees first. Acts as the hero/marketing page for the demo.

**Sections (Uber website alternating-band rhythm):**

**Hero Band (dark `#111111`):**
- Large headline: "Your social companion, on demand" (52px bold, white)
- Sub: "Book a verified companion for mall trips, coffee, movies, and more."
- Two pill buttons: "Find a companion" (white pill) + "Become a partner" (dark subtle pill)
- Right side: grid of 4 partner avatar cards (mini PartnerCards, mock data)

**How It Works Band (dark card `#1c1c1c`):**
- Heading: "How it works"
- 3 steps in a row: 1. Browse companions → 2. Book a session → 3. Enjoy your outing
- Each step: large number, icon, title, description

**Activity Categories Band:**
- Heading: "What can you do together?"
- 4 large illustrated cards: Mall 🛍 / Coffee ☕ / Movies 🎬 / Outdoors 🌳
- Each card: dark bg, activity icon, name, short description, "Explore" pill

**Safety Band (polarity flip — slightly lighter `#1c1c1c` card on `#111111`):**
- Heading: "Safety first, always"
- 3 trust points: ✓ Verified IDs · ✓ Background checked · ✓ In-app SOS
- "Learn about safety" subtle pill button

**Partner CTA Band (`#1c1c1c` card, full-width):**
- Heading: "Earn on your schedule"
- Sub: "Set your own rate. Choose your activities. You're in control."
- "Become a partner" white pill button

**Footer (`#000000`):**
- Logo + tagline
- Links: About / Safety / Partners / Support / Terms / Privacy
- App download pills (mock, no real links needed for demo)

---

### FEATURE 3: Active Session Screen
**Route:** `/session/:bookingId`
**Purpose:** The screen shown during a live booking session.

**Layout:**
- **Header:** Partner avatar + name + "Session active" green badge + timer counting up (HH:MM:SS)
- **Map placeholder:** A dark-styled static map image or a div with a map pin icon (no real maps API needed for demo — use a dark placeholder with a "📍 Meeting at {meetingPoint}" overlay)
- **Action row (4 pill buttons):**
  - 💬 Chat → opens ChatSheet
  - 📞 Call → shows "Calling..." toast (mock)
  - 📍 Share location → shows toast "Location shared"
  - ⋯ More → shows options sheet
- **Session info card (`#1c1c1c`):**
  - Activity · Date/time · Duration · Meeting point
  - Elapsed time progress bar (white fill, dark track)
- **SOS Button (prominent, full-width, red pill):**
  - "🆘 Emergency SOS" — on press: confirmation dialog → "Contacting safety team..." toast
- **End Session Button:**
  - White pill "End session" — on press: confirmation → navigates to `/review/:bookingId`

---

### FEATURE 4: In-App Chat UI
**Component:** `ChatSheet.tsx` (bottom sheet, full-height on mobile)
**Purpose:** Mock message thread between user and partner.

**Layout:**
- Header: Partner avatar + name + "Online" dot + close (×) button
- Message list (scrollable, flex-col-reverse so newest at bottom):
  - Received message: dark bubble `#2a2a2a`, left-aligned, partner avatar left
  - Sent message: white bubble `#ffffff` with black text, right-aligned
  - Timestamp below each bubble (tiny, muted)
- Mock conversation: 6–8 pre-filled messages relevant to the booking (e.g. "Hi! Looking forward to our coffee date 😊", "What time works for you?", etc.)
- Input bar (fixed bottom):
  - `#2a2a2a` input field + send button (white pill "Send" or arrow icon)
  - Typing a message and hitting send appends it to the list (client-side only, no real backend)
  - `useState` array of messages, new messages pushed on send

---

### FEATURE 5: Notifications Screen
**Route:** `/notifications`
**Purpose:** List of app notifications for the user.

**Header:** "Notifications" + "Mark all read" text button

**Notification types with icons:**
- 📅 Booking confirmed: "{Partner name} accepted your booking for {date}"
- ⏰ Reminder: "Your session with {Partner} starts in 1 hour"
- ✅ Session complete: "How was your time with {Partner}? Leave a review"
- ❌ Booking cancelled: "Your booking was cancelled. {reason}"
- 🎉 Welcome: "Welcome to CompanionApp! Start exploring companions near you."
- 💰 Payment: "Payment of ₹{amount} collected for your session"

**Each notification row:**
- Icon circle (color based on type) + title + sub-text + time ago
- Unread: slightly lighter bg `#1c1c1c` + white left border 2px
- Read: bg `#111111`
- Tap → marks as read, navigates to relevant screen
- Swipe left (or long-press) → "Delete" option

**Mock 10 notifications** spread across types. Show unread count badge on the bell icon in the home header.

**Add bell icon route:** Wire the bell icon on HomePage header to navigate to `/notifications`

---

### FEATURE 6: Post-Session Review Screen
**Route:** `/review/:bookingId`
**Purpose:** Full-page review submission after a session ends.

**Layout:**
- Back button + "Rate your experience" heading
- Partner info card: avatar + name + activity + date
- **Star rating:** 5 large stars (48px each), tap to select, fill white up to selected, outline beyond
  - Animate: selected star scales to 1.2 briefly on tap
  - Label changes dynamically: 1★ "Poor" / 2★ "Fair" / 3★ "Good" / 4★ "Great" / 5★ "Amazing!"
- **Quick tags** (appear after rating selected, multi-select pills):
  - Positive (4–5★): "Fun to be with", "Punctual", "Great conversation", "Felt safe", "Would rebook"
  - Negative (1–2★): "Late", "Uncomfortable", "Not as described", "Poor communication"
- **Written review textarea:**
  - Placeholder: "Tell others about your experience..."
  - Character counter: "0 / 500"
  - Optional — not required for submission
- **Submit button:** "Post review" white pill, full width
  - Disabled until star rating selected
  - On submit: 1.5s loading state → success screen
- **Success screen:**
  - ✅ Large white checkmark in circle
  - "Review posted!" heading
  - "Thank you for helping the community"
  - "Book again" white pill → `/explore`
  - "Go home" subtle pill → `/`

---

### FEATURE 7: Safety Center Page
**Route:** `/safety`
**Purpose:** Builds trust for the client demo. Shows how safety works.

**Sections:**

**Hero:** "Your safety is our priority" — large heading, sub-text about commitment

**3 Safety Pillars (cards in a row, dark style):**
1. 🪪 Verified identities — Govt ID + background check + video interview
2. 🛡 In-session protection — SOS button, real-time check-ins, location logging
3. ⭐ Community ratings — Both users and partners rate each other after every session

**How Verification Works (step list):**
1. Govt ID upload (Aadhaar / PAN / Passport)
2. Liveness selfie
3. Background check
4. Video call interview with safety team
5. Approval — partner gets Verified badge ✓

**SOS Feature Explanation:**
- What happens when you press SOS
- Safety team contacts you within 60 seconds
- Emergency contacts notified
- Session location logged

**FAQ accordion (5–6 questions):**
- "How are companions verified?"
- "What if I feel unsafe during a session?"
- "Can I cancel a booking?"
- "Is my payment safe?"
- "What activities are allowed?"
- "How do I report a problem?"

**Footer CTA:** "Questions? Contact our safety team" — email pill button

---

### FEATURE 8: Booking Confirmation Screen
**Route:** `/booking-confirmed/:bookingId`
**Purpose:** Full-page success after a booking is confirmed — more impactful than a modal for demo.

**Layout (centered, dark `#111111` bg):**
- Animated checkmark: white circle → white check draws in (CSS stroke-dashoffset animation)
- "Booking Confirmed! 🎉" heading (display-xl, white)
- Partner card (mini version): avatar + name + verified badge
- Booking summary:
  - 📅 Date & time
  - ⏱ Duration
  - 🎯 Activity
  - 📍 Meeting point
  - 💳 Amount (with note "Collected after session")
- Booking reference: `#COMP{random 6 chars}` in muted text
- **"Add to calendar"** subtle pill (mock — just shows a toast "Added to calendar")
- **"Chat with {name}"** subtle pill → opens ChatSheet
- **"View all bookings"** white pill → `/bookings`
- Confetti animation: CSS keyframe, 20 colored dots fall from top (white, gray, dark-gray only — no rainbow)

---

### FEATURE 9: Partner Discovery Map View
**Component:** `MapView.tsx` (toggle on Explore page)
**Purpose:** Visual way to browse partners by location — impresses clients.

**How it works (demo — no real maps API):**
- Add a "Map" / "List" toggle pill at the top of ExplorePage
- List view: current grid (existing)
- Map view: a dark-styled SVG or canvas "fake map" showing:
  - Dark background (`#1c1c1c`) with subtle grid lines (`#2a2a2a`)
  - Partner avatars as circular pins scattered across the map
  - Tapping a pin: shows a small popup card with partner name, rating, price, "View" button
  - No real geolocation or maps API — use hardcoded x/y positions mapped to the 12 mock partners
  - Add a "You are here" blue dot in the center

---

### FEATURE 10: Onboarding Walkthrough (First-time User)
**Component:** `OnboardingSheet.tsx`
**Purpose:** Shows new users how the app works on first open.

**3 slides (full-screen bottom sheet, swipeable):**
1. "Find your companion" — illustration placeholder (dark card with emoji 🤝) + description
2. "Book in seconds" — illustration + "Choose activity, date, time. Done."
3. "Safe & verified" — illustration + "Every companion is ID-verified and background-checked."

**Controls:**
- Dot indicators (3 dots, active = white, inactive = `#3a3a3a`)
- "Next" white pill button (right)
- "Skip" muted text button (left, slides 1–2 only)
- "Get started" white pill on slide 3 → dismisses sheet, saves `localStorage.setItem('onboarded', 'true')`
- Only shows if `!localStorage.getItem('onboarded')`

---

### FEATURE 11: Enhanced Partner Profile
**File:** `src/pages/PartnerPage.tsx`
**Additions to the existing page:**

- **Availability calendar:** A 7-day horizontal scroll showing which days the partner is available. Available day = white pill. Unavailable = muted pill. Tapping an available day pre-fills the date in BookingSheet.
- **"Similar companions" section** at the bottom of the page: horizontal scroll of 3–4 PartnerCards filtered by same activity types (from mock data).
- **Share button** (top-right): `navigator.share()` with fallback copy-to-clipboard toast.
- **Image gallery lightbox:** Tapping any image in the gallery opens a full-screen dark overlay with the image centered. Tap outside or press × to close.
- **"Report this profile"** link in a subtle muted text at the very bottom (navigates to `/safety` for demo).

---

### FEATURE 12: Profile Edit Screen
**Route:** `/profile/edit`
**Purpose:** Users can edit their display name, city, and profile photo.

**Form fields:**
- Profile photo (circular upload area, shows preview on file select)
- Full name input
- City dropdown (Mumbai, Delhi, Bengaluru, Pune, Chennai, Hyderabad, Kolkata)
- Phone number (read-only in demo — "Verified ✓" badge)
- Save button: white pill, full-width
  - On save: updates the mock user in component state + shows toast "Profile updated"

---

## 9. Routes Map (Complete)

```
/                     → Landing page (unauthenticated) OR HomePage (authenticated)
/login                → Phone number entry
/login/verify         → OTP entry
/partner-signup       → Partner onboarding (3 steps)

/(authenticated)
/home                 → Discovery feed
/explore              → Search + filter
/bookings             → Booking history
/profile              → User profile
/profile/edit         → Edit profile
/partner/:id          → Partner detail
/notifications        → Notifications list
/safety               → Safety center
/session/:bookingId   → Active session screen
/review/:bookingId    → Post-session review
/booking-confirmed/:bookingId → Booking success
```

---

## 10. Mock Data Requirements

All mock data lives in `src/lib/mock-data/`. For demo quality:

**Partners (12 total):**
- Mix of male/female/non-binary
- India cities: Mumbai, Delhi, Bengaluru, Pune, Chennai, Hyderabad
- Prices: ₹300 to ₹1,500/hr
- Ratings: 3.8 to 5.0
- At least 4 with `isOnline: true`
- At least 8 with `isVerified: true`
- Each has 3–5 activity types
- Realistic Indian names and bios mentioning local landmarks

**Bookings (8 total for mock user):**
- 2 with status `confirmed` (upcoming)
- 1 with status `active` (in progress)
- 3 with status `completed`
- 1 with status `cancelled` (with cancelReason)
- 1 with status `pending`

**Reviews (24 total):**
- Spread across partners
- Mix of 4★ and 5★ (and 1–2 at 3★)
- Realistic review text mentioning activities

**Notifications (10 total):**
- At least one of each type
- 4 unread, 6 read

---

## 11. Performance Rules

1. All pages are `React.lazy()` wrapped — already done, keep it
2. `React.memo()` on: `PartnerCard`, `BookingCard`, `ReviewCard`, `NotificationRow`
3. `useMemo()` on all filtered/sorted lists
4. `useCallback()` on all handlers passed to memoized children
5. All images: use `<img loading="lazy" />` (no next/image — this is Vite)
6. No inline function definitions as component props in render
7. No derived state in `useEffect` — compute during render instead

---

## 12. Accessibility Rules

Apply to every component:

1. All icon-only buttons: `aria-label="description"`
2. All images: `alt` text always set
3. All form inputs: `<label htmlFor="...">` linked to input `id`
4. Modals/sheets: `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
5. Focus rings: `focus-visible:outline-2 focus-visible:outline-white` on all interactive elements
6. Minimum touch target: `min-h-[44px] min-w-[44px]` on all buttons
7. Color contrast: white text on `#1c1c1c` and `#111111` both pass WCAG AA
8. Bottom nav and sheets: `pb-[env(safe-area-inset-bottom)]` for iOS notch

---

## 13. How To Hand Off To Another AI

When switching to a new AI tool, paste this at the start of your message:

```
Read COMPANIONAPP_MASTER_PLAN.md first. It explains everything about this project.
Here is what has been completed so far: [paste list of done items].
Here is what I need you to build next: [paste the feature/bug from the plan].
Do not change anything outside the scope of what I'm asking.
Always follow the dark Uber design system defined in Section 5 of the plan.
Always follow the architecture rules in Section 6 of the plan.
```

---

## 14. Build Order Recommendation

Follow this order to avoid blockers:

```
Phase A — Fix before anything else (1–2 days)
  1. Bug 3: Replace violet theme → dark Uber theme (index.css + all files)
  2. Bug 1: Fix mobile Book button visibility
  3. Bug 2: Delete ScheduleMeetingModal, wire BookingSheet to PartnerPage
  4. Bug 4: Wire filter icon on HomePage
  5. Bug 5: Add 404 handling on PartnerPage

Phase B — High-impact demo features (3–5 days)
  6. Feature 2: Landing/marketing page
  7. Feature 8: Booking confirmation screen
  8. Feature 3: Active session screen
  9. Feature 4: In-app chat UI
  10. Feature 5: Notifications screen

Phase C — Trust & polish (2–3 days)
  11. Feature 6: Post-session review screen
  12. Feature 7: Safety center page
  13. Feature 10: Onboarding walkthrough
  14. Feature 11: Enhanced partner profile
  15. Feature 9: Map view on Explore page
  16. Feature 12: Profile edit screen

Phase D — Backend (after client approval)
  → Supabase setup, real auth, real bookings, Razorpay payments, KYC pipeline
  → All fetch functions already have Supabase comments — swap them in
```

---

*Last updated: by Claude after reviewing the uploaded codebase zip.*
*Share this file with any AI exactly as-is. No extra context needed.*
