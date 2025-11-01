import { spawn } from 'child_process';

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
  error?: any;
}

async function testMCPServer() {
  console.log('Starting MCP server test...');
  
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: 'C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let requestId = 1;

  function sendRequest(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: MCPRequest = {
        jsonrpc: "2.0",
        id: requestId++,
        method,
        params
      };

      const timeout = setTimeout(() => {
        reject(new Error(`Timeout for ${method}`));
      }, 10000);

      const responseHandler = (data: Buffer) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response: MCPResponse = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              serverProcess.stdout?.off('data', responseHandler);
              if (response.error) {
                reject(new Error(response.error.message));
              } else {
                resolve(response.result);
              }
              return;
            }
          } catch (e) {
            // Ignore non-JSON output
          }
        }
      };

      serverProcess.stdout?.on('data', responseHandler);
      serverProcess.stdin?.write(JSON.stringify(request) + '\n');
    });
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('1. Testing tools list...');
    const tools = await sendRequest('tools/list');
    console.log('Tools available:', tools.tools.map((t: any) => t.name));

    console.log('2. Testing store_context...');
    const storeResult = await sendRequest('tools/call', {
      name: 'store_context',
      arguments: {
        content: 'Test memory content for MCP integration',
        metadata: { source: 'test' },
        authToken: 'test-token'
      }
    });
    console.log('Store result:', storeResult.content[0].text.substring(0, 100));

    console.log('3. Testing search_context...');
    const searchResult = await sendRequest('tools/call', {
      name: 'search_context',
      arguments: {
        query: 'test memory',
        authToken: 'test-token',
        limit: 3
      }
    });
    console.log('Search result:', searchResult.content[0].text.substring(0, 100));

    console.log('MCP server test completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    serverProcess.kill();
  }
}

testMCPServer();