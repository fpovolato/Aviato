import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpHandler, HttpRequest } from '@angular/common/http';

@Injectable()
export class TokenInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const user = this.auth.currentUser;
    if (user?.token) {
      const clone = req.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      return next.handle(clone);
    }
    return next.handle(req);
  }
}
