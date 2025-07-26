# Nimble Deploy

## Overview

Nimble Deploy is a full-stack web application that allows users to upload OpenAPI specifications and automatically generate MCP (Model Context Protocol) servers. The application provides a comprehensive platform for creating, managing, and deploying API servers with built-in authentication, rate limiting, and monitoring capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Style**: RESTful APIs with structured error handling
- **File Upload**: Multer for handling OpenAPI spec uploads

### Key Components

#### Database Schema
- **Users**: Basic user management with username/password authentication
- **MCP Servers**: Core entity storing server configurations, OpenAPI specs, and deployment status
- **Deployment Events**: Audit trail for all server lifecycle events

#### Service Layer
- **OpenAPI Parser**: Validates and parses OpenAPI 3.0 specifications
- **MCP Generator**: Converts OpenAPI specs into Express.js server code
- **Deployment Service**: Simulates server deployment with status tracking

#### Frontend Pages
- **Dashboard**: Overview of server statistics and recent activities
- **Upload**: File upload and server configuration interface
- **Servers**: Management interface for existing MCP servers
- **Documentation**: Comprehensive API and integration documentation

### Data Flow

1. **Upload Flow**: User uploads OpenAPI spec → Validation → Server configuration → Code generation → Deployment
2. **Management Flow**: Server listing → Individual server details → Status monitoring → Actions (edit/delete)
3. **Monitoring Flow**: Real-time status updates → Health checks → Event logging → Statistics aggregation

### External Dependencies

#### Core Dependencies
- **Database**: Neon Database for PostgreSQL hosting
- **UI Components**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

#### Development Dependencies
- **Build Tools**: esbuild for server bundling, Vite for client building
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (implied by shadcn/ui setup)

### Deployment Strategy

#### Development Environment
- **Client**: Vite dev server with HMR
- **Server**: tsx for TypeScript execution with file watching
- **Database**: Drizzle Kit for schema migrations

#### Production Environment
- **Client**: Static build served by Express
- **Server**: Compiled to ESM bundle via esbuild
- **Database**: Production PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

#### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development
2. **TypeScript Throughout**: End-to-end type safety with shared schemas
3. **Database-First**: Drizzle ORM with PostgreSQL for reliability and type safety
4. **Component-Based UI**: shadcn/ui for consistent, accessible, and customizable components
5. **Service Layer Pattern**: Clean separation of business logic from API routes
6. **Event Sourcing**: Deployment events table for audit trail and debugging
7. **In-Memory Fallback**: Memory storage implementation for development/testing

The application follows modern full-stack patterns with emphasis on type safety, developer experience, and scalable architecture. The use of established tools like Express, React, and PostgreSQL ensures maintainability while the TypeScript-first approach provides robust error checking and IDE support.