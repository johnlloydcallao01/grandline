/**
 * @encreasl/course-actions - Shared course CRUD and utilities
 *
 * Provides shared server-action-level helpers used by both web-admin and
 * web-instructor. Each app configures the factories with its own API key, CMS
 * URL, and scope, then wraps the returned methods with its own auth/ownership
 * handling (see docs/fetching-solution.md).
 */

export * from './courses';
export * from './enrollments';
export * from './lessons';
export * from './assessments';
export * from './questions';
export * from './tags';
export * from './categories';
export * from './assignments';
export * from './assessment-submissions';
export * from './assignment-submissions';
export * from './feedback-submissions';