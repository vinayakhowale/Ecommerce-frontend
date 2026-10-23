import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../models/page.model';
import { Post } from '../models/post.model';
import {
  Banner, BannerPlacement, BannerRequest, Category, CreatorProfile, CreatorVideo, CreatorVideoRequest,
  FulfillmentStatus, FulfillmentUpdate, OrderTracking, Review, ReviewDetail, ReviewRequest, ReviewSummary
} from '../models/storefront.model';

/** Customer-facing content added for the storefront: banners, Shop menu, videos, reviews, tracking. */
@Injectable({ providedIn: 'root' })
export class StorefrontService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  private categories$?: Observable<Category[]>;

  banners(placement: BannerPlacement): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.api}/public/banners`, { params: { placement } });
  }

  /** Cached for the session: the header and the Collections page both use it. */
  categories(): Observable<Category[]> {
    this.categories$ ??= this.http.get<Category[]>(`${this.api}/public/categories`).pipe(shareReplay(1));
    return this.categories$;
  }

  videos(page = 0, size = 12): Observable<Page<Post>> {
    return this.http.get<Page<Post>>(`${this.api}/public/videos`, { params: { page, size } });
  }

  // ------------------------------------------------------------ reviews
  reviews(productId: number, page = 0, size = 10): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(`${this.api}/public/products/${productId}/reviews`, { params: { page, size } });
  }

  reviewDetail(productId: number): Observable<ReviewDetail> {
    return this.http.get<ReviewDetail>(`${this.api}/public/products/${productId}/reviews/summary`);
  }

  reviewSummaries(productIds: number[]): Observable<ReviewSummary[]> {
    return this.http.get<ReviewSummary[]>(`${this.api}/public/reviews/summary`, {
      params: { productIds: productIds.join(',') }
    });
  }

  /** null when the user hasn't reviewed this product yet (the API answers 204). */
  myReview(productId: number): Observable<Review | null> {
    return this.http.get<Review>(`${this.api}/products/${productId}/reviews/mine`, { observe: 'response' })
      .pipe(map(r => r.status === 204 ? null : r.body));
  }

  submitReview(productId: number, body: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(`${this.api}/products/${productId}/reviews`, body);
  }

  // ----------------------------------------------------------- tracking
  trackOrder(orderNumber: string, email: string): Observable<OrderTracking> {
    return this.http.post<OrderTracking>(`${this.api}/public/track-order`, { orderNumber, email });
  }

  myOrders(): Observable<OrderTracking[]> {
    return this.http.get<OrderTracking[]>(`${this.api}/orders/mine`);
  }

  // ------------------------------------------------------------ creator
  creatorProfile(): Observable<CreatorProfile> {
    return this.http.get<CreatorProfile>(`${this.api}/creator/me`);
  }

  creatorVideos(): Observable<CreatorVideo[]> {
    return this.http.get<CreatorVideo[]>(`${this.api}/creator/videos`);
  }

  submitCreatorVideo(body: CreatorVideoRequest): Observable<CreatorVideo> {
    return this.http.post<CreatorVideo>(`${this.api}/creator/videos`, body);
  }

  deleteCreatorVideo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/creator/videos/${id}`);
  }

  creatorUpload(file: File, type: 'VIDEO' | 'IMAGE'): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.api}/creator/upload`, form, { params: { type } });
  }
}

/** Admin endpoints for the new storefront features. */
@Injectable({ providedIn: 'root' })
export class StorefrontAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  banners(): Observable<Banner[]> {
    return this.http.get<Banner[]>(`${this.base}/banners`);
  }
  createBanner(body: BannerRequest): Observable<Banner> {
    return this.http.post<Banner>(`${this.base}/banners`, body);
  }
  updateBanner(id: number, body: BannerRequest): Observable<Banner> {
    return this.http.put<Banner>(`${this.base}/banners/${id}`, body);
  }
  setBannerActive(id: number, value: boolean): Observable<Banner> {
    return this.http.patch<Banner>(`${this.base}/banners/${id}/active`, {}, { params: { value } });
  }
  deleteBanner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/banners/${id}`);
  }
  uploadBannerImage(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/banners/upload-image`, form);
  }

  orders(status?: FulfillmentStatus | '', page = 0, size = 30): Observable<Page<OrderTracking>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<OrderTracking>>(`${this.base}/orders`, { params });
  }
  updateFulfillment(id: number, body: FulfillmentUpdate): Observable<OrderTracking> {
    return this.http.patch<OrderTracking>(`${this.base}/orders/${id}/fulfillment`, body);
  }

  pendingVideos(page = 0, size = 30): Observable<Page<CreatorVideo>> {
    return this.http.get<Page<CreatorVideo>>(`${this.base}/creator-videos/pending`, { params: { page, size } });
  }
  approveVideo(id: number): Observable<CreatorVideo> {
    return this.http.patch<CreatorVideo>(`${this.base}/creator-videos/${id}/approve`, {});
  }
  rejectVideo(id: number, note: string): Observable<CreatorVideo> {
    return this.http.patch<CreatorVideo>(`${this.base}/creator-videos/${id}/reject`, { note });
  }

  reviews(page = 0, size = 30): Observable<Page<Review>> {
    return this.http.get<Page<Review>>(`${this.base}/reviews`, { params: { page, size } });
  }
  deleteReview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/reviews/${id}`);
  }
}
