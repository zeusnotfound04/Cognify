import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
interface Memory {
  id: string;
  content: string;
  metadata?: any;
  createdAt: string;
  similarity?: number;
}

interface CreateMemoryRequest {
  content: string;
  metadata?: any;
}

interface SearchMemoryRequest {
  query: string;
  limit?: number;
}

// API functions
const API_BASE_URL = 'http://localhost:8888';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token'); // Changed from 'token' to 'auth_token'
  console.log('Debug - Retrieved token:', token ? 'Token exists' : 'No token found');
  console.log('Debug - Token length:', token?.length || 0);
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const memoryApi = {
  // Create memory
  createMemory: async (data: CreateMemoryRequest): Promise<Memory> => {
    const response = await fetch(`${API_BASE_URL}/memory`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    console.log('Create Memory Response:', response);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create memory');
    }

    return response.json();
  },

  // Get user memories
  getUserMemories: async (): Promise<Memory[]> => {
    const response = await fetch(`${API_BASE_URL}/memory`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch memories');
    }

    return response.json();
  },

  // Search memories
  searchMemories: async (data: SearchMemoryRequest): Promise<Memory[]> => {
    const response = await fetch(`${API_BASE_URL}/memory/search`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to search memories');
    }

    return response.json();
  },
};

// Query keys
export const memoryKeys = {
  all: ['memories'] as const,
  lists: () => [...memoryKeys.all, 'list'] as const,
  list: (filters: string) => [...memoryKeys.lists(), filters] as const,
  details: () => [...memoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...memoryKeys.details(), id] as const,
  search: (query: string) => [...memoryKeys.all, 'search', query] as const,
};

// Hooks
export function useMemories() {
  return useQuery({
    queryKey: memoryKeys.lists(),
    queryFn: memoryApi.getUserMemories,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoryApi.createMemory,
    onSuccess: (newMemory) => {
      // Update the memories list cache
      queryClient.setQueryData<Memory[]>(memoryKeys.lists(), (old = []) => [
        newMemory,
        ...old,
      ]);

      // Invalidate and refetch memories
      queryClient.invalidateQueries({ queryKey: memoryKeys.lists() });

      toast.success('Memory stored successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to store memory');
    },
  });
}

export function useSearchMemories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memoryApi.searchMemories,
    onSuccess: (results, variables) => {
      // Cache search results
      queryClient.setQueryData(memoryKeys.search(variables.query), results);
      
      if (results.length > 0) {
        toast.success(`Found ${results.length} memories`);
      } else {
        toast.info('No memories found for your search');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to search memories');
    },
  });
}

// Prefetch hook for better performance
export function usePrefetchMemories() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: memoryKeys.lists(),
      queryFn: memoryApi.getUserMemories,
      staleTime: 2 * 60 * 1000,
    });
  };
}