/**
 * Authentication types for the shared auth package
 */

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  firstName: string; // Required in your PayloadCMS schema
  lastName: string;  // Required in your PayloadCMS schema
  middleName?: string;
  nameExtension?: string;
  username?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  civilStatus?: string;
  nationality?: string;
  birthDate?: string;
  placeOfBirth?: string;
  completeAddress?: string;
  bio?: string;
  phone?: string;
  profileImageUrl?: string;
  emergencyContact?: string;
  preferences?: any;
  metadata?: any;
  lastLogin?: string;
  [key: string]: any; // Allow additional properties from PayloadCMS
}

export interface AuthResponse {
  user: AuthUser;
  token?: string;
  message?: string;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthConfig {
  apiUrl: string;
  requiredRole?: string | string[];
  allowedRoles?: string[];
  cookieName?: string;
  debug?: boolean;
}

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

// Role validation types
export type RoleValidator = (user: AuthUser) => boolean;

export interface RoleConfig {
  requiredRole?: string | string[];
  allowedRoles?: string[];
  customValidator?: RoleValidator;
}
