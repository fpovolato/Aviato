import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Airline {
  _id: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-users-create',
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
            <h2 class="text-2xl font-bold text-indigo-800">Create User</h2>
            <button
              (click)="goBack()"
              class="text-indigo-600 hover:text-indigo-500 font-semibold"
            >
              ← Back to Users
            </button>
          </div>

          <form
            (ngSubmit)="onSubmit()"
            #userForm="ngForm"
            class="flex flex-col gap-6"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-indigo-700"
                  >Name *</label
                >
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  [class.border-red-300]="userForm.submitted && !name"
                />
                <div
                  *ngIf="userForm.submitted && !name"
                  class="text-red-500 text-xs mt-1"
                >
                  Name is required
                </div>
              </div>

              <div>
                <label class="block mb-1 font-semibold text-indigo-700"
                  >Surname *</label
                >
                <input
                  type="text"
                  [(ngModel)]="surname"
                  name="surname"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  [class.border-red-300]="userForm.submitted && !surname"
                />
                <div
                  *ngIf="userForm.submitted && !surname"
                  class="text-red-500 text-xs mt-1"
                >
                  Surname is required
                </div>
              </div>
            </div>

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
                  userForm.submitted && (!email || !isValidEmail(email))
                "
              />
              <div
                *ngIf="userForm.submitted && !email"
                class="text-red-500 text-xs mt-1"
              >
                Email is required
              </div>
              <div
                *ngIf="userForm.submitted && email && !isValidEmail(email)"
                class="text-red-500 text-xs mt-1"
              >
                Please enter a valid email address
              </div>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-indigo-700"
                >Birth Date *</label
              >
              <input
                type="date"
                [(ngModel)]="birthDate"
                name="birthDate"
                required
                [max]="maxDate"
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                [class.border-red-300]="userForm.submitted && !birthDate"
              />
              <div
                *ngIf="userForm.submitted && !birthDate"
                class="text-red-500 text-xs mt-1"
              >
                Birth date is required
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block mb-1 font-semibold text-indigo-700"
                  >Role *</label
                >
                <select
                  [(ngModel)]="role"
                  name="role"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  (ngModelChange)="onRoleChange()"
                >
                  <option value="customer">Customer</option>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label class="block mb-1 font-semibold text-indigo-700">
                  Airline
                  <span *ngIf="airlineRequired" class="text-red-500">*</span>
                  <span *ngIf="!airlineRequired" class="text-gray-400"
                    >(optional)</span
                  >
                </label>
                <select
                  [(ngModel)]="airlineId"
                  name="airline"
                  [required]="airlineRequired"
                  class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  [class.border-red-300]="
                    userForm.submitted && airlineRequired && !airlineId
                  "
                >
                  <option value="">Select an airline</option>
                  <option *ngFor="let a of airlines" [value]="a._id">
                    {{ a.name }} ({{ a.code }})
                  </option>
                </select>
                <div
                  *ngIf="userForm.submitted && airlineRequired && !airlineId"
                  class="text-red-500 text-xs mt-1"
                >
                  Airline is required for employees
                </div>
              </div>
            </div>

            <div>
              <label class="block mb-1 font-semibold text-indigo-700"
                >Password *</label
              >
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                [class.border-red-300]="
                  userForm.submitted && (!password || password.length < 6)
                "
              />
              <div
                *ngIf="userForm.submitted && !password"
                class="text-red-500 text-xs mt-1"
              >
                Password is required
              </div>
              <div
                *ngIf="userForm.submitted && password && password.length < 6"
                class="text-red-500 text-xs mt-1"
              >
                Password must be at least 6 characters
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
                  userForm.invalid || loading || (airlineRequired && !airlineId)
                "
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-lg font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Creating User...' : 'Create User' }}
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
export class UsersCreateComponent implements OnInit {
  name = '';
  surname = '';
  email = '';
  birthDate = '';
  role = 'customer';
  airlineId = '';
  password = '';
  airlines: Airline[] = [];
  loading = false;
  error = '';
  maxDate = new Date().toISOString().split('T')[0]; // Today's date

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<Airline[]>('/api/airlines').subscribe({
      next: (airlines) => {
        this.airlines = airlines;
      },
      error: () => {
        this.airlines = [];
      },
    });
  }

  onRoleChange() {
    // Reset airline selection when role changes
    if (this.role !== 'employee') {
      this.airlineId = '';
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    this.loading = true;
    this.error = '';

    const userData: any = {
      name: this.name,
      surname: this.surname,
      email: this.email,
      birthDate: this.birthDate,
      password: this.password,
    };

    if (this.role) userData.roles = [this.role];
    if (this.airlineId) userData.airlines = [this.airlineId];

    this.http.post('/api/users/register', userData).subscribe({
      next: () => {
        this.router.navigate(['/users']);
      },
      error: (err) => {
        this.error =
          err?.error?.message || 'Failed to create user. Please try again.';
        this.loading = false;
      },
    });
  }

  get airlineRequired() {
    return this.role === 'employee';
  }

  goBack() {
    this.router.navigate(['/users']);
  }
}
