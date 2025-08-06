# Overview

MedBook is a comprehensive healthcare management system built as a fullstack web application for managing medical appointments, prescriptions, and patient care. The system serves three user roles: administrators who manage the overall system, doctors who handle patient appointments and prescriptions, and patients who book appointments and access their medical records.

The application provides role-based dashboards with specialized functionality for each user type, including appointment scheduling, prescription management, and administrative oversight of the healthcare system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React 18 using TypeScript and follows a component-based architecture. The application uses:
- **React Router** for client-side navigation with role-based routing
- **Context API** for state management (AuthContext and AppContext)
- **Custom hooks** for data fetching and state management
- **shadcn/ui** component library built on top of Radix UI primitives
- **Tailwind CSS** for styling with a design system approach
- **Date-fns** for date manipulation and formatting

The frontend implements a clean separation of concerns with dedicated contexts for authentication and application state, reusable UI components, and role-specific page components.

## Backend Architecture
The server follows an Express.js REST API pattern with:
- **Express.js** as the web framework with middleware for request logging and error handling
- **TypeScript** for type safety across the entire stack
- **Shared schema definitions** between client and server using Drizzle ORM
- **Storage abstraction layer** with interface-based design for database operations
- **Development/production environment handling** with Vite integration for development

The backend uses a repository pattern through the storage interface, allowing for easy testing and potential database switching.

## Database Design
The system uses PostgreSQL as the primary database with Drizzle ORM for schema management and queries:
- **Users table** - Core user information with role-based access (admin, doctor, patient)
- **Doctors table** - Extended doctor profiles with specialization, experience, and availability
- **Patients table** - Patient-specific information including demographics
- **Appointments table** - Appointment scheduling with status tracking
- **Prescriptions table** - Medical prescriptions linked to appointments

The schema uses UUID primary keys and proper foreign key relationships with cascade deletes for data integrity.

## Authentication System
The application implements a role-based authentication system:
- **Multi-role login** with separate login flows for patients, doctors, and administrators
- **Demo user system** for development with hardcoded credentials
- **JWT-style session management** using localStorage for client-side session persistence
- **Role-based route protection** preventing unauthorized access to role-specific features

## State Management
The application uses React Context for global state management:
- **AuthContext** manages user authentication state and login/logout operations
- **AppContext** handles application data including doctors, appointments, and prescriptions
- **Local component state** for form handling and UI interactions

# External Dependencies

## Database and ORM
- **Neon Database** (@neondatabase/serverless) - Serverless PostgreSQL database provider
- **Drizzle ORM** (drizzle-orm) - Type-safe ORM for database operations and schema management
- **Drizzle Kit** (drizzle-kit) - Database migration and schema management tools

## UI and Styling
- **Radix UI** - Comprehensive set of low-level UI primitives for building accessible interfaces
- **Tailwind CSS** - Utility-first CSS framework for styling
- **shadcn/ui** - Pre-built component library based on Radix UI
- **Lucide React** - Icon library for consistent iconography
- **Class Variance Authority** - Utility for creating component variants

## Development Tools
- **Vite** - Build tool and development server with React plugin support
- **TypeScript** - Type checking and enhanced developer experience
- **ESBuild** - Fast JavaScript bundler for production builds
- **PostCSS** - CSS processing with Tailwind CSS integration

## Utility Libraries
- **React Hook Form** (@hookform/resolvers) - Form handling and validation
- **TanStack Query** (@tanstack/react-query) - Server state management and caching
- **Date-fns** - Date manipulation and formatting utilities
- **Zod** - Schema validation for forms and API responses
- **clsx** - Conditional className utility
- **jsPDF** - PDF generation for prescription downloads

## Session Management
- **Connect PG Simple** (connect-pg-simple) - PostgreSQL session store for Express sessions
- **WebSocket** (ws) - WebSocket implementation for real-time features

The application is configured to run on Replit with specific Replit integration plugins for development environment support.