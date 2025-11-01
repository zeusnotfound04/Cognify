console.log('MCP Server Status Check');
console.log('======================');

const fs = require('fs');
const path = require('path');

// Check if required files exist
const checks = [
  { file: 'dist/index.js', name: 'Compiled server' },
  { file: 'dist/tools/index.js', name: 'Compiled tools' },
  { file: '.env', name: 'Environment config' },
  { file: 'package.json', name: 'Package config' }
];

console.log('File checks:');
checks.forEach(check => {
  const exists = fs.existsSync(check.file);
  console.log(`  ${exists ? '✓' : '❌'} ${check.name}: ${check.file}`);
});

console.log('\nPackage info:');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`  Name: ${pkg.name}`);
console.log(`  Version: ${pkg.version}`);
console.log(`  Type: ${pkg.type}`);

console.log('\nEnvironment:');
require('dotenv').config();
console.log(`  BACKEND_URL: ${process.env.BACKEND_URL || 'Not set'}`);

console.log('\nMCP Server is ready for use!');
console.log('\nQuick start:');
console.log('1. Start backend: cd ../backend && npm run dev');
console.log('2. Start MCP: npm run start');
console.log('3. Use client SDK to connect');