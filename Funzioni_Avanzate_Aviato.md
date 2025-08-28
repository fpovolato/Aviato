# Funzioni Avanzate e Peculiarità del Progetto Aviato

## Indice
1. [Sistema di Autenticazione con HTTP-Only Cookies](#sistema-di-autenticazione)
2. [Sistema di Prenotazione Posti con Scadenza Automatica](#sistema-prenotazione-posti)
3. [Architettura Angular 19 Standalone Components](#architettura-angular-standalone)
4. [Gestione Reattiva dello Stato con Signals](#gestione-stato-signals)
5. [Sistema di Autorizzazione Multi-Ruolo](#sistema-autorizzazione)
6. [Guard Avanzate per la Protezione delle Route](#guard-protezione-route)
7. [Gestione Dinamica dei Posti Aereo](#gestione-dinamica-posti)

---

## Sistema di Autenticazione con HTTP-Only Cookies {#sistema-di-autenticazione}

### Panoramica Tecnica
Il progetto Aviato implementa un sistema di autenticazione avanzato basato su **HTTP-Only Cookies** che rappresenta una delle implementazioni più sicure per la gestione delle sessioni utente in applicazioni web moderne.

### Implementazione Backend (`backend/middleware/auth.js`)

```javascript
const protect = async (req, res, next) => {
    const token = req.cookies.accessToken;  // Token estratto direttamente dai cookies

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = await User.findById(decoded.id).select("name email roles airlines");
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, invalid token" });
    }
};
```

### Peculiarità Tecniche

1. **Sicurezza Avanzata**: I token JWT sono memorizzati in cookies HTTP-Only, impedendo l'accesso via JavaScript e proteggendo da attacchi XSS
2. **Doppio Token System**: Utilizza `accessToken` (1h) e `refreshToken` (7d) per bilanciare sicurezza e usabilità
3. **Auto-Refresh Trasparente**: Il sistema rinnova automaticamente i token senza interrompere l'esperienza utente

### Implementazione Frontend - Servizio Site (`site/src/app/services/auth.service.ts`)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  public user = signal<User | null>(null);  // Angular Signals per reattività
  user$ = this.user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    // Verifica automatica dello stato di autenticazione all'avvio
    this.http
      .get<User>('/api/users/profile', { withCredentials: true })
      .pipe(
        catchError((error) => {
          if (error.status === 401) {
            return of(null);
          }
          return of(null);
        })
      )
      .subscribe((user) => this.user.set(user));
  }

  login(email: string, password: string) {
    return this.http
      .post<{ roles: string[] }>('/api/users/login', { email, password }, 
            { withCredentials: true })
      .pipe(
        switchMap(() => 
          this.http.get<User>('/api/users/profile', { withCredentials: true })
        ),
        tap((user) => this.user.set(user))
      );
  }
}
```

### Differenze tra Site e Dashboard
Il servizio nel **Dashboard** utilizza `BehaviorSubject` (approccio classico RxJS), mentre il **Site** utilizza Angular **Signals** (approccio moderno Angular 19):

- **Site**: `public user = signal<User | null>(null)`
- **Dashboard**: `private userSub = new BehaviorSubject<User | null>(null)`

---

## Sistema di Prenotazione Posti con Scadenza Automatica {#sistema-prenotazione-posti}

### Innovazione del Sistema
Una delle caratteristiche più avanzate del progetto è il **sistema di prenotazione temporanea dei posti** con scadenza automatica di 15 minuti, simile ai sistemi utilizzati da compagnie aeree reali.

### Modello Mongoose con Logica Temporale (`backend/models/SeatReservation.js`)

```javascript
const seatReservationSchema = new mongoose.Schema({
    expiresAt: {
        type: Date,
        required: function() {
            return this.status === "reserved";  // Richiesto solo per prenotazioni attive
        },
    }
}, { timestamps: true });

// Pre-hook per impostare automaticamente la scadenza
seatReservationSchema.pre("save", function (next) {
    if (this.isNew && !this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);  // 15 minuti
    }
    next();
});

// Metodi istanza per gestione temporale
seatReservationSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

seatReservationSchema.methods.extendReservation = function (minutes = 15) {
    this.expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    return this.save();
};

// Metodo statico per pulizia automatica
seatReservationSchema.statics.cleanExpiredReservations = async function () {
    const result = await this.deleteMany({
        expiresAt: { $lt: new Date() },
        status: "reserved",
    });
    return result.deletedCount;
};
```

### Controller con Logica Avanzata (`backend/controllers/seatController.js`)

```javascript
const getFlightSeats = async (req, res) => {
    const { flightId } = req.params;
    
    const flight = await Flight.findById(flightId).populate({
        path: "plane",
        select: "cabinConfiguration seatsConfiguration totalRows maxSeatsPerRow",
    });

    // Recupera tutte le prenotazioni attive (incluse quelle scadute da pulire)
    const reservations = await SeatReservation.find({
        flight: flightId,
        status: { $in: ["reserved", "confirmed"] },
    });

    // Crea mappa dei posti occupati con stato dettagliato
    const occupiedSeats = new Map();
    reservations.forEach((reservation) => {
        const key = `${reservation.seatRow}-${reservation.seatNumber}`;
        occupiedSeats.set(key, {
            status: reservation.status,
            userId: reservation.user,
            price: reservation.price,
        });
    });

    // Genera configurazione dinamica posti con pricing intelligente
    const seatsByRows = flight.plane.getSeatsByRows();
    Object.keys(seatsByRows).forEach((row) => {
        seatsByRows[row].forEach((seat) => {
            const key = `${seat.row}-${seat.number}`;
            const reservation = occupiedSeats.get(key);

            if (reservation) {
                seat.isReserved = true;
                seat.reservationStatus = reservation.status;
            } else {
                seat.isReserved = false;
                // Pricing dinamico: 10% del prezzo base del volo
                const basePrice = seat.seatClass === "first" ? 
                    flight.firstClassPrice : flight.price;
                seat.price = Math.round(basePrice * 0.1 * 100) / 100;
            }
        });
    });
};
```

### Peculiarità Tecniche

1. **Indices Composti**: Previene prenotazioni duplicate con indice `{flight: 1, seatRow: 1, seatNumber: 1}`
2. **TTL automatico**: MongoDB può essere configurato per eliminare automaticamente documenti scaduti
3. **Pricing Dinamico**: Calcolo intelligente del prezzo basato sulla classe e sul volo base
4. **Gestione Stati**: Sistema a stati (`reserved` → `confirmed` → `cancelled`) con transizioni controllate

---

## Architettura Angular 19 Standalone Components {#architettura-angular-standalone}

### Rivoluzione Architettturale
Il progetto utilizza completamente l'architettura **Standalone Components** di Angular 19, eliminando la necessità di NgModules tradizionali.

### Configurazione Bootstrap (`site/src/main.ts`)

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Bootstrap diretto senza NgModule
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

### Configurazione Applicazione (`site/src/app/app.config.ts`)

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),  // Ottimizzazione performance
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

### Componente Standalone Avanzato (`site/src/app/components/seat-selector/seat-selector.component.ts`)

```typescript
@Component({
  selector: 'app-seat-selector',
  standalone: true,                    // Componente autonomo
  imports: [CommonModule],             // Import diretti delle dipendenze
  template: `
    <!-- Template con Angular Control Flow (nuovo in Angular 19) -->
    @for (row of seatRows(); track row) {
      <div class="flex items-center justify-center gap-2">
        <span class="w-8 text-center font-semibold text-gray-600">{{ row }}</span>
        <div class="flex gap-1">
          @for (seat of getSeatsForRow(row); track seat.number) {
            <button
              (click)="selectSeat(seat)"
              [disabled]="!isSeatAvailable(seat)"
              [class]="getSeatClass(seat)"
              class="w-10 h-10 rounded-lg font-semibold text-sm transition-all">
              {{ seat.number }}
            </button>
          }
        </div>
      </div>
    }
  `,
})
export class SeatSelectorComponent {
  // Nuova API Input con required
  flightId = input.required<string>();
  
  // Dependency Injection con inject()
  seatService = inject(SeatReservationService);
  
  // Signals per gestione stato reattiva
  seats = signal<Record<string, any[]>>({});
  seatRows = computed(() => Object.keys(this.seats()));
  selectedClass = signal<'first' | 'economy'>('economy');
  selectedSeat = signal<any>(null);
}
```

### Vantaggi Architetturali

1. **Tree-shaking Ottimizzato**: Solo il codice effettivamente utilizzato viene incluso nel bundle
2. **Lazy Loading Granulare**: Ogni componente può essere caricato indipendentemente
3. **Dependency Injection Moderno**: Uso di `inject()` al posto del constructor injection
4. **Control Flow Template**: Sintassi `@for` e `@if` più pulita rispetto a `*ngFor` e `*ngIf`

---

## Gestione Reattiva dello Stato con Signals {#gestione-stato-signals}

### Signals: Il Futuro di Angular
Il progetto **Site** implementa completamente il nuovo sistema **Angular Signals**, mentre il **Dashboard** mantiene l'approccio classico con RxJS per confronto didattico.

### Implementazione Signals nel Site

```typescript
export class AuthService {
  // Signal writable per stato mutabile
  public user = signal<User | null>(null);
  
  // ReadOnly signal per esposizione pubblica
  user$ = this.user.asReadonly();

  // Getter che utilizza signals
  get currentUser(): User | null {
    return this.user();  // Chiamata funzionale invece di .value
  }

  get isLoggedIn(): boolean {
    return !!this.user();
  }

  // Metodo con side effects su signals
  login(email: string, password: string) {
    return this.http.post<{ roles: string[] }>('/api/users/login', 
                          { email, password }, { withCredentials: true })
      .pipe(
        switchMap(() => 
          this.http.get<User>('/api/users/profile', { withCredentials: true })
        ),
        tap((user) => {
          this.user.set(user);  // Aggiornamento signal
        })
      );
  }
}
```

### Implementazione nel Componente Seat Selector

```typescript
export class SeatSelectorComponent {
  // Signals per stato locale
  seats = signal<Record<string, any[]>>({});
  selectedClass = signal<'first' | 'economy'>('economy');
  selectedSeat = signal<any>(null);
  
  // Computed signals per valori derivati
  seatRows = computed(() => Object.keys(this.seats()));
  
  // Logica reattiva nel template
  isSeatAvailable(seat: any): boolean {
    return seat.seatClass === this.selectedClass() && !seat.isReserved;
  }

  getSeatClass(seat: any): string {
    if (seat.isReserved) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }

    if (seat.seatClass !== this.selectedClass()) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    // Controllo reattivo dello stato del posto selezionato
    if (this.selectedSeat() && 
        this.selectedSeat().row === seat.row && 
        this.selectedSeat().number === seat.number) {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }

    return 'bg-green-500 text-white hover:bg-green-600';
  }
}
```

### Vantaggi dei Signals

1. **Performance**: Aggiornamenti granulari solo delle parti del DOM che dipendono dai signals modificati
2. **Semplicità**: Sintassi più semplice rispetto a BehaviorSubject/Observable
3. **Type Safety**: TypeScript inference migliorato
4. **Debugging**: Tracciamento più semplice dei cambi di stato

---

## Sistema di Autorizzazione Multi-Ruolo {#sistema-autorizzazione}

### Architettura a Ruoli Gerarchici
Il sistema implementa un'autorizzazione sofisticata con ruoli gerarchici e scoping per airline:

- **admin**: Accesso globale a tutto il sistema
- **manager**: Gestione completa della propria airline
- **employee**: Operazioni limitate nella propria airline  
- **customer**: Accesso solo alle funzioni di prenotazione

### Middleware Backend Graduato

```javascript
// Protezione base - richiede autenticazione
const protect = async (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select("name email roles airlines");
    next();
};

// Solo amministratori globali
const adminOnly = (req, res, next) => {
    if (req.user && req.user.roles.includes("admin")) {
        next();
    } else {
        res.status(403).json({ message: "Admin access required" });
    }
};

// Accesso gerarchico: employee, manager o admin
const employeeOrAdmin = (req, res, next) => {
    if (req.user && (
        req.user.roles.includes("admin") ||
        req.user.roles.includes("employee") ||
        req.user.roles.includes("manager")
    )) {
        next();
    } else {
        res.status(403).json({ 
            message: "Admin, employee, or manager access required" 
        });
    }
};

// Management level: manager o admin
const adminOrManager = (req, res, next) => {
    if (req.user && (
        req.user.roles.includes("admin") || 
        req.user.roles.includes("manager")
    )) {
        next();
    } else {
        res.status(403).json({ message: "Admin or manager access required" });
    }
};
```

### Controllo Ruoli nei Servizi Frontend

```typescript
export class AuthService {
  // Metodo flessibile per controllo ruoli multipli
  hasRole(...allowed: string[]): boolean {
    const roles = this.user()?.roles || [];
    return allowed.some((r) => roles.includes(r));
  }
  
  // Utilizzo nei componenti:
  // if (this.auth.hasRole('admin', 'manager')) { ... }
}
```

---

## Guard Avanzate per la Protezione delle Route {#guard-protezione-route}

### Implementazione Sofisticata della Guard

```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.auth.loading$.pipe(
      filter((loading) => !loading),    // Aspetta il completamento del caricamento
      take(1),
      switchMap(() => this.auth.user$),
      take(1),
      map((user) => {
        // Controllo autenticazione base
        if (!user) {
          return this.router.parseUrl('/login');
        }

        // Gestione password obbligatoria al primo accesso
        if (user.passwordMustChange && 
            route.routeConfig?.path !== 'first-login') {
          return this.router.parseUrl('/first-login');
        }

        // Controllo ruoli specifici definiti nelle route
        const allowed = route.data['roles'] as string[] | undefined;
        if (allowed && !this.auth.hasRole(...allowed)) {
          return this.router.parseUrl('/');
        }
        
        return true;
      })
    );
  }
}
```

### Peculiarità Tecniche Avanzate

1. **Lazy Loading Awareness**: La guard attende il caricamento completo dello stato prima di valutare
2. **UrlTree Returns**: Restituisce oggetti UrlTree per navigazioni programmatiche invece di booleani
3. **Route Data Integration**: Legge i ruoli richiesti direttamente dalla configurazione della route
4. **First Login Flow**: Gestisce il flusso di primo accesso con cambio password obbligatorio

### Configurazione Route con Ruoli

```typescript
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component'),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] }  // Definizione ruoli richiesti
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component'),
    canActivate: [AuthGuard], 
    data: { roles: ['admin', 'manager', 'employee'] }  // Ruoli multipli
  }
];
```

---

## Gestione Dinamica dei Posti Aereo {#gestione-dinamica-posti}

### Sistema di Configurazione Flessibile
Il progetto implementa un sistema estremamente flessibile per la gestione delle configurazioni degli aeromobili e dei posti.

### Logica di Generazione Posti Dinamica

```typescript
// Nel SeatSelectorComponent
getSeatsForRow(row: string): any[] {
    return this.seats()[row] || [];
}

