# System Architecture and Technical Specifications

## 1. Introduction

This document outlines the comprehensive system architecture and technical specifications for the couple's collaboration web application. The architecture is designed to support both business/financial management and relationship enhancement features while ensuring scalability, security, and maintainability. The application will be developed using modern web technologies and deployed on lovable.dev.

## 2. High-Level Architecture Overview

The application follows a modern three-tier architecture pattern consisting of:

1. **Presentation Layer (Frontend):** React-based single-page application (SPA) providing the user interface
2. **Application Layer (Backend):** Node.js/Express.js API server handling business logic and data processing
3. **Data Layer:** PostgreSQL database for persistent data storage with Redis for caching and session management

The architecture emphasizes separation of concerns, modularity, and security, with clear boundaries between different functional domains.

## 3. Frontend Architecture

### 3.1. Technology Stack

The frontend will be built using React 18 with TypeScript for type safety and improved developer experience. Key technologies include:

- **React 18:** Core framework for building the user interface with concurrent features
- **TypeScript:** Static type checking for enhanced code quality and developer productivity
- **React Router v6:** Client-side routing for single-page application navigation
- **Redux Toolkit:** State management for complex application state
- **Material-UI (MUI) v5:** Component library for consistent and accessible UI design
- **Axios:** HTTP client for API communication
- **React Hook Form:** Form handling with validation
- **Chart.js/Recharts:** Data visualization for financial reports and analytics
- **Socket.io-client:** Real-time communication for messaging and live updates

### 3.2. Component Architecture

