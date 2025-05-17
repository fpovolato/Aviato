import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree,
} from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isLoggedIn) {
      return this.router.parseUrl('/login');
    }

    const allwed = route.data['roles'] as string[] | undefined;
    if (allwed && !this.auth.hasRole(...allwed)) {
      return this.router.parseUrl('/login');
    }
    return true;
  }
}
