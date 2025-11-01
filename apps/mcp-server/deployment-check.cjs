#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('Production Deployment Check');
console.log('===========================');

async function runDeploymentChecks() {
  console.log('1. Building backend...');
  try {
    await runCommand('npm', ['run', 'build'], 'C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\backend');
    console.log('   Backend build: SUCCESS');
  } catch (error) {
    console.log('   Backend build: FAILED');
    return false;
  }

  console.log('2. Building MCP server...');
  try {
    await runCommand('npm', ['run', 'build'], 'C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server');
    console.log('   MCP server build: SUCCESS');
  } catch (error) {
    console.log('   MCP server build: FAILED');
    return false;
  }

  console.log('3. Testing MCP server startup...');
  try {
    const mcpProcess = spawn('node', ['dist/index.js'], {
      cwd: 'C:\\Users\\ADITYA\\lko-shit\\Cognify\\apps\\mcp-server',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });

    let startupSuccess = false;
    const timeout = setTimeout(() => {
      mcpProcess.kill();
    }, 10000);

    mcpProcess.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Cognify MCP Server is running')) {
        startupSuccess = true;
        clearTimeout(timeout);
        mcpProcess.kill();
      }
    });

    await new Promise((resolve) => {
      mcpProcess.on('close', () => resolve());
    });

    if (startupSuccess) {
      console.log('   MCP server startup: SUCCESS');
    } else {
      console.log('   MCP server startup: TIMEOUT/FAILED');
      return false;
    }
  } catch (error) {
    console.log('   MCP server startup: FAILED');
    return false;
  }

  console.log('\nDeployment Ready: YES');
  console.log('\nProduction Steps:');
  console.log('1. Set production environment variables');
  console.log('2. Start backend: npm run start (in apps/backend)');
  console.log('3. Start MCP server: npm run start (in apps/mcp-server)');
  console.log('4. Configure process manager (PM2)');
  console.log('5. Set up load balancer/reverse proxy');
  
  return true;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });
  });
}

runDeploymentChecks().catch(console.error);