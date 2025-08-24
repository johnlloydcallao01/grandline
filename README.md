# GrandLine - Maritime Professionals LMS Platform

A comprehensive Learning Management System (LMS) designed specifically for maritime professionals, built with modern technologies including **Turborepo**, **pnpm**, **Next.js**, **PayloadCMS**, and **TypeScript**.

## 🚢 **About GrandLine**

GrandLine is a specialized LMS platform that provides maritime professionals with:
- **Certification Courses** - IMO, STCW, and industry-specific training
- **Skills Assessment** - Competency evaluations and progress tracking
- **Digital Certificates** - Blockchain-verified maritime credentials
- **Career Development** - Professional advancement pathways
- **Industry Resources** - Maritime regulations, best practices, and updates

## 🏗️ **Monorepo Architecture**

This project uses **Turborepo** with **pnpm workspaces** to manage multiple packages efficiently:

```
grandline/
├── apps/
│   ├── cms/                 # PayloadCMS - Content management system
│   ├── web/                 # Next.js main LMS platform
│   └── web-admin/           # Next.js admin dashboard
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── cms-types/           # PayloadCMS type definitions
│   ├── env/                 # Environment variable validation
│   ├── eslint-config/       # Shared ESLint configurations
│   └── typescript-config/   # Shared TypeScript configurations
├── functions/               # Firebase Cloud Functions
├── docs/                    # Documentation
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace configuration
└── package.json            # Root package.json
```

## 🚀 **Getting Started**

### Prerequisites
- **Node.js** 18+ (Node.js 22 recommended)
- **pnpm** 8+ (install with `npm install -g pnpm`)
- **PostgreSQL** database (Supabase recommended)
- **Cloudinary** account for media storage
- **Firebase** project for cloud functions (optional)

### Installation
```bash
# Clone the repository
git clone https://github.com/johnlloydcallao01/grandline.git
cd grandline

# Install all dependencies across the monorepo
pnpm install

# Set up environment variables for CMS
cp apps/cms/.env.example apps/cms/.env
# Edit apps/cms/.env with your database and service credentials

# Set up environment variables for other apps
cp apps/web/.env.example apps/web/.env.local
cp apps/web-admin/.env.example apps/web-admin/.env.local
```

### Development
```bash
# Start CMS development server
pnpm dev:cms          # Runs on http://localhost:3001

# Start main LMS platform
pnpm dev:web          # Runs on http://localhost:3000

# Start admin dashboard
pnpm dev:admin        # Runs on http://localhost:3002

# Start all development servers
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Type check all packages
pnpm type-check
```

## 📦 **Applications & Packages**

### Applications
- **`cms`** - PayloadCMS content management system with PostgreSQL and Cloudinary (Port 3001)
  - Course content management
  - User administration
  - Media library with Cloudinary integration
  - RESTful and GraphQL APIs
- **`web`** - Next.js main LMS platform (Port 3000)
  - Student dashboard and course interface
  - Interactive learning modules
  - Progress tracking and assessments
  - Certificate generation
- **`web-admin`** - Next.js administrative dashboard (Port 3002)
  - Analytics and reporting
  - User management
  - System configuration

### Shared Packages
- **`ui`** - Maritime-themed React components (Navigation, Course Cards, Progress Bars, etc.)
- **`cms-types`** - TypeScript definitions for PayloadCMS collections
- **`env`** - Environment variable validation and type safety
- **`eslint-config`** - Shared ESLint configurations
- **`typescript-config`** - Shared TypeScript configurations

### Cloud Functions
- **`functions`** - Firebase Cloud Functions for notifications and background tasks

## 🛠️ **Tech Stack**

### Core Technologies
- **⚡ Turborepo** - High-performance build system for monorepo
- **📦 pnpm** - Fast, disk space efficient package manager
- **⚛️ Next.js 15** - React framework with App Router
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **📘 TypeScript** - Type-safe JavaScript development

### Backend & Database
- **�️ PayloadCMS** - Headless CMS for content management
- **🐘 PostgreSQL** - Robust relational database (via Supabase)
- **☁️ Supabase** - Backend-as-a-Service platform
- **📸 Cloudinary** - Media storage and optimization

