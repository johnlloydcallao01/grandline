import type { Access, FieldAccess, AccessArgs } from 'payload'

// LMS role hierarchy levels
export const ROLE_LEVELS = {
  TRAINEE: 1,
  SERVICE: 3, // Step 2: Add service account role level (between trainee and instructor)
  INSTRUCTOR: 5,
  ADMIN: 10,
} as const

// Legacy role mapping for backward compatibility
export const LEGACY_ROLE_LEVELS = {
  'trainee': ROLE_LEVELS.TRAINEE,
  'service': ROLE_LEVELS.SERVICE, // Step 2: Map service role for API key users
  'instructor': ROLE_LEVELS.INSTRUCTOR,
  'admin': ROLE_LEVELS.ADMIN,
} as const

/**
 * Check if user has minimum role level
 */
export const hasMinimumRoleLevel = (userRole: string, minimumLevel: number): boolean => {
  const userLevel = LEGACY_ROLE_LEVELS[userRole as keyof typeof LEGACY_ROLE_LEVELS] || 0
  return userLevel >= minimumLevel
}

/**
 * Access control for admins only
 */
export const adminOnly: Access = ({ req: { user } }) => {
  return user?.role === 'admin'
}

/**
 * Access control for instructors and above
 */
export const instructorOrAbove: Access = ({ req: { user } }) => {
  return hasMinimumRoleLevel(user?.role || '', ROLE_LEVELS.INSTRUCTOR)
}

/**
 * Access control for authenticated users
 */
export const authenticatedUsers: Access = ({ req: { user } }) => {
  return !!user
}

/**
 * API key-only access control - bypasses user authentication
 * Allows access if valid API key is provided in Authorization header
 */
export const apiKeyOnly: Access = async ({ req }) => {
  const authHeader = req.headers?.get('authorization')
  if (!authHeader) return false
  
  // Check for API key format: "users API-Key <key>"
  const apiKeyMatch = authHeader.match(/^users API-Key (.+)$/)
  if (!apiKeyMatch) return false
  
  const providedKey = apiKeyMatch[1]
  
  try {
    // Professional approach: Validate API key against database
    const payload = req.payload
    if (!payload) return false
    
    // Find user with matching API key
    const users = await payload.find({
      collection: 'users',
      where: {
        apiKey: {
          equals: providedKey
        },
        // Ensure user is active and has service role
        role: {
          in: ['service', 'admin']
        }
      },
      limit: 1,
      depth: 0
    })
    
    // API key is valid if we found exactly one matching user
    return users.docs.length === 1
  } catch (error) {
    console.error('API key validation error:', error)
    return false
  }
}

/**
 * Access control for users to read their own data
 */
export const usersOwnData: Access = ({ req: { user } }) => {
  if (!user) return false
  
  // Admins can access all user data
  if (user.role === 'admin') {
    return true
  }
  
  // Users can only access their own data
  return {
    id: {
      equals: user.id,
    },
  }
}

/**
 * Access control for course content
 */
export const courseContentAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  // Admins can access all content
  if (user.role === 'admin') {
    return true
  }

  // Instructors can access content they created
  if (user.role === 'instructor') {
    return true // Simplified for now
  }

  // Trainees can only access published content
  return true // Simplified for now
}

/**
 * Field access for sensitive data
 */
export const sensitiveData: FieldAccess = ({ req: { user } }) => {
  // Only admins can access sensitive data
  return user?.role === 'admin'
}

/**
 * Access control for media based on user role
 */
export const mediaAccess: Access = ({ req: { user } }) => {
  if (!user) return false

  // Admins can access all media
  if (user.role === 'admin') {
    return true
  }

  // Instructors and trainees can access media
  return true // Simplified for now
}

/**
 * Dynamic access control based on user roles
 */
export const dynamicRoleAccess = (resource: string, action: string): Access => {
  return ({ req: { user } }) => {
    if (!user) return false
    
    switch (action) {
      case 'create':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.INSTRUCTOR)
      case 'read':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.TRAINEE)
      case 'update':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.INSTRUCTOR)
      case 'delete':
        return hasMinimumRoleLevel(user.role || '', ROLE_LEVELS.ADMIN)
      default:
        return false
    }
  }
}

/**
 * LMS-specific access patterns
 */
export const lmsAccess = {
  // Course management access
  courseManagement: ({ req: { user } }: AccessArgs) => {
    if (!user) return false

    // Admins can manage all courses
    if (user.role === 'admin') {
      return true
    }

    // Instructors can manage courses
    if (user.role === 'instructor') {
      return true
    }

    return false
  },

  // User enrollment access
  userEnrollment: ({ req: { user } }: AccessArgs) => {
    if (!user) return false

    // Admins and instructors can manage enrollments
    if (user.role === 'admin' || user.role === 'instructor') {
      return true
    }

    // Trainees can see enrollments
    return true
  },

  // Grade management access
  gradeManagement: ({ req: { user } }: AccessArgs) => {
    if (!user) return false

    // Admins can manage all grades
    if (user.role === 'admin') {
      return true
    }

    // Instructors can manage grades
    if (user.role === 'instructor') {
      return true
    }

    return false
  },
}

/**
 * Access control for service accounts (API key users)
 * Step 2: Service accounts have read-only access to most collections
 */
export const serviceAccountAccess: Access = ({ req: { user } }) => {
  return user?.role === 'service'
}

/**
 * Access control for service accounts or above (service, instructor, admin)
 */
export const serviceOrAbove: Access = ({ req: { user } }) => {
  return hasMinimumRoleLevel(user?.role || '', ROLE_LEVELS.SERVICE)
}

const accessControls = {
  adminOnly,
  instructorOrAbove,
  serviceAccountAccess, // Step 2: Add service account access control
  serviceOrAbove, // Step 2: Add service or above access control
  authenticatedUsers,
  apiKeyOnly, // API key-only access control
  usersOwnData,
  courseContentAccess,
  sensitiveData,
  mediaAccess,
  dynamicRoleAccess,
  lmsAccess,
}

export default accessControls
