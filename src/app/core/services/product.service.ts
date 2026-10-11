import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { Page } from '../models/page.model';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private base = `${environment.apiUrl}/public/products`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20, category?: string): Observable<Page<Product>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (category) params = params.set('category', category);
    return this.http.get<Page<Product>>(this.base, { params });
  }

  newLaunches(page = 0, size = 20): Observable<Page<Product>> {
    return this.http.get<Page<Product>>(`${this.base}/new-launches`, { params: { page, size } });
  }

  search(q: string, page = 0, size = 20): Observable<Page<Product>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<Product>>(`${this.base}/search`, { params });
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  postsForProduct(id: number): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.base}/${id}/posts`);
  }
}
