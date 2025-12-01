# Lorry Receipt Management System

## Overview

This is a professional Lorry Receipt (LR) Management System designed for transport and logistics companies to manage lorry receipts, track shipments, and maintain master data for vehicles, drivers, consignors, and consignees. The application provides a complete solution for creating, viewing, and managing transport documents with support for GST compliance and detailed tracking.

The system is built as a full-stack web application with a React frontend and Express backend, using PostgreSQL for data persistence. It follows Material Design principles with a focus on utility and professional presentation suitable for enterprise use.

## Recent Changes

### December 2024 - Complete LR Workflow Implementation

**Database Schema**: Added three new tables to support the complete LR workflow:
- `consignment_note`: Main LR table with foreign keys to all master tables
- `invoice_line_items`: Multiple invoices per LR with line item details
- `consignment_details`: Additional consignment metadata and vendor codes

**Backend API Routes**: Implemented LR CRUD operations:
- `GET /api/lrs`: Returns flat array of all consignment notes
- `POST /api/lrs`: Creates LR with transaction-based insertion (note + invoices + details)
- `GET /api/lrs/:id`: Returns nested structure with `{ note, consignor, consignee, vehicle, driver, invoices, details }`

**Frontend Pages**: Completed three major pages:
1. **Create LR** (`/create`): Multi-section form with dynamic invoice line items, master data selection, and comprehensive validation
2. **LR List** (`/lrs`): Searchable table view with filters by CNote No, from/to locations
3. **View LR** (`/lr/:id`): Print-optimized display matching PDF format with all LR details

**Testing**: End-to-end test validated complete workflow from master data creation through LR creation, listing, and viewing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and development server.

**UI Component Library**: shadcn/ui (Radix UI primitives) with Tailwind CSS for styling. The design follows a Material Design-inspired approach optimized for data-heavy forms and structured information display.

**Routing**: wouter - a lightweight client-side routing library for navigation between pages.

**State Management**: TanStack Query (React Query) for server state management, API data fetching, caching, and synchronization. Local component state uses React hooks.

**Form Handling**: React Hook Form with Zod for validation (via @hookform/resolvers).

**Design System**:
- Typography: Inter (primary), Roboto Mono (for LR numbers and codes)
- Color scheme: Neutral-based with support for light/dark themes
- Spacing: Tailwind spacing scale (units of 2, 4, 6, 8, 12)
- Component variants: Material-inspired cards, forms, tables, and dialogs

**Key Pages**:
- Dashboard: Overview with statistics and recent LRs
- LR List: Searchable table of all lorry receipts
- Create LR: Multi-section form for creating new receipts
- View LR: Print-optimized receipt view
- Master Data Management: CRUD interfaces for vehicles, drivers, consignors, and consignees

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API with JSON responses. Routes are organized by resource type (vehicles, drivers, consignors, consignees).

**Development/Production Split**: 
- Development mode uses Vite middleware for HMR and SSR
- Production mode serves pre-built static assets with fallback to index.html for SPA routing

**Request Processing**:
- JSON body parsing with raw body capture for verification
- Request/response logging middleware with timing
- Error handling with appropriate HTTP status codes

**Validation**: Zod schemas (from shared/schema.ts) validate incoming data before database operations.

### Data Storage

**Database**: PostgreSQL accessed via the Neon serverless driver (@neondatabase/serverless).

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Organization**: Database schema defined in shared/schema.ts using Drizzle's pg-core, including:
- `users`: User authentication (id, username, password)
- `vehicle_master`: Vehicle information (vehicle_no, type, capacity, registration)
- `driver_master`: Driver details (name, license, mobile, Aadhaar)
- `consignor_master`: Consignor/sender information (name, address, GSTIN)
- `consignee_master`: Consignee/receiver information (name, address, GSTIN)
- `consignment_note`: Main LR table with foreign keys to consignor, consignee, vehicle, and driver (cnote_no, booking_date, from/to locations, billing party, etc.)
- `invoice_line_items`: Invoice details for each consignment (invoice_no, invoice_date, invoice_value, number of cases, actual weight)
- `consignment_details`: Additional consignment information (risk type, owner, vendor codes, etc.)

**Validation Schemas**: Drizzle-Zod generates Zod schemas from database tables for runtime validation.

**Storage Interface**: Abstracted storage layer (server/storage.ts) provides CRUD operations for all entities, allowing for potential database swapping.

### Authentication and Authorization

Currently implements basic user schema but authentication/authorization mechanisms are not fully implemented in the codebase. The schema supports username/password authentication with UUIDs as user identifiers.

## External Dependencies

### Core Framework Dependencies
- **React** (v18+): UI framework
- **Express**: Backend HTTP server
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon
- **Drizzle ORM**: Type-safe SQL query builder
- **drizzle-kit**: Schema migrations and management
- **postgres**: PostgreSQL client library

### UI Component Libraries
- **@radix-ui/***: Headless UI primitives (20+ components including dialog, dropdown, select, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Data Management
- **@tanstack/react-query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Zod**: Schema validation
- **drizzle-zod**: Generate Zod schemas from Drizzle tables

### Routing & Navigation
- **wouter**: Lightweight client-side routing

### Development Tools
- **@replit/vite-plugin-***: Replit-specific development plugins (cartographer, dev-banner, runtime-error-modal)
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development server

### Date & Formatting
- **date-fns**: Date manipulation and formatting

### Session Management
- **connect-pg-simple**: PostgreSQL session store for Express (dependency present but session middleware not visible in code)

### Build & Development
- **autoprefixer**: CSS vendor prefixing
- **postcss**: CSS transformation

The application does not currently integrate with external third-party services (payment gateways, SMS, email, etc.) but the architecture supports adding such integrations through the backend API layer.