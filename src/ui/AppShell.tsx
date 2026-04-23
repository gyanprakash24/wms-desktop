import type { ComponentChildren } from 'preact';

type Props = {
  route: 'dashboard' | 'claims' | 'settings';
  children: ComponentChildren;
};

function NavLink(props: { href: string; active: boolean; label: string }) {
  return (
    <a
      class={
        `rounded px-3 py-2 text-sm font-medium ` +
        (props.active
          ? 'bg-slate-900 text-white'
          : 'text-slate-700 hover:bg-slate-200')
      }
      href={props.href}
    >
      {props.label}
    </a>
  );
}

export function AppShell({ route, children }: Props) {
  return (
    <div class="min-h-screen">
      <header class="border-b border-slate-200 bg-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div class="flex items-center gap-3">
            <div class="text-base font-semibold">WMS Desktop</div>
            <div class="text-xs text-slate-500">Offline-first warranty workflows</div>
          </div>
          <nav class="flex items-center gap-1">
            <NavLink href="#/" label="Dashboard" active={route === 'dashboard'} />
            <NavLink href="#/claims" label="Claims" active={route === 'claims'} />
            <NavLink href="#/settings" label="Settings" active={route === 'settings'} />
          </nav>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
