# 🛩️ Aviato - Flight Booking Platform

Una piattaforma completa per la prenotazione di voli costruita con architettura a 3 livelli, che include gestione compagnie aeree, operazioni voli, prenotazione posti, carrello/ordini e analisi.

## 🏗️ Architettura

- **Backend**: API REST Express.js con MongoDB/Mongoose, autenticazione JWT via cookie HTTP-only
- **Dashboard**: Interfaccia admin Angular 19 per la gestione delle compagnie aeree (back-office)  
- **Site**: Frontend Angular 19 per clienti per la prenotazione voli (front-office)

## 🚀 Setup Rapido

### Prerequisiti

- [Docker](https://www.docker.com/get-started) e Docker Compose installati
- Git per clonare il repository

### 1. Clona il Repository

```bash
git clone <repository-url>
cd Aviato
```

### 2. Setup Automatico

Esegui lo script di setup automatico:

```bash
./setup.sh
```

Lo script automaticamente:
- ✅ Verifica che Docker sia in esecuzione
- ✅ Genera i certificati SSL self-signed se necessari
- ✅ Avvia tutti i servizi Docker
- ✅ Controlla se il database ha dati
- ✅ Propone di popolare il database con dati mock

### 3. Accedi all'Applicazione

Dopo il setup, i servizi saranno disponibili su:

- **🖥️ Dashboard Admin**: https://localhost:4443
- **🌐 Sito Clienti**: https://localhost:4543  
- **📡 API Backend**: https://localhost:3443
- **📋 Documentazione API (Swagger)**: https://localhost:3443/api-docs
- **🗄️ MongoDB**: localhost:27017

## 🔑 Credenziali Predefinite

| Ruolo | Email | Password |
|-------|--------|----------|
| Admin | `admin@aviato.com` | `password` |
| Manager | `manager1@av.com` | `password` |
| Employee | `employee1@av.com` | `password` |
| Cliente | `customer1@gmail.com` | `password` |

*Nota: Ci sono 5 manager (uno per compagnia), 10 dipendenti (2 per compagnia) e 10 clienti*

## 📖 Guida Rapida

### Per Amministratori

1. **Accedi alla Dashboard**: https://localhost:4443
2. **Login** con credenziali admin
3. **Gestisci compagnie aeree**: Visualizza e modifica le compagnie
4. **Crea manager**: Assegna manager alle compagnie aeree
5. **Visualizza analytics**: Monitora metriche globali

### Per Manager delle Compagnie

1. **Accedi alla Dashboard**: https://localhost:4443
2. **Login** con credenziali manager
3. **Gestisci dipendenti**: Crea e gestisci dipendenti della tua compagnia
4. **Gestisci aerei**: Configura la flotta con layout posti
5. **Crea rotte**: Definisci percorsi tra aeroporti
6. **Programma voli**: Crea voli con prezzi e orari
7. **Visualizza analytics**: Metriche specifiche della tua compagnia

### Per Dipendenti

1. **Accedi alla Dashboard**: https://localhost:4443
2. **Login** con credenziali employee
3. **Gestisci voli**: Visualizza e modifica voli della tua compagnia
4. **Gestisci aerei**: Visualizza configurazione aerei
5. **Visualizza analytics**: Metriche limitate alla tua compagnia

### Per Clienti

1. **Accedi al Sito**: https://localhost:4543
2. **Registrati** o fai **login** con account esistente
3. **Cerca voli**: Utilizza il motore di ricerca con filtri
4. **Seleziona posto**: Scegli il posto preferito sulla mappa dell'aereo
5. **Aggiungi al carrello**: Gestisci prenotazioni multiple
6. **Procedi al pagamento**: Completa l'ordine
7. **Visualizza ordini**: Controlla lo storico prenotazioni

## 🛠️ Sviluppo

### Setup Ambiente di Sviluppo

Per sviluppo locale senza Docker:

#### Backend
```bash
cd backend
npm install
npm run dev  # Sviluppo con nodemon
```

#### Dashboard  
```bash
cd dashboard
npm install
npm start    # ng serve su http://localhost:4200
```

#### Site
```bash
cd site
npm install
npm start    # ng serve su http://localhost:4200
```

### Variabili d'Ambiente

Crea un file `.env` nella cartella `backend/`:

```env
MONGO_URI=mongodb://localhost:27017/backenddb
JWT_SECRET=super-secret
JWT_REFRESH_SECRET=super-secret
SSL_PORT=3443
```

### Database

#### Popolare con Dati Mock

```bash
cd backend
node seed.js
```

#### Importare Aeroporti

Gli aeroporti vengono automaticamente importati dal file `backend/Dump/airports.csv` durante il seeding.

## 🗂️ Struttura del Progetto

```
Aviato/
├── backend/           # API Express.js
│   ├── controllers/   # Logica business
│   ├── models/        # Modelli Mongoose
│   ├── routes/        # Route API
│   ├── middleware/    # Middleware autenticazione
│   ├── Dump/         # File CSV dati iniziali
│   └── seed.js       # Script popolamento database
├── dashboard/         # Admin Angular app
│   └── src/app/       # Componenti dashboard
├── site/             # Cliente Angular app
│   └── src/app/       # Componenti sito cliente
├── certs/            # Certificati SSL
├── docker-compose.yml # Configurazione Docker
└── setup.sh          # Script setup automatico
```

## 🔐 Sicurezza

- **Autenticazione**: JWT in cookie HTTP-only
- **Autorizzazione**: Ruoli (admin, manager, employee, customer) con scope per compagnia
- **HTTPS**: Comunicazione criptata con certificati SSL
- **CORS**: Configurato per domini autorizzati

## 🚨 Risoluzione Problemi

### Docker non si avvia
```bash
# Verifica stato Docker
docker info

# Riavvia Docker Desktop se necessario
```

### Errori certificati SSL
```bash
# Rigenera certificati
rm -rf certs/
./setup.sh
```

### Database vuoto dopo setup
```bash
# Esegui seeding manualmente
docker compose exec backend node seed.js
```

### Servizi non raggiungibili
```bash
# Controlla stato container
docker compose ps

# Visualizza log
docker compose logs backend
docker compose logs mongo
```

### Reset completo
```bash
# Ferma e rimuovi tutto
docker compose down -v
docker system prune -f

# Riavvia setup
./setup.sh
```

## 📚 API Documentation

La documentazione API interattiva Swagger è disponibile su: https://localhost:3443/api-docs

La specifica OpenAPI è inoltre disponibile in `openapi.json` nella root del progetto.

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Dashboard
cd dashboard  
npm test

# Site
cd site
npm test
```

## 🤝 Contribuire

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

---

⭐ **Suggerimento**: Per la prima volta, utilizza sempre `./setup.sh` per un'esperienza di setup ottimale!