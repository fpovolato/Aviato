import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSub = new BehaviorSubject<User | null>(null);
  private loadingSub = new BehaviorSubject<boolean>(true);
  user$ = this.userSub.asObservable();
  loading$ = this.loadingSub.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Check if user is already logged in on app initialization
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.http
      .get<User>('/api/users/profile', { withCredentials: true })
      .pipe(
        catchError((error) => {
          // Silently handle 401 errors (user not logged in)
          if (error.status === 401) {
            console.log('User not authenticated');
            return of(null);
          }
          console.error('Error fetching user profile:', error);
          return of(null);
        })
      )
      .subscribe((user) => {
        console.log('Auth check result:', user);
        this.userSub.next(user);
        this.loadingSub.next(false);
      });
  }

  register(userData: {
    name: string;
    surname: string;
    birthDate: string;
    email: string;
    password: string;
  }) {
    return this.http
      .post<{ roles: string[] }>('/api/users/register', userData, {
        withCredentials: true,
      })
      .pipe(
        switchMap(() =>
          this.http.get<User>('/api/users/profile', { withCredentials: true })
        ),
        tap((user) => {
          this.userSub.next(user);
        })
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<{ roles: string[] }>(
        '/api/users/login',
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        switchMap(() =>
          this.http.get<User>('/api/users/profile', { withCredentials: true })
        ),
        tap((user) => {
          console.log('Login successful:', user);
          this.userSub.next(user);
        })
      );
  }

  logout() {
    return this.http
      .post('/api/users/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.userSub.next(null);
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }

  get currentUser(): User | null {
    return this.userSub.value;
  }

  get isLoggedIn(): boolean {
    return !!this.userSub.value;
  }

  get isLoading(): boolean {
    return this.loadingSub.value;
  }

  hasRole(...allowed: string[]): boolean {
    const roles = this.userSub.value?.roles || [];
    return allowed.some((r) => roles.includes(r));
  }

  refreshUser() {
    this.http
      .get<User>('/api/users/profile', { withCredentials: true })
      .subscribe({
        next: (user) => {
          this.userSub.next(user);
        },
        error: (error) => {
          console.error('Error refreshing user:', error);
          if (error.status === 401) {
            this.userSub.next(null);
            this.router.navigate(['/login']);
          }
        },
      });
  }
}
