import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

// API functions
const API_BASE_URL = 'http://localhost:8888';

const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  },

  verifyToken: async (): Promise<User> => {
    const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem('auth_token'); // Changed from 'token' to 'auth_token'
      throw new Error('Token verification failed');
    }

    const data = await response.json();
    return data.user || data; // Handle different response formats
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token'); // Changed from 'token' to 'auth_token'
    // If you have a logout endpoint on the server:
    // const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${localStorage.getItem('auth_token')}`, // Changed from 'token' to 'auth_token'
    //   },
    // });
  },
};

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  verify: () => [...authKeys.all, 'verify'] as const,
};

// Hooks
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token); // Changed from 'token' to 'auth_token'
      
      // Set user data in cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      toast.success('Welcome back!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token); // Changed from 'token' to 'auth_token'
      
      // Set user data in cache
      queryClient.setQueryData(authKeys.user(), data.user);
      
      toast.success('Account created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed');
    },
  });
}

export function useAuth() {
  return useQuery({
    queryKey: authKeys.verify(),
    queryFn: authApi.verifyToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Helper hook to get current user data
export function useUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: () => {
      // This should be populated by login/register or auth verification
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      return userData;
    },
    enabled: false, // Only run when explicitly needed
  });
}