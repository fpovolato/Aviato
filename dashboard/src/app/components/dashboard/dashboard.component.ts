import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <app-sidebar></app-sidebar>
      <div class="flex flex-col flex-1 min-h-screen">
        <header class="flex items-center justify-between bg-white/80 backdrop-blur border-b shadow-md px-8 py-4">
          <div>
            <h1 class="text-3xl font-extrabold tracking-tight text-indigo-700 drop-shadow-sm">Aviato Dashboard</h1>
            <p class="text-sm text-gray-500 mt-1">Your central hub for management</p>
          </div>
          <div *ngIf="user" class="flex items-center gap-4">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-200 text-indigo-800 font-bold text-xl shadow-inner">
              {{ user.name.charAt(0) }}{{ user.surname.charAt(0) }}
            </div>
            <div class="text-right">
              <div class="font-semibold text-lg">{{ user.name }} {{ user.surname }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
              <div class="text-xs text-gray-400">Roles: {{ user.roles.join(', ') }}</div>
            </div>
          </div>
        </header>
        <main class="flex-1 flex flex-col items-center justify-center p-10">
          <div class="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100">
            <h2 class="text-2xl font-bold text-indigo-800 mb-2 flex items-center gap-2">
              <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"/></svg>
              Welcome, {{ user?.name || 'User' }}!
            </h2>
            <p class="text-lg text-gray-700 mb-4">This is your personalized dashboard. We're glad to have you back! </p>
            <ul class="mt-6 space-y-2">
              <li class="flex items-center gap-2 text-gray-600"><span class="font-semibold text-indigo-600">•</span> Use the sidebar to navigate through different sections.</li>
              <li class="flex items-center gap-2 text-gray-600"><span class="font-semibold text-indigo-600">•</span> Manage flights, users, and more with ease.</li>
              <li class="flex items-center gap-2 text-gray-600"><span class="font-semibold text-indigo-600">•</span> Enjoy a seamless experience!</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host ::ng-deep body {
      background: linear-gradient(135deg, #e0e7ff 0%, #fff 50%, #bae6fd 100%);
    }
  `,
})
export class DashboardComponent {
  user: User | null = null;

  constructor(private auth: AuthService) {
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });
  }
}
