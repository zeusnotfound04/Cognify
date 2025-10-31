import { spawn, ChildProcess } from 'child_process';
import type {
  CognifyClientConfig,
  StoreContextOptions,
  SearchContextOptions,
  StoreContextResult,
  SearchContextResult
} from "./types.js";

interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: "2.0";
  id: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  }; 
}

export class CognifyMCPClient {
  private authToken: string;
  private serverProcess: ChildProcess | null = null;
  private isConnected: boolean = false;
  private requestId: number = 1;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();

  constructor(config: CognifyClientConfig) {
    this.authToken = config.authToken;
  }

  async connect(serverCommand: string, serverArgs: string[] = []): Promise<void> {
    if (this.isConnected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn(serverCommand, serverArgs, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      if (!this.serverProcess.stdout || !this.serverProcess.stdin) {
        reject(new Error('Failed to create server process'));
        return;
      }

      this.serverProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n').filter((line: string) => line.trim());
        
        for (const line of lines) {
          try {
            const response: MCPResponse = JSON.parse(line);
            this.handleResponse(response);
          } catch (error) {
            // Ignore non-JSON output (like server logs)
          }
        }
      });

      this.serverProcess.on('error', (error) => {
        reject(error);
      });

      this.serverProcess.stderr?.on('data', (data) => {
        const output = data.toString();
        if (output.includes('running')) {
          this.isConnected = true;
          resolve();
        }
      });

      // Send initialize request
      setTimeout(() => {
        this.sendRequest('initialize', {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'cognify-mcp-client',
            version: '1.0.0'
          }
        });
      }, 100);
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.serverProcess) {
      return;
    }

    this.serverProcess.kill();
    this.serverProcess = null;
    this.isConnected = false;
  }

  private sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.serverProcess?.stdin) {
        reject(new Error('Server process not available'));
        return;
      }

      const id = this.requestId++;
      const request: MCPRequest = {
        jsonrpc: "2.0",
        id,
        method,
        params
      };

      this.pendingRequests.set(id, { resolve, reject });

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout for method: ${method}`));
        }
      }, 30000);
    });
  }

  private handleResponse(response: MCPResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      return;
    }

    this.pendingRequests.delete(response.id);

    if (response.error) {
      pending.reject(new Error(response.error.message));
    } else {
      pending.resolve(response.result);
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error("Client is not connected. Call connect() first.");
    }
  }

  async listTools(): Promise<any> {
    this.ensureConnected();
    return await this.sendRequest('tools/list');
  }

  async storeContext(options: StoreContextOptions): Promise<StoreContextResult> {
    this.ensureConnected();

    const response = await this.sendRequest('tools/call', {
      name: 'store_context',
      arguments: {
        content: options.content,
        metadata: options.metadata || {},
        authToken: this.authToken
      }
    });

    if (response.isError) {
      throw new Error(`Failed to store context: ${response.content[0]?.text || 'Unknown error'}`);
    }

    // Parse the response text to extract structured data
    const responseText = response.content[0]?.text || '';
    const lines = responseText.split('\n');
    const memoryIdLine = lines.find((line: string) => line.includes('Memory ID:'));
    const createdLine = lines.find((line: string) => line.includes('Created:'));
    
    const memoryId = memoryIdLine?.split('Memory ID:')[1]?.trim() || '';
    const created = createdLine?.split('Created:')[1]?.trim() || new Date().toISOString();

    return {
      id: memoryId,
      content: options.content,
      createdAt: created
    };
  }

  async searchContext(options: SearchContextOptions): Promise<SearchContextResult> {
    this.ensureConnected();

    const response = await this.sendRequest('tools/call', {
      name: 'search_context',
      arguments: {
        query: options.query,
        authToken: this.authToken,
        limit: options.limit || 5
      }
    });

    if (response.isError) {
      throw new Error(`Failed to search context: ${response.content[0]?.text || 'Unknown error'}`);
    }

    const responseText = response.content[0]?.text || '';
    
    // Handle no results case
    if (responseText.includes('No matching context found')) {
      return {
        memories: [],
        total: 0
      };
    }

    // Parse the response to extract memories
    const memories = this.parseSearchResults(responseText);

    return {
      memories,
      total: memories.length
    };
  }

  private parseSearchResults(responseText: string): any[] {
    const memories: any[] = [];
    
    // Split by double newlines to get individual results
    const parts = responseText.split('\n\n');
    
    // Skip the first part which contains the header
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      // Extract similarity if present
      const similarityMatch = part.match(/\((\d+\.?\d*)% match\)/);
      const similarity = similarityMatch ? parseFloat(similarityMatch[1]) / 100 : undefined;

      // Remove the number prefix and similarity suffix
      let content = part.replace(/^\d+\.\s/, '').replace(/\s*\(\d+\.?\d*% match\)$/, '');
      
      // Handle truncated content
      if (content.endsWith('...')) {
        content = content.slice(0, -3);
      }

      memories.push({
        id: `memory_${i}`, // Generate a temporary ID
        content: content.trim(),
        similarity,
        createdAt: new Date().toISOString() // Placeholder
      });
    }

    return memories;
  }

  // Utility method to check connection status
  isClientConnected(): boolean {
    return this.isConnected;
  }

  // Update auth token
  updateAuthToken(newToken: string): void {
    this.authToken = newToken;
  }
}