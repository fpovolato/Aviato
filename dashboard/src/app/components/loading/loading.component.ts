import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"
        ></div>
        <p class="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  `,
})
export class LoadingComponent {}
