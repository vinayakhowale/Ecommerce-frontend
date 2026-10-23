import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  link?: any[] | string;
  queryParams?: Record<string, string>;
}

/** Home › Category › Product. The last crumb is the current page and is not a link. */
@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `
  <nav class="crumbs" aria-label="Breadcrumb">
    <ol>
      @for (c of items; track $index; let last = $last) {
        <li>
          @if (!last && c.link) {
            <a [routerLink]="c.link" [queryParams]="c.queryParams">{{ c.label }}</a>
            <svg class="chev" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          } @else {
            <span class="current" aria-current="page">{{ c.label }}</span>
          }
        </li>
      }
    </ol>
  </nav>
  `,
  styles: [`
    .crumbs { padding-block: 1.1rem; font-size: var(--t-xs); }
    ol { display: flex; flex-wrap: wrap; align-items: center; gap: 0.35rem; list-style: none; margin: 0; padding: 0; }
    li { display: inline-flex; align-items: center; gap: 0.35rem; min-width: 0; }
    a { color: var(--ink-soft); font-weight: 600; }
    a:hover { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
    .chev { width: 13px; height: 13px; color: var(--ink-faint); flex-shrink: 0; }
    .current { color: var(--ink-faint); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 46ch; }
  `]
})
export class BreadcrumbsComponent {
  @Input({ required: true }) items: Crumb[] = [];
}
