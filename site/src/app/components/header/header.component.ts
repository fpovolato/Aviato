import { Component, inject } from '@angular/core';
import { PrimaryButtonComponent } from '../primary-button/primary-button.component';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PrimaryButtonComponent, RouterLink, CommonModule],
  template: `
    <header
      class="bg-white shadow-md border-b-2 border-blue-500 sticky top-0 z-50"
    >
      <div
        class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16"
      >
        <div class="flex items-center gap-2">
          <a routerLink="/" class="flex items-center gap-2">
            <img src="/assets/logo.svg" alt="Aviato Logo" class="h-15 w-auto" />
          </a>
        </div>
        <nav class="hidden md:flex gap-6 items-center">
          <a
            routerLink="/"
            routerLinkActive="font-bold text-blue-600"
            class="text-gray-700 hover:text-blue-600 transition"
            >Home</a
          >
          <a
            routerLink="/cart"
            class="relative text-gray-700 hover:text-blue-600 transition"
          >
            <span>Cart</span>
            <span
              class="absolute -top-2 -right-4 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow"
              >{{ cartService.cart().length }}</span
            >
          </a>
          <ng-container *ngIf="user() as u; else loginBtn">
            <a
              routerLink="/user"
              class="flex items-center gap-2 px-3 py-1 rounded hover:bg-blue-50 transition"
            >
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-bold text-lg"
              >
                {{ (u.name?.[0] || '') + (u.surname?.[0] || '') }}
              </span>
              <span class="font-semibold">{{ u.name }} {{ u.surname }}</span>
            </a>
          </ng-container>
          <ng-template #loginBtn>
            <app-primary-button
              label="Log In"
              routerLink="/login"
              class="ml-2"
            />
          </ng-template>
        </nav>
        <!-- Mobile menu button -->
        <button
          class="md:hidden flex items-center text-gray-700 hover:text-blue-600 focus:outline-none"
          (click)="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg
            class="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      <!-- Mobile menu -->
      <div
        *ngIf="mobileMenuOpen"
        class="md:hidden bg-white border-t border-blue-100 shadow px-4 pb-4"
      >
        <a routerLink="/" class="block py-2 text-gray-700 hover:text-blue-600"
          >Home</a
        >
        <a
          routerLink="/cart"
          class="block py-2 text-gray-700 hover:text-blue-600 relative"
        >
          Cart
          <span
            class="absolute -top-2 left-16 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold shadow"
            >{{ cartService.cart().length }}</span
          >
        </a>
        <ng-container *ngIf="user() as u; else loginBtnMobile">
          <a routerLink="/user" class="flex items-center gap-2 py-2">
            <span
              class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 font-bold text-lg"
              >{{ (u.name?.[0] || '') + (u.surname?.[0] || '') }}</span
            >
            <span class="font-semibold">{{ u.name }} {{ u.surname }}</span>
          </a>
          <button
            (click)="logout()"
            class="w-full mt-2 bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded font-semibold"
          >
            Logout
          </button>
        </ng-container>
        <ng-template #loginBtnMobile>
          <app-primary-button
            label="Log In"
            routerLink="/login"
            class="mt-2 w-full"
          />
        </ng-template>
      </div>
    </header>
  `,
  styles: `
    header { transition: box-shadow 0.2s; box-shadow: 0 2px 8px 0 rgb(0 0 0 / 0.04); }
    .active { font-weight: bold; color: #2563eb; }
  `,
})
export class HeaderComponent {
  cartService = inject(CartService);
  auth = inject(AuthService);
  router = inject(Router);
  mobileMenuOpen = false;
  user = this.auth.user;

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    this.mobileMenuOpen = false;
  }
}
