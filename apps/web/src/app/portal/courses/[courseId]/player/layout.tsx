import React from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/app/actions/auth';
import CoursePlayerLayoutClient from './CoursePlayerLayoutClient';

interface CoursePlayerLayoutProps {
  children: React.ReactNode;
  params: Promise<{ courseId: string }>;
}

export default async function CoursePlayerLayout({ children, params }: CoursePlayerLayoutProps) {
  const user = await getServerUser();

  if (!user) {
    redirect('/signin');
  }

  await params;

  return (
    <CoursePlayerLayoutClient>
      {children}
    </CoursePlayerLayoutClient>
  );
}
