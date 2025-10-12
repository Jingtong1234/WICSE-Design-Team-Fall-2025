import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from 'react-native';

type EventType = 'youOwe' | 'youAreOwed';

interface Event {
  title: string;
  amount: number;
  type: EventType;
  completed: boolean;
}

export default function HomeScreen() {
  // Example events
  const events: Event[] = [
    { title: 'Event 1', amount: 50, type: 'youOwe', completed: false },
    { title: 'Event 2', amount: 30, type: 'youAreOwed', completed: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.dashboardText}>Dashboard</Text>

        {/* Reminders box */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Reminders</Text>
        </View>

        {/* Event boxes */}
        {events.map((event, index) => (
          <View key={index} style={styles.box}>
            <Text style={styles.boxTitle}>{event.title}</Text>
            <Text>
              {event.type === 'youOwe' ? 'You Owe: ' : 'You Are Owed: '}
              ${event.amount}
            </Text>
            {event.completed && <Text style={styles.completedText}>All Settled</Text>}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  dashboardText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  box: {
    width: '90%',
    padding: 20,
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  completedText: {
    marginTop: 5,
    fontStyle: 'italic',
    color: 'green',
  },
});
