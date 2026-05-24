import CoursesPageClient from './CoursesPageClient';
import { fetchPortalCourses } from './actions';

const CATEGORIES = ['All', 'Active', 'Passed', 'Failed', 'Pending', 'Suspended', 'Dropped', 'Expired'];

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const initialCategory = CATEGORIES.includes(tab || '') ? (tab as string) : 'All';
  const enrollments = await fetchPortalCourses();

  return (
    <CoursesPageClient
      initialCategory={initialCategory}
      initialEnrollments={enrollments}
    />
  );
}
