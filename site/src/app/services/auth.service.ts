import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { Router } from '@angular/router';
import { tap, switchMap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public user = signal<User | null>(null);
  user$ = this.user.asReadonly();

  constructor(private http: HttpClient, private router: Router) {
    this.http
      .get<User>('/api/users/profile', { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe((user) => this.user.set(user));
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
          this.user.set(user);
        })
      );
  }

  logout() {
    return this.http
      .post('/api/users/logout', {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.user.set(null);
          this.router.navigate(['/']);
        })
      )
      .subscribe();
  }

  get currentUser(): User | null {
    return this.user();
  }

  get isLoggedIn(): boolean {
    return !!this.user();
  }

  hasRole(...allowed: string[]): boolean {
    const roles = this.user()?.roles || [];
    return allowed.some((r) => roles.includes(r));
  }
}
