import { For, createSignal, onMount } from 'solid-js';
import { createServerData } from 'solid-start/server';
import { gql } from 'vite-plugin-solid-gql';
import { client } from '~/lib/client';
import { A } from 'solid-start';

const RecentClaims = gql`
  query RecentClaims {
    recentClaims {
      id
      vin
      status
    }
  }
`;

const WarrantyDetails = gql`
  query WarrantyDetails($vin: String!) {
    warrantyDetails(vin: $vin) {
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

export function routeData() {
  return createServerData(async () => {
    const data = await client.request(RecentClaims);
    return data.recentClaims;
  });
}

export default function HomePage() {
  const claims = useRouteData<typeof routeData>();
  const [vin, setVin] = createSignal('');
  const [warrantyDetails, setWarrantyDetails] = createSignal(null);

  const fetchWarrantyDetails = async () => {
    const data = await client.request(WarrantyDetails, { vin: vin() });
    setWarrantyDetails(data.warrantyDetails);
  };

  return (
    <main class="container">
      <h1 class="text-2xl font-bold mb-4">Warranty Management System</h1>
      <div class="grid grid-cols-2 gap-8">
        <div>
          <h2 class="text-xl font-bold mb-4">Recent Claims</h2>
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>VIN</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <For each={claims()}>
                  {(claim) => (
                    <tr>
                      <td>
                        <A href={`/claims/${claim.id}`} class="link-primary">
                          {claim.id}
                        </A>
                      </td>
                      <td>{claim.vin}</td>
                      <td>{claim.status}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <div class="mt-4">
            <A href="/claims/new" class="btn btn-primary">
              Create New Claim
            </A>
          </div>
        </div>
        <div>
          <h2 class="text-xl font-bold mb-4">Check Warranty Status</h2>
          <div class="form-control">
            <label for="vin-check" class="label">
              Enter VIN
            </label>
            <div class="flex gap-2">
              <input
                type="text"
                id="vin-check"
                class="input input-bordered w-full"
                value={vin()}
                onInput={(e) => setVin(e.currentTarget.value)}
              />
              <button class="btn btn-primary" onClick={fetchWarrantyDetails}>
                Check
              </button>
            </div>
          </div>
          {warrantyDetails() && (
            <div class="mt-4">
              <h3 class="text-lg font-bold">Warranty Details</h3>
              <p>
                <span class="font-bold">VIN:</span> {warrantyDetails().vin}
              </p>
              <p>
                <span class="font-bold">Warranty Start:</span>
                {warrantyDetails().warranty_start_date || 'N/A'}
              </p>
              <h4 class="text-md font-bold mt-4">Scanned Components</h4>
              <ul class="list-disc list-inside">
                <For each={warrantyDetails().components}>
                  {(component) => (
                    <li>
                      {component.part_code}: {component.serial_number}
                    </li>
                  )}
                </For>
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
