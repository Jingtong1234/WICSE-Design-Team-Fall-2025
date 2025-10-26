import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProfileData, ProfileFormErrors } from '../types/profile.types';
import { validateProfileForm } from '../utils/validation.utils';

const CreateProfile = ({ navigation }: any) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profilePicture: null,
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  // Request permission and pick image
  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData({ ...profileData, profilePicture: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileData({ ...profileData, profilePicture: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // Show options for profile picture
  const handleProfilePicture = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Validate form
  const handleValidateForm = (): boolean => {
    const validationErrors = validateProfileForm(profileData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };
  
  const handleCreateProfile = async () => {
    console.log('🚀 Create Profile button pressed!'); // ADD THIS LINE
    
    if (!handleValidateForm()) {
      return;
    }
    // ... rest of code

    setLoading(true);

    try {
      // Send JSON instead of FormData for simplicity
      const response = await fetch('http://localhost:3001/api/auth/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profileData.username,
          email: profileData.email,
          phone: profileData.phone,
          password: profileData.password,
          profilePicture: profileData.profilePicture,
        }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok && data.success) {
        Alert.alert('Success', 'Profile created successfully!', [
          { text: 'OK', onPress: () => console.log('Profile created:', data.user) }
        ]);
        // navigation.navigate('Dashboard'); // Uncomment when you have a Dashboard screen
      } else {
        Alert.alert('Error', data.message || 'Failed to create profile');
      }

    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Could not connect to server. Please make sure the backend is running.');
      console.error('Profile creation error:', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Profile</Text>
        <Text style={styles.subtitle}>Set up your account to start splitting bills</Text>
      </View>

      {/* Profile Picture */}
      <View style={styles.profilePictureSection}>
        <TouchableOpacity onPress={handleProfilePicture} style={styles.profilePictureContainer}>
          {profileData.profilePicture ? (
            <Image source={{ uri: profileData.profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Text style={styles.profilePictureIcon}>📷</Text>
              <Text style={styles.profilePictureText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.optionalText}>Optional</Text>
      </View>

      {/* Username */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Username *</Text>
        <TextInput
          style={[styles.input, errors.username && styles.inputError]}
          placeholder="Enter your username"
          value={profileData.username}
          onChangeText={(text) => {
            setProfileData({ ...profileData, username: text });
            if (errors.username) setErrors({ ...errors, username: undefined });
          }}
          autoCapitalize="none"
        />
        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Enter your email"
          value={profileData.email}
          onChangeText={(text) => {
            setProfileData({ ...profileData, email: text });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={[styles.input, errors.phone && styles.inputError]}
          placeholder="Enter your phone number"
          value={profileData.phone}
          onChangeText={(text) => {
            setProfileData({ ...profileData, phone: text });
            if (errors.phone) setErrors({ ...errors, phone: undefined });
          }}
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      {/* Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, errors.password && styles.inputError]}
            placeholder="Enter your password"
            value={profileData.password}
            onChangeText={(text) => {
              setProfileData({ ...profileData, password: text });
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
        <Text style={styles.passwordHint}>
          Must be at least 8 characters with uppercase, lowercase, and number
        </Text>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
            placeholder="Re-enter your password"
            value={profileData.confirmPassword}
            onChangeText={(text) => {
              setProfileData({ ...profileData, confirmPassword: text });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* Create Profile Button */}
      <TouchableOpacity 
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={handleCreateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.createButtonText}>Create Profile</Text>
        )}
      </TouchableOpacity>

      {/* Already have account */}
      <TouchableOpacity 
        style={styles.loginLink}
        onPress={() => navigation.navigate('Login')} // Adjust navigation as needed
      >
        <Text style={styles.loginLinkText}>
          Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePictureContainer: {
    marginBottom: 8,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  profilePictureIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  profilePictureText: {
    fontSize: 14,
    color: '#666',
  },
  optionalText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 5,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkBold: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default CreateProfile;