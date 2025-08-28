import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-first-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100 flex items-center justify-center p-4"
    >
      <div
        class="w-full max-w-md bg-white/90 rounded-2xl shadow-xl p-8 border border-indigo-100"
      >
        <div class="text-center mb-8">
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"
          >
            <svg
              class="h-6 w-6 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-indigo-800 mb-2">Welcome!</h2>
          <p class="text-gray-600">Please complete your profile setup</p>
        </div>

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
                First Login Required
              </h3>
              <div class="mt-2 text-sm text-blue-700">
                <p>
                  You must change your temporary password and complete your
                  profile information.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          (ngSubmit)="onSubmit()"
          #firstLoginForm="ngForm"
          class="space-y-6"
        >
          <div>
            <label class="block mb-1 font-semibold text-indigo-700">
              Current Password *
            </label>
            <input
              type="password"
              [(ngModel)]="currentPassword"
              name="currentPassword"
              required
              class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              [class.border-red-300]="
                firstLoginForm.submitted && !currentPassword
              "
            />
            <div
              *ngIf="firstLoginForm.submitted && !currentPassword"
              class="text-red-500 text-xs mt-1"
            >
              Current password is required
            </div>
          </div>

          <div>
            <label class="block mb-1 font-semibold text-indigo-700">
              New Password *
            </label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              minlength="6"
              class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              [class.border-red-300]="
                firstLoginForm.submitted &&
                (!newPassword || newPassword.length < 6)
              "
            />
            <div
              *ngIf="firstLoginForm.submitted && !newPassword"
              class="text-red-500 text-xs mt-1"
            >
              New password is required
            </div>
            <div
              *ngIf="
                firstLoginForm.submitted &&
                newPassword &&
                newPassword.length < 6
              "
              class="text-red-500 text-xs mt-1"
            >
              Password must be at least 6 characters
            </div>
          </div>

          <div>
            <label class="block mb-1 font-semibold text-indigo-700">
              Confirm New Password *
            </label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              [class.border-red-300]="
                firstLoginForm.submitted &&
                (!confirmPassword || confirmPassword !== newPassword)
              "
            />
            <div
              *ngIf="firstLoginForm.submitted && !confirmPassword"
              class="text-red-500 text-xs mt-1"
            >
              Please confirm your new password
            </div>
            <div
              *ngIf="
                firstLoginForm.submitted &&
                confirmPassword &&
                confirmPassword !== newPassword
              "
              class="text-red-500 text-xs mt-1"
            >
              Passwords do not match
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">
                Name *
              </label>
              <input
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                [class.border-red-300]="firstLoginForm.submitted && !name"
              />
              <div
                *ngIf="firstLoginForm.submitted && !name"
                class="text-red-500 text-xs mt-1"
              >
                Name is required
              </div>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-indigo-700">
                Surname *
              </label>
              <input
                type="text"
                [(ngModel)]="surname"
                name="surname"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                [class.border-red-300]="firstLoginForm.submitted && !surname"
              />
              <div
                *ngIf="firstLoginForm.submitted && !surname"
                class="text-red-500 text-xs mt-1"
              >
                Surname is required
              </div>
            </div>
          </div>

          <div>
            <label class="block mb-1 font-semibold text-indigo-700">
              Birth Date *
            </label>
            <input
              type="date"
              [(ngModel)]="birthDate"
              name="birthDate"
              required
              [max]="maxDate"
              class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              [class.border-red-300]="firstLoginForm.submitted && !birthDate"
            />
            <div
              *ngIf="firstLoginForm.submitted && !birthDate"
              class="text-red-500 text-xs mt-1"
            >
              Birth date is required
            </div>
          </div>

          <div
            *ngIf="error"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="text-red-700 text-sm">{{ error }}</div>
          </div>

          <button
            type="submit"
            [disabled]="
              firstLoginForm.invalid ||
              loading ||
              confirmPassword !== newPassword
            "
            class="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Updating Profile...' : 'Complete Setup' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: ``,
})
export class FirstLoginComponent implements OnInit {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  name = '';
  surname = '';
  birthDate = '';
  loading = false;
  error = '';
  maxDate = new Date().toISOString().split('T')[0];

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      if (!user.passwordMustChange) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.name = user.name || '';
      this.surname = user.surname || '';
      this.birthDate = user.birthDate
        ? new Date(user.birthDate).toISOString().split('T')[0]
        : '';
    });
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const updateData = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      name: this.name,
      surname: this.surname,
      birthDate: this.birthDate,
    };

    this.http.post('/api/users/first-login', updateData).subscribe({
      next: () => {
        this.auth.refreshUser();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error =
          err?.error?.message || 'Failed to update profile. Please try again.';
        this.loading = false;
      },
    });
  }
}
