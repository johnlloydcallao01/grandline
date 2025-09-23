# Authentication Implementation Guide

## Overview

This guide provides a comprehensive analysis of the authentication (signin/login) system implemented in the Grandline Maritime monorepo. The system uses PayloadCMS as the backend authentication provider with a Next.js frontend, implementing enterprise-grade security features including JWT tokens, role-based access control, and cross-domain authentication. This guide focuses specifically on user authentication flow using email and password credentials.

## Architecture Overview

### System Components

1. **Frontend (apps/web)**: Next.js application with client-side authentication
2. **Backend (apps/cms)**: PayloadCMS with custom authentication endpoints
3. **Database**: PostgreSQL with comprehensive user management schema
4. **Authentication Flow**: JWT-based with localStorage token storage

### Key Technologies

- **PayloadCMS v3**: Backend CMS with built-in authentication
- **Next.js 14**: Frontend framework with App Router
- **PostgreSQL**: Database with Drizzle ORM
- **JWT**: Token-based authentication
- **TypeScript**: Full type safety across the stack

## Frontend Authentication Implementation (apps/web)

### 1. Authentication Context (`src/contexts/AuthContext.tsx`)

The authentication system is built around a React Context that manages global authentication state:

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<boolean>;
}
```

**Key Features:**
- Automatic session restoration on app load
- Fast authentication state initialization
- Background token validation
- Event-driven authentication updates

### 2. Authentication Service (`src/lib/auth.ts`)

Core authentication functions that interact with PayloadCMS:

```typescript
// Main authentication functions
export async function login(credentials: LoginCredentials): Promise<AuthResponse>
export async function logout(): Promise<void>
export async function getCurrentUser(): Promise<User | null>
export async function refreshSession(): Promise<AuthResponse>
```

**Authentication Flow:**
1. **Login**: POST to `/api/users/login` with credentials
2. **Token Storage**: JWT stored in localStorage with expiration
3. **Session Validation**: Background validation with `/api/users/me`
4. **Auto-refresh**: Token refresh before expiration

### 3. Authentication Hook (`src/hooks/useAuth.ts`)

Simplified interface for components to access authentication:

```typescript
export function useAuth(): UseAuthReturn {
  const context = useAuthContext();
  // Additional helper methods and computed values
  return {
    ...context,
    isLoggedIn: context.isAuthenticated && context.user !== null,
    userDisplayName: getUserDisplayName(context.user),
    hasRole: (role: string) => context.user?.role === role,
  };
}
```

### 4. Route Protection Components

#### Protected Routes (`src/components/auth/ProtectedRoute.tsx`)
```typescript
export function ProtectedRoute({ 
  children, 
  fallback, 
  redirectTo = '/signin' 
}: ProtectedRouteProps) {
  // Redirects unauthenticated users to signin
}
```



### 5. Authentication Pages

#### Sign In Page (`src/app/(auth)/signin/page.tsx`)
- Clean, professional UI with form validation
- Integration with `useLogin` hook
- Error handling and loading states
- Responsive design with mobile optimization



### 6. Middleware (`src/middleware.ts`)

Next.js middleware for route protection:

```typescript
// Protected routes that require authentication
const PROTECTED_ROUTES = [
  '/', '/portal', '/menu', '/trending', // ... more routes
];

// Auth routes that redirect authenticated users
const AUTH_ROUTES = ['/signin', '/forgot-password'];

