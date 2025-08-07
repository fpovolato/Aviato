import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';

interface Airline {
  _id: string;
  name: string;
  code: string;
}

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-6xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
          >
            <h2 class="text-2xl font-bold text-indigo-800">Users</h2>
            <button
              (click)="goToCreateUser()"
              class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              Create User
            </button>
          </div>
          <div class="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input
              [(ngModel)]="search"
              type="text"
              placeholder="Search by name, email..."
              class="w-full md:w-80 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <select
              [(ngModel)]="roleFilter"
              class="px-4 py-2 rounded-lg border border-indigo-200"
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
            </select>
            <select
              [(ngModel)]="airlineFilter"
              class="px-4 py-2 rounded-lg border border-indigo-200"
            >
              <option value="">All airlines</option>
              <option *ngFor="let a of airlines" [value]="a._id">
                {{ a.name }} ({{ a.code }})
              </option>
            </select>
            <button
              (click)="applyFilter()"
              class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Search
            </button>
          </div>
          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">
            Loading users...
          </div>
          <div
            *ngIf="!loading && filteredUsers.length === 0"
            class="text-gray-400 italic text-center py-10"
          >
            No users found.
          </div>
          <table
            *ngIf="!loading && filteredUsers.length > 0"
            class="w-full text-left border-collapse mt-4"
          >
            <thead>
              <tr class="bg-indigo-50">
                <th class="p-2">Name</th>
                <th class="p-2">Email</th>
                <th class="p-2">Birth Date</th>
                <th class="p-2">Role</th>
                <th class="p-2">Airlines</th>
                <th class="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let user of filteredUsers"
                class="border-b hover:bg-indigo-50/50"
              >
                <td class="p-2 font-semibold">
                  {{ user.name }} {{ user.surname }}
                </td>
                <td class="p-2">{{ user.email }}</td>
                <td class="p-2">{{ user.birthDate | date : 'dd/MM/yy' }}</td>
                <td class="p-2">
                  <select
                    [ngModel]="user.roles[0]"
                    (ngModelChange)="onRoleChange(user, $event)"
                    class="px-2 py-1 rounded border"
                    [disabled]="updatingUser === user._id"
                  >
                    <option value="admin">admin</option>
                    <option value="employee">employee</option>
                    <option value="customer">customer</option>
                  </select>
                  <div
                    *ngIf="updatingUser === user._id"
                    class="text-xs text-indigo-600 mt-1"
                  >
                    Updating...
                  </div>
                </td>
                <td class="p-2">
                  <span *ngFor="let a of user.airlines; let last = last"
                    >{{ a.name }}<span *ngIf="!last">, </span></span
                  >
                  <span
                    *ngIf="user.airlines.length === 0"
                    class="text-gray-400 italic"
                    >None</span
                  >
                </td>
                <td class="p-2">
                  <button
                    (click)="deleteUser(user._id)"
                    class="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded shadow"
                    [disabled]="updatingUser === user._id"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Modal per assegnazione compagnia aerea -->
        <div
          *ngIf="showAirlineModal"
          class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
        >
          <div
            class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4 border border-indigo-200"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-indigo-800">
                Assign Airline to Employee
              </h3>
              <button
                (click)="cancelAirlineModal()"
                class="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div class="text-sm text-gray-600 mb-4">
              <p>
                <strong
                  >{{ selectedUser?.name }} {{ selectedUser?.surname }}</strong
                >
                is being promoted to <strong>Employee</strong>.
              </p>
              <p class="mt-2">Please select an airline to assign:</p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-indigo-700"
                >Airline *</label
              >
              <select
                [(ngModel)]="selectedAirlineId"
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" disabled selected>Select an airline</option>
                <option *ngFor="let a of airlines" [value]="a._id">
                  {{ a.name }} ({{ a.code }})
                </option>
              </select>
              <div *ngIf="airlineModalError" class="text-red-500 text-xs mt-1">
                {{ airlineModalError }}
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                (click)="confirmAirline()"
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="!selectedAirlineId || confirmingAirline"
              >
                {{ confirmingAirline ? 'Updating...' : 'Confirm Assignment' }}
              </button>
              <button
                (click)="cancelAirlineModal()"
                class="flex-1 bg-gray-300 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                [disabled]="confirmingAirline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Modal di conferma per rimozione compagnie -->
        <div
          *ngIf="showRemoveAirlineModal"
          class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
        >
          <div
            class="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col gap-4 border border-indigo-200"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-bold text-indigo-800">
                Remove Airline Assignment
              </h3>
              <button
                (click)="cancelRemoveAirlineModal()"
                class="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>

            <div class="text-sm text-gray-600 mb-4">
              <p>
                <strong
                  >{{ selectedUser?.name }} {{ selectedUser?.surname }}</strong
                >
                is being promoted to <strong>Admin</strong>.
              </p>
              <p class="mt-2">
                This will remove all airline assignments. Continue?
              </p>
            </div>

            <div class="flex gap-3 mt-6">
              <button
                (click)="confirmRemoveAirline()"
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                [disabled]="confirmingAirline"
              >
                {{ confirmingAirline ? 'Updating...' : 'Confirm Promotion' }}
              </button>
              <button
                (click)="cancelRemoveAirlineModal()"
                class="flex-1 bg-gray-300 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                [disabled]="confirmingAirline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class UsersPageComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  search = '';
  roleFilter = '';
  airlineFilter = '';
  loading = true;
  airlines: Airline[] = [];

  showAirlineModal = false;
  showRemoveAirlineModal = false;
  airlineModalError = '';
  selectedUser: User | null = null;
  selectedAirlineId = '';
  selectedNewRole = '';
  updatingUser: string | null = null;
  confirmingAirline = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (!user || !user.roles.includes('admin')) {
        this.router.navigate(['/']);
      } else {
        this.fetchUsers();
        this.fetchAirlines();
      }
    });
  }

  fetchUsers() {
    this.loading = true;
    let params: any = {};
    if (this.roleFilter) params.role = this.roleFilter;
    if (this.airlineFilter) params.airline = this.airlineFilter;
    this.http.get<User[]>('/api/users', { params }).subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.filteredUsers = [];
        this.loading = false;
      },
    });
  }

  fetchAirlines() {
    this.http.get<Airline[]>('/api/airlines').subscribe({
      next: (airlines) => {
        this.airlines = airlines;
      },
      error: () => {
        this.airlines = [];
      },
    });
  }

  applyFilter() {
    const s = this.search.toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.surname.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s)
    );
    if (this.roleFilter) {
      this.filteredUsers = this.filteredUsers.filter((u) =>
        u.roles.includes(this.roleFilter)
      );
    }
    if (this.airlineFilter) {
      this.filteredUsers = this.filteredUsers.filter((u) =>
        u.airlines.some((a) => a._id === this.airlineFilter)
      );
    }
  }

  onRoleChange(user: User, newRole: string) {
    const currentRole = user.roles[0];

    // Se il ruolo non è cambiato, non fare nulla
    if (currentRole === newRole) return;

    this.selectedUser = user;
    this.selectedNewRole = newRole;
    this.updatingUser = user._id;

    // Caso 1: Promozione a Employee (serve compagnia aerea)
    if (
      newRole === 'employee' &&
      (!user.airlines || user.airlines.length === 0)
    ) {
      this.selectedAirlineId = '';
      this.airlineModalError = '';
      this.showAirlineModal = true;
      return;
    }

    // Caso 2: Promozione a Admin (rimuovere compagnie)
    if (newRole === 'admin' && user.airlines && user.airlines.length > 0) {
      this.showRemoveAirlineModal = true;
      return;
    }

    // Caso 3: Retrocessione a Customer (rimuovere compagnie)
    if (newRole === 'customer' && user.airlines && user.airlines.length > 0) {
      this.showRemoveAirlineModal = true;
      return;
    }

    // Caso 4: Cambio ruolo senza compagnie (aggiornamento diretto)
    this.updateUserRole(user, newRole);
  }

  updateUserRole(user: User, newRole: string) {
    this.http
      .patch(`/api/users/${user._id}/role`, { role: newRole })
      .subscribe({
        next: () => {
          user.roles = [newRole];
          if (newRole === 'customer' || newRole === 'admin') {
            user.airlines = [];
          }
          this.updatingUser = null;
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.updatingUser = null;
          // Revert the select to the original value
          this.fetchUsers();
        },
      });
  }

  confirmAirline() {
    if (!this.selectedUser || !this.selectedAirlineId) {
      this.airlineModalError = 'Please select an airline';
      return;
    }

    this.confirmingAirline = true;
    this.airlineModalError = '';

    this.http
      .patch(`/api/users/${this.selectedUser._id}/airline-role`, {
        airlineId: this.selectedAirlineId,
        role: 'employee',
      })
      .subscribe({
        next: () => {
          this.selectedUser!.roles = ['employee'];
          this.selectedUser!.airlines = [
            {
              _id: this.selectedAirlineId,
              name:
                this.airlines.find((a) => a._id === this.selectedAirlineId)
                  ?.name || '',
              code:
                this.airlines.find((a) => a._id === this.selectedAirlineId)
                  ?.code || '',
            },
          ];
          this.closeModals();
          this.updatingUser = null;
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.airlineModalError =
            error?.error?.message || 'Failed to update user. Please try again.';
          this.confirmingAirline = false;
        },
      });
  }

  confirmRemoveAirline() {
    if (!this.selectedUser) return;

    this.confirmingAirline = true;

    this.http
      .patch(`/api/users/${this.selectedUser._id}/role`, {
        role: this.selectedNewRole,
      })
      .subscribe({
        next: () => {
          this.selectedUser!.roles = [this.selectedNewRole];
          this.selectedUser!.airlines = [];
          this.closeModals();
          this.updatingUser = null;
          this.applyFilter();
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          this.confirmingAirline = false;
          // Revert the select to the original value
          this.fetchUsers();
        },
      });
  }

  cancelAirlineModal() {
    this.closeModals();
    // Revert the select to the original value
    this.fetchUsers();
  }

  cancelRemoveAirlineModal() {
    this.closeModals();
    // Revert the select to the original value
    this.fetchUsers();
  }

  private closeModals() {
    this.showAirlineModal = false;
    this.showRemoveAirlineModal = false;
    this.selectedUser = null;
    this.selectedAirlineId = '';
    this.selectedNewRole = '';
    this.airlineModalError = '';
    this.confirmingAirline = false;
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`/api/users/${id}`).subscribe(() => {
      this.users = this.users.filter((u) => u._id !== id);
      this.applyFilter();
    });
  }

  goToCreateUser() {
    this.router.navigate(['/users/create']);
  }
}
