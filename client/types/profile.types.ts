// types/profile.types.ts
// Type definitions for the profile creation system

export interface User {
    id: string;
    username: string;
    email: string;
    phone: string;
    profilePicture?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface ProfileData {
    username: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    profilePicture: string | null;
  }
  
  export interface ProfileFormErrors {
    username?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }
  
  export interface CreateProfileResponse {
    success: boolean;
    message: string;
    user?: User;
    error?: string;
  }
  
  export interface ValidationRules {
    username: {
      required: boolean;
      minLength: number;
      maxLength?: number;
      pattern?: RegExp;
    };
    email: {
      required: boolean;
      pattern: RegExp;
    };
    phone: {
      required: boolean;
      pattern: RegExp;
      minLength: number;
    };
    password: {
      required: boolean;
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumber: boolean;
      requireSpecialChar?: boolean;
    };
  }
  
  // Default validation rules
  export const DEFAULT_VALIDATION_RULES: ValidationRules = {
    username: {
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      required: true,
      pattern: /^[\d\s\-\+\(\)]+$/,
      minLength: 10,
    },
    password: {
      required: true,
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
    },
  };