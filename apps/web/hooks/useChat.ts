import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  metadata?: {
    memoriesUsed?: number;
    contextSize?: number;
    responseTime?: number;
  };
}

export interface ChatRequest {
  query: string;
  model?: string;
  useMemoryContext?: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  answer: string;
  metadata: {
    memoriesUsed: number;
    contextSize: number;
    model: string;
    responseTime: number;
  };
}

export interface AvailableModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  supportsMemory: boolean;
}

// API functions
const API_BASE_URL = 'http://localhost:8888';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const chatApi = {
  // Send chat message
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    return response.json();
  },

  // Get available models
  getAvailableModels: async (): Promise<AvailableModel[]> => {
    // For now, return static models - this can be made dynamic later
    return [
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Google\'s most capable model for complex reasoning',
        maxTokens: 32000,
        supportsMemory: true,
      },
      {
        id: 'gemini-flash',
        name: 'Gemini Flash',
        description: 'Fast and efficient for quick responses',
        maxTokens: 8000,
        supportsMemory: true,
      },
      {
        id: 'gemini-nano',
        name: 'Gemini Nano',
        description: 'Lightweight model for simple tasks',
        maxTokens: 2000,
        supportsMemory: false,
      },
    ];
  },

  // Get chat history
  getChatHistory: async (): Promise<ChatMessage[]> => {
    // This would typically fetch from backend, for now return from localStorage
    const history = localStorage.getItem('chat_history');
    if (history) {
      return JSON.parse(history).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
    return [];
  },

  // Save chat history
  saveChatHistory: async (messages: ChatMessage[]): Promise<void> => {
    localStorage.setItem('chat_history', JSON.stringify(messages));
  },
};

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  history: () => [...chatKeys.all, 'history'] as const,
  models: () => [...chatKeys.all, 'models'] as const,
  conversation: (id: string) => [...chatKeys.all, 'conversation', id] as const,
};

// Hooks
export function useChatHistory() {
  return useQuery({
    queryKey: chatKeys.history(),
    queryFn: chatApi.getChatHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAvailableModels() {
  return useQuery({
    queryKey: chatKeys.models(),
    queryFn: chatApi.getAvailableModels,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, chatHistory }: { 
      message: ChatRequest; 
      chatHistory: ChatMessage[] 
    }) => {
      const startTime = Date.now();
      const response = await chatApi.sendMessage(message);
      const endTime = Date.now();

      // Create user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message.query,
        timestamp: new Date(startTime),
        model: message.model,
      };

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(endTime),
        model: message.model,
        metadata: {
          ...response.metadata,
          responseTime: endTime - startTime,
        },
      };

      const newHistory = [...chatHistory, userMessage, assistantMessage];
      
      // Save to localStorage
      await chatApi.saveChatHistory(newHistory);
      
      return { response, newHistory };
    },
    onSuccess: ({ newHistory }) => {
      // Update chat history cache
      queryClient.setQueryData(chatKeys.history(), newHistory);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: chatKeys.history() });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}

export function useClearChatHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('chat_history');
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(chatKeys.history(), []);
      toast.success('Chat history cleared');
    },
  });
}