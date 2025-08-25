# Documento dei Requisiti Funzionali - Progetto Aviato

## 1. Panoramica del Sistema

### 1.1 Descrizione del Progetto
Aviato è una piattaforma end-to-end per la gestione delle prenotazioni voli che comprende:
- **Backend RESTful**: API HTTPS basate su Node.js/Express con database MongoDB
- **Frontend Clienti (Site)**: Single Page Application Angular per i clienti finali
- **Frontend Gestionale (Dashboard)**: Single Page Application Angular per il personale delle compagnie aeree
- **Infrastruttura Containerizzata**: Docker Compose con Nginx per reverse proxy e gestione HTTPS

### 1.2 Obiettivi del Sistema
Il sistema deve supportare tutti i requisiti funzionali per:
- Gestione completa del ciclo di vita delle prenotazioni voli
- Amministrazione multi-compagnia con controlli di accesso basati sui ruoli
- Ricerca e prenotazione voli con selezione posti avanzata
- Analytics operativo per le compagnie aeree
- Gestione carrello e processo di checkout completo

## 2. Gestione Utenti e Autenticazione

### 2.1 Ruoli del Sistema
Il sistema supporta quattro ruoli principali con permessi differenziati:

#### 2.1.1 Customer (Cliente)
**Funzionalità:**
- Registrazione autonoma tramite form pubblico
- Ricerca voli senza autenticazione
- Gestione carrello personale
- Prenotazione e acquisto biglietti
- Selezione posti con mappa interattiva
- Visualizzazione storico ordini personale

#### 2.1.2 Employee (Dipendente Compagnia)
**Funzionalità:**
- Gestione voli della propria compagnia
- Creazione e modifica rotte
- Gestione flotta aerei
- Visualizzazione analytics operative
- Accesso limitato ai dati della propria compagnia

#### 2.1.3 Manager (Manager Compagnia)
**Funzionalità:**
- Tutte le funzionalità dell'Employee
- Gestione dipendenti della propria compagnia
- Creazione account Employee
- Accesso a report avanzati della compagnia
- Gestione configurazione aerei

#### 2.1.4 Admin (Amministratore Sistema)
**Funzionalità:**
- Gestione completa di tutti gli utenti
- Creazione Manager e relative compagnie
- Gestione aeroporti (CRUD, import CSV)
- Supervisione di tutte le compagnie
- Accesso a analytics globali
- Pulizia dati sistema (prenotazioni scadute)

### 2.2 Processo di Autenticazione

#### 2.2.1 Registrazione Cliente
**RF-AUTH-001**: Il sistema deve permettere la registrazione autonoma dei clienti
- **Input**: Nome, Cognome, Data di nascita, Email, Password
- **Validazioni**: Email unica, password sicura, campi obbligatori
- **Output**: Account cliente creato con ruolo "customer"
- **Processo**: 
  1. Validazione dati inseriti
  2. Hash password con bcrypt
  3. Creazione record utente
  4. Conferma registrazione

#### 2.2.2 Sistema di Inviti per Personale
**RF-AUTH-002**: Il sistema deve gestire la creazione di account via invito
- **Manager**: Solo Admin può creare Manager con compagnia associata
- **Employee**: Admin e Manager possono creare Employee
- **Processo**:
  1. Admin/Manager crea account con password temporanea
  2. Flag `passwordMustChange = true`
  3. Primo login richiede cambio password e completamento profilo
  4. Account attivato dopo first-login

#### 2.2.3 Autenticazione JWT con Cookie
**RF-AUTH-003**: Il sistema deve utilizzare autenticazione basata su JWT con cookie HTTP-only
- **Access Token**: Scadenza ~1 ora, per autenticazione richieste
- **Refresh Token**: Scadenza ~7 giorni, per rinnovo automatico
- **Sicurezza**: Cookie HTTP-only, HTTPS only, protezione CSRF
- **CORS**: Origini consentite per sviluppo e produzione

### 2.3 Gestione Profili e Ruoli

