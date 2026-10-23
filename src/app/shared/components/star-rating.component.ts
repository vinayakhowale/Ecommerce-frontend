import { Component, Input } from '@angular/core';

/** Read-only stars with partial fill, e.g. 4.3 → four full stars and a third of the fifth. */
@Component({
  selector: 'app-stars',
  standalone: true,
  template: `
  <span class="stars" [style.--size]="size + 'px'" role="img" [attr.aria-label]="label()">
    @for (i of [0,1,2,3,4]; track i) {
      <span class="star">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path [attr.d]="path" class="bg"/></svg>
        <span class="fill" [style.width.%]="fill(i)">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path [attr.d]="path" class="fg"/></svg>
        </span>
      </span>
    }
  </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .stars { display: inline-flex; gap: 1px; --size: 14px; }
    .star { position: relative; width: var(--size); height: var(--size); display: inline-block; }
    .star svg { width: var(--size); height: var(--size); display: block; }
    .fill { position: absolute; inset: 0 auto 0 0; overflow: hidden; }
    .bg { fill: var(--line-strong); }
    .fg { fill: #e0a526; }
  `]
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() size = 14;

  readonly path = 'M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.5l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z';

  fill(i: number): number {
    return Math.max(0, Math.min(1, this.value - i)) * 100;
  }

  label(): string {
    return `Rated ${this.value.toFixed(1)} out of 5`;
  }
}
