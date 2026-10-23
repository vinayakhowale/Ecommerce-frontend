import { Post } from './post.model';

export interface ProductClickStat {
  productId: number;
  productName: string;
  clicks: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalPosts: number;
  totalUsers: number;
  totalProductClicks: number;
  totalAddToCartEvents: number;
  mostViewedPosts: Post[];
  mostClickedProducts: ProductClickStat[];
  recentUploads: Post[];
}
