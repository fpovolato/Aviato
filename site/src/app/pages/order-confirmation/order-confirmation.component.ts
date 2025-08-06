import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8"
    >
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="mb-4">
            <svg
              class="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            Ordine Completato!
          </h1>
          <p class="text-gray-600">
            Grazie per aver scelto Aviato. Il tuo ordine è stato confermato.
          </p>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"
            ></div>
            <span class="ml-3 text-gray-600">Caricamento ordine...</span>
          </div>
        </div>
        } @else if (order && order.items) {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">
            Dettagli Ordine
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="font-semibold text-gray-700 mb-2">
                Informazioni Ordine
              </h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Numero Ordine:</span>
                  <span class="font-medium">{{ order._id }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Stato:</span>
                  <span class="font-medium text-green-600">{{
                    order.status
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Data:</span>
                  <span class="font-medium">{{
                    order.purchasedAt | date : 'medium'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Metodo di Pagamento:</span>
                  <span class="font-medium">{{ order.paymentMethod }}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="font-semibold text-gray-700 mb-2">Riepilogo</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Totale:</span>
                  <span class="font-bold text-xl text-green-600">{{
                    order.total | currency : 'EUR'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Numero Voli:</span>
                  <span class="font-medium">{{ order.items.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Items -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">I Tuoi Voli</h2>

          <div class="space-y-4">
            @for (item of order.items; track item.flight) {
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-800">
                    @if (item.flight && typeof item.flight === 'object') {
                    {{ item.flight.from }} → {{ item.flight.to }} } @else { Volo
                    {{ item.flight }}
                    }
                  </h3>
                  <p class="text-sm text-gray-600">
                    @if (item.flight && typeof item.flight === 'object') {
                    {{ item.flight.airline }} •
                    {{ item.quantity }} passeggero(s) •
                    {{ item.priceAtPurchase | currency : 'EUR' }} cadauno }
                    @else { {{ item.quantity }} passeggero(s) •
                    {{ item.priceAtPurchase | currency : 'EUR' }} cadauno }
                  </p>
                </div>
                <div class="text-right">
                  <div class="font-bold text-gray-900">
                    {{
                      item.quantity * item.priceAtPurchase | currency : 'EUR'
                    }}
                  </div>
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        } @else {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div class="text-center py-8">
            <p class="text-gray-600">
              Ordine non trovato o errore nel caricamento.
            </p>
          </div>
        </div>
        }

        <!-- Actions -->
        <div class="flex justify-center gap-4">
          <button
            (click)="goHome()"
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Torna alla Home
          </button>
          <button
            (click)="viewOrders()"
            class="px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-colors"
          >
            I Miei Ordini
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order: any = null;
  isLoading = true;

  ngOnInit() {
    // Recupera l'ID dell'ordine dai parametri della route
    this.route.params.subscribe((params) => {
      const orderId = params['orderId'];
      if (orderId) {
        // Recupera l'ordine effettivo dal backend
        this.orderService.getOrderById(orderId).subscribe({
          next: (order) => {
            this.order = order;
            this.isLoading = false;
          },
          error: (error) => {
            console.error("Errore nel recupero dell'ordine:", error);
            // Fallback a un ordine mock in caso di errore
            this.order = {
              _id: orderId,
              status: 'Completed',
              purchasedAt: new Date(),
              paymentMethod: 'Credit Card',
              total: 0,
              items: [],
            };
            this.isLoading = false;
          },
        });
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }

  viewOrders() {
    this.router.navigate(['/user']);
  }
}
