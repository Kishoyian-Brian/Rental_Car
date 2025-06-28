export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  redirectUrl?: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role: string;
  };
} 