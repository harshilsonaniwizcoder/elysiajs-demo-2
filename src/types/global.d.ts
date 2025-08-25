export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  // Stored as hash; optional when not selected from DB
  password?: string;
  created_at: Date;
  updatedAt: Date;
}

export interface AuthContext {
  user: User;
  token: string;
}

export interface QueueJobData {
  type: string;
  payload: Record<string, unknown>;
  userId?: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  database: {
    url: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceKey: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  rateLimit: {
    max: number;
    windowMs: number;
  };
  security: {
    corsOrigins: string[];
    helmetOptions: Record<string, unknown>;
  };
  logging: {
    level: string;
  };
}