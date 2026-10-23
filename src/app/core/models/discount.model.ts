export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type DiscountScope = 'PRODUCT' | 'CATEGORY';

export interface Discount {
  id: number;
  name: string;
  type: DiscountType;
  value: number;
  scope: DiscountScope;
  productId?: number;
  productName?: string;
  category?: string;
  startAt: string;
  endAt: string;
  conditions?: string;
  active: boolean;
  currentlyLive: boolean;
  createdAt: string;
}
