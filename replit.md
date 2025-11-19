# Giviti - Intelligent Gift Suggestion App

## Overview

Giviti is an MVP web application designed to simplify gift-giving. It manages recipient information and events, providing personalized gift suggestions based on individual preferences, occasions, and budgets. The application aims to ensure users never miss important dates and always find the perfect gift through intelligent suggestion matching, pagination, and multi-criteria filtering.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Technology Stack**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching, Shadcn/ui (Radix UI primitives), Tailwind CSS.
- **Design System**: Inter and Sora fonts, HSL-based color system with CSS variables for dark/light themes, custom spacing, inspired by Etsy, Pinterest, Notion, and Airbnb.
- **State Management**: TanStack Query for server state, React hooks for local UI state, custom `useAuth` for authentication, theme persistence in localStorage.
- **Key Pages**: Landing, Dashboard, Profile (personality questionnaire), Recipients, Events, Suggestions, Gift Management.

### Backend

- **Technology Stack**: Express.js with TypeScript, Node.js.
- **API Design**: RESTful API for authentication, user profiles, recipients, events, suggestions, statistics, and gift management.
- **Authentication**: Session-based using Replit Auth (OpenID Connect) with `express-session` and Passport.js.
- **Data Layer**: Storage abstraction layer using Drizzle ORM for type-safe PostgreSQL queries and transaction support.

### Data Storage

- **Database**: PostgreSQL via Neon serverless.
- **Schema Design**: Includes tables for `users`, `userProfiles`, `recipients`, `recipientProfiles`, `events`, `eventRecipients`, `userGifts`, `giftSuggestions`, and `sessions`.
- **Data Validation**: Zod schemas generated from Drizzle tables for API request validation.

### UI/UX Decisions

- **Color Schemes**: HSL-based color system with CSS variables for dark/light themes.
- **Typography**: Inter and Sora fonts.
- **Layout**: Responsive grid layouts for suggestions (2 columns on mobile up to 5 on XL screens).
- **Interactive Elements**: Heart button for favorites, "Comprado" checkbox, "Ver Detalhes" button.
- **Recipient Management**: Clickable recipient names to open a details dialog, with quick access to edit functionality.
- **Suggestion Filtering**: Multi-criteria filtering (recipient, category, budget) with intelligent interest-based matching and pagination.
- **Recipient Grouping**: Automatic grouping of suggestions by recipient in "Todos" view, showing up to 5 interest-matched suggestions per recipient.

### Feature Specifications

- **Personalized Suggestions**: Intelligent matching based on recipient profiles and interests.
- **Event Tracking**: Manage important dates.
- **Gift Management**: Save/track purchased and favorited gifts.
- **User Profile**: 12-question personality questionnaire including preferences and "Gifts to Avoid" field (256 chars).
- **Recipient Profiles**: Detailed personality questionnaires for enhanced suggestions, including a "Gifts to Avoid" field (255 chars).
- **Pagination and Filtering**: Client-side filtering and pagination for gift suggestions.

## External Dependencies

- **Authentication Service**: Replit Auth (OpenID Connect provider).
- **Database Service**: Neon PostgreSQL (serverless database).
- **CDN Resources**: Google Fonts, Unsplash.
- **UI Component Libraries**: Radix UI, Lucide React.
- **Date Utilities**: date-fns.
- **Form Management**: react-hook-form, @hookform/resolvers (Zod resolver).
- **Other UI Components**: cmdk, vaul, embla-carousel-react, recharts.
- **Integrations**: Mock e-commerce links, pre-seeded gift database.

## Recent Changes

### Event Details View (November 12, 2025)
✅ **Implemented Clickable Event Names with Details Dialog**
- Clicking on an event's name opens a modal dialog showing all event information
- Complete CRUD operations for events (Create, Read, Update, Delete)
- Edit and Delete buttons added to event cards

**Components:**
- **EventDetailsDialog**: Modal showing event name, type, date, countdown, and recipients
- **EventCard**: Updated with clickable name and inline Edit/Delete buttons
- **EventForm**: Enhanced with edit mode support (dynamic title/button text)
- **Events.tsx**: Full CRUD mutations (create, update, delete)

**Key Features:**
- Type-safe event handling with `EventWithRecipients`
- Recipient associations properly preserved during edits
- Form auto-populates when editing
- Confirmation dialog before deletion
- All mutations invalidate React Query cache properly

**Testing:** ✅ E2E tests passed
- Event creation, viewing, editing, and deletion
- Critical test: Recipient associations preserved after edit (database verified)

### Recipient Details View (November 12, 2025)
✅ **Implemented Clickable Recipient Names with Details Dialog**
- Clicking recipient name opens modal with all information
- Shows basic info, interests, and detailed profile (if exists)
- Lazy-loads profile data only when dialog opens
- Quick access to edit functionality from dialog

### Event Archive and Advance Features (November 18, 2025)
✅ **Implemented Past Event Management with Archive and Advance to Next Year**
- Past events (daysUntil < 0) display "Passou há X dias" in destructive color
- Past events show "Arquivar" (Archive) and "Atualizar para o próximo ano" (Advance) buttons
- Future events show "Faltam X dias" with standard buttons (Ver Sugestões, Edit, Delete)

**Database Schema:**
- Added `archived: boolean().default(false).notNull()` to events table
- Migration applied successfully

