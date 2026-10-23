import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';

/** About us: written by the admin in Settings, with a sensible default until they do. */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, MediaUrlPipe, BreadcrumbsComponent],
  template: `
  <div class="container about">
    <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'About us' }]" />

    <div class="layout" [class.no-image]="!s().aboutImageUrl">
      <div class="copy">
        <p class="eyebrow">About {{ s().storeName }}</p>
        <h1>{{ s().aboutHeading || defaultHeading }}</h1>
        @for (para of paragraphs(); track $index) {
          <p>{{ para }}</p>
        }
        <div class="actions">
          <a class="btn btn-primary" routerLink="/categories">Shop the store</a>
          <a class="btn btn-outline" routerLink="/track-order">Track an order</a>
        </div>
      </div>
      @if (s().aboutImageUrl) {
        <figure class="art"><img [src]="s().aboutImageUrl! | mediaUrl" [alt]="s().storeName"></figure>
      }
    </div>

    @if (s().supportEmail || s().supportPhone) {
      <section class="contact card">
        <h2>Get in touch</h2>
        <div class="contact-grid">
          @if (s().supportEmail) { <p><span>Email</span><a [href]="'mailto:' + s().supportEmail">{{ s().supportEmail }}</a></p> }
          @if (s().supportPhone) { <p><span>Phone</span><a [href]="'tel:' + s().supportPhone">{{ s().supportPhone }}</a></p> }
          @if (s().supportHours) { <p><span>Hours</span>{{ s().supportHours }}</p> }
        </div>
      </section>
    }
  </div>
  `,
  styles: [`
    .about { padding-bottom: var(--section); }
    .layout { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: clamp(1.5rem, 5vw, 4.5rem); align-items: center; padding-top: clamp(0.5rem, 2vw, 1.5rem); }
    .layout.no-image { grid-template-columns: minmax(0, 760px); }
    .eyebrow { font-size: var(--t-xs); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--vetiver-deep); margin: 0 0 0.8rem; }
    h1 { font-size: var(--t-h1); max-width: 20ch; margin-bottom: 1.2rem; }
    .copy p:not(.eyebrow) { color: var(--ink-soft); line-height: 1.75; max-width: 62ch; margin: 0 0 1rem; }
    .actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.75rem; }
    .art { margin: 0; aspect-ratio: 4 / 5; border-radius: var(--r-lg); overflow: hidden; background: var(--paper-deep); }
    .art img { width: 100%; height: 100%; object-fit: cover; }
    .contact { margin-top: clamp(2.5rem, 6vw, 4.5rem); padding: clamp(1.25rem, 3vw, 2rem); }
    .contact h2 { font-size: 1.3rem; margin-bottom: 1rem; }
    .contact-grid { display: flex; flex-wrap: wrap; gap: 1rem 3rem; }
    .contact-grid p { margin: 0; display: flex; flex-direction: column; gap: 0.2rem; font-size: var(--t-sm); }
    .contact-grid span { font-size: var(--t-xs); color: var(--ink-faint); font-weight: 700; }
    .contact-grid a { text-decoration: underline; text-underline-offset: 3px; }
    @media (max-width: 800px) {
      .layout { grid-template-columns: 1fr; }
      .art { order: -1; aspect-ratio: 3 / 2; }
    }
  `]
})
export class AboutComponent {
  private settings = inject(SettingsService);
  readonly s = this.settings.settings;
  readonly defaultHeading = 'Products picked by the creators you already trust.';

  readonly paragraphs = computed(() => {
    const body = this.s().aboutBody?.trim();
    if (body) return body.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean);
    const name = this.s().storeName;
    return [
      `${name} started with a simple idea: the best product recommendations come from people who actually use them. Every piece in the store has been worn, tested or reviewed by a creator before it reaches this page.`,
      'We work directly with creators and brands, keep the range small and considered, and ship quickly with secure payments and easy returns.',
    ];
  });
}
