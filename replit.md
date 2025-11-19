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
- **Admin Panel**: Role-based access control for administrative statistics.

## External Dependencies

- **Database Service**: Neon PostgreSQL (serverless database).
- **CDN Resources**: Google Fonts, Unsplash.
- **UI Component Libraries**: Radix UI, Lucide React.
- **Date Utilities**: date-fns.
- **Form Management**: react-hook-form, @hookform/resolvers (Zod resolver).
- **Other UI Components**: cmdk, vaul, embla-carousel-react, recharts.
- **Integrations**: Mock e-commerce links, pre-seeded gift database.