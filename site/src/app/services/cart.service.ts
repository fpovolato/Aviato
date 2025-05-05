import {Injectable, signal} from '@angular/core';
import {Flight} from '../models/flights.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cart = signal<Flight[]>([]);

  addToCart(flight: Flight) {
    this.cart.set([...this.cart(), flight]);
  }

  removeFromCart(id: number) {
    this.cart.set(this.cart().filter((f) => f.id !== id));
  }

  constructor() { }
}
