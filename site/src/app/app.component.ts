import { Component } from '@angular/core';
import {HeaderComponent} from './components/header/header.component';
import {FlightsListComponent} from './pages/flights-list/flights-list.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, FlightsListComponent],
  template: `
    <app-header/>
    <app-flights-list />
  `,
  styles: [],
})
export class AppComponent {
}
