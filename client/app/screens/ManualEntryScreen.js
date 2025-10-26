import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useReceipt } from '../../src/contexts/ReceiptContext';


const ManualEntryScreen = ({ navigation }) => {
  const { addReceipt } = useReceipt();
  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: '',
    price: '',
    quantity: '1',
  });
  const [receiptDetails, setReceiptDetails] = useState({
    total: '',
    tax: '',
    tip: '',
    ccFee: '',
    merchant: '',
  });

  const addItem = () => {
    if (!currentItem.name.trim() || !currentItem.price.trim()) {
      Alert.alert('Error', 'Please enter item name and price');
      return;
    }

    const price = parseFloat(currentItem.price);
    const quantity = parseInt(currentItem.quantity) || 1;

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      name: currentItem.name.trim(),
      price: price,
      quantity: quantity,
      subtotal: price * quantity,
    };

    setItems([...items, newItem]);
    setCurrentItem({ name: '', price: '', quantity: '1' });
  };

  const removeItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(receiptDetails.tax) || 0;
    const tip = parseFloat(receiptDetails.tip) || 0;
    const ccFee = parseFloat(receiptDetails.ccFee) || 0;
    return subtotal + tax + tip + ccFee;
  };

  const saveReceipt = () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    const receiptData = {
      items: items,
      merchant: receiptDetails.merchant.trim(),
      subtotal: calculateSubtotal(),
      tax: parseFloat(receiptDetails.tax) || 0,
      tip: parseFloat(receiptDetails.tip) || 0,
      ccFee: parseFloat(receiptDetails.ccFee) || 0,
      total: calculateTotal(),
      date: new Date().toISOString(),
      type: 'manual',
    };

    // Add receipt to context
    const savedReceipt = addReceipt(receiptData);

    // Navigate to review/edit screen with saved receipt data
    navigation.navigate('ReviewReceipt', { receiptData: savedReceipt });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manual Entry</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Add Item Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Items</Text>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={[styles.input, styles.flexInput]}
                  value={currentItem.name}
                  onChangeText={(text) =>
                    setCurrentItem({ ...currentItem, name: text })
                  }
                  placeholder="Enter item name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Price</Text>
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  value={currentItem.price}
                  onChangeText={(text) =>
                    setCurrentItem({ ...currentItem, price: text })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput
                  style={[styles.input, styles.quantityInput]}
                  value={currentItem.quantity}
                  onChangeText={(text) =>
                    setCurrentItem({ ...currentItem, quantity: text })
                  }
                  placeholder="1"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Items List */}
          {items.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Items ({items.length})</Text>
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDetails}>
                      {item.quantity} × ${item.price.toFixed(2)} = $
                      {item.subtotal.toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Receipt Totals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt Totals</Text>

            <View style={styles.totalsContainer}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal:</Text>
                <Text style={styles.totalValue}>
                  ${calculateSubtotal().toFixed(2)}
                </Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tax</Text>
                <TextInput
                  style={styles.input}
                  value={receiptDetails.tax}
                  onChangeText={(text) =>
                    setReceiptDetails({ ...receiptDetails, tax: text })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tip</Text>
                <TextInput
                  style={styles.input}
                  value={receiptDetails.tip}
                  onChangeText={(text) =>
                    setReceiptDetails({ ...receiptDetails, tip: text })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Credit Card Fee</Text>
                <TextInput
                  style={styles.input}
                  value={receiptDetails.ccFee}
                  onChangeText={(text) =>
                    setReceiptDetails({ ...receiptDetails, ccFee: text })
                  }
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.totalRow, styles.finalTotalRow]}>
                <Text style={styles.finalTotalLabel}>Total:</Text>
                <Text style={styles.finalTotalValue}>
                  ${calculateTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveReceipt}>
            <Ionicons
              name="checkmark"
              size={24}
              color="#fff"
              style={styles.saveButtonIcon}
            />
            <Text style={styles.saveButtonText}>Save Receipt</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  keyboardAvoidingView: {
    flex: 1,
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
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  flexInput: {
    flex: 1,
  },
  priceInput: {
    width: 100,
  },
  quantityInput: {
    width: 80,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
  removeButton: {
    padding: 8,
  },
  totalsContainer: {
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
    paddingTop: 16,
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
  saveButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  saveButton: {
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
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManualEntryScreen;