**RF-AUTH-004**: Il sistema deve permettere la gestione dei profili utente
- Visualizzazione e modifica dati personali
- Cambio password
- Gestione preferenze account

**RF-AUTH-005**: Il sistema deve supportare la gestione dei ruoli
- Assegnazione ruoli da parte di Admin
- Controllo di accesso basato su ruoli (RBAC)
- Associazione utenti a compagnie specifiche

## 3. Gestione Compagnie Aeree

### 3.1 Anagrafica Compagnie

**RF-AIRLINE-001**: Il sistema deve gestire l'anagrafica delle compagnie aeree
- **Campi richiesti**: Nome compagnia, Codice IATA unico, Manager assegnato
- **Vincoli**: Codice compagnia uppercase e univoco
- **Relazioni**: Ogni compagnia ha un Manager e può avere più Employee

**RF-AIRLINE-002**: Il sistema deve supportare la creazione di compagnie
- Solo Admin può creare nuove compagnie
- Creazione automatica di Manager associato
- Assegnazione codice IATA univoco

### 3.2 Gestione Dipendenti Compagnia

**RF-AIRLINE-003**: Il sistema deve gestire i dipendenti per compagnia
- Manager può vedere solo dipendenti della propria compagnia
- Admin può vedere tutti i dipendenti di tutte le compagnie
- Possibilità di invitare nuovi dipendenti via email

## 4. Gestione Aeroporti e Rotte

### 4.1 Database Aeroporti

**RF-AIRPORT-001**: Il sistema deve gestire un database completo di aeroporti
- **Standard OpenFlights**: Compatibilità con formato OpenFlights
- **Campi obbligatori**: Nome, Città, Paese, Coordinate geografiche
- **Codici**: IATA (3 lettere) e ICAO (4 lettere) quando disponibili
- **Metadati**: Timezone, DST, Altitudine, Tipo struttura

**RF-AIRPORT-002**: Il sistema deve supportare operazioni CRUD su aeroporti
- **Creazione**: Solo Admin può aggiungere aeroporti
- **Lettura**: Tutti possono cercare aeroporti
- **Ricerca**: Per nome, città, codice IATA/ICAO, paese
- **Import**: Caricamento bulk via CSV
- **Aggiornamento/Cancellazione**: Solo Admin

### 4.2 Gestione Rotte

**RF-ROUTE-001**: Il sistema deve gestire le rotte di volo
- **Definizione**: Collegamento diretto tra due aeroporti
- **Campi**: Aeroporto partenza, Aeroporto arrivo, Codice rotta
- **Vincoli**: Codice rotta univoco, aeroporti esistenti
- **Permessi**: Employee/Manager/Admin possono creare rotte

**RF-ROUTE-002**: Il sistema deve validare la creazione di rotte
- Verifica esistenza aeroporti di partenza e arrivo
- Controllo unicità codice rotta
- Prevenzione rotte duplicate (stesso origine-destinazione)

## 5. Gestione Flotta e Aerei

### 5.1 Configurazione Aerei

**RF-PLANE-001**: Il sistema deve gestire la configurazione degli aerei
- **Anagrafica**: Codice aereo, Produttore, Modello, Compagnia
- **Configurazione Cabina**: Classi di servizio (Economy/First Class)
- **Layout Posti**: Configurazione per fila, disposizione corridoi
- **Capacità**: Numero totale posti, file, posti per fila

**RF-PLANE-002**: Il sistema deve generare automaticamente la mappa posti
- **Generazione automatica**: Mappa posti basata su configurazione cabina
- **Classificazione posti**: Corridoio, Finestrino, Uscita emergenza, Bulkhead
- **Classi di servizio**: Economy, First Class con moltiplicatori prezzo
- **Layout configurabile**: Supporto per diverse disposizioni (3-3, 2-2, 2-3-2)

### 5.2 Statistiche e Gestione Posti

**RF-PLANE-003**: Il sistema deve fornire statistiche dettagliate sui posti
- Conteggio posti per classe
- Posti disponibili/prenotati
- Distribuzione per tipo (corridoio/finestrino)
- Statistiche occupazione per volo

