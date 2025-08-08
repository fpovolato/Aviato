# Aviato — Backend API

Piattaforma REST per la gestione end‑to‑end di prenotazioni voli: autenticazione, anagrafiche (utenti, compagnie, aeroporti, aerei, rotte, voli), carrello/ordini, selezione posti e analytics. L’applicazione espone un server HTTPS (auto‑hosted) basato su Express e MongoDB/Mongoose, con autenticazione a cookie HTTP‑only.


## Stack tecnologico
- Runtime: Node.js 20
- Web framework: Express 5
- DB: MongoDB 6+, ODM: Mongoose 8
- Auth: JWT su cookie HTTP‑only (accessToken/refreshToken)
- Sicurezza: HTTPS integrato, CORS, cookie‑parser
- Upload: Multer (CSV per import aeroporti)
- Tooling: dotenv, nodemon (sviluppo), Docker/Docker Compose


## Architettura e struttura progetto
Struttura cartelle principale del backend:

```
backend/
  app.js                  # Config Express, CORS/cookie/json, mount router
  index.js                # Avvio HTTPS con certificati locali
  Dockerfile
  package.json
  config/
    db.js                 # Connessione Mongoose
  middleware/
    auth.js               # protect, adminOnly, adminOrManager, employeeOrAdmin
  models/                 # Schemi Mongoose: User, Airline, Plane, Flight, ...
  controllers/            # Logica di dominio per ciascuna risorsa
  routes/                 # Router Express per ciascuna area /api/*
  utils/                  # Token, seeders e script di utilità
  Postman/                # Collezioni/ambienti Postman
  Dump/                   # Dati di esempio (CSV/JSON)
```

- `app.js`: inizializza Express, CORS con `credentials: true`, parsing JSON, cookie parser e registra i router:
  - `/api/users`, `/api/airlines`, `/api/planes`, `/api/airports`, `/api/flights`, `/api/cart`, `/api/orders`, `/api/routes`, `/api/seats`, `/api/analytics`
- `index.js`: avvia un server HTTPS su `SSL_PORT` (default 3443) caricando i certificati da `./certs/localhost-key.pem` e `./certs/localhost.pem`.
- `middleware/auth.js`: middleware di autenticazione/ACL su ruoli `customer | employee | manager | admin`.
- `models/*`: schemi Mongoose per:
  - `User`: account con ruoli multipli, hash password, relazione con `Airline`.
  - `Airline`: compagnia con virtual `employees`.
  - `Airport`: dataset OpenFlights (campi IATA/ICAO, geo, timezone, ecc.).
  - `Route`: tratta da aeroporto A a B con `code` univoco.
  - `Plane`: configurazione cabina e generazione automatica mappa posti; metodi per statistiche/ricerca posti.
  - `Flight`: volo con stato, prezzi (economy/first), aereo/rotta/compagnia, disponibilità posti.
  - `Cart`, `Order`: carrello e ordine con item e totali.
  - `SeatReservation`: prenotazioni posto con scadenza (lock temporaneo), indici per univocità posto.
- `controllers/*`: logica applicativa e regole business (es. scope airline per employee/manager, controlli sovrapposizione voli, calcolo durata voli, aggregazioni analytics).
- `routes/*`: definizione endpoint REST; annotazioni OpenAPI nei JSDoc.
- `utils/*`:
  - `tokenUtils.js` e `generateToken.js`: generazione/verifica JWT.
  - `planeSeeder.js`, `flightSeeder.js`: seeding aerei/voli.
  - `updateFlights.js`: associa aerei ai voli e aggiorna `seatsAvailable`.


## Sicurezza e autenticazione
- Login: credenziali utente → set di cookie HTTP‑only:
  - `accessToken`: scadenza 1h
  - `refreshToken`: scadenza 7d
