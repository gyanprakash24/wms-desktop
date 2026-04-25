import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ScanScreen } from './src/ScanScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle Part Warranty Scanner</Text>
      <ScanScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
});