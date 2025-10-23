import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReceipt } from '../../src/contexts/ReceiptContext';

const ReviewReceiptScreen = ({ navigation, route }) => {
  const { receiptData } = route.params || {};
  const { updateReceipt } = useReceipt();

  const handleSave = () => {
    if (receiptData) {
      updateReceipt(receiptData);
    }
    Alert.alert('Success', 'Receipt saved successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('ScanReceipt') },
    ]);
  };

  const handleEdit = () => {
    if (receiptData.type === 'manual') {
      navigation.navigate('ManualEntry');
    } else {
      navigation.goBack();
    }
  };

  if (!receiptData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No receipt data found</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ScanReceipt')}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Receipt</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.receiptContainer}>
          {/* Merchant Info */}
          {receiptData.merchant && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Merchant</Text>
              <Text style={styles.merchantName}>{receiptData.merchant}</Text>
            </View>
          )}

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Items ({receiptData.items?.length || 0})
            </Text>
            {receiptData.items?.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} × ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  ${item.subtotal.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Totals</Text>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>
                ${receiptData.subtotal?.toFixed(2) || '0.00'}
              </Text>
            </View>

            {receiptData.tax > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax:</Text>
                <Text style={styles.totalValue}>
                  ${receiptData.tax.toFixed(2)}
                </Text>
              </View>
            )}

            {receiptData.tip > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tip:</Text>
                <Text style={styles.totalValue}>
                  ${receiptData.tip.toFixed(2)}
                </Text>
              </View>
            )}

            {receiptData.ccFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Credit Card Fee:</Text>
                <Text style={styles.totalValue}>
                  ${receiptData.ccFee.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.totalRow, styles.finalTotalRow]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>
                ${receiptData.total?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {/* Receipt Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt Type</Text>
            <Text style={styles.receiptType}>
              {receiptData.type === 'manual'
                ? 'Manual Entry'
                : 'Scanned Receipt'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Save Receipt</Text>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  receiptContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  finalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
    paddingTop: 12,
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  receiptType: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewReceiptScreen;
