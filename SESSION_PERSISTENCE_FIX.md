# Fix per la Persistenza della Sessione

## Problema

Ogni volta che si aggiorna la pagina, l'utente viene reindirizzato alla pagina di login perché la sessione non viene mantenuta.

## Cause del Problema

1. **Gestione Cookie**: Il frontend non gestiva correttamente i cookie di sessione
2. **Configurazione Proxy**: Il proxy non era configurato per gestire i cookie
3. **Headers HTTP**: Mancavano gli header corretti per l'autenticazione
4. **Controllo Asincrono**: L'AuthGuard non aspettava il completamento del controllo di autenticazione

## Soluzioni Implementate

### 1. Configurazione Proxy Aggiornata

**File**: `dashboard/proxy.conf.json`

```json
{
	"/api": {
		"target": "https://localhost:3443",
		"secure": false,
		"changeOrigin": true,
		"logLevel": "debug",
		"cookieDomainRewrite": "localhost",
		"cookiePathRewrite": "/"
	}
}
```

### 2. Servizio di Autenticazione Migliorato

**File**: `dashboard/src/app/auth/auth.service.ts`

**Modifiche principali**:

- Aggiunto stato di caricamento (`loading$`)
- Migliorata gestione dei cookie con `withCredentials: true`
- Aggiunti header `Content-Type` espliciti
- Logging per debug dell'autenticazione

### 3. AuthGuard Asincrono

**File**: `dashboard/src/app/auth/auth.guard.ts`

**Modifiche principali**:

- Convertito in Observable per gestire controlli asincroni
- Aspetta il completamento del controllo di autenticazione
- Gestisce correttamente lo stato di caricamento

### 4. Componente di Loading

**File**: `dashboard/src/app/components/loading/loading.component.ts`

**Funzionalità**:

- Mostra spinner durante il controllo di autenticazione
- Previene accesso prematuro alle route protette

### 5. App Component Aggiornato

**File**: `dashboard/src/app/app.component.ts`

**Modifiche principali**:

- Gestisce lo stato di caricamento dell'autenticazione
- Mostra loading component durante il controllo
- Nasconde router-outlet finché l'autenticazione non è verificata

### 6. Servizio Analytics Aggiornato

**File**: `dashboard/src/app/services/analytics.service.ts`

**Modifiche principali**:

- Aggiunto `withCredentials: true` per tutte le chiamate
- Header `Content-Type` espliciti
- Gestione corretta dei cookie

### 7. Environment Configuration

**File**: `dashboard/src/environments/environment.ts`

**Modifiche principali**:

- Cambiato da URL diretto a proxy (`/api` invece di `https://localhost:3443/api`)

## Flusso di Autenticazione Corretto

1. **Inizializzazione App**:

   - AuthService controlla automaticamente lo stato di autenticazione
   - Mostra loading component durante il controllo
   - Se utente autenticato → carica dashboard
   - Se utente non autenticato → reindirizza a login

2. **Login**:

   - Richiesta POST a `/api/users/login`
   - Backend imposta cookie `accessToken` e `refreshToken`
   - Frontend riceve cookie automaticamente
   - Reindirizzamento a dashboard

3. **Refresh Pagina**:

   - AuthService controlla automaticamente `/api/users/profile`
   - Se cookie validi → utente rimane loggato
   - Se cookie invalidi → reindirizzamento a login

4. **Route Protection**:
   - AuthGuard aspetta completamento controllo autenticazione
   - Se utente autenticato → permette accesso
   - Se utente non autenticato → reindirizza a login

## Test della Soluzione

### Test Manuale

1. Avvia backend: `cd backend && npm start`
2. Avvia frontend: `cd dashboard && npm start`
3. Vai a `http://localhost:4200`
4. Fai login con credenziali admin
5. Aggiorna la pagina (F5)
6. Verifica che rimani loggato

### Test Automatico

```bash
cd dashboard
node test-session.js
```

## Configurazione Backend

Il backend è già configurato correttamente:

- CORS con `credentials: true`
- Cookie parser abilitato
- JWT tokens in cookie httpOnly
- Refresh tokens per persistenza

## Troubleshooting

### Se la sessione continua a scadere:

1. Verifica che il backend sia in esecuzione su `https://localhost:3443`
2. Controlla i log del browser per errori CORS
3. Verifica che i cookie siano impostati correttamente
4. Controlla la configurazione del proxy

### Debug:

- Apri DevTools → Application → Cookies
- Verifica presenza di `accessToken` e `refreshToken`
- Controlla Network tab per chiamate API
- Verifica console per errori JavaScript

## Note Importanti

- I cookie sono `httpOnly` per sicurezza
- Il proxy gestisce automaticamente i cookie
- L'autenticazione è asincrona per performance
- Il loading state previene flash di contenuto non autorizzato
