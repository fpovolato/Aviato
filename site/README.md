# Aviato — Site (Front‑office)

SPA customer‑facing per ricerca voli, autenticazione cliente, carrello, selezione posti e checkout ordini. Servita in produzione da Nginx con proxy HTTPS verso il backend.


## Stack tecnologico
- Framework UI: Angular 19 (standalone components)
- Styling: Tailwind CSS v4
- Stato/HTTP: Signals + HttpClient (withCredentials)
- Servizio web: Nginx (reverse proxy → backend)
- Build chain: Node.js (builder) + Docker multistage


## Architettura e struttura
```
site/
  src/app/
    app.routes.ts        # Home, login/signup, cart, seat‑selection, order‑confirmation
    app.config.ts        # Router/HttpClient providers (XSRF config)
    components/
      header/            # Header e UI riutilizzabili
      seat-selector/     # Widget selezione posti (UI)
      primary-button/    # Componenti UI
    pages/
      home/              # Lista/raccolta voli
      cart/              # Carrello (riepilogo, item)
      seat-selection/    # Selezione posti per volo
      order-confirmation/# Conferma ordine
      user-page.component.ts, login.component.ts, signup.component.ts
    services/
      auth.service.ts            # Stato utente, login/signup/logout
      cart.service.ts            # Stato carrello + sync backend
      order.service.ts           # Creazione/recupero ordini
      seat.service.ts            # Mappa posti per volo
      seat-reservation.service.ts# (non usata direttamente; API ausiliarie)
    models/              # Tipi client (Flight, User, ...)
  environments/environment.ts  # Base API (dev)
  Dockerfile
  nginx.conf                 # HTTPS + proxy /api → backend
```

- Autenticazione: cookie HTTP‑only emessi dal backend. Le richieste includono `withCredentials: true` quando necessario.
- Carrello: stato locale sincronizzato con backend (`/api/cart`). Il totale include classe biglietto, bagagli aggiuntivi e selezione posto.
- Selezione posti: UI basata sui dati di `GET /api/seats/flights/:flightId/seats`; la scelta viene salvata nel carrello e può essere riflessa nell’ordine.


## Routing (principale)
- `/` Home (lista/ricerca voli)
- `/login`, `/signup`
- `/user` Profilo cliente
- `/cart` Carrello
- `/seat-selection/:flightId` Selezione posti per volo
- `/order-confirmation/:orderId` Conferma ordine


## Configurazione
- Ambiente dev (`src/environments/environment.ts`):
  - `apiUrl: 'https://localhost:3443/api'`
- Nginx (produzione in container):
  - HTTPS con certificati in `/etc/nginx/certs/localhost.pem` e `localhost-key.pem`
  - Proxy `/api/*` → `https://backend:3443`


## Avvio locale (sviluppo)
Prerequisiti: Node 20+, Angular CLI, backend attivo su `https://localhost:3443`.

1) Installazione
```bash
cd site
npm install
```
2) Avvio UI
```bash
npm start   # ng serve su http://localhost:4300 (in compose è 4300:80)
```
Note:
- Per far funzionare le chiamate API in `ng serve`, configurare un proxy dev Angular per `/api` o assicurarsi che i service utilizzino `environment.apiUrl`. In Docker il proxy è già configurato via Nginx.


## Esecuzione con Docker
Eseguire dal root repo con compose (consigliato):
```bash
docker compose up --build
```
- Porta HTTPS site: `4543` (vedi compose). I certificati vanno montati in `/etc/nginx/certs`.


## Sicurezza e best practice
- Cookie HTTP‑only + `withCredentials` per le operazioni autenticate.
- XSRF: configurazione header/cookie predisposta in `app.config.ts`.
- Certificati self‑signed accettati solo in dev tramite Nginx.


## Script npm
- `npm start`: dev server
- `npm run build`: build produzione (`dist/site/browser`)


## Flussi principali
- Autenticazione cliente: registrazione/login; il servizio utente verifica lo stato su `/api/users/profile` all’avvio.
- Ricerca/prenotazione: aggiunta voli al carrello (sincronizzata col backend), selezione di classe/bagagli/posti.
- Checkout: creazione ordine tramite `OrderService` (inclusi eventuali `seatReservations`).
