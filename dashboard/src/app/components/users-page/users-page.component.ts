import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { User } from '../../models/user.model';
import { AuthService } from '../../auth/auth.service';

interface Airline { _id: string; name: string; code: string; }

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div class="w-full max-w-6xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 class="text-2xl font-bold text-indigo-800">Users</h2>
            <button (click)="goToCreateUser()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow">Create User</button>
          </div>
          <div class="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input [(ngModel)]="search" type="text" placeholder="Search by name, email..." class="w-full md:w-80 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <select [(ngModel)]="roleFilter" class="px-4 py-2 rounded-lg border border-indigo-200">
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
            </select>
            <select [(ngModel)]="airlineFilter" class="px-4 py-2 rounded-lg border border-indigo-200">
              <option value="">All airlines</option>
              <option *ngFor="let a of airlines" [value]="a._id">{{ a.name }} ({{ a.code }})</option>
            </select>
            <button (click)="applyFilter()" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-semibold">Search</button>
          </div>
          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">Loading users...</div>
          <div *ngIf="!loading && filteredUsers.length === 0" class="text-gray-400 italic text-center py-10">No users found.</div>
          <table *ngIf="!loading && filteredUsers.length > 0" class="w-full text-left border-collapse mt-4">
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
              <tr *ngFor="let user of filteredUsers" class="border-b hover:bg-indigo-50/50">
                <td class="p-2 font-semibold">{{ user.name }} {{ user.surname }}</td>
                <td class="p-2">{{ user.email }}</td>
                <td class="p-2">{{ user.birthDate | date:'dd/MM/yy' }}</td>
                <td class="p-2">
                  <select [ngModel]="user.roles[0]" (ngModelChange)="onRoleChange(user, $event)" class="px-2 py-1 rounded border">
                    <option value="admin">admin</option>
                    <option value="employee">employee</option>
                    <option value="customer">customer</option>
                  </select>
                </td>
                <td class="p-2">
                  <span *ngFor="let a of user.airlines; let last = last">{{ a.name }}<span *ngIf="!last">, </span></span>
                </td>
                <td class="p-2">
                  <button (click)="deleteUser(user._id)" class="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded shadow">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div *ngIf="showAirlineModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div class="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm flex flex-col gap-4 border border-indigo-200">
            <h3 class="text-lg font-bold text-indigo-800 mb-2">Select Airline for Employee</h3>
            <select [(ngModel)]="selectedAirlineId" class="w-full px-4 py-2 rounded-lg border border-indigo-200">
              <option value="" disabled selected>Select airline</option>
              <option *ngFor="let a of airlines" [value]="a._id">{{ a.name }} ({{ a.code }})</option>
            </select>
            <div *ngIf="airlineModalError" class="text-red-500 text-xs">Airline is required for employees.</div>
            <div class="flex gap-2 mt-4">
              <button (click)="confirmAirline()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-semibold" [disabled]="!selectedAirlineId">Confirm</button>
              <button (click)="cancelAirlineModal()" class="bg-gray-300 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold">Cancel</button>
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
  airlineModalError = false;
  selectedUser: User | null = null;
  selectedAirlineId = '';

  constructor(private http: HttpClient, private router: Router, private auth: AuthService) {}

  ngOnInit(): void {
    this.auth.user$.subscribe(user => {
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
      }
    });
  }

  fetchAirlines() {
    this.http.get<Airline[]>('/api/airlines').subscribe({
      next: (airlines) => { this.airlines = airlines; },
      error: () => { this.airlines = []; }
    });
  }

  applyFilter() {
    const s = this.search.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.surname.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
    if (this.roleFilter) {
      this.filteredUsers = this.filteredUsers.filter(u => u.roles.includes(this.roleFilter));
    }
    if (this.airlineFilter) {
      this.filteredUsers = this.filteredUsers.filter(u => u.airlines.some(a => a._id === this.airlineFilter));
    }
  }

  onRoleChange(user: User, newRole: string) {
    if (newRole === 'employee' && (!user.airlines || user.airlines.length === 0)) {
      this.selectedUser = user;
      this.selectedAirlineId = '';
      this.showAirlineModal = true;
      this.airlineModalError = false;
      return;
    }
    this.http.patch(`/api/users/${user._id}/role`, { role: newRole }).subscribe(() => {
      user.roles = [newRole];
      this.applyFilter();
    });
  }

  confirmAirline() {
    if (!this.selectedUser || !this.selectedAirlineId) {
      this.airlineModalError = true;
      return;
    }
    this.http.patch(`/api/users/${this.selectedUser._id}/airline-role`, {
      airlineId: this.selectedAirlineId,
      role: 'employee'
    }).subscribe({
      next: () => {
        this.selectedUser!.roles = ['employee'];
        this.selectedUser!.airlines = [{
          _id: this.selectedAirlineId,
          name: this.airlines.find(a => a._id === this.selectedAirlineId)?.name || '',
          code: this.airlines.find(a => a._id === this.selectedAirlineId)?.code || ''
        }];
        this.showAirlineModal = false;
        this.selectedUser = null;
        this.selectedAirlineId = '';
        this.applyFilter();
      },
      error: () => {
        this.airlineModalError = true;
      }
    });
  }

  cancelAirlineModal() {
    this.showAirlineModal = false;
    this.selectedUser = null;
    this.selectedAirlineId = '';
    this.airlineModalError = false;
  }

  deleteUser(id: string) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete(`/api/users/${id}`).subscribe(() => {
      this.users = this.users.filter(u => u._id !== id);
      this.applyFilter();
    });
  }

  goToCreateUser() {
    this.router.navigate(['/users/create']);
  }
} 