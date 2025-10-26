import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [events] = useState([
    { id: 1, title: 'Event 1', amount: 50, type: 'youOwe', completed: false },
    {
      id: 2,
      title: 'Event 2',
      amount: 30,
      type: 'youAreOwed',
      completed: false,
    },
    { id: 3, title: 'Event 3', amount: 0, type: 'settled', completed: true },
  ]);

  const [reminder] = useState({
    message: 'Pay $25 for groceries',
    active: true,
  });

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const closeMenu = () => {
    setIsMenuVisible(false);
  };

  const navigateToScanReceipt = () => {
    closeMenu();
    navigation.navigate('ScanReceipt');
  };

  const navigateToManualEntry = () => {
    closeMenu();
    navigation.navigate('ManualEntry');
  };

  const navigateToNewGroup = () => {
    closeMenu();
    navigation.navigate('NewGroup');
  };

  const getEventText = (event) => {
    if (event.completed) {
      return 'All settled!';
    }
    return event.type === 'youOwe' ? 'You owe $' : 'You are owed $';
  };

  const getEventAmount = (event) => {
    return event.completed ? '' : event.amount.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Reminder Block */}
        {reminder.active && (
          <View style={styles.reminderBlock}>
            <Text style={styles.reminderText}>
              Reminder: {reminder.message}
            </Text>
          </View>
        )}

        {/* Event Blocks */}
        {events.map((event) => (
          <View key={event.id} style={styles.eventBlock}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventContent}>
              <Text style={styles.eventDescription}>{getEventText(event)}</Text>
              {!event.completed && (
                <Text style={styles.eventAmount}>{getEventAmount(event)}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToScanReceipt}
            >
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>Scan Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={navigateToManualEntry}
            >
              <Ionicons name="create-outline" size={24} color="#007AFF" />
              <Text style={styles.menuItemText}>Manual Entry</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.menuItem}
                onPress={navigateToNewGroup}
            >
              <Ionicons name="people-outline" size={24} color="#007AFF" />
               <Text style={styles.menuItemText}>New Group</Text>
            </TouchableOpacity>
            
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  reminderBlock: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  reminderText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  eventBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventDescription: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  eventAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 16,
  },
});

export default HomeScreen;
