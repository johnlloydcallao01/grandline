# PayloadCMS API Protection Guide

## Overview

**YES, API Keys are the CORRECT approach** for protecting your PayloadCMS backend API from unauthorized access. This is API-level authentication (not user authentication), designed specifically to prevent abuse of your backend endpoints.

PayloadCMS provides built-in API Key authentication that allows you to:
- Protect all REST and GraphQL endpoints
- Control who can access your API programmatically  
- Prevent unauthorized users from fetching data even if they have your API URL
- Implement server-to-server authentication

## Step 1: Enable Authentication on a Collection

We'll use the existing Users collection to manage API keys for accessing the Courses collection.

### Verify Users Collection Config

Ensure your `src/collections/Users.ts` has API key authentication enabled:

```typescript
import { CollectionConfig } from 'payload/types'

const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Enable API key authentication for this collection
    useAPIKey: true,
    disableLocalStrategy: false,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Service',
          value: 'service',
        },
      ],
    },
    // API key field will be automatically added by Payload when useAPIKey: true
  ],
}

export default Users
```

## Step 2: Configure Payload Config

Ensure your main Payload configuration includes both Users and Courses collections:

```typescript
import { buildConfig } from 'payload/config'
import Users from './collections/Users'
import Courses from './collections/Courses'
// ... other imports

export default buildConfig({
  // ... other config
  collections: [
    Users, // API-key enabled collection
    Courses, // Protected courses collection
    // ... other collections
  ],
  // ... rest of config
})
```

## Step 3: Generate API Keys

Note that we have already created our user:
Email: johnwebsites2@gmail.com
Role: service
API Key: dd7d67ec-0b85-432e-9d66-54f9e0e400bf


Also please note that we already have these environment variables in our .env in our apps/cms:

# Payload CMS Configuration
PAYLOAD_SECRET=b7ce8020091c8ea4bd3d6540677e700102e3109c20e1f5c134d194fa4d57219b

# PayloadCMS API Key Configuration
PAYLOAD_API_KEY=dd7d67ec-0b85-432e-9d66-54f9e0e400bf
PAYLOAD_API_URL=https://cms.grandlinemaritime.com/api

### Generate API Keys Through Admin Panel

1. Start your PayloadCMS application
2. Log into the admin panel at `https://cms.grandlinemaritime.com/admin`
3. Navigate to the Users collection (or whichever collection you enabled API keys on)
4. Create a new user or edit an existing user
5. You'll see an "API Key" section in the form
6. Click "Generate API Key" to create a new key
7. **IMPORTANT**: Copy and save this API key immediately - it won't be shown again
8. Save the user



## Step 4: Secure Your API Endpoints

### Configure Access Control for Courses Collection

**IMPORTANT**: Let PayloadCMS handle API key authentication automatically.

Update your `src/collections/Courses.ts`:

```typescript
import type { CollectionConfig } from 'payload'

const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    // PayloadCMS automatically authenticates API keys and populates req.user
    read: ({ req: { user } }) => {
      // If user exists, they've been authenticated (either via API key or login)
      if (user) return true
      
      // Block all unauthenticated requests
      return false
    },
    // Restrict create/update/delete to admin users only
    create: ({ req: { user } }) => {
      return user && user.role === 'admin'
    },
    update: ({ req: { user } }) => {
      return user && user.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      return user && user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'draft',
    },
    // ... other course fields
  ],
}

export default Courses
```

### ⚠️ PayloadCMS 3.0 Known Issues:
Based on community reports, there have been some issues with API key authentication in version 3.0. If you encounter problems:

1. **Ensure you're on the latest 3.0+ version**
2. **Check that your collection is properly configured with auth enabled**
3. **Verify the API key is generated and stored correctly**
4. **Test with simple access rules first**

### Alternative Access Control Pattern for Courses:
If you encounter issues with the standard approach, try this more explicit pattern:

```typescript
const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    read: (args) => {
      const { req } = args
      
      // Check if request is authenticated via API key
      if (req.user) {
        console.log('Authenticated user:', req.user.id)
        return true
      }
      
      console.log('No authenticated user found')
      return false
    },
  },
  // ... rest of config
}
```

### Why This Works:
1. PayloadCMS intercepts requests with `Authorization: users API-Key <key>` headers
2. It automatically validates the API key against your Users collection
3. If valid, it populates `req.user` with the authenticated user document
4. Your access functions can then check `req.user` normally
5. No manual parsing or validation needed

