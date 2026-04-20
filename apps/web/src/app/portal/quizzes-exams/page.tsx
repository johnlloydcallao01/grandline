import React from 'react';
import { Metadata } from 'next';
import { getTraineeAssessments } from './actions';
import QuizzesExamsClient from './QuizzesExamsClient';

export const metadata: Metadata = {
  title: 'My Quizzes & Exams | Grandline',
  description: 'Track and manage your course assessments.',
};

export default async function QuizzesExamsPage() {
  const assessments = await getTraineeAssessments();

  return <QuizzesExamsClient initialAssessments={assessments} />;
}
