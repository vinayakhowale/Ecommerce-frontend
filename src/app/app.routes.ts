import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./shared/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent) },
      { path: 'explore', loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent) },
      { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
      { path: 'product/:id', loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    ]
  },
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'posts', loadComponent: () => import('./features/admin/admin-posts.component').then(m => m.AdminPostsComponent) },
      { path: 'posts/new', loadComponent: () => import('./features/admin/admin-post-form.component').then(m => m.AdminPostFormComponent) },
      { path: 'posts/:id/edit', loadComponent: () => import('./features/admin/admin-post-form.component').then(m => m.AdminPostFormComponent) },
      { path: 'products', loadComponent: () => import('./features/admin/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'products/new', loadComponent: () => import('./features/admin/admin-product-form.component').then(m => m.AdminProductFormComponent) },
      { path: 'products/:id/edit', loadComponent: () => import('./features/admin/admin-product-form.component').then(m => m.AdminProductFormComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/admin-users.component').then(m => m.AdminUsersComponent) },
      { path: 'influencers', loadComponent: () => import('./features/admin/admin-influencers.component').then(m => m.AdminInfluencersComponent) },
      { path: 'influencer-sales', loadComponent: () => import('./features/admin/admin-influencer-sales.component').then(m => m.AdminInfluencerSalesComponent) },
      { path: 'influencer-discounts', loadComponent: () => import('./features/admin/admin-influencer-discounts.component').then(m => m.AdminInfluencerDiscountsComponent) },
      { path: 'discounts', loadComponent: () => import('./features/admin/admin-discounts.component').then(m => m.AdminDiscountsComponent) },
      { path: 'cart-analytics', loadComponent: () => import('./features/admin/admin-cart-analytics.component').then(m => m.AdminCartAnalyticsComponent) },
    ]
  },
  { path: '**', redirectTo: '' }
];
