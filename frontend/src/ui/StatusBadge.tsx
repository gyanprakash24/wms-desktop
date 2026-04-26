import type { ClaimStatus } from '../domain/claims';

export function StatusBadge(props: { status: ClaimStatus }) {
  const className =
    props.status === 'Draft'
      ? 'bg-slate-100 text-slate-800'
      : props.status === 'Submitted'
        ? 'bg-blue-100 text-blue-800'
        : props.status === 'Accepted'
          ? 'bg-emerald-100 text-emerald-800'
          : props.status === 'Rejected'
            ? 'bg-rose-100 text-rose-800'
            : 'bg-amber-100 text-amber-900';

  return (
    <span class={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${className}`}>
      {props.status}
    </span>
  );
}
