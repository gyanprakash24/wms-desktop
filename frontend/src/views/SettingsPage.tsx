import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSyncStatus, syncNow } from '../lib/tauri';
import { getOutboxPendingCount } from '../repo/claimsRepo';

export function SettingsPage() {
  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ['syncStatus'],
    queryFn: getSyncStatus,
    refetchInterval: 2000,
  });

  const outboxQuery = useQuery({
    queryKey: ['outboxPending'],
    queryFn: getOutboxPendingCount,
    refetchInterval: 2000,
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      await syncNow();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['syncStatus'] });
      await queryClient.invalidateQueries({ queryKey: ['outboxPending'] });
    },
  });

  return (
    <section class="space-y-4">
      <h1 class="text-xl font-semibold">Settings</h1>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="text-sm font-medium">Sync</div>
          <div class="mt-2 text-sm text-slate-700">
            Pending outbox:{' '}
            <span class="font-mono">
              {outboxQuery.isPending ? '…' : outboxQuery.isError ? '—' : outboxQuery.data}
            </span>
          </div>
          <div class="mt-1 text-xs text-slate-500">
            Last run:{' '}
            {statusQuery.isSuccess && statusQuery.data.last_run_at
              ? new Date(statusQuery.data.last_run_at).toLocaleString()
              : '—'}
          </div>
          {statusQuery.isSuccess && statusQuery.data.last_error && (
            <div class="mt-2 text-xs text-rose-700">{statusQuery.data.last_error}</div>
          )}

          <button
            class={
              'mt-3 inline-flex items-center justify-center rounded px-3 py-2 text-sm font-medium ' +
              (!syncMutation.isPending
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-200 text-slate-500')
            }
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            type="button"
          >
            {syncMutation.isPending ? 'Syncing…' : 'Sync now'}
          </button>
          <div class="mt-2 text-xs text-slate-500">
            Current implementation is a stub (no hub yet). Next step: push outbox rows to the Manufacturer Hub.
          </div>
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="text-sm font-medium">Device integrations</div>
          <div class="mt-2 text-sm text-slate-700">
            Barcode/VIN reader setup will be added here.
          </div>
        </div>
      </div>
    </section>
  );
}
