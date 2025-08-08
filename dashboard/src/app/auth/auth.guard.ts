import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, map, filter, take, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    return this.auth.loading$.pipe(
      filter((loading) => !loading), // Wait until loading is complete
      take(1),
      switchMap(() => this.auth.user$),
      take(1),
      map((user) => {
        if (!user) {
          return this.router.parseUrl('/login');
        }

        // Check if user needs to complete first login (except for the first-login route itself)
        if (
          user.passwordMustChange &&
          route.routeConfig?.path !== 'first-login'
        ) {
          return this.router.parseUrl('/first-login');
        }

        const allowed = route.data['roles'] as string[] | undefined;
        if (allowed && !this.auth.hasRole(...allowed)) {
          console.log(
            '❌ Access denied - User roles:',
            user.roles,
            'Required roles:',
            allowed
          );
          return this.router.parseUrl('/');
        }
        console.log(
          '✅ Access granted - User roles:',
          user.roles,
          'Required roles:',
          allowed
        );
        return true;
      })
    );
  }
}
