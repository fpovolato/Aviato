import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

@Component({
  selector: 'app-base-button',
  imports: [],
  template: `
    <button
      [class]="getButtonClasses()"
      [disabled]="disabled()"
      (click)="btnClicked.emit()"
    >
      {{ label() }}
    </button>
  `,
  styles: ``,
})
export class BaseButtonComponent {
  label = input('');
  disabled = input(false);
  variant = input<ButtonVariant>('primary');

  btnClicked = output();

  getButtonClasses(): string {
    const baseClasses =
      'mt-2 text-white font-semibold py-2 px-4 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed';

    switch (this.variant()) {
      case 'primary':
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-400`;
      case 'secondary':
        return `${baseClasses} bg-gradient-to-r from-gray-600 to-gray-400`;
      case 'danger':
        return `${baseClasses} bg-gradient-to-r from-red-600 to-red-400`;
      default:
        return `${baseClasses} bg-gradient-to-r from-blue-600 to-blue-400`;
    }
  }
}
