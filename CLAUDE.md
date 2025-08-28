# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aviato is a comprehensive flight booking platform built with a 3-tier architecture:
- **Backend**: Express.js REST API with MongoDB/Mongoose, JWT authentication via HTTP-only cookies
- **Dashboard**: Angular 19 admin interface for airline management (back-office)  
- **Site**: Angular 19 customer-facing frontend for flight booking (front-office)

The platform handles airline management, flight operations, seat reservations, cart/ordering, and analytics.

## Development Commands

### Backend (Node.js/Express)
```bash
cd backend
npm install
npm run dev    # Development with nodemon
npm start      # Production mode
```

### Dashboard (Angular Admin Interface)
```bash
cd dashboard
npm install
npm start      # ng serve on http://localhost:4200
npm run build  # Production build (dashboard --configuration production)
npm test       # Run tests with ng test
```

### Site (Angular Customer Interface)  
```bash
cd site
npm install
npm start      # ng serve on http://localhost:4200 (default Angular port)
npm run build  # Production build
npm test       # Run tests with ng test
```

### Docker Development
```bash
# Full stack with HTTPS
docker compose up --build

# Services run on:
# Backend: https://localhost:3443
# Dashboard: https://localhost:4443 (HTTPS), http://localhost:4200 (HTTP)  
# Site: https://localhost:4543 (HTTPS), http://localhost:4300 (HTTP)
# MongoDB: localhost:27017
```

## Architecture & Key Patterns

### Backend Structure
- **MVC Pattern**: `models/`, `controllers/`, `routes/` separation
- **Authentication**: JWT tokens in HTTP-only cookies (`accessToken` 1h, `refreshToken` 7d)
- **Authorization**: Role-based (`admin`, `manager`, `employee`, `customer`) with airline scoping
- **Database**: MongoDB with Mongoose ODM, connection pooling in `config/db.js`
- **Middleware**: `middleware/auth.js` provides `protect`, `adminOnly`, `adminOrManager`, `employeeOrAdmin`

### API Structure
Base URL: `https://localhost:3443/api`
- `/users` - Authentication, user management, role assignment
- `/airlines` - Airline CRUD, employee management  
- `/airports` - Airport data, CSV import, search/autocomplete
- `/routes` - Flight routes between airports
- `/planes` - Aircraft with seat configuration and mapping
- `/flights` - Flight scheduling, search (direct & one-stop)
- `/cart` - Shopping cart with flight items
- `/orders` - Order processing and management
- `/seats` - Seat selection with temporary reservations (15min holds)
- `/analytics` - Dashboard metrics for employees/managers

### Frontend Architecture (Both Angular Apps)
- **Standalone Components**: Angular 19 with standalone component pattern
- **Styling**: Tailwind CSS v4
- **State Management**: RxJS Observables + Angular Signals
- **HTTP**: `withCredentials: true` for cookie-based auth
- **Routing**: Route guards for authentication and role-based access

### Data Models (Key Entities)
- `User`: Multi-role system with airline associations
- `Airline`: Company with virtual employee relationships
- `Airport`: OpenFlights format with IATA/ICAO codes
- `Route`: Airport-to-airport paths with unique codes
- `Plane`: Seat configuration with auto-generated seat maps
- `Flight`: Scheduled flights with pricing and availability
- `SeatReservation`: Temporary holds with expiration logic
- `Cart`/`Order`: Shopping and transaction records

## Security & Environment Setup

### Required Environment Variables (.env in backend/)
```
MONGO_URI=mongodb://localhost:27017/backenddb
JWT_SECRET=super-secret
JWT_REFRESH_SECRET=super-secret  # Note: Currently uses JWT_SECRET for both access and refresh tokens
SSL_PORT=3443
```

### SSL Certificates (Required)
Generate self-signed certificates for local HTTPS:
```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/localhost-key.pem -out certs/localhost.pem \
  -days 365 -subj "/CN=localhost"
```

### CORS Configuration
Backend allows origins: `http://localhost:4200`, `https://localhost:4443`, `https://localhost:4543`, `http://localhost:3000`, `https://localhost:3443` with `credentials: true`.

## Database & Seeding

### Seeding Data (Run in order)
1. Import airports: `POST /api/airports/import-csv` with CSV file from `Dump/airports.csv`
2. Create airline via API or dashboard
3. Create planes manually via API or dashboard (no seeder utility available)
4. Create flights manually via API or dashboard (no seeder utility available)

### Common Development Workflows
- **User Management**: Admin creates managers+airlines, managers create employees for their airline
- **Flight Operations**: Employee/manager scope limited to their airline's resources
- **Seat Selection**: 15-minute reservation holds with auto-expiration cleanup
- **Analytics**: Role-based dashboard metrics (passenger count, revenue, popular routes)

## Testing & API Documentation
- OpenAPI spec available at root: `openapi.json`
- No formal test suite defined (uses echo "Error: no test specified")
- Angular projects configured with Jasmine/Karma but skip tests by default

### Linting and Type Checking
- No formal linting configured across projects
- TypeScript compilation available through Angular CLI for frontend projects

## Build & Deployment Notes
- Backend serves HTTPS only (requires SSL certificates)
- Frontend apps use Nginx reverse proxy in Docker
- Docker Compose handles service orchestration and SSL cert mounting
- Frontend development uses `ng serve` with proxy configuration for API calls (`proxy.conf.json`)
- Both dashboard and site have identical proxy configurations pointing to backend HTTPS endpoint