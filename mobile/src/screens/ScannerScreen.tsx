
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import apiClient from '../api/client';

// Debounce function to limit the rate of API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function ScannerScreen({route}) {
  const {vin} = route.params;
  const devices = useCameraDevices();
  const device = devices.back;

  const [lastScanned, setLastScanned] = useState(null);
  const [scanStatus, setScanStatus] = useState(null); // 'success', 'error', or null
  const [isProcessing, setIsProcessing] = useState(false);

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS], {
    checkInverted: true,
  });

  const debouncedSubmitScan = React.useCallback(
    debounce(async barcode => {
      if (isProcessing) return;
      setIsProcessing(true);

      try {
        const [partSerial, partCode, stage] = barcode.displayValue.split(':');

        if (!partSerial || !partCode || !stage) {
          throw new Error('Invalid barcode format.');
        }

        const response = await apiClient.post('/production/scan', {
          vin,
          part_serial: partSerial,
          part_code: partCode,
          stage,
        });

        if (response.status === 200) {
          setLastScanned(barcode.displayValue);
          setScanStatus('success');
        } else {
          setScanStatus('error');
          Alert.alert('Error', response.data.detail || 'An error occurred');
        }
      } catch (error) {
        setScanStatus('error');
        if (error.response && error.response.status === 409) {
          Alert.alert('Conflict', 'Duplicate part scan for this VIN.');
        } else {
          console.error(error);
          Alert.alert('Error', 'An unexpected error occurred during scanning.');
        }
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
          setScanStatus(null); // Reset status after a delay
        }, 2000); // UI feedback duration
      }
    }, 500), // 500ms debounce delay
    [vin, isProcessing],
  );

  useEffect(() => {
    if (barcodes.length > 0 && !isProcessing) {
      debouncedSubmitScan(barcodes[0]);
    }
  }, [barcodes, isProcessing, debouncedSubmitScan]);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();
      if (cameraPermission !== 'authorized') {
        await Camera.requestCameraPermission();
      }
    })();
  }, []);

  if (!device) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={5}
      />
      <View
        style={[
          styles.feedbackIndicator,
          scanStatus === 'success'
            ? styles.success
            : scanStatus === 'error'
            ? styles.error
            : {},
        ]}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.vinText}>VIN: {vin}</Text>
        <Text style={styles.lastScannedText}>
          Last Scanned: {lastScanned || 'None'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  feedbackIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 10,
    borderColor: 'transparent',
  },
  success: {
    borderColor: 'green',
  },
  error: {
    borderColor: 'red',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  vinText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  lastScannedText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ScannerScreen;
