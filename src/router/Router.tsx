import { useMemo, useState } from 'preact/hooks';
import { AppShell } from '../ui/AppShell';
import { DashboardPage } from '../views/DashboardPage';
import { ClaimsPage } from '../views/ClaimsPage';
import { SettingsPage } from '../views/SettingsPage';

type Route = 'dashboard' | 'claims' | 'settings';

function getRouteFromHash(): Route {
  const raw = (globalThis.location?.hash ?? '').replace(/^#\/?/, '');
  if (raw === 'claims' || raw === 'settings') return raw;
  return 'dashboard';
}

export function Router() {
  const [route, setRoute] = useState<Route>(() => getRouteFromHash());

  useMemo(() => {
    const onHashChange = () => setRoute(getRouteFromHash());
    globalThis.addEventListener('hashchange', onHashChange);
    return () => globalThis.removeEventListener('hashchange', onHashChange);
  }, []);

  const view = route === 'claims'
    ? <ClaimsPage />
    : route === 'settings'
      ? <SettingsPage />
      : <DashboardPage />;

  return <AppShell route={route}>{view}</AppShell>;
}
