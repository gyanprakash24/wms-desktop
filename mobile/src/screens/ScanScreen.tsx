import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { addVehicle, addComponent } from '../database/database';
import { TextInput } from 'react-native-paper';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type ScanScreenNavigationProp = BottomTabNavigationProp<any, 'Scan'>;

export default function ScanScreen({ navigation }: { navigation: ScanScreenNavigationProp }) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [vin, setVin] = useState<{ id: number; vin: string } | null>(null);
  const [componentName, setComponentName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    alert(`Bar code with data ${data} has been scanned!`);

    if (!vin) {
      try {
        const result: any = await addVehicle(data);
        if (result.insertId) {
            setVin({ id: result.insertId, vin: data });
        }
      } catch (error) {
        console.error('Error saving VIN:', error);
      }
    } else {
      if(componentName){
        try {
            await addComponent(vin.id, componentName, data);
            setComponentName('');
        } catch (error) {
            console.error('Error saving component:', error);
        }
      } else {
        alert("Please enter a component name before scanning the serial number.")
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {vin && <Text style={styles.vinText}>VIN: {vin.vin}</Text>}
      {vin && (
        <TextInput
          style={styles.input}
          label="Component Name"
          value={componentName}
          onChangeText={setComponentName}
        />
      )}
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  vinText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
  },
  input: {
    margin: 10,
  },
});
