import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePaymentOrderRequest,
  CreatePaymentOrderResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse
} from '../models/payment.model';

/**
 * Raw API calls for the real in-app Razorpay checkout flow. The client only ever sends a
 * productId + quantity -- the backend computes the actual amount server-side (same integrity
 * guarantee as the cart) and returns a pre-created Razorpay order to check out against.
 */
@Injectable({ providedIn: 'root' })
export class PaymentService {
  private base = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  createOrder(req: CreatePaymentOrderRequest): Observable<CreatePaymentOrderResponse> {
    return this.http.post<CreatePaymentOrderResponse>(`${this.base}/create-order`, req);
  }

  verify(req: VerifyPaymentRequest): Observable<VerifyPaymentResponse> {
    return this.http.post<VerifyPaymentResponse>(`${this.base}/verify`, req);
  }
}
