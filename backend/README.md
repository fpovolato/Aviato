# Aviato — Backend API

REST platform for end-to-end flight booking management: authentication, master data (users, airlines, airports, planes, routes, flights), cart/orders, seat selection and analytics. The application exposes a self-hosted HTTPS server based on Express and MongoDB/Mongoose, with HTTP-only cookie authentication.


## Technology Stack
- Runtime: Node.js 20
- Web framework: Express 5
- DB: MongoDB 6+, ODM: Mongoose 8
- Auth: JWT on HTTP-only cookies (accessToken/refreshToken)
- Security: Integrated HTTPS, CORS, cookie-parser
- Upload: Multer (CSV for airport imports)
- Tooling: dotenv, nodemon (development), Docker/Docker Compose


## Architecture and Project Structure
Main backend folder structure:

```
backend/
  app.js                  # Express config, CORS/cookie/json, mount router
  index.js                # HTTPS startup with local certificates
  Dockerfile
  package.json
  config/
    db.js                 # Mongoose connection
  middleware/
    auth.js               # protect, adminOnly, adminOrManager, employeeOrAdmin
  models/                 # Mongoose schemas: User, Airline, Plane, Flight, ...
  controllers/            # Domain logic for each resource
  routes/                 # Express routers for each /api/* area
  utils/                  # Tokens, seeders and utility scripts
  Postman/                # Postman collections/environments
  Dump/                   # Sample data (CSV/JSON)
```

- `app.js`: initializes Express, CORS with `credentials: true`, JSON parsing, cookie parser and registers routers:
  - `/api/users`, `/api/airlines`, `/api/planes`, `/api/airports`, `/api/flights`, `/api/cart`, `/api/orders`, `/api/routes`, `/api/seats`, `/api/analytics`
- `index.js`: starts an HTTPS server on `SSL_PORT` (default 3443) loading certificates from `./certs/localhost-key.pem` and `./certs/localhost.pem`.
- `middleware/auth.js`: authentication/ACL middleware on roles `customer | employee | manager | admin`.
- `models/*`: Mongoose schemas for:
  - `User`: account with multiple roles, password hash, relation with `Airline`.
  - `Airline`: company with virtual `employees`.
  - `Airport`: OpenFlights dataset (IATA/ICAO fields, geo, timezone, etc.).
  - `Route`: route from airport A to B with unique `code`.
  - `Plane`: cabin configuration and automatic seat map generation; methods for stats/seat search.
  - `Flight`: flight with status, prices (economy/first), plane/route/airline, seat availability.
  - `Cart`, `Order`: cart and order with items and totals.
  - `SeatReservation`: seat reservations with expiration (temporary lock), indices for seat uniqueness.
- `controllers/*`: application logic and business rules (e.g. airline scope for employee/manager, flight overlap checks, flight duration calculation, analytics aggregations).
- `routes/*`: REST endpoint definitions; OpenAPI annotations in JSDoc.
- `utils/*`:
  - `tokenUtils.js` and `generateToken.js`: JWT generation/verification.
  - `planeSeeder.js`, `flightSeeder.js`: plane/flight seeding.
  - `updateFlights.js`: associate planes to flights and update `seatsAvailable`.


## Security and Authentication
- Login: user credentials → set of HTTP-only cookies:
  - `accessToken`: 1h expiration
  - `refreshToken`: 7d expiration
- Access: `protect` reads `accessToken` from cookie and validates with `JWT_SECRET`.
- Refresh: `/api/users/refresh` endpoint issues new tokens. Technical note: refresh verification uses `JWT_REFRESH_SECRET` while `refreshToken` signing uses `JWT_SECRET`. Until keys are unified, set both secrets to the same value.
- Roles and permissions:
  - `adminOnly`, `adminOrManager`, `employeeOrAdmin`
  - Airline scope: many endpoints allow `employee/manager` to operate only on their own `airline`.
- CORS: enabled with `credentials: true` and allowed origins (Angular dev HTTPS/HTTP):
  - `http://localhost:4200`, `https://localhost:4443`, `https://localhost:4543`, `http://localhost:3000`, `https://localhost:3443`
- HTTPS: mandatory. Certificates must exist in `./certs` (see "Local startup").


## Environment Variables
Create a `.env` file in `backend/` with:

```
MONGO_URI=mongodb://localhost:27017/backenddb
JWT_SECRET=super-secret
JWT_REFRESH_SECRET=super-secret   # see refresh note
SSL_PORT=3443
```

In `docker-compose.yml`, in backend container environment set `MONGO_URI` and `PORT=3443` (the actual port used is `SSL_PORT`).


## Local Startup (without Docker)
Prerequisites: Node 20, MongoDB 6+, OpenSSL.

1) Install dependencies
```bash
cd backend
npm install
```

2) Generate local self-signed certificates in `backend/certs/`
```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/localhost-key.pem -out certs/localhost.pem \
  -days 365 -subj "/CN=localhost"
```

3) Development startup
```bash
npm run dev   # nodemon index.js → HTTPS on https://localhost:3443
```

4) Local production startup
```bash
npm start     # node index.js
```


## Docker Compose Startup
The repository provides `docker-compose.yml` for backend, MongoDB and frontend (site/dashboard).

```bash
docker compose up --build
```

