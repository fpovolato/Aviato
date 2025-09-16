# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Aviato is a three-tier flight booking platform with:

- **Backend**: Express.js REST API with MongoDB, JWT authentication via HTTP-only cookies
- **Dashboard**: Angular 19 admin interface for airline management (managers, employees)
- **Site**: Angular 19 customer-facing booking interface

### Key Architectural Patterns

- **Role-based access control**: admin → manager → employee → customer hierarchy with airline-scoped permissions
- **JWT Authentication**: HTTP-only cookies with access/refresh token pattern
- **Mongoose ODM**: Complex relationships between Airlines, Users, Planes, Flights, Routes, Airports
- **Seat Management**: Real-time seat reservations with expiration locks (15-minute holds)
- **Multi-tenant**: Airline isolation for managers/employees using airline scope

## Development Commands

### Full Stack Setup
```bash
# Docker setup (recommended for first time)
./setup.sh

# Manual Docker
docker compose up --build
```

### Backend (Express.js/MongoDB)
```bash
cd backend
npm install
npm run dev    # Development with nodemon
npm start      # Production
npm test       # Run tests

# Database seeding
node seed.js   # Populate with mock data
```

### Dashboard (Angular 19 - Admin Interface)
```bash
cd dashboard
npm install
npm start      # ng serve on http://localhost:4200
npm run build  # ng build dashboard --configuration production
npm test       # ng test (Karma/Jasmine)
```

### Site (Angular 19 - Customer Interface)
```bash
cd site
npm install
npm start      # ng serve on http://localhost:4200
npm run build  # ng build
npm test       # ng test (Karma/Jasmine)
```

## Service URLs (Docker)
- Backend API: https://localhost:3443
- Dashboard: https://localhost:4443
- Customer Site: https://localhost:4543
- MongoDB: localhost:27017
- Swagger Docs: https://localhost:3443/api-docs

## Authentication & Permissions

### Default Users (after seeding)
- Admin: `admin@aviato.com` / `password`
- Manager: `manager1@av.com` / `password` (5 total, one per airline)
- Employee: `employee1@av.com` / `password` (10 total, 2 per airline)
- Customer: `customer1@gmail.com` / `password` (10 total)

### Role Hierarchy & Scope
- **Admin**: Global access to all resources
- **Manager**: Airline-scoped access (own airline's employees, planes, flights, routes)
- **Employee**: Read-only airline-scoped access (view flights, planes, analytics)
- **Customer**: Own profile, cart, orders, flight search, seat selection

## Key Business Logic

### Seat Selection System
- Temporary 15-minute seat reservations via `SeatReservation` model
- Seat maps auto-generated from plane configurations (economy/first class layout)
- Real-time availability tracking with flight capacity management

### Flight Management
- Automatic duration calculation between airports using coordinates
- Plane-to-flight assignment with seat availability updates
- Flight overlap validation for same plane/route conflicts

### Multi-tenant Airline Operations
- Manager can only create/manage employees within their airline
- Employees can only view resources within their airline
- All flight/plane/route operations are airline-scoped

## Database Models Structure

### Core Relationships
```
User ←→ Airline (managers/employees belong to airline)
Flight → Plane → Airline
Flight → Route → Airport (origin/destination)
Order → Cart → User
SeatReservation → Flight + User (with expiration)
```

### Important Model Methods
- `Plane.generateSeats()`: Auto-creates seat map from configuration
- `Flight.calculateDuration()`: Uses airport coordinates for flight time
- `User.virtual('employees')`: Dynamically loads airline employees

## Analytics Data Requirements

The dashboard analytics depend on **completed orders** and **historical flight data**. Current seeding issues:

### Missing Analytics Data
⚠️ **Current `seed.js` limitation**: Only creates future flights and no orders, resulting in empty analytics dashboard.

**Required for populated analytics**:
1. **Past flights** with `departureDate` in the past (3-12 months back)
2. **Completed orders** with status "Completed" and realistic `purchasedAt` dates
3. **Order items** with proper `passengers` count and `priceAtPurchase`
4. **Seat selections** in orders for realistic booking data

### Analytics Queries Structure
Analytics controller aggregates:
- **Total passengers**: Sum of `order.items.passengers` for completed orders
- **Total revenue**: Sum of `order.items.quantity * priceAtPurchase`
- **Monthly trends**: Group by `purchasedAt` year/month
- **Popular routes**: Count bookings per route from completed orders
- **Airline-scoped data**: Filter by `flight.airline` for manager/employee views

### Seeding Enhancement Needed
To populate analytics, `seed.js` should include:
```javascript
// Create historical flights (past 6 months)
const seedHistoricalFlights = async (routes, planes, airlines) => {
  // Generate flights with departureDate in the past
};

// Create completed orders for historical flights
const seedHistoricalOrders = async (customers, historicalFlights) => {
  // Create orders with status "Completed"
  // Include realistic passengers count (1-4 per booking)
  // Set purchasedAt to match flight timeline
  // Add seat selections and pricing
};
```

## SSL/HTTPS Configuration

All services use HTTPS with self-signed certificates in `./certs/`:
- `localhost.pem` and `localhost-key.pem` auto-generated by setup script
- CORS configured for HTTPS origins with credentials support
- Backend requires SSL certificates to start

## Testing

Each component has test setup:
- Backend: No specific test framework configured (manual API testing)
- Frontend: Karma + Jasmine for both dashboard and site
- Postman collections available in `backend/Postman/`

## Common Development Tasks

### Adding New User Roles
1. Update `User` model role enum
2. Add middleware in `backend/middleware/auth.js`
3. Apply permission checks in controllers
4. Update frontend auth guards and services

### Creating New Airline Resources
1. Ensure proper airline scope in controllers
2. Add authorization middleware (`employeeOrAdmin`, `adminOrManager`)
3. Test with different user roles and airline assignments

### Modifying Seat Configuration
1. Update `Plane` model seat generation logic
2. Test with `utils/planeSeeder.js`
3. Verify seat availability updates in flights