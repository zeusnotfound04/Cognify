import axios from "axios";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

export const memoryStoreTool: Tool = {
  name: "memory_store",
  description: "Store memory content for a user",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The user ID"
      },
      content: {
        type: "string", 
        description: "The content to store"
      }
    },
    required: ["userId", "content"]
  }
};

export const memoryStoreHandler = async ({ userId, content }: { userId: string; content: string }) => {
  try {
    const res = await axios.post("http://localhost:3001/store", { userId, content });
    return {
      content: [{
        type: "text",
        text: `Memory stored successfully: ${JSON.stringify(res.data)}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text", 
        text: `Error storing memory: ${error instanceof Error ? error.message : 'Unknown error'}`
      }],
      isError: true
    };
  }
};