### Development Tools
- **�🌍 Zod** - Environment variable validation
- **🔧 ESLint** - Code linting and formatting
- **🚀 Turbopack** - Ultra-fast bundler for development
- **🔥 Firebase** - Cloud functions and notifications

### Maritime-Specific Features
- **📜 Digital Certificates** - Blockchain-ready credential system
- **📊 Progress Tracking** - Competency-based learning analytics
- **🎓 Course Management** - IMO/STCW compliant training modules
- **👥 User Roles** - Students, Instructors, Administrators, Maritime Authorities

## 🌍 **Environment Variables**

The platform requires several environment variables for proper operation:

### CMS Configuration (apps/cms/.env)
```bash
# Database
DATABASE_URI=postgresql://username:password@host:port/database

# PayloadCMS
PAYLOAD_SECRET=your-secret-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Quick Setup
```bash
# Copy example files
cp apps/cms/.env.example apps/cms/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/web-admin/.env.example apps/web-admin/.env.local

# Edit with your actual credentials
nano apps/cms/.env
```

📖 **[Full Environment Variables Guide →](docs/environment-variables.md)**

## 🏃‍♂️ **Development Workflow**

### CMS Development
```bash
# Start CMS with database connection test
cd apps/cms
pnpm run db:test        # Test database connectivity
pnpm dev               # Start CMS development server

# Access CMS admin panel
# http://localhost:3001/admin
```

### Adding New Course Content
```bash
# Use PayloadCMS admin interface or API
# 1. Create course collections via admin panel
# 2. Upload media to Cloudinary via CMS
# 3. Define course structure and assessments
# 4. Publish courses for students
```

### Working with Shared Components
```typescript
// Import maritime-themed UI components
import { CourseCard } from "@grandline/ui/course-card";
import { ProgressBar } from "@grandline/ui/progress-bar";
import { CertificateBadge } from "@grandline/ui/certificate-badge";

export default function StudentDashboard() {
  return (
    <div className="maritime-dashboard">
      <CourseCard
        title="STCW Basic Safety Training"
        progress={75}
        certification="IMO"
      />
      <ProgressBar value={75} maritime={true} />
      <CertificateBadge type="completed" course="BST" />
    </div>
  );
}
```

## 🔧 **Available Scripts**

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm dev:cms` | Start PayloadCMS server (Port 3001) |
| `pnpm dev:web` | Start main LMS platform (Port 3000) |
| `pnpm dev:admin` | Start admin dashboard (Port 3002) |
| `pnpm build` | Build all packages and apps |
| `pnpm build:cms` | Build CMS application |
| `pnpm build:web` | Build main web application |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Type check all packages |
| `pnpm db:test` | Test database connection (CMS) |

## 🌐 **Deployment**

### Recommended Deployment Stack
- **CMS**: Deploy to **Railway** or **Render** (supports PostgreSQL)
- **Web Apps**: Deploy to **Vercel** or **Netlify**
- **Database**: **Supabase** (managed PostgreSQL)
- **Media Storage**: **Cloudinary**
- **Functions**: **Firebase** or **Vercel Functions**

### Environment Setup for Production
1. Set up Supabase project with PostgreSQL database
2. Configure Cloudinary for media storage
3. Deploy CMS with database connection
4. Deploy web applications with API endpoints
5. Configure domain and SSL certificates

## 🚢 **Maritime Industry Compliance**

This LMS platform is designed to support:
- **IMO (International Maritime Organization)** standards
- **STCW (Standards of Training, Certification and Watchkeeping)** requirements
- **MLC (Maritime Labour Convention)** compliance
- **Flag State** and **Port State** regulations
- **Industry Best Practices** for maritime training

## 📄 **License**

MIT License - Open source maritime education platform

## 🤝 **Contributing**

We welcome contributions from the maritime community! Please read our contributing guidelines and help us improve maritime education worldwide.

---

**Built with ⚓ for the maritime community**
