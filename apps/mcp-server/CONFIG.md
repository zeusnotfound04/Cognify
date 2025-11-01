# MCP Server Configuration Guide

## Option 2: Service Token Authentication (Implemented)

Your MCP server now uses service token authentication instead of individual user JWT tokens.

## Configuration Files

### MCP Server (.env)
```bash
NODE_ENV=development
BACKEND_URL=http://localhost:3001
LOG_LEVEL=info
MCP_SERVICE_TOKEN=cognify-mcp-service-token-12345
```

### Backend (.env)
```bash
JWT_SECRET="your-jwt-secret"
DATABASE_URL="your-database-url"
MCP_SERVICE_TOKEN=cognify-mcp-service-token-12345
```

## Client Configuration Examples

### Cursor IDE
Create or update your Cursor settings:

```json
{
  "mcpServers": {
    "cognify": {
      "command": "node",
      "args": ["C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server\\dist\\index.js"],
      "env": {
        "MCP_SERVICE_TOKEN": "cognify-mcp-service-token-12345",
        "BACKEND_URL": "http://localhost:3001",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

### VS Code MCP Extension
```json
{
  "mcp.servers": [
    {
      "name": "cognify",
      "command": "node",
      "args": ["C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server\\dist\\index.js"],
      "env": {
        "MCP_SERVICE_TOKEN": "cognify-mcp-service-token-12345",
        "BACKEND_URL": "http://localhost:3001"
      }
    }
  ]
}
```

### Claude Desktop
```json
{
  "mcpServers": {
    "cognify": {
      "command": "node",
      "args": ["C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server\\dist\\index.js"],
      "env": {
        "MCP_SERVICE_TOKEN": "cognify-mcp-service-token-12345"
      }
    }
  }
}
```

## How to Use

### Tools Available:

1. **store_context**
   - content (required): Text to store
   - metadata (optional): Additional data
   - userId (optional): User identifier (defaults to 'anonymous')

2. **search_context**
   - query (required): Search terms
   - userId (optional): User to search for (defaults to 'anonymous')
   - limit (optional): Max results (default: 5)

### Example Usage:

```
User: Store this context: "I prefer TypeScript over JavaScript for large projects"
Assistant: [calls store_context with content and optional userId]

User: Search for my programming preferences
Assistant: [calls search_context with query and optional userId]
```

## Authentication Flow

```
Client (Cursor/Claude) → MCP Server (with service token) → Backend API → Database
                              ↓
                        Authenticates as service account
                        Can store/retrieve data for any userId
```

This setup allows the MCP server to authenticate with your backend as a trusted service, while still maintaining user-specific data isolation through the userId parameter.