import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'preact/hooks';
import { v4 as uuidv4 } from 'uuid';
import { isValidVin, normalizeVin } from '../domain/claims';
import { createDraftClaim, listClaims } from '../repo/claimsRepo';
import { StatusBadge } from '../ui/StatusBadge';

export function ClaimsPage() {
  const queryClient = useQueryClient();
  const [vinInput, setVinInput] = useState('');
  const [vinQuery, setVinQuery] = useState('');

  const normalizedVin = useMemo(() => normalizeVin(vinInput), [vinInput]);
  const canCreate = normalizedVin.length > 0 && isValidVin(normalizedVin);

  const claimsQuery = useQuery({
    queryKey: ['claims', { vinQuery }],
    queryFn: () => listClaims({ vinQuery }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const vin = normalizeVin(vinInput);
      if (!isValidVin(vin)) {
        throw new Error('Invalid VIN');
      }
      await createDraftClaim({ id: uuidv4(), vin });
    },
    onSuccess: async () => {
      setVinInput('');
      await queryClient.invalidateQueries({ queryKey: ['claims'] });
      await queryClient.invalidateQueries({ queryKey: ['claimCounts'] });
    },
  });

  return (
    <section class="space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="text-xl font-semibold">Claims</h1>
          <div class="text-sm text-slate-600">Create Draft claims offline and search by VIN.</div>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="text-sm font-medium">Create draft claim</div>
          <label class="mt-3 block text-xs font-medium text-slate-600">VIN</label>
          <input
            class="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            value={vinInput}
            onInput={(e) => setVinInput((e.target as HTMLInputElement).value)}
            placeholder="17-char VIN (no I/O/Q)"
          />
          <div class="mt-2 text-xs text-slate-500">
            Normalized: <span class="font-mono">{normalizedVin || '—'}</span>
          </div>
          {!canCreate && normalizedVin.length > 0 && (
            <div class="mt-2 text-xs text-rose-700">VIN must be 17 characters and exclude I, O, Q.</div>
          )}

          <button
            class={
              'mt-3 inline-flex items-center justify-center rounded px-3 py-2 text-sm font-medium ' +
              (canCreate && !createMutation.isPending
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-200 text-slate-500')
            }
            onClick={() => createMutation.mutate()}
            disabled={!canCreate || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating…' : 'Create Draft'}
          </button>
          {createMutation.isError && (
            <div class="mt-2 text-xs text-rose-700">{(createMutation.error as Error).message}</div>
          )}
        </div>

        <div class="rounded-lg border border-slate-200 bg-white p-4">
          <div class="text-sm font-medium">Search</div>
          <label class="mt-3 block text-xs font-medium text-slate-600">VIN contains</label>
          <div class="mt-1 flex gap-2">
            <input
              class="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              value={vinQuery}
              onInput={(e) => setVinQuery((e.target as HTMLInputElement).value)}
              placeholder="e.g. 1HG"
            />
            <button
              class="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onClick={() => setVinQuery('')}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div class="text-sm font-medium">Claim queue</div>
          <button
            class="rounded border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            onClick={() => claimsQuery.refetch()}
            type="button"
          >
            Refresh
          </button>
        </div>

        {claimsQuery.isPending && <div class="p-4 text-sm text-slate-600">Loading…</div>}
        {claimsQuery.isError && <div class="p-4 text-sm text-rose-700">Error loading claims</div>}

        {claimsQuery.isSuccess && (
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th class="px-4 py-2">VIN</th>
                  <th class="px-4 py-2">Status</th>
                  <th class="px-4 py-2">Updated</th>
                  <th class="px-4 py-2">ID</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {claimsQuery.data.length === 0 ? (
                  <tr>
                    <td class="px-4 py-3 text-slate-600" colSpan={4}>
                      No claims found.
                    </td>
                  </tr>
                ) : (
                  claimsQuery.data.map((c) => (
                    <tr key={c.id} class="hover:bg-slate-50">
                      <td class="px-4 py-3 font-mono">{c.vin}</td>
                      <td class="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td class="px-4 py-3 text-slate-700">
                        {new Date(c.updatedAt).toLocaleString()}
                      </td>
                      <td class="px-4 py-3 font-mono text-xs text-slate-500">{c.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
