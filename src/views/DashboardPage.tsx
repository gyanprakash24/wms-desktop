import { useQuery } from '@tanstack/react-query';
import { ping } from '../lib/tauri';
import { getClaimCounts } from '../repo/claimsRepo';
import { getOutboxPendingCount } from '../repo/claimsRepo';

export function DashboardPage() {
  const pingQuery = useQuery({
    queryKey: ['ping'],
    queryFn: ping,
  });

  const countsQuery = useQuery({
    queryKey: ['claimCounts'],
    queryFn: getClaimCounts,
  });

  const outboxQuery = useQuery({
    queryKey: ['outboxPending'],
    queryFn: getOutboxPendingCount,
  });

  return (
    <section class="space-y-4">
      <h1 class="text-xl font-semibold">Dashboard</h1>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="text-sm text-slate-600">Local claims</div>
          <div class="mt-2 text-2xl font-semibold">
            {countsQuery.isPending && '…'}
            {countsQuery.isError && '—'}
            {countsQuery.isSuccess && countsQuery.data.total}
          </div>
          <div class="mt-1 text-xs text-slate-500">
            Drafts:{' '}
            {countsQuery.isSuccess ? countsQuery.data.drafts : '—'}
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="text-sm text-slate-600">Sync</div>
          <div class="mt-2 text-sm text-slate-700">
            Outbox pending:{' '}
            <span class="font-mono">
              {outboxQuery.isPending ? '…' : outboxQuery.isError ? '—' : outboxQuery.data}
            </span>
          </div>
          <div class="mt-1 text-xs text-slate-500">Use Settings → “Sync now” to test the sync stub.</div>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="text-sm text-slate-600">Tauri command health check</div>
        <div class="mt-1 font-mono text-sm">
          {pingQuery.isPending && 'Loading…'}
          {pingQuery.isError && 'Error'}
          {pingQuery.isSuccess && pingQuery.data}
        </div>
      </div>
    </section>
  );
}
