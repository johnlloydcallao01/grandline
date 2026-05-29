import { notFound, redirect } from 'next/navigation';
import { getServerUser } from '@/app/actions/auth';
import { fetchAskInstructorThread } from '../actions';
import AskInstructorThreadPageClient from './AskInstructorThreadPageClient';

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AskInstructorThreadPage({ params }: PageProps) {
  const user = await getServerUser();

  if (!user) {
    redirect('/signin');
  }

  const { id } = await params;
  const initialThread = await fetchAskInstructorThread(Number(id));

  if (!initialThread) {
    notFound();
  }

  return <AskInstructorThreadPageClient initialThread={initialThread} />;
}
