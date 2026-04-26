import { getDb } from '../lib/db';
import type { Claim, ClaimStatus } from '../domain/claims';

type DbClaimRow = {
  id: string;
  vin: string;
  part_serial: string;
  status: string;
  created_at: string;
  updated_at: string;
};

function mapRow(row: DbClaimRow): Claim {
  const status = row.status as ClaimStatus;
  return {
    id: row.id,
    vin: row.vin,
    partSerial: row.part_serial,
    status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createDraftClaim(input: { id: string; vin: string; partSerial: string }): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.execute(
    'INSERT INTO claims (id, vin, part_serial, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [input.id, input.vin, input.partSerial, 'Draft', now, now],
  );

  const outboxId = crypto.randomUUID();
  await db.execute(
    'INSERT INTO sync_outbox (id, entity_type, entity_id, action, payload_json, created_at, attempts, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      outboxId,
      'claim',
      input.id,
      'CreateDraft',
      JSON.stringify({ id: input.id, vin: input.vin, partSerial: input.partSerial, status: 'Draft', createdAt: now, updatedAt: now }),
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
      'SELECT id, vin, part_serial, status, created_at, updated_at FROM claims WHERE UPPER(vin) LIKE $1 ORDER BY updated_at DESC LIMIT $2',
      [like, limit],
    );
    return rows.map(mapRow);
  }

  const rows = await db.select<DbClaimRow[]>(
    'SELECT id, vin, part_serial, status, created_at, updated_at FROM claims ORDER BY updated_at DESC LIMIT $1',
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

// Mock data for vehicle components
const MOCK_VEHICLE_COMPONENTS = {
  '1HGCM8263JA001234': {
    vin: '1HGCM8263JA001234',
    model: 'Honda Civic',
    assemblyDate: '2023-01-15T00:00:00Z',
    saleDate: '2023-03-01T00:00:00Z',
    status: 'Active',
    components: [
      { partSerial: 'ENG12345', partType: 'Engine', warrantyStatus: 'Active' },
      { partSerial: 'TRN67890', partType: 'Transmission', warrantyStatus: 'Active' },
      { partSerial: 'BATTERY_XYZ', partType: 'Battery', warrantyStatus: 'Expired' },
    ],
  },
};

export async function listVehicleComponents(params: { vin: string }): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_VEHICLE_COMPONENTS[params.vin]);
    }, 500);
  });
}
