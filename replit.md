# Giftly - Intelligent Gift Suggestion App

## Overview

Giftly is a web-based MVP application designed to help users discover personalized gift suggestions for the important people in their lives. The application focuses on simplifying the gift-giving experience by managing recipient information, tracking events, and providing curated gift recommendations based on personal preferences, occasions, and budgets.

**Core Purpose**: Never forget an important date and always find the perfect gift through intelligent, personalized suggestions.

**Target Users**: Adults aged 20-45 with active social lives and medium to high purchasing power who value practicality and originality in gift-giving.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**:
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System**:
- Typography: Inter (primary), Sora (accent headings)
- Color system: HSL-based with CSS variables for light/dark theme support
- Custom spacing primitives and container strategies
- Component variants using class-variance-authority
- Design inspiration from Etsy, Pinterest, Notion, and Airbnb

**State Management**:
- Server state managed via TanStack Query with fresh data (staleTime: 0)
- Local UI state handled with React hooks
- Authentication state through custom useAuth hook
- Theme persistence in localStorage
- Cache invalidation on mutations to keep data fresh

**Key Pages**:
- Landing: Marketing page with hero section and feature highlights
- Dashboard: Overview with statistics, upcoming events, and gift suggestions
- Recipients: Manage gift recipients (presenteados)
- Events: Track important dates and occasions
- Suggestions: Browse and filter gift recommendations
- GiftManagement: Track purchased and to-buy gifts

### Backend Architecture

**Technology Stack**:
- Express.js server with TypeScript
- Node.js runtime
- Session-based authentication using Replit Auth (OpenID Connect)
- RESTful API design pattern

**API Structure**:
- `/api/auth/*` - Authentication endpoints (Replit Auth integration)
- `/api/recipients` - CRUD operations for gift recipients
- `/api/events` - Event management with filtering
- `/api/suggestions` - Gift suggestion retrieval
- `/api/stats` - Dashboard statistics aggregation
- `/api/gifts` - User gift list management

**Authentication Flow**:
- OpenID Connect discovery via Replit Auth
- Session management with express-session
- Passport.js strategy for OAuth flow
- Protected routes using isAuthenticated middleware
- Automatic session refresh handling

**Data Layer**:
- Storage abstraction layer (IStorage interface) for separation of concerns
- Drizzle ORM for type-safe database queries
- Transaction support for data consistency

### Data Storage

**Database**: PostgreSQL via Neon serverless
- WebSocket connections for serverless compatibility
- Connection pooling with @neondatabase/serverless

**Schema Design**:
- `users` - User profiles (firstName, lastName, email, profileImageUrl)
- `recipients` - Gift recipients with name, age (required), gender/zodiacSign/relationship (optional), interests array
- `events` - Important dates linked to recipients with eventType, eventName, eventDate
- `userGifts` - Saved/purchased gifts with metadata
- `giftSuggestions` - Pre-seeded gift catalog (20 items) with tags and categories
- `sessions` - Express session storage (required for Replit Auth)

**Key Relationships**:
- Users → Recipients (one-to-many)
- Recipients → Events (one-to-many)
- Users → UserGifts (one-to-many)
- UserGifts → GiftSuggestions (many-to-one reference)

**Data Validation**:
- Zod schemas generated from Drizzle tables via drizzle-zod
- Request validation on API endpoints
- Type-safe insert/update operations

### External Dependencies

**Authentication Service**:
- **Replit Auth** (OpenID Connect provider)
  - Handles user authentication flow
  - Provides user profile information
  - Token refresh and session management
  - Required environment variables: `ISSUER_URL`, `REPL_ID`, `SESSION_SECRET`

**Database Service**:
- **Neon PostgreSQL** (Serverless database)
  - WebSocket-based connections for serverless compatibility
  - Connection pooling via @neondatabase/serverless
  - Required: `DATABASE_URL` environment variable
  - Migrations managed via Drizzle Kit

**CDN Resources**:
- **Google Fonts**: Inter and Sora font families
- **Unsplash**: Placeholder images for gift suggestions (via URLs)

**Development Tools**:
- **Replit-specific plugins**: 
  - vite-plugin-runtime-error-modal
  - vite-plugin-cartographer
  - vite-plugin-dev-banner

**UI Component Dependencies**:
- **Radix UI**: Headless component primitives (dialogs, dropdowns, popovers, etc.)
- **Lucide React**: Icon library
- **date-fns**: Date manipulation and formatting
- **cmdk**: Command palette components
- **vaul**: Drawer component
- **embla-carousel-react**: Carousel functionality
- **recharts**: Chart components

**Form Management**:
- **react-hook-form**: Form state and validation
- **@hookform/resolvers**: Zod resolver integration

**Notable Integrations**:
- Mock e-commerce links (no actual payment integration in MVP)
- Pre-seeded gift database (no external API for suggestions in MVP)
- Session storage in PostgreSQL (connect-pg-simple)

## Recent Changes & Fixes (November 2025)

### Critical Fixes Applied
1. **apiRequest Parameter Order**: Fixed from (method, url, data) to (url, method, data) to match usage patterns
2. **Recipients Schema**: Made gender, zodiacSign, and relationship fields optional (nullable) for better UX
3. **RecipientForm**: Updated to send null for empty optional fields instead of empty strings
4. **SelectItem Validation**: Fixed empty value prop error by using "all" instead of "" for "Todas" option
5. **Category Filtering**: Updated logic to handle "all" value correctly
6. **Query Caching**: Changed staleTime from Infinity to 0 for fresh data on navigation
7. **401 Error Handling**: All protected pages now properly handle session expiration with toast notifications and redirect
8. **Cache Invalidation**: Stats queries properly invalidated after recipient/event mutations

### E2E Testing Results
✅ **All Core Flows Verified:**
- OIDC authentication and login
- Create recipient with interests
- Create event with future date
- Filter suggestions by category
- Dashboard displays correct stats after mutations
- Logout and return to landing page

### Production Readiness
- All pages connected to real backend APIs
- Proper authentication and security (isAuthenticated middleware)
- User ownership validation on all CRUD operations
- Error handling with user-friendly messages in Portuguese
- Loading states and empty states throughout
- 20 gift suggestions seeded for testing
- Database schema stable and tested