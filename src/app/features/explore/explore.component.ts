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
  <div class="explore-page">
    <header>
      <p class="eyebrow">Trending</p>
      <h1>Explore the shelf</h1>
    </header>

    @if (loading) {
      <div class="masonry">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="skeleton skeleton-tile" [style.aspect-ratio]="i % 3 === 0 ? '3/4.6' : (i % 2 === 0 ? '3/3.6' : '3/4.2')"></div>
        }
      </div>
    } @else if (posts.length === 0) {
      <div class="empty-state">
        <span class="emoji">🧭</span>
        <h3>Nothing trending yet</h3>
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
              <span class="tile-views">{{ post.viewCount }} views</span>
            </div>
          </a>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    .explore-page { max-width: 1100px; margin: 0 auto; padding: 40px 20px 60px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 28px; margin-bottom: 24px; }
    .masonry {
      columns: 2 220px;
      column-gap: 14px;
    }
    .tile, .skeleton-tile {
      display: block;
      break-inside: avoid;
      margin-bottom: 14px;
      border-radius: var(--r-md);
      overflow: hidden;
      position: relative;
      background: var(--ink);
    }
    .tile img, .tile video { width: 100%; height: 100%; object-fit: cover; display: block; }
    .tile { transition: transform var(--dur-med) var(--ease-out); }
    .tile:hover { transform: translateY(-3px); }
    .play-badge {
      position: absolute; top: 10px; right: 10px;
      background: rgba(0,0,0,0.45); backdrop-filter: blur(4px);
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .tile-meta {
      position: absolute; bottom: 0; left: 0; right: 0;
      padding: 10px 12px;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
      color: white;
      display: flex; flex-direction: column; gap: 2px;
    }
    .tile-price { font-size: 15px; }
    .tile-views { font-size: 10.5px; opacity: 0.75; font-weight: 600; }
    @media (min-width: 640px) { .masonry { columns: 4 220px; } }
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
