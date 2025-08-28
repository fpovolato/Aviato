import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <aside class="h-full bg-gray-800 text-white w-64 p-4 flex flex-col">
      <div class="mb-6 flex justify-center">
        <img src="assets/logo_white.svg" alt="Logo" class="h-40 w-auto" />
      </div>
      <nav class="flex-1 space-y-2">
        <a routerLink="/" class="block px-3 py-2 rounded hover:bg-gray-700"
          >Home</a
        >
        <a routerLink="/user" class="block px-3 py-2 rounded hover:bg-gray-700"
          >User</a
        >
        <a
          routerLink="/flights"
          class="block px-3 py-2 rounded hover:bg-gray-700"
          >Flights</a
        >
        <a
          routerLink="/routes"
          class="block px-3 py-2 rounded hover:bg-gray-700"
          >Routes</a
        >
        <a
          (click)="onAirlinesClick($event)"
          class="block px-3 py-2 rounded hover:bg-gray-700"
          >Airlines</a
        >
        <a
          (click)="onPlanesClick($event)"
          class="block px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >Aircraft</a
        >
        <a
          (click)="onUsersClick($event)"
          class="block px-3 py-2 rounded hover:bg-gray-700 cursor-pointer"
          >Roles</a
        >
      </nav>
      <button
        (click)="onLogout()"
        class="mt-auto bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </aside>
  `,
  styles: ``,
})
export class SidebarComponent {
  isAdmin = false;
  isManager = false;
  constructor(private auth: AuthService, private router: Router) {
    this.auth.user$.subscribe((user) => {
      const roles = Array.isArray(user?.roles)
        ? user.roles.map((r) => (r + '').toLowerCase())
        : [];
      this.isAdmin = roles.includes('admin');
      this.isManager = roles.includes('manager');
    });
  }

  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onUsersClick(event: Event) {
    if (!this.isAdmin && !this.isManager) {
      event.preventDefault();
      alert('Access allowed only for admins and managers.');
    } else {
      this.router.navigate(['/users']);
    }
  }

  onAirlinesClick(event: Event) {
    if (!this.isAdmin) {
      event.preventDefault();
      alert('Access allowed only for admins.');
    } else {
      this.router.navigate(['/airlines']);
    }
  }

  onPlanesClick(event: Event) {
    if (!this.isAdmin && !this.isManager) {
      event.preventDefault();
      alert('Access allowed only for admins and managers.');
    } else {
      this.router.navigate(['/planes']);
    }
  }
}
