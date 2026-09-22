import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Post, PostStatus } from '../models/post.model';
import { Page } from '../models/page.model';
import { DashboardStats } from '../models/dashboard.model';
import { User } from '../models/user.model';
import { Influencer, InfluencerDiscount } from '../models/influencer.model';
import { Discount, DiscountType, DiscountScope } from '../models/discount.model';
import { CartAnalyticsRow } from '../models/cart-analytics.model';

export interface DiscountPayload {
  name: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  productId?: number | null;
  category?: string;
  startAt: string;
  endAt: string;
  conditions?: string;
  active?: boolean;
}

export interface InfluencerPayload {
  name: string;
  code?: string;
  profileImageUrl?: string;
  email?: string;
  phone?: string;
  active?: boolean;
}

export interface InfluencerDiscountPayload {
  influencerId: number;
  discountPercentage: number;
  notes?: string;
  active?: boolean;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  brand?: string;
  category?: string;
  seller?: string;
  productImageUrl?: string;
  productUrl: string;
  affiliateUrl?: string;
  razorpayAccountId?: string;
  active?: boolean;
}

export interface PostPayload {
  influencerName: string;
  influencerProfileImageUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  hashtags?: string;
  productIds?: number[];
  status?: PostStatus;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private base = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Dashboard
  dashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.base}/dashboard`);
  }

  // Products
  listProducts(page = 0, size = 20): Observable<Page<Product>> {
    return this.http.get<Page<Product>>(`${this.base}/products`, { params: { page, size } });
  }
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }
  createProduct(payload: ProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, payload);
  }
  updateProduct(id: number, payload: ProductPayload): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, payload);
  }
  activateProduct(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/products/${id}/activate`, {});
  }
  deactivateProduct(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/products/${id}/deactivate`, {});
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }
  uploadProductImage(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/products/upload-image`, form);
  }

  // Posts
  listPosts(page = 0, size = 20): Observable<Page<Post>> {
    return this.http.get<Page<Post>>(`${this.base}/posts`, { params: { page, size } });
  }
  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.base}/posts/${id}`);
  }
  createPost(payload: PostPayload): Observable<Post> {
    return this.http.post<Post>(`${this.base}/posts`, payload);
  }
  updatePost(id: number, payload: PostPayload): Observable<Post> {
    return this.http.put<Post>(`${this.base}/posts/${id}`, payload);
  }
  publishPost(id: number): Observable<Post> {
    return this.http.patch<Post>(`${this.base}/posts/${id}/publish`, {});
  }
  unpublishPost(id: number): Observable<Post> {
    return this.http.patch<Post>(`${this.base}/posts/${id}/unpublish`, {});
  }
  archivePost(id: number): Observable<Post> {
    return this.http.patch<Post>(`${this.base}/posts/${id}/archive`, {});
  }
  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/posts/${id}`);
  }
  uploadMedia(file: File, type: 'IMAGE' | 'VIDEO'): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    return this.http.post<{ url: string }>(`${this.base}/posts/upload-media`, form);
  }

  // Users
  listUsers(page = 0, size = 20): Observable<Page<User>> {
    return this.http.get<Page<User>>(`${this.base}/users`, { params: { page, size } });
  }
  activateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/${id}/activate`, {});
  }
  deactivateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/${id}/deactivate`, {});
  }
  assignRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.base}/users/${id}/role`, {}, { params: { role } });
  }

  // Influencers
  listInfluencers(page = 0, size = 50): Observable<Page<Influencer>> {
    return this.http.get<Page<Influencer>>(`${this.base}/influencers`, { params: { page, size } });
  }
  getInfluencer(id: number): Observable<Influencer> {
    return this.http.get<Influencer>(`${this.base}/influencers/${id}`);
  }
  createInfluencer(payload: InfluencerPayload): Observable<Influencer> {
    return this.http.post<Influencer>(`${this.base}/influencers`, payload);
  }
  updateInfluencer(id: number, payload: InfluencerPayload): Observable<Influencer> {
    return this.http.put<Influencer>(`${this.base}/influencers/${id}`, payload);
  }
  activateInfluencer(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/influencers/${id}/activate`, {});
  }
  deactivateInfluencer(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/influencers/${id}/deactivate`, {});
  }
  deleteInfluencer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/influencers/${id}`);
  }
  updateInfluencerSalesCount(id: number, salesCount: number): Observable<Influencer> {
    return this.http.patch<Influencer>(`${this.base}/influencers/${id}/sales-count`, { salesCount });
  }
  uploadInfluencerImage(file: File): Observable<{ url: string }> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/products/upload-image`, form);
  }

  // Influencer-specific discounts
  listInfluencerDiscounts(): Observable<InfluencerDiscount[]> {
    return this.http.get<InfluencerDiscount[]>(`${this.base}/influencer-discounts`);
  }
  upsertInfluencerDiscount(payload: InfluencerDiscountPayload): Observable<InfluencerDiscount> {
    return this.http.post<InfluencerDiscount>(`${this.base}/influencer-discounts`, payload);
  }
  deleteInfluencerDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/influencer-discounts/${id}`);
  }

  // Product/category campaign discounts (festival offers, etc.)
  listDiscounts(page = 0, size = 50): Observable<Page<Discount>> {
    return this.http.get<Page<Discount>>(`${this.base}/discounts`, { params: { page, size } });
  }
  getDiscount(id: number): Observable<Discount> {
    return this.http.get<Discount>(`${this.base}/discounts/${id}`);
  }
  createDiscount(payload: DiscountPayload): Observable<Discount> {
    return this.http.post<Discount>(`${this.base}/discounts`, payload);
  }
  updateDiscount(id: number, payload: DiscountPayload): Observable<Discount> {
    return this.http.put<Discount>(`${this.base}/discounts/${id}`, payload);
  }
  activateDiscount(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/discounts/${id}/activate`, {});
  }
  deactivateDiscount(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/discounts/${id}/deactivate`, {});
  }
  deleteDiscount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/discounts/${id}`);
  }

  // Cart analytics
  listCartAnalytics(page = 0, size = 100): Observable<Page<CartAnalyticsRow>> {
    return this.http.get<Page<CartAnalyticsRow>>(`${this.base}/cart-analytics`, { params: { page, size } });
  }
}
