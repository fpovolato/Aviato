# Analytics Implementation for Employee Dashboard

## Overview
This implementation adds comprehensive analytics to the employee dashboard homepage, providing statistics about passengers, revenue, and popular routes.

## Features Implemented

### 1. Backend Analytics API
- **Location**: `backend/controllers/analyticsController.js`
- **Routes**: `backend/routes/analyticsRoutes.js`
- **Endpoint**: `GET /api/analytics/dashboard`

### 2. Analytics Data Provided
- **Total Passengers**: Sum of all passengers from completed orders
- **Total Revenue**: Sum of all revenue from completed orders
- **Popular Routes**: Top 10 most booked routes with booking counts, passenger counts, and revenue
- **Monthly Revenue**: Revenue breakdown by month for the last 12 months
- **Recent Orders**: Number of orders in the last 30 days
- **Upcoming Flights**: Count of scheduled flights

### 3. Frontend Dashboard
- **Location**: `dashboard/src/app/components/dashboard/dashboard.component.ts`
- **Service**: `dashboard/src/app/services/analytics.service.ts`
- **Features**:
  - Real-time analytics display
  - Loading states
  - Responsive design with Tailwind CSS
  - Visual charts and progress bars
  - Route popularity rankings

## API Endpoints

### Dashboard Analytics
```
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalPassengers": 1234,
  "totalRevenue": 45678.90,
  "popularRoutes": [
    {
      "routeCode": "MIL-ROME",
      "departure": {
        "name": "Milan Malpensa",
        "city": "Milan",
        "iata": "MXP"
      },
      "arrival": {
        "name": "Rome Fiumicino",
        "city": "Rome",
        "iata": "FCO"
      },
      "bookings": 45,
      "passengers": 67,
      "revenue": 12345.67
    }
  ],
  "monthlyRevenue": [
    {
      "year": 2024,
      "month": 1,
      "revenue": 12345.67,
      "orders": 123
    }
  ],
  "recentOrders": 45,
  "upcomingFlights": 23
}
```

### Airline-Specific Analytics
```
GET /api/analytics/airline/:airlineId
Authorization: Bearer <token>
```

## Database Queries

The analytics use MongoDB aggregation pipelines to efficiently calculate:

1. **Total Passengers**: Sum of `items.passengers` from completed orders
2. **Total Revenue**: Sum of `total` from completed orders
3. **Popular Routes**: Aggregation with lookups to flights, routes, and airports
4. **Monthly Revenue**: Grouped by year and month
5. **Recent Orders**: Count with date filter
6. **Upcoming Flights**: Count of scheduled flights

## Frontend Components

### Analytics Cards
- **Total Passengers**: Blue card with passenger icon
- **Total Revenue**: Green card with money icon
- **Recent Orders**: Blue card with document icon
- **Upcoming Flights**: Purple card with calendar icon

### Popular Routes Section
- Displays top 5 most popular routes
- Shows departure/arrival airports with IATA codes
- Displays booking count and passenger count
- Visual route indicators

### Monthly Revenue Chart
- Bar chart showing revenue trends
- Last 6 months displayed
- Percentage-based progress bars
- Color-coded for easy reading

## Security
- All endpoints require authentication via JWT token
- Uses existing auth middleware
- CORS configured for dashboard domain

## Error Handling
- Graceful loading states
- Error messages for failed API calls
- Fallback displays for empty data
- Null safety checks in TypeScript

## Performance
- Efficient MongoDB aggregation queries
- Frontend caching of analytics data
- Responsive design for all screen sizes
- Optimized for real-time updates

## Usage

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the dashboard**:
   ```bash
   cd dashboard
   npm start
   ```

3. **Access the dashboard**:
   - Navigate to the dashboard homepage
   - Analytics will load automatically
   - Data refreshes on page load

## Testing

Run the test script to verify the analytics endpoint:
```bash
cd backend
node test-analytics.js
```

## Future Enhancements
- Real-time updates with WebSocket
- Export analytics to PDF/Excel
- Date range filters
- More detailed breakdowns
- Airline-specific analytics for airline employees
