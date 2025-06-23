import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Airline { _id: string; name: string; code: string; }

@Component({
  selector: 'app-users-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div class="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100">
          <h2 class="text-2xl font-bold text-indigo-800 mb-6">Create User</h2>
          <form (ngSubmit)="onSubmit()" #userForm="ngForm" class="flex flex-col gap-6">
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Name</label>
              <input type="text" [(ngModel)]="name" name="name" required class="w-full px-4 py-2 rounded-lg border border-indigo-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Surname</label>
              <input type="text" [(ngModel)]="surname" name="surname" required class="w-full px-4 py-2 rounded-lg border border-indigo-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Email</label>
              <input type="email" [(ngModel)]="email" name="email" required class="w-full px-4 py-2 rounded-lg border border-indigo-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Birth Date</label>
              <input type="date" [(ngModel)]="birthDate" name="birthDate" required class="w-full px-4 py-2 rounded-lg border border-indigo-200" />
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Role</label>
              <select [(ngModel)]="role" name="role" required class="w-full px-4 py-2 rounded-lg border border-indigo-200">
                <option value="customer">Customer</option>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Airline <span *ngIf="airlineRequired" class="text-red-500">*</span></label>
              <select [(ngModel)]="airlineId" name="airline" [required]="airlineRequired" class="w-full px-4 py-2 rounded-lg border border-indigo-200">
                <option value="">None</option>
                <option *ngFor="let a of airlines" [value]="a._id">{{ a.name }} ({{ a.code }})</option>
              </select>
              <div *ngIf="airlineRequired && !airlineId && userForm.submitted" class="text-red-500 text-xs mt-1">Airline is required for employees.</div>
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required minlength="6" class="w-full px-4 py-2 rounded-lg border border-indigo-200" />
            </div>
            <div *ngIf="error" class="text-red-500 text-sm">{{ error }}</div>
            <button type="submit" [disabled]="userForm.invalid || loading || (airlineRequired && !airlineId)" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow disabled:opacity-50">
              {{ loading ? 'Creating...' : 'Create User' }}
            </button>
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

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<Airline[]>('/api/airlines').subscribe({
      next: (airlines) => { this.airlines = airlines; },
      error: () => { this.airlines = []; }
    });
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
        this.error = err?.error?.message || 'Failed to create user.';
        this.loading = false;
      }
    });
  }

  get airlineRequired() {
    return this.role === 'employee';
  }
} 