## 6. Gestione Voli

### 6.1 Pianificazione Voli

**RF-FLIGHT-001**: Il sistema deve gestire la pianificazione dei voli
- **Campi obbligatori**: Numero volo, Rotta, Date/Orari, Aereo, Compagnia
- **Vincoli**: Numero volo univoco, date coerenti, disponibilità aereo
- **Pricing**: Prezzo base, First Class, Bagaglio aggiuntivo
- **Status**: Schedulato, In Ritardo, Cancellato, Partito, Atterrato

**RF-FLIGHT-002**: Il sistema deve validare i voli
- Controllo sovrapposizioni aereo (stesso aereo su più voli simultanei)
- Validazione orari (arrivo dopo partenza)
- Verifica esistenza rotta e aereo
- Calcolo automatico posti disponibili da aereo

### 6.2 Gestione Status Voli

**RF-FLIGHT-003**: Il sistema deve gestire lo status dei voli
- Aggiornamento status in tempo reale
- Notifiche automatiche per cambi status
- Storico modifiche status
- Impact su prenotazioni esistenti

## 7. Ricerca e Prenotazione Voli

### 7.1 Motore di Ricerca

**RF-SEARCH-001**: Il sistema deve fornire ricerca voli avanzata
- **Ricerca base**: Origine, Destinazione, Data partenza
- **Voli diretti**: Ricerca voli senza scali
- **Voli con scalo**: Ricerca con uno scalo intermedio
- **Filtri**: Prezzo, Orario, Durata, Compagnia
- **Ordinamento**: Per prezzo, orario partenza, durata

**RF-SEARCH-002**: Il sistema deve supportare ricerca pubblica
- Ricerca voli senza autenticazione richiesta
- Visualizzazione risultati con dettagli base
- Login richiesto solo per prenotazione

### 7.2 Processo di Prenotazione

**RF-BOOKING-001**: Il sistema deve gestire il processo di prenotazione completo
- **Selezione volo**: Aggiunta al carrello
- **Gestione carrello**: Modifica quantità, rimozione item
- **Selezione posti**: Mappa interattiva con pricing
- **Checkout**: Processo di pagamento e conferma

## 8. Gestione Carrello

### 8.1 Funzionalità Carrello

**RF-CART-001**: Il sistema deve fornire gestione carrello completa
- **Persistenza**: Carrello salvato sul backend per utenti autenticati
- **Operazioni**: Aggiungi, modifica, rimuovi item
- **Calcoli**: Totale automatico con prezzi al momento dell'aggiunta
- **Validazione**: Controllo disponibilità posti al checkout

**RF-CART-002**: Il sistema deve sincronizzare carrello client-server
- Sincronizzazione automatica tra frontend e backend
- Gestione conflitti (prezzi cambiati, voli non disponibili)
- Recupero carrello su login da diversi dispositivi

## 9. Selezione Posti

### 9.1 Mappa Posti Interattiva

**RF-SEAT-001**: Il sistema deve fornire selezione posti avanzata
- **Mappa visuale**: Rappresentazione grafica della cabina
- **Classificazione posti**: Corridoio, Finestrino, Standard, Premium
- **Pricing dinamico**: Prezzi differenziati per tipo posto
- **Disponibilità real-time**: Aggiornamento stato posti in tempo reale

### 9.2 Sistema di Prenotazione Posti

**RF-SEAT-002**: Il sistema deve gestire prenotazioni temporanee
- **Hold temporaneo**: Prenotazione di 15 minuti senza pagamento
- **Estensione**: Possibilità di estendere prenotazione
- **Conferma**: Conferma definitiva al pagamento
- **Cleanup automatico**: Rimozione prenotazioni scadute

**RF-SEAT-003**: Il sistema deve prevenire doppia prenotazione
- Lock sui posti durante selezione
- Indice unico per volo-fila-numero
- Gestione race conditions
- Notifiche in caso di conflitto

## 10. Gestione Ordini e Pagamenti

### 10.1 Processo di Checkout

