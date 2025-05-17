import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User } from './models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSub = new BehaviorSubject<User | null>(null);
  user$ = this.userSub.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    const saved = localStorage.getItem('user');
    if (saved) this.userSub.next(JSON.parse(saved));
  }

  login(email: string, password: string) {
    return this.http
      .post<User>(`http://localhost:3000/api/users/login`, { email, password })
      .pipe(
        tap((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.userSub.next(user);
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.userSub.next(null);
    this.router.navigate(['/login']);
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
