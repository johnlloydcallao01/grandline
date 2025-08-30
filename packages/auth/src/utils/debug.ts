/**
 * Enterprise-grade authentication debugging utilities
 * Provides comprehensive logging and state inspection for development
 */

export interface AuthDebugInfo {
  timestamp: string;
  sessionId?: string;
  userId?: string;
  userRole?: string;
  isAuthenticated: boolean;
  cookies: Record<string, string>;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  userAgent: string;
  url: string;
  referrer: string;
}

export class AuthDebugger {
  private static instance: AuthDebugger;
  private logs: Array<{ timestamp: string; level: string; message: string; data?: any }> = [];
  private isEnabled: boolean = false;

  private constructor() {}

  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  enable(enabled: boolean = true) {
    this.isEnabled = enabled;
    if (enabled) {
      console.log('🔍 Auth Debugger enabled');
    }
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    
    this.logs.push(logEntry);
    
    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Console output with appropriate styling
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    }[level];

    const style = {
      info: 'color: #2563eb',
      warn: 'color: #d97706',
      error: 'color: #dc2626',
      debug: 'color: #059669'
    }[level];

    console.log(`%c${emoji} [AUTH] ${message}`, style, data || '');
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data);
  }

  /**
   * Capture comprehensive authentication state
   */
  captureAuthState(): AuthDebugInfo {
    const cookies: Record<string, string> = {};
    const localStorage: Record<string, string> = {};
    const sessionStorage: Record<string, string> = {};

    // Safely capture cookies
    try {
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach(cookie => {
          const [name, value] = cookie.trim().split('=');
          if (name) cookies[name] = value || '';
        });
      }
    } catch (e) {
      this.warn('Failed to capture cookies', e);
    }

    // Safely capture localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            localStorage[key] = window.localStorage.getItem(key) || '';
          }
        }
      }
    } catch (e) {
      this.warn('Failed to capture localStorage', e);
    }

    // Safely capture sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key) {
            sessionStorage[key] = window.sessionStorage.getItem(key) || '';
          }
        }
      }
    } catch (e) {
      this.warn('Failed to capture sessionStorage', e);
    }

    return {
      timestamp: new Date().toISOString(),
      isAuthenticated: !!cookies['payload-token'],
      cookies,
      localStorage,
      sessionStorage,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      referrer: typeof document !== 'undefined' ? document.referrer : 'Unknown',
    };
  }

  /**
   * Generate authentication report for troubleshooting
   */
  generateReport(): string {
    const authState = this.captureAuthState();
    const recentLogs = this.logs.slice(-20); // Last 20 logs

    const report = `
=== AUTHENTICATION DEBUG REPORT ===
Generated: ${new Date().toISOString()}

=== CURRENT STATE ===
Authenticated: ${authState.isAuthenticated}
URL: ${authState.url}
User Agent: ${authState.userAgent}

=== COOKIES ===
${Object.entries(authState.cookies)
  .map(([key, value]) => `${key}: ${key.includes('token') ? '[REDACTED]' : value}`)
  .join('\n')}

=== LOCAL STORAGE ===
${Object.entries(authState.localStorage)
  .map(([key, value]) => `${key}: ${key.includes('token') || key.includes('auth') ? '[REDACTED]' : value}`)
  .join('\n')}

=== RECENT LOGS ===
${recentLogs
  .map(log => `[${log.timestamp}] ${log.level.toUpperCase()}: ${log.message}`)
  .join('\n')}

=== END REPORT ===
    `.trim();

    return report;
  }

  /**
   * Export logs for external analysis
   */
  exportLogs(): Array<{ timestamp: string; level: string; message: string; data?: any }> {
    return [...this.logs];
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.info('Debug logs cleared');
  }

  /**
   * Download debug report as file
   */
  downloadReport() {
    if (typeof window === 'undefined') return;

    const report = this.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-debug-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.info('Debug report downloaded');
  }
}

// Global instance
export const authDebugger = AuthDebugger.getInstance();

// Development helper functions
export const enableAuthDebug = () => authDebugger.enable(true);
export const disableAuthDebug = () => authDebugger.enable(false);
export const getAuthReport = () => authDebugger.generateReport();
export const downloadAuthReport = () => authDebugger.downloadReport();

// Make available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDebug = {
    enable: enableAuthDebug,
    disable: disableAuthDebug,
    report: getAuthReport,
    download: downloadAuthReport,
    debugger: authDebugger,
  };
}
