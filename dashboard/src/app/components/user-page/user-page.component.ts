import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen">
      <app-sidebar></app-sidebar>
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">User Page</h2>
        <p class="mb-4">
          This is the user page. You can add user-related content here.
        </p>
      </div>
    </div>
  `,
  styles: ``,
})
export class UserPageComponent {}
