import { spawn } from 'child_process';

// Test the MCP server by sending a list_tools request
const serverProcess = spawn('node', ['dist/index.js'], {
  stdio: ['pipe', 'pipe', 'inherit']
});

// Send a JSON-RPC request to list tools
const listToolsRequest = {
  jsonrpc: "2.0",
  id: 1,
  method: "tools/list"
};

serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

serverProcess.stdout.on('data', (data) => {
  console.log('Server response:', data.toString());
  serverProcess.kill();
});

serverProcess.on('error', (error) => {
  console.error('Server error:', error);
});

setTimeout(() => {
  console.log('Test timeout, killing server...');
  serverProcess.kill();
}, 5000);