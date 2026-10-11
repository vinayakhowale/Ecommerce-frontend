export interface CartItemView {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  price: number;
  currency: string;
  quantity: number;
  subtotal: number;
  productActive: boolean;
  discountedPrice: number;
  discountLabel?: string;
  hasDiscount: boolean;
  payInApp: boolean;
}

export interface CartResponse {
  items: CartItemView[];
  total: number;
  itemCount: number;
}
