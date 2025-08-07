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
  selector: 'app-login',
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
          Sign in to your dashboard
        </h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div *ngIf="error" class="mb-4 text-red-600 text-center">
          {{ error }}
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
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
            <div class="flex items-center justify-between">
              <label
                for="password"
                class="block text-sm/6 font-medium text-gray-900"
              >
                Password
              </label>
            </div>
            <div class="mt-2">
              <input
                formControlName="password"
                type="password"
                id="password"
                autocomplete="current-password"
                class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              <div
                *ngIf="
                  form.get('password')?.touched && form.get('password')?.invalid
                "
                class="text-red-500 text-sm mt-1"
              >
                Password is required.
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              [disabled]="form.invalid"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              Sign in
            </button>
          </div>
        </form>
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <a
              routerLink="/signup"
              class="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form!: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: (user) => {
        if (this.auth.hasRole('admin', 'employee')) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error = 'Access denied';
          this.auth.logout();
        }
      },
      error: () => {
        this.error = 'Invalid credentials';
      },
    });
  }
}
