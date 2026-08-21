'use server';

import { createCertificationService } from '@encreasl/course-actions';
import type { EligibleEnrollment, EligibleEnrollmentFilters } from '@encreasl/cms-types';

const CMS_API = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.PAYLOAD_API_KEY;

const certificationService = createCertificationService({
  apiKey: API_KEY || '',
  cmsUrl: CMS_API || '',
  scope: 'admin',
});

export async function getEligibleEnrollments(
  filters: EligibleEnrollmentFilters = {},
): Promise<EligibleEnrollment[]> {
  if (!CMS_API || !API_KEY) {
    throw new Error('Missing API configuration');
  }
  return certificationService.getEligibleEnrollments(filters);
}