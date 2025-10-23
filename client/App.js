import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { ReceiptProvider } from './src/contexts/ReceiptContext';
import HomeScreen from './app/screens/HomeScreen';
import ScanReceiptScreen from './app/screens/ScanReceiptScreen';
import ManualEntryScreen from './app/screens/ManualEntryScreen';
import ReviewReceiptScreen from './app/screens/ReviewReceiptScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ReceiptProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ScanReceipt" component={ScanReceiptScreen} />
          <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
          <Stack.Screen name="ReviewReceipt" component={ReviewReceiptScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </ReceiptProvider>
  );
}
