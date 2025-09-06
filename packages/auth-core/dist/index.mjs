// src/hooks/useAuth.ts
import { useState, useEffect } from "react";
function useAuth(allowedRole) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [securityAlert, setSecurityAlert] = useState(null);
  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const apiUrl = "https://grandline-cms.vercel.app/api";
        const payloadToken = document.cookie.split("; ").find((row) => row.startsWith("payload-token="))?.split("=")[1];
        console.log("\u{1F50D} USEAUTH: Checking for payload-token cookie");
        console.log("Available cookies:", document.cookie);
        console.log("Found payload-token:", payloadToken ? "Yes" : "No");
        if (!payloadToken) {
          console.log("\u274C USEAUTH: No authentication token found");
          setLoading(false);
          setUser(null);
          setError("No authentication token found");
          return;
        }
        console.log("\u2705 USEAUTH: Token found, validating with server");
        const response = await fetch(`${apiUrl}/users/me`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${payloadToken}`
          }
        });
        console.log("\u{1F310} USEAUTH: Server response status:", response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log("\u{1F4CB} USEAUTH: User data received:", userData);
          let extractedUser = null;
          if (userData.user) {
            extractedUser = userData.user;
          } else if (userData.id && userData.email) {
            extractedUser = userData;
          }
          if (extractedUser) {
            console.log("\u{1F464} USEAUTH: Extracted user:", extractedUser);
            if (extractedUser.role !== allowedRole) {
              console.log("\u{1F6A8} USEAUTH: Role mismatch - expected:", allowedRole, "got:", extractedUser.role);
              setSecurityAlert({
                show: true,
                type: "role-changed",
                message: `Your role has been changed from ${allowedRole} to ${extractedUser.role}. You no longer have access to this application.`
              });
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + (/* @__PURE__ */ new Date()).toUTCString() + ";path=/");
              });
              setError(`Access denied. ${allowedRole} role required. Current role: ${extractedUser.role}`);
              setUser(null);
              return;
            }
            if (!extractedUser.isActive) {
              console.log("\u{1F6A8} USEAUTH: Account deactivated");
              setSecurityAlert({
                show: true,
                type: "account-deactivated",
                message: "Your account has been deactivated by an administrator. Please contact support for assistance."
              });
              document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + (/* @__PURE__ */ new Date()).toUTCString() + ";path=/");
              });
              setError("Account has been deactivated. Please contact administrator.");
              setUser(null);
              return;
            }
            console.log("\u2705 USEAUTH: Authentication successful");
            setUser(extractedUser);
            setError(null);
          } else {
            console.log("\u274C USEAUTH: Unable to extract user data from response");
            setError("Unable to extract user data from response");
          }
        } else {
          const errorText = await response.text();
          if (response.status === 404 || response.status === 401 || response.status === 403) {
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + (/* @__PURE__ */ new Date()).toUTCString() + ";path=/");
            });
            setUser(null);
            setError(`Access denied: ${response.status === 404 ? "User not found" : "Unauthorized access"}`);
            setLoading(false);
            return;
          }
          setError(`Authentication failed: ${response.status} ${errorText}`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes("404") || errorMessage.includes("401") || errorMessage.includes("403")) {
          document.cookie.split(";").forEach(function(c) {
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + (/* @__PURE__ */ new Date()).toUTCString() + ";path=/");
          });
          setUser(null);
          setError("Access denied: Authentication failed");
          setLoading(false);
          return;
        }
        setError(`Network error: ${err}`);
      } finally {
        setLoading(false);
      }
    }
    fetchCurrentUser();
    const roleValidationInterval = setInterval(() => {
      console.log("\u{1F50D} AGGRESSIVE PERIODIC VALIDATION: Checking user authentication status...");
      fetchCurrentUser();
    }, 5e3);
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("\u{1F50D} VISIBILITY CHANGE: Re-validating authentication...");
        fetchCurrentUser();
      }
    };
    const handleFocus = () => {
      console.log("\u{1F50D} WINDOW FOCUS: Re-validating authentication...");
      fetchCurrentUser();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      console.log("\u{1F9F9} USEAUTH: Cleaning up periodic validation interval and event listeners");
      clearInterval(roleValidationInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [allowedRole]);
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user && !error,
    securityAlert
  };
}
function getFullName(user) {
  if (!user) return "User";
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else {
    return user.email?.split("@")[0] || "User";
  }
}
function getUserInitials(user) {
  if (!user) return "U";
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (lastName) {
    return lastName.charAt(0).toUpperCase();
  } else {
    return user.email?.charAt(0).toUpperCase() || "U";
  }
}

// src/utils/auth-api.ts
var PayloadCMSAuth = class {
  constructor(apiUrl, cookieName = "payload-token") {
    this.apiUrl = apiUrl;
    this.cookieName = cookieName;
  }
  /**
   * Login user with email and password
   */
  async login(credentials) {
    const response = await fetch(`${this.apiUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials),
      credentials: "include"
      // Important for cookie handling
    });
    if (!response.ok) {
      const result2 = await response.json();
      throw new Error(result2.message || "Login failed");
    }
    const result = await response.json();
    if (this.cookieName !== "payload-token" && typeof document !== "undefined") {
      console.log("\u{1F504} Setting up custom cookie:", this.cookieName);
      const payloadToken = document.cookie.split("; ").find((row) => row.startsWith("payload-token="))?.split("=")[1];
      console.log("\u{1F36A} PayloadCMS token found:", payloadToken ? "Yes" : "No");
      if (payloadToken) {
        const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
        const cookieString = `${this.cookieName}=${payloadToken}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
        document.cookie = cookieString;
        console.log("\u2705 Custom cookie set:", cookieString);
        document.cookie = "payload-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        console.log("\u{1F5D1}\uFE0F Default PayloadCMS cookie cleared");
        const verification = document.cookie.split("; ").find((row) => row.startsWith(`${this.cookieName}=`));
        console.log("\u{1F50D} Cookie verification:", verification ? "Success" : "Failed");
      } else {
        console.warn("\u26A0\uFE0F No PayloadCMS token found to copy");
      }
    }
    return result;
  }
  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const payloadToken = this.getPayloadToken();
      const response = await fetch(`${this.apiUrl}/users/me`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cookie": payloadToken ? `payload-token=${payloadToken}` : "",
          ...payloadToken && { "Authorization": `Bearer ${payloadToken}` }
        }
      });
      if (!response.ok) {
        return null;
      }
      const userData = await response.json();
      let extractedUser = null;
      if (userData.user) {
        extractedUser = userData.user;
      } else if (userData.id && userData.email) {
        extractedUser = userData;
      }
      return extractedUser;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }
  /**
   * Logout user
   */
  async logout() {
    try {
      await fetch(`${this.apiUrl}/users/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      this.clearAuthCookies();
    }
  }
  /**
   * Get PayloadCMS token from cookies
   */
  getPayloadToken() {
    if (typeof document === "undefined") return void 0;
    return document.cookie.split("; ").find((row) => row.startsWith(`${this.cookieName}=`))?.split("=")[1];
  }
  /**
   * Clear authentication cookies
   */
  clearAuthCookies() {
    if (typeof document === "undefined") return;
    document.cookie = `${this.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = "payload-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

// src/utils/validation.ts
var AuthValidator = class {
  /**
   * Validate if user has required role
   */
  static validateUserRole(user, allowedRoles) {
    if (!user) {
      return {
        isValid: false,
        expectedRoles: allowedRoles,
        reason: "User not authenticated"
      };
    }
    if (!allowedRoles.includes(user.role)) {
      return {
        isValid: false,
        currentRole: user.role,
        expectedRoles: allowedRoles,
        reason: `User role '${user.role}' not in allowed roles: ${allowedRoles.join(", ")}`
      };
    }
    return {
      isValid: true,
      currentRole: user.role,
      expectedRoles: allowedRoles
    };
  }
  /**
   * Validate if user account is active
   */
  static validateUserActive(user) {
    if (!user) {
      return {
        isValid: false,
        reason: "User not authenticated"
      };
    }
    if (!user.isActive) {
      return {
        isValid: false,
        reason: "User account is deactivated"
      };
    }
    return { isValid: true };
  }
  /**
   * Generate security alert for role change
   */
  static createRoleChangeAlert(currentRole, allowedRoles) {
    return {
      show: true,
      type: "role-changed",
      message: `Your role has been changed from ${allowedRoles.join("/")} to ${currentRole}. You no longer have access to this application.`
    };
  }
  /**
   * Generate security alert for account deactivation
   */
  static createAccountDeactivatedAlert() {
    return {
      show: true,
      type: "account-deactivated",
      message: "Your account has been deactivated by an administrator. Please contact support for assistance."
    };
  }
  /**
   * Generate security alert for session expiration
   */
  static createSessionExpiredAlert() {
    return {
      show: true,
      type: "session-expired",
      message: "Your session has expired. Please log in again to continue."
    };
  }
};
var ValidationUtils = {
  /**
   * Check if user is admin
   */
  isAdmin: (user) => {
    return AuthValidator.validateUserRole(user, ["admin"]).isValid;
  },
  /**
   * Check if user is trainee
   */
  isTrainee: (user) => {
    return AuthValidator.validateUserRole(user, ["trainee"]).isValid;
  },
  /**
   * Check if user is instructor
   */
  isInstructor: (user) => {
    return AuthValidator.validateUserRole(user, ["instructor"]).isValid;
  },
  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole: (user, roles) => {
    return AuthValidator.validateUserRole(user, roles).isValid;
  }
};

// src/middleware/auth-middleware.ts
import { NextResponse } from "next/server";
function createAuthMiddleware(config) {
  return async function authMiddleware(request) {
    const { pathname } = request.nextUrl;
    if (config.publicPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    const payloadToken = request.cookies.get(config.cookieName);
    if (!payloadToken) {
      console.log("\u274C No auth cookie found, redirecting to login");
      return NextResponse.redirect(new URL(config.loginPath, request.url));
    }
    try {
      const response = await fetch(`${config.apiUrl}/users/me`, {
        headers: {
          "Cookie": `${config.cookieName}=${payloadToken.value}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        const userData = await response.json();
        const user = userData.user || userData;
        if (user && !config.allowedRoles.includes(user.role)) {
          console.log("\u{1F6A8} MIDDLEWARE SECURITY: User role not allowed, blocking access");
          console.log("Current role:", user.role);
          console.log("Allowed roles:", config.allowedRoles);
          const response2 = NextResponse.redirect(new URL(config.loginPath, request.url));
          response2.cookies.delete(config.cookieName);
          return response2;
        }
        if (user && !user.isActive) {
          console.log("\u{1F6A8} MIDDLEWARE SECURITY: User account deactivated, blocking access");
          const response2 = NextResponse.redirect(new URL(config.loginPath, request.url));
          response2.cookies.delete(config.cookieName);
          return response2;
        }
        console.log("\u2705 Auth cookie and role validated, allowing access");
        return NextResponse.next();
      } else {
        console.log("\u274C Token validation failed, redirecting to login");
        const response2 = NextResponse.redirect(new URL(config.loginPath, request.url));
        response2.cookies.delete(config.cookieName);
        return response2;
      }
    } catch (error) {
      console.error("\u274C Error validating token:", error);
      console.log("\u26A0\uFE0F Falling back to client-side validation");
      return NextResponse.next();
    }
  };
}
function createAdminAuthMiddleware(apiUrl) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles: ["admin"],
    loginPath: "/admin/login",
    cookieName: "admin-auth-token",
    // Admin-specific cookie
    publicPaths: ["/admin/login"]
  });
}
function createTraineeAuthMiddleware(apiUrl) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles: ["trainee"],
    loginPath: "/login",
    cookieName: "trainee-auth-token",
    // Trainee-specific cookie
    publicPaths: ["/login", "/register", "/signin"]
  });
}
function createInstructorAuthMiddleware(apiUrl) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles: ["instructor"],
    loginPath: "/instructor/login",
    cookieName: "instructor-auth-token",
    // Instructor-specific cookie
    publicPaths: ["/instructor/login"]
  });
}
function createMultiRoleAuthMiddleware(apiUrl, allowedRoles, loginPath, cookieName, publicPaths = []) {
  return createAuthMiddleware({
    apiUrl,
    allowedRoles,
    loginPath,
    cookieName,
    publicPaths: [...publicPaths, loginPath]
  });
}

