import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import ScanReceiptScreen from './app/screens/ScanReceiptScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="ScanReceipt" 
            component={ScanReceiptScreen}
          />
          {/* TODO: Add ReviewReceipt and ManualEntry screens later */}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </>
  );
}