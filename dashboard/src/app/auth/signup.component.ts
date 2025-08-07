import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          class="mx-auto h-60 w-auto"
          src="assets/logo.svg"
          alt="Aviato logo"
        />
        <h2
          class="mt-5 text-center text-2xl/9 font-bold tracking-tight text-gray-900"
        >
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join Aviato and start managing your flights
        </p>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div *ngIf="error" class="mb-4 text-red-600 text-center">
          {{ error }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="name"
                class="block text-sm/6 font-medium text-gray-900"
              >
                First Name
              </label>
              <div class="mt-2">
                <input
                  formControlName="name"
                  type="text"
                  id="name"
                  autocomplete="given-name"
                  class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <div
                  *ngIf="form.get('name')?.touched && form.get('name')?.invalid"
                  class="text-red-500 text-sm mt-1"
                >
                  <div *ngIf="form.get('name')?.errors?.['required']">
                    First name is required.
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label
                for="surname"
                class="block text-sm/6 font-medium text-gray-900"
              >
                Last Name
              </label>
              <div class="mt-2">
                <input
                  formControlName="surname"
                  type="text"
                  id="surname"
                  autocomplete="family-name"
                  class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
                <div
                  *ngIf="
                    form.get('surname')?.touched && form.get('surname')?.invalid
                  "
                  class="text-red-500 text-sm mt-1"
                >
                  <div *ngIf="form.get('surname')?.errors?.['required']">
                    Last name is required.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              for="birthDate"
              class="block text-sm/6 font-medium text-gray-900"
            >
              Birth Date
            </label>
            <div class="mt-2">
              <input
                formControlName="birthDate"
                type="date"
                id="birthDate"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <div
                *ngIf="
                  form.get('birthDate')?.touched &&
                  form.get('birthDate')?.invalid
                "
                class="text-red-500 text-sm mt-1"
              >
                <div *ngIf="form.get('birthDate')?.errors?.['required']">
                  Birth date is required.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              for="email"
              class="block text-sm/6 font-medium text-gray-900"
            >
              Email address
            </label>
            <div class="mt-2">
              <input
                formControlName="email"
                type="email"
                id="email"
                autocomplete="email"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <div
                *ngIf="form.get('email')?.touched && form.get('email')?.invalid"
                class="text-red-500 text-sm mt-1"
              >
                <div *ngIf="form.get('email')?.errors?.['required']">
                  Email is required.
                </div>
                <div *ngIf="form.get('email')?.errors?.['email']">
                  Enter a valid email.
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block text-sm/6 font-medium text-gray-900"
            >
              Password
            </label>
            <div class="mt-2">
              <input
                formControlName="password"
                type="password"
                id="password"
                autocomplete="new-password"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <div
                *ngIf="
                  form.get('password')?.touched && form.get('password')?.invalid
                "
                class="text-red-500 text-sm mt-1"
              >
                <div *ngIf="form.get('password')?.errors?.['required']">
                  Password is required.
                </div>
                <div *ngIf="form.get('password')?.errors?.['minlength']">
                  Password must be at least 6 characters.
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="form.invalid || loading"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              <span *ngIf="!loading">Create account</span>
              <span *ngIf="loading" class="animate-pulse"
                >Creating account...</span
              >
            </button>
          </div>
        </form>
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a
              routerLink="/login"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SignupComponent {
  form!: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.error = '';
    this.loading = true;
    const userData = this.form.value;
    this.auth.register(userData).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      },
    });
  }
}
