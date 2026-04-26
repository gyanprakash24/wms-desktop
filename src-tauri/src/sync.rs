use serde::Serialize;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Wry};
use tokio::time::{sleep, Duration};

#[derive(Clone, Debug, Serialize)]
pub struct SyncStatus {
  pub is_running: bool,
  pub last_run_at: Option<String>,
  pub last_error: Option<String>,
}

#[derive(Default)]
pub struct SyncState {
  pub status: SyncStatus,
}

impl Default for SyncStatus {
  fn default() -> Self {
    Self {
      is_running: false,
      last_run_at: None,
      last_error: None,
    }
  }
}

pub async fn run_sync_once(_app: AppHandle<Wry>) -> Result<(), String> {
  // Stub: this is where we'll read pending outbox events and push to the hub.
  // Keeping it as a small async task for now.
  sleep(Duration::from_millis(250)).await;
  Ok(())
}

pub fn get_status(state: &tauri::State<'_, Arc<Mutex<SyncState>>>) -> SyncStatus {
  state.lock().expect("sync state lock").status.clone()
}

pub fn with_status_mut<T>(
  state: &tauri::State<'_, Arc<Mutex<SyncState>>>,
  f: impl FnOnce(&mut SyncStatus) -> T,
) -> T {
  let mut guard = state.lock().expect("sync state lock");
  f(&mut guard.status)
}
