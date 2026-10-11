import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Post } from '../../core/models/post.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <div>
        <p class="eyebrow">Content</p>
        <h1>Posts</h1>
      </div>
      <a routerLink="/admin/posts/new" class="btn btn-accent">+ New Post</a>
    </header>

    @if (loading) {
      <div class="grid">
        @for (i of [1,2,3,4]; track i) { <div class="skeleton skel-card"></div> }
      </div>
    } @else if (posts.length === 0) {
      <div class="empty-state">
        <span class="emoji">🎬</span>
        <h3>No posts yet</h3>
      </div>
    } @else {
      <div class="grid">
        @for (p of posts; track p.id) {
          <div class="post-card card">
            <div class="thumb">
              @if (p.mediaType === 'IMAGE') {
                <img [src]="p.mediaUrl | mediaUrl" [alt]="p.caption">
              } @else {
                <video [src]="p.mediaUrl | mediaUrl" [poster]="p.thumbnailUrl | mediaUrl" muted></video>
              }
              <span class="status" [class]="p.status.toLowerCase()">{{ p.status }}</span>
            </div>
            <div class="body">
              <span class="influencer">{{ p.influencerName }}</span>
              <span class="caption">{{ p.caption || 'No caption' }}</span>
              <span class="stats">{{ p.viewCount }} views · {{ p.likeCount }} likes · {{ p.products.length }} products</span>
              <div class="actions">
                <a [routerLink]="['/admin/posts', p.id, 'edit']" class="btn btn-outline btn-sm">Edit</a>
                @if (p.status === 'PUBLISHED') {
                  <button class="btn btn-ghost btn-sm" (click)="unpublish(p)">Unpublish</button>
                } @else {
                  <button class="btn btn-ghost btn-sm" (click)="publish(p)">Publish</button>
                }
                <button class="btn btn-ghost btn-sm danger" (click)="remove(p)">Delete</button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 26px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
    .skel-card { aspect-ratio: 0.72; }
    .post-card { overflow: hidden; }
    .thumb { position: relative; aspect-ratio: 9/12; background: var(--ink); }
    .thumb img, .thumb video { width: 100%; height: 100%; object-fit: cover; }
    .status { position: absolute; top: 11px; left: 11px; font-size: 10.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; background: rgba(0,0,0,0.5); color: white; }
    .status.published { background: var(--jade); }
    .status.draft { background: #ffb020; color: #4a3200; }
    .body { padding: 15px; display: flex; flex-direction: column; gap: 4px; }
    .influencer { font-weight: 700; font-size: 13.5px; }
    .caption { font-size: 12.5px; color: var(--ink-soft); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .stats { font-size: 11px; color: var(--ink-soft); margin-top: 4px; font-weight: 600; }
    .actions { display: flex; gap: 6px; margin-top: 11px; flex-wrap: wrap; }
    .danger { color: var(--poppy); }
  `]
})
export class AdminPostsComponent implements OnInit {
  posts: Post[] = [];
  loading = true;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.listPosts(0, 100).subscribe({
      next: (res) => { this.posts = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  publish(p: Post) {
    this.adminService.publishPost(p.id).subscribe({
      next: (res) => { p.status = res.status; this.toast.success('Post published'); },
      error: () => this.toast.error('Could not publish post')
    });
  }

  unpublish(p: Post) {
    this.adminService.unpublishPost(p.id).subscribe({
      next: (res) => { p.status = res.status; this.toast.success('Post unpublished'); },
      error: () => this.toast.error('Could not unpublish post')
    });
  }

  remove(p: Post) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    this.adminService.deletePost(p.id).subscribe({
      next: () => {
        this.posts = this.posts.filter(x => x.id !== p.id);
        this.toast.success('Post deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not delete post')
    });
  }
}
