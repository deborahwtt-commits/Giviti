# Giviti - Intelligent Gift Suggestion App

## Overview
Giviti is an MVP web application designed to streamline gift-giving by managing recipient information and events, and providing personalized gift suggestions. The application aims to help users remember important dates and find the perfect gift through intelligent suggestion matching, pagination, and multi-criteria filtering. It also includes an administrative module for system management and collaborative event planning features like Secret Santa and personalized birthday wishlists.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Design System**: HSL-based color system with CSS variables for dark/light themes, Inter and Sora fonts, custom spacing, inspired by Etsy, Pinterest, Notion, and Airbnb.
- **Layout**: Responsive grid layouts, card-based event listings with Lucide icons.
- **Interactive Elements**: Heart button for favorites, "Comprado" checkbox, "Ver Detalhes" button.
- **Suggestion Filtering**: Multi-criteria filtering (recipient, category, budget) with intelligent interest-based matching and pagination.
- **Event Management**: Past events show archive/advance options; future events show standard options. Unified EventCard component displays both regular and collaborative events.
- **Collaborative Events**: Specific UI for "Rolês" (collaborative events) with tabbed interfaces for overview, participants, and settings.
- **Birthday Events**: Dedicated pages for managing wishlists and guests, and a public-facing page for sharing wishlists.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching, Shadcn/ui (Radix UI primitives), Tailwind CSS.
- **Backend**: Express.js with TypeScript, Node.js.
- **API Design**: RESTful API for authentication, user profiles, recipients, events, suggestions, statistics, gift management, and collaborative events.
- **Authentication**: Session-based using `express-session` and bcrypt for password hashing, with a token-based password recovery system.
- **Data Layer**: Drizzle ORM for type-safe PostgreSQL queries.
- **Data Validation**: Zod schemas generated from Drizzle tables for API request validation.

### Feature Specifications
- **Personalized Suggestions**: Intelligent matching based on recipient profiles and interests using a unified interests-categories system (recipient interests ARE product categories).
  - **Algorithm**: Prioritizes internal database results, then fetches from Google Shopping API to fill gaps. Pagination limits to 15 results (3 pages).
  - **Google Product Taxonomy**: Integrates 21 standardized Google Product Categories for consistent matching.
  - **Relevance Scoring**: Uses a point-based system considering category matches, tags, keywords, interests, gift preferences, and demographic filters (gender, age).
  - **Caching**: Google Shopping search results are cached in-memory per session.
- **Event Tracking**: Manages important dates, including archiving and advancing past events, with date validation ensuring future dates.
- **Gift Management**: Allows saving/tracking purchased and favorited gifts, with universal purchase tracking, external source identification, and spending statistics.
- **User/Recipient Profiles**: Detailed profiles include personality questionnaires, "Gifts to Avoid" fields, and optional location fields.
- **Admin Panel**: Comprehensive administrative module with role-based access control for user management, categories, system settings, audit logs, and gift suggestions.
- **Astrology Module**: Displays weekly horoscope messages on the Dashboard based on the user's zodiac sign.
- **Birthday Events ("Meu Aniversário")**: Special event type for managing personal birthday celebrations with wishlists, guest management, and automated email invitations with tracking.
- **Collaborative Events**: Supports Secret Santa, themed nights, and collective gifts with participant management, draw algorithms, and shareable links. Includes dynamic subcategory systems for themed nights and automated email invitations with status tracking.

### System Design Choices
- **Database Schema**: PostgreSQL with tables for `users`, `userProfiles`, `recipients`, `events`, `giftSuggestions`, `giftCategories`, `giftTypes`, and dedicated tables for collaborative events and birthday wishlists.
  - **Gift Suggestions**: Includes `priority`, `giftTypeId`, `targetGender`, and `targetAgeRange`.
  - **Gift Categories & Types**: `giftCategories` includes `keywords array` for flexible interest matching; `giftTypes` provides general classifications.
  - **Birthday Events**: `birthdayWishlists` for items, `birthdayGuests` for invites, and `birthdayLinks` for public access.
  - **Collaborative Events**: `collaborative_events`, `collaborative_event_participants`, `secret_santa_pairs`, etc., with `emailStatus` tracking for invitations.

## External Dependencies
- **Database Service**: Neon PostgreSQL (serverless database).
- **CDN Resources**: Google Fonts, Unsplash.
- **UI Component Libraries**: Radix UI, Lucide React, Shadcn/ui.
- **Date Utilities**: date-fns.
- **Form Management**: react-hook-form, @hookform/resolvers (Zod resolver).
- **Other UI Components**: cmdk, vaul, embla-carousel-react, recharts.
- **Integrations**: Mock e-commerce links, pre-seeded gift database, Resend (for email services).