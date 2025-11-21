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
- **AdminStatsCard**: Display statistics with icons and optional trends
- **AdminPageHeader**: Consistent page headers with titles, descriptions, and actions
- **Admin Dashboard**: Advanced statistics including user activity, gift stats, top categories, and quick access links

### Admin Features

#### Implemented
- **Advanced Statistics Dashboard**: Displays user stats (total, active, by role), gift stats (suggestions, purchased, favorites), top categories, and recent activity (today's new users, events, purchases)
- **Complete Backend API**: All CRUD endpoints for users, categories, occasions, price ranges, relationship types, system settings, and audit logs
- **Role-based Access Control**: Server-side middleware (`hasRole`) enforces permissions on all admin routes
- **Audit Logging**: All admin actions automatically logged with user, action, resource, details, and IP address
- **Reusable Components**: AdminStatsCard and AdminPageHeader for consistent admin UI

#### Next Steps (Not Yet Implemented)
- **User Management UI**: Interface for viewing, editing, and managing users with filtering and pagination
- **Category Management UI**: Pages for creating, editing, and deleting gift categories
- **Occasion Management UI**: Interface for managing special occasions and events
- **Price Range Management UI**: Tools for defining and updating price ranges
- **Relationship Type Management UI**: Interface for managing relationship types
- **System Settings UI**: Configuration panel for system-wide settings
- **Audit Log Viewer**: Reporting interface for viewing and filtering audit logs
- **Admin Sidebar Navigation**: Dedicated navigation for accessing all admin sections
- **Role-based UI Gating**: Client-side permission checks to show/hide features based on user role