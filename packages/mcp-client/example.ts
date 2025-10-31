import { CognifyMCPClient } from './src/index.js';

async function example() {
  // Initialize the client with your auth token
  const client = new CognifyMCPClient({
    authToken: 'your-jwt-token-here'
  });

  try {
    // Connect to the MCP server
    // Adjust the path to your built MCP server
    await client.connect('node', ['../mcp-server/dist/index.js']);
    
    console.log('Connected to Cognify MCP Server');

    // List available tools
    const tools = await client.listTools();
    console.log('Available tools:', tools);

    // Store some context
    console.log('\nStoring context...');
    const storeResult = await client.storeContext({
      content: 'The user is working on a TypeScript project with MCP integration. They prefer clean code without emojis and comments.',
      metadata: {
        title: 'User Coding Preferences',
        source: 'conversation',
        importance: 0.8,
        category: 'preferences'
      }
    });
    console.log('Stored:', storeResult);

    // Store another piece of context
    await client.storeContext({
      content: 'The project uses Prisma for database management with PostgreSQL and vector embeddings for semantic search.',
      metadata: {
        title: 'Tech Stack Info',
        source: 'project-analysis',
        importance: 0.9,
        category: 'technical'
      }
    });

    // Search for context
    console.log('\nSearching for context...');
    const searchResult = await client.searchContext({
      query: 'TypeScript project setup',
      limit: 3
    });
    
    console.log(`\nFound ${searchResult.total} related memories:`);
    searchResult.memories.forEach((memory, index) => {
      console.log(`${index + 1}. ${memory.content}`);
      if (memory.similarity) {
        console.log(`   Similarity: ${(memory.similarity * 100).toFixed(1)}%`);
      }
    });

    // Search for different context
    const techSearch = await client.searchContext({
      query: 'database technology',
      limit: 2
    });
    
    console.log(`\nTech-related memories (${techSearch.total} found):`);
    techSearch.memories.forEach((memory, index) => {
      console.log(`${index + 1}. ${memory.content}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.disconnect();
    console.log('\nDisconnected from server');
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}

export { example };