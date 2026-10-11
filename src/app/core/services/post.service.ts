import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Post } from '../models/post.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private base = `${environment.apiUrl}/public`;

  constructor(private http: HttpClient) {}

  feed(page = 0, size = 10): Observable<Page<Post>> {
    return this.http.get<Page<Post>>(`${this.base}/feed`, { params: { page, size } });
  }

  explore(page = 0, size = 20): Observable<Page<Post>> {
    return this.http.get<Page<Post>>(`${this.base}/explore`, { params: { page, size } });
  }

  search(q: string, page = 0, size = 20): Observable<Page<Post>> {
    const params = new HttpParams().set('q', q).set('page', page).set('size', size);
    return this.http.get<Page<Post>>(`${this.base}/search`, { params });
  }

  get(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.base}/posts/${id}`);
  }

  recordView(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/posts/${id}/view`, {});
  }

  like(id: number): Observable<{ liked: boolean }> {
    return this.http.post<{ liked: boolean }>(`${environment.apiUrl}/posts/${id}/like`, {});
  }

  save(id: number): Observable<{ saved: boolean }> {
    return this.http.post<{ saved: boolean }>(`${environment.apiUrl}/posts/${id}/save`, {});
  }
}
