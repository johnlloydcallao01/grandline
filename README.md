# Encreasl - Ecommerce Marketing Agency

A modern monorepo built with **Turborepo**, **pnpm**, **Next.js**, and **TypeScript** for the Encreasl ecommerce marketing agency.

## 🏗️ **Monorepo Architecture**

This project uses **Turborepo** with **pnpm workspaces** to manage multiple packages efficiently:

```
encreasl/
├── apps/
│   └── web/                 # Next.js marketing website
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # Shared ESLint configurations
│   └── typescript-config/   # Shared TypeScript configurations
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package.json
```

## 🚀 **Getting Started**

### Prerequisites
- **Node.js** 18+
- **pnpm** 8+ (install with `npm install -g pnpm`)

### Installation
```bash
# Install all dependencies across the monorepo
pnpm install

# Set up environment variables
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/web-admin/.env.example apps/web-admin/.env.local

# Fill in your environment variables in the .env.local files
```

### Development
```bash
# Start all development servers
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

## 📦 **Packages**

### Apps
- **`@encreasl/web`** - Next.js marketing website with Tailwind CSS (Port 3000)
- **`@encreasl/web-admin`** - Next.js admin dashboard (Port 3001)

### Shared Packages
- **`@encreasl/ui`** - Reusable React components (Button, Card, etc.)
- **`@encreasl/env`** - Environment variable validation and type safety
- **`@encreasl/eslint-config`** - Shared ESLint configurations
- **`@encreasl/typescript-config`** - Shared TypeScript configurations

## 🛠️ **Tech Stack**

- **⚡ Turborepo** - High-performance build system
- **📦 pnpm** - Fast, disk space efficient package manager
- **⚛️ Next.js 15** - React framework with App Router
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **📘 TypeScript** - Type-safe JavaScript
- **🌍 Zod** - Environment variable validation
- **🔧 ESLint** - Code linting and formatting
- **🚀 Turbopack** - Ultra-fast bundler for development

## 🌍 **Environment Variables**

This monorepo uses a **hierarchical environment variable system**:

- **Root level** (`.env.local`) - Shared across all apps
- **App level** (`apps/*/env.local`) - App-specific overrides
- **Type safety** with Zod validation
- **Turborepo optimization** for caching

### Quick Setup
```bash
# Copy example files
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/web-admin/.env.example apps/web-admin/.env.local

# Edit with your values
nano .env.local
```

📖 **[Full Environment Variables Guide →](docs/environment-variables.md)**

## 🏃‍♂️ **Development Workflow**

### Adding New Packages
```bash
# Create new package directory
mkdir packages/new-package

# Add package.json
echo '{"name": "@encreasl/new-package", "version": "0.1.0"}' > packages/new-package/package.json

# Install dependencies
pnpm install
```

### Working with Shared Components
```typescript
// Import shared UI components in any app
import { Button } from "@encreasl/ui/button";
import { Card } from "@encreasl/ui/card";

export default function MyPage() {
  return (
    <Card title="My Card">
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## 🔧 **Available Scripts**

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development servers for all apps |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Type check all packages |

## 🌐 **Deployment**

The monorepo is optimized for deployment on **Vercel** with automatic detection of the Next.js app in `apps/web`.

## 📄 **License**

Private - Encreasl Marketing Agency
