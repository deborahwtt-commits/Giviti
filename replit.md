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
- **Authentication**: Session-based using `express-session` and bcrypt for password hashing.
- **Data Layer**: Storage abstraction layer using Drizzle ORM for type-safe PostgreSQL queries and transaction support.

### Data Storage

- **Database**: PostgreSQL via Neon serverless.
- **Schema Design**: Includes tables for `users`, `userProfiles`, `recipients`, `recipientProfiles`, `events`, `eventRecipients`, `userGifts`, `giftSuggestions`, and `sessions`.
- **Data Validation**: Zod schemas generated from Drizzle tables for API request validation.

### UI/UX Decisions

- **Color Schemes**: HSL-based color system with CSS variables for dark/light themes.
- **Typography**: Inter and Sora fonts.
- **Layout**: Responsive grid layouts for suggestions.
- **Interactive Elements**: Heart button for favorites, "Comprado" checkbox, "Ver Detalhes" button.
- **Recipient Management**: Clickable recipient names to open a details dialog.
- **Suggestion Filtering**: Multi-criteria filtering (recipient, category, budget) with intelligent interest-based matching and pagination.
- **Recipient Grouping**: Automatic grouping of suggestions by recipient in "Todos" view, showing up to 5 interest-matched suggestions per recipient.
- **Event Management**: Past events show archive/advance options; future events show standard options. "Arquivados" tab for archived events.

### Feature Specifications

- **Personalized Suggestions**: Intelligent matching based on recipient profiles and interests.
- **Event Tracking**: Manage important dates, including archiving and advancing past events.
- **Gift Management**: Save/track purchased and favorited gifts.
- **User Profile**: 12-question personality questionnaire including "Gifts to Avoid" field (256 chars).
- **Recipient Profiles**: Detailed personality questionnaires for enhanced suggestions, including a "Gifts to Avoid" field (255 chars).
- **Pagination and Filtering**: Client-side filtering and pagination for gift suggestions.
- **Authentication**: Email/password registration and login with session persistence and bcrypt hashing. New users are automatically redirected to profile questionnaire page (/perfil) after registration.
- **Admin Panel**: Comprehensive administrative module with role-based access control (admin, manager, support, readonly) for system management, statistics, and audit logging.

## External Dependencies

- **Database Service**: Neon PostgreSQL (serverless database).
- **CDN Resources**: Google Fonts, Unsplash.
- **UI Component Libraries**: Radix UI, Lucide React.
- **Date Utilities**: date-fns.
- **Form Management**: react-hook-form, @hookform/resolvers (Zod resolver).
- **Other UI Components**: cmdk, vaul, embla-carousel-react, recharts.
- **Integrations**: Mock e-commerce links, pre-seeded gift database.

## Administrative Module

### Admin Access Control

- **Roles**: admin (full access), manager (management tasks), support (read + limited write), readonly (read-only), user (regular user)
- **Access Levels**: Role-based middleware (`hasRole(...roles)`) enforces permissions on all admin routes
- **Authentication**: Admin routes require authentication via `isAuthenticated` middleware

### Admin Database Schema

Extended schema with administrative tables:
- **categories**: Gift categories with icon and display order
- **occasions**: Special occasions/events with icon and seasonal flags
- **priceRanges**: Price range definitions for gift filtering
- **relationshipTypes**: Types of relationships between users and recipients
- **systemSettings**: Key-value store for system configuration
- **auditLogs**: Comprehensive audit trail of all admin actions

### Admin API Routes