The frontend follows a modular component architecture organized by feature domains:

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   ├── layout/           # Layout components (header, sidebar, footer)
│   └── forms/            # Form components
├── features/
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard overview components
│   ├── finance/          # Financial management components
│   ├── business/         # Business collaboration components
│   ├── relationship/     # Relationship features components
│   └── settings/         # User settings components
├── hooks/                # Custom React hooks
├── services/             # API service functions
├── store/                # Redux store configuration
├── utils/                # Utility functions
└── types/                # TypeScript type definitions
```

### 3.3. State Management Strategy

The application uses Redux Toolkit for global state management with the following store structure:

- **auth:** User authentication state and session management
- **finance:** Financial data including transactions, budgets, and accounts
- **business:** Business tasks, documents, and collaboration data
- **relationship:** Personal memories, notes, and communication
- **ui:** UI state including loading states, modals, and notifications

Local component state is used for temporary UI state that doesn't need to be shared across components.

### 3.4. Security Considerations

Frontend security measures include:

- **Input Validation:** Client-side validation using React Hook Form with schema validation
- **XSS Prevention:** Proper sanitization of user inputs and use of React's built-in XSS protection
- **HTTPS Enforcement:** All communication over secure HTTPS connections
- **Token Management:** Secure storage of authentication tokens using httpOnly cookies
- **Content Security Policy:** Implementation of CSP headers to prevent code injection

## 4. Backend Architecture

### 4.1. Technology Stack

The backend API is built using Node.js with Express.js framework, providing a robust and scalable server-side solution:

- **Node.js 18+:** Runtime environment for server-side JavaScript
- **Express.js:** Web application framework for building RESTful APIs
- **TypeScript:** Type safety for backend development
- **Prisma:** Modern database toolkit and ORM for PostgreSQL
- **JWT:** JSON Web Tokens for authentication and authorization
- **bcrypt:** Password hashing and security
- **Socket.io:** Real-time bidirectional communication
- **Multer:** File upload handling for documents and media
- **Helmet:** Security middleware for Express applications
- **Rate Limiting:** API rate limiting to prevent abuse

### 4.2. API Architecture

The backend follows RESTful API design principles with clear resource-based endpoints:

```
/api/v1/
├── auth/                 # Authentication endpoints
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh
│   └── GET /profile
├── finance/              # Financial management endpoints
│   ├── /transactions     # CRUD operations for transactions
│   ├── /budgets          # Budget management
│   ├── /accounts         # Account aggregation
│   ├── /assets           # Asset tracking
│   └── /reports          # Financial reporting
├── business/             # Business collaboration endpoints
│   ├── /tasks            # Task management
│   ├── /documents        # Document sharing
│   └── /communications   # Business messaging
├── relationship/         # Relationship features endpoints
│   ├── /memories         # Photo/video memories
│   ├── /journal          # Shared journal entries
│   ├── /notes            # Shared notes
│   ├── /reminders        # Reminders and calendar
│   └── /messages         # Personal messaging
└── settings/             # User and application settings
```

### 4.3. Middleware Architecture

The Express application uses a layered middleware approach:

1. **Security Middleware:** Helmet for security headers, CORS configuration
2. **Authentication Middleware:** JWT token validation and user context
3. **Logging Middleware:** Request/response logging for monitoring
4. **Validation Middleware:** Request payload validation using Joi or Zod
5. **Error Handling Middleware:** Centralized error handling and response formatting
6. **Rate Limiting Middleware:** API rate limiting per user/IP

### 4.4. Business Logic Layer

Business logic is organized into service modules that handle specific domain operations:

- **AuthService:** User authentication, session management, and security
- **FinanceService:** Financial calculations, budget tracking, and reporting
- **BusinessService:** Task management, document handling, and collaboration
- **RelationshipService:** Memory management, communication, and personal features
- **NotificationService:** Real-time notifications and alerts

### 4.5. Data Access Layer

The data access layer uses Prisma ORM for database operations, providing:

- **Type-safe database queries:** Generated TypeScript types from database schema
- **Migration management:** Version-controlled database schema changes
- **Connection pooling:** Efficient database connection management
- **Query optimization:** Automatic query optimization and caching

## 5. Database Design

### 5.1. Database Technology

PostgreSQL is chosen as the primary database for its reliability, ACID compliance, and advanced features:

- **JSONB Support:** Flexible storage for dynamic data structures
- **Full-text Search:** Built-in search capabilities for notes and documents
- **Triggers and Functions:** Database-level business logic for data integrity
- **Backup and Recovery:** Robust backup and point-in-time recovery options

### 5.2. Database Schema Design

The database schema is organized around the main functional domains:

#### 5.2.1. User Management

```sql
-- Users table for authentication and profile
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Couples table to link the two users
CREATE TABLE couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    relationship_start_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);
```

#### 5.2.2. Financial Management

```sql
-- Financial accounts (bank accounts, credit cards, etc.)
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- checking, savings, credit, investment
    institution_name VARCHAR(255),
    account_number_masked VARCHAR(20),
    current_balance DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    account_id UUID REFERENCES financial_accounts(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    transaction_date DATE NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- income, expense, transfer
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget categories and limits
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    category VARCHAR(100) NOT NULL,
    monthly_limit DECIMAL(15,2) NOT NULL,
    current_spent DECIMAL(15,2) DEFAULT 0,
    budget_period VARCHAR(20) DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets tracking
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    asset_name VARCHAR(255) NOT NULL,
    asset_type VARCHAR(100) NOT NULL, -- real_estate, vehicle, equipment, etc.
    estimated_value DECIMAL(15,2),
    purchase_date DATE,
    purchase_price DECIMAL(15,2),
    description TEXT,
    documents JSONB, -- Store document references
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.3. Business Collaboration

```sql
-- Business tasks and projects
CREATE TABLE business_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business documents storage
CREATE TABLE business_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 5.2.4. Relationship Features

```sql
-- Shared memories (photos, videos, journal entries)
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    title VARCHAR(255),
    description TEXT,
    memory_date DATE,
    memory_type VARCHAR(50), -- photo, video, journal, milestone
    media_urls TEXT[],
    location VARCHAR(255),
    tags TEXT[],
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shared notes and reminders
CREATE TABLE shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general', -- general, reminder, list
    reminder_date TIMESTAMP,
    is_completed BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personal messaging between couple
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID REFERENCES couples(id),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text', -- text, image, location
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Location sharing (optional feature)
CREATE TABLE location_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    couple_id UUID REFERENCES couples(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    accuracy DECIMAL(8,2),
    shared_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3. Database Indexing Strategy

Proper indexing is crucial for application performance:

```sql
-- Performance indexes
CREATE INDEX idx_transactions_couple_date ON transactions(couple_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category, subcategory);
CREATE INDEX idx_messages_couple_created ON messages(couple_id, created_at DESC);
CREATE INDEX idx_tasks_assigned_status ON business_tasks(assigned_to, status);
CREATE INDEX idx_memories_couple_date ON memories(couple_id, memory_date DESC);

-- Full-text search indexes
CREATE INDEX idx_memories_search ON memories USING gin(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_notes_search ON shared_notes USING gin(to_tsvector('english', title || ' ' || content));
```

## 6. Security Architecture

### 6.1. Authentication and Authorization

The application implements a comprehensive security model:

#### 6.1.1. Authentication Flow

1. **User Registration:** Email verification with secure password requirements
2. **Login Process:** JWT token generation with refresh token mechanism
3. **Session Management:** Secure token storage and automatic refresh
4. **Two-Factor Authentication:** Optional 2FA using TOTP (Time-based One-Time Password)

#### 6.1.2. Authorization Model

- **Couple-based Access Control:** Users can only access data belonging to their couple
- **Role-based Permissions:** Different permission levels for various features
- **Resource-level Security:** Fine-grained access control for sensitive data

### 6.2. Data Protection

#### 6.2.1. Encryption

- **Data at Rest:** Database encryption using PostgreSQL's built-in encryption
- **Data in Transit:** TLS 1.3 encryption for all client-server communication
- **Sensitive Data:** Additional encryption for financial and personal data using AES-256

#### 6.2.2. Privacy Controls

- **Data Minimization:** Collect only necessary data for application functionality
- **User Consent:** Explicit consent for optional features like location sharing
- **Data Retention:** Configurable data retention policies with automatic cleanup
- **Export/Delete:** User rights to export or delete their data

### 6.3. Security Monitoring

- **Audit Logging:** Comprehensive logging of all user actions and system events
- **Intrusion Detection:** Monitoring for suspicious activities and potential threats
- **Rate Limiting:** Protection against brute force attacks and API abuse
- **Security Headers:** Implementation of security headers (CSP, HSTS, etc.)

## 7. Real-time Communication Architecture

### 7.1. WebSocket Implementation

Real-time features are implemented using Socket.io for bidirectional communication:

#### 7.1.1. Connection Management

- **Authenticated Connections:** WebSocket connections require valid JWT tokens
- **Couple Rooms:** Users are automatically joined to their couple-specific room
- **Connection Persistence:** Automatic reconnection handling for network interruptions

#### 7.1.2. Real-time Features

- **Instant Messaging:** Real-time personal communication between partners
- **Live Location Sharing:** Optional real-time location updates
- **Notification Delivery:** Instant delivery of system notifications and alerts
- **Collaborative Editing:** Real-time updates for shared notes and documents

### 7.2. Event-Driven Architecture

The application uses an event-driven approach for real-time updates:

```javascript
// Example event types
const EVENTS = {
  MESSAGE_SENT: 'message:sent',
  MESSAGE_READ: 'message:read',
  LOCATION_UPDATE: 'location:update',
  BUDGET_ALERT: 'budget:alert',
  TASK_ASSIGNED: 'task:assigned',
  MEMORY_ADDED: 'memory:added'
};
```

## 8. File Storage and Media Management

### 8.1. File Storage Strategy

The application handles various types of files including documents, photos, and videos:

#### 8.1.1. Storage Architecture

- **Local Storage:** Development and testing using local file system
- **Cloud Storage:** Production deployment using AWS S3 or similar cloud storage
- **CDN Integration:** Content delivery network for optimized media serving
- **File Organization:** Structured folder hierarchy based on couple ID and content type

#### 8.1.2. File Processing

- **Image Processing:** Automatic resizing and optimization for different display sizes
- **Video Processing:** Compression and format conversion for web compatibility
- **Document Handling:** PDF generation for financial reports and document storage
- **Backup Strategy:** Automated backup of all user-generated content

### 8.2. Media Security

- **Access Control:** Signed URLs for secure file access
- **Virus Scanning:** Automatic malware detection for uploaded files
- **File Validation:** Strict file type and size validation
- **Encryption:** Encryption of sensitive documents and personal media

## 9. Performance Optimization

### 9.1. Frontend Performance

#### 9.1.1. Code Splitting and Lazy Loading

- **Route-based Splitting:** Lazy loading of different application sections
- **Component-level Splitting:** Dynamic imports for heavy components
- **Bundle Optimization:** Tree shaking and dead code elimination

#### 9.1.2. Caching Strategy

- **Browser Caching:** Aggressive caching of static assets
- **Service Worker:** Offline functionality and background sync
- **State Persistence:** Redux state persistence for improved user experience

### 9.2. Backend Performance

#### 9.2.1. Database Optimization

- **Query Optimization:** Efficient database queries with proper indexing
- **Connection Pooling:** Optimized database connection management
- **Caching Layer:** Redis caching for frequently accessed data

#### 9.2.2. API Performance

- **Response Compression:** Gzip compression for API responses
- **Pagination:** Efficient pagination for large data sets
- **Background Jobs:** Asynchronous processing for heavy operations

## 10. Monitoring and Logging

### 10.1. Application Monitoring

- **Performance Metrics:** Response times, error rates, and throughput monitoring
- **User Analytics:** Usage patterns and feature adoption tracking
- **System Health:** Server resource utilization and availability monitoring

### 10.2. Error Handling and Logging

- **Centralized Logging:** Structured logging with correlation IDs
- **Error Tracking:** Automatic error reporting and alerting
- **Debug Information:** Comprehensive logging for troubleshooting

## 11. Deployment Architecture

### 11.1. Development Environment

- **Local Development:** Docker-based development environment for consistency
- **Database Seeding:** Sample data for development and testing
- **Hot Reloading:** Fast development feedback loop

### 11.2. Production Deployment

- **Container Orchestration:** Docker containers for consistent deployment
- **Load Balancing:** Horizontal scaling with load balancer
- **Database Management:** Managed PostgreSQL service with automated backups
- **SSL/TLS:** Automatic SSL certificate management

### 11.3. CI/CD Pipeline

- **Automated Testing:** Unit tests, integration tests, and end-to-end tests
- **Code Quality:** Automated code review and quality checks
- **Deployment Automation:** Automated deployment to staging and production environments

## 12. Scalability Considerations

### 12.1. Horizontal Scaling

- **Stateless Design:** Application servers designed for horizontal scaling
- **Database Scaling:** Read replicas and potential sharding strategies
- **Caching Strategy:** Distributed caching for improved performance

### 12.2. Future Growth

- **Microservices Migration:** Potential migration to microservices architecture
- **API Versioning:** Backward-compatible API evolution
- **Feature Flags:** Gradual feature rollout and A/B testing capabilities

This comprehensive system architecture provides a solid foundation for building a secure, scalable, and maintainable couple's collaboration web application. The architecture emphasizes modern best practices while ensuring the specific needs of the target users are met effectively.

