import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';

export default function ProfileScreen() {
  // State for modal visibility
  const [signInVisible, setSignInVisible] = useState(false); // true = Sign In modal open
  const [signUpVisible, setSignUpVisible] = useState(false); // true = Sign Up modal open

  // State for input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Handler to open Sign In modal
  const handleSignIn = () => {
    setSignInVisible(true);
  };

  // Handler to open Sign Up modal
  const handleCreateAccount = () => {
    setSignUpVisible(true);
  };

  // Submit handler for Sign In
  const handleSignInSubmit = () => {
    //actual Sign In logic
    console.log('Signing in:', username, password);

    // Clear input fields and close modal
    setUsername('');
    setPassword('');
    setSignInVisible(false);
  };

  // Submit handler for Sign Up
  const handleSignUpSubmit = () => {
    // Input code here for Sign Up functionality
    console.log('Creating account:', username, password, verifyPassword, email, phone);

    // Close modal after user adds code
    setUsername('');
    setPassword('');
    setVerifyPassword('');
    setEmail('');
    setPhone('');
    setSignUpVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to your Profile!</Text>

      {/* Buttons to open modals */}
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={handleSignIn} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Create Account" onPress={handleCreateAccount} />
      </View>

      {/* Sign In Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={signInVisible}
        onRequestClose={() => setSignInVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sign In</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
            />

            <Button title="Sign In" onPress={handleSignInSubmit} />

            <TouchableOpacity onPress={() => setSignInVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sign Up Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={signUpVisible}
        onRequestClose={() => setSignUpVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Account</Text>

            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              secureTextEntry={true}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Verify Password"
              value={verifyPassword}
              onChangeText={setVerifyPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              secureTextEntry={true}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phone}
              secureTextEntry={true}
              onChangeText={setPhone}
            />

            <Button title="Create Account" onPress={handleSignUpSubmit} />

            <TouchableOpacity onPress={() => setSignUpVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '60%',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cancelText: {
    marginTop: 10,
    textAlign: 'center',
    color: 'blue',
  },
});
