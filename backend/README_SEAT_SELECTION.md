# Sistema di Seat Selection - Backend

## Panoramica

Il sistema di seat selection permette agli utenti di selezionare e prenotare posti specifici sui voli. Il sistema gestisce:

- Configurazione dettagliata dei posti per ogni aereo
- Distinzione tra prima classe e classe economica
- Gestione delle prenotazioni temporanee e permanenti
- Informazioni sui posti (finestrino, corridoio, uscita di emergenza, etc.)

## Modelli

### Plane.js (Aggiornato)

Il modello `Plane` è stato esteso per includere:

#### Nuovi campi:

- `cabinConfiguration`: Array di configurazioni per le diverse sezioni della cabina
- `seatsConfiguration`: Array dei posti specifici dell'aereo
- `totalRows`: Numero totale di file
- `maxSeatsPerRow`: Numero massimo di posti per fila
- `hasWiFi`, `hasEntertainment`, `hasPowerOutlets`: Servizi disponibili

#### Metodi principali:

- `generateSeatsConfiguration()`: Genera automaticamente i posti basandosi sulla configurazione della cabina
- `getSeatsByRows()`: Organizza i posti per file
- `getSeatsStats()`: Fornisce statistiche sui posti
- `reserveSeat(row, number)`: Prenota un posto
- `releaseSeat(row, number)`: Libera un posto

### SeatReservation.js (Nuovo)

Gestisce le prenotazioni dei posti per voli specifici.

#### Campi principali:

- `flight`, `user`, `plane`: Riferimenti ai modelli correlati
- `seatRow`, `seatNumber`: Identificazione del posto
- `seatClass`: Classe del posto (economy/first)
- `status`: Stato della prenotazione (reserved/confirmed/cancelled)
- `expiresAt`: Scadenza della prenotazione temporanea
- `price`: Prezzo del posto
- `isAisle`, `isWindow`, `isEmergencyExit`, `isBulkhead`: Caratteristiche del posto

#### Metodi principali:

- `isExpired()`: Verifica se la prenotazione è scaduta
- `extendReservation(minutes)`: Estende la prenotazione
- `confirm()`: Conferma la prenotazione
- `cancel()`: Cancella la prenotazione

## API Endpoints

### Seat Selection

#### GET `/api/seats/flights/:flightId/seats`

Ottiene la configurazione dei posti per un volo specifico.

**Response:**

```json
{
  "flight": {
    "id": "flight_id",
    "flightNumber": "FL123",
    "departureDate": "2024-01-15T10:00:00Z",
    "arrivalDate": "2024-01-15T12:00:00Z",
    "price": 150,
    "firstClassPrice": 300
  },
  "plane": {
    "id": "plane_id",
    "code": "A320-001",
    "model": "A320",
    "totalRows": 30,
    "maxSeatsPerRow": 6,
    "cabinConfiguration": [...]
  },
  "seats": {
    "A": [
      {
        "row": "A",
        "number": 1,
        "seatClass": "first",
        "isAvailable": true,
        "isReserved": false,
        "isAisle": false,
        "isWindow": true,
        "price": 300
      }
    ]
  },
  "stats": {
    "total": 180,
    "available": 150,
    "reserved": 30,
    "economy": 150,
    "first": 30
  }
}
```

#### POST `/api/seats/flights/:flightId/seats/reserve`

Prenota un posto specifico.

**Request Body:**

```json
{
	"seatRow": "A",
	"seatNumber": 1,
	"specialRequests": "Window seat preferred"
}
```

**Response:**

```json
{
	"message": "Posto prenotato con successo",
	"reservation": {
		"id": "reservation_id",
		"seatRow": "A",
		"seatNumber": 1,
		"seatClass": "first",
		"price": 300,
		"status": "reserved",
		"expiresAt": "2024-01-15T10:15:00Z"
	}
}
```

#### PUT `/api/seats/reservations/:reservationId/confirm`

Conferma una prenotazione temporanea.

#### DELETE `/api/seats/reservations/:reservationId`

Cancella una prenotazione.

#### PUT `/api/seats/reservations/:reservationId/extend`

Estende una prenotazione temporanea.

#### GET `/api/seats/user/reservations`

Ottiene le prenotazioni di un utente.

### Plane Management

#### GET `/api/planes/:id/seats`

Ottiene la configurazione dei posti di un aereo.

#### GET `/api/planes/:id/stats`

Ottiene le statistiche dei posti di un aereo.

#### PUT `/api/planes/:id/configuration`

Aggiorna la configurazione di un aereo (admin only).

## Configurazione degli Aerei

### Esempio di configurazione per Airbus A320:

```javascript
{
  code: "A320-001",
  manifacturer: "Airbus",
  model: "A320",
  seats: 180,
  totalRows: 30,
  maxSeatsPerRow: 6,
  cabinConfiguration: [
    {
      name: "First Class",
      seatClass: "first",
      startRow: "1",
      endRow: "3",
      seatsPerRow: 4,
      seatLayout: "2-2",
      priceMultiplier: 2.5
    },
    {
      name: "Economy Class",
      seatClass: "economy",
      startRow: "4",
      endRow: "30",
      seatsPerRow: 6,
      seatLayout: "3-3",
      priceMultiplier: 1.0
    }
  ]
}
```

### Layout dei posti:

- `"2-2"`: 2 posti, corridoio, 2 posti
- `"3-3"`: 3 posti, corridoio, 3 posti
- `"2-3-2"`: 2 posti, corridoio, 3 posti, corridoio, 2 posti

## Caratteristiche dei Posti

### Tipi di posto:

- **Finestrino**: Primo e ultimo posto di ogni fila
- **Corridoio**: Posti adiacenti ai corridoi
- **Uscita di emergenza**: File specifiche (configurabili)
- **Bulkhead**: Prima fila di ogni sezione

### Classi:

- **First Class**: Posti premium con servizi aggiuntivi
- **Economy Class**: Posti standard

## Gestione delle Prenotazioni

### Stati delle prenotazioni:

1. **reserved**: Prenotazione temporanea (scade dopo 15 minuti)
2. **confirmed**: Prenotazione confermata (permanente)
3. **cancelled**: Prenotazione cancellata

### Flusso di prenotazione:

1. Utente seleziona un posto disponibile
2. Sistema crea una prenotazione temporanea (15 minuti)
3. Utente può confermare o estendere la prenotazione
4. Se confermata, la prenotazione diventa permanente
5. Se scade, il posto torna disponibile

## Utilità

### Seeding del database:

```bash
node utils/planeSeeder.js
```

Questo script popola il database con aerei di esempio con configurazioni realistiche.

### Pulizia automatica:

Il sistema include metodi per pulire automaticamente le prenotazioni scadute.

## Sicurezza

- Tutti gli endpoint di prenotazione richiedono autenticazione
- Le prenotazioni sono legate all'utente autenticato
- Validazione dei posti disponibili prima della prenotazione
- Indici univoci per evitare prenotazioni duplicate

## Considerazioni Future

- Integrazione con il sistema di pagamento
- Notifiche in tempo reale per cambi di stato
- Supporto per prenotazioni di gruppo
- Gestione di posti speciali (disabilità, bambini, etc.)
- Integrazione con il sistema di check-in
