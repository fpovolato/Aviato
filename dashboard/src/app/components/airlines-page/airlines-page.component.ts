import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';

interface Airline {
  _id: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-airlines-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-3xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
          >
            <h2 class="text-2xl font-bold text-indigo-800">Airlines</h2>
            <form
              (ngSubmit)="addAirline()"
              #airlineForm="ngForm"
              class="flex gap-2 items-center"
            >
              <input
                [(ngModel)]="newName"
                name="name"
                required
                placeholder="Name"
                class="px-3 py-2 rounded-lg border border-indigo-200"
              />
              <input
                [(ngModel)]="newCode"
                name="code"
                required
                maxlength="6"
                placeholder="Code"
                class="px-3 py-2 rounded-lg border border-indigo-200"
              />
              <button
                type="submit"
                [disabled]="airlineForm.invalid || loading"
                class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold"
              >
                Add
              </button>
            </form>
          </div>
          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">
            Loading airlines...
          </div>
          <div
            *ngIf="!loading && airlines.length === 0"
            class="text-gray-400 italic text-center py-10"
          >
            No airlines found.
          </div>
          <table
            *ngIf="!loading && airlines.length > 0"
            class="w-full text-left border-collapse mt-4"
          >
            <thead>
              <tr class="bg-indigo-50">
                <th class="p-2">Name</th>
                <th class="p-2">Code</th>
                <th class="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let airline of airlines"
                class="border-b hover:bg-indigo-50/50"
              >
                <td class="p-2 font-semibold">{{ airline.name }}</td>
                <td class="p-2">{{ airline.code }}</td>
                <td class="p-2">
                  <button
                    (click)="deleteAirline(airline._id)"
                    class="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded shadow"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class AirlinesPageComponent implements OnInit {
  airlines: Airline[] = [];
  newName = '';
  newCode = '';
  loading = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (!user || !user.roles.map((r) => r.toLowerCase()).includes('admin')) {
        this.router.navigate(['/']);
      } else {
        this.fetchAirlines();
      }
    });
  }

  fetchAirlines() {
    this.loading = true;
    this.http.get<Airline[]>('/api/airlines').subscribe({
      next: (airlines) => {
        this.airlines = airlines;
        this.loading = false;
      },
      error: () => {
        this.airlines = [];
        this.loading = false;
      },
    });
  }

  addAirline() {
    if (!this.newName || !this.newCode) return;
    this.loading = true;
    this.http
      .post<Airline>('/api/airlines', {
        name: this.newName,
        code: this.newCode,
      })
      .subscribe({
        next: (airline) => {
          this.airlines.push(airline);
          this.newName = '';
          this.newCode = '';
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  deleteAirline(id: string) {
    if (!confirm('Are you sure you want to delete this airline?')) return;
    this.loading = true;
    this.http.delete(`/api/airlines/${id}`).subscribe(() => {
      this.airlines = this.airlines.filter((a) => a._id !== id);
      this.loading = false;
    });
  }
}