- Accesso: `protect` legge `accessToken` dal cookie e valida con `JWT_SECRET`.
- Refresh: endpoint `/api/users/refresh` emette nuovi token. Nota tecnica: la verifica del refresh usa `JWT_REFRESH_SECRET` mentre la firma di `refreshToken` usa `JWT_SECRET`. Finché non si uniforma la chiave, impostare i due segreti allo stesso valore.
- Ruoli e permessi:
  - `adminOnly`, `adminOrManager`, `employeeOrAdmin`
  - Scope airline: molti endpoint consentono a `employee/manager` di operare solo sulla propria `airline`.
- CORS: abilitato con `credentials: true` e origin consentiti (Angular dev HTTPS/HTTP):
  - `http://localhost:4200`, `https://localhost:4443`, `https://localhost:4543`, `http://localhost:3000`, `https://localhost:3443`
- HTTPS: obbligatorio. I certificati devono esistere in `./certs` (vedi “Avvio locale”).


## Variabili d’ambiente
Creare un file `.env` in `backend/` con:

```
MONGO_URI=mongodb://localhost:27017/backenddb
JWT_SECRET=super-secret
JWT_REFRESH_SECRET=super-secret   # vedi nota su refresh
SSL_PORT=3443
```

Nel `docker-compose.yml`, in ambiente container `backend` si imposta `MONGO_URI` e `PORT=3443` (la porta effettiva usata è `SSL_PORT`).


## Avvio locale (senza Docker)
Prerequisiti: Node 20, MongoDB 6+, OpenSSL.

1) Installazione dipendenze
```bash
cd backend
npm install
```

2) Generazione certificati locali (self‑signed) in `backend/certs/`
```bash
mkdir -p certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout certs/localhost-key.pem -out certs/localhost.pem \
  -days 365 -subj "/CN=localhost"
```

3) Avvio in sviluppo
```bash
npm run dev   # nodemon index.js → HTTPS su https://localhost:3443
```

4) Avvio in produzione locale
```bash
npm start     # node index.js
```


## Avvio con Docker Compose
Il repository fornisce `docker-compose.yml` per backend, MongoDB e frontend (site/dashboard).

```bash
docker compose up --build
```

Note:
- Mappa le porte `3443:3443` (HTTPS backend), `27017:27017` (Mongo), frontend su `4443`/`4543`.
- Monta `./certs` nel container backend come read‑only (`/app/certs`). Assicurarsi che i certificati esistano prima del build.


## Popolamento dati (seed)
- Aerei: `node utils/planeSeeder.js` (richiede almeno una `Airline`).
- Voli: `node utils/flightSeeder.js` (richiede `Airports`, `Airline` e almeno un `Plane`).
- Associazione aerei→voli: `node utils/updateFlights.js`.
- Import aeroporti: endpoint CSV `POST /api/airports/import-csv` (campo form `file`, formato OpenFlights) o `POST /api/airports/bulk` con JSON.

Suggerimento: importare prima gli aeroporti (da `Dump/`), poi creare un’`Airline`, poi eseguire `planeSeeder` e `flightSeeder`.


## Endpoints principali (panoramica)
Base URL: `https://localhost:3443/api`

- Users (`/users`)
  - POST `/register` (pubblico) — registrazione customer
  - POST `/login` (pubblico) — imposta cookie di sessione
  - POST `/refresh` (pubblico) — rinnova token
  - POST `/logout` (protetto)
  - GET `/profile` (protetto)
  - GET `/` (protetto) — lista utenti (admin oppure manager limitato alla propria airline)
  - DELETE `/:id` (protetto, admin/manager con vincoli)
  - PATCH `/:id/role` (protetto, admin/manager con vincoli)
  - PATCH `/:id/airline-role` (protetto, admin)
  - POST `/managers` (protetto, admin) — crea manager + airline
  - POST `/employees` (protetto, admin/manager) — crea employee

- Airlines (`/airlines`)
  - POST `/` (admin) — crea airline (opz. collega manager esistente)
  - GET `/` — lista compagnie
  - GET `/:id` — dettaglio
  - POST `/invite` (protetto) — invita utente come employee su una airline
  - GET `/employees/all` (admin)
  - GET `/employees/:airlineId` (protetto) — dipendenti per airline

