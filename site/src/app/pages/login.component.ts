import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      class="flex min-h-screen flex-col justify-center px-6 py-12 bg-gradient-to-br from-blue-100 via-white to-blue-200"
    >
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          class="mx-auto h-32 w-auto"
          src="/assets/logo.svg"
          alt="Aviato logo"
        />
        <h2
          class="mt-5 text-center text-2xl font-bold tracking-tight text-blue-900"
        >
          Sign in to Aviato
        </h2>
      </div>
      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div *ngIf="error" class="mb-4 text-red-600 text-center">
          {{ error }}
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-blue-900"
              >Email address</label
            >
            <div class="mt-2">
              <input
                formControlName="email"
                type="email"
                id="email"
                autocomplete="email"
                class="block w-full rounded-md bg-white px-3 py-2 text-base text-blue-900 border border-blue-200 placeholder:text-blue-300 focus:outline-2 focus:outline-blue-400"
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
                class="block text-sm font-medium text-blue-900"
                >Password</label
              >
            </div>
            <div class="mt-2">
              <input
                formControlName="password"
                type="password"
                id="password"
                autocomplete="current-password"
                class="block w-full rounded-md bg-white px-3 py-2 text-base text-blue-900 border border-blue-200 placeholder:text-blue-300 focus:outline-2 focus:outline-blue-400"
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
              [disabled]="form.invalid || loading"
              class="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-base font-semibold text-white shadow hover:bg-blue-500 focus:outline-2 focus:outline-blue-400 disabled:opacity-50"
            >
              <span *ngIf="!loading">Sign in</span>
              <span *ngIf="loading" class="animate-pulse">Signing in...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: '',
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;

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
    this.error = '';
    this.loading = true;
    const { email, password } = this.form.value;
    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid credentials';
      },
    });
  }
}
