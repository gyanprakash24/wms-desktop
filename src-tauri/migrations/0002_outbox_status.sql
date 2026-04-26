-- Expand outbox to support processing lifecycle

ALTER TABLE sync_outbox ADD COLUMN status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE sync_outbox ADD COLUMN last_error TEXT;
ALTER TABLE sync_outbox ADD COLUMN next_attempt_at TEXT;
ALTER TABLE sync_outbox ADD COLUMN processed_at TEXT;

CREATE INDEX IF NOT EXISTS idx_sync_outbox_status_next_attempt
  ON sync_outbox (status, next_attempt_at);
