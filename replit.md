# Giviti - Intelligent Gift Suggestion App

## Overview

Giviti is a web-based MVP application designed to provide personalized gift suggestions. Its core purpose is to simplify gift-giving by managing recipient information, tracking events, and offering curated gift recommendations based on individual preferences, occasions, and budgets. The application features intelligent suggestion matching based on recipient profiles, with pagination and multi-criteria filtering. Users never miss important dates and always find the perfect gift.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Technology Stack**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching, Shadcn/ui component library (Radix UI primitives), Tailwind CSS.
- **Design System**: Inter and Sora fonts, HSL-based color system with CSS variables for dark/light themes, custom spacing, inspired by Etsy, Pinterest, Notion, and Airbnb.
- **State Management**: TanStack Query for server state, React hooks for local UI state, custom `useAuth` for authentication, theme persistence in localStorage.
- **Key Pages**: Landing, Dashboard, Profile (personality questionnaire), Recipients, Events, Suggestions, Gift Management.

### Backend

- **Technology Stack**: Express.js with TypeScript, Node.js.
- **API Design**: RESTful API with endpoints for authentication, user profiles, recipients, events, suggestions, statistics, and gift management.
- **Authentication**: Session-based using Replit Auth (OpenID Connect) with `express-session` and Passport.js. Protected routes use `isAuthenticated` middleware.
- **Data Layer**: Storage abstraction layer, Drizzle ORM for type-safe PostgreSQL queries, transaction support.

### Data Storage

- **Database**: PostgreSQL via Neon serverless (WebSocket connections, connection pooling).
- **Schema Design**:
    - `users`: User profiles (firstName, lastName, email, profileImageUrl).
    - `userProfiles`: User personality questionnaire results (11 questions).
    - `recipients`: Gift recipients with basic info (name, age, gender, zodiacSign, relationship, interests).
    - `recipientProfiles`: Optional detailed questionnaire for recipients (10 questions).
    - `events`: Important dates with eventType, eventName, eventDate.
    - `eventRecipients`: Junction table for many-to-many event-recipient relationships.
    - `userGifts`: Saved/purchased gifts.
    - `giftSuggestions`: Pre-seeded gift catalog.
    - `sessions`: Express session storage.
- **Data Validation**: Zod schemas generated from Drizzle tables, request validation on API endpoints.

## External Dependencies

- **Authentication Service**: Replit Auth (OpenID Connect provider).
- **Database Service**: Neon PostgreSQL (serverless database).
- **CDN Resources**: Google Fonts (Inter, Sora), Unsplash (placeholder images).
- **UI Component Dependencies**: Radix UI, Lucide React, date-fns, cmdk, vaul, embla-carousel-react, recharts.
- **Form Management**: react-hook-form, @hookform/resolvers (Zod resolver).
- **Notable Integrations**: Mock e-commerce links, pre-seeded gift database.

## Recent Features & Updates

### Suggestions Page Enhancements (November 10, 2025)
✅ **Implemented:**
- **Recipient Filtering**: Dropdown filter to view suggestions for specific recipients
  - Displays recipient name in page header when selected (with gift icon)
  - Intelligent matching: Filters suggestions based on recipient's interests matching suggestion tags/category
  - Uses fuzzy matching to connect interests with tags for better recommendations
- **Pagination System**: Shows 5 suggestions initially with "Ver mais sugestões" button
  - Loads 5 additional suggestions per click
  - Smart pagination reset: Automatically resets to first page when filters change
  - Counter displays "Mostrando X de Y sugestões"
- **Multi-criteria Filtering**: Combines recipient, category, and budget filters with AND logic
  - Recipient filter: Matches interests with tags/category
  - Category filter: Exact category match
  - Budget filter: priceMin <= selectedBudget
- **Filter Management**: "Limpar Filtros" button resets all filters and pagination

**Technical Implementation:**
- Recipient data fetched via `/api/recipients` query
- Filtering logic implemented client-side for instant response
- Pagination state managed with React hooks
- Filter changes trigger automatic pagination reset for better UX

**E2E Testing:** ✅ Passed
- Recipient filter dropdown works correctly
- Category filter updates suggestion list
- Budget slider filters by price
- Pagination loads 5 suggestions at a time
- "Ver mais sugestões" button appears/disappears appropriately
- Filter clear resets all filters and pagination
- Counter updates correctly with filter changes

### Compact Suggestions Layout (November 10, 2025)
✅ **Implemented:**
- **Compact Card Design**: Smaller cards to fit 5 per row on extra-large screens
  - Responsive grid: 2 columns (mobile) → 3 (md) → 4 (lg) → 5 (xl)
  - Smaller padding (p-3), fonts (text-xs/text-sm), and interactive elements
  - Maintained all functionality: favorite button + purchased checkbox + details button
- **Recipient Grouping Header**: When a specific recipient is selected, displays "Para: [Nome]" with gift icon and border separator
- **Preserved Interactive Features**:
  - Heart button for favorites (top-right, 7x7px, toggles state)
  - "Comprado" checkbox (bottom-left, 4x4px with compact label)
  - "Ver Detalhes" button with ExternalLink icon
  - All elements have proper data-testid attributes

**Technical Implementation:**
- Created CompactGiftCard component with local state management
- Grid layout: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
- Smaller gaps and padding for denser display
- All cards maintain hover-elevate interaction

**E2E Testing:** ✅ Passed
- 5-column layout renders correctly on XL screens
- Favorite button toggles state visually (filled/unfilled heart)
- Purchased checkbox works correctly
- Pagination loads 5 compact cards per click
- All interactive features present on all cards
- Recipient header displays correctly when filtering