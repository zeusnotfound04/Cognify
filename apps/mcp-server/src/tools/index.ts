import axios from "axios";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { getConfig } from "../config.js";

// Lazy load config when needed instead of at module level
const getConfigSafely = () => {
  try {
    return getConfig();
  } catch (error) {
    console.error('Config loading failed:', error);
    throw error;
  }
};

export const memoryStoreTool: Tool = {
  name: "store_context",
  description: "Store context/memory content for a user in the Cognify system",
  inputSchema: {
    type: "object",
    properties: {
      content: {
        type: "string", 
        description: "The content/context to store as memory"
      },
      metadata: {
        type: "object",
        description: "Optional metadata to associate with the memory",
        properties: {
          title: { type: "string" },
          source: { type: "string" },
          importance: { type: "number" }
        }
      },
      userId: {
        type: "string",
        description: "User ID to associate the memory with (optional, defaults to anonymous)"
      }
    },
    required: ["content"]
  }
};

export const searchContextTool: Tool = {
  name: "search_context", 
  description: "Search stored context/memories using semantic similarity",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to find similar memories/context"
      },
      userId: {
        type: "string",
        description: "User ID to search memories for (optional, defaults to anonymous)"
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 5)",
        minimum: 1,
        maximum: 20
      }
    },
    required: ["query"]
  }
};

export const storeContextHandler = async ({ 
  content, 
  metadata = {}, 
  userId
}: { 
  content: string; 
  metadata?: any; 
  userId?: string; 
}) => {
  try {
    const config = getConfigSafely();
    const response = await axios.post(
      `${config.BACKEND_URL}/memory`, 
      { 
        content, 
        metadata,
        userId: userId || 'anonymous'
      },
      {
        headers: {
          'Authorization': `Bearer ${config.MCP_SERVICE_TOKEN}`,
          'Content-Type': 'application/json',
          'X-MCP-Service': 'cognify-mcp'
        }
      }
    );
    
    return {
      content: [{
        type: "text",
        text: `Context stored successfully\n\nMemory ID: ${response.data.id}\nContent: ${response.data.content.substring(0, 100)}${response.data.content.length > 100 ? '...' : ''}\nCreated: ${new Date(response.data.createdAt).toLocaleString()}`
      }]
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    return {
      content: [{
        type: "text", 
        text: `Error storing context: ${errorMessage}`
      }],
      isError: true
    };
  }
};

export const searchContextHandler = async ({ 
  query, 
  userId, 
  limit = 5 
}: { 
  query: string; 
  userId?: string; 
  limit?: number; 
}) => {
  try {
    const config = getConfigSafely();
    const response = await axios.post(
      `${config.BACKEND_URL}/memory/search`, 
      { 
        query,
        userId: userId || 'anonymous',
        limit
      },
      {
        headers: {
          'Authorization': `Bearer ${config.MCP_SERVICE_TOKEN}`,
          'Content-Type': 'application/json',
          'X-MCP-Service': 'cognify-mcp'
        }
      }
    );
    
    const results = response.data.slice(0, limit);
    
    if (results.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No matching context found for query: "${query}"`
        }]
      };
    }
    
    const formattedResults = results.map((result: any, index: number) => {
      const similarity = result.similarity ? ` (${(result.similarity * 100).toFixed(1)}% match)` : '';
      return `${index + 1}. ${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}${similarity}`;
    }).join('\n\n');
    
    return {
      content: [{
        type: "text",
        text: `Found ${results.length} matching memories for "${query}":\n\n${formattedResults}`
      }]
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    return {
      content: [{
        type: "text", 
        text: `Error searching context: ${errorMessage}`
      }],
      isError: true
    };
  }
};