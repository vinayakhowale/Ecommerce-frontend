import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="container explore-page">
    <header class="page-head">
      <h1>The edit</h1>
      <p>Everything creators have posted lately, newest first. Tap a shot to shop the piece.</p>
    </header>

    @if (loading) {
      <div class="masonry">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="skeleton skeleton-tile" [style.aspect-ratio]="i % 3 === 0 ? '3/4.6' : (i % 2 === 0 ? '3/3.6' : '3/4.2')"></div>
        }
      </div>
    } @else if (posts.length === 0) {
      <div class="empty-state">
        <h3>No posts yet</h3>
        <p>Creator posts will appear here as soon as they go live.</p>
      </div>
    } @else {
      <div class="masonry">
        @for (post of posts; track post.id; let i = $index) {
          <a class="tile stagger-in" [style.animation-delay.ms]="i < 8 ? i * 45 : 0" [routerLink]="['/product', post.products[0].id]">
            @if (post.mediaType === 'IMAGE') {
              <img [src]="post.mediaUrl | mediaUrl" [alt]="post.caption" loading="lazy">
            } @else {
              <video [src]="post.mediaUrl | mediaUrl" [poster]="post.thumbnailUrl | mediaUrl" muted preload="metadata"></video>
              <span class="play-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7Z"/></svg>
              </span>
            }
            <div class="tile-meta">
              <span class="tile-price num">{{ post.products[0].currency }} {{ post.products[0].price | number:'1.0-2' }}</span>
              <span class="tile-by">{{ post.influencerName }}</span>
            </div>
          </a>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    .explore-page { padding-block: clamp(1.5rem, 4vw, 3rem) var(--section); }
    .page-head { margin-bottom: clamp(1.5rem, 3vw, 2.5rem); }
    .page-head h1 { font-size: var(--t-h1); }
    .page-head p { margin-top: 0.75rem; color: var(--ink-soft); font-size: var(--t-sm); max-width: 48ch; }

    .masonry { columns: 2 200px; column-gap: clamp(0.6rem, 1.4vw, 1.25rem); }
    @media (min-width: 900px) { .masonry { columns: 4 220px; } }

    .tile, .skeleton-tile {
      display: block; break-inside: avoid;
      margin-bottom: clamp(0.6rem, 1.4vw, 1.25rem);
      border-radius: var(--r-md); overflow: hidden;
      position: relative; background: var(--paper-deep);
    }
    .tile img, .tile video { width: 100%; height: 100%; object-fit: cover; }
    .tile img { transition: transform var(--dur-slow) var(--ease-out); }
    @media (hover: hover) { .tile:hover img { transform: scale(1.04); } }

    .play-badge {
      position: absolute; top: 0.6rem; right: 0.6rem;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .tile-meta {
      position: absolute; inset-inline: 0; bottom: 0;
      padding: 1.75rem 0.8rem 0.7rem;
      background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
      color: #fff; display: flex; flex-direction: column; gap: 1px;
    }
    .tile-price { font-size: 0.95rem; }
    .tile-by { font-size: var(--t-xs); opacity: 0.8; font-weight: 600; }
`]
})
export class ExploreComponent implements OnInit {
  posts: Post[] = [];
  loading = false;

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loading = true;
    this.postService.explore(0, 24).subscribe({
      next: (res) => { this.posts = res.content.filter(p => p.products.length > 0); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
