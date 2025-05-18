import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen">
      <app-sidebar></app-sidebar>
      <div class="flex justify-end items-center bg-white p-4">
        <header class="flex justify-end items-center bg-white p-4"></header>
        <main class="flex-1 p-6 bg-gray-50 shadow-md border-rounded-lg">
          <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
          <p>Welcome to the dashboard!</p>
          <p>Here you can manage your application.</p>
          <p>Use the sidebar to navigate through different sections.</p>
        </main>
      </div>
    </div>
  `,
  styles: ``,
})
export class DashboardComponent {}
