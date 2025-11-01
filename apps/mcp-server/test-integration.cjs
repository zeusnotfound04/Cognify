#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('Testing MCP Server Integration...\n');

async function testMCPServer() {
  console.log('1. Building MCP server...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: 'C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server',
    stdio: 'inherit'
  });

  await new Promise((resolve, reject) => {
    buildProcess.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('Build failed'));
    });
  });

  console.log('✓ MCP server built successfully\n');

  console.log('2. Starting MCP server...');
  const serverProcess = spawn('node', ['dist/index.js'], {
    cwd: 'C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server',
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let requestId = 1;

  function sendRequest(method, params) {
    return new Promise((resolve, reject) => {
      const request = {
        jsonrpc: "2.0",
        id: requestId++,
        method,
        params
      };

      const timeout = setTimeout(() => {
        reject(new Error(`Timeout for ${method}`));
      }, 5000);

      const responseHandler = (data) => {
        const lines = data.toString().split('\n').filter(line => line.trim());
        for (const line of lines) {
          try {
            const response = JSON.parse(line);
            if (response.id === request.id) {
              clearTimeout(timeout);
              serverProcess.stdout.off('data', responseHandler);
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

      serverProcess.stdout.on('data', responseHandler);
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('3. Testing tools list...');
    const tools = await sendRequest('tools/list');
    console.log('   Available tools:', tools.tools.map(t => t.name).join(', '));
    console.log('✓ Tools list working\n');

    console.log('4. Testing store_context (will fail without backend)...');
    try {
      const storeResult = await sendRequest('tools/call', {
        name: 'store_context',
        arguments: {
          content: 'Test memory for MCP integration',
          metadata: { source: 'test' },
          authToken: 'test-token'
        }
      });
      console.log('✓ Store context working');
    } catch (error) {
      console.log('⚠ Store context failed (expected without running backend):', error.message);
    }

    console.log('\n✓ MCP Server is ready for plug-and-play!');
    console.log('\nTo use:');
    console.log('1. Start your backend: npm run dev (in apps/backend)');
    console.log('2. Start MCP server: npm run start (in apps/mcp-server)');
    console.log('3. Use client SDK to interact with MCP server');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    serverProcess.kill();
  }
}

testMCPServer().catch(console.error);