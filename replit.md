# replit.md

## Overview

This is a full-stack TypeScript e-commerce web application called TechStore - a modern online shopping platform featuring product catalogs, detailed product views, shopping cart, checkout functionality, and email order notifications. The application uses a modern tech stack with React frontend, Express backend, and in-memory storage for rapid development.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 27, 2025)

✓ Complete architectural transformation from gaming platform to e-commerce
✓ Consolidated ALL code into single file (home.tsx) - 1,256 lines
✓ Built complete in-memory data store with product catalog and shopping functionality
✓ Created custom UI components (Button, Input, Card, Modal, Badge, Form elements)
✓ Implemented full e-commerce features: product search, cart, checkout, email notifications
✓ Applied modern styling with Tailwind CSS and responsive design
✓ Self-contained application with React Query for state management and custom toast system

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: PostgreSQL session store (connect-pg-simple)
- **API Design**: RESTful endpoints under `/api` prefix

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend application  
- `shared/` - Shared TypeScript types and schemas
- `migrations/` - Database migration files

## Key Components

### Database Schema
The application uses 6 main data entities:
- **products**: Product catalog with features, specifications, pricing, and inventory
- **customers**: Customer accounts with contact information and addresses
- **orders**: Order records with status tracking and totals
- **orderItems**: Individual items within orders with quantities and pricing
- **reviews**: Customer product reviews with ratings and comments
- **cart**: Shopping cart items for session-based shopping

### Frontend Components (Single File Architecture)
All frontend functionality consolidated into `home.tsx`:
- **Product Grid**: Displays products with category filtering and search
- **Product Detail Modal**: Shows detailed product information, features, specifications, and reviews
- **Shopping Cart**: Interactive cart with quantity management
- **Checkout Form**: Complete order placement with customer information
- **Email Notifications**: Order confirmation notifications

### API Endpoints
- Product management: `/api/products/*` (catalog, featured, search)
- Shopping cart: `/api/cart/*` (add, update, remove items)
- Order processing: `/api/orders/*` (checkout, order details)
- Customer reviews: `/api/reviews` (product feedback)
- Email notifications: Automated order confirmations

## Data Flow

1. **Authentication**: Mock authentication using hardcoded user ID ("user-1")
2. **Level Creation**: Canvas-based editor saves level data as JSON to database
3. **Social Features**: Users can view friends' levels and activities
4. **Progress Tracking**: Game completion statistics and best times stored
5. **Real-time Updates**: TanStack Query handles cache invalidation and refetching

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Migration System**: Drizzle Kit for schema migrations

### UI Framework
- **shadcn/ui**: Pre-built accessible React components
- **Radix UI**: Headless UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the entire stack
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development
- **Dev Server**: `npm run dev` starts both Vite dev server and Express server
- **Hot Reload**: Vite middleware integrated with Express for seamless development
- **Type Checking**: TypeScript compiler runs separately from build process

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- **DATABASE_URL**: Required environment variable for PostgreSQL connection
- **Session Storage**: PostgreSQL-backed sessions for production scalability
- **Static Files**: Express serves built frontend files in production

### Key Architectural Decisions

1. **Shared Schema**: TypeScript types shared between frontend and backend ensure type safety
2. **In-Memory Storage**: Current implementation uses mock storage interface, easily replaceable with real database operations
3. **Canvas Editor**: Level editor uses HTML5 Canvas for interactive level design
4. **Social Features**: Friend system and activity feeds built for community engagement
5. **Progress Tracking**: Comprehensive statistics system for user engagement metrics