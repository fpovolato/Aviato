# Aviato — Dashboard (Back‑office)

Interfaccia amministrativa per la gestione della piattaforma Aviato: autenticazione e profilo, gestione utenti/ruoli, compagnie aeree, aerei, rotte, voli, selezione posti (visualizzazione) e analytics. L’app è una SPA Angular servita in produzione da Nginx con proxy HTTPS verso il backend.


## Stack tecnologico
- Framework UI: Angular 19 (standalone components)
- Styling: Tailwind CSS v4
- State/HTTP: RxJS, HttpClient (withCredentials)
- Servizio web: Nginx (reverse proxy → backend)
- Build chain: Node.js (builder) + Docker multistage


## Architettura e struttura
```
dashboard/
  src/app/
    app.routes.ts        # Routing di alto livello e protezione per ruoli
    app.config.ts        # Router/HttpClient providers
    auth/
      auth.service.ts    # Login/logout/registrazione, profilo, stato utente
      auth.guard.ts      # Protezione route: login, ruoli, first‑login
      login.component.ts, signup.component.ts, first-login.component.ts
    components/
      dashboard/         # Home analytics (admin vs employee/manager)
      users-page/        # CRUD utenti (scope ruoli)
      airlines-page/     # Gestione compagnie (admin)
      planes-page/       # Lista aerei + mappa/metriche posti
      flights-page/      # Lista/creazione voli
      routes-page/       # Lista/creazione rotte
      sidebar/           # Navigazione
    models/              # Tipi client (User, Plane, Flights, Route...)
    services/
      analytics.service.ts  # Chiamate /api/analytics/*
      plane.service.ts      # Aerei e posti (+ endpoint seats)
  environments/environment.ts  # Base API (dev)
  Dockerfile
  nginx.conf               # HTTPS + proxy /api → backend
```

- Autenticazione: cookie HTTP‑only impostati dal backend. Le chiamate HTTP includono `withCredentials: true` quando necessario.
- Ruoli: `admin | manager | employee`. Il guard applica i vincoli di accesso per pagina e reindirizza al `first-login` se richiesto.
- Proxy API: in Docker, Nginx inoltra `/api/*` al backend HTTPS sulla porta 3443 (servizio `backend`).


## Routing (principale)
- `/` Dashboard (protetto: admin/employee/manager)
- `/login`, `/signup`, `/first-login`
- `/user` Profilo utente (protetto)
- `/flights`, `/flights/create` (protetto)
- `/routes`, `/routes/create` (protetto)
- `/users`, `/users/create`, `/users/create-employee`, `/users/create-manager` (vincoli per ruolo)
- `/airlines` (admin)


## Configurazione
- Ambiente dev (`src/environments/environment.ts`):
  - `apiUrl: 'https://localhost:3443/api'`
- Nginx (produzione in container):
  - HTTPS con certificati in `/etc/nginx/certs/localhost.pem` e `localhost-key.pem`
  - Proxy `/api/*` → `https://backend:3443` (SSL verify off in dev)


## Avvio locale (sviluppo)
Prerequisiti: Node 20+, Angular CLI, backend attivo su `https://localhost:3443`.

1) Installazione
```bash
cd dashboard
npm install
```
2) Avvio UI
```bash
npm start   # ng serve su http://localhost:4200
```
Note:
- Per far funzionare le chiamate `/api/*` in `ng serve`, usare un proxy dev Angular o modificare temporaneamente i service per puntare a `environment.apiUrl`. In Docker questa configurazione è già gestita da Nginx.


## Esecuzione con Docker
Costruzione ed esecuzione (consigliato via `docker-compose.yml` alla radice repo):
```bash
docker compose up --build
```
- Porta HTTPS dashboard: `4443` (vedi compose). I certificati vanno montati in `/etc/nginx/certs`.


## Sicurezza e best practice
- Le richieste verso il backend usano `withCredentials` e cookie HTTP‑only.
- In environment non di produzione, i certificati self‑signed sono accettati via Nginx (`proxy_ssl_verify off`).


## Script npm
- `npm start`: dev server
- `npm run build`: build produzione (`dist/dashboard/browser`)


## Funzionalità chiave
- Dashboard analytics (employee/manager): passeggeri, ricavi, rotte popolari, revenue mensile, voli in programma.
- Gestione risorse: utenti, compagnie, aerei (con mappa e statistiche posti), rotte, voli.
- Flussi ruolo‑sensibili (crea manager/employee, first‑login con cambio password).
