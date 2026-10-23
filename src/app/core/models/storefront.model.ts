import { Post } from './post.model';

export type BannerPlacement = 'HOME' | 'COLLECTIONS';

export interface Banner {
  id: number;
  placement: BannerPlacement;
  imageUrl: string;
  mobileImageUrl?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  linkUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
}

export interface BannerRequest {
  placement: BannerPlacement;
  imageUrl: string;
  mobileImageUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaLabel?: string | null;
  linkUrl?: string | null;
  sortOrder?: number | null;
  active?: boolean | null;
}

export interface Category {
  name: string;
  productCount: number;
  imageUrl?: string;
}

export interface Review {
  id: number;
  productId: number;
  productName: string;
  reviewerName: string;
  rating: number;
  title?: string;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}

export interface ReviewSummary {
  productId: number;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewDetail extends ReviewSummary {
  /** Keys "1".."5" → number of reviews at that star level. */
  distribution: Record<string, number>;
}

export type FulfillmentStatus =
  'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export const FULFILLMENT_STATUSES: { value: FulfillmentStatus; label: string }[] = [
  { value: 'CONFIRMED', label: 'Order confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
];

export interface TrackingStep {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
  at?: string;
}

export interface OrderTracking {
  id: number;
  orderNumber: string;
  productName: string;
  productId?: number;
  productImageUrl?: string;
  quantity: number;
  totalAmount: number;
  currency: string;
  customerName?: string;
  customerEmail?: string;
  status: FulfillmentStatus;
  statusLabel: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  expectedDeliveryDate?: string;
  note?: string;
  placedAt: string;
  deliveredAt?: string;
  steps: TrackingStep[];
}

export interface FulfillmentUpdate {
  status: FulfillmentStatus;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  expectedDeliveryDate?: string | null;
  note?: string | null;
}

export interface CreatorProfile {
  influencerId: number;
  name: string;
  code?: string;
  profileImageUrl?: string;
  salesCount: number;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

/** A post as returned to creators and admins, with the approval fields. */
export interface CreatorVideo extends Post {
  reviewStatus?: ReviewStatus;
  reviewNote?: string;
}

export interface CreatorVideoRequest {
  mediaUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  hashtags?: string | null;
  productIds: number[];
}