### Advanced Access Control for Courses

For more granular control based on user roles:

```typescript
import { CollectionConfig } from 'payload/types'

const Courses: CollectionConfig = {
  slug: 'courses',
  access: {
    read: ({ req: { user } }) => {
      // Only allow if user exists and has API access
      if (!user) return false
      
      // Check if user has specific role for API access
      if (user.role === 'service' || user.role === 'admin') {
        return true
      }
      
      return false
    },
    create: ({ req: { user } }) => {
      // Only admins can create courses
      return user?.role === 'admin' || false
    },
    update: ({ req: { user } }) => {
      // Only admins can update courses
      return user?.role === 'admin' || false
    },
    delete: ({ req: { user } }) => {
      // Only admins can delete courses
      return user?.role === 'admin' || false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
    },
    // ... other course fields
  ],
}

export default Courses
```

## Step 5: Make Authenticated API Requests for Courses

However, your current course-service.ts is NOT using API keys.

Your current implementation lacks the Authorization header:

TypeScript



// ❌ Current - No API keyheaders: {  'Content-Type': 'application/  json',}
It should be:

TypeScript



// ✅ Correct - With API keyheaders: {  'Authorization': `users API-Key $  {process.env.PAYLOAD_API_KEY}`,  'Content-Type': 'application/  json',}
Summary of Required Fixes:
1.
Fix Courses collection access control to require authentication
2.
Update course-service.ts to include API key in requests
3.
Add environment variable PAYLOAD_API_KEY to your web app's .env

### REST API Authentication

The API key must be included in the `Authorization` header with this exact format:

```
Authorization: users API-Key dd7d67ec-0b85-432e-9d66-54f9e0e400bf
```

**Important Format Details:**
- Use the collection slug (`users`) 
- Followed by ` API-Key ` (with spaces)
- Followed by your actual API key

### Updated Course Service Implementation

Update your `apps/web/src/server/services/course-service.ts` to include API key authentication:

```typescript
import 'server-only';

// ... existing interfaces ...

export class CourseService {
  private static readonly API_BASE = 'https://cms.grandlinemaritime.com/api';
  private static readonly API_KEY = process.env.PAYLOAD_API_KEY || 'dd7d67ec-0b85-432e-9d66-54f9e0e400bf';
  
  /**
   * Fetch courses from CMS with API key authentication
   */
  static async getCourses(options: CourseServiceOptions = {}): Promise<Course[]> {
    const {
      status = 'published',
      limit = 8,
      page = 1
    } = options;

    try {
      const params = new URLSearchParams({
        status,
        limit: limit.toString(),
        page: page.toString(),
      });

      const response = await fetch(`${CourseService.API_BASE}/courses?${params}`, {
        next: { revalidate: 300 }, // 5 minutes cache for ISR
        headers: {
          'Authorization': `users API-Key ${CourseService.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }
      
      const data: CoursesResponse = await response.json();
      return data.docs || [];
    } catch (error) {
      console.error('Error fetching courses:', error);
      return []; // Graceful fallback
    }
  }

  /**
   * Get course count with API key authentication
   */
  static async getCourseCount(status: 'published' | 'draft' = 'published'): Promise<number> {
    try {
      const params = new URLSearchParams({
        status,
        limit: '1',
        page: '1',
      });

      const response = await fetch(`${CourseService.API_BASE}/courses?${params}`, {
        next: { revalidate: 300 },
        headers: {
          'Authorization': `users API-Key ${CourseService.API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch course count: ${response.status}`);
      }
      
      const data: CoursesResponse = await response.json();
      return data.totalDocs || 0;
    } catch (error) {
      console.error('Error fetching course count:', error);
      return 0;
    }
  }
}
```

### cURL Examples for Courses

```bash
# GET courses with API key (PayloadCMS built-in endpoint)
curl -H "Authorization: users API-Key dd7d67ec-0b85-432e-9d66-54f9e0e400bf" \
     -H "Content-Type: application/json" \
     https://cms.grandlinemaritime.com/api/courses

# GET courses with status filter (PayloadCMS built-in endpoint)
curl -H "Authorization: users API-Key dd7d67ec-0b85-432e-9d66-54f9e0e400bf" \
     -H "Content-Type: application/json" \
     "https://cms.grandlinemaritime.com/api/courses?where[status][equals]=published&limit=8"
```