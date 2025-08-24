/**
 * Firebase Cloud Messaging Service
 *
 * Comprehensive FCM service for sending notifications, managing tokens,
 * and handling topics with advanced features.
 */
import { FCMMessage, NotificationPreferences, NotificationType, NotificationPriority, NotificationResponse, TemplateVariables } from "../types/notifications";
export declare class FCMService {
    private messaging;
    private db;
    /**
     * Send notification to a single device token
     */
    sendToToken(token: string, notification: FCMMessage, priority?: NotificationPriority): Promise<NotificationResponse>;
    /**
     * Send notification to multiple device tokens
     */
    sendToTokens(tokens: string[], notification: FCMMessage, priority?: NotificationPriority): Promise<NotificationResponse>;
    /**
     * Send notification to a topic
     */
    sendToTopic(topic: string, notification: FCMMessage, priority?: NotificationPriority): Promise<NotificationResponse>;
    /**
     * Send notification using condition (complex topic logic)
     */
    sendToCondition(condition: string, notification: FCMMessage, priority?: NotificationPriority): Promise<NotificationResponse>;
    /**
     * Send notification using a template
     */
    sendFromTemplate(templateId: string, recipients: {
        tokens?: string[];
        topics?: string[];
        condition?: string;
    }, variables?: TemplateVariables, priority?: NotificationPriority): Promise<NotificationResponse>;
    /**
     * Process template with variables
     */
    private processTemplate;
    /**
     * Validate FCM token
     */
    validateToken(token: string): Promise<boolean>;
    /**
     * Get notification template
     */
    private getTemplate;
    /**
     * Get user notification preferences
     */
    getUserPreferences(userId: string): Promise<NotificationPreferences | null>;
    /**
     * Update user FCM token
     */
    updateUserToken(userId: string, token: string, platform: "web" | "android" | "ios"): Promise<void>;
    /**
     * Subscribe tokens to a topic
     */
    subscribeToTopic(tokens: string[], topic: string): Promise<NotificationResponse>;
    /**
     * Unsubscribe tokens from a topic
     */
    unsubscribeFromTopic(tokens: string[], topic: string): Promise<NotificationResponse>;
    /**
     * Register a new FCM device
     */
    registerDevice(userId: string, token: string, deviceInfo: any): Promise<{
        success: boolean;
        deviceId?: string;
        error?: string;
    }>;
    /**
     * Unregister an FCM device
     */
    unregisterDevice(userId: string, token: string): Promise<NotificationResponse>;
    /**
     * Send notification to multiple tokens (alias for sendToTokens for compatibility)
     */
    sendToMultipleTokens(tokens: string[], notification: FCMMessage, priority?: NotificationPriority): Promise<NotificationResponse>;
    /**
     * Log notification with enhanced context
     */
    logNotification(logData: {
        type: NotificationType;
        title: string;
        body: string;
        recipients: string[];
        metadata?: any;
        priority: NotificationPriority;
        context?: {
            source?: string;
            triggeredBy?: string;
            environment?: string;
        };
    }): Promise<void>;
}
//# sourceMappingURL=fcm-service.d.ts.map