import os
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from app.database import engine

MIGRATION_SQL = """
-- 1. Enable extension pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NULL,
    title        VARCHAR(255) NOT NULL DEFAULT 'New conversation',
    model_id     VARCHAR(100) NOT NULL,
    skill_id     VARCHAR(100) NULL,
    is_pinned    BOOLEAN NOT NULL DEFAULT false,
    is_deleted   BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations (updated_at DESC) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_conversations_title_trgm ON conversations USING GIN (title gin_trgm_ops);

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id   UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role              VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system','tool')),
    content           TEXT NOT NULL,
    model_id          VARCHAR(100) NULL,
    skill_id          VARCHAR(100) NULL,
    intent            VARCHAR(100) NULL,
    mcp_tools         JSONB NULL,
    tool_executions   JSONB NULL,
    response_time_ms  INTEGER NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    search_vector     TSVECTOR GENERATED ALWAYS AS (to_tsvector('indonesian', content)) STORED
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING GIN (search_vector);

-- 4. Trigger function to touch conversation on new message
CREATE OR REPLACE FUNCTION touch_conversation() RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET updated_at = now() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_conversation ON messages;
CREATE TRIGGER trg_touch_conversation
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION touch_conversation();

-- 5. Create memory_facts table
CREATE TABLE IF NOT EXISTS memory_facts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NULL,
    content                 TEXT NOT NULL,
    source_conversation_id  UUID NULL REFERENCES conversations(id) ON DELETE SET NULL,
    source                  VARCHAR(20) NOT NULL DEFAULT 'explicit' CHECK (source IN ('explicit','auto_extracted')),
    is_active               BOOLEAN NOT NULL DEFAULT true,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memory_facts_active ON memory_facts (user_id, is_active);

-- 6. Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID NOT NULL,
    action      VARCHAR(50) NOT NULL,
    detail      JSONB NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
"""


def run_migrations():
    print("Running database migrations...")
    with engine.begin() as connection:
        connection.execute(text(MIGRATION_SQL))
    print("Migrations applied successfully!")


if __name__ == "__main__":
    run_migrations()
