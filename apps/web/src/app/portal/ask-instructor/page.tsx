import { redirect } from 'next/navigation';
import { getServerUser } from '@/app/actions/auth';
import { fetchAskInstructorPageData } from './actions';
import AskInstructorPageClient from './AskInstructorPageClient';

type PageProps = {
  searchParams: Promise<{ instructorId?: string }>;
}

export default async function AskInstructorPage({ searchParams }: PageProps) {
  const user = await getServerUser();

  if (!user) {
    redirect('/signin');
  }

  const { instructorId } = await searchParams;
  const data = await fetchAskInstructorPageData();

  return (
    <AskInstructorPageClient
      initialInstructors={data.instructors || []}
      initialQuestions={data.questions || []}
      preselectedInstructorId={instructorId}
    />
  );
}
