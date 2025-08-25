# Modello della Struttura - Progetto Aviato

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           ARCHITETTURA AVIATO                                        │
│                      Piattaforma Gestione Prenotazioni Voli                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   LAYER UTENTE                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐   │
│  │      CLIENTI        │     │     DIPENDENTI      │     │    AMMINISTRATORI   │   │
│  │                     │     │                     │     │                     │   │
│  │  • Ricerca Voli     │     │  • Gestione Voli    │     │  • Gestione Utenti  │   │
│  │  • Prenotazioni     │     │  • Analytics        │     │  • Gestione Sistema │   │
│  │  • Carrello         │     │  • Gestione Flotta  │     │  • Supervisione     │   │
│  │  • Selezione Posti  │     │  • Rotte/Aeroporti  │     │  • Configurazioni   │   │
│  └─────────────────────┘     └─────────────────────┘     └─────────────────────┘   │
│           │                           │                           │                 │
└───────────┼───────────────────────────┼───────────────────────────┼─────────────────┘
            │                           │                           │
┌───────────┼───────────────────────────┼───────────────────────────┼─────────────────┐
│           │                           │                           │     LAYER UI    │
├───────────┼───────────────────────────┼───────────────────────────┼─────────────────┤
│           ▼                           ▼                           ▼                 │
│  ┌─────────────────────┐     ┌─────────────────────────────────────────────────┐   │
│  │    SITE (Angular)   │     │           DASHBOARD (Angular)                   │   │
│  │   :4543 (HTTPS)     │     │             :4443 (HTTPS)                      │   │
│  ├─────────────────────┤     ├─────────────────────────────────────────────────┤   │
│  │ • Home/Ricerca      │     │ • Analytics Dashboard                          │   │
│  │ • Login/Signup      │     │ • Gestione Voli                                │   │
│  │ • Carrello          │     │ • Gestione Utenti                              │   │
│  │ • Selezione Posti   │     │ • Gestione Rotte                               │   │
│  │ • Conferma Ordini   │     │ • Gestione Aerei                               │   │
│  │ • Profilo Utente    │     │ • Gestione Airlines                            │   │
│  └─────────────────────┘     └─────────────────────────────────────────────────┘   │
│           │                                         │                               │
└───────────┼─────────────────────────────────────────┼───────────────────────────────┘
            │                                         │
            │   ┌─────────────────────────────────────┘
            │   │
