const embeddingCache = new Map<string, { embedding: number[], timestamp: number }>();
const queryResultsCache = new Map<string, { results: any[], timestamp: number }>();

const EMBEDDING_CACHE_TTL = 24 * 60 * 60 * 1000;
const QUERY_CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 1000;

export function getCachedEmbedding(text: string): number[] | undefined {
  if (!text || typeof text !== 'string') {
    console.warn('getCachedEmbedding: text is invalid:', text);
    return undefined;
  }
  
  const key = text.trim().toLowerCase();
  const cached = embeddingCache.get(key);
  
  if (!cached) return undefined;
  
  if (Date.now() - cached.timestamp > EMBEDDING_CACHE_TTL) {
    embeddingCache.delete(key);
    return undefined;
  }
  
  return cached.embedding;
}

export function setCachedEmbedding(text: string, embedding: number[]) {
  if (!text || typeof text !== 'string') {
    console.warn('setCachedEmbedding: text is invalid:', text);
    return;
  }
  
  const key = text.trim().toLowerCase();
  
  if (embeddingCache.size >= MAX_CACHE_SIZE) {
    const firstKey = embeddingCache.keys().next().value;
    if (firstKey) embeddingCache.delete(firstKey);
  }
  
  embeddingCache.set(key, {
    embedding,
    timestamp: Date.now()
  });
}

export function getCachedQueryResults(userId: string, query: string): any[] | undefined {
  const key = `${userId}:${query.trim().toLowerCase()}`;
  const cached = queryResultsCache.get(key);
  
  if (!cached) return undefined;
  
  if (Date.now() - cached.timestamp > QUERY_CACHE_TTL) {
    queryResultsCache.delete(key);
    return undefined;
  }
  
  return cached.results;
}

export function setCachedQueryResults(userId: string, query: string, results: any[]) {
  const key = `${userId}:${query.trim().toLowerCase()}`;
  
  if (queryResultsCache.size >= MAX_CACHE_SIZE) {
    const firstKey = queryResultsCache.keys().next().value;
    if (firstKey) queryResultsCache.delete(firstKey);
  }
  
  queryResultsCache.set(key, {
    results,
    timestamp: Date.now()
  });
}

setInterval(() => {
  const now = Date.now();
  
  for (const [key, value] of embeddingCache.entries()) {
    if (now - value.timestamp > EMBEDDING_CACHE_TTL) {
      embeddingCache.delete(key);
    }
  }
  
  for (const [key, value] of queryResultsCache.entries()) {
    if (now - value.timestamp > QUERY_CACHE_TTL) {
      queryResultsCache.delete(key);
    }
  }
}, 60 * 1000);
