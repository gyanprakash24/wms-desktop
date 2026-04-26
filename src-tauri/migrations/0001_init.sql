-- Initial schema (MVP)

CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY NOT NULL,
  vin TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_claims_vin ON claims (vin);

CREATE TABLE IF NOT EXISTS sync_outbox (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sync_outbox_created_at ON sync_outbox (created_at);
