import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { StoreSettings } from '../models/settings.model';

/**
 * Store branding, loaded once before the app paints so the name is never briefly wrong.
 * Every screen reads the signal, so an admin rename takes effect everywhere at once.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);
  private title = inject(Title);

  /** Used until the real settings arrive, and if the request ever fails. */
  private readonly fallback: StoreSettings = {
    storeName: 'Trendly',
    tagline: 'Products worn and recommended by the creators you already follow.',
    announcements: ['Free shipping on orders over ₹999', 'Easy 7-day returns'],
    supportHours: '10am–7pm, Mon–Fri'
  };

  readonly settings = signal<StoreSettings>(this.fallback);
  readonly storeName = computed(() => this.settings().storeName);

  /** Called at startup. Resolves even on failure so a settings outage can't block the app. */
  load(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${environment.apiUrl}/public/settings`).pipe(
      tap(s => this.apply(s)),
      catchError(() => of(this.fallback))
    );
  }

  /** Called by the admin screen after a save, so the rename shows immediately. */
  apply(s: StoreSettings) {
    this.settings.set({ ...this.fallback, ...s, announcements: s.announcements?.length ? s.announcements : this.fallback.announcements });
    this.title.setTitle(`${this.settings().storeName} — ${this.settings().tagline ?? 'Shop'}`);
  }

  fetchForAdmin(): Observable<StoreSettings> {
    return this.http.get<StoreSettings>(`${environment.apiUrl}/admin/settings`);
  }

  save(payload: StoreSettings): Observable<StoreSettings> {
    return this.http.put<StoreSettings>(`${environment.apiUrl}/admin/settings`, payload)
      .pipe(tap(s => this.apply(s)));
  }
}
