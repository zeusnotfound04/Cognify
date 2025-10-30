# Cognify MCP Server

A Model Context Protocol (MCP) server for the Cognify memory storage system.

## Features

- **Memory Storage Tool**: Store memories/content for users via the Cognify backend API

## Prerequisites

- Node.js 18+ 
- TypeScript
- A running Cognify backend server (expected at `http://localhost:3001`)

## Installation

```bash
npm install
```

## Development

```bash
# Run in development mode with hot reloading
npm run dev

# Build the project
npm run build

# Run the built version
npm start
```

## Usage

This MCP server is designed to be used with MCP-compatible clients. It provides the following tools:

### memory_store

Stores memory content for a user in the Cognify system.

**Parameters:**
- `userId` (string, required): The ID of the user
- `content` (string, required): The content/memory to store

**Example:**
```json
{
  "name": "memory_store",
  "arguments": {
    "userId": "user123",
    "content": "Remember that John likes pizza"
  }
}
```

## Configuration

The server expects the Cognify backend to be running at `http://localhost:3001`. You can modify the API endpoint in `src/tools/index.ts` if needed.

## Project Structure

```
src/
├── index.ts           # Main MCP server setup
└── tools/
    └── index.ts       # Tool definitions and handlers
```

## Integration

To integrate this MCP server with an MCP client:

1. Build the project: `npm run build`
2. Configure your MCP client to use this server
3. The server communicates via stdio (stdin/stdout)

## Error Handling

The server includes proper error handling for:
- Network failures when communicating with the backend
- Invalid tool parameters
- Unknown tool requests

All errors are returned in MCP-compatible format with appropriate error codes.