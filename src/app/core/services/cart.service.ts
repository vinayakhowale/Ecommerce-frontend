import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private base = `${environment.apiUrl}/cart`;

  readonly cart = signal<CartResponse>({ items: [], total: 0, itemCount: 0 });

  constructor(private http: HttpClient) {}

  refresh(): Observable<CartResponse> {
    return this.http.get<CartResponse>(this.base).pipe(tap(c => this.cart.set(c)));
  }

  addItem(productId: number, quantity = 1): Observable<CartResponse> {
    return this.http.post<CartResponse>(`${this.base}/items`, { productId, quantity })
      .pipe(tap(c => this.cart.set(c)));
  }

  updateQuantity(itemId: number, quantity: number): Observable<CartResponse> {
    return this.http.patch<CartResponse>(`${this.base}/items/${itemId}`, { quantity })
      .pipe(tap(c => this.cart.set(c)));
  }

  removeItem(itemId: number): Observable<CartResponse> {
    return this.http.delete<CartResponse>(`${this.base}/items/${itemId}`)
      .pipe(tap(c => this.cart.set(c)));
  }

  clear(): Observable<void> {
    return this.http.delete<void>(this.base).pipe(tap(() => this.cart.set({ items: [], total: 0, itemCount: 0 })));
  }
}