// Public routes with no authentication check
const PUBLIC_ROUTES = ['/api', '/_next', '/favicon.ico'];
```

**Note**: Due to cross-domain limitations with PayloadCMS cookies, the middleware primarily handles routing logic while authentication checks are performed client-side.

### 7. User Profile Components (`src/components/auth/UserProfile.tsx`)

User interface components for authenticated users:
- **UserAvatar**: Profile picture display
- **UserInfo**: User details and status
- **LogoutButton**: Secure logout functionality
- **UserDropdown**: Comprehensive user menu

### 8. Type Definitions (`src/types/auth.ts`)

Comprehensive TypeScript interfaces:

```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  nameExtension?: string | null;
  username?: string | null;
  role: 'admin' | 'instructor' | 'trainee';
  isActive?: boolean | null;
  // ... additional fields
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: User;
  token?: string;
  exp?: number;
}
```

## Backend Authentication Implementation (apps/cms)

### 1. PayloadCMS Configuration (`src/payload.config.ts`)

Core authentication setup:

```typescript
export default buildConfig({
  admin: {
    user: Users.slug, // Use 'users' collection for authentication
  },
  collections: [
    Users,      // Main authentication collection
    Trainees,   // Extended user data
    Instructors,
    Admins,
    // ... other collections
  ],
  // Custom authentication endpoints
  endpoints: [
    {
      path: '/refresh-token',
      method: 'post',
      handler: async (req: PayloadRequest) => {
        // Custom token refresh logic with security checks
      }
    }
  ]
});
```

### 2. Users Collection (`src/collections/Users.ts`)

Main authentication collection with enterprise features:

```typescript
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 30 * 24 * 60 * 60, // 30 days
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
    useAPIKey: true, // Enable API key generation
    depth: 2,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      domain: process.env.NODE_ENV === 'production' 
        ? process.env.COOKIE_DOMAIN 
        : undefined,
    },
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return { id: { equals: user?.id } };
    },
    delete: adminOnly,
  },
  fields: [
    // Core fields (email, password added automatically by auth: true)
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    { name: 'middleName', type: 'text' },
    { name: 'nameExtension', type: 'text' },
    { name: 'username', type: 'text', unique: true },
    { name: 'gender', type: 'select', options: [...] },
    { name: 'civilStatus', type: 'select', options: [...] },
    { name: 'nationality', type: 'text' },
    { name: 'birthDate', type: 'date' },
    { name: 'placeOfBirth', type: 'text' },
    { name: 'completeAddress', type: 'textarea' },
    { name: 'phone', type: 'text' },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Trainee', value: 'trainee' },
        { label: 'Service Account', value: 'service' },
      ],
      defaultValue: 'trainee',
      required: true,
    },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
    { name: 'lastLogin', type: 'date', admin: { readOnly: true } },
    { name: 'profilePicture', type: 'upload', relationTo: 'media' },
  ],
};
```



### 4. Access Control (`src/access/index.ts`)

Role-based access control functions:

```typescript
// Admin-only access
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.role === 'admin';
};

// Instructor or above
export const instructorOrAbove: Access = ({ req: { user } }) => {
  return hasMinimumRoleLevel(user?.role || '', ROLE_LEVELS.INSTRUCTOR);
};

// Service account access (for API keys)
export const serviceAccountAccess: Access = ({ req: { user } }) => {
  return user?.role === 'service';
};

// Users can access their own data
export const usersOwnData: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return { id: { equals: user.id } };
};
```

### 5. Authentication Logging (`src/utils/auth-logger.ts`)

Enterprise-grade logging for security monitoring:

```typescript
interface AuthLogContext {
  requestId: string;
  userId?: string | number;
  email?: string;
  role?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  responseTime?: number;
}

