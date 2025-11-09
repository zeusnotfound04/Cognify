import { NextRequest, NextResponse } from 'next/server';

// Mock data for now - replace with actual database logic
const mockMemories = [
  {
    id: '1',
    title: 'Next.js Discussion',
    content: 'Talked about the advantages of using Next.js for React applications, including SSR, routing, and performance optimizations.',
    type: 'conversation',
    source: 'Chat',
    timestamp: new Date('2024-11-01T10:30:00'),
    connections: ['2', '5'],
    tags: ['development', 'react', 'nextjs']
  },
  {
    id: '2',
    title: 'React Best Practices',
    content: 'Document outlining React best practices including component composition, state management, and performance tips.',
    type: 'document',
    source: 'Google Drive',
    timestamp: new Date('2024-10-28T14:20:00'),
    connections: ['1', '3'],
    tags: ['development', 'react', 'best-practices']
  },
  {
    id: '3',
    title: 'Project Architecture',
    content: 'Slack discussion about overall project architecture, microservices vs monolith considerations.',
    type: 'integration',
    source: 'Slack',
    timestamp: new Date('2024-10-25T09:15:00'),
    connections: ['2', '4'],
    tags: ['architecture', 'planning']
  },
  {
    id: '4',
    title: 'Meeting Notes',
    content: 'Weekly team meeting notes covering sprint planning, blockers, and upcoming features.',
    type: 'note',
    source: 'Notion',
    timestamp: new Date('2024-10-22T16:00:00'),
    connections: ['3', '6'],
    tags: ['meeting', 'planning', 'team']
  },
  {
    id: '5',
    title: 'Performance Optimization',
    content: 'Research on React performance optimization techniques including memoization, code splitting, and lazy loading.',
    type: 'document',
    source: 'Google Drive',
    timestamp: new Date('2024-10-20T11:45:00'),
    connections: ['1', '2'],
    tags: ['performance', 'react', 'optimization']
  },
  {
    id: '6',
    title: 'Design System Discussion',
    content: 'Chat about implementing a consistent design system across all applications.',
    type: 'conversation',
    source: 'Chat',
    timestamp: new Date('2024-10-18T13:30:00'),
    connections: ['4'],
    tags: ['design', 'ui-ux', 'system']
  },
  {
    id: '7',
    title: 'TypeScript Integration',
    content: 'Discussion about migrating existing JavaScript codebase to TypeScript for better type safety.',
    type: 'conversation',
    source: 'Chat',
    timestamp: new Date('2024-10-15T14:15:00'),
    connections: ['2', '8'],
    tags: ['typescript', 'migration', 'development']
  },
  {
    id: '8',
    title: 'API Documentation',
    content: 'Comprehensive API documentation for the backend services including authentication and data endpoints.',
    type: 'document',
    source: 'Notion',
    timestamp: new Date('2024-10-12T09:30:00'),
    connections: ['7', '9'],
    tags: ['api', 'documentation', 'backend']
  },
  {
    id: '9',
    title: 'Database Schema Design',
    content: 'Database schema design discussion for user management and memory storage systems.',
    type: 'integration',
    source: 'Slack',
    timestamp: new Date('2024-10-10T16:45:00'),
    connections: ['8', '4'],
    tags: ['database', 'schema', 'design']
  }
];

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, just return mock data
    // In production, you would authenticate the user and fetch their memories
    const memories = mockMemories.map(memory => ({
      ...memory,
      timestamp: memory.timestamp.toISOString()
    }));

    return NextResponse.json({ memories });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, type, source, tags, connections } = body;

    // Validate required fields
    if (!title || !content || !type || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // For now, create a mock memory
    const newMemory = {
      id: Date.now().toString(),
      title,
      content,
      type,
      source,
      timestamp: new Date().toISOString(),
      connections: connections || [],
      tags: tags || []
    };

    return NextResponse.json({ memory: newMemory }, { status: 201 });
  } catch (error) {
    console.error('Error creating memory:', error);
    return NextResponse.json(
      { error: 'Failed to create memory' },
      { status: 500 }
    );
  }
}