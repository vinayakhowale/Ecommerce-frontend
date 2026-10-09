export interface Influencer {
  id: number;
  name: string;
  code: string;
  profileImageUrl?: string;
  email?: string;
  phone?: string;
  active: boolean;
  salesCount: number;
  createdAt: string;
}

export interface InfluencerDiscount {
  id: number;
  influencerId: number;
  influencerName: string;
  influencerCode: string;
  discountPercentage: number;
  notes?: string;
  active: boolean;
  monthlySalesCount: number;
  createdAt: string;
}
