# Overview

This is a full-stack web application called "Everyday" - an MVP to-do list and calendar app that helps users manage their daily tasks. The application features a React frontend with shadcn/ui components, an Express.js backend, and PostgreSQL database integration via Drizzle ORM. Users can create, edit, and complete tasks while viewing them across different calendar formats (day, week, month views). The app includes Replit-based authentication and provides a colorful, modern interface for task management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints under `/api` prefix
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Session Management**: Express sessions with PostgreSQL store
- **Error Handling**: Centralized error middleware with structured error responses
- **Development Tools**: Hot module replacement via Vite integration

## Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with 7-day TTL
- **Authorization**: Custom middleware protecting API routes
- **User Management**: Automatic user creation/updates on login with profile data sync

## Database Design
- **ORM**: Drizzle with code-first schema approach
- **Tables**: 
  - `users` - User profiles and authentication data
  - `tasks` - Task entries with date, category, completion status
  - `sessions` - Session storage for authentication
- **Data Types**: UUID primary keys, timestamp tracking, flexible text fields
- **Relationships**: User-to-tasks one-to-many with cascade delete

## Task Management Features
- **CRUD Operations**: Full create, read, update, delete functionality
- **Categorization**: Color-coded categories (work, personal, health, urgent)
- **Date Organization**: Tasks organized by date with calendar navigation
- **Status Tracking**: Completion toggles with visual feedback
- **Sorting Options**: Multiple sort criteria (created, category, completed)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **Connection**: WebSocket-based connection pooling for serverless environments

## Authentication Services  
- **Replit Auth**: OAuth/OpenID Connect authentication provider
- **Session Store**: `connect-pg-simple` for PostgreSQL session persistence

## UI Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Date-fns**: Date manipulation and formatting utilities

## Development Tools
- **Vite**: Build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development plugins for Replit environment