- Airports (`/airports`)
  - POST `/`, POST `/bulk` (admin)
  - POST `/import-csv` (admin) — upload CSV
  - GET `/` — lista; GET `/search?q=` — ricerca/autocomplete
  - GET `/iata/:iata`, `/icao/:icao`, `/country/:country`, `/city/:city`
  - GET `/:id`, PUT `/:id` (admin), DELETE `/:id` (admin)

- Routes (`/routes`)
  - POST `/` (employee/admin con scope airline), GET `/`, GET `/:id`, DELETE `/:id` (admin)

- Planes (`/planes`)
  - POST `/` (employee/admin con scope) — crea aereo e genera mappa posti
  - GET `/` — lista; GET `/:id` — dettaglio; GET `/airline/:airlineId`
  - GET `/:id/seats` — mappa posti e statistiche
  - PATCH `/:id` — aggiorna configurazione e rigenera mappa

- Flights (`/flights`)
  - POST `/` (employee/admin con scope) — crea volo, controlli sovrapposizioni
  - GET `/` — lista (con durata calcolata)
  - GET `/search` — ricerca diretti/uno scalo, filtri date e sort
  - GET `/:id` — dettaglio; GET `/airline/:airlineId` (protetto)
  - PUT `/:id` (admin), DELETE `/:id` (admin), PATCH `/:id/status` (admin)

- Cart (`/cart`) [protetto]
  - GET `/` — recupera/crea carrello utente
  - POST `/items` — aggiungi volo
  - PUT `/items/:itemId` — aggiorna quantità
  - DELETE `/items/:itemId` — rimuovi item
  - DELETE `/` — svuota carrello

- Orders (`/orders`) [protetto]
  - POST `/` — crea ordine dal body o dal carrello backend
  - GET `/my` — ordini utente
  - GET `/:id` — dettaglio ordine
  - GET `/` (admin) — tutti gli ordini; PUT `/:id/status` (admin)

- Seats (`/seats`) [selezione posti]
  - GET `/flights/:flightId/seats` — mappa posti e prezzi per volo
  - POST `/flights/:flightId/seats/reserve` (protetto) — prenota posto (lock 15′)
  - PUT `/reservations/:reservationId/confirm` (protetto) — conferma
  - DELETE `/reservations/:reservationId` (protetto) — annulla
  - PUT `/reservations/:reservationId/extend` (protetto) — estendi hold
  - GET `/user/reservations` (protetto) — prenotazioni utente
  - DELETE `/admin/clean-expired` (admin) — pulizia prenotazioni scadute

- Analytics (`/analytics`) [protetto]
  - GET `/dashboard` — metriche per employee (Passenger/Revenue/Rotte/Trend)
  - GET `/airline/:airlineId` — metriche specifiche airline

Per dettagli payload/risposte, consultare le annotazioni OpenAPI nei file `routes/*` e `controllers/*` o le collezioni Postman.


## Esempi rapidi
Login (imposta cookie):
```bash
curl -k -X POST https://localhost:3443/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password"}' -i
```
Ricerca voli (diretti e uno scalo):
```bash
curl -k "https://localhost:3443/api/flights/search?from=<airportIdA>&to=<airportIdB>&departureDate=2025-08-01T00:00:00.000Z&sortBy=price&sortOrder=asc"
```


## Postman e documentazione
- Cartella `backend/Postman/` con collezioni ed eventuali ambienti.
- Le route includono blocchi `@openapi` utili come base per generare uno schema.


## Note e limitazioni
- Il server espone solo HTTPS; il mapping `3000:3000` in `docker-compose` è residuale e non utilizzato.
- Per il refresh token, finché non si uniforma la chiave di firma/verifica, impostare `JWT_REFRESH_SECRET == JWT_SECRET`.
- Consultare `README_SEAT_SELECTION.md` per approfondimenti sulla selezione posti.


## Licenza
Non specificata nel repository.
