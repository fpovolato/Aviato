import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { NotificationToastComponent } from './components/notification-toast/notification-toast.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, NotificationToastComponent, RouterOutlet],
  template: `
    <app-header />
    <router-outlet />
    <app-notification-toast />
  `,
  styles: [],
})
export class AppComponent {}
