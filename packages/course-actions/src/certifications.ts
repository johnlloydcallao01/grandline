/**
 * @encreasl/course-actions - Shared certification issuance & verification service
 *
 * One factory used by both web-admin and web-instructor. Each app configures
 * the factory with its own API key, CMS URL, and scope, then wraps the returned
 * methods with its own auth/identity resolution.
 *
 * Issuance methods call dedicated CMS endpoints that own the eligibility query
 * and normalization (see docs/fetching-solution.md). The admin scope uses
 * /lms/enrollments/eligible and the instructor scope uses
 * /lms/enrollments/instructor/eligible (scoped to the instructor's courses).
 * Verification is a stateless public operation served by the
 * /lms/certificate-verification endpoint; it ignores the configured scope.
 */

import {
  CmsApiError,
  cmsFetch,
  type CertificateVerificationResult,
  type EligibleEnrollment,
  type EligibleEnrollmentFilters,
  type EligibleEnrollmentListResult,
} from '@encreasl/cms-types';

export type CertificationScope = 'admin' | 'instructor';

export interface CertificationServiceConfig {
  apiKey: string;
  cmsUrl: string;
  scope: CertificationScope;
}

export interface CertificationService {
  getEligibleEnrollments(
    filters?: EligibleEnrollmentFilters,
    userId?: string,
  ): Promise<EligibleEnrollment[]>;
  verifyCertificate(code: string): Promise<CertificateVerificationResult>;
}

export function createCertificationService(
  config: CertificationServiceConfig,
): CertificationService {
  const { apiKey, cmsUrl, scope } = config;

  return {
    async getEligibleEnrollments(
      filters: EligibleEnrollmentFilters = {},
      userId?: string,
    ): Promise<EligibleEnrollment[]> {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.limit) params.limit = String(filters.limit);

      const path =
        scope === 'admin'
          ? '/lms/enrollments/eligible'
          : '/lms/enrollments/instructor/eligible';

      if (scope === 'instructor') {
        if (!userId) throw new Error('userId is required for the instructor scope');
        params.userId = userId;
      }

      const data = await cmsFetch<EligibleEnrollmentListResult>(
        apiKey,
        cmsUrl,
        path,
        { params, cache: 'no-store' },
      );
      return data.docs || [];
    },

    async verifyCertificate(code: string): Promise<CertificateVerificationResult> {
      const trimmed = (code || '').trim();
      if (!trimmed) {
        return { verified: false, error: 'Certificate code is required' };
      }

      try {
        return await cmsFetch<CertificateVerificationResult>(
          apiKey,
          cmsUrl,
          '/lms/certificate-verification',
          { params: { code: trimmed }, cache: 'no-store' },
        );
      } catch (error) {
        if (error instanceof CmsApiError && error.status === 404) {
          return {
            verified: false,
            error: error.errors?.[0]?.message || 'Certificate not found',
          };
        }
        console.error('Certificate verification error:', error);
        return {
          verified: false,
          error: 'Unable to verify certificate. Please try again.',
        };
      }
    },
  };
}