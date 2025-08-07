import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { LoadingComponent } from './components/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, CommonModule],
  template: `
    <app-loading *ngIf="auth.loading$ | async"></app-loading>
    <router-outlet *ngIf="!(auth.loading$ | async)" />
  `,
})
export class AppComponent {
  constructor(public auth: AuthService) {}
  
  title = 'dashboard';
}
