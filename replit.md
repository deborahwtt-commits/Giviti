# Giviti - Intelligent Gift Suggestion App

## Overview
Giviti is an MVP web application designed to simplify gift-giving by managing recipient information and events, and providing personalized gift suggestions. The application aims to ensure users never miss important dates and always find the perfect gift through intelligent suggestion matching, pagination, and multi-criteria filtering. It also includes an administrative module for system management and collaborative event planning features like Secret Santa.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology Stack**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching, Shadcn/ui (Radix UI primitives), Tailwind CSS.
- **Design System**: HSL-based color system with CSS variables for dark/light themes, Inter and Sora fonts, custom spacing, inspired by Etsy, Pinterest, Notion, and Airbnb.
- **State Management**: TanStack Query for server state, React hooks for local UI state, `useAuth` for authentication, theme persistence in localStorage.
- **Key Pages**: Landing, Dashboard, Profile (personality questionnaire), Recipients, Events, Suggestions, Gift Management, Collaborative Events.

### Backend
- **Technology Stack**: Express.js with TypeScript, Node.js.
- **API Design**: RESTful API for authentication, user profiles, recipients, events, suggestions, statistics, gift management, and collaborative events.
- **Authentication**: Session-based using `express-session` and bcrypt for password hashing.
- **Data Layer**: Drizzle ORM for type-safe PostgreSQL queries.

### Data Storage
- **Database**: PostgreSQL via Neon serverless.
- **Schema Design**: Includes tables for `users`, `userProfiles`, `recipients`, `recipientProfiles`, `events`, `eventRecipients`, `userGifts`, `giftSuggestions`, `giftCategories`, `giftTypes`, `giftSuggestionCategories`, `sessions`, and collaborative event tables (`collaborative_events`, `collaborative_event_participants`, `collaborative_event_links`, `secret_santa_pairs`, `collective_gift_contributions`, `collaborative_event_tasks`, `themed_night_categories`).
  - **Gift Suggestions**: The `giftSuggestions` table includes:
    - `priority` column (integer, nullable) for prioritizing gift suggestions. Valid values: 1, 2, 3, or null.
    - `giftTypeId` foreign key reference to `giftTypes` table for categorizing suggestions by type.
    - Admins can manage suggestions through the admin panel at `/admin/sugestoes` with full CRUD operations.
  - **Gift Categories & Types System**:
    - `giftCategories`: Stores gift categories with name, description, color (hex), active status, and **keywords array** for flexible interest matching. Examples: "Tecnologia" with keywords ["tecnologia", "tech", "eletrônicos", "gadget"].
    - `giftTypes`: Stores gift types with name, description, and active status. Examples: "Presente Físico", "Experiência", "Presente Digital".
    - `giftSuggestionCategories`: Junction table enabling many-to-many relationship between suggestions and categories.
    - Each suggestion can have one type (via `giftTypeId`) and multiple categories (via junction table).
    - Admin panel at `/admin/categorias-tipos` provides full CRUD for categories and types, including keyword management via textarea input (comma/semicolon separated).
- **Data Validation**: Zod schemas generated from Drizzle tables for API request validation.

### UI/UX Decisions
- **Color Schemes**: HSL-based color system with CSS variables for dark/light themes.
- **Typography**: Inter and Sora fonts.
- **Layout**: Responsive grid layouts, card-based event listings with Lucide icons.
- **Interactive Elements**: Heart button for favorites, "Comprado" checkbox, "Ver Detalhes" button.
- **Suggestion Filtering**: Multi-criteria filtering (recipient, category, budget) with intelligent interest-based matching and pagination.
- **Event Management**: Past events show archive/advance options; future events show standard options.
- **Collaborative Events**: Specific UI for "Rolês" (collaborative events) with tabbed interfaces for overview, participants, and settings.
- **Unified Event Display**: Main Events page (/eventos) shows both regular gift events and collaborative rolês in a single unified interface:
  - UnifiedEventCard component handles both event types with visual distinction
  - "Evento" badge for gift occasions, "Rolê" badge for collaborative events
  - Rolês display event type badges (Amigo Secreto, Noite Temática, etc.)
  - Clicking rolê cards navigates to detail page; events show full edit/delete actions
  - Robust date handling supports string | Date | null with graceful "Sem data definida" messaging
  - Time-based filters (this month, next 3 months) work for both types
  - Archived tab includes both archived events and completed/cancelled rolês

### Feature Specifications
- **Personalized Suggestions**: Intelligent matching based on recipient profiles and interests.
  - **Algorithm V2.1**: Unified interests-categories system - recipient interests ARE product categories.
  - **Search Order Priority**: 
    1. First searches internal database based on recipient profile (gender, interests, category, etc.)
    2. If internal results < 5, fetches from Google Shopping API only to fill the gap
    3. Pagination: 5 results per page, maximum 15 results total (3 pages)
  - **Dynamic Interests**: Interest options in recipient form are fetched from gift categories API, ensuring consistency.
  - **Relevance Scoring**: Exact category match (+50pts), partial category match (+30pts), tag match (+15pts), keyword expansion match (+5-10pts), interestCategory questionnaire (+20pts), giftPreference match (+5pts), giftsToAvoid penalty (-50pts).
  - **Direct Matching**: When user selects "Tecnologia" as interest, products in "Tecnologia" category get highest priority.
  - **Session Cache**: Google Shopping search results are cached in-memory during the user session. If the user changes recipient filter, then returns to a previously selected recipient, cached results are shown instantly without new API calls. Cache key is generated from: recipientId + category + budgetRange + searchQuery. Cache is cleared automatically when session ends (page refresh).
  - **Pagination UI**: "Carregar mais" button loads next 5 results, shows current page and progress toward max 15.
- **Event Tracking**: Manage important dates, including archiving and advancing past events.
  - **Date Validation**: Events and rolês can only be created with dates from today onwards. Both frontend and backend validate that dates are not in the past.
- **Gift Management**: Save/track purchased and favorited gifts.
- **User/Recipient Profiles**: Detailed personality questionnaires, including "Gifts to Avoid" fields and optional location fields (cidade, estado, pais) with input validation and auto-capitalization.
- **Authentication**: Email/password registration and login with session persistence and bcrypt hashing.
- **Admin Panel**: Comprehensive administrative module with role-based access control (admin, manager, support, readonly) for user management, categories, occasions, price ranges, relationship types, system settings, audit logs, gift suggestions management, and advanced statistics.
- **Collaborative Events**: Support for Secret Santa, themed nights, and collective gifts with participant management, draw algorithms (for Secret Santa), and shareable links.
  - **Themed Night Categories**: Dynamic "Qual é a boa?" subcategory system for themed nights. Admins can create/manage categories (name, description, activity suggestions). When creating a "Noite Temática" rolê, users select from active categories. Category details displayed on event detail page.
  - **Note**: Creative challenges (Desafio Criativo) are temporarily hidden from the creation UI but remain supported in the backend for existing data.
  - **Date Validation**: Rolês follow the same date validation rules as regular events - only today or future dates are allowed.

## External Dependencies
- **Database Service**: Neon PostgreSQL (serverless database).
- **CDN Resources**: Google Fonts, Unsplash.
- **UI Component Libraries**: Radix UI, Lucide React, Shadcn/ui.
- **Date Utilities**: date-fns.
- **Form Management**: react-hook-form, @hookform/resolvers (Zod resolver).
- **Other UI Components**: cmdk, vaul, embla-carousel-react, recharts.
- **Integrations**: Mock e-commerce links, pre-seeded gift database.