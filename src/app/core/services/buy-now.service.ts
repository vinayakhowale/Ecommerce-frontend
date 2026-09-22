import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BuyNowResponse {
  redirectUrl: string;
  clickId: number;
}

/**
 * The frontend NEVER constructs or supplies a redirect URL itself. It only ever asks the backend
 * "which URL should I go to for this product", and the backend returns a pre-validated,
 * admin-approved URL. This service performs the actual browser navigation once that response
 * comes back — it does not accept or use any URL from anywhere else.
 */
@Injectable({ providedIn: 'root' })
export class BuyNowService {
  constructor(private http: HttpClient) {}

  requestRedirect(productId: number, postId?: number): Observable<BuyNowResponse> {
    return this.http.post<BuyNowResponse>(`${environment.apiUrl}/buy-now`, { productId, postId });
  }

  navigateTo(url: string): void {
    // Defense in depth on the client too, even though the backend already validated this.
    if (/^https?:\/\//i.test(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
