# Implementazione Sistema di Gestione Privilegi Utenti

## Panoramica

Il sistema di gestione privilegi utenti è stato completamente implementato e testato. Permette agli amministratori di gestire i ruoli degli utenti e assegnare compagnie aeree agli employee.

## Funzionalità Implementate

### 1. Backend API

#### Endpoint Disponibili

- **GET `/api/users`** - Ottiene tutti gli utenti (admin only)
- **POST `/api/users/register`** - Registra un nuovo utente
- **POST `/api/users/login`** - Login utente
- **PATCH `/api/users/:id/role`** - Aggiorna il ruolo di un utente (admin only)
- **PATCH `/api/users/:id/airline-role`** - Aggiorna ruolo e compagnia aerea (admin only)
- **DELETE `/api/users/:id`** - Elimina un utente (admin only)

#### Logica di Gestione Ruoli

1. **Customer** → **Employee**: Richiede selezione di una compagnia aerea
2. **Employee** → **Admin**: Rimuove automaticamente le compagnie aeree
3. **Admin** → **Employee**: Richiede selezione di una compagnia aerea
4. **Employee** → **Customer**: Rimuove automaticamente le compagnie aeree

### 2. Frontend Dashboard

#### Componente Users Page (`users-page.component.ts`)

**Funzionalità:**

- ✅ Visualizzazione lista utenti con filtri
- ✅ Ricerca per nome, email
- ✅ Filtro per ruolo (admin, employee, customer)
- ✅ Filtro per compagnia aerea
- ✅ Cambio ruolo con validazioni
- ✅ Modal per assegnazione compagnia aerea
- ✅ Modal di conferma per rimozione compagnie
- ✅ Feedback visivo durante le operazioni
- ✅ Gestione errori robusta

**Interfaccia Utente:**

- Design moderno con Tailwind CSS
- Modal responsive per assegnazione compagnie
- Indicatori di caricamento
- Validazioni in tempo reale
- Messaggi di errore chiari

#### Componente Create User (`users-create.component.ts`)

**Funzionalità:**

- ✅ Form di creazione utente completo
- ✅ Validazioni client-side
- ✅ Selezione ruolo con logica dinamica
- ✅ Selezione compagnia aerea obbligatoria per employee
- ✅ Validazione email
- ✅ Validazione password (min 6 caratteri)
- ✅ Gestione errori

### 3. Validazioni e Sicurezza

#### Backend Validazioni

- ✅ Controllo autorizzazioni (admin only)
- ✅ Validazione ruoli validi (customer, employee, admin)
- ✅ Controllo esistenza utente
- ✅ Controllo esistenza compagnia aerea
- ✅ Validazione dati di input

#### Frontend Validazioni

- ✅ Validazione form in tempo reale
- ✅ Controllo campi obbligatori
- ✅ Validazione formato email
- ✅ Validazione lunghezza password
- ✅ Controllo assegnazione compagnia per employee

### 4. Flusso di Promozione Utenti

#### Scenario 1: Customer → Employee

1. Admin seleziona "employee" nel dropdown
2. Sistema rileva che l'utente non ha compagnie aeree
3. Si apre modal per selezione compagnia
4. Admin seleziona compagnia e conferma
5. Utente promosso a employee con compagnia assegnata

#### Scenario 2: Employee → Admin

1. Admin seleziona "admin" nel dropdown
2. Sistema rileva che l'utente ha compagnie aeree
3. Si apre modal di conferma per rimozione
4. Admin conferma la promozione
5. Utente promosso ad admin, compagnie rimosse

#### Scenario 3: Admin → Employee

1. Admin seleziona "employee" nel dropdown
2. Sistema rileva che l'utente non ha compagnie aeree
3. Si apre modal per selezione compagnia
4. Admin seleziona compagnia e conferma
5. Utente retrocesso a employee con compagnia assegnata

### 5. Test e Verifica

#### Test Backend

- ✅ Login admin
- ✅ Recupero lista utenti
- ✅ Recupero lista compagnie aeree
- ✅ Promozione customer → employee
- ✅ Promozione employee → admin
- ✅ Gestione cookie di autenticazione

#### Test Frontend

- ✅ Rendering componenti
- ✅ Validazioni form
- ✅ Gestione modal
- ✅ Comunicazione con API
- ✅ Gestione errori

## Struttura Database

### Modello User

```javascript
{
  name: String,
  surname: String,
  birthDate: Date,
  email: String (unique),
  password: String (hashed),
  roles: [String] (enum: ['customer', 'employee', 'admin']),
  airlines: [ObjectId] (ref: 'Airline'),
  timestamps: true
}
```

### Relazioni

- **User** ↔ **Airline**: Many-to-Many
- **Employee** deve avere almeno una **Airline**
- **Admin** e **Customer** non hanno **Airline**

## Configurazione Server

- **Porta**: 3443 (HTTPS)
- **Certificati**: `../certs/localhost.pem` e `../certs/localhost-key.pem`
- **CORS**: Configurato per dashboard Angular
- **Autenticazione**: Cookie-based con JWT
- **Database**: MongoDB (locale o Docker)

## Comandi Utili

### Avvio Server Locale

```bash
# Avvia MongoDB con Docker
docker-compose up mongo -d

# Avvia backend con MongoDB locale
cd backend
MONGO_URI=mongodb://localhost:27017/backenddb node index.js
```

### Avvio Server Docker

```bash
# Avvia tutto il stack
docker-compose up -d

# Solo backend
docker-compose up backend -d
```

### Test Funzionalità

```bash
cd backend
node test-users.js
```

### Creazione Admin

```bash
cd backend
node create-admin.js
```

## Note di Implementazione

1. **Sicurezza**: Tutti gli endpoint di gestione utenti richiedono autenticazione admin
2. **Validazione**: Controlli sia lato client che server
3. **UX**: Feedback visivo per tutte le operazioni
4. **Error Handling**: Gestione robusta degli errori
5. **Responsive**: Interfaccia ottimizzata per desktop e mobile
6. **Certificati SSL**: Configurati per sviluppo locale e produzione

## Risoluzione Problemi

### Certificati SSL

- I certificati sono presenti in `./certs/`
- Per Docker: montati come volume in `/app/certs`
- Per sviluppo locale: percorso relativo `../certs/`

### Database

- **Sviluppo locale**: `mongodb://localhost:27017/backenddb`
- **Docker**: `mongodb://mongo:27017/backenddb`

### Porte

- **Backend HTTPS**: 3443
- **Dashboard**: 4200 (HTTP) / 4443 (HTTPS)
- **Site**: 4300 (HTTP) / 4543 (HTTPS)

## Prossimi Sviluppi

- [ ] Notifiche in tempo reale per cambi di ruolo
- [ ] Log delle operazioni di gestione utenti
- [ ] Bulk operations per gestione multipla utenti
- [ ] Import/export utenti da CSV
- [ ] Gestione permessi granulari per employee
