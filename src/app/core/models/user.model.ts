export type RoleName = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
  phone?: string;
  role: RoleName;
  active: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}
