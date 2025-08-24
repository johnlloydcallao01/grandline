# 🌍 Environment Variables Strategy for Turborepo Monorepo

This document outlines the comprehensive environment variable strategy for the Encreasl monorepo, designed to work seamlessly with Turborepo and Next.js applications.

## 📋 Table of Contents

- [Overview](#overview)
- [File Structure](#file-structure)
- [Environment Variable Hierarchy](#environment-variable-hierarchy)
- [Usage Patterns](#usage-patterns)
- [Validation & Type Safety](#validation--type-safety)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

Our monorepo uses a **hierarchical environment variable system** that provides:

- ✅ **Shared configuration** across all apps
- ✅ **App-specific overrides** for customization
- ✅ **Type safety** with Zod validation
- ✅ **Turborepo optimization** for caching
- ✅ **Security** with proper variable scoping

## 📁 File Structure

```
encreasl/
├── .env.local                    # 🌍 Root shared variables
├── apps/
│   ├── web/
│   │   ├── .env.local           # 🌐 Web app specific
│   │   └── src/lib/env.ts       # 🔧 Web env utilities
│   └── web-admin/
│       ├── .env.local           # 🔐 Admin app specific
│       └── src/lib/env.ts       # 🔧 Admin env utilities
├── packages/
│   └── env/
│       ├── package.json         # 📦 Env validation package
│       └── src/index.ts         # 🛡️ Validation schemas
└── turbo.json                   # ⚡ Turborepo config
```

## 🏗️ Environment Variable Hierarchy

### 1. **Root Level** (`.env.local`)
Shared variables available to ALL apps:

```bash
# Firebase Configuration (Shared)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key


```

### 2. **App Level** (`apps/*/env.local`)
App-specific variables that override or extend root variables:

**Web App** (`apps/web/.env.local`):
```bash
# Web-specific
NEXT_PUBLIC_APP_NAME=Encreasl Marketing
NEXT_PUBLIC_ENABLE_CONTACT_FORM=true
NEXT_PUBLIC_CONTACT_EMAIL=hello@encreasl.com
```

**Admin App** (`apps/web-admin/.env.local`):
```bash
# Admin-specific
NEXT_PUBLIC_APP_NAME=Encreasl Admin Dashboard
NEXT_PUBLIC_REQUIRE_2FA=true
ADMIN_DATABASE_URL=postgresql://...
```

## 🔧 Usage Patterns

### 1. **In React Components**

```typescript
// apps/web/src/components/ContactForm.tsx
import { features, contactInfo } from '@/lib/env';

export function ContactForm() {
  if (!features.contactForm) {
    return null; // Feature disabled
  }

  return (
    <form>
      <p>Contact us at: {contactInfo.email}</p>
      {/* Form fields */}
    </form>
  );
}
```

### 2. **In API Routes**

```typescript
// apps/web/src/app/api/contact/route.ts
import { getServerEnv } from '@/lib/env';

export async function POST(request: Request) {
  const { firebaseAdmin } = getServerEnv();
  
  // Use server-side Firebase admin
  const admin = initializeApp({
    credential: cert({
      projectId: firebaseAdmin.projectId,
      privateKey: firebaseAdmin.privateKey,
      clientEmail: firebaseAdmin.clientEmail,
    }),
  });
  
  // Handle contact form submission
}
```

### 3. **In Next.js Configuration**

```typescript
// apps/web/next.config.ts
import { validateWebEnv } from '@encreasl/env';

const env = validateWebEnv();

const nextConfig: NextConfig = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  publicRuntimeConfig: {
    appName: env.NEXT_PUBLIC_APP_NAME,
  },
};
```

## 🛡️ Validation & Type Safety

### 1. **Automatic Validation**

Environment variables are validated at startup using Zod schemas:

```typescript
// Automatically validates on import
import { env } from '@/lib/env';

// TypeScript knows the exact shape
env.NEXT_PUBLIC_APP_NAME; // ✅ string
env.NEXT_PUBLIC_ENABLE_CONTACT_FORM; // ✅ boolean
env.NEXT_PUBLIC_SESSION_TIMEOUT; // ✅ number
```

### 2. **Custom Validation**

```typescript
import { validateWebEnv, getEnvVar, getBooleanEnvVar } from '@encreasl/env';

// Validate specific environment
const webEnv = validateWebEnv();

// Get individual variables with defaults
const apiUrl = getEnvVar('API_URL', 'http://localhost:3000');
const debugMode = getBooleanEnvVar('DEBUG_MODE', false);
```

### 3. **Type Exports**

```typescript
import type { WebEnv, AdminEnv, SharedEnv } from '@encreasl/env';

function useWebConfig(): WebEnv {
  return validateWebEnv();
}
```

## ⚡ Turborepo Integration

### 1. **Environment Variable Caching**

```json
// turbo.json
{
  "globalEnv": ["NODE_ENV", "VERCEL_ENV", "CI"],
  "globalPassThroughEnv": ["NEXT_PUBLIC_*", "FIREBASE_*"],
  "tasks": {
    "build": {
      "env": ["NEXT_PUBLIC_*", "FIREBASE_*", "API_*"]
    }
  }
}
```

### 2. **App-Specific Builds**

```bash
# Build only web app with its environment
pnpm turbo build --filter=@encreasl/web

# Build only admin app with its environment
pnpm turbo build --filter=@encreasl/web-admin
```

## 🎯 Best Practices

### 1. **Variable Naming Convention**

```bash
# ✅ Good
NEXT_PUBLIC_APP_NAME=MyApp           # Public, client-side
FIREBASE_ADMIN_PRIVATE_KEY=secret    # Private, server-side
ADMIN_DATABASE_URL=postgresql://     # App-specific

# ❌ Bad
APP_NAME=MyApp                       # Not prefixed
PUBLIC_API_KEY=key                   # Wrong prefix
```

### 2. **Security Guidelines**

```bash
# ✅ Safe for client-side
NEXT_PUBLIC_FIREBASE_API_KEY=public_key
NEXT_PUBLIC_APP_VERSION=1.0.0

# ❌ Never expose on client-side
FIREBASE_ADMIN_PRIVATE_KEY=secret_key
DATABASE_PASSWORD=secret
API_SECRET=secret
```

### 3. **Environment-Specific Values**

```bash
# Development
# (No additional environment-specific variables needed)

# Production
# (No additional environment-specific variables needed)
```

### 4. **Feature Flags**

```bash
# Enable/disable features per environment
NEXT_PUBLIC_ENABLE_CONTACT_FORM=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=false
NEXT_PUBLIC_DEBUG_MODE=false
```

## 🔍 Troubleshooting

### 1. **Environment Variable Not Found**

```bash
# Error: Environment variable FIREBASE_API_KEY is required but not set

# Solution: Check variable name and prefix
NEXT_PUBLIC_FIREBASE_API_KEY=your_key  # ✅ Correct
FIREBASE_API_KEY=your_key              # ❌ Missing NEXT_PUBLIC_
```

### 2. **Validation Errors**

```bash
# Error: Invalid web environment variables

# Solution: Check the validation schema
# Ensure all required variables are set
# Check data types (string, number, boolean)
```

### 3. **Turborepo Cache Issues**

```bash
# Clear Turborepo cache
pnpm turbo clean

# Force rebuild without cache
pnpm turbo build --force
```

### 4. **App-Specific Variables Not Loading**

```bash
# Ensure app-specific .env.local exists
ls apps/web/.env.local
ls apps/web-admin/.env.local

# Check Turborepo filter
pnpm turbo dev --filter=@encreasl/web
```

## 🚀 Quick Start

1. **Copy environment files:**
   ```bash
   cp .env.example .env.local
   cp apps/web/.env.example apps/web/.env.local
   cp apps/web-admin/.env.example apps/web-admin/.env.local
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Validate environment:**
   ```bash
   pnpm turbo type-check
   ```

4. **Start development:**
   ```bash
   pnpm turbo dev
   ```

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Turborepo Environment Variables](https://turbo.build/repo/docs/core-concepts/monorepos/environment-variables)
- [Zod Validation](https://zod.dev/)
- [Firebase Configuration](https://firebase.google.com/docs/web/setup)
