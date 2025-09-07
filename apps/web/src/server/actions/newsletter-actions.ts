/**
 * @file apps/web/src/server/actions/newsletter-actions.ts
 * @description Server actions for newsletter subscription management
 */

'use server';

import 'server-only';
import { z } from 'zod';
// import { sendToTopic } from '@encreasl/fcm/server';
import type { ServerActionResult } from '../types/server-types';
import {
  NewsletterSubscriptionSchema,
  NewsletterUnsubscribeSchema,
  type NewsletterSubscriptionData,
  type NewsletterUnsubscribeData
} from '../validators/newsletter-schemas';
import {
  withNewsletterDefaults,
  withValidationResult
} from '../middleware';
import { checkRateLimit } from '../utils/rate-limit';
import { validateServerRequest, handleServerError } from '../utils/server-utils';

export type NewsletterSubscription = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  preferences?: string[];
  source: string;
  gdprConsent: boolean;
  doubleOptIn: boolean;
  subscribedAt: string;
  status: 'pending' | 'confirmed' | 'unsubscribed';
  confirmationToken?: string;
};

// ========================================
// SERVER ACTIONS
// ========================================

/**
 * Subscribe to newsletter
 */
export async function subscribeToNewsletter(
  subscriptionData: NewsletterSubscriptionData
): Promise<ServerActionResult<NewsletterSubscription>> {
  try {
    // Rate limiting check
    const rateLimitResult = await checkRateLimit('newsletter-subscription', {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 5, // Max 5 subscriptions per 5 minutes
    });

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many subscription attempts. Please try again later.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Validate subscription data
    const validationResult = validateNewsletterEmail(subscriptionData);
    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid subscription data',
          details: { errors: validationResult.errors },
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Get request context
    await validateServerRequest();

    // Create subscription record
    const validatedData = validationResult.data!; // Safe after success check
    const subscription: NewsletterSubscription = {
      id: globalThis.crypto.randomUUID(),
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      preferences: validatedData.preferences,
      source: validatedData.source,
      gdprConsent: validatedData.gdprConsent,
      doubleOptIn: validatedData.doubleOptIn,
      subscribedAt: new Date().toISOString(),
      status: 'pending',
      confirmationToken: globalThis.crypto.randomUUID(),
    };

    // Save to Firestore (this will trigger Firebase Function for confirmation email)
    // In a real implementation, you would save to your database here
    // The Firebase Function will automatically handle email sending
    console.log('Newsletter subscription:', subscription);

    // Send FCM notification to admin (commented out - FCM package not available)
    // await sendToTopic('newsletter_subscriptions', {
    //   title: 'New Newsletter Subscription',
    //   body: `${subscription.email} subscribed to the newsletter`,
    //   data: {
    //     type: 'newsletter_subscription',
    //     subscriptionId: subscription.id,
    //     email: subscription.email,
    //   },
    // });

    return {
      success: true,
      data: subscription,
      message: 'Please check your email to confirm your subscription',
    };

  } catch (error) {
    return handleServerError(error, 'NEWSLETTER_SUBSCRIPTION_ERROR');
  }
}

/**
 * Unsubscribe from newsletter
 */
export async function unsubscribeFromNewsletter(
  email: string
): Promise<ServerActionResult<{ email: string; unsubscribedAt: string }>> {
  try {
    // Validate email
    const emailSchema = z.string().email();
    const validatedEmail = emailSchema.parse(email);

    // Get request context
    await validateServerRequest();
    
    // Create unsubscription record
    const unsubscription = {
      email: validatedEmail,
      unsubscribedAt: new Date().toISOString(),
    };

    // Here you would typically update your database
    // For now, we'll just log the unsubscription
    console.log('Newsletter unsubscription:', unsubscription);

    // Send FCM notification to admin (commented out - FCM package not available)
    // await sendToTopic('newsletter_unsubscriptions', {
    //   title: 'Newsletter Unsubscription',
    //   body: `${validatedEmail} unsubscribed from the newsletter`,
    //   data: {
    //     type: 'newsletter_unsubscription',
    //     email: validatedEmail,
    //   },
    // });

    return {
      success: true,
      data: unsubscription,
      message: 'You have been successfully unsubscribed',
    };

  } catch (error) {
    return handleServerError(error, 'NEWSLETTER_UNSUBSCRIPTION_ERROR');
  }
}

/**
 * Validate newsletter subscription data
 */
export function validateNewsletterEmail(data: unknown): {
  success: boolean;
  data?: NewsletterSubscriptionData;
  errors?: Array<{ field: string; message: string; code: string }>;
} {
  try {
    const validatedData = NewsletterSubscriptionSchema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }));
      
      return {
        success: false,
        errors,
      };
    }
    
    return {
      success: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'UNKNOWN_ERROR',
      }],
    };
  }
}