**Backend API:**
- **PATCH /api/events/:id/archive**: Sets archived field to true
- **PATCH /api/events/:id/advance-year**: Advances event date to next future occurrence
  - Intelligent year calculation: Keeps adding years until event becomes future
  - Example: Event dated 2023-06-15 becomes 2026-06-15 (not just +1 year)

**Frontend Components:**
- **EventCard**: Conditional button rendering based on event status (past vs future)
- **Events.tsx**: 
  - Added "Arquivados" tab to view archived events separately
  - Archive and advance mutations with proper cache invalidation
  - Tab counts show active vs archived event totals

**Date Handling Fix:**
- Consistent use of `parseISO` and `startOfDay` from date-fns throughout
- Prevents timezone bugs in date comparisons
- `calculateDaysUntil` function ensures accurate day-level comparisons
- All date filters (thisMonth, nextThreeMonths) use normalized dates

**User Experience:**
- Archiving removes event from active views, moves to "Arquivados" tab
- Advancing always results in a future event (prevents advancing to still-past dates)
- UI updates immediately after mutations via React Query cache invalidation
- Custom AlertDialog for archive confirmation with title "Arquivar evento"
- Custom AlertDialog for advance-year confirmation with title "Alterar evento"

**Testing:** ✅ E2E tests passed
- Archive past event → appears in "Arquivados" tab
- Advance past event → becomes future with correct date, status, and buttons
- Date calculations accurate across timezone boundaries

### User Profile "Gifts to Avoid" Field (November 19, 2025)
✅ **Added "Gifts to Avoid" Question to User Profile Questionnaire**
- New Question 12: "O que você não gosta de ganhar?"
- Text field with 256 character limit
- Helps personalize gift suggestions by filtering out unwanted gift types

**Database Schema:**
- Added `giftsToAvoid: varchar("gifts_to_avoid", { length: 256 })` to userProfiles table
- Migration applied successfully using `npm run db:push`

**Frontend Updates:**
- **Profile.tsx**: Added Question 12 with Textarea component
  - Character counter showing X/256 caracteres
  - Placeholder text with examples
  - data-testid: "textarea-gifts-to-avoid"

**User Experience:**
- Optional field - users can skip if they prefer
- Saves with profile via POST /api/profile
- Data persists across sessions
- Complements existing recipient profile "gifts to avoid" field

**Testing:** ✅ E2E tests passed
- Field renders correctly on profile page
- Character counter works accurately
- Data saves successfully
- Saved data persists after page reload

### Admin Panel RBAC Security Fix (November 19, 2025)
✅ **Fixed Critical Security Vulnerability in Role Persistence**
- Issue: User roles were being reset to "user" on OIDC re-login, demoting admins
- Solution: Modified `storage.upsertUser` to preserve existing role during OIDC updates

**Database Schema:**
- `users` table has `role` field (varchar, default: "user")
- Roles: "admin" (platform management) and "user" (normal users)

**Backend Security:**
- `isAdmin` middleware fetches fresh user from DB using `req.user.claims.sub`
- `upsertUser` preserves existing role while updating OIDC profile data
- Admin stats endpoint (`/api/admin/stats`) protected by `isAuthenticated` + `isAdmin`

**Frontend:**
- Admin button (Shield icon) visible only when `user.role === 'admin'`
- Admin page shows 5 platform statistics (users, recipients, events, suggestions, gifts)
- Non-admins redirected to homepage if attempting to access /admin

**Testing:** ✅ E2E tests passed
- Regular users cannot access admin features
- Admin promotion persists across logins
- All admin statistics display correctly

### "Keep Me Logged In" Feature (November 19, 2025)
✅ **Implemented Session Persistence Control**
- Users can choose to stay logged in for 7 days or logout when browser closes
- Checkbox "Manter-me logado neste navegador" on Landing page
- Default: checked (persistent session)

**Frontend Implementation:**
- Landing page has two login sections (hero and footer), each with synchronized checkbox
- State managed with `useState(true)` - checked by default
- Login handler adds `?remember=true` query parameter if checkbox is checked
- Data-testids: "checkbox-keep-logged-in" and "checkbox-keep-logged-in-footer"

**Backend Implementation:**
- `/api/login` captures `?remember=true` query parameter
- Stores preference temporarily in `req.session.rememberMe`
- `/api/callback` post-authentication:
  - If rememberMe = true: sets `cookie.maxAge = 7 days` (persistent cookie)
  - If rememberMe = false/undefined: sets `cookie.maxAge = undefined` (session cookie - expires on browser close)
  - Cleans up temporary `rememberMe` flag

**Session Behavior:**
- **Checkbox checked**: Cookie persists for 7 days (user stays logged in across browser sessions)
- **Checkbox unchecked**: Session cookie (expires when browser closes)
- Modified `getSession()` in `replitAuth.ts` to defer maxAge setting until callback

**User Experience:**
- Non-authenticated users always see Landing page first (enforced in App.tsx)
- After successful login, redirected to Dashboard with personalized greeting
- Both login buttons (hero and footer) respect same checkbox state

**Testing:** ✅ E2E tests passed
- Checkbox visible and functional in both sections
- Login with checkbox checked creates persistent cookie (7 days)
- Login with checkbox unchecked creates session cookie (expires: -1)
- Both flows redirect correctly to Dashboard
- Cookie expiry behavior validated via browser inspection