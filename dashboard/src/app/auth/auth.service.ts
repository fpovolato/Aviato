import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSub = new BehaviorSubject<User | null>(null);
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.http
      .get<User>('/api/users/profile', { withCredentials: true })
      .pipe(
        catchError((error) => {
          // Silently handle 401 errors (user not logged in)
          if (error.status === 401) {
            return of(null);
          }
          console.error('Error fetching user profile:', error);
          return of(null);
        })
      )
      .subscribe((user) => this.userSub.next(user));
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

  hasRole(...allowed: string[]): boolean {
    const roles = this.userSub.value?.roles || [];
    return allowed.some((r) => roles.includes(r));
  }
}
