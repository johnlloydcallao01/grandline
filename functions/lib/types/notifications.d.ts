/**
 * Type definitions for Firebase Cloud Messaging and notifications
 */
import { Timestamp } from "firebase-admin/firestore";
export interface FCMNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    sound?: string;
    tag?: string;
    color?: string;
    clickAction?: string;
    bodyLocKey?: string;
    bodyLocArgs?: string[];
    titleLocKey?: string;
    titleLocArgs?: string[];
}
export interface FCMDataPayload {
    [key: string]: string;
}
export interface FCMMessage {
    notification?: FCMNotificationPayload;
    data?: FCMDataPayload;
    token?: string;
    topic?: string;
    condition?: string;
    android?: {
        priority?: "normal" | "high";
        ttl?: number;
        notification?: {
            icon?: string;
            color?: string;
            sound?: string;
            tag?: string;
            clickAction?: string;
            bodyLocKey?: string;
            bodyLocArgs?: string[];
            titleLocKey?: string;
            titleLocArgs?: string[];
            channelId?: string;
            ticker?: string;
            sticky?: boolean;
            eventTime?: string;
            localOnly?: boolean;
            notificationPriority?: "PRIORITY_UNSPECIFIED" | "PRIORITY_MIN" | "PRIORITY_LOW" | "PRIORITY_DEFAULT" | "PRIORITY_HIGH" | "PRIORITY_MAX";
            vibrate?: string[];
            defaultVibrateTimings?: boolean;
            defaultSound?: boolean;
            lightSettings?: {
                color: {
                    red: number;
                    green: number;
                    blue: number;
                    alpha: number;
                };
                lightOnDuration: string;
                lightOffDuration: string;
            };
            defaultLightSettings?: boolean;
        };
    };
    webpush?: {
        headers?: {
            [key: string]: string;
        };
        data?: {
            [key: string]: string;
        };
        notification?: {
            title?: string;
            body?: string;
            icon?: string;
            badge?: string;
            image?: string;
            lang?: string;
            tag?: string;
            dir?: "auto" | "ltr" | "rtl";
            renotify?: boolean;
            requireInteraction?: boolean;
            silent?: boolean;
            timestamp?: number;
            vibrate?: number[];
            actions?: Array<{
                action: string;
                title: string;
                icon?: string;
            }>;
        };
        fcmOptions?: {
            link?: string;
            analyticsLabel?: string;
        };
    };
    apns?: {
        headers?: {
            [key: string]: string;
        };
        payload?: {
            aps?: {
                alert?: {
                    title?: string;
                    subtitle?: string;
                    body?: string;
                    locKey?: string;
                    locArgs?: string[];
                    titleLocKey?: string;
                    titleLocArgs?: string[];
                    subtitleLocKey?: string;
                    subtitleLocArgs?: string[];
                    actionLocKey?: string;
                    launchImage?: string;
                };
                badge?: number;
                sound?: string | {
                    critical?: boolean;
                    name?: string;
                    volume?: number;
                };
                contentAvailable?: boolean;
                mutableContent?: boolean;
                category?: string;
                threadId?: string;
                targetContentId?: string;
                interruptionLevel?: "passive" | "active" | "timeSensitive" | "critical";
                relevanceScore?: number;
                filterCriteria?: string;
                staleDate?: number;
                contentState?: {
                    [key: string]: any;
                };
                timestamp?: number;
                event?: "update" | "end";
                dismissalDate?: number;
                attributesType?: "timer";
                attributes?: {
                    start?: number;
                    stale?: number;
                    end?: number;
                };
            };
            [key: string]: any;
        };
        fcmOptions?: {
            analyticsLabel?: string;
            image?: string;
        };
    };
    fcmOptions?: {
        analyticsLabel?: string;
    };
}
export type NotificationType = "contact_form" | "newsletter_signup" | "user_welcome" | "user_goodbye" | "campaign_started" | "campaign_completed" | "daily_digest" | "weekly_report" | "system_alert" | "custom";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationStatus = "pending" | "sent" | "delivered" | "failed" | "cancelled";
export interface NotificationTemplate {
    id: string;
    type: NotificationType;
    name: string;
    title: string;
    body: string;
    icon?: string;
    image?: string;
    clickAction?: string;
    data?: FCMDataPayload;
    isActive: boolean;
    variables: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface NotificationPreferences {
    userId: string;
    email: string;
    fcmTokens: string[];
    topics: string[];
    preferences: {
        contactForm: boolean;
        newsletter: boolean;
        userUpdates: boolean;
        campaigns: boolean;
        dailyDigest: boolean;
        weeklyReport: boolean;
        systemAlerts: boolean;
        marketing: boolean;
    };
    timezone?: string;
    language?: string;
    quietHours?: {
        enabled: boolean;
        start: string;
        end: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface NotificationLog {
    id?: string;
    type: NotificationType;
    title: string;
    body: string;
    recipients: {
        tokens?: string[];
        topics?: string[];
        condition?: string;
        userIds?: string[];
    };
    payload: FCMMessage;
    status: NotificationStatus;
    priority: NotificationPriority;
    scheduledAt?: Timestamp;
    sentAt?: Timestamp;
    deliveredAt?: Timestamp;
    failedAt?: Timestamp;
    error?: string;
    analytics: {
        sent: number;
        delivered: number;
        failed: number;
        clicked: number;
        dismissed: number;
    };
    metadata?: {
        campaignId?: string;
        templateId?: string;
        triggeredBy?: string;
        source?: string;
        [key: string]: any;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface FCMTopic {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    subscriberCount: number;
    tags: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface TopicSubscription {
    userId: string;
    email: string;
    topicId: string;
    topicName: string;
    subscribedAt: Timestamp;
    unsubscribedAt?: Timestamp;
    isActive: boolean;
}
export interface FCMDevice {
    id?: string;
    userId: string;
    token: string;
    platform: "web" | "android" | "ios";
    browser?: string;
    os?: string;
    device?: string;
    appVersion?: string;
    isActive: boolean;
    lastSeen: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
export interface NotificationAnalytics {
    date: string;
    type: NotificationType;
    metrics: {
        sent: number;
        delivered: number;
        failed: number;
        clicked: number;
        dismissed: number;
        deliveryRate: number;
        clickRate: number;
        dismissalRate: number;
    };
    platforms: {
        web: number;
        android: number;
        ios: number;
    };
    topics: {
        [topicName: string]: number;
    };
}
export interface TemplateVariables {
    [key: string]: string | number | boolean;
}
export interface NotificationContext {
    userId?: string;
    email?: string;
    name?: string;
    company?: string;
    metadata?: {
        [key: string]: any;
    };
}
export interface BulkNotificationRequest {
    templateId: string;
    recipients: Array<{
        token?: string;
        userId?: string;
        email?: string;
        variables?: TemplateVariables;
    }>;
    scheduledAt?: Timestamp;
    priority?: NotificationPriority;
    metadata?: {
        [key: string]: any;
    };
}
export interface NotificationResponse {
    success: boolean;
    messageId?: string;
    error?: string;
    failureCount?: number;
    successCount?: number;
    responses?: Array<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
}
//# sourceMappingURL=notifications.d.ts.map