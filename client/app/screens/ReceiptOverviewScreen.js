import React, { useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sampleReceipts = [
  {
    id: 'r1',
    title: 'Office Supplies',
    vendor: 'Staples',
    amount: 42.13,
    currency: 'USD',
    date: '2025-09-12',
    note: 'Pens and paper',
  },
  {
    id: 'r2',
    title: 'Lunch with client',
    vendor: 'Cafe Bistro',
    amount: 78.5,
    currency: 'USD',
    date: '2025-10-01',
    note: 'Client meeting',
  },
  {
    id: 'r3',
    title: 'Taxi',
    vendor: 'City Cabs',
    amount: 23.0,
    currency: 'USD',
    date: '2025-10-10',
    note: '',
  },
];

export default function ReceiptOverviewScreen({ navigation }) {
  const [receipts, setReceipts] = useState(sampleReceipts);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return receipts;
    return receipts.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.vendor || '').toLowerCase().includes(q) ||
        (r.note || '').toLowerCase().includes(q),
    );
  }, [receipts, query]);

  function formatAmount(amount, currency = 'USD') {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }

  function onAddReceipt() {
    navigation.navigate('ScanReceipt');
    console.log('Add receipt tapped');
  }

  function onViewReceipt(id) {
    navigation.navigate('ReviewReceipt', {
      receiptData: receipts.find((r) => r.id === id),
    });
    console.log('View receipt', id);
  }

  function onDeleteReceipt(id) {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  }

  function handleBackPress() {
    navigation.goBack();
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => onViewReceipt(item.id)}
      >
        <View style={styles.itemLeft}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemMeta}>
            {item.vendor} • {item.date}
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.amount}>
            {formatAmount(item.amount, item.currency)}
          </Text>
          <View style={styles.itemActions}>
            <TouchableOpacity
              onPress={() => onViewReceipt(item.id)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onDeleteReceipt(item.id)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Receipts</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.actionsContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search receipts by title, vendor or note"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity onPress={onAddReceipt} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          filtered.length === 0 ? styles.emptyContainer : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Text style={styles.emptyText}>No receipts found.</Text>
            <TouchableOpacity
              onPress={onAddReceipt}
              style={styles.addButtonSecondary}
            >
              <Text style={styles.addButtonText}>Add your first receipt</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  title: { fontSize: 20, fontWeight: '600', flex: 1, textAlign: 'center' },
  headerRight: { width: 32 },
  actionsContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#0078D4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonSecondary: {
    marginTop: 12,
    backgroundColor: '#0078D4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { color: '#fff', fontWeight: '600' },

  searchContainer: { flex: 1 },
  searchInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  itemContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  itemLeft: { flex: 1 },
  itemRight: { alignItems: 'flex-end', width: 140 },
  itemTitle: { fontSize: 16, fontWeight: '500' },
  itemMeta: { fontSize: 12, color: '#666', marginTop: 4 },
  amount: { fontWeight: '700', fontSize: 15 },
  itemActions: { flexDirection: 'row', marginTop: 8 },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginLeft: 8,
  },
  actionText: { fontSize: 13, color: '#333' },
  deleteButton: { backgroundColor: '#fff' },
  deleteText: { color: '#d9534f' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyInner: { alignItems: 'center', padding: 24 },
  emptyText: { color: '#666', fontSize: 16 },
});
