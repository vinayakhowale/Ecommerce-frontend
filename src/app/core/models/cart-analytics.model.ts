export interface CartAnalyticsRow {
  cartItemId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userPhone?: string;
  productId: number;
  productName: string;
  productImageUrl?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  addedAt: string;
  minutesInCart: number;
  durationLabel: string;
}
