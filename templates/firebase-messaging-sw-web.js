/**
 * Firebase Cloud Messaging Service Worker Template for Web App
 * 
 * This is a template for the marketing website's FCM service worker.
 * Currently, FCM is not enabled for the web app, but this template
 * can be used when FCM features are needed in the future.
 */

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// ========================================
// FIREBASE CONFIGURATION
// ========================================

// Firebase configuration will be injected by the build process
// or loaded from environment variables
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// ========================================
// NOTIFICATION SETTINGS
// ========================================

const NOTIFICATION_SETTINGS = {
  // Default notification options
  DEFAULT_ICON: '/icons/notification-icon.png',
  DEFAULT_BADGE: '/icons/notification-badge.png',
  
  // Marketing-specific settings
  NEWSLETTER_ICON: '/icons/newsletter-icon.png',
  CAMPAIGN_ICON: '/icons/campaign-icon.png',
  
  // Notification actions for marketing site
  MARKETING_ACTIONS: [
    {
      action: 'view',
      title: 'View',
      icon: '/icons/view-action.png'
    },
    {
      action: 'learn-more',
      title: 'Learn More',
      icon: '/icons/learn-more-action.png'
    },
    {
      action: 'dismiss',
      title: 'Dismiss',
      icon: '/icons/dismiss-action.png'
    }
  ],
  
  // Type-based settings
  TYPE_SETTINGS: {
    newsletter: {
      icon: '/icons/newsletter-icon.png',
      actions: [
        { action: 'read', title: 'Read Newsletter', icon: '/icons/read.png' },
        { action: 'unsubscribe', title: 'Unsubscribe', icon: '/icons/unsubscribe.png' }
      ]
    },
    campaign: {
      icon: '/icons/campaign-icon.png',
      actions: [
        { action: 'view-offer', title: 'View Offer', icon: '/icons/offer.png' },
        { action: 'learn-more', title: 'Learn More', icon: '/icons/info.png' }
      ]
    },
    announcement: {
      icon: '/icons/announcement-icon.png',
      actions: [
        { action: 'view', title: 'View Details', icon: '/icons/view.png' }
      ]
    }
  }
};

// ========================================
// BACKGROUND MESSAGE HANDLER
// ========================================

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  try {
    // Extract notification data
    const notificationTitle = payload.notification?.title || 'Encreasl Notification';
    const notificationOptions = createNotificationOptions(payload);

    // Show notification
    self.registration.showNotification(notificationTitle, notificationOptions);

    // Track notification analytics
    trackNotificationAnalytics('received', payload);

  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling background message:', error);
  }
});

// ========================================
// NOTIFICATION CLICK HANDLER
// ========================================

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);

  // Close the notification
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  // Track click analytics
  trackNotificationAnalytics('clicked', { action, data });

  // Handle different actions
  event.waitUntil(
    handleNotificationAction(action, data)
  );
});

// ========================================
// NOTIFICATION CLOSE HANDLER
// ========================================

self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);

  const data = event.notification.data || {};
  
  // Track dismissal analytics
  trackNotificationAnalytics('dismissed', { data });
});

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Create notification options based on payload and type
 */
function createNotificationOptions(payload) {
  const notification = payload.notification || {};
  const data = payload.data || {};
  const type = data.type || 'general';

  // Get type-specific settings
  const typeSettings = NOTIFICATION_SETTINGS.TYPE_SETTINGS[type] || {};

  // Base notification options
  const options = {
    body: notification.body || '',
    icon: typeSettings.icon || notification.icon || NOTIFICATION_SETTINGS.DEFAULT_ICON,
    badge: NOTIFICATION_SETTINGS.DEFAULT_BADGE,
    image: notification.image,
    data: {
      ...data,
      timestamp: Date.now(),
      type
    },
    tag: type,
    actions: typeSettings.actions || NOTIFICATION_SETTINGS.MARKETING_ACTIONS.slice(0, 2),
    requireInteraction: false,
    silent: false
  };

  return options;
}

/**
 * Handle notification action clicks
 */
async function handleNotificationAction(action, data) {
  const baseUrl = self.location.origin;
  
  try {
    switch (action) {
      case 'view':
      case '': // Default click (no action)
        await openOrFocusWindow(`${baseUrl}/${data.path || ''}`);
        break;
        
      case 'read':
        await openOrFocusWindow(`${baseUrl}/newsletter/${data.newsletterId || ''}`);
        break;
        
      case 'view-offer':
        await openOrFocusWindow(`${baseUrl}/offers/${data.offerId || ''}`);
        break;
        
      case 'learn-more':
        await openOrFocusWindow(`${baseUrl}/learn-more/${data.campaignId || ''}`);
        break;
        
      case 'unsubscribe':
        await openOrFocusWindow(`${baseUrl}/unsubscribe?token=${data.unsubscribeToken || ''}`);
        break;
        
      case 'dismiss':
        // Just track the dismissal, no window opening needed
        console.log('Notification dismissed via action');
        break;
        
      default:
        // Default action - open homepage
        await openOrFocusWindow(baseUrl);
    }
  } catch (error) {
    console.error('Error handling notification action:', error);
    // Fallback to opening homepage
    await openOrFocusWindow(baseUrl);
  }
}

/**
 * Open or focus existing window
 */
async function openOrFocusWindow(url) {
  try {
    // Try to find existing window with the same URL
    const windowClients = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Check if we already have this URL open
    for (const client of windowClients) {
      if (client.url === url && 'focus' in client) {
        return client.focus();
      }
    }

    // Check if we have any window open from the same origin
    for (const client of windowClients) {
      if (client.url.startsWith(self.location.origin) && 'navigate' in client) {
        client.navigate(url);
        return client.focus();
      }
    }

    // Open new window
    return clients.openWindow(url);
  } catch (error) {
    console.error('Error opening/focusing window:', error);
    return clients.openWindow(url);
  }
}

/**
 * Track notification analytics
 */
function trackNotificationAnalytics(action, payload) {
  try {
    // Send analytics to your backend
    const analyticsData = {
      action,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      payload: payload
    };

    // You can send this to your analytics endpoint
    // fetch('/api/analytics/notifications', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(analyticsData)
    // }).catch(console.error);

    console.log('[Analytics] Notification event:', analyticsData);
  } catch (error) {
    console.error('Error tracking notification analytics:', error);
  }
}

// ========================================
// SERVICE WORKER LIFECYCLE
// ========================================

self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service worker activating...');
  event.waitUntil(clients.claim());
});

// ========================================
// ERROR HANDLING
// ========================================

self.addEventListener('error', (event) => {
  console.error('[firebase-messaging-sw.js] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[firebase-messaging-sw.js] Unhandled promise rejection:', event.reason);
});
