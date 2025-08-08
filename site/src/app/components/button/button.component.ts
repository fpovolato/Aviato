import { Component, input, output } from '@angular/core';
import { BaseButtonComponent, ButtonVariant } from '../base-button/base-button.component';

@Component({
  selector: 'app-button',
  imports: [BaseButtonComponent],
  template: `
    <app-base-button
      [label]="label()"
      [variant]="'danger'"
      (btnClicked)="btnClicked.emit()"
    />
  `,
  styles: ``
})
export class ButtonComponent {
  label = input('');
  btnClicked = output();
}
