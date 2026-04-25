import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

interface ScanPayload {
  vin: string;
  partId: string;
  partSerial: string;
  warrantyMonths?: number;
}

export const ScanScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [payload, setPayload] = useState<ScanPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    try {
      const obj = JSON.parse(data) as ScanPayload;
      if (!obj.vin || !obj.partId || !obj.partSerial) throw new Error('Missing required fields');
      setPayload(obj);
    } catch {
      Alert.alert('Invalid QR', 'The scanned QR does not contain valid JSON payload.');
      setScanned(false);
    }
  };

  const submit = async () => {
    if (!payload) return;
    setLoading(true);
    try {
      const resp = await fetch('http://YOUR_BACKEND_HOST/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vin: payload.vin,
          partId: payload.partId,
          partSerial: payload.partSerial,
          warrantyMonths: payload.warrantyMonths ?? 24,
          scanTimestamp: new Date().toISOString(),
          operatorId: 'mobile-scanner',
        }),
      });
      if (!resp.ok) throw new Error(`Server ${resp.status}`);
      Alert.alert('Success', 'Part scan recorded');
    } catch (e) {
      Alert.alert('Error', (e as Error).message);
    } finally {
      setLoading(false);
      setScanned(false);
      setPayload(null);
    }
  };

  if (hasPermission === null) return <Text>Requesting camera permission…</Text>;
  if (hasPermission === false) return <Text>No camera permission. Enable it in settings.</Text>;

  return (
    <View style={styles.container}>
      {payload ? (
        <View style={styles.confirmBox}>
          <Text style={styles.label}>VIN: {payload.vin}</Text>
          <Text style={styles.label}>Part ID: {payload.partId}</Text>
          <Text style={styles.label}>Serial: {payload.partSerial}</Text>
          <Button title="Confirm & Send" onPress={submit} disabled={loading} />
          {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
          <Button title="Cancel" onPress={() => { setScanned(false); setPayload(null); }} />
        </View>
      ) : (
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  confirmBox: { padding: 20, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  label: { marginBottom: 8 },
});