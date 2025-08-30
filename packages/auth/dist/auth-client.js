"use strict";
/**
 * Authentication client for PayloadCMS integration
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClient = void 0;
var AuthClient = /** @class */ (function () {
    function AuthClient(config) {
        this.config = __assign({ cookieName: 'payload-token', debug: false }, config);
    }
    /**
     * Authenticate user with PayloadCMS
     */
    AuthClient.prototype.login = function (credentials) {
        return __awaiter(this, void 0, void 0, function () {
            var response, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (this.config.debug) {
                            console.log('🔐 PayloadCMS login initiated...');
                            console.log('📧 Email:', credentials.email);
                            console.log('🌐 API URL:', this.config.apiUrl);
                        }
                        return [4 /*yield*/, fetch("".concat(this.config.apiUrl, "/users/login"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(credentials),
                                credentials: 'include', // Important for cookie handling
                            })];
                    case 1:
                        response = _a.sent();
                        if (this.config.debug) {
                            console.log('📡 Login response status:', response.status);
                            console.log('📡 Login response headers:', response.headers);
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (!response.ok) {
                            throw new Error(result.message || 'Login failed');
                        }
                        // Validate user is active
                        if (!result.user.isActive) {
                            throw new Error('Account is inactive. Please contact administrator.');
                        }
                        if (this.config.debug) {
                            console.log('✅ PayloadCMS login successful:', {
                                email: result.user.email,
                                role: result.user.role,
                                isActive: result.user.isActive,
                                token: result.token ? 'Present' : 'Missing'
                            });
                        }
                        // Handle cookie setting if needed
                        if (typeof window !== 'undefined' && result.token && !document.cookie.includes(this.config.cookieName)) {
                            if (this.config.debug) {
                                console.log('⚠️ PayloadCMS did not set cookie, setting manually...');
                            }
                            document.cookie = "".concat(this.config.cookieName, "=").concat(result.token, "; path=/; SameSite=Lax");
                            if (this.config.debug) {
                                console.log('✅ Cookie set manually');
                            }
                        }
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        if (this.config.debug) {
                            console.error('❌ PayloadCMS login failed:', error_1);
                        }
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate user role against configuration
     */
    AuthClient.prototype.validateUserRole = function (user) {
        // If no role requirements, allow all authenticated users
        if (!this.config.requiredRole && !this.config.allowedRoles) {
            return true;
        }
        // Check required role (exact match)
        if (this.config.requiredRole) {
            if (Array.isArray(this.config.requiredRole)) {
                return this.config.requiredRole.includes(user.role);
            }
            return user.role === this.config.requiredRole;
        }
        // Check allowed roles
        if (this.config.allowedRoles) {
            return this.config.allowedRoles.includes(user.role);
        }
        return false;
    };
    /**
     * Check if user has valid authentication cookie
     */
    AuthClient.prototype.hasAuthCookie = function () {
        if (typeof window === 'undefined')
            return false;
        return document.cookie.includes(this.config.cookieName);
    };
    /**
     * Clear authentication cookie
     */
    AuthClient.prototype.clearAuthCookie = function () {
        if (typeof window === 'undefined')
            return;
        document.cookie = "".concat(this.config.cookieName, "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
    };
    /**
     * Get current user from API
     */
    AuthClient.prototype.getCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("".concat(this.config.apiUrl, "/users/me"), {
                                credentials: 'include',
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, result.user || null];
                    case 3:
                        error_2 = _a.sent();
                        if (this.config.debug) {
                            console.error('Failed to get current user:', error_2);
                        }
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AuthClient;
}());
exports.AuthClient = AuthClient;
//# sourceMappingURL=auth-client.js.map