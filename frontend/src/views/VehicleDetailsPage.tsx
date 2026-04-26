
import { For, createSignal, onMount } from 'solid-js';
import { useRouteData, A } from 'solid-start';
import { Server, createServerAction, createServerData } from 'solid-start/server';
import { gql } from 'vite-plugin-solid-gql';
import { client } from '~/lib/client';

const UpdateClaimStatus = gql`
  mutation UpdateClaimStatus($id: String!, $status: ClaimStatus!) {
    updateClaimStatus(id: $id, status: $status)
  }
`;

const VehicleDetails = gql`
  query VehicleDetails($vin: String!) {
    vehicle(vin: $vin) {
      vin
      warranty_start_date
      components {
        part_code
        serial_number
        scanned_at
      }
    }
  }
`;

export function routeData({ params }: { params: { vin: string } }) {
  return createServerData(
    async ([, vin]) => {
      const data = await client.request(VehicleDetails, { vin });
      return data.vehicle;
    },
    { key: () => ['vehicle', params.vin] }
  );
}

export default function VehicleDetailsPage() {
  const vehicle = useRouteData<typeof routeData>();
  const [exec, { Form }] = createServerAction(async (form: FormData) => {
    const id = form.get('id') as string;
    const status = form.get('status') as string;
    await client.request(UpdateClaimStatus, { id, status });
  });

  return (
    <main class="container">
      <h1 class="text-2xl font-bold mb-4">Vehicle Details</h1>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p>
            <span class="font-bold">VIN:</span> {vehicle()?.vin}
          </p>
          <p>
            <span class="font-bold">Warranty Start:</span> {
              vehicle()?.warranty_start_date || 'N/A'
            }
          </p>
        </div>
      </div>
      <h2 class="text-xl font-bold mt-8 mb-4">Scanned Components</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Part Code</th>
              <th>Serial Number</th>
              <th>Scanned At</th>
            </tr>
          </thead>
          <tbody>
            <For each={vehicle()?.components}>
              {(component) => (
                <tr>
                  <td>{component.part_code}</td>
                  <td>{component.serial_number}</td>
                  <td>{new Date(component.scanned_at).toLocaleString()}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </main>
  );
}