All routes prefixed with `/api/admin/` in dedicated `server/adminRoutes.ts`:
- **User Management**: GET/PUT `/users`, GET `/users/:id` (admin, manager access)
- **Categories**: GET/POST/PUT/DELETE `/categories` (manager can edit)
- **Occasions**: GET/POST/PUT/DELETE `/occasions` (manager can edit)
- **Price Ranges**: GET/POST/PUT/DELETE `/price-ranges` (manager can edit)
- **Relationship Types**: GET/POST/PUT/DELETE `/relationship-types` (manager can edit)
- **System Settings**: GET/POST/PUT/DELETE `/settings` (admin only)
- **Audit Logs**: GET `/audit-logs` (admin, manager, support access)
- **Statistics**: GET `/advanced-stats` (comprehensive platform statistics)

### Admin Frontend Components

Reusable admin components in `client/src/components/admin/`:
- **AdminStatsCard**: Display statistics with icons, optional trends, and optional onClick for navigation
- **AdminPageHeader**: Consistent page headers with titles, descriptions, and actions
- **Admin Dashboard**: Advanced statistics including user activity, gift stats, top categories, and quick access links

### Admin Features

#### Implemented
- **Advanced Statistics Dashboard**: Displays user stats (total, active, by role), gift stats (suggestions, purchased, favorites), top categories, and recent activity (today's new users, events, purchases)
- **Complete Backend API**: All CRUD endpoints for users, categories, occasions, price ranges, relationship types, system settings, and audit logs
- **Role-based Access Control**: Server-side middleware (`hasRole`) enforces permissions on all admin routes (admin, manager, support have full access)
- **Audit Logging**: All admin actions automatically logged with user, action, resource, details, and IP address
- **Reusable Components**: AdminStatsCard (with clickable support), AdminPageHeader, and CreateUserDialog for consistent admin UI
- **Create User Feature**: Complete user creation interface in admin panel with:
  - Form validation (Zod on both frontend and backend)
  - Password hashing with bcrypt
  - Role assignment (user, admin, manager, support, readonly)
  - Duplicate email check
  - Success/error notifications
  - Automatic statistics refresh
- **User List Feature**: Detailed user listing accessible from "Total de Usuários" card in admin panel:
  - Optimized backend query using CTEs (Common Table Expressions) to eliminate N+1 pattern
  - Displays: Nome, E-mail, Perfil, Data de Criação, Total de Eventos, Total de Presenteados, Total de Presentes Comprados
  - Type-safe interface with proper createdAt handling (ISO string)
  - Complete error handling with toast notifications and retry UI
  - Clickable AdminStatsCard navigation with visual feedback
  - Route: `/admin/usuarios`
  - Performance-optimized for large user bases

#### Next Steps (Not Yet Implemented)
- **User Edit/Delete**: Interface for editing and deleting users with confirmation dialogs
- **User Filtering**: Add filters for role, active status, and search by name/email
- **Category Management UI**: Pages for creating, editing, and deleting gift categories
- **Occasion Management UI**: Interface for managing special occasions and events
- **Price Range Management UI**: Tools for defining and updating price ranges
- **Relationship Type Management UI**: Interface for managing relationship types
- **System Settings UI**: Configuration panel for system-wide settings
- **Audit Log Viewer**: Reporting interface for viewing and filtering audit logs
- **Admin Sidebar Navigation**: Dedicated navigation for accessing all admin sections
- **Role-based UI Gating**: Client-side permission checks to show/hide features based on user role

## Collaborative Events ("Planeje seu rolê!")

### Overview
New feature for collaborative event planning supporting Secret Santa, themed nights, collective gifts, and creative challenges.

**Nomenclatura Importante:**
- **"Eventos"** = Ocasiões de presentes (aniversários, datas comemorativas) → Página `/eventos`
- **"Rolês"** = Eventos colaborativos (amigo secreto, festas temáticas, etc) → Página `/role`
- Interface usa "Criar Rolê" em vez de "Criar Evento" para evitar confusão

### Phase 1: Foundation ✅ COMPLETED (Nov 24, 2025)

#### Database Schema (6 new tables)
- **collaborative_events**: Main event table with ownerId, eventType (secret_santa, themed_night, collective_gift, creative_challenge), typeSpecificData (JSONB), status (draft, active, completed, cancelled)
- **collaborative_event_participants**: Participants with userId/email/name, role (owner, organizer, participant), status (pending, accepted, declined), inviteToken, participantData (JSONB)
- **collaborative_event_links**: Share links with unique token, permissions, expiration, useCount
- **secret_santa_pairs**: Secret Santa pairings (giverParticipantId, receiverParticipantId, revealDate)
- **collective_gift_contributions**: Payment tracking (participantId, amountDue, amountPaid, isPaid)
- **collaborative_event_tasks**: Task lists for themed nights (title, description, assignedTo, isCompleted, priority)

#### Storage Layer
- **Optimized Queries**: Single JOIN queries for event access checking owner OR participant (by userId or email)
- **Email-only Participants**: Support for participants invited by email before account creation
- **Access Control**: Proper authorization for owner, userId-based participants, and email-matched participants
- **14 Storage Methods**: Full CRUD for events, participants, and share links

#### API Routes (`/api/collab-events`)
- **Event CRUD**: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
- **Participants**: GET /:id/participants, POST /:id/participants, PATCH /:eventId/participants/:participantId/status, DELETE /:eventId/participants/:participantId
- **Share Links**: GET /:id/share-links, POST /:id/share-links, DELETE /share-links/:token
- **Security**: All routes protected with `isAuthenticated` middleware, helper `canAccessEvent()` for authorization
- **Validation**: Zod schema refinement requires userId OR (email + name) to prevent orphan participant records

#### Frontend
- **Navigation**: "Planeje seu rolê!" menu item → `/role`
- **Event Listing Page**: Card-based layout with event types using Lucide icons:
  - Secret Santa: `Gift` icon
  - Themed Night: `PartyPopper` icon
  - Collective Gift: `Heart` icon
  - Creative Challenge: `Sparkles` icon
- **Empty State**: CTA to create first event
- **Skeleton Loading**: Smooth loading experience
- **Design Compliance**: Follows candy-color design guidelines, NO emoji literals

#### Performance Optimizations
- **Single-query fetching**: `getCollaborativeEvents()` uses one LEFT JOIN instead of multiple round trips
- **Deduplicated results**: Automatic deduplication when JOIN returns multiple rows
- **Optimized access checks**: `getCollaborativeEvent()` supports optional userId for admin/share-link contexts

### Phase 2: Secret Santa Flow (In Progress - Nov 24, 2025)

#### Completed ✅
- **Task 1**: CreateRoleDialog component
  - Form with conditional budget field for Secret Santa
  - Form validation with react-hook-form + Zod
  - Mutation to POST `/api/collab-events` with ownerId from session
- **Task 2**: RoleDetail page (`/role/:id`)
  - 3 tabs: Visão Geral, Participantes, Configurações
  - Type-safe event rendering with fallbacks
  - Wouter-based navigation (no full page reloads)
  - Budget display for Secret Santa events
- **Task 3**: Participant management interface
  - AddParticipantDialog for adding by email+name
  - Dropdown menu with status updates (pending/accepted/declined)
  - Remove participant with AlertDialog confirmation
  - Owner cannot be removed (UI protection)
  - Query invalidation after mutations

#### Remaining (Planned)
- **Task 4**: Auto-draw algorithm with exclusion rules
- **Task 5**: Participant view of Secret Santa results (who they drew)
- **Task 6**: Wishlist functionality (participant preferences)
- Pair management and reveal scheduling
- Participant notifications

### Phase 3: Collective Gifts (Planned)
- Payment tracking per participant
- Amount due/paid status
- Payment reminders
- Integration with payment methods

### Phase 4: Themed Nights (Planned)
- Task board with assignments
- Priority levels
- Completion tracking
- Task notifications

### Phase 5: Creative Challenges (Planned)
- Challenge submission system
- Voting mechanism
- Winner selection
- Challenge history