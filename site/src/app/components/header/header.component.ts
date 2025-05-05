import {Component, signal} from '@angular/core';
import {PrimaryButtonComponent} from '../primary-button/primary-button.component';

@Component({
  selector: 'app-header',
  imports: [
    PrimaryButtonComponent
  ],
  template: `
    <div class="bg-slate-100 px-4 py-3 shadow-md flex justify-between items-center">
      <span class="text-xl"> Aviato </span>
      <app-primary-button [label]="cart()" (btnClicked)="showBtnClicked()" />
    </div>
  `,
  styles: ``
})
export class HeaderComponent {
  cart = signal('Cart');

  showBtnClicked() {
    console.log('showBtnClicked');
  }
}
