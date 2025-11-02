import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { getUserMcpApiKey } from '../services/authService';

// Get the user's MCP API key
export const getUserApiKey = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mcpApiKey = await getUserMcpApiKey(userId);
    
    if (!mcpApiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    res.json({ 
      mcpApiKey,
      instructions: {
        title: 'Your MCP API Key',
        description: 'Use this key to configure Cognify in your IDE (Cursor, Claude Desktop, etc.)',
        usage: 'Set this as COGNIFY_API_KEY in your MCP client configuration',
        serverUrl: process.env.BACKEND_URL || 'http://localhost:8888'
      }
    });
  } catch (error) {
    console.error('Error fetching user API key:', error);
    res.status(500).json({ error: 'Failed to fetch API key' });
  }
};