**RF-ORDER-001**: Il sistema deve gestire la creazione ordini
- **Da carrello**: Conversione carrello in ordine
- **Da selezione diretta**: Ordine immediato senza carrello
- **Calcolo totale**: Prezzo voli + extra + posti selezionati
- **Validazione**: Controllo disponibilità finale prima del pagamento

**RF-ORDER-002**: Il sistema deve supportare diversi metodi di pagamento
- **Metodi supportati**: Carta di credito, PayPal, Bonifico
- **Sicurezza**: Tokenizzazione dati sensibili
- **Conferma**: Generazione numero ordine e conferma

### 10.2 Gestione Extra e Servizi

**RF-ORDER-003**: Il sistema deve gestire servizi aggiuntivi
- **Bagaglio extra**: Selezione e pricing bagagli aggiuntivi
- **Selezione classe**: Economy vs First Class con prezzi differenziati
- **Passeggeri multipli**: Gestione ordini per più passeggeri
- **Servizi speciali**: Richieste particolari (disabilità, allergie)

### 10.3 Storico e Gestione Ordini

**RF-ORDER-004**: Il sistema deve fornire gestione ordini completa
- **Storico personale**: Visualizzazione ordini cliente
- **Dettagli ordine**: Informazioni complete volo, posti, extra
- **Status tracking**: Stati ordine (Pending, Completed, Cancelled, Refunded)
- **Amministrazione**: Gestione ordini per Admin

## 11. Analytics e Reporting

### 11.1 Dashboard Operativo

**RF-ANALYTICS-001**: Il sistema deve fornire analytics operativo
- **KPI globali**: Passeggeri totali, Revenue, Voli
- **Breakdown per compagnia**: Metriche specifiche per airline
- **Trend temporali**: Andamenti mensili e stagionali
- **Rotte popolari**: Analisi domanda per destinazioni

**RF-ANALYTICS-002**: Il sistema deve supportare report per ruoli
- **Employee/Manager**: Analytics limitati alla propria compagnia
- **Admin**: Accesso a analytics globali e comparative
- **Esportazione**: Download report in formati standard

### 11.2 Metriche di Business

**RF-ANALYTICS-003**: Il sistema deve calcolare metriche chiave
- **Load Factor**: Percentuale occupazione voli
- **Revenue per Route**: Ricavi per rotta
- **Customer Analytics**: Analisi comportamento clienti
- **Seasonal Trends**: Andamenti stagionali della domanda

## 12. Amministrazione Sistema

### 12.1 Gestione Dati Master

**RF-ADMIN-001**: Il sistema deve supportare gestione dati di sistema
- **Import aeroporti**: Caricamento bulk da file CSV
- **Pulizia automatica**: Rimozione prenotazioni scadute
- **Backup/Restore**: Funzionalità di backup dati
- **Manutenzione**: Tool per ottimizzazione performance

### 12.2 Monitoraggio e Logging

**RF-ADMIN-002**: Il sistema deve fornire monitoraggio completo
- **Log operazioni**: Tracciamento azioni utenti
- **Metriche sistema**: Performance API e database
- **Alerting**: Notifiche per errori critici
- **Audit trail**: Storico modifiche dati sensibili

## 13. Requisiti di Sicurezza

### 13.1 Autenticazione e Autorizzazione

**RF-SEC-001**: Il sistema deve implementare sicurezza robusta
- **Password policy**: Requisiti minimi per password
- **Session management**: Gestione sicura sessioni JWT
- **Rate limiting**: Protezione contro brute force
- **HTTPS**: Comunicazioni sempre cifrate

### 13.2 Protezione Dati

**RF-SEC-002**: Il sistema deve proteggere i dati sensibili
- **Crittografia**: Hash password, tokenizzazione pagamenti
- **Validazione input**: Sanitizzazione dati utente
- **CORS**: Configurazione CORS restrittiva
- **Privacy**: Compliance con normative privacy

## 14. Requisiti di Performance

### 14.1 Scalabilità

