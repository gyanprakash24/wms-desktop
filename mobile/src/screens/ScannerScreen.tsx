
import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  Button,
  Alert,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import apiClient from '../api/client';

function ScannerScreen({route}: any): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {vin} = route.params;
  const [partSerial, setPartSerial] = useState('');
  const [partCode, setPartCode] = useState('');
  const [stage, setStage] = useState('');

  const submitScan = async () => {
    try {
      const response = await apiClient.post('/production/scan', {
        vin,
        part_serial: partSerial,
        part_code: partCode,
        stage,
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Scan submitted successfully');
        setPartSerial('');
        setPartCode('');
        setStage('');
      } else {
        Alert.alert('Error', response.data.detail || 'An error occurred');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.container}>
          <Text style={styles.title}>WMS Scanner</Text>

          <TextInput
            style={styles.input}
            placeholder="VIN"
            value={vin}
            editable={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Part Serial"
            value={partSerial}
            onChangeText={setPartSerial}
          />
          <TextInput
            style={styles.input}
            placeholder="Part Code"
            value={partCode}
            onChangeText={setPartCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Stage"
            value={stage}
            onChangeText={setStage}
          />

          <Button title="Submit Scan" onPress={submitScan} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
});

export default ScannerScreen;
