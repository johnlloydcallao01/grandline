"use strict";
/**
 * @encreasl/auth - Shared authentication package
 *
 * Provides authentication utilities, hooks, and middleware
 * for PayloadCMS integration across the monorepo.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRole = exports.getUserDisplayName = exports.isInstructor = exports.isTrainee = exports.isAdmin = exports.hasAnyRole = exports.hasRole = exports.createRoleErrorMessage = exports.validateUserRole = exports.createMiddlewareConfig = exports.traineeAuthMiddleware = exports.adminAuthMiddleware = exports.createAuthMiddleware = exports.useTraineeAuth = exports.useRoleAuth = exports.useAdminAuth = exports.useAuth = exports.AuthClient = void 0;
// Core authentication client
var auth_client_1 = require("./auth-client");
Object.defineProperty(exports, "AuthClient", { enumerable: true, get: function () { return auth_client_1.AuthClient; } });
// React hooks
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useAuth", { enumerable: true, get: function () { return hooks_1.useAuth; } });
Object.defineProperty(exports, "useAdminAuth", { enumerable: true, get: function () { return hooks_1.useAdminAuth; } });
Object.defineProperty(exports, "useRoleAuth", { enumerable: true, get: function () { return hooks_1.useRoleAuth; } });
Object.defineProperty(exports, "useTraineeAuth", { enumerable: true, get: function () { return hooks_1.useTraineeAuth; } });
// Middleware
var middleware_1 = require("./middleware");
Object.defineProperty(exports, "createAuthMiddleware", { enumerable: true, get: function () { return middleware_1.createAuthMiddleware; } });
Object.defineProperty(exports, "adminAuthMiddleware", { enumerable: true, get: function () { return middleware_1.adminAuthMiddleware; } });
Object.defineProperty(exports, "traineeAuthMiddleware", { enumerable: true, get: function () { return middleware_1.traineeAuthMiddleware; } });
Object.defineProperty(exports, "createMiddlewareConfig", { enumerable: true, get: function () { return middleware_1.createMiddlewareConfig; } });
// Utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "validateUserRole", { enumerable: true, get: function () { return utils_1.validateUserRole; } });
Object.defineProperty(exports, "createRoleErrorMessage", { enumerable: true, get: function () { return utils_1.createRoleErrorMessage; } });
Object.defineProperty(exports, "hasRole", { enumerable: true, get: function () { return utils_1.hasRole; } });
Object.defineProperty(exports, "hasAnyRole", { enumerable: true, get: function () { return utils_1.hasAnyRole; } });
Object.defineProperty(exports, "isAdmin", { enumerable: true, get: function () { return utils_1.isAdmin; } });
Object.defineProperty(exports, "isTrainee", { enumerable: true, get: function () { return utils_1.isTrainee; } });
Object.defineProperty(exports, "isInstructor", { enumerable: true, get: function () { return utils_1.isInstructor; } });
Object.defineProperty(exports, "getUserDisplayName", { enumerable: true, get: function () { return utils_1.getUserDisplayName; } });
Object.defineProperty(exports, "formatRole", { enumerable: true, get: function () { return utils_1.formatRole; } });
//# sourceMappingURL=index.js.map