**RF-PERF-001**: Il sistema deve essere scalabile
- **Database**: Indicizzazione ottimale per query frequenti
- **Caching**: Cache per risultati ricerche e dati statici
- **Load balancing**: Supporto per deployment multi-istanza
- **CDN**: Distribuzione asset statici

### 14.2 Disponibilità

**RF-PERF-002**: Il sistema deve garantire alta disponibilità
- **Uptime**: 99.9% disponibilità target
- **Backup**: Backup automatici database
- **Recovery**: Procedure di disaster recovery
- **Monitoring**: Monitoraggio proattivo servizi

## 15. Requisiti di Usabilità

### 15.1 Esperienza Utente

**RF-UX-001**: Il sistema deve fornire esperienza utente ottimale
- **Responsive design**: Compatibilità mobile/desktop
- **Accessibilità**: Compliance WCAG guidelines
- **Performance**: Caricamento pagine < 3 secondi
- **Internazionalizzazione**: Supporto multi-lingua

### 15.2 Interfacce Intuitive

**RF-UX-002**: Le interfacce devono essere intuitive
- **Navigation**: Menu e navigazione chiari
- **Feedback**: Notifiche chiare per azioni utente
- **Error handling**: Messaggi di errore comprensibili
- **Help**: Documentazione e help integrati

## 16. Requisiti di Integrazione

### 16.1 API Documentation

**RF-API-001**: Il sistema deve fornire documentazione API completa
- **OpenAPI/Swagger**: Documentazione automatica endpoints
- **Examples**: Esempi request/response per ogni endpoint
- **Authentication**: Documentazione autenticazione
- **SDKs**: Librerie client per linguaggi principali

### 16.2 Estensibilità

**RF-EXT-001**: Il sistema deve essere estensibile
- **Plugin architecture**: Supporto per estensioni
- **Webhook**: Notifiche eventi per sistemi esterni
- **Import/Export**: Formati standard per data exchange
- **API versioning**: Gestione versioni API

## 17. Deployment e Infrastruttura

### 17.1 Containerizzazione

**RF-DEPLOY-001**: Il sistema deve essere containerizzato
- **Docker**: Container per tutti i servizi
- **Docker Compose**: Orchestrazione ambiente sviluppo
- **Production ready**: Configurazioni per produzione
- **SSL/TLS**: Certificati per HTTPS

### 17.2 Configurazione Ambienti

**RF-DEPLOY-002**: Il sistema deve supportare ambienti multipli
- **Development**: Ambiente locale con hot-reload
- **Staging**: Ambiente test pre-produzione
- **Production**: Configurazione produzione ottimizzata
- **Environment variables**: Configurazione via variabili ambiente

## 18. Requisiti di Testing

### 18.1 Test Coverage

**RF-TEST-001**: Il sistema deve avere copertura test completa
- **Unit tests**: Test funzioni individuali
- **Integration tests**: Test API endpoints
- **E2E tests**: Test flussi utente completi
- **Performance tests**: Test carico e stress

### 18.2 Qualità Codice

**RF-TEST-002**: Il sistema deve mantenere alta qualità codice
- **Linting**: Regole di stile codice
- **Code review**: Processo review obbligatorio
- **Static analysis**: Analisi statica vulnerabilità
- **Documentation**: Documentazione codice inline

---

## Conclusioni

Questo documento definisce i requisiti funzionali completi per la piattaforma Aviato. Il sistema copre tutti gli aspetti della gestione prenotazioni voli, dalla ricerca al checkout, con particolare attenzione a:

- **Sicurezza**: Autenticazione robusta e protezione dati
- **Scalabilità**: Architettura pronta per crescita
- **Usabilità**: Interfacce intuitive per tutti i ruoli utente
- **Flessibilità**: Supporto multi-compagnia con controlli granulari
- **Performance**: Ottimizzazioni per risposta rapida
- **Manutenibilità**: Codice ben strutturato e documentato

La piattaforma rappresenta una soluzione completa per la gestione delle prenotazioni voli nel settore aviation, con funzionalità all'avanguardia per clienti e operatori del settore.