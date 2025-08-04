# TaxConsult Pro - Client Management System

## Overview

TaxConsult Pro is a comprehensive client management system designed for tax consultancy firms to manage clients, tasks, and government portal credentials. The application provides a dashboard for tracking client information, managing compliance tasks across multiple government portals (FBR, SECP, PSW, PRA, IPO), and maintaining secure credential storage with encryption.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with CSS variables for theming support
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **File Uploads**: Multer for handling file uploads
- **Development**: Hot reload with Vite integration for seamless development experience

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Design**: Three main entities - users, clients, and tasks
- **Encryption**: AES-256-CBC encryption for sensitive portal credentials
- **File Storage**: Local file system storage for uploaded documents

### Security Features
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **JWT Authentication**: Secure token-based authentication with 7-day expiration
- **Credential Encryption**: Portal credentials encrypted before database storage
- **Input Validation**: Zod schemas for runtime type checking and validation

### Key Features
- **Client Management**: Full CRUD operations for client information including contact details and government portal credentials
- **Task Management**: Task tracking with status management, deadlines, and file attachments
- **Portal Integration**: Support for multiple government portals (FBR, SECP, PSW, PRA, IPO)
- **Dashboard Analytics**: Statistics and insights including overdue tasks, upcoming deadlines
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connection for Neon PostgreSQL
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-**: Complete UI component library for accessible components
- **drizzle-orm & drizzle-kit**: Type-safe database ORM and migration tools

### Authentication & Security
- **jsonwebtoken**: JWT token generation and verification
- **bcrypt**: Password hashing and comparison
- **crypto**: Built-in Node.js module for credential encryption

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production builds

### Validation & Forms
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Performant form handling
- **@hookform/resolvers**: Zod integration for form validation

### UI Enhancement
- **class-variance-authority**: Component variant styling
- **clsx & tailwind-merge**: Conditional CSS class handling
- **date-fns**: Date manipulation and formatting
- **lucide-react**: Icon library for consistent iconography