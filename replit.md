# Nimble Deploy

## Overview

Nimble Deploy is a modern, minimalistic platform that converts Swagger/OpenAPI definitions into auto-deployed MCP servers. The application features OAuth-based authentication, user-specific server management, and a complete landing page for non-authenticated users with enterprise-grade security and monitoring capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

- **OAuth Authentication Implementation**: Integrated Replit OAuth for secure user authentication
- **Landing Page**: Created modern landing page with glassmorphism design for non-authenticated users
- **User-Specific Data**: All MCP servers are now user-scoped with proper access controls
- **Database Migration**: Switched from in-memory storage to PostgreSQL with Drizzle ORM
- **Rebranding**: Updated application name to "Nimble Deploy" with modern UI styling
- **Secure Routes**: All API endpoints now require authentication except public landing page
- **User Interface**: Added user dropdown with profile info and logout functionality
- **Docker Deployment**: Complete containerization with Docker and Docker Compose setup
- **Production Ready**: Nginx reverse proxy, health checks, and deployment automation

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
- **Authentication**: Replit OAuth with OpenID Connect
- **Session Management**: PostgreSQL-backed sessions with connect-pg-simple
- **API Style**: RESTful APIs with structured error handling and authentication middleware
- **File Upload**: Multer for handling OpenAPI spec uploads

### Key Components

#### Database Schema
- **Users**: OAuth user management with Replit integration (email, profile info)
- **Sessions**: Secure session storage for authentication state
- **MCP Servers**: User-scoped server entities with OpenAPI specs and deployment status
- **Deployment Events**: Audit trail for all server lifecycle events

#### Service Layer
- **OpenAPI Parser**: Validates and parses OpenAPI 3.0 specifications
- **MCP Generator**: Converts OpenAPI specs into Express.js server code
- **Deployment Service**: Simulates server deployment with status tracking

#### Frontend Pages
- **Landing Page**: Modern glassmorphism design for non-authenticated users with features showcase
- **Dashboard**: User-specific overview of server statistics and recent activities
- **Upload**: File upload and server configuration interface
- **Servers**: Management interface for user's MCP servers
- **Documentation**: Comprehensive API and integration documentation
- **Authentication**: OAuth login/logout flow with user profile management

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
- **Containerization**: Docker with multi-stage builds for optimized images
- **Orchestration**: Docker Compose with health checks and service dependencies
- **Reverse Proxy**: Nginx with rate limiting, caching, and security headers
- **Deployment**: Automated deployment scripts with multiple configuration profiles

#### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development
2. **TypeScript Throughout**: End-to-end type safety with shared schemas
3. **Database-First**: Drizzle ORM with PostgreSQL for reliability and type safety
4. **Component-Based UI**: shadcn/ui for consistent, accessible, and customizable components
5. **Service Layer Pattern**: Clean separation of business logic from API routes
6. **Event Sourcing**: Deployment events table for audit trail and debugging
7. **In-Memory Fallback**: Memory storage implementation for development/testing

The application follows modern full-stack patterns with emphasis on type safety, developer experience, and scalable architecture. The use of established tools like Express, React, and PostgreSQL ensures maintainability while the TypeScript-first approach provides robust error checking and IDE support.

## Docker Deployment

The application includes comprehensive Docker deployment setup:

### Quick Deployment Commands
- `./deploy.sh basic` - Deploy with app and database
- `./deploy.sh nginx` - Deploy with reverse proxy
- `./deploy.sh full` - Deploy all services (app, database, Redis, Nginx)

### Key Docker Features
- **Multi-stage builds** for optimized production images
- **Health checks** for all services with automatic restarts
- **Volume persistence** for data and uploads
- **Environment configuration** via .env files
- **Service orchestration** with dependency management
- **Security hardening** with non-root containers and proper networking

### Production Ready Components
- Nginx reverse proxy with rate limiting and SSL support
- Redis for high-performance session storage
- PostgreSQL with automated backups and initialization
- Comprehensive logging and monitoring setup