// src/config/auth-presets.ts
var defaultSecurityConfig = {
  periodicValidation: 3e4,
  // 30 seconds
  showSecurityAlerts: true,
  autoLogoutOnRoleChange: true,
  autoLogoutOnDeactivation: true,
  alertRedirectDelay: 5e3
  // 5 seconds
};
var highSecurityConfig = {
  periodicValidation: 3e4,
  // 30 seconds - frequent validation
  showSecurityAlerts: true,
  autoLogoutOnRoleChange: true,
  autoLogoutOnDeactivation: true,
  alertRedirectDelay: 3e3
  // 3 seconds - faster redirect
};
var standardSecurityConfig = {
  periodicValidation: 6e4,
  // 60 seconds - less frequent validation
  showSecurityAlerts: true,
  autoLogoutOnRoleChange: true,
  autoLogoutOnDeactivation: true,
  alertRedirectDelay: 5e3
  // 5 seconds
};
function createAdminAuthConfig(apiUrl) {
  return {
    apiUrl,
    allowedRoles: ["admin"],
    loginPath: "/admin/login",
    dashboardPath: "/admin/dashboard",
    cookieName: "admin-auth-token",
    // Admin-specific cookie
    securityConfig: highSecurityConfig
  };
}
function createTraineeAuthConfig(apiUrl) {
  return {
    apiUrl,
    allowedRoles: ["trainee"],
    loginPath: "/login",
    dashboardPath: "/dashboard",
    cookieName: "trainee-auth-token",
    // Trainee-specific cookie
    securityConfig: standardSecurityConfig
  };
}
function createInstructorAuthConfig(apiUrl) {
  return {
    apiUrl,
    allowedRoles: ["instructor"],
    loginPath: "/instructor/login",
    dashboardPath: "/instructor/dashboard",
    cookieName: "instructor-auth-token",
    // Instructor-specific cookie
    securityConfig: standardSecurityConfig
  };
}
function createMultiRoleAuthConfig(apiUrl, allowedRoles, loginPath, dashboardPath, cookieName, securityConfig = defaultSecurityConfig) {
  return {
    apiUrl,
    allowedRoles,
    loginPath,
    dashboardPath,
    cookieName,
    securityConfig
  };
}
var DEFAULT_API_URL = "https://grandline-cms.vercel.app/api";
var AuthPresets = {
  admin: createAdminAuthConfig(DEFAULT_API_URL),
  trainee: createTraineeAuthConfig(DEFAULT_API_URL),
  instructor: createInstructorAuthConfig(DEFAULT_API_URL)
};
export {
  AuthPresets,
  AuthValidator,
  DEFAULT_API_URL,
  PayloadCMSAuth,
  ValidationUtils,
  createAdminAuthConfig,
  createAdminAuthMiddleware,
  createAuthMiddleware,
  createInstructorAuthConfig,
  createInstructorAuthMiddleware,
  createMultiRoleAuthConfig,
  createMultiRoleAuthMiddleware,
  createTraineeAuthConfig,
  createTraineeAuthMiddleware,
  defaultSecurityConfig,
  getFullName,
  getUserInitials,
  highSecurityConfig,
  standardSecurityConfig,
  useAuth
};
//# sourceMappingURL=index.mjs.map