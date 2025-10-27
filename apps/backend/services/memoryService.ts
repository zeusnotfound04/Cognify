import prisma from "../db/prisma";
import { generateEmbedding } from "./embeddingService";
import { getCachedQueryResults, setCachedQueryResults } from "./cacheService";

export async function createMemory( userId : string ,content : string , metadata? : any) {
    if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
    }
    
    if (!content || typeof content !== 'string') {
        throw new Error('Invalid content provided - content is required and must be a string');
    }
    
    const embeddings = await generateEmbedding(content)
    const embeddingString = `[${embeddings.join(',')}]`;

    // Insert with vector embedding and return only the ID
    const result = await prisma.$queryRaw<Array<{ id: string }>>`
        INSERT INTO "Memory" (id, "userId", content, embedding, metadata, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${userId}, ${content}, ${embeddingString}::vector, ${JSON.stringify(metadata ?? {})}::jsonb, NOW(), NOW())
        RETURNING id
    `;

    const resultArray = Array.isArray(result) ? result : [result];
    const memoryId = resultArray[0]?.id;

    if (!memoryId) {
        throw new Error("Failed to create memory - no ID returned");
    }

    const memory = await prisma.memory.findUnique({
        where: { id: memoryId },
        select: {
            id: true,
            userId: true,
            content: true,
            metadata: true,
            importance: true,
            source: true,
            sourceUrl: true,
            title: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return memory;
}

export async function searchMemory(query: string, limit: number = 5) {
    const queryEmbedding = await generateEmbedding(query);
    
    const queryEmbeddingString = `[${queryEmbedding.join(',')}]`;

    const memories = await prisma.$queryRaw<Array<{
        id: string;
        content: string;
        metadata: any;
        similarity: number;
    }>>`
        SELECT 
            id,
            content,
            metadata,
            1 - (embedding <=> ${queryEmbeddingString}::vector) as similarity
        FROM "Memory"
        ORDER BY embedding <=> ${queryEmbeddingString}::vector
        LIMIT ${limit}
    `;

    return memories;
}

export async function getMemoryById(id :string) {

    return prisma.memory.findUnique({
        where : {
            id : id
        }
    })
    
}

export async function getUserMemories(userId:string) {
    return prisma.memory.findMany({
        where : {
            userId : userId
        },
        orderBy : {
            createdAt : "desc"
        }
    })
    
}

export async function findSimilarMemories(
  userId: string,
  queryEmbedding: number[],
  limit = 5
) {
  const queryKey = queryEmbedding.slice(0, 10).join(',');
  const cached = getCachedQueryResults(userId, queryKey);
  if (cached) {
    console.log("Query cache hit!");
    return cached.slice(0, limit);
  }

  console.log("Searching database...");
  const queryEmbeddingString = `[${queryEmbedding.join(',')}]`;
  
  const memories = await prisma.$queryRaw<Array<{
    id: string;
    content: string;
    metadata: any;
    createdAt: Date;
    similarity: number;
  }>>`
    SELECT 
      id,
      content,
      metadata,
      "createdAt",
      1 - (embedding <=> ${queryEmbeddingString}::vector) as similarity
    FROM "Memory"
    WHERE "userId" = ${userId}
    ORDER BY embedding <=> ${queryEmbeddingString}::vector
    LIMIT ${limit}
  `;

  setCachedQueryResults(userId, queryKey, memories);
  return memories;
}
