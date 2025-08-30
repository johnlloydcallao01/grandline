"use strict";
/**
 * React hooks for authentication
 */
'use client';
/**
 * React hooks for authentication
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
exports.useAuth = useAuth;
exports.useAdminAuth = useAdminAuth;
exports.useRoleAuth = useRoleAuth;
exports.useTraineeAuth = useTraineeAuth;
var react_1 = require("react");
var auth_client_1 = require("./auth-client");
/**
 * Hook for authentication state management
 */
function useAuth(config) {
    var _this = this;
    if (config === void 0) { config = { apiUrl: '' }; }
    var _a = (0, react_1.useState)({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
        error: null,
    }), state = _a[0], setState = _a[1];
    var authClient = new auth_client_1.AuthClient(config);
    var login = (0, react_1.useCallback)(function (credentials) { return __awaiter(_this, void 0, void 0, function () {
        var response, roleError, error_1, errorMessage_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true, error: null })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, authClient.login(credentials)];
                case 2:
                    response = _a.sent();
                    // Validate user role if configured
                    if (!authClient.validateUserRole(response.user)) {
                        roleError = config.requiredRole
                            ? "Access denied. Required role: ".concat(config.requiredRole, ". Current role: ").concat(response.user.role)
                            : 'Access denied. Insufficient permissions.';
                        throw new Error(roleError);
                    }
                    setState({
                        isAuthenticated: true,
                        user: response.user,
                        token: response.token || null,
                        isLoading: false,
                        error: null,
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    errorMessage_1 = (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Authentication failed. Please check your credentials.';
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: { message: errorMessage_1 } })); });
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    }); }, [authClient, config.requiredRole]);
    var logout = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
            try {
                authClient.clearAuthCookie();
                setState({
                    isAuthenticated: false,
                    user: null,
                    token: null,
                    isLoading: false,
                    error: null,
                });
            }
            catch (error) {
                setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: false, error: { message: 'Logout failed' } })); });
            }
            return [2 /*return*/];
        });
    }); }, [authClient]);
    var checkAuth = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var user, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!authClient.hasAuthCookie()) {
                        return [2 /*return*/, false];
                    }
                    setState(function (prev) { return (__assign(__assign({}, prev), { isLoading: true })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, authClient.getCurrentUser()];
                case 2:
                    user = _a.sent();
                    if (user && authClient.validateUserRole(user)) {
                        setState({
                            isAuthenticated: true,
                            user: user,
                            token: null, // Token is in cookie
                            isLoading: false,
                            error: null,
                        });
                        return [2 /*return*/, true];
                    }
                    else {
                        setState({
                            isAuthenticated: false,
                            user: null,
                            token: null,
                            isLoading: false,
                            error: null,
                        });
                        return [2 /*return*/, false];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    setState({
                        isAuthenticated: false,
                        user: null,
                        token: null,
                        isLoading: false,
                        error: { message: 'Authentication check failed' },
                    });
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [authClient]);
    var clearError = (0, react_1.useCallback)(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { error: null })); });
    }, []);
    return __assign(__assign({}, state), { login: login, logout: logout, checkAuth: checkAuth, clearError: clearError });
}
/**
 * Hook for admin authentication (convenience wrapper)
 */
function useAdminAuth(apiUrl, debug) {
    if (debug === void 0) { debug = false; }
    return useAuth({
        apiUrl: apiUrl,
        requiredRole: 'admin',
        debug: debug,
    });
}
/**
 * Hook for role-based authentication
 */
function useRoleAuth(apiUrl, roleConfig, debug) {
    if (debug === void 0) { debug = false; }
    return useAuth(__assign(__assign({ apiUrl: apiUrl }, roleConfig), { debug: debug }));
}
/**
 * Hook for trainee authentication (convenience wrapper)
 */
function useTraineeAuth(apiUrl, debug) {
    if (debug === void 0) { debug = false; }
    return useAuth({
        apiUrl: apiUrl,
        requiredRole: 'trainee',
        debug: debug,
    });
}
//# sourceMappingURL=hooks.js.map