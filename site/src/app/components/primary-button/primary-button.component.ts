import { Component, input, output } from '@angular/core';
import { BaseButtonComponent } from '../base-button/base-button.component';

@Component({
  selector: 'app-primary-button',
  imports: [BaseButtonComponent],
  template: `
    <app-base-button
      [label]="label()"
      [disabled]="disabled()"
      [variant]="'primary'"
      (btnClicked)="btnClicked.emit()"
    />
  `,
  styles: ``,
})
export class PrimaryButtonComponent {
  label = input('');
  disabled = input(false);
  btnClicked = output();
}
