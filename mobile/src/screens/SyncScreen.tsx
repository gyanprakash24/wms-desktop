import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, StyleSheet, AppState, AppStateStatus } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import { registerSyncTask, unregisterSyncTask, SYNC_TASK_NAME, performSync } from '../tasks/syncTask';
import { useIsFocused } from '@react-navigation/native';

export default function SyncScreen() {
  const [isTaskRegistered, setIsTaskRegistered] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const isFocused = useIsFocused();

  const checkTaskStatus = useCallback(async () => {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME);
    setIsTaskRegistered(isRegistered);
  }, []);

  useEffect(() => {
    // Check status when the screen is focused
    if (isFocused) {
      checkTaskStatus();
    }
    
    // Also check when the app becomes active
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkTaskStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isFocused, checkTaskStatus]);

  const handleToggleSync = async () => {
    if (isTaskRegistered) {
      await unregisterSyncTask();
    } else {
      // Sync every 15 minutes
      await registerSyncTask(900);
    }
    // Update the UI immediately
    checkTaskStatus();
  };

  const handleManualSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    console.log('Manual sync triggered!');
    try {
      await performSync();
      setLastSync(new Date());
      console.log('Manual sync finished.');
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>
        Automatic Sync is {isTaskRegistered ? 'ENABLED' : 'DISABLED'}
      </Text>
      <Button
        title={isTaskRegistered ? 'Disable Auto Sync' : 'Enable Auto Sync'}
        onPress={handleToggleSync}
      />
      <View style={styles.separator} />
      <Button
        title={isSyncing ? 'Syncing...' : 'Sync Now'}
        onPress={handleManualSync}
        disabled={isSyncing}
      />
      {lastSync && (
        <Text style={styles.syncTimeText}>
          Last sync attempt: {lastSync.toLocaleString()}
        </Text>
      )}
      <Text style={styles.infoText}>
        When enabled, the app will attempt to sync automatically in the background.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
    backgroundColor: '#ccc',
  },
  syncTimeText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
  },
  infoText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#888',
    paddingHorizontal: 20,
  },
});
