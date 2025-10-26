// utils/validation.utils.ts
// Reusable validation functions for the app

import { ProfileData, ProfileFormErrors } from '../types/profile.types';

/**
 * Validates an email address
 */
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  
  return null;
};

/**
 * Validates a username
 */
export const validateUsername = (username: string): string | null => {
  if (!username.trim()) {
    return 'Username is required';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  
  if (username.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  return null;
};

/**
 * Validates a phone number
 */
export const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) {
    return 'Phone number is required';
  }
  
  const numericOnly = phone.replace(/\D/g, '');
  
  if (numericOnly.length < 10) {
    return 'Phone number must be at least 10 digits';
  }
  
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return 'Invalid phone number format';
  }
  
  return null;
};

/**
 * Validates a password
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
};

/**
 * Validates that passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Validates the entire profile form
 */
export const validateProfileForm = (profileData: ProfileData): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};
  
  const usernameError = validateUsername(profileData.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(profileData.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(profileData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const passwordError = validatePassword(profileData.password);
  if (passwordError) errors.password = passwordError;
  
  const passwordMatchError = validatePasswordMatch(
    profileData.password,
    profileData.confirmPassword
  );
  if (passwordMatchError) errors.confirmPassword = passwordMatchError;
  
  return errors;
};