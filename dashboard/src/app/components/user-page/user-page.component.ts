import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';

interface Airline {
  _id: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center justify-center p-10">
        <div class="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100">
          <h2 class="text-2xl font-bold text-indigo-800 mb-2 flex items-center gap-2">
            <svg class="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            User Details
          </h2>
          <div *ngIf="user; else loading">
            <div class="mb-4">
              <div class="font-semibold text-lg">{{ user.name }} {{ user.surname }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
              <div class="text-xs text-gray-400 mb-2">Roles: {{ user.roles.join(', ') }}</div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-indigo-700 mb-2">Your Airlines</h3>
              <ng-container *ngIf="user.roles.includes('admin'); else notAdmin">
                <div class="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 font-semibold mb-4">
                  You are an <span class="font-bold">admin</span> and have access to <span class="font-bold">all airlines</span>.
                </div>
                <ul class="space-y-2">
                  <li *ngFor="let airline of allAirlines" class="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center gap-3 shadow-sm">
                    <span class="font-bold text-indigo-700">{{ airline.name }}</span>
                    <span class="ml-auto text-xs bg-indigo-200 text-indigo-800 rounded px-2 py-0.5">{{ airline.code }}</span>
                  </li>
                </ul>
              </ng-container>
              <ng-template #notAdmin>
                <ul *ngIf="userAirlines.length > 0; else noAirlines" class="space-y-2">
                  <li *ngFor="let airline of userAirlines" class="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center gap-3 shadow-sm">
                    <span class="font-bold text-indigo-700">{{ airline.name }}</span>
                    <span class="ml-auto text-xs bg-indigo-200 text-indigo-800 rounded px-2 py-0.5">{{ airline.code }}</span>
                  </li>
                </ul>
                <ng-template #noAirlines>
                  <div class="text-gray-400 italic">You are not associated with any airlines.</div>
                </ng-template>
              </ng-template>
            </div>
          </div>
          <ng-template #loading>
            <div class="text-gray-400 italic">Loading user details...</div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class UserPageComponent implements OnInit {
  user: User | null = null;
  allAirlines: Airline[] = [];
  userAirlines: Airline[] = [];

  constructor(private auth: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      this.user = user;
      this.filterUserAirlines();
    });
    this.http.get<Airline[]>('/api/airlines').subscribe((airlines) => {
      this.allAirlines = airlines;
      this.filterUserAirlines();
    });
  }

  private filterUserAirlines() {
    if (this.user && this.user.airlines && this.allAirlines.length > 0) {
      this.userAirlines = this.allAirlines.filter((a) => this.user!.airlines!.some(ua => ua._id === a._id));
    } else {
      this.userAirlines = [];
    }
  }
}