// Logica di disponibilità con filtri multipli
isSeatAvailable(seat: any): boolean {
    return seat.seatClass === this.selectedClass() && !seat.isReserved;
}

// Styling dinamico basato su stato e classe
getSeatClass(seat: any): string {
    if (seat.isReserved) {
        return 'bg-gray-400 text-white cursor-not-allowed';
    }

    if (seat.seatClass !== this.selectedClass()) {
        return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    if (this.selectedSeat() && 
        this.selectedSeat().row === seat.row && 
        this.selectedSeat().number === seat.number) {
        return 'bg-blue-500 text-white hover:bg-blue-600';
    }

    return 'bg-green-500 text-white hover:bg-green-600';
}
```

### Template Control Flow Avanzato

```html
<!-- Nuovo Control Flow di Angular 19 -->
@for (row of seatRows(); track row) {
  <div class="flex items-center justify-center gap-2">
    <span class="w-8 text-center font-semibold text-gray-600">{{ row }}</span>
    <div class="flex gap-1">
      @for (seat of getSeatsForRow(row); track seat.number) {
        <button
          (click)="selectSeat(seat)"
          [disabled]="!isSeatAvailable(seat)"
          [class]="getSeatClass(seat)"
          class="w-10 h-10 rounded-lg font-semibold text-sm transition-all disabled:cursor-not-allowed">
          {{ seat.number }}
        </button>
      }
    </div>
  </div>
}

<!-- Informazioni posto selezionato con conditional rendering -->
@if (selectedSeat()) {
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
    <h5 class="font-semibold text-blue-800 mb-2">Selected Seat</h5>
    <div class="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span class="font-medium">Seat:</span> 
        {{ selectedSeat()?.row }}{{ selectedSeat()?.number }}
      </div>
      <div>
        <span class="font-medium">Class:</span>
        {{ selectedSeat()?.seatClass | titlecase }}
      </div>
      <div>
        <span class="font-medium">Type:</span>
        <span *ngIf="selectedSeat()?.isWindow">Window</span>
        <span *ngIf="selectedSeat()?.isAisle">Aisle</span>
        <span *ngIf="!selectedSeat()?.isWindow && !selectedSeat()?.isAisle">Middle</span>
      </div>
      <div>
        <span class="font-medium">Price:</span>
        {{ selectedSeat()?.price | currency : 'EUR' }}
      </div>
    </div>
  </div>
}
```

### Peculiarità del Sistema Posti

1. **Configurazione Aeromobile Flessibile**: Supporta diverse configurazioni di cabin (economy/first class)
2. **Pricing Intelligente**: Calcola automaticamente il prezzo dei posti basandosi su classe e tipo
3. **Real-time Updates**: I posti occupati/liberi si aggiornano in tempo reale
4. **Visual Feedback Avanzato**: Diversi stati visuali per disponibile/occupato/selezionato/non disponibile per classe

---

## Conclusioni

Il progetto Aviato rappresenta un esempio eccellente di applicazione moderna che combina:

- **Sicurezza Avanzata** con HTTP-Only Cookies e JWT
- **Architettura Moderna** con Angular 19 Standalone Components
- **Reattività** tramite Signals e RxJS
- **Business Logic Complessa** con sistema di prenotazioni temporanee
- **UX Sofisticata** con interfacce dinamiche e reattive

Queste implementazioni dimostrano padronanza di concetti avanzati sia nel backend (Node.js/Express/MongoDB) che nel frontend (Angular 19/TypeScript), con particolare attenzione a performance, sicurezza e esperienza utente.