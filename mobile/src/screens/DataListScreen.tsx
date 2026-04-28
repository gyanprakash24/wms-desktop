import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchData } from '../database/database';
import { useIsFocused } from '@react-navigation/native';
import { VehicleData, Component } from '../types';

export default function DataListScreen() {
  const [data, setData] = useState<VehicleData>({});
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused]);

  const loadData = async () => {
    try {
      const dbData = await fetchData() as VehicleData;
      setData(dbData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const renderComponent = ({ item }: { item: Component }) => (
    <View style={styles.componentContainer}>
      <Text>Component: {item.name}</Text>
      <Text>Serial: {item.serial_number}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: string }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.vin}>VIN: {item}</Text>
      <FlatList
        data={data[item]}
        renderItem={renderComponent}
        keyExtractor={(component, index) => index.toString()}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.keys(data)}
        renderItem={renderItem}
        keyExtractor={vin => vin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  itemContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  vin: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  componentContainer: {
    marginLeft: 20,
    marginTop: 5,
  },
});
