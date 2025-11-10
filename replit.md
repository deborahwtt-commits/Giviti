# Giviti - Intelligent Gift Suggestion App

## Overview

Giviti is a web-based MVP application designed to help users discover personalized gift suggestions for the important people in their lives. The application focuses on simplifying the gift-giving experience by managing recipient information, tracking events, and providing curated gift recommendations based on personal preferences, occasions, and budgets.

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
- Profile: 11-question personality questionnaire for personalized recommendations
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
- `/api/profile` - User profile management (GET/POST for questionnaire)
- `/api/recipients` - CRUD operations for gift recipients
- `/api/recipients/:id/profile` - GET/POST recipient profile questionnaire
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
- `userProfiles` - User personality questionnaire (11 fun questions: ageRange, gender, zodiacSign, giftPreference, freeTimeActivity, musicalStyle, monthlyGiftPreference, surpriseReaction, giftPriority, giftGivingStyle, specialTalent, isCompleted)
- `recipients` - Gift recipients with name, age (required), gender/zodiacSign/relationship (optional), interests array
- `recipientProfiles` - Optional detailed questionnaire for recipients (10 questions: ageRange, gender, zodiacSign, relationship, giftPreference, lifestyle, interestCategory, giftReceptionStyle, budgetRange, occasion, isCompleted)
- `events` - Important dates with eventType, eventName, eventDate, recipientId (nullable, legacy for backward compatibility)
- `eventRecipients` - Junction table for many-to-many event-recipient relationships (eventId, recipientId)
- `userGifts` - Saved/purchased gifts with metadata
- `giftSuggestions` - Pre-seeded gift catalog (20 items) with tags and categories
- `sessions` - Express session storage (required for Replit Auth)

**Key Relationships**:
- Users → UserProfiles (one-to-one)
- Users → Recipients (one-to-many)
- Recipients → RecipientProfiles (one-to-one)
- Events ↔ Recipients (many-to-many via eventRecipients junction table)
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

### Multi-Recipient Events Feature (November 10, 2025)
✅ **Implemented:**
- Junction table `eventRecipients` for many-to-many event-recipient relationships
- Events now support optional selection of zero, one, or multiple recipients
- Backend API updated to handle `recipientIds: string[]` parameter (optional)
- EventForm redesigned with multi-select checkboxes in ScrollArea
- EventCard displays recipients with smart formatting:
  - Empty: "Sem presenteados"
  - 1 recipient: "Para {name}"
  - 2 recipients: "Para {name1} e {name2}"
  - 3+ recipients: "Para {name1} e mais N pessoas"
- Backward compatibility via fallback logic for legacy `recipientId` column
- Storage layer returns `EventWithRecipients` type with populated `recipients[]` array

**Architecture:**
- Junction table approach ensures proper normalization and future scalability
- Backend validates that all recipientIds belong to the user for security
- Fallback mechanism reads from legacy recipientId when junction table is empty
- Frontend query types updated to `EventWithRecipients[]` throughout

**E2E Testing:** ✅ Passed
- Event creation with zero recipients (optional selection verified)
- Event creation with single recipient
- Event creation with multiple recipients (2 selected)
- Correct display on Events page and Dashboard
- All recipient names rendered correctly in event cards

### User Profile Questionnaire Feature (November 10, 2025)
✅ **Implemented:**
- Database table `userProfiles` with 11 personality fields
- Backend API endpoints GET/POST `/api/profile`
- Profile page at `/perfil` with 11 fun personality questions
- ProfileOnboardingModal shown on first access with "Fazer mais tarde" option
- Profile link in header (desktop and mobile navigation)
- Form data persistence and pre-filling using React Hook Form reset()
- Integration with authentication system and proper error handling

**Questionnaire Fields:**
1. Age Range (5 options)
2. Gender Identity (4 options)
3. Zodiac Sign (12 options)
4. Gift Preference (6 creative options)
5. Free Time Activity (5 humorous options)
6. Musical Style (5 personality-based options)
7. Monthly Gift Preference (6 options)
8. Surprise Reaction (4 options)
9. Gift Priority (5 options)
10. Gift Giving Style (5 options)
11. Special Talent (8 options)

