
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {getVehicles} from '../api/client';
import {Vehicle} from '../types/Vehicle';

function VehicleListScreen({navigation}: any): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const data = await getVehicles();
        setVehicles(data);
      } catch (error) {
        // error handling
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const renderItem = ({item}: {item: Vehicle}) => (
    <TouchableOpacity onPress={() => navigation.navigate('Scanner', {vin: item.vin})}>
      <View style={styles.item}>
        <Text style={styles.itemText}>VIN: {item.vin}</Text>
        <Text style={styles.itemText}>Model: {item.model}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Vehicles</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={renderItem}
            keyExtractor={item => item.vin}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  itemText: {
    fontSize: 18,
  },
});

export default VehicleListScreen;
