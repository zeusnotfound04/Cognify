import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  delete api.defaults.headers.common['Authorization'];
};

// Initialize token on app load
const initializeToken = () => {
  const token = getAuthToken();
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Call on module load
if (typeof window !== 'undefined') {
  initializeToken();
}

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface Memory {
  id: string;
  userId: string;
  title?: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  metadata?: any;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  query: string;
}

export interface ChatResponse {
  answer: string;
  metadata: {
    memoriesUsed: number;
    contextSize: number;
  };
}

// Auth API calls
export const authAPI = {
  async register(credentials: RegisterCredentials): Promise<{ user: User; message: string }> {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string; message: string }> {
    const response = await api.post('/auth/login', credentials);
    const { token } = response.data;
    setAuthToken(token);
    return response.data;
  },

  async logout(): Promise<{ message: string }> {
    const response = await api.post('/auth/logout');
    removeAuthToken();
    return response.data;
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(updates: Partial<{ name: string; username: string }>): Promise<{ user: User; message: string }> {
    const response = await api.put('/auth/profile', updates);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await api.put('/auth/password', data);
    return response.data;
  },
};

// Memory API calls
export const memoryAPI = {
  async createMemory(content: string, metadata?: any): Promise<Memory> {
    const response = await api.post('/memory', { content, metadata });
    return response.data;
  },

  async getUserMemories(): Promise<Memory[]> {
    const response = await api.get('/memory');
    return response.data;
  },

  async searchMemories(query: string): Promise<Memory[]> {
    const response = await api.post('/memory/search', { query });
    return response.data;
  },
};

// Chat API calls
export const chatAPI = {
  async sendMessage(query: string): Promise<ChatResponse> {
    const response = await api.post('/chat', { query });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  async check(): Promise<{ status: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;