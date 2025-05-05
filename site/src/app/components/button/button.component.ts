import {Component, input, output} from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  template: `
    <!--
        <button class="bg-blue-500 text-white w-full border px-5 py-2 rounded-xl shadow-md hover:opacity-90" (click)="btnClicked.emit()">
    -->
    <button
      class="mt-2 bg-gradient-to-r from-red-600 to-red-400 text-white font-semibold py-2 px-4 rounded hover:opacity-90"
      (click)="btnClicked.emit()">
      {{ label() }}
    </button>
  `,
  styles: ``
})
export class ButtonComponent {
  label = input('');

  btnClicked = output();
}
