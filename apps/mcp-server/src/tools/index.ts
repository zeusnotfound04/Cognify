import axios from "axios";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";

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
      authToken: {
        type: "string",
        description: "JWT authentication token for the user"
      }
    },
    required: ["content", "authToken"]
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
      authToken: {
        type: "string", 
        description: "JWT authentication token for the user"
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 5)",
        minimum: 1,
        maximum: 20
      }
    },
    required: ["query", "authToken"]
  }
};

export const storeContextHandler = async ({ 
  content, 
  metadata = {}, 
  authToken 
}: { 
  content: string; 
  metadata?: any; 
  authToken: string; 
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/memory`, 
      { content, metadata },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
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
  authToken, 
  limit = 5 
}: { 
  query: string; 
  authToken: string; 
  limit?: number; 
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/memory/search`, 
      { query },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
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