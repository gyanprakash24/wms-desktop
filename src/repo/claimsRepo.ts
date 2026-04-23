import { getDb } from '../lib/db';
import type { Claim, ClaimStatus } from '../domain/claims';

type DbClaimRow = {
  id: string;
  vin: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function mapRow(row: DbClaimRow): Claim {
  const status = row.status as ClaimStatus;
  return {
    id: row.id,
    vin: row.vin,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createDraftClaim(input: { id: string; vin: string }): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    'INSERT INTO claims (id, vin, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
    [input.id, input.vin, 'Draft', now, now],
  );

  const outboxId = crypto.randomUUID();
  await db.execute(
    'INSERT INTO sync_outbox (id, entity_type, entity_id, action, payload_json, created_at, attempts, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      outboxId,
      'claim',
      input.id,
      'CreateDraft',
      JSON.stringify({ id: input.id, vin: input.vin, status: 'Draft', createdAt: now, updatedAt: now }),
      now,
      0,
      'pending',
    ],
  );
}

export async function listClaims(params: { vinQuery?: string; limit?: number }): Promise<Claim[]> {
  const db = await getDb();
  const limit = params.limit ?? 200;
  const q = params.vinQuery?.trim();

  if (q && q.length > 0) {
    const like = `%${q.toUpperCase()}%`;
    const rows = await db.select<DbClaimRow[]>(
      'SELECT id, vin, status, created_at, updated_at FROM claims WHERE UPPER(vin) LIKE $1 ORDER BY updated_at DESC LIMIT $2',
      [like, limit],
    );
    return rows.map(mapRow);
  }

  const rows = await db.select<DbClaimRow[]>(
    'SELECT id, vin, status, created_at, updated_at FROM claims ORDER BY updated_at DESC LIMIT $1',
    [limit],
  );
  return rows.map(mapRow);
}

export async function getClaimCounts(): Promise<{ total: number; drafts: number }>{
  const db = await getDb();
  const rows = await db.select<Array<{ total: number; drafts: number }>>(
    `
    SELECT
      (SELECT COUNT(*) FROM claims) as total,
      (SELECT COUNT(*) FROM claims WHERE status = 'Draft') as drafts
    `,
  );

  const first = rows[0];
  return {
    total: Number(first?.total ?? 0),
    drafts: Number(first?.drafts ?? 0),
  };
}

export async function getOutboxPendingCount(): Promise<number> {
  const db = await getDb();
  const rows = await db.select<Array<{ pending: number }>>(
    "SELECT COUNT(*) as pending FROM sync_outbox WHERE status = 'pending'",
  );
  return Number(rows[0]?.pending ?? 0);
}
