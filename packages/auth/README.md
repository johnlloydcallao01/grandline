# @encreasl/auth

Shared authentication package for the Encreasl monorepo. Provides authentication utilities, hooks, and middleware for PayloadCMS integration across all apps.

## Features

- 🔐 **PayloadCMS Integration** - Direct integration with your PayloadCMS backend
- 🎯 **Role-based Authentication** - Configurable role validation (admin, trainee, instructor)
- ⚛️ **React Hooks** - Easy-to-use hooks for authentication state management
- 🛡️ **Next.js Middleware** - Ready-to-use middleware for route protection
- 🔧 **TypeScript Support** - Full TypeScript support with comprehensive types
- 🚀 **Turborepo Ready** - Optimized for monorepo sharing and caching

## Installation

This package is already included in the monorepo workspace. To use it in your app:

```json
{
  "dependencies": {
    "@encreasl/auth": "workspace:*"
  }
}
```

## Usage

### React Hooks

#### Admin Authentication

```tsx
import { useAdminAuth } from '@encreasl/auth';

function AdminLoginPage() {
  const { login, isLoading, error, isAuthenticated } = useAdminAuth(
    process.env.NEXT_PUBLIC_API_URL,
    true // debug mode
  );

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      router.push('/admin/dashboard');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

#### Trainee Authentication

```tsx
import { useTraineeAuth } from '@encreasl/auth';

function TraineeSignInPage() {
  const { login, isLoading, error, clearError } = useTraineeAuth(
    process.env.NEXT_PUBLIC_API_URL,
    true // debug mode
  );

  const handleSubmit = async (credentials) => {
    try {
      await login(credentials);
      router.push('/');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error.message}</div>}
      {/* Your form fields */}
    </form>
  );
}
```

#### Role-based Authentication

```tsx
import { useRoleAuth } from '@encreasl/auth';

function CustomRoleApp() {
  const auth = useRoleAuth(
    process.env.NEXT_PUBLIC_API_URL,
    { requiredRole: 'instructor' }
  );

  // Use auth.login, auth.user, etc.
}
```

### Next.js Middleware

```tsx
// middleware.ts
import { adminAuthMiddleware } from '@encreasl/auth';

export const middleware = adminAuthMiddleware;

export const config = {
  matcher: ['/', '/admin/:path*'],
};
```

### Custom Middleware

```tsx
import { createAuthMiddleware } from '@encreasl/auth';

export const middleware = createAuthMiddleware({
  cookieName: 'payload-token',
  loginPath: '/login',
  protectedPaths: ['/dashboard'],
  debug: true,
});
```

### Utility Functions

```tsx
import { isAdmin, isTrainee, getUserDisplayName } from '@encreasl/auth';

function UserProfile({ user }) {
  return (
    <div>
      <h1>{getUserDisplayName(user)}</h1>
      {isAdmin(user) && <AdminPanel />}
      {isTrainee(user) && <TraineePanel />}
    </div>
  );
}
```

## API Reference

### Types

- `AuthUser` - User object from PayloadCMS
- `LoginCredentials` - Email and password for login
- `AuthConfig` - Configuration for authentication
- `RoleConfig` - Role validation configuration

### Hooks

- `useAuth(config)` - Base authentication hook
- `useAdminAuth(apiUrl, debug?)` - Admin-specific authentication
- `useTraineeAuth(apiUrl, debug?)` - Trainee-specific authentication
- `useRoleAuth(apiUrl, roleConfig, debug?)` - Role-based authentication

### Middleware

- `adminAuthMiddleware` - Pre-configured admin middleware
- `traineeAuthMiddleware` - Pre-configured trainee middleware
- `createAuthMiddleware(config)` - Custom middleware factory

### Utilities

- `validateUserRole(user, config)` - Validate user role
- `isAdmin(user)` - Check if user is admin
- `isTrainee(user)` - Check if user is trainee
- `getUserDisplayName(user)` - Get formatted display name

## Configuration

The package works with your existing PayloadCMS setup. Make sure you have:

1. `NEXT_PUBLIC_API_URL` environment variable set
2. PayloadCMS backend running at the specified URL
3. User roles configured in your PayloadCMS collections

## Migration from Direct Implementation

If migrating from direct PayloadCMS calls:

1. Replace direct fetch calls with `useAuth` hooks
2. Replace custom middleware with `adminAuthMiddleware`
3. Use utility functions for role checking
4. Update imports to use `@encreasl/auth`

## Development

```bash
# Build the package
pnpm build --filter=@encreasl/auth

# Run tests
npx tsx packages/auth/src/test.ts
```

## Used By

- `@encreasl/web-admin` - Admin dashboard authentication
- `@encreasl/web` - Main web app trainee authentication
- Ready for any new apps in the monorepo
