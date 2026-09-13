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
  productUrl: string;
  affiliateUrl?: string;
  active: boolean;
  urlApproved: boolean;
  discountedPrice: number;
  discountLabel?: string;
  hasDiscount: boolean;
  createdAt: string;
}
