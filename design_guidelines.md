# Design Guidelines: PredictGram Prediction Betting Platform

## Design Approach

**Selected Approach:** Design System Foundation with Trading Platform Polish

Drawing inspiration from modern trading platforms (Coinbase, Robinhood) and prediction markets (PolyMarket), prioritizing data clarity, rapid information scanning, and trustworthy betting interactions. Visual polish through strategic use of glassmorphism, gradient accents, and smooth micro-interactions.

**Core Principles:**
1. Information hierarchy optimized for quick decision-making
2. High-density data presentation without clutter
3. Trust-building through consistent, professional design
4. Real-time updates seamlessly integrated

---

## Typography System

**Font Families:**
- Primary (UI/Data): Inter or DM Sans (Google Fonts)
- Accent (Headings): Space Grotesk or Outfit (Google Fonts)

**Hierarchy:**
- Hero Heading: 3xl-4xl (bold)
- Page Titles: 2xl-3xl (semibold)
- Card Titles: lg-xl (semibold)
- Data/Numbers (prices, credits): xl-2xl (bold, tabular-nums)
- Body Text: sm-base (regular)
- Labels/Meta: xs-sm (medium)

**Special Treatment:**
- All numerical data (prices, credits, odds): Use tabular numbers (`font-feature-settings: "tnum"`)
- Win/Loss indicators: Bold weight with increased letter-spacing

---

## Layout System

**Spacing Primitives:** Tailwind units of **2, 4, 6, 8, 12, 16**
- Tight spacing (cards, data rows): p-4, gap-2
- Standard spacing (sections): p-6 to p-8, gap-4
- Generous spacing (page margins): p-8 to p-16

**Container Widths:**
- Max width: `max-w-7xl` (centered)
- Cards: Full width within container with responsive grid

**Grid Systems:**
- Main betting cards (homepage): 4 columns desktop (lg:grid-cols-4), 2 on tablet (md:grid-cols-2), 1 on mobile
- Market listings: 3 columns desktop (lg:grid-cols-3), 2 tablet, 1 mobile
- Stats/Leaderboard: Full-width tables with responsive scrolling

---

## Component Library

### Navigation

**Top Navigation Bar:**
- Fixed position with glassmorphism backdrop (backdrop-blur-lg with semi-transparent background)
- Height: h-16 to h-20
- Logo: Left-aligned, max height h-8
- Pre-auth: Login button (right-aligned, primary button style)
- Post-auth (right side, gap-4):
  - Credits display: Pill-shaped badge (px-4 py-2, rounded-full) with coin icon
  - Icon buttons: My Stats, Leaderboard (h-10 w-10, circular)
  - Profile image: h-10 w-10, rounded-full with 2px border
  - Deposit button: Secondary style
  - Logout: Text link (sm, medium weight)

### Cards

**Betting Category Cards (Homepage):**
- Large, prominent cards: min-h-48
- Gradient border treatment (1-2px gradient border)
- Padding: p-6 to p-8
- Icon at top: h-12 w-12 within gradient circle
- Title: text-xl, semibold
- Description: text-sm, 2-line max with text-gray
- Hover: Subtle lift (translate-y-1) with shadow increase
- Card background: Semi-transparent with backdrop-blur

**Market/Token Cards:**
- Compact cards: p-4 to p-6
- Header row: Token symbol/name (bold) + Price (right-aligned, large)
- Price change indicator: Small badge (+2.5% in green/red)
- Betting controls embedded in card footer
- Countdown timer: Small, top-right corner

**Winner Announcement Cards (Real-time):**
- Horizontal layout with avatar left
- User info + bet details in center
- Winnings amount (bold, large) right-aligned
- Subtle entrance animation (slide + fade)
- Max height: constrain to 4-5 visible, vertical scroll

### Forms & Inputs

**Bet Amount Input:**
- Large, prominent: h-12 to h-14
- Numeric input with increment/decrement buttons flanking
- Quick bet buttons below: [10] [50] [100] [MAX] (small, outlined)
- Clear visual feedback when invalid (red border pulse)

**Direction Selection (Up/Down, Higher/Lower):**
- Large toggle buttons, side-by-side
- Equal width, min height h-16
- Selected state: Filled with strong visual indicator
- Icons + text labels

**Custom Bet Token Input:**
- Token CA input: Full width with monospace font
- Validation indicator (checkmark/x) on right
- Token info preview card appears below when valid

**Duration Selector:**
- Segmented control: 3 equal-width buttons [15m] [30m] [60m]
- Active state clearly distinguished

### Data Display

**Price Tickers:**
- Horizontal layout: Symbol | Price | 24h Change
- Price: Largest element (text-2xl, bold)
- Real-time pulse animation on price updates
- Tabular layout for alignment

**Stats Cards:**
- Metric label (small, uppercase, tracking-wide)
- Large number display (3xl, bold)
- Trend indicator (small arrow + percentage)
- Grid layout: 2-4 columns responsive

**Leaderboard Table:**
- Sticky header row
- Alternating row treatment for readability
- Rank column: Small badge
- Username: Medium weight with avatar thumbnail
- Winnings: Right-aligned, bold, tabular numbers
- Desktop: Full table, Mobile: Condensed cards

### Modals

**Onboarding Modal (New User):**
- Centered overlay, max-w-md
- Heading: "Welcome to PredictGram"
- Name input field (full width)
- Username input field with live availability check
- Primary CTA: "Create Account"
- Backdrop: Semi-transparent dark with backdrop-blur

**Bet Confirmation Modal:**
- Compact, max-w-sm
- Summary of bet details (token, direction, amount)
- Confirm/Cancel buttons (equal prominence)

### Buttons

**Primary (Bet, Confirm, Login):**
- Height: h-10 to h-12
- Padding: px-6 to px-8
- Rounded: rounded-lg
- Full width on mobile, auto width desktop
- Bold font weight
- Gradient background with subtle hover brightness shift

**Secondary (Deposit, Stats):**
- Same dimensions as primary
- Outlined style with 2px border
- Hover: Filled state with smooth transition

**Icon Buttons:**
- Circular: h-10 w-10, rounded-full
- Icon centered, size 20px (w-5 h-5)
- Hover: Background opacity change

---

## Page-Specific Layouts

### Homepage

**Structure:**
1. Hero Section: Minimal, centered heading (h1) + tagline (p-16 vertical padding)
2. Betting Cards Grid: 4-column grid with gap-6, below hero
3. Recent Winners: Full-width section, max-h-96 with scroll, live-updating feed

### Betting Pages (Crypto/Stock/On-chain)

**Layout:**
- Left sidebar (desktop): Filters, categories (w-64, sticky)
- Main area: Grid of market cards (responsive columns)
- Each card: Self-contained betting interface
- Top bar: Category title + total active rounds

### Custom Bet Creation

**Flow:**
- Single-column form, max-w-2xl centered
- Step indicators at top if multi-step
- Large input fields with clear labels
- Token validation with immediate feedback
- Preview card showing market details before creation

### Profile/Stats

**Layout:**
- Top section: Profile header (avatar, name, stats summary) - full width, p-8
- Content grid: 2-column on desktop (Stats left, Recent Activity right)
- Stats: Card-based metrics grid
- Activity: Timeline/list view with infinite scroll

### Leaderboard

**Layout:**
- Filter tabs at top (24h, 7d, 30d, All-time)
- Table view: Full width
- Top 3 highlighted with special treatment (larger, gradient borders)
- Current user row highlighted if visible

---

## Images

**Profile Pictures:**
- All users share the same circular avatar image (provided by user)
- Display size: h-10 w-10 (navbar), h-20 w-20 (profile header)
- Always circular with 2px border
- Consistent across all instances

**No hero background image** - Homepage uses gradient backgrounds with glassmorphic cards for visual interest

**Icons:**
- Use Heroicons (via CDN) throughout
- Icon size: h-5 w-5 (standard), h-6 w-6 (prominent), h-12 w-12 (category cards)
- Icons for: Crypto symbols, stats, navigation, betting directions

---

## Animations & Interactions

**Micro-interactions:**
- Price updates: Subtle pulse (scale 1.0 → 1.05 → 1.0, 300ms)
- Card hover: Lift effect (translateY -2px, shadow increase)
- Button clicks: Quick scale down (0.98) on press
- Winner announcements: Slide in from bottom + fade (500ms ease-out)

**Real-time Updates:**
- Countdown timers: Update every second, red pulse when <10 seconds
- WebSocket updates: Smooth number transitions (not instant jumps)

**Loading States:**
- Skeleton loaders for data-heavy sections
- Shimmer effect on loading cards

---

## Accessibility

- All interactive elements: min-height h-10 (touch-friendly)
- Color contrast: Ensure text readable against backgrounds
- Focus states: Clear outline on all focusable elements
- ARIA labels on icon-only buttons
- Semantic HTML for tables and forms