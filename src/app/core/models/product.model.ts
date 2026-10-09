export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  brand?: string;
  category?: string;
  seller?: string;
  productImageUrl?: string;
  imageUrls?: string[];
  productUrl?: string;
  affiliateUrl?: string;
  razorpayAccountId?: string;
  payInApp: boolean;
  active: boolean;
  urlApproved: boolean;
  discountedPrice: number;
  discountLabel?: string;
  hasDiscount: boolean;
  createdAt: string;
  updatedAt?: string;
}
