# Giviti - Intelligent Gift Suggestion App

## Overview

Giviti is a web-based MVP application designed to provide personalized gift suggestions. Its core purpose is to simplify gift-giving by managing recipient information, tracking events, and offering curated gift recommendations based on individual preferences, occasions, and budgets. The application aims to ensure users never miss an important date and always find the perfect gift.

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