┌───────────┼───┼─────────────────────────────────────────────────────────────────────┐
│           │   │                                                         LAYER PROXY │
├───────────┼───┼─────────────────────────────────────────────────────────────────────┤
│           ▼   ▼                                                                     │
│  ┌─────────────────────┐     ┌─────────────────────────────────────────────────┐   │
│  │   NGINX (Site)      │     │           NGINX (Dashboard)                    │   │
│  │   Container         │     │             Container                          │   │
│  ├─────────────────────┤     ├─────────────────────────────────────────────────┤   │
│  │ • SSL Termination   │     │ • SSL Termination                              │   │
│  │ • Static Assets     │     │ • Static Assets                                │   │
│  │ • /api/* → Backend  │     │ • /api/* → Backend                             │   │
│  │ • HTTP → HTTPS      │     │ • HTTP → HTTPS                                 │   │
│  │ • Gzip Compression  │     │ • Gzip Compression                             │   │
│  └─────────────────────┘     └─────────────────────────────────────────────────┘   │
│           │                                         │                               │
└───────────┼─────────────────────────────────────────┼───────────────────────────────┘
            │                                         │
            └─────────────────┬───────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────────────────────┐
│                             │                                           LAYER API   │
├─────────────────────────────┼───────────────────────────────────────────────────────┤
│                             ▼                                                       │
│                    ┌─────────────────────┐                                         │
│                    │   BACKEND API       │                                         │
│                    │   Node.js + Express │                                         │
│                    │   :3443 (HTTPS)     │                                         │
│                    ├─────────────────────┤                                         │
│                    │ CONTROLLERS:        │                                         │
│  ┌─────────────────┤ • Users             ├─────────────────┐                       │
│  │                 │ • Airlines          │                 │                       │
│  │ ┌───────────────┤ • Airports          ├───────────────┐ │                       │
│  │ │               │ • Routes            │               │ │                       │
│  │ │ ┌─────────────┤ • Planes            ├─────────────┐ │ │                       │
│  │ │ │             │ • Flights           │             │ │ │                       │
│  │ │ │ ┌───────────┤ • Cart              ├───────────┐ │ │ │                       │
│  │ │ │ │           │ • Orders            │           │ │ │ │                       │
│  │ │ │ │ ┌─────────┤ • Seats             ├─────────┐ │ │ │ │                       │
│  │ │ │ │ │         │ • Analytics         │         │ │ │ │ │                       │
│  │ │ │ │ │         └─────────────────────┘         │ │ │ │ │                       │
│  │ │ │ │ │                                         │ │ │ │ │                       │
│  │ │ │ │ │         ┌─────────────────────┐         │ │ │ │ │                       │
│  │ │ │ │ │         │    MIDDLEWARE       │         │ │ │ │ │                       │
│  │ │ │ │ │         ├─────────────────────┤         │ │ │ │ │                       │
│  │ │ │ │ └─────────┤ • Auth (JWT)        ├─────────┘ │ │ │ │                       │
│  │ │ │ │           │ • CORS              │           │ │ │ │                       │
│  │ │ │ └───────────┤ • Role-based ACL    ├───────────┘ │ │ │                       │
│  │ │ │             │ • Error Handling    │             │ │ │                       │
│  │ │ └─────────────┤ • Request Logging   ├─────────────┘ │ │                       │
│  │ │               │ • Body Parser       │               │ │                       │
│  │ └───────────────┤ • Cookie Parser     ├───────────────┘ │                       │
│  │                 └─────────────────────┘                 │                       │
│  │                                                         │                       │
│  │                 ┌─────────────────────┐                 │                       │
│  │                 │      MODELS         │                 │                       │
│  │                 ├─────────────────────┤                 │                       │
│  └─────────────────┤ • User              ├─────────────────┘                       │
│                    │ • Airline           │                                         │
│                    │ • Airport           │                                         │
│                    │ • Route             │                                         │
│                    │ • Plane             │                                         │
│                    │ • Flight            │                                         │
│                    │ • Cart              │                                         │
│                    │ • Order             │                                         │
│                    │ • SeatReservation   │                                         │
│                    └─────────────────────┘                                         │
│                             │                                                       │
└─────────────────────────────┼───────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────────────────────┐
│                             │                                        LAYER DATABASE │
├─────────────────────────────┼───────────────────────────────────────────────────────┤
│                             ▼                                                       │
│                    ┌─────────────────────┐                                         │
│                    │      MongoDB        │                                         │
│                    │      :27017         │                                         │
│                    ├─────────────────────┤                                         │
│                    │    COLLECTIONS:     │                                         │
│                    │                     │                                         │
│  ┌─────────────────┤ users               ├─────────────────┐                       │
│  │                 │ ├─ roles[]          │                 │                       │
│  │ ┌───────────────┤ ├─ airlines[]       ├───────────────┐ │                       │
│  │ │               │ └─ passwordMustChange│               │ │                       │
│  │ │ ┌─────────────┤                     ├─────────────┐ │ │                       │
│  │ │ │             │ airlines            │             │ │ │                       │
│  │ │ │ ┌───────────┤ ├─ name, code       ├───────────┐ │ │ │                       │
│  │ │ │ │           │ └─ manager          │           │ │ │ │                       │
│  │ │ │ │ ┌─────────┤                     ├─────────┐ │ │ │ │                       │
│  │ │ │ │ │         │ airports            │         │ │ │ │ │                       │
│  │ │ │ │ │         │ ├─ OpenFlights      │         │ │ │ │ │                       │
│  │ │ │ │ │         │ ├─ IATA/ICAO        │         │ │ │ │ │                       │
│  │ │ │ │ │         │ └─ coordinates      │         │ │ │ │ │                       │
│  │ │ │ │ │         │                     │         │ │ │ │ │                       │
│  │ │ │ │ │         │ routes              │         │ │ │ │ │                       │
│  │ │ │ │ └─────────┤ ├─ departure        ├─────────┘ │ │ │ │                       │
│  │ │ │ │           │ └─ arrival          │           │ │ │ │                       │
│  │ │ │ └───────────┤                     ├───────────┘ │ │ │                       │
│  │ │ │             │ planes              │             │ │ │                       │
│  │ │ └─────────────┤ ├─ cabinConfig      ├─────────────┘ │ │                       │
│  │ │               │ └─ seatsConfig      │               │ │                       │
│  │ └───────────────┤                     ├───────────────┘ │                       │
│  │                 │ flights             │                 │                       │
│  └─────────────────┤ ├─ route, plane     ├─────────────────┘                       │
│                    │ ├─ prices           │                                         │
│                    │ └─ seatsAvailable   │                                         │
│                    │                     │                                         │
│                    │ carts               │                                         │
│                    │ ├─ user             │                                         │
│                    │ └─ items[]          │                                         │
│                    │                     │                                         │
│                    │ orders              │                                         │
│                    │ ├─ user, items[]    │                                         │
│                    │ └─ payment          │                                         │
│                    │                     │                                         │
│                    │ seatreservations    │                                         │
│                    │ ├─ flight, user     │                                         │
│                    │ ├─ row, number      │                                         │
│                    │ └─ expiresAt (TTL)  │                                         │
│                    └─────────────────────┘                                         │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              LAYER ORCHESTRAZIONE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│                           ┌─────────────────────┐                                  │
│                           │   DOCKER COMPOSE    │                                  │
│                           ├─────────────────────┤                                  │
│                           │ Services:           │                                  │
│  ┌────────────────────────┤ • backend          ├──────────────────────────┐         │
│  │                        │ • mongo            │                          │         │
│  │ ┌──────────────────────┤ • dashboard        ├────────────────────────┐ │         │
│  │ │                      │ • site             │                        │ │         │
│  │ │ ┌────────────────────┤                    ├──────────────────────┐ │ │         │
│  │ │ │                    │ Volumes:           │                      │ │ │         │
│  │ │ │ ┌──────────────────┤ • ./certs:/certs   ├────────────────────┐ │ │ │         │
│  │ │ │ │                  │ • mongo-data       │                    │ │ │ │         │
│  │ │ │ │                  │                    │                    │ │ │ │         │
│  │ │ │ │                  │ Networks:          │                    │ │ │ │         │
│  │ │ │ │                  │ • default (bridge) │                    │ │ │ │         │
│  │ │ │ │                  └─────────────────────┘                    │ │ │ │         │
│  │ │ │ │                                                             │ │ │ │         │
│  │ │ │ │  ┌─────────────────────┐  ┌─────────────────────┐           │ │ │ │         │
│  │ │ │ └──┤    CERTIFICATES    ├──┤      VOLUMES        ├───────────┘ │ │ │         │
│  │ │ │    ├─────────────────────┤  ├─────────────────────┤             │ │ │         │
│  │ │ └────┤ • localhost.pem     ├──┤ • mongo-data        ├─────────────┘ │ │         │
│  │ │      │ • localhost-key.pem │  │ • shared certs      │               │ │         │
│  │ └──────┤ • Self-signed SSL   ├──┤ • persistent DB     ├───────────────┘ │         │
│  │        │ • Development only  │  └─────────────────────┘                 │         │
│  └────────┤ • Production: CA    │                                          │         │
│           └─────────────────────┘                                          │         │
│                                                                            │         │
└────────────────────────────────────────────────────────────────────────────┼─────────┘
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┼─────────┐
│                               LAYER SICUREZZA                               │         │
├────────────────────────────────────────────────────────────────────────────┼─────────┤
│                                                                            │         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │         │
│  │    AUTENTICAZIONE   │  │   AUTORIZZAZIONE    │  │    COMUNICAZIONI    │ │         │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │         │
│  │ • JWT Tokens        │  │ • RBAC (4 ruoli)    │  │ • HTTPS Only        │ │         │
│  │ • HTTP-only Cookies │  │ • Middleware ACL    │  │ • TLS 1.2+          │ │         │
│  │ • Access (1h)       │  │ • Scope per Airline │  │ • CORS Configurato  │ │         │
│  │ • Refresh (7d)      │  │ • Admin/Manager/    │  │ • Security Headers  │ │         │
│  │ • bcrypt Password   │  │   Employee/Customer │  │ • SSL Certificates  │ │         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │         │
│                                                                            │         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │         │
│  │    VALIDAZIONE      │  │     MONITORING      │  │      BACKUP         │ │         │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │         │
│  │ • Input Sanitizing  │  │ • Request Logging   │  │ • MongoDB Dumps     │ │         │
│  │ • Schema Validation │  │ • Error Tracking    │  │ • Volume Persistence│ │         │
│  │ • NoSQL Injection   │  │ • Health Checks     │  │ • Data Retention    │ │         │
│  │ • Rate Limiting     │  │ • Performance Metrics│ │ • Recovery Procedures│ │         │
│  │ • CSRF Protection   │  │ • Security Alerts   │  │ • Point-in-time     │ │         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │         │
│                                                                            │         │
└────────────────────────────────────────────────────────────────────────────┼─────────┘
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┼─────────┐
│                             LAYER PERFORMANCE                               │         │
├────────────────────────────────────────────────────────────────────────────┼─────────┤
│                                                                            │         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │         │
│  │     DATABASE        │  │      CACHING        │  │      NETWORK        │ │         │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │         │
│  │ • Compound Indexes  │  │ • Nginx Gzip        │  │ • HTTP/2 Support    │ │         │
│  │ • Query Optimization│  │ • Browser Cache     │  │ • Keep-Alive        │ │         │
│  │ • Connection Pool   │  │ • Static Assets     │  │ • Compression       │ │         │
│  │ • TTL Cleanup       │  │ • API Response      │  │ • CDN Ready         │ │         │
│  │ • Aggregation       │  │ • Application Cache │  │ • Load Balancer     │ │         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │         │
│                                                                            │         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │         │
│  │    SCALABILITY      │  │     MONITORING      │  │    OPTIMIZATION     │ │         │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │         │
│  │ • Horizontal Scale  │  │ • APM Metrics       │  │ • Bundle Splitting  │ │         │
│  │ • Stateless Design  │  │ • Performance Logs  │  │ • Lazy Loading      │ │         │
│  │ • Container Ready   │  │ • Resource Usage    │  │ • Tree Shaking      │ │         │
│  │ • Auto-scaling      │  │ • Response Times    │  │ • Code Optimization │ │         │
│  │ • Load Distribution │  │ • Error Rates       │  │ • Image Optimization│ │         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │         │
│                                                                            │         │
└────────────────────────────────────────────────────────────────────────────┼─────────┘
                                                                             │
┌────────────────────────────────────────────────────────────────────────────┼─────────┐
│                          LAYER INTEGRAZIONE                                 │         │
├────────────────────────────────────────────────────────────────────────────┼─────────┤
│                                                                            │         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │         │
│  │        API          │  │    DOCUMENTAZIONE   │  │      TESTING        │ │         │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │         │
│  │ • OpenAPI 3.0       │  │ • Swagger UI        │  │ • Unit Tests        │ │         │
│  │ • RESTful Design    │  │ • JSDoc Comments    │  │ • Integration Tests │ │         │
│  │ • Semantic Versions │  │ • Postman Collection│  │ • E2E Tests         │ │         │
│  │ • Error Standards   │  │ • API Examples      │  │ • Performance Tests │ │         │
│  │ • Response Format   │  │ • Setup Guides      │  │ • Security Tests    │ │         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │         │
│                                                                            │         │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │         │
│  │      CI/CD          │  │     DEPLOYMENT      │  │    MAINTENANCE      │ │         │
│  ├─────────────────────┤  ├─────────────────────┤  ├─────────────────────┤ │         │
│  │ • Build Pipeline    │  │ • Docker Images     │  │ • Log Aggregation   │ │         │
│  │ • Test Automation   │  │ • Environment Config│ │ • Error Tracking    │ │         │
│  │ • Quality Gates     │  │ • Health Checks     │  │ • Performance Mon.  │ │         │
│  │ • Security Scans    │  │ • Rolling Updates   │  │ • Dependency Updates│ │         │
│  │ • Artifact Storage  │  │ • Rollback Strategy │  │ • Security Patches  │ │         │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │         │
│                                                                            │         │
└────────────────────────────────────────────────────────────────────────────┼─────────┘
                                                                             │
                                    ┌─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            FLUSSO DATI PRINCIPALE                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ 1. RICERCA VOLI                                                                    │
│    Browser → Nginx → Backend → MongoDB → Response con voli disponibili            │
│                                                                                     │
│ 2. AUTENTICAZIONE                                                                  │
│    Login → JWT Generation → HTTP-only Cookies → Session Management                │
│                                                                                     │
│ 3. PRENOTAZIONE                                                                    │
│    Selezione → Carrello → Validazione → Seat Reservation → Order Creation         │
│                                                                                     │
│ 4. SELEZIONE POSTI                                                                 │
│    Seat Map → Temporary Hold (15min) → Confirmation → Payment Processing          │
│                                                                                     │
│ 5. GESTIONE AMMINISTRATIVA                                                         │
│    Dashboard → RBAC Validation → CRUD Operations → Analytics Generation           │
│                                                                                     │
│ 6. ANALYTICS                                                                       │
│    Data Aggregation → MongoDB Pipelines → KPI Calculation → Dashboard Display     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              TECNOLOGIE CHIAVE                                      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ BACKEND                   │ FRONTEND                │ INFRASTRUCTURE                │
│ • Node.js 20             │ • Angular 19            │ • Docker Compose             │
│ • Express 5              │ • Standalone Components │ • Nginx 1.25+               │
│ • MongoDB 6+             │ • Tailwind CSS v4       │ • MongoDB 6+                 │
│ • Mongoose 8             │ • RxJS 7                │ • SSL/TLS Certificates       │
│ • JWT + bcrypt           │ • TypeScript 5.7        │ • Container Orchestration    │
│ • OpenAPI/Swagger        │ • Angular Router        │ • Volume Management          │
│                          │ • Angular Forms         │ • Network Configuration      │
│                                                                                     │
│ DEVELOPMENT              │ SECURITY                │ MONITORING                    │
│ • TypeScript             │ • JWT Authentication    │ • Health Check Endpoints     │
│ • ESLint/Prettier        │ • RBAC Authorization    │ • Request/Response Logging   │
│ • Nodemon                │ • HTTPS Enforcement     │ • Error Tracking             │
│ • Hot Reload             │ • CORS Configuration    │ • Performance Metrics        │
│ • Environment Variables  │ • Input Validation      │ • Resource Monitoring        │
│                          │ • Password Hashing      │ • Security Auditing         │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            DEPLOYMENT ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ DEVELOPMENT ENVIRONMENT                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Docker Compose Up                                                               │ │
│ │  ├─ Backend Container    :3443 (HTTPS Native)                                  │ │
│ │  ├─ MongoDB Container    :27017 (Internal)                                     │ │
│ │  ├─ Dashboard Container  :4443 (HTTPS via Nginx)                               │ │
│ │  └─ Site Container       :4543 (HTTPS via Nginx)                               │ │
│ │                                                                                 │ │
│ │ Shared Volumes:                                                                 │ │
│ │  ├─ ./certs → SSL Certificates                                                 │ │
│ │  └─ mongo-data → Database Persistence                                          │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
│ PRODUCTION ENVIRONMENT (Recommended)                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Kubernetes Cluster / Docker Swarm                                              │ │
│ │  ├─ Backend Pods/Services    (Multiple Replicas)                               │ │
│ │  ├─ MongoDB Replica Set      (High Availability)                               │ │
│ │  ├─ Frontend Services        (Load Balanced)                                   │ │
│ │  └─ Ingress Controller       (SSL Termination)                                 │ │
│ │                                                                                 │ │
│ │ Additional Components:                                                          │ │
│ │  ├─ Redis Cache             (Session & Data Caching)                           │ │
│ │  ├─ Prometheus/Grafana      (Monitoring & Alerting)                            │ │
│ │  ├─ ELK Stack               (Logging & Analytics)                              │ │
│ │  └─ CI/CD Pipeline          (Automated Deployment)                             │ │
│ └─────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               DATA FLOW DIAGRAM                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│ USER REQUEST FLOW:                                                                  │
│                                                                                     │
│ [User] → [Nginx] → [Express Router] → [Middleware Stack] → [Controller] → [Model]  │
│    ↑         ↓            ↓                ↓                    ↓           ↓      │
│    │    SSL Term     Route Match      Auth/CORS/Validation   Business     MongoDB   │
│    │                                                          Logic               │ │
│    │         ↑            ↑                ↑                    ↑           ↑      │
│ [Response] ← [Static] ← [JSON/Error] ← [Error Handler] ← [Data Proc.] ← [Query]    │
│                                                                                     │
│ DATABASE OPERATIONS:                                                                │
│                                                                                     │
│ [Controller] → [Mongoose Model] → [MongoDB Driver] → [Database]                    │
│      ↑              ↓                    ↓              ↓                          │
│   Response      Validation           Connection      Collection                     │
│      ↑              ↓                    ↓              ↓                          │
│ [Transform] ← [Document Result] ← [Raw Data] ← [Index/Aggregate]                   │
│                                                                                     │
│ AUTHENTICATION FLOW:                                                               │
│                                                                                     │
│ [Login] → [Password Verify] → [JWT Generate] → [Cookie Set] → [Response]           │
│     ↓           ↓                 ↓              ↓              ↓                  │
│ Credentials   bcrypt          Access+Refresh   HTTP-only     Success/Error         │
│                                                                                     │
│ [Request] → [Cookie Extract] → [JWT Verify] → [User Load] → [Authorization]        │
│     ↓            ↓               ↓             ↓              ↓                    │
│  Headers      Parse Token     Validate       Database       RBAC Check             │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

```

## Legenda dei Componenti

### 🎯 **Layer Architetturali**
- **Layer Utente**: Tipologie di utenti e loro funzionalità principali
- **Layer UI**: Interfacce frontend (Site e Dashboard Angular)
- **Layer Proxy**: Nginx per reverse proxy e SSL termination
- **Layer API**: Backend Express con tutti i controller e middleware
- **Layer Database**: MongoDB con tutte le collezioni e relazioni

### 🔧 **Componenti Tecnici**
- **Docker Compose**: Orchestrazione dei container per sviluppo
- **HTTPS Nativo**: SSL/TLS end-to-end per sicurezza
- **JWT + Cookies**: Autenticazione stateless sicura
- **RBAC**: Controllo accessi basato su ruoli con 4 livelli
- **MongoDB**: Database NoSQL con indici ottimizzati

### 🔄 **Flussi Principali**
1. **Ricerca Voli**: Pubblico, senza autenticazione
2. **Prenotazione**: Autenticata con gestione carrello
3. **Selezione Posti**: Sistema di hold temporaneo (15 min)
4. **Dashboard Admin**: Gestione completa sistema
5. **Analytics**: Aggregazioni real-time per KPI

### 📊 **Scalabilità e Performance**
- **Stateless Design**: Horizontal scaling ready
- **Connection Pooling**: Ottimizzazione database
- **Caching Strategy**: Multi-layer (Nginx, Browser, Application)
- **Index Optimization**: Query performance MongoDB
- **Container Architecture**: Deploy flessibile

Questo modello rappresenta la struttura completa del sistema Aviato, evidenziando le relazioni tra componenti, i flussi di dati, e l'architettura di deployment per un sistema di prenotazione voli enterprise-grade.
