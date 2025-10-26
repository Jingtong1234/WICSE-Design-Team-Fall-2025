import React, { useState } from 'react';
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

// Define the available currency options
const CURRENCIES = [
  { label: 'US Dollar ($)', value: 'USD' },
  { label: 'Euro (€)', value: 'EUR' },
  { label: 'British Pound (£)', value: 'GBP' },
  { label: 'Japanese Yen (¥)', value: 'JPY' },
  { label: 'Canadian Dollar (C$)', value: 'CAD' },
  { label: 'Australian Dollar (A$)', value: 'AUD' },
  { label: 'Swiss Franc (CHF)', value: 'CHF' },
  { label: 'Chinese Yuan (CNY)', value: 'CNY' },
  { label: 'Indian Rupee (₹)', value: 'INR' },
  { label: 'Brazilian Real (R$)', value: 'BRL' },
];

/**
 * CurrencyDropdown: Now acts only as the trigger button for the full-screen overlay.
 */
const CurrencyDropdown = ({ 
  selectedValue, 
  labelText,
  onOpen, // Function to call when button is pressed
}) => {
  
  // Find the label for the currently selected value
  const currentLabel = CURRENCIES.find(c => c.value === selectedValue)?.label || selectedValue;

  return (
    <View style={dropdownStyles.container}>
      <Text style={styles.label}>{labelText}</Text>
      
      {/* Current Selection Button - now opens the full-screen overlay */}
      <TouchableOpacity 
        style={dropdownStyles.selectedButton}
        onPress={onOpen} 
      >
        <Text style={dropdownStyles.selectedText}>{currentLabel}</Text>
        {/* Always shows chevron-down as it opens an overlay/modal */}
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>
    </View>
  );
};


const ReviewReceiptScreen = ({ navigation, route }) => {
  const { receiptData } = route.params || {};
  const { updateReceipt } = useReceipt();

  // Find the initial currency from the list, default to USD if not found
  const initialCurrency = CURRENCIES.find(c => c.value === receiptData?.currency)?.value || 'USD';

  const [startCurrency, setStartCurrency] = useState(initialCurrency);
  const [endCurrency, setEndCurrency] = useState('USD');
  
  // Tracks which dropdown is active: 'start', 'end', or null
  const [activeDropdownType, setActiveDropdownType] = useState(null); 

  const handleSelectCurrency = (type, value) => {
    if (type === 'start') {
      setStartCurrency(value);
    } else if (type === 'end') {
      setEndCurrency(value);
    }
    // Always close the overlay after selection
    setActiveDropdownType(null); 
  };

  const handleSave = () => {
    if (receiptData) {
      const updatedData = {
        ...receiptData,
        startCurrency,
        endCurrency,
      };
      updateReceipt(updatedData);
    }

    Alert.alert('Success', 'Receipt saved successfully!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') },
    ]);
  };

  const handleEdit = () => {
    if (receiptData?.type === 'manual') {
      navigation.navigate('ManualEntry', { receiptData });
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

  // Determine which currency is currently being selected
  const targetCurrency = activeDropdownType === 'start' ? startCurrency : endCurrency;
  
  // New: Renders the full-screen overlay for currency selection
  const renderSelectionOverlay = () => {
    if (!activeDropdownType) return null;

    const label = activeDropdownType === 'start' ? 'Select Receipt Currency' : 'Select Payment Currency';

    return (
      <View style={overlayStyles.modalOverlay}>
        <View style={overlayStyles.modalContent}>
          
          <Text style={overlayStyles.headerText}>{label}</Text>
          <View style={overlayStyles.separator} />

          <ScrollView style={overlayStyles.listScrollView}>
            {CURRENCIES.map((currency) => (
              <TouchableOpacity
                key={currency.value}
                style={[
                  overlayStyles.listItem,
                  currency.value === targetCurrency && overlayStyles.listItemActive
                ]}
                onPress={() => handleSelectCurrency(activeDropdownType, currency.value)}
              >
                <Text 
                  style={[
                    overlayStyles.listItemText,
                    currency.value === targetCurrency && overlayStyles.listItemTextActive
                  ]}
                >
                  {currency.label}
                </Text>
                {/* Show checkmark for selected item */}
                {currency.value === targetCurrency && (
                    <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={overlayStyles.cancelButton} 
            onPress={() => setActiveDropdownType(null)}
          >
            <Text style={overlayStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

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

      {/* Main Content ScrollView */}
      <ScrollView 
        style={styles.scrollView}
        // Ensure scroll is disabled when the overlay is active
        scrollEnabled={!activeDropdownType} 
      >
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

          {/* Currency Selection - Using custom Dropdown (now just buttons) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency Selection</Text>

            {/* Receipt Currency Dropdown */}
            <CurrencyDropdown
              labelText="Receipt Currency (Starting):"
              selectedValue={startCurrency}
              onOpen={() => setActiveDropdownType('start')}
            />

            {/* Payment Currency Dropdown */}
            <CurrencyDropdown
              labelText="Payment Currency (Ending):"
              selectedValue={endCurrency}
              onOpen={() => setActiveDropdownType('end')}
            />
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
      
      {/* RENDER THE FULL-SCREEN OVERLAY HERE */}
      {renderSelectionOverlay()}

    </SafeAreaView>
  );
};


// Main Styles
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
    // Note: ScrollEnabled is controlled dynamically in the component logic
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
    zIndex: 0, // Ensure no inherited Z-index interferes with the overlay
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

  /* currency/picker styles */
  label: {
    fontSize: 15,
    marginBottom: 6,
    color: '#333',
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

// Styles for the CurrencyDropdown (Trigger Button Only)
const dropdownStyles = StyleSheet.create({
    container: {
        marginBottom: 16,
        zIndex: 0, // Reset zIndex for the trigger button container
    },
    selectedButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        backgroundColor: '#fff',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        borderRadius: 8,
    },
    selectedText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});

// Styles for the Full-Screen Selection Overlay
const overlayStyles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black background
        justifyContent: 'flex-end', // Align content to the bottom
        alignItems: 'center',
        zIndex: 999, // Ensure this is always on top
    },
    modalContent: {
        width: '100%',
        maxHeight: '80%', // Limit to 80% of screen height
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    headerText: {
      fontSize: 20,
      fontWeight: '700',
      color: '#333',
      marginBottom: 12,
      textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 8,
    },
    listScrollView: {
        flexGrow: 0, // Ensure scroll view doesn't take unnecessary space
        paddingBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    listItemActive: {
        backgroundColor: '#f9f9f9', // Slightly lighter background for selection
    },
    listItemText: {
        fontSize: 17,
        color: '#333',
    },
    listItemTextActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: '#f0f0f0',
      paddingVertical: 16,
      borderRadius: 12,
      marginVertical: 16,
      alignItems: 'center',
    },
    cancelButtonText: {
      color: '#007AFF',
      fontSize: 18,
      fontWeight: '600',
    }
});


export default ReviewReceiptScreen;
