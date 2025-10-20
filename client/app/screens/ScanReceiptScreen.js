import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const ScanReceiptScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const takePhoto = async () => {
    if (hasPermission === false) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan receipts.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const scanReceipt = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please take or select a photo first.');
      return;
    }

    setIsLoading(true);

    try {
      // Create form data to send file directly
      const formData = new FormData();
      
      // Get file name from URI
      const filename = image.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('receipt', {
        uri: image.uri,
        name: filename,
        type: type,
      });

      // Update this URL to match your backend server
      const BACKEND_URL = 'http://10.136.25.194:3000'; // Change to your server URL
      const response = await fetch(`${BACKEND_URL}/api/receipts/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to review/edit screen with scanned data
        navigation.navigate('ReviewReceipt', { receiptData: data });
      } else {
        throw new Error(data.error || 'Failed to scan receipt');
      }
    } catch (error) {
      console.error('Error scanning receipt:', error);
      Alert.alert(
        'Scan Failed',
        'Could not process the receipt. Would you like to enter details manually?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enter Manually', onPress: () => navigation.navigate('ManualEntry') },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const retakePhoto = () => {
    setImage(null);
  };

  const handleManualEntry = () => {
    navigation.navigate('ManualEntry');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Receipt</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Image Preview Area */}
      <View style={styles.imageContainer}>
        {image ? (
          <>
            <Image source={{ uri: image.uri }} style={styles.image} />
            <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
              <Ionicons name="close-circle" size={32} color="#FF3B30" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.placeholderText}>Receipt Image</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!image ? (
          <>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={takePhoto}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={24} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={pickImage}
              disabled={isLoading}
            >
              <Ionicons name="images" size={24} color="#007AFF" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={scanReceipt}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="scan" size={24} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>Scan</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={handleManualEntry}
          disabled={isLoading}
        >
          <Ionicons name="create-outline" size={24} color="#666" style={styles.buttonIcon} />
          <Text style={styles.tertiaryButtonText}>Enter Manually</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  imageContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  retakeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  tertiaryButton: {
    backgroundColor: '#f0f0f0',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScanReceiptScreen;