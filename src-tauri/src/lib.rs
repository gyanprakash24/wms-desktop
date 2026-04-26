mod sync;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[tauri::command]
fn ping() -> &'static str {
  "pong"
}

#[tauri::command]
fn version() -> &'static str {
  env!("CARGO_PKG_VERSION")
}

#[tauri::command]
async fn sync_now(app: tauri::AppHandle) -> Result<(), String> {
  // Minimal status tracking (no hub yet).
  crate::sync::with_status_mut(&app.state(), |s| {
    s.is_running = true;
    s.last_error = None;
  });

  let result = crate::sync::run_sync_once(app.clone()).await;

  crate::sync::with_status_mut(&app.state(), |s| {
    s.is_running = false;
    s.last_run_at = Some(chrono::Utc::now().to_rfc3339());
    if let Err(ref e) = result {
      s.last_error = Some(e.clone());
    }
  });

  result
}

#[tauri::command]
fn sync_status(state: tauri::State<'_, std::sync::Arc<std::sync::Mutex<crate::sync::SyncState>>>) -> crate::sync::SyncStatus {
  crate::sync::get_status(&state)
}

pub fn run() {
  tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:wms.db",
                    vec![
                        tauri_plugin_sql::Migration {
                            version: 1,
                            description: "init",
                            sql: include_str!("../migrations/0001_init.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                        tauri_plugin_sql::Migration {
                            version: 2,
                            description: "outbox-status",
                            sql: include_str!("../migrations/0002_outbox_status.sql"),
                            kind: tauri_plugin_sql::MigrationKind::Up,
                        },
                    ],
                )
                .build(),
    )
    .manage(std::sync::Arc::new(std::sync::Mutex::new(crate::sync::SyncState::default())))
    .invoke_handler(tauri::generate_handler![ping, version, sync_now, sync_status])
    .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
