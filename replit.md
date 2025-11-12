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
- **Recipient Profiles**: Detailed personality questionnaires for enhanced suggestions, including a "Gifts to Avoid" field.
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