import { invoke } from '@tauri-apps/api/core';

export async function ping(): Promise<string> {
  return invoke<string>('ping');
}

export async function syncNow(): Promise<void> {
  await invoke('sync_now');
}

export type SyncStatus = {
  is_running: boolean;
  last_run_at: string | null;
  last_error: string | null;
};

export async function getSyncStatus(): Promise<SyncStatus> {
  return invoke<SyncStatus>('sync_status');
}
