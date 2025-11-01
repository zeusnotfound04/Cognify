# Cognify MCP Server

Production-ready MCP server for Cognify context storage and search.

## Status: PLUG-AND-PLAY READY

## Features

- Store context/memories in Cognify backend
- Search stored context using semantic similarity
- JWT authentication integration
- TypeScript with full compilation
- Error handling and logging

## Quick Start

### 1. Start Cognify Backend
```bash
cd ../backend
npm run dev
```

### 2. Start MCP Server
```bash
npm run start
```

### 3. Use Client SDK
```javascript
import { CognifyMCPClient } from '@cognify/mcp-client';

const client = new CognifyMCPClient({
  authToken: 'your-jwt-token'
});

await client.connect('node', ['path/to/mcp-server/dist/index.js']);
```

## Available Tools

### store_context
- **content** (required): The content to store
- **metadata** (optional): Additional metadata
- **authToken** (required): JWT authentication token

### search_context  
- **query** (required): Search query
- **limit** (optional): Maximum results (default: 5)
- **authToken** (required): JWT authentication token

## Scripts

- `npm run dev` - Development mode
- `npm run build` - Compile TypeScript
- `npm run start` - Run server
- `node status.cjs` - Check status

## Configuration

`.env` file:
- `BACKEND_URL=http://localhost:3001`