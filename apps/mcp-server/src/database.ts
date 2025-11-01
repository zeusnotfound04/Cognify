import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";

export async function validateDatabase(): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await axios.get(`${BASE_URL}/health/database`, {
      timeout: 10000
    });
    
    return {
      valid: response.data.database === 'connected' && response.data.migrations === 'up-to-date'
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.data?.error || 'Database health check failed'
    };
  }
}

export async function validateVectorTables(): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await axios.get(`${BASE_URL}/health/vector`, {
      timeout: 5000
    });
    
    return {
      valid: response.data.vectorExtension === 'enabled' && response.data.memoryTable === 'exists'
    };
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.data?.error || 'Vector tables validation failed'
    };
  }
}

export async function runStartupChecks(): Promise<{ success: boolean; errors: string[] }> {
  const errors: string[] = [];
  
  const dbCheck = await validateDatabase();
  if (!dbCheck.valid) {
    errors.push(`Database: ${dbCheck.error}`);
  }
  
  const vectorCheck = await validateVectorTables();
  if (!vectorCheck.valid) {
    errors.push(`Vector tables: ${vectorCheck.error}`);
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}