import { Request, Response, NextFunction } from 'express';
import { authenticateByMcpApiKey } from '../services/authService';

export interface MCPRequest extends Request {
  fromMCP?: boolean;
  mcpUserId?: string;
}

export async function validateMCPService(req: MCPRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const mcpHeader = req.headers['x-mcp-service'];
  
  // Legacy MCP service validation (keep for backward compatibility)
  if (mcpHeader === 'cognify-mcp' && token === process.env.MCP_SERVICE_TOKEN) {
    req.fromMCP = true;
    req.mcpUserId = req.body.userId || 'anonymous';
    return next();
  }
  
  // New MCP API key validation
  if (token && token.startsWith('mcp_')) {
    try {
      const user = await authenticateByMcpApiKey(token);
      if (user) {
        req.fromMCP = true;
        req.mcpUserId = user.id;
        return next();
      }
    } catch (error) {
      console.error('MCP API key authentication failed:', error);
      return res.status(401).json({ error: 'Invalid MCP API key' });
    }
  }
  
  next();
}