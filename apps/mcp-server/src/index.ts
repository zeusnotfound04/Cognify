import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Debug:');
console.log('BACKEND_URL:', process.env.BACKEND_URL);
console.log('MCP_SERVICE_TOKEN:', process.env.MCP_SERVICE_TOKEN ? '✅ Set' : '❌ Missing');
console.log('LOG_LEVEL:', process.env.LOG_LEVEL);

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
import { logger, handleError } from "./logger.js";
import { runStartupChecks } from "./database.js";
import { getConfig } from "./config.js";

const config = getConfig();

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
    logger.info(`Tool called: ${name}`, { args });

    if (name === "store_context") {
      const { content, metadata, userId } = args as { 
        content: string; 
        metadata?: any; 
        userId?: string; 
      };
      const result = await storeContextHandler({ 
        content, 
        metadata, 
        ...(userId && { userId }) 
      });
      logger.info(`Tool ${name} completed successfully`);
      return result;
    } else if (name === "search_context") {
      const { query, userId, limit } = args as { 
        query: string; 
        userId?: string; 
        limit?: number; 
      };
      const result = await searchContextHandler({ 
        query, 
        ...(userId && { userId }),
        ...(limit !== undefined && { limit }) 
      });
      logger.info(`Tool ${name} completed successfully`);
      return result;
    } else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
    }
  } catch (error) {
    const errorInfo = handleError(error, `tool:${name}`);
    logger.error(`Tool ${name} failed`, { error: errorInfo });
    
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(
      ErrorCode.InternalError,
      errorInfo.message
    );
  }
});

async function runServer() {
  logger.info("Starting Cognify MCP Server...", { 
    nodeEnv: config.NODE_ENV,
    backendUrl: config.BACKEND_URL,
    logLevel: config.LOG_LEVEL
  });
  
  const startupCheck = await runStartupChecks();
  if (!startupCheck.success) {
    logger.error("Startup checks failed", { errors: startupCheck.errors });
    if (config.NODE_ENV === 'production') {
      logger.error("Exiting due to failed startup checks in production");
      process.exit(1);
    }
    logger.warn("Continuing startup despite failed checks - some functionality may be limited");
  } else {
    logger.info("All startup checks passed");
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info("Cognify MCP Server is running");
}

runServer().catch((error) => {
  logger.error("Failed to start server", { error: error.message, stack: error.stack });
  process.exit(1);
});