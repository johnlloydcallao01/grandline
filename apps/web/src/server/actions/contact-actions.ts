/**
 * @file apps/web/src/server/actions/contact-actions.ts
 * @description Server actions for handling contact form submissions
 */

'use server';

import 'server-only';
// import { sendToTopic } from '@encreasl/fcm/server';
import type { ServerActionResult } from '../types/server-types';
import { LeadQualificationService } from '../services/lead-qualification-service';
import {
  ContactFormSchema,
  ContactFormStorageSchema,
  type ContactFormData
} from '../validators/contact-schemas';
import {
  withContactFormDefaults,
  withValidationResult,
  withOptionalAuth,
  getAuthContext,
  type AuthContext
} from '../middleware';

// ========================================
// TYPES
// ========================================

export type ContactFormSubmission = {
  id: string;
  data: ContactFormData;
  submittedAt: string;
  ipAddress?: string;
  userAgent?: string;
  leadScore?: any;
};

// ========================================
// SERVER ACTIONS
// ========================================

/**
 * Submit contact form data with middleware pipeline
 */
const _submitContactForm = async (
  validatedData: ContactFormData,
  authContext: AuthContext
): Promise<ServerActionResult<ContactFormSubmission>> => {
  // Create submission record with auth context
  const submission: ContactFormSubmission = {
    id: globalThis.crypto.randomUUID(),
    data: validatedData,
    submittedAt: new Date().toISOString(),
    ipAddress: authContext.ipAddress,
    userAgent: authContext.userAgent,
  };

  // Qualify the lead using web-specific business logic
  const leadScore = await LeadQualificationService.qualifyLead(validatedData);
  submission.leadScore = leadScore;

  // Save to Firestore (this will trigger Firebase Function for email sending)
  // In a real implementation, you would save to your database here
  // The Firebase Function will automatically handle email notifications
  console.log('Contact form submission:', submission);
  console.log('Lead qualification:', leadScore);

  // Send FCM notification to admin (commented out - FCM package not available)
  // await sendToTopic('contact_submissions', {
  //   title: 'New Contact Form Submission',
  //   body: `${submission.data.name} submitted a contact form`,
  //   data: {
  //     type: 'contact_form',
  //     submissionId: submission.id,
  //     name: submission.data.name,
  //     email: submission.data.email,
  //   },
  // });

  return {
    success: true,
    data: submission,
    message: 'Contact form submitted successfully',
  };
};

/**
 * Public contact form submission action with validation
 */
export const submitContactForm = withValidationResult(ContactFormSchema)(
  async (validatedData: any): Promise<ServerActionResult<ContactFormSubmission>> => {
    // Get auth context
    const authContext = await getAuthContext();

    // Type assertion to ensure the validated data matches our expected type
    const typedData = validatedData as ContactFormData;

    // Call the internal function
    return _submitContactForm(typedData, authContext);
  }
);

// ========================================
// ADDITIONAL ACTIONS
// ========================================

/**
 * Get contact form submission by ID (admin only)
 */
const _getContactSubmission = async (
  submissionId: string,
  authContext: AuthContext
): Promise<ServerActionResult<ContactFormSubmission | null>> => {
  // In a real implementation, fetch from database
  console.log('Fetching contact submission:', submissionId);

  return {
    success: true,
    data: null, // Placeholder
    message: 'Contact submission retrieved',
  };
};

export const getContactSubmission = async (
  submissionId: string
): Promise<ServerActionResult<ContactFormSubmission | null>> => {
  const authContext = await getAuthContext();
  return _getContactSubmission(submissionId, authContext);
};

/**
 * List contact form submissions with pagination (admin only)
 */
const _listContactSubmissions = async (
  filters: { page?: number; limit?: number; status?: string } | undefined,
  authContext: AuthContext
): Promise<ServerActionResult<{ submissions: ContactFormSubmission[]; total: number }>> => {
  // In a real implementation, fetch from database with pagination
  console.log('Listing contact submissions with filters:', filters);

  return {
    success: true,
    data: {
      submissions: [],
      total: 0,
    },
    message: 'Contact submissions retrieved',
  };
};

export const listContactSubmissions = async (
  filters?: { page?: number; limit?: number; status?: string }
): Promise<ServerActionResult<{ submissions: ContactFormSubmission[]; total: number }>> => {
  const authContext = await getAuthContext();
  return _listContactSubmissions(filters, authContext);
};
