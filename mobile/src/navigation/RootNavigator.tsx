import React, {useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ScanScreen from '../screens/ScanScreen';
import DataListScreen from '../screens/DataListScreen';
import { initDB } from '../database/database';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

function SyncScreen() {
    return <Text>Sync Screen</Text>
}


export default function RootNavigator() {

    useEffect(() => {
        initDB();
    }, [])

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Scan" component={ScanScreen} />
        <Tab.Screen name="Data" component={DataListScreen} />
        <Tab.Screen name="Sync" component={SyncScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
