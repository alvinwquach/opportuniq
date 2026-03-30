-- Add pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create diagnosis_embeddings table for RAG retrieval
-- Stores vector embeddings of completed diagnoses + outcomes
CREATE TABLE IF NOT EXISTS diagnosis_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  embedding vector(1536),
  summary_text TEXT,
  service_type TEXT,
  region TEXT,
  actual_cost_cents INTEGER,
  resolution_type TEXT,
  severity TEXT,
  was_successful BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT diagnosis_embeddings_conversation_id_unique UNIQUE (conversation_id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS diagnosis_embeddings_service_type_idx ON diagnosis_embeddings (service_type);
CREATE INDEX IF NOT EXISTS diagnosis_embeddings_region_idx ON diagnosis_embeddings (region);

-- HNSW index for fast approximate nearest-neighbor cosine search
-- HNSW is preferred over IVFFlat when the table is small (no pre-training needed)
-- ef_construction=64 is the default; increase to 128 for better recall at build cost
CREATE INDEX IF NOT EXISTS diagnosis_embeddings_embedding_cosine_idx
  ON diagnosis_embeddings USING hnsw (embedding vector_cosine_ops);

COMMENT ON TABLE diagnosis_embeddings IS 'Vector embeddings of completed diagnoses for RAG retrieval (rag-enabled feature flag)';
COMMENT ON COLUMN diagnosis_embeddings.embedding IS 'OpenAI text-embedding-3-small, 1536 dimensions';
COMMENT ON COLUMN diagnosis_embeddings.region IS 'First 3 digits of ZIP code for regional filtering';
COMMENT ON COLUMN diagnosis_embeddings.actual_cost_cents IS 'Actual resolution cost in cents (from outcome)';
COMMENT ON COLUMN diagnosis_embeddings.resolution_type IS 'diy | hired_pro | deferred | replaced';