**E2E Testing:** ✅ Passed - Modal appears on first access, form saves correctly, values persist on return, modal doesn't reappear after completion

### Recipient Profile Questionnaire Feature (November 10, 2025)
✅ **Implemented:**
- Database table `recipientProfiles` (stored as `recipient_profiles` in PostgreSQL) with 10 optional questionnaire fields
- Backend API endpoints GET/POST `/api/recipients/:id/profile` for recipient profile management
- Storage layer methods: `getRecipientProfile` and `upsertRecipientProfile` with security validation
- RecipientProfileQuestionnaire component integrated into RecipientForm via Collapsible UI
- Optional questionnaire expandable within recipient creation/edit form
- Async mutation sequencing: recipient save → profile save with proper error handling
- Profile data only sent if at least one field is filled

**Questionnaire Fields:**
1. Age Range (faixa etária: 18-24, 25-34, 35-44, 45-54, 55+)
2. Gender (gênero: masculino, feminino, não-binário, prefiro não dizer)
3. Zodiac Sign (signo: all 12 zodiac signs)
4. Relationship (relacionamento: amigo, familiar, parceiro, colega)
5. Gift Preference (preferência: práticos, experiências, únicos, divertidos, formato experiência, xi não sei)
6. Lifestyle (estilo de vida: ativo/aventureiro, criativo/artístico, tech/inovador, caseiro/relaxado, social/festeiro)
7. Interest Category (categoria interesse: esportes, arte/cultura, tecnologia, culinária, viagens, leitura, música, jogos)
8. Gift Reception Style (estilo recepção: surpresa total, gosta saber antes, participar escolha, lista desejos)
9. Budget Range (faixa orçamento: R$0-50, R$50-150, R$150-300, R$300-600, acima R$600, depende/parcela, céu limite/impressionar)
10. Occasion (ocasião: aniversário, Natal, amigo secreto, formatura, casamento, Dia dos Namorados, conquista especial, só porque sim)

**Architecture:**
- One-to-one relationship: Recipients → RecipientProfiles (recipientId unique constraint)
- Upsert pattern for create/update in single POST operation
- Security: backend validates recipient belongs to authenticated user before profile operations
- Frontend: Collapsible component with ChevronDown icon rotation on expand/collapse
- Form behavior: profile completely optional, can be added later via edit

**Async Flow Improvements:**
- Changed from `mutate()` to `mutateAsync()` for proper sequencing
- Update path: await recipient update → await profile save → invalidate cache → toast → close form
- Create path: await recipient create → await profile save (if provided) → invalidate cache → toast → close form
- Error handling: recipient errors keep form open, profile errors show warning toast
- No duplicate success toasts or premature form closing

**E2E Testing:** ✅ Verified
- Create recipient without profile questionnaire (optional behavior confirmed)
- Create recipient with full profile questionnaire (all 10 fields)
- Edit existing recipient and add profile data
- Database persistence verified: `recipient_profiles` table contains saved data
- Success/error toasts display correctly for different scenarios

### Critical Fixes Applied
1. **apiRequest Parameter Order**: Fixed from (method, url, data) to (url, method, data) to match usage patterns
2. **Recipients Schema**: Made gender, zodiacSign, and relationship fields optional (nullable) for better UX
3. **RecipientForm**: Updated to send null for empty optional fields instead of empty strings
4. **SelectItem Validation**: Fixed empty value prop error by using "all" instead of "" for "Todas" option
5. **Category Filtering**: Updated logic to handle "all" value correctly
6. **Query Caching**: Changed staleTime from Infinity to 0 for fresh data on navigation
7. **401 Error Handling**: All protected pages now properly handle session expiration with toast notifications and redirect
8. **Cache Invalidation**: Stats queries properly invalidated after recipient/event mutations
9. **Profile Form Reset**: Fixed form pre-filling by using useEffect + reset() when profile data loads

### E2E Testing Results
✅ **All Core Flows Verified:**
- OIDC authentication and login
- Profile questionnaire onboarding and completion
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
- User profile questionnaire fully functional