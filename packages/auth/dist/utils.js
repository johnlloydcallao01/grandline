"use strict";
/**
 * Authentication utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserRole = validateUserRole;
exports.createRoleErrorMessage = createRoleErrorMessage;
exports.hasRole = hasRole;
exports.hasAnyRole = hasAnyRole;
exports.isAdmin = isAdmin;
exports.isTrainee = isTrainee;
exports.isInstructor = isInstructor;
exports.getUserDisplayName = getUserDisplayName;
exports.formatRole = formatRole;
/**
 * Validate user role against configuration
 */
function validateUserRole(user, config) {
    // Custom validator takes precedence
    if (config.customValidator) {
        return config.customValidator(user);
    }
    // If no role requirements, allow all authenticated users
    if (!config.requiredRole && !config.allowedRoles) {
        return true;
    }
    // Check required role (exact match)
    if (config.requiredRole) {
        if (Array.isArray(config.requiredRole)) {
            return config.requiredRole.includes(user.role);
        }
        return user.role === config.requiredRole;
    }
    // Check allowed roles
    if (config.allowedRoles) {
        return config.allowedRoles.includes(user.role);
    }
    return false;
}
/**
 * Create role validation error message
 */
function createRoleErrorMessage(user, config) {
    if (config.requiredRole) {
        var required = Array.isArray(config.requiredRole)
            ? config.requiredRole.join(' or ')
            : config.requiredRole;
        return "Access denied. Required role: ".concat(required, ". Current role: ").concat(user.role);
    }
    if (config.allowedRoles) {
        return "Access denied. Allowed roles: ".concat(config.allowedRoles.join(', '), ". Current role: ").concat(user.role);
    }
    return 'Access denied. Insufficient permissions.';
}
/**
 * Check if user has specific role
 */
function hasRole(user, role) {
    return (user === null || user === void 0 ? void 0 : user.role) === role;
}
/**
 * Check if user has any of the specified roles
 */
function hasAnyRole(user, roles) {
    return user ? roles.includes(user.role) : false;
}
/**
 * Check if user is admin
 */
function isAdmin(user) {
    return hasRole(user, 'admin');
}
/**
 * Check if user is trainee
 */
function isTrainee(user) {
    return hasRole(user, 'trainee');
}
/**
 * Check if user is instructor
 */
function isInstructor(user) {
    return hasRole(user, 'instructor');
}
/**
 * Get user display name
 */
function getUserDisplayName(user) {
    if (!user)
        return 'Unknown User';
    if (user.displayName)
        return user.displayName;
    if (user.firstName && user.lastName) {
        return "".concat(user.firstName, " ").concat(user.lastName);
    }
    if (user.firstName)
        return user.firstName;
    return user.email;
}
/**
 * Format user role for display
 */
function formatRole(role) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}
//# sourceMappingURL=utils.js.map