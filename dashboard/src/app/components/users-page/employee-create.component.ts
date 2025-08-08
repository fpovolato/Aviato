import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-employee-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-indigo-800">Create Employee</h2>
            <button
              (click)="goBack()"
              class="text-indigo-600 hover:text-indigo-500 font-semibold"
            >
              ← Back to Users
            </button>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-indigo-700 mb-2">
                  Name *
                </label>
                <input
                  [(ngModel)]="formData.name"
                  name="name"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-indigo-700 mb-2">
                  Surname *
                </label>
                <input
                  [(ngModel)]="formData.surname"
                  name="surname"
                  type="text"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Enter surname"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-indigo-700 mb-2">
                Email *
              </label>
              <input
                [(ngModel)]="formData.email"
                name="email"
                type="email"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-indigo-700 mb-2">
                Birth Date *
              </label>
              <input
                [(ngModel)]="formData.birthDate"
                name="birthDate"
                type="date"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-indigo-700 mb-2">
                Password *
              </label>
              <input
                [(ngModel)]="formData.password"
                name="password"
                type="password"
                required
                minlength="8"
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Enter password (min 8 characters)"
              />
            </div>

            <div *ngIf="error" class="text-red-500 text-sm">
              {{ error }}
            </div>

            <div class="flex gap-4 pt-4">
              <button
                type="submit"
                [disabled]="loading"
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white px-6 py-3 rounded-lg font-semibold shadow"
              >
                {{ loading ? 'Creating...' : 'Create Employee' }}
              </button>
              <button
                type="button"
                (click)="goBack()"
                [disabled]="loading"
                class="flex-1 bg-gray-300 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold shadow"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class EmployeeCreateComponent {
  formData = {
    name: '',
    surname: '',
    email: '',
    birthDate: '',
    password: '',
  };

  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  onSubmit() {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.http.post('/api/users/employees', this.formData).subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.error = error.error?.message || 'Error creating employee';
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
