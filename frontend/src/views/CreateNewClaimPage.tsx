import { createSignal } from 'solid-js';
import { createServerAction } from 'solid-start/server';
import { gql } from 'vite-plugin-solid-gql';
import { client } from '~/lib/client';

const CreateClaim = gql`
  mutation CreateClaim($vin: String!, $part_serial: String!) {
    createClaim(vin: $vin, part_serial: $part_serial) {
      id
    }
  }
`;

export default function CreateClaimPage() {
  const [executing, exec] = createServerAction(async (form: FormData) => {
    const vin = form.get('vin') as string;
    const part_serial = form.get('part_serial') as string;

    await client.request(CreateClaim, { vin, part_serial });
  });

  return (
    <main class="container">
      <h1 class="text-2xl font-bold mb-4">Create a New Claim</h1>
      <form onSubmit={e => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        exec(formData);
      }}>
        <div class="form-control">
          <label for="vin" class="label">
            VIN
          </label>
          <input
            type="text"
            name="vin"
            id="vin"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control">
          <label for="part_serial" class="label">
            Part Serial Number
          </label>
          <input
            type="text"
            name="part_serial"
            id="part_serial"
            class="input input-bordered"
            required
          />
        </div>
        <div class="form-control mt-4">
          <button type="submit" class="btn btn-primary" disabled={executing()}>
            {executing() ? 'Creating...' : 'Create Claim'}
          </button>
        </div>
      </form>
    </main>
  );
}
