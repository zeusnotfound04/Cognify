import dotenv from 'dotenv';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { 
  memoryStoreTool, 
  searchContextTool, 
  storeContextHandler, 
  searchContextHandler 
} from "./tools/index.js";

dotenv.config();

const server = new Server({
  name: "cognify-mcp",
  version: "1.0.0",
  }, {
  capabilities: {
    tools: {}
  }
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [memoryStoreTool, searchContextTool]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "store_context") {
      const { content, metadata, authToken } = args as { 
        content: string; 
        metadata?: any; 
        authToken: string; 
      };
      return await storeContextHandler({ content, metadata, authToken });
    } else if (name === "search_context") {
      const { query, authToken, limit } = args as { 
        query: string; 
        authToken: string; 
        limit?: number; 
      };
      return await searchContextHandler({ 
        query, 
        authToken, 
        ...(limit !== undefined && { limit }) 
      });
    } else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cognify MCP Server is running...");
}

runServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});