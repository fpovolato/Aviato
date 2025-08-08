import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-manager-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-indigo-800">Create Manager</h2>
            <button
              (click)="goBack()"
              class="text-indigo-600 hover:text-indigo-500 font-semibold"
            >
              ← Back to Users
            </button>
          </div>

          <!-- Manager Invitation Notice -->
          <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg
                  class="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  Manager Invitation
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p>
                    Managers are created by invitation only. The manager will
                    receive a temporary password and must change it at their
                    first login.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form
            (ngSubmit)="onSubmit()"
            #managerForm="ngForm"
            class="flex flex-col gap-6"
          >
            <div>
              <label class="block mb-1 font-semibold text-indigo-700"
                >Email *</label
              >
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                [class.border-red-300]="
                  managerForm.submitted && (!email || !isValidEmail(email))
                "
              />
              <div
                *ngIf="managerForm.submitted && !email"
                class="text-red-500 text-xs mt-1"
              >
                Email is required
              </div>
              <div
                *ngIf="managerForm.submitted && email && !isValidEmail(email)"
                class="text-red-500 text-xs mt-1"
              >
                Please enter a valid email address
              </div>
            </div>

            <!-- Airline Creation -->
            <div class="space-y-4">
              <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <svg
                      class="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800">
                      New Airline Creation
                    </h3>
                    <div class="mt-2 text-sm text-yellow-700">
                      <p>
                        Creating a manager will also create a new airline for
                        them to manage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block mb-1 font-semibold text-indigo-700"
                    >Airline Name *</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="airlineName"
                    name="airlineName"
                    required
                    class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    [class.border-red-300]="
                      managerForm.submitted && !airlineName
                    "
                  />
                  <div
                    *ngIf="managerForm.submitted && !airlineName"
                    class="text-red-500 text-xs mt-1"
                  >
                    Airline name is required
                  </div>
                </div>

                <div>
                  <label class="block mb-1 font-semibold text-indigo-700"
                    >Airline Code *</label
                  >
                  <input
                    type="text"
                    [(ngModel)]="airlineCode"
                    name="airlineCode"
                    required
                    maxlength="3"
                    class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 uppercase"
                    [class.border-red-300]="
                      managerForm.submitted && !airlineCode
                    "
                    (input)="onAirlineCodeInput($event)"
                  />
                  <div
                    *ngIf="managerForm.submitted && !airlineCode"
                    class="text-red-500 text-xs mt-1"
                  >
                    Airline code is required (3 characters)
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-indigo-700"
                >Temporary Password *</label
              >
              <input
                type="password"
                [(ngModel)]="temporaryPassword"
                name="temporaryPassword"
                required
                minlength="6"
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                [class.border-red-300]="
                  managerForm.submitted &&
                  (!temporaryPassword || temporaryPassword.length < 6)
                "
              />
              <div class="text-xs text-gray-600 mt-1">
                The manager will be required to change this password at their
                first login.
              </div>
              <div
                *ngIf="managerForm.submitted && !temporaryPassword"
                class="text-red-500 text-xs mt-1"
              >
                Temporary password is required
              </div>
              <div
                *ngIf="
                  managerForm.submitted &&
                  temporaryPassword &&
                  temporaryPassword.length < 6
                "
                class="text-red-500 text-xs mt-1"
              >
                Temporary password must be at least 6 characters
              </div>
            </div>

            <div
              *ngIf="error"
              class="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div class="text-red-700 text-sm">{{ error }}</div>
            </div>

            <div class="flex gap-3 mt-4">
              <button
                type="submit"
                [disabled]="
                  managerForm.invalid ||
                  loading ||
                  !airlineName ||
                  !airlineCode ||
                  !temporaryPassword
                "
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Creating Manager...' : 'Create Manager' }}
              </button>
              <button
                type="button"
                (click)="goBack()"
                class="flex-1 bg-gray-300 hover:bg-gray-200 text-gray-800 px-5 py-3 rounded-lg font-semibold"
                [disabled]="loading"
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
export class ManagerCreateComponent {
  email = '';
  airlineName = '';
  airlineCode = '';
  temporaryPassword = '';
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  onAirlineCodeInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.airlineCode = target.value.toUpperCase();
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const managerData = {
      email: this.email,
      temporaryPassword: this.temporaryPassword,
      airlineName: this.airlineName,
      airlineCode: this.airlineCode,
    };

    this.http.post('/api/users/managers', managerData).subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.error =
          err?.error?.message || 'Failed to create manager. Please try again.';
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
