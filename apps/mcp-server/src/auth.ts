import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function validateAuthToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
  try {
    const response = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      valid: true,
      userId: response.data.userId || response.data.id
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.data?.error || 'Invalid token'
    };
  }
}

export async function checkBackendConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    const response = await axios.get(`${BASE_URL}/health`, {
      timeout: 5000
    });
    
    return {
      connected: response.status === 200
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Backend unreachable'
    };
  }
}