import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
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

  // Split method state
  const [splitMethod, setSplitMethod] = useState('dutch'); // 'dutch', 'percentage', 'itemized'
  const [numPeople, setNumPeople] = useState('1');
  const [percentageBreakdown, setPercentageBreakdown] = useState([
    { person: 1, percentage: 0 }
  ]);
  const [itemizedBreakdown, setItemizedBreakdown] = useState([
    { person: 1, items: [] }
  ]);
  const [selectedPerson, setSelectedPerson] = useState(null); 

  const handleSelectCurrency = (type, value) => {
    if (type === 'start') {
      setStartCurrency(value);
    } else if (type === 'end') {
      setEndCurrency(value);
    }
    // Always close the overlay after selection
    setActiveDropdownType(null); 
  };

  const handleNumPeopleChange = (text) => {
    setNumPeople(text);
    const num = parseInt(text) || 1;
    
    // Always re-initialize both breakdowns whenever number of people changes
    setPercentageBreakdown(
      Array.from({ length: num }, (_, i) => ({
        person: i + 1,
        percentage: 0,
      }))
    );
    setItemizedBreakdown(
      Array.from({ length: num }, (_, i) => ({
        person: i + 1,
        items: [],
      }))
    );
  };

  const handleSplitMethodChange = (method) => {
    setSplitMethod(method);
    if (method === 'percentage') {
      // Initialize percentage breakdown
      const num = parseInt(numPeople) || 1;
      setPercentageBreakdown(
        Array.from({ length: num }, (_, i) => ({
          person: i + 1,
          percentage: 0,
        }))
      );
    } else if (method === 'itemized') {
      // Initialize itemized breakdown
      const num = parseInt(numPeople) || 1;
      setItemizedBreakdown(
        Array.from({ length: num }, (_, i) => ({
          person: i + 1,
          items: [],
        }))
      );
    }
  };

  const handlePercentageChange = (personIndex, percentage) => {
    const updated = [...percentageBreakdown];
    updated[personIndex].percentage = parseFloat(percentage) || 0;
    setPercentageBreakdown(updated);
  };

  const isItemSelectedByAnotherPerson = (itemIndex, currentPersonIndex) => {
    if (!itemizedBreakdown || itemizedBreakdown.length === 0) {
      return false;
    }
    for (let i = 0; i < itemizedBreakdown.length; i++) {
      if (i !== currentPersonIndex && itemizedBreakdown[i] && itemizedBreakdown[i].items && itemizedBreakdown[i].items.includes(itemIndex)) {
        return true;
      }
    }
    return false;
  };

  const handleItemSelection = (personIndex, itemIndex) => {
    // Don't allow selection if another person already has this item
    if (isItemSelectedByAnotherPerson(itemIndex, personIndex)) {
      return;
    }

    const updated = [...itemizedBreakdown];
    if (updated[personIndex] && updated[personIndex].items) {
      if (!updated[personIndex].items.includes(itemIndex)) {
        updated[personIndex].items.push(itemIndex);
      } else {
        updated[personIndex].items = updated[personIndex].items.filter(i => i !== itemIndex);
      }
      setItemizedBreakdown(updated);
    }
  };

  // Calculate total fees (tax + tip + ccFee)
  const getTotalFees = () => {
    return (receiptData.tax || 0) + (receiptData.tip || 0) + (receiptData.ccFee || 0);
  };

  // Helper function to create a unique item ID that includes quantity instance
  // For item at index 0 with quantity 2, it will create IDs "0-0" and "0-1"
  const getExpandedItemsList = () => {
    const expanded = [];
    receiptData.items?.forEach((item, itemIndex) => {
      const quantity = item.quantity || 1;
      for (let i = 0; i < quantity; i++) {
        expanded.push({
          originalIndex: itemIndex,
          quantityInstance: i,
          uniqueId: `${itemIndex}-${i}`,
          item: item,
        });
      }
    });
    return expanded;
  };

  // Check if an expanded item is selected by another person
  const isExpandedItemSelectedByAnotherPerson = (uniqueId, currentPersonIndex) => {
    if (!itemizedBreakdown || itemizedBreakdown.length === 0) {
      return false;
    }
    for (let i = 0; i < itemizedBreakdown.length; i++) {
      if (i !== currentPersonIndex && itemizedBreakdown[i] && itemizedBreakdown[i].items && itemizedBreakdown[i].items.includes(uniqueId)) {
        return true;
      }
    }
    return false;
  };

  // Handle selection of expanded items
  const handleExpandedItemSelection = (personIndex, uniqueId) => {
    if (isExpandedItemSelectedByAnotherPerson(uniqueId, personIndex)) {
      return;
    }

    const updated = [...itemizedBreakdown];
    if (updated[personIndex] && updated[personIndex].items) {
      if (!updated[personIndex].items.includes(uniqueId)) {
        updated[personIndex].items.push(uniqueId);
      } else {
        updated[personIndex].items = updated[personIndex].items.filter(i => i !== uniqueId);
      }
      setItemizedBreakdown(updated);
    }
  };

  const handleSave = () => {
    if (receiptData) {
      const updatedData = {
        ...receiptData,
        startCurrency,
        endCurrency,
        splitMethod,
        splitDetails: {
          numPeople: parseInt(numPeople) || 1,
          ...(splitMethod === 'dutch' && {}),
          ...(splitMethod === 'percentage' && { percentageBreakdown }),
          ...(splitMethod === 'itemized' && { itemizedBreakdown }),
        },
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

  const renderSplitMethodSection = () => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Split Method</Text>

        {/* Split Method Options */}
        <View style={styles.splitMethodContainer}>
          <TouchableOpacity
            style={[
              styles.splitMethodButton,
              splitMethod === 'dutch' && styles.splitMethodButtonActive,
            ]}
            onPress={() => handleSplitMethodChange('dutch')}
          >
            <Text
              style={[
                styles.splitMethodText,
                splitMethod === 'dutch' && styles.splitMethodTextActive,
              ]}
            >
              Dutch
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.splitMethodButton,
              splitMethod === 'percentage' && styles.splitMethodButtonActive,
            ]}
            onPress={() => handleSplitMethodChange('percentage')}
          >
            <Text
              style={[
                styles.splitMethodText,
                splitMethod === 'percentage' && styles.splitMethodTextActive,
              ]}
            >
              %
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.splitMethodButton,
              splitMethod === 'itemized' && styles.splitMethodButtonActive,
            ]}
            onPress={() => handleSplitMethodChange('itemized')}
          >
            <Text
              style={[
                styles.splitMethodText,
                splitMethod === 'itemized' && styles.splitMethodTextActive,
              ]}
            >
              Itemized
            </Text>
          </TouchableOpacity>
        </View>

        {/* Number of People Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Number of People:</Text>
          <View style={styles.numPeopleInputContainer}>
            <TouchableOpacity
              onPress={() => {
                const current = parseInt(numPeople) || 1;
                if (current > 1) {
                  handleNumPeopleChange((current - 1).toString());
                }
              }}
              style={styles.numButtonMinus}
            >
              <Text style={styles.numButtonText}>−</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.numPeopleInput}
              value={numPeople}
              onChangeText={handleNumPeopleChange}
              keyboardType="number-pad"
              placeholder="1"
            />

            <TouchableOpacity
              onPress={() => {
                const current = parseInt(numPeople) || 1;
                handleNumPeopleChange((current + 1).toString());
              }}
              style={styles.numButtonPlus}
            >
              <Text style={[styles.numButtonText, { color: '#fff' }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dutch Split Details */}
        {splitMethod === 'dutch' && (
          <View style={styles.splitDetails}>
            <View style={styles.splitDetailRow}>
              <Text style={styles.splitDetailLabel}>Each person pays:</Text>
              <Text style={styles.splitDetailValue}>
                ${(receiptData.total / (parseInt(numPeople) || 1)).toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Percentage Split Details */}
        {splitMethod === 'percentage' && (
          <View style={styles.splitDetails}>
            {percentageBreakdown.map((entry, index) => (
              <View key={index} style={styles.percentageRow}>
                <Text style={styles.percentageLabel} numberOfLines={1}>Person {entry.person}:</Text>
                <View style={styles.percentageInputContainer}>
                  <TextInput
                    style={styles.percentageInput}
                    value={entry.percentage.toString()}
                    onChangeText={(text) => handlePercentageChange(index, text)}
                    keyboardType="decimal-pad"
                    placeholder="0%"
                  />
                  <Text style={styles.percentageSymbol}>%</Text>
                </View>
                <Text style={styles.percentageAmount}>
                  ${(((receiptData.subtotal || 0) + getTotalFees()) * entry.percentage / 100).toFixed(2)}
                </Text>
              </View>
            ))}
            <View style={styles.percentageTotal}>
              <Text style={styles.percentageTotalLabel}>Total Percentage:</Text>
              <Text
                style={[
                  styles.percentageTotalValue,
                  {
                    color:
                      percentageBreakdown.reduce((sum, p) => sum + p.percentage, 0) ===
                      100
                        ? '#34C759'
                        : '#FF3B30',
                  },
                ]}
              >
                {percentageBreakdown.reduce((sum, p) => sum + p.percentage, 0).toFixed(1)}%
              </Text>
            </View>
          </View>
        )}

        {/* Itemized Split Details */}
        {splitMethod === 'itemized' && (
          <View style={styles.splitDetails}>
            {Array.from({ length: parseInt(numPeople) || 1 }, (_, i) => i).map((personIndex) => (
              <View key={personIndex} style={styles.itemizedPersonSection}>
                <Text style={styles.itemizedPersonTitle}>Person {personIndex + 1}</Text>
                <View style={styles.itemizedItemsList}>
                  {getExpandedItemsList().map((expandedItem) => {
                    const isSelectedByAnotherPerson = isExpandedItemSelectedByAnotherPerson(expandedItem.uniqueId, personIndex);
                    const isSelectedByThisPerson = itemizedBreakdown[personIndex]?.items?.includes(expandedItem.uniqueId);
                    return (
                      <TouchableOpacity
                        key={expandedItem.uniqueId}
                        style={[
                          styles.itemizedItemRow,
                          isSelectedByAnotherPerson && !isSelectedByThisPerson && styles.itemizedItemRowDisabled,
                        ]}
                        onPress={() => handleExpandedItemSelection(personIndex, expandedItem.uniqueId)}
                        disabled={isSelectedByAnotherPerson && !isSelectedByThisPerson}
                      >
                        <View style={[
                          styles.itemizedCheckbox,
                          isSelectedByAnotherPerson && !isSelectedByThisPerson && styles.itemizedCheckboxDisabled,
                        ]}>
                          {isSelectedByThisPerson && (
                            <Ionicons name="checkmark" size={16} color="#007AFF" />
                          )}
                        </View>
                        <View style={styles.itemizedItemInfo}>
                          <Text style={[
                            styles.itemizedItemName,
                            isSelectedByAnotherPerson && !isSelectedByThisPerson && styles.itemizedItemNameDisabled,
                          ]}>
                            {expandedItem.item.name}
                          </Text>
                          <Text style={[
                            styles.itemizedItemPrice,
                             isSelectedByAnotherPerson && !isSelectedByThisPerson && styles.itemizedItemPriceDisabled,
                          ]}>
                              ${(expandedItem.item.subtotal / (expandedItem.item.quantity || 1)).toFixed(2)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.itemizedPersonTotal}>
                  <Text style={styles.itemizedPersonTotalLabel}>Total for Person {personIndex + 1}:</Text>
                  <Text style={styles.itemizedPersonTotalValue}>
                    ${(
                      ((itemizedBreakdown[personIndex]?.items || []).reduce(
                        (sum, uniqueId) => {
                          const expandedItem = getExpandedItemsList().find(ei => ei.uniqueId === uniqueId);
                            return sum + ((expandedItem?.item?.subtotal || 0) / (expandedItem?.item?.quantity || 1));
                        },
                        0
                      )) +
                      ((receiptData.tax || 0) / (parseInt(numPeople) || 1)) +
                      ((receiptData.tip || 0) / (parseInt(numPeople) || 1)) +
                      ((receiptData.ccFee || 0) / (parseInt(numPeople) || 1))
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

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

          {/* Split Method Section */}
          {renderSplitMethodSection()}

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

            {/* Credit Card Fee is entered on Manual Entry screen and stored on the receipt */}
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

  /* Split Method Styles */
  splitMethodContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  splitMethodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitMethodButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  splitMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  splitMethodTextActive: {
    color: '#007AFF',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  numPeopleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numButtonMinus: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  numPeopleInput: {
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  numButtonPlus: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numButtonText: {
    fontSize: 24,
    fontWeight: '700',
  },
  splitDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  splitDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitDetailLabel: {
    fontSize: 15,
    color: '#666',
  },
  splitDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },

  /* Percentage Split Styles */
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  percentageLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    width: 80,
    flexShrink: 0,
  },
  percentageInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 8,
  },
  percentageInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 15,
    textAlign: 'center',
  },
  percentageSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  percentageAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    minWidth: 60,
    textAlign: 'right',
  },
  percentageTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  percentageTotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  percentageTotalValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  /* (Credit card fee UI moved to ManualEntryScreen) */

  /* Itemized Split Styles */
  itemizedPersonSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  itemizedPersonTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  itemizedItemsList: {
    marginBottom: 10,
  },
  itemizedItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemizedCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemizedItemInfo: {
    flex: 1,
  },
  itemizedItemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  itemizedItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemizedItemRowDisabled: {
    opacity: 0.5,
  },
  itemizedCheckboxDisabled: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  itemizedItemNameDisabled: {
    color: '#999',
  },
  itemizedItemPriceDisabled: {
    color: '#bbb',
  },
  itemizedPersonTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  itemizedPersonTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemizedPersonTotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
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
