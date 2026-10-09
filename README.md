# Trendly — Social Commerce Frontend (Angular)

The public-facing storefront + admin panel for an admin-controlled influencer product
discovery platform. Influencers never log in; all content is uploaded and published by admins.

## Tech Stack

- Angular 18 (standalone components, signals, new `@if`/`@for` control flow)
- RxJS
- Plain SCSS design system (no UI kit) — see `src/styles.scss` for tokens
- JWT auth stored in `localStorage`, attached via an HTTP interceptor

## Getting Started

Requires Node.js 20+ and the Angular CLI (`npm i -g @angular/cli`, or just use `npx`).

```bash
cd frontend
npm install
npm start
```

The app runs at `http://localhost:4200` and expects the backend at `http://localhost:8080`
(see `src/environments/environment.ts`). Update `apiUrl` there — or `environment.prod.ts`
for production builds — to point at your deployed backend.

## Build

```bash
npm run build:prod
```

Output goes to `dist/social-commerce-frontend/browser`.

## Docker

```bash
docker build -t socommerce-frontend .
docker run -p 80:80 socommerce-frontend
```

`nginx.conf` proxies `/api/*` and `/uploads/*` to a `backend` service — adjust the
`proxy_pass` host if your backend is deployed elsewhere (e.g. behind a load balancer or a
different Docker Compose service name).

## App Structure

```
src/app/
  core/
    models/        # TS interfaces mirroring backend DTOs
    services/       # AuthService, ProductService, PostService, CartService, BuyNowService, AdminService
    guards/          # authGuard, adminGuard
    interceptors/    # JWT attach + 401 handling
  shared/
    main-layout.component.ts     # sidebar (desktop) / bottom nav (mobile) shell
    components/
      product-card.component.ts  # reusable product tile w/ Add to Cart + Buy Now
      post-card.component.ts     # TikTok/Instagram-style feed unit (video/image, likes, tagged products)
      toast-host.component.ts    # global toast notifications
  features/
    feed/            # Home — main social feed
    explore/         # Trending grid
    categories/      # Browse by category
    search/          # Live product + post search
    product-detail/  # PDP with related posts
    cart/             # Full cart management
    profile/          # User profile + quick links
    auth/             # Login / Register
    admin/            # Dashboard, Products (list/form), Posts (list/form w/ live preview), Users
```

## Key UX / Security Notes

- **Buy Now never carries a URL from the client.** `BuyNowService.requestRedirect()` sends only
  a `productId` (+ optional `postId`); the backend resolves and validates the actual redirect
  target and returns it. The frontend only opens whatever URL comes back, and even then double
  checks it's `http(s)://` before calling `window.open`.
- **Feed video behavior**: each `PostCardComponent` uses an `IntersectionObserver` to autoplay
  the video only while it's mostly in view, pause when scrolled away, and fire a single
  "recorded view" event the first time it becomes visible — matching the pagination/lazy-loading
  requirement without loading every video eagerly.
- **Cart totals** are always whatever the backend returns from `/api/cart` — the frontend does
  not compute or trust its own subtotal math beyond display formatting.
- **Role gating**: `adminGuard` blocks `/admin/**` for non-admins client-side; the backend's
  `@PreAuthorize` annotations are the actual source of truth.

## Suggested Next Steps

- Add e2e tests (Playwright/Cypress) around the Buy Now and cart flows.
- Add optimistic UI + retry/backoff on the feed's `recordView` calls.
- Introduce a design system doc or Storybook if the component set grows further.
- Consider moving JWT to an httpOnly cookie (with a small backend adjustment) to reduce XSS risk
  versus `localStorage`.
