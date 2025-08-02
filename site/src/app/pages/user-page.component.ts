import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12"
    >
      <div
        class="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <h2
          class="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg
            class="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          User Details
        </h2>
        <ng-container *ngIf="user() as u; else notLogged">
          <div class="mb-4">
            <div class="font-semibold text-lg">
              {{ u.name }} {{ u.surname }}
            </div>
            <div class="text-sm text-gray-500">{{ u.email }}</div>
            <div class="text-xs text-gray-400 mb-2">
              Roles: {{ u.roles.join(', ') }}
            </div>
          </div>
          <div *ngIf="u.airlines?.length">
            <h3 class="text-lg font-semibold text-blue-700 mb-2">
              Your Airlines
            </h3>
            <ul class="space-y-2">
              <li
                *ngFor="let airline of u.airlines"
                class="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3 shadow-sm"
              >
                <span class="font-bold text-blue-700">{{ airline.name }}</span>
                <span
                  class="ml-auto text-xs bg-blue-200 text-blue-800 rounded px-2 py-0.5"
                  >{{ airline.code }}</span
                >
              </li>
            </ul>
          </div>
          <button
            (click)="logout()"
            class="mt-8 w-full bg-red-500 hover:bg-red-400 text-white px-5 py-2 rounded-lg font-semibold shadow"
          >
            Logout
          </button>
        </ng-container>
        <ng-template #notLogged>
          <div class="text-gray-400 italic text-center">
            You are not logged in.
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: '',
})
export class UserPageComponent {
  auth = inject(AuthService);
  router = inject(Router);
  user = computed(() => this.auth.currentUser);

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
