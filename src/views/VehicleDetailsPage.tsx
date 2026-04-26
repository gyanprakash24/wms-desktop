import { useQuery } from '@tanstack/react-query';
import { listVehicleComponents } from '../repo/claimsRepo';

export function VehicleDetailsPage({ vin }: { vin: string }) {
  const vehicleQuery = useQuery({
    queryKey: ['vehicle', { vin }],
    queryFn: () => listVehicleComponents({ vin }),
  });

  return (
    <div class="rounded-lg border border-slate-200 bg-white p-4 mt-4">
      <h2 class="text-lg font-semibold">Vehicle Details</h2>
      {vehicleQuery.isPending && <div class="p-4 text-sm text-slate-600">Loading…</div>}
      {vehicleQuery.isError && <div class="p-4 text-sm text-rose-700">Error loading vehicle details</div>}
      {vehicleQuery.isSuccess && (
        <div>
          <div class="mt-4">
            <span class="font-semibold">VIN:</span> {vehicleQuery.data.vin}
          </div>
          <div class="mt-2">
            <span class="font-semibold">Model:</span> {vehicleQuery.data.model}
          </div>
          <div class="mt-2">
            <span class="font-semibold">Assembly Date:</span>{' '}
            {new Date(vehicleQuery.data.assemblyDate).toLocaleDateString()}
          </div>
          <div class="mt-2">
            <span class="font-semibold">Sale Date:</span>{' '}
            {vehicleQuery.data.saleDate ? new Date(vehicleQuery.data.saleDate).toLocaleDateString() : 'N/A'}
          </div>
          <div class="mt-2">
            <span class="font-semibold">Status:</span> {vehicleQuery.data.status}
          </div>
          <div class="mt-4">
            <h3 class="text-md font-semibold">Components</h3>
            <table class="min-w-full text-left text-sm mt-2">
              <thead class="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th class="px-4 py-2">Part Serial</th>
                  <th class="px-4 py-2">Part Type</th>
                  <th class="px-4 py-2">Warranty Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {vehicleQuery.data.components.map((c) => (
                  <tr key={c.partSerial} class="hover:bg-slate-50">
                    <td class="px-4 py-3 font-mono">{c.partSerial}</td>
                    <td class="px-4 py-3">{c.partType}</td>
                    <td class="px-4 py-3">{c.warrantyStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
