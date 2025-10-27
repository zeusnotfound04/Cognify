-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Convert existing embedding column from bytea to vector
ALTER TABLE "Memory" 
  ALTER COLUMN embedding TYPE vector(1536) 
  USING embedding::vector(1536);

-- Create HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS "Memory_embedding_idx" 
  ON "Memory" 
  USING hnsw (embedding vector_cosine_ops);
