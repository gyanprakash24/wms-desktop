
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import { SYNC_TASK_NAME } from './src/tasks/syncTask';
import * as TaskManager from 'expo-task-manager';

// This will ensure the task is defined even if the app is launched in the background
import './src/tasks/syncTask'; 

function App(): React.JSX.Element {

  // When the app starts, we can check if the task is registered and re-register if needed.
  // This is a good practice to ensure the task is always running.
  React.useEffect(() => {
    const checkTask = async () => {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME);
      if (isRegistered) {
        console.log('Sync task is already registered.');
      } else {
        console.log('Sync task is not registered. It will be registered when enabled on the Sync screen.');
      }
    };
    checkTask();
  }, []);

  return <RootNavigator />;
}

export default App;
