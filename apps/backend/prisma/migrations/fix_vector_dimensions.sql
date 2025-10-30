-- Fix vector dimensions to match Google Gemini embeddings (768 dimensions)

-- Drop the existing index
DROP INDEX IF EXISTS "Memory_embedding_idx";

-- Alter the column to use 768 dimensions
ALTER TABLE "Memory" 
  ALTER COLUMN embedding TYPE vector(768);

-- Recreate the HNSW index with correct dimensions
CREATE INDEX IF NOT EXISTS "Memory_embedding_idx" 
  ON "Memory" 
  USING hnsw (embedding vector_cosine_ops);

-- Clear any existing embeddings that might have wrong dimensions
UPDATE "Memory" SET embedding = NULL WHERE embedding IS NOT NULL;