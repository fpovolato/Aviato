import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface UserFormData {
  name: string;
  surname: string;
  email: string;
  birthDate: string;
  password: string;
  role?: string;
  airlineId?: string;
}

export interface Airline {
  _id: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-user-form-base',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block mb-1 font-semibold text-indigo-700">Name *</label>
        <input
          type="text"
          [(ngModel)]="formData.name"
          name="name"
          required
          class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          [class.border-red-300]="submitted && !formData.name"
        />
        <div
          *ngIf="submitted && !formData.name"
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
          [(ngModel)]="formData.surname"
          name="surname"
          required
          class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          [class.border-red-300]="submitted && !formData.surname"
        />
        <div
          *ngIf="submitted && !formData.surname"
          class="text-red-500 text-xs mt-1"
        >
          Surname is required
        </div>
      </div>
    </div>

    <div>
      <label class="block mb-1 font-semibold text-indigo-700">Email *</label>
      <input
        type="email"
        [(ngModel)]="formData.email"
        name="email"
        required
        class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        [class.border-red-300]="
          submitted && (!formData.email || !isValidEmail(formData.email))
        "
      />
      <div
        *ngIf="submitted && !formData.email"
        class="text-red-500 text-xs mt-1"
      >
        Email is required
      </div>
      <div
        *ngIf="submitted && formData.email && !isValidEmail(formData.email)"
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
        [(ngModel)]="formData.birthDate"
        name="birthDate"
        required
        [max]="maxDate"
        class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        [class.border-red-300]="submitted && !formData.birthDate"
      />
      <div
        *ngIf="submitted && !formData.birthDate"
        class="text-red-500 text-xs mt-1"
      >
        Birth date is required
      </div>
    </div>

    <div>
      <label class="block mb-1 font-semibold text-indigo-700">Password *</label>
      <input
        type="password"
        [(ngModel)]="formData.password"
        name="password"
        required
        minlength="8"
        class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        [class.border-red-300]="
          submitted && (!formData.password || formData.password.length < 8)
        "
      />
      <div
        *ngIf="submitted && !formData.password"
        class="text-red-500 text-xs mt-1"
      >
        Password is required
      </div>
      <div
        *ngIf="submitted && formData.password && formData.password.length < 8"
        class="text-red-500 text-xs mt-1"
      >
        Password must be at least 8 characters
      </div>
    </div>

    <div *ngIf="showRoleSelector">
      <label class="block mb-1 font-semibold text-indigo-700">Role *</label>
      <select
        [(ngModel)]="formData.role"
        name="role"
        required
        class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        [class.border-red-300]="submitted && !formData.role"
      >
        <option value="">Select role</option>
        <option value="customer">Customer</option>
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <div
        *ngIf="submitted && !formData.role"
        class="text-red-500 text-xs mt-1"
      >
        Role is required
      </div>
    </div>

    <div *ngIf="showAirlineSelector && airlines.length > 0">
      <label class="block mb-1 font-semibold text-indigo-700">Airline *</label>
      <select
        [(ngModel)]="formData.airlineId"
        name="airlineId"
        required
        class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        [class.border-red-300]="submitted && !formData.airlineId"
      >
        <option value="">Select airline</option>
        <option *ngFor="let airline of airlines" [value]="airline._id">
          {{ airline.name }} ({{ airline.code }})
        </option>
      </select>
      <div
        *ngIf="submitted && !formData.airlineId"
        class="text-red-500 text-xs mt-1"
      >
        Airline is required
      </div>
    </div>
  `,
})
export class UserFormBaseComponent {
  @Input() formData: UserFormData = {
    name: '',
    surname: '',
    email: '',
    birthDate: '',
    password: '',
  };
  @Input() submitted = false;
  @Input() showRoleSelector = false;
  @Input() showAirlineSelector = false;
  @Input() airlines: Airline[] = [];
  @Output() formDataChange = new EventEmitter<UserFormData>();

  maxDate = new Date().toISOString().split('T')[0];

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onFormDataChange() {
    this.formDataChange.emit(this.formData);
  }
}
