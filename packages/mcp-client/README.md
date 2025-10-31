# Cognify MCP Client SDK

A TypeScript client SDK for interacting with the Cognify MCP (Model Context Protocol) server to store and search context/memories.

## Installation

```bash
npm install @cognify/mcp-client
```

## Usage

### Basic Setup

```typescript
import { CognifyMCPClient } from '@cognify/mcp-client';

const client = new CognifyMCPClient({
  authToken: 'your-jwt-token'
});

// Connect to the MCP server
await client.connect('node', ['path/to/mcp-server/dist/index.js']);
```

### Storing Context

```typescript
const result = await client.storeContext({
  content: 'This is some important context to remember',
  metadata: {
    title: 'Important Note',
    source: 'user-input',
    importance: 0.8
  }
});

console.log('Stored memory ID:', result.id);
```

### Searching Context

```typescript
const searchResults = await client.searchContext({
  query: 'important context',
  limit: 5
});

console.log(`Found ${searchResults.total} memories:`);
searchResults.memories.forEach(memory => {
  console.log(`- ${memory.content} (${memory.similarity * 100}% match)`);
});
```

### Complete Example

```typescript
import { CognifyMCPClient } from '@cognify/mcp-client';

async function main() {
  const client = new CognifyMCPClient({
    authToken: 'your-jwt-token'
  });

  try {
    // Connect to server
    await client.connect('node', ['../mcp-server/dist/index.js']);
    
    // Store some context
    await client.storeContext({
      content: 'User prefers dark mode and uses TypeScript primarily',
      metadata: {
        category: 'preferences',
        importance: 0.9
      }
    });

    // Search for related context
    const results = await client.searchContext({
      query: 'user preferences',
      limit: 3
    });

    console.log('Related memories:', results.memories);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
  }
}

main();
```

## API Reference

### CognifyMCPClient

#### Constructor

```typescript
new CognifyMCPClient(config: CognifyClientConfig)
```

#### Methods

- `connect(serverCommand: string, serverArgs: string[]): Promise<void>`
- `disconnect(): Promise<void>`
- `storeContext(options: StoreContextOptions): Promise<StoreContextResult>`
- `searchContext(options: SearchContextOptions): Promise<SearchContextResult>`
- `listTools(): Promise<any>`
- `isClientConnected(): boolean`
- `updateAuthToken(newToken: string): void`

### Types

```typescript
interface StoreContextOptions {
  content: string;
  metadata?: {
    title?: string;
    source?: string;
    importance?: number;
    [key: string]: any;
  };
}

interface SearchContextOptions {
  query: string;
  limit?: number;
}

interface StoreContextResult {
  id: string;
  content: string;
  createdAt: string;
}

interface SearchContextResult {
  memories: MemoryResult[];
  total: number;
}

interface MemoryResult {
  id: string;
  content: string;
  metadata?: any;
  createdAt: string;
  similarity?: number;
}
```

## Requirements

- Node.js >= 18
- A running Cognify MCP server
- Valid JWT authentication token from Cognify backend

## License

MIT