Notes:
- Maps ports `3443:3443` (HTTPS backend), `27017:27017` (Mongo), frontend on `4443`/`4543`.
- Mounts `./certs` in backend container as read-only (`/app/certs`). Ensure certificates exist before build.


## Data Seeding
- Planes: `node utils/planeSeeder.js` (requires at least one `Airline`).
- Flights: `node utils/flightSeeder.js` (requires `Airports`, `Airline` and at least one `Plane`).
- Plane→flight association: `node utils/updateFlights.js`.
- Airport import: CSV endpoint `POST /api/airports/import-csv` (form field `file`, OpenFlights format) or `POST /api/airports/bulk` with JSON.

Suggestion: import airports first (from `Dump/`), then create an `Airline`, then run `planeSeeder` and `flightSeeder`.


## Main Endpoints (overview)
Base URL: `https://localhost:3443/api`

- Users (`/users`)
  - POST `/register` (public) — customer registration
  - POST `/login` (public) — set session cookies
  - POST `/refresh` (public) — renew tokens
  - POST `/logout` (protected)
  - GET `/profile` (protected)
  - GET `/` (protected) — user list (admin or manager limited to own airline)
  - DELETE `/:id` (protected, admin/manager with constraints)
  - PATCH `/:id/role` (protected, admin/manager with constraints)
  - PATCH `/:id/airline-role` (protected, admin)
  - POST `/managers` (protected, admin) — create manager + airline
  - POST `/employees` (protected, admin/manager) — create employee

- Airlines (`/airlines`)
  - POST `/` (admin) — create airline (optional connect existing manager)
  - GET `/` — company list
  - GET `/:id` — detail
  - POST `/invite` (protected) — invite user as employee on airline
  - GET `/employees/all` (admin)
  - GET `/employees/:airlineId` (protected) — employees per airline

- Airports (`/airports`)
  - POST `/`, POST `/bulk` (admin)
  - POST `/import-csv` (admin) — CSV upload
  - GET `/` — list; GET `/search?q=` — search/autocomplete
  - GET `/iata/:iata`, `/icao/:icao`, `/country/:country`, `/city/:city`
  - GET `/:id`, PUT `/:id` (admin), DELETE `/:id` (admin)

- Routes (`/routes`)
  - POST `/` (employee/admin with airline scope), GET `/`, GET `/:id`, DELETE `/:id` (admin)

- Planes (`/planes`)
  - POST `/` (employee/admin with scope) — create plane and generate seat map
  - GET `/` — list; GET `/:id` — detail; GET `/airline/:airlineId`
  - GET `/:id/seats` — seat map and statistics
  - PATCH `/:id` — update configuration and regenerate map

- Flights (`/flights`)
  - POST `/` (employee/admin with scope) — create flight, overlap checks
  - GET `/` — list (with calculated duration)
  - GET `/search` — search direct/one-stop, date filters and sort
  - GET `/:id` — detail; GET `/airline/:airlineId` (protected)
  - PUT `/:id` (admin), DELETE `/:id` (admin), PATCH `/:id/status` (admin)

- Cart (`/cart`) [protected]
  - GET `/` — retrieve/create user cart
  - POST `/items` — add flight
  - PUT `/items/:itemId` — update quantity
  - DELETE `/items/:itemId` — remove item
  - DELETE `/` — empty cart

- Orders (`/orders`) [protected]
  - POST `/` — create order from body or backend cart
  - GET `/my` — user orders
  - GET `/:id` — order detail
  - GET `/` (admin) — all orders; PUT `/:id/status` (admin)

- Seats (`/seats`) [seat selection]
  - GET `/flights/:flightId/seats` — seat map and prices for flight
  - POST `/flights/:flightId/seats/reserve` (protected) — reserve seat (15′ lock)
  - PUT `/reservations/:reservationId/confirm` (protected) — confirm
  - DELETE `/reservations/:reservationId` (protected) — cancel
  - PUT `/reservations/:reservationId/extend` (protected) — extend hold
  - GET `/user/reservations` (protected) — user reservations
  - DELETE `/admin/clean-expired` (admin) — cleanup expired reservations

- Analytics (`/analytics`) [protected]
  - GET `/dashboard` — metrics for employee (Passenger/Revenue/Routes/Trend)
  - GET `/airline/:airlineId` — airline-specific metrics

For payload/response details, consult OpenAPI annotations in `routes/*` and `controllers/*` files or Postman collections.


## Quick Examples
Login (sets cookies):
```bash
curl -k -X POST https://localhost:3443/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password"}' -i
```
Flight search (direct and one-stop):
```bash
curl -k "https://localhost:3443/api/flights/search?from=<airportIdA>&to=<airportIdB>&departureDate=2025-08-01T00:00:00.000Z&sortBy=price&sortOrder=asc"
```


## Postman and Documentation
- `backend/Postman/` folder with collections and environments.
- Routes include `@openapi` blocks useful as a base for generating a schema.


## Notes and Limitations
- The server only exposes HTTPS; the `3000:3000` mapping in `docker-compose` is residual and not used.
- For refresh token, until keys are unified, set `JWT_REFRESH_SECRET == JWT_SECRET`.
- Consult `README_SEAT_SELECTION.md` for seat selection details.


## License
Not specified in the repository.