import { Product } from './product.model';

export type MediaType = 'IMAGE' | 'VIDEO';
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export interface Post {
  id: number;
  influencerName: string;
  influencerProfileImageUrl?: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  hashtags?: string;
  status: PostStatus;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  products: Product[];
  createdAt: string;

  // client-only UI state
  liked?: boolean;
  saved?: boolean;
  muted?: boolean;
}