export class AuthLogger {
  logLoginAttempt(context: AuthLogContext, success: boolean) { /* ... */ }
  logRoleViolation(context: AuthLogContext, required: string, actual: string) { /* ... */ }
  logSessionExpiry(context: AuthLogContext) { /* ... */ }
  logTokenRefresh(context: AuthLogContext) { /* ... */ }
}
```

## Database Schema

### Core Tables

1. **users**: Main authentication table
   - Authentication fields (email, password, salt, hash)
   - Profile information (firstName, lastName, etc.)
   - Security fields (loginAttempts, lockUntil)
   - API key support (api_key_index)

2. **user_sessions**: Session management
   - JWT token tracking
   - Session expiration and refresh

4. **user_certifications**: User certifications and achievements
5. **user_events**: User activity and event logging

## Authentication Flow Diagrams

### Login Flow
```
1. User submits credentials → Frontend (signin page)
2. POST /api/users/login → PayloadCMS
3. PayloadCMS validates credentials → Database
4. JWT token generated ← PayloadCMS
5. Token stored in localStorage ← Frontend
6. User redirected to dashboard ← Frontend
```



### Session Validation Flow
```
1. App loads → Frontend
2. Check localStorage for token → Frontend
3. GET /api/users/me with JWT → PayloadCMS
4. Validate token and return user → Database
5. Update auth context ← Frontend
```

## Security Features

### 1. Token Management
- **JWT Tokens**: Secure, stateless authentication
- **30-day Expiration**: Long-lived sessions for better UX
- **Automatic Refresh**: Background token renewal
- **Secure Storage**: localStorage with expiration checks

### 2. Account Security
- **Login Attempts**: Maximum 5 failed attempts
- **Account Locking**: 10-minute lockout after failed attempts
- **Password Hashing**: Secure bcrypt hashing with salt
- **Role-based Access**: Granular permission system

### 3. Cross-Domain Considerations
- **CORS Configuration**: Proper cross-origin setup
- **Cookie Domain**: Production domain configuration
- **Token-based Auth**: Overcomes cookie domain limitations

### 4. API Security
- **API Keys**: Service account authentication
- **Request Validation**: Comprehensive input validation
- **Rate Limiting**: Basic rate limiting implementation
- **Audit Logging**: Comprehensive security event logging

## Implementation Checklist

### Frontend Setup
- [ ] Install required dependencies (`@payloadcms/next`, etc.)
- [ ] Set up AuthContext with reducer pattern
- [ ] Implement authentication service functions
- [ ] Create route protection components
- [ ] Build signin page
- [ ] Configure middleware for route protection
- [ ] Add user profile components
- [ ] Implement error boundaries for auth errors

### Backend Setup
- [ ] Configure PayloadCMS with authentication
- [ ] Set up Users collection with proper fields
- [ ] Create related collections as needed
- [ ] Configure access control functions
- [ ] Set up authentication logging
- [ ] Configure CORS for cross-domain access
- [ ] Set up database with proper schema

### Environment Configuration
```env
# PayloadCMS
PAYLOAD_SECRET=your-secret-key
DATABASE_URI=postgresql://...

# Authentication
COOKIE_DOMAIN=yourdomain.com
JWT_SECRET=your-jwt-secret

# CORS Origins
ADMIN_PROD_URL=https://admin.yourdomain.com
WEB_PROD_URL=https://yourdomain.com
CMS_PROD_URL=https://cms.yourdomain.com
```

### Security Checklist
- [ ] Enable HTTPS in production
- [ ] Configure secure cookie settings
- [ ] Set up proper CORS origins
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Set up monitoring for failed login attempts
- [ ] Configure account lockout policies
- [ ] Implement password strength requirements

## Best Practices

### 1. State Management
- Use React Context for global auth state
- Implement proper loading states
- Handle errors gracefully with user feedback
- Provide optimistic UI updates

### 2. Security
- Never store sensitive data in localStorage
- Validate all inputs on both client and server
- Implement proper error handling without exposing internals
- Use HTTPS in production

### 3. User Experience
- Provide clear feedback for authentication states
- Implement smooth transitions between auth states
- Handle network errors gracefully
- Maintain session across browser refreshes

### 4. Performance
- Lazy load authentication components
- Implement proper caching strategies
- Minimize authentication checks
- Use background token refresh

## Troubleshooting

### Common Issues

1. **Cross-domain Cookie Issues**
   - Solution: Use token-based authentication instead of cookies
   - Configure proper CORS settings

2. **Token Expiration**
   - Solution: Implement automatic token refresh
   - Provide clear session expiry notifications

3. **Role Access Denied**
   - Solution: Verify user roles in database
   - Check access control functions



## Migration Guide

### From Cookie-based to Token-based Auth
1. Update authentication service to use JWT tokens
2. Modify login/logout functions for token storage
3. Update session validation to use token headers
4. Remove cookie-dependent middleware logic

### Adding New User Roles
1. Update Users collection role options
2. Add new access control functions
3. Update frontend role checking logic
4. Test permission boundaries

This comprehensive guide provides everything needed to implement or replicate the authentication (signin/login) system in other applications. The system is designed for enterprise use with proper security, scalability, and user experience considerations, focusing specifically on email/password authentication flow.