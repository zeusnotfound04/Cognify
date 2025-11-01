import { Request, Response, NextFunction } from 'express';

export interface MCPRequest extends Request {
  fromMCP?: boolean;
  mcpUserId?: string;
}

export function validateMCPService(req: MCPRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const mcpHeader = req.headers['x-mcp-service'];
  
  if (mcpHeader === 'cognify-mcp' && token === process.env.MCP_SERVICE_TOKEN) {
    req.fromMCP = true;
    req.mcpUserId = req.body.userId || 'anonymous';
    return next();
  }
  
  next();
}