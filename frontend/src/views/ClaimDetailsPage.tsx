import { For, createSignal, onMount } from 'solid-js';
import { useRouteData, A } from 'solid-start';
import { Server, createServerAction, createServerData } from 'solid-start/server';
import { gql } from 'vite-plugin-solid-gql';
import { client } from '~/lib/client';

const ClaimDetails = gql`
  query ClaimDetails($id: String!) {
    claim(id: $id) {
      id
      vin
      part_serial
      status
      created_at
    }
  }
`;

const UpdateClaimStatus = gql`
  mutation UpdateClaimStatus($id: String!, $status: ClaimStatus!) {
    updateClaimStatus(id: $id, status: $status)
  }
`;

export function routeData({ params }: { params: { id: string } }) {
  return createServerData(
    async ([, id]) => {
      const data = await client.request(ClaimDetails, { id });
      return data.claim;
    },
    { key: () => ['claim', params.id] }
  );
}

export default function ClaimDetailsPage() {
  const claim = useRouteData<typeof routeData>();
  const [executing, exec] = createServerAction(async (form: FormData) => {
    const id = form.get('id') as string;
    const status = form.get('status') as string;

    await client.request(UpdateClaimStatus, { id, status });
  });

  return (
    <main class="container">
      <h1 class="text-2xl font-bold mb-4">Claim Details</h1>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p>
            <span class="font-bold">Claim ID:</span> {claim()?.id}
          </p>
          <p>
            <span class="font-bold">VIN:</span>
            <A href={`/vehicles/${claim()?.vin}`} class="link-primary">
              {claim()?.vin}
            </A>
          </p>
          <p>
            <span class="font-bold">Part Serial:</span> {claim()?.part_serial}
          </p>
          <p>
            <span class="font-bold">Status:</span> {claim()?.status}
          </p>
          <p>
            <span class="font-bold">Created At:</span>
            {new Date(claim()?.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </main>
  );
}
