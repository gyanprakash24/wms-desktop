import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { fetchData, clearData, SyncData } from '../database/database';

export const SYNC_TASK_NAME = 'background-sync-task';

const BACKEND_URL = 'http://localhost:8000';

/**
 * This is the core sync logic. It fetches local data, sends it to the backend,
 * and clears the local database on success.
 */
export async function performSync(): Promise<BackgroundFetch.BackgroundFetchResult> {
  try {
    console.log('Starting sync...');
    const dataToSync: SyncData = await fetchData();

    if (Object.keys(dataToSync).length === 0) {
      console.log('No new data to sync.');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const response = await fetch(`${BACKEND_URL}/sync/mobile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: dataToSync }),
    });

    if (response.ok) {
      console.log('Sync successful!');
      await clearData();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } else {
      const responseText = await response.text();
      console.error('Sync failed:', response.status, responseText);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  } catch (error) {
    console.error('Error in sync task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
}

// TaskManager defines the task that will be run in the background by the OS.
TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  console.log('Background sync task is running via TaskManager.');
  // It simply calls our core sync logic.
  return await performSync();
});

// Registers the background task with the OS.
export async function registerSyncTask(interval: number = 900) { // default to 15 minutes
  try {
    if (await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME)) {
        // If already registered, unregister first to ensure the interval is updated.
        await unregisterSyncTask();
    }
    await BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
      minimumInterval: interval, // in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Sync task registered successfully.');
  } catch (error) {
    console.error('Failed to register sync task:', error);
  }
}

// Unregisters the background task.
export async function unregisterSyncTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME);
    console.log('Sync task unregistered successfully.');
  } catch (error) {
    console.error('Failed to unregister sync task:', error);
  }
}
