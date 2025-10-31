export interface CognifyClientConfig {
  authToken: string;
  serverCommand?: string;
  serverArgs?: string[];
}

export interface StoreContextOptions {
  content: string;
  metadata?: {
    title?: string;
    source?: string;
    importance?: number;
    [key: string]: any;
  };
}

export interface SearchContextOptions {
  query: string;
  limit?: number;
}

export interface MemoryResult {
  id: string;
  content: string;
  metadata?: any;
  createdAt: string;
  similarity?: number;
}

export interface StoreContextResult {
  id: string;
  content: string;
  createdAt: string;
}

export interface SearchContextResult {
  memories: MemoryResult[];
  total: number;
}