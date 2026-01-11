# On-Chain Market - Prediction Betting Platform

## Overview

On-Chain Market is a prediction betting platform that allows users to bet on crypto prices, stocks, on-chain metrics, and create custom prediction markets. Users connect via Phantom wallet for authentication and place bets using an in-app credits system.

The application uses a full-stack TypeScript architecture with React frontend, Express backend, and PostgreSQL database. The backend API is hosted externally on Railway, with the frontend designed to communicate with it.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with hot module replacement
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage
- **API Pattern**: RESTful API with `/api` prefix
- **Storage Abstraction**: Interface-based storage pattern (IStorage) allowing swappable implementations

### Authentication Flow
- **Wallet-based Auth**: Phantom wallet integration for Solana
- **Flow**: User connects wallet → Signs nonce message → Server verifies signature → Session created
- **Onboarding**: New users must provide name/username after first wallet connection
- **Session Persistence**: PostgreSQL-backed sessions via connect-pg-simple

### Data Flow
1. Frontend calls external Railway-hosted API (`VITE_API_URL`)
2. API handles crypto price fetching, bet placement, round management
3. Real-time updates via polling (React Query refetch intervals)
4. Credits system for betting (in-app currency)

### Key Design Patterns
- **Shared Schema**: Types and Zod schemas in `/shared/schema.ts` used by both client and server
- **Path Aliases**: `@/` for client src, `@shared/` for shared code
- **Component Structure**: UI primitives in `/components/ui/`, feature components in `/components/`

## External Dependencies

### External Services
- **Railway Backend**: Production API hosted at `https://price-production-c1cb.up.railway.app`
- **CoinGecko API**: Cryptocurrency price data (requires `CG_API_KEY`)
- **Dune Analytics**: On-chain metrics for prediction categories (requires `DUNE_API_KEY`)
- **DexScreener API**: Solana token data for custom bets

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema-first approach with migrations in `/migrations`
- **Redis**: Session caching (optional, based on backend configuration)

### Wallet Integration
- **Phantom Wallet**: Solana wallet for authentication
- **nacl/PyNaCl**: Signature verification (ed25519)

### Key Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `VITE_API_URL`: Backend API URL (defaults to Railway production)
- `CG_API_KEY`: CoinGecko API key for crypto prices
- `DUNE_API_KEY`: Dune Analytics API key for on-chain data

### Third-Party Libraries
- **UI**: Radix UI primitives, Lucide icons, class-variance-authority
- **Charts**: Recharts (via shadcn chart component), TradingView widget for live charts
- **Real-time**: Socket.IO client for WebSocket connections
- **Date Handling**: date-fns
- **Carousel**: Embla Carousel React

## Recent Changes

### Mobile Responsiveness (January 2026)
- Added comprehensive mobile-first responsive design across all pages
- Responsive typography: `text-2xl sm:text-3xl` pattern for all headings
- Responsive spacing: `gap-4 sm:gap-6`, `p-3 sm:p-4` patterns
- Touch-friendly interactions with `touch-manipulation` class
- Mobile-first layout ordering using Tailwind's `order-*` utilities
- Chart heights: 300px mobile → 400px tablet → 500px desktop
- Horizontally scrollable tabs on Stats page for mobile
- LiveBets component shows below betting panel on mobile, beside chart on desktop

### Real-time Updates (January 2026)
- WebSocket integration via Socket.IO for live updates
- Toast notifications for bet wins/losses with result details
- Intelligent polling fallback when WebSocket disconnects (5s for markets, 30s for notifications)
- Socket events:
  - `round_update`: Crypto round state changed
  - `round_resolved`: Crypto round ended with result
  - `new_bet`: Someone placed a bet on crypto round
  - `credits_update`: User credits changed
  - `bet_result`: User's bet resolved (win/loss notification)
  - `custom_bet_update`: Someone placed a bet on custom round (pool totals updated)
  - `custom_bet_resolved`: Custom bet round ended with result
- Socket rooms:
  - `{CRYPTO}-room`: Join for crypto market updates (e.g., `BTC-room`)
  - `user-{id}`: Join for personal notifications
  - `custom-bet-{round_id}`: Join for custom bet round updates

### CSS Utilities Added
- `.glass` / `.glass-dark`: Glassmorphism effects
- `.scrollbar-hide`: Hide scrollbars while maintaining scroll
- `.text-gradient`: Primary color gradient text
- `.safe-bottom`: Safe area padding for mobile devices
- `.touch-manipulation`: Better touch response

### Backend Improvements (January 2026)
- **On-chain rounds**: Now checks every 5 minutes for missing rounds (not just at midnight), creates rounds on startup
- **Custom bet fix**: Bets properly marked as "lost" when no winners exist (previously stayed "pending")
- **Session improvements**: 7-day session lifetime, nonce expiry after 5 minutes, better error logging
- **Webhook support**: Optional webhooks for round resolution events
  - Environment variables: `WEBHOOK_BET_RESULT`, `WEBHOOK_ROUND_RESOLVED`, `WEBHOOK_CUSTOM_BET_RESOLVED`, `WEBHOOK_ONCHAIN_RESOLVED`
  - Optional `WEBHOOK_SECRET` for HMAC signature verification