import React from 'react';
import { Metadata } from 'next';
import { getTraineeAssignments } from './actions';
import AssignmentsClient from './AssignmentsClient';

export const metadata: Metadata = {
  title: 'My Assignments | Grandline',
  description: 'Track and manage your course tasks and projects.',
};

export default async function AssignmentsPage() {
  const assignments = await getTraineeAssignments();

  return <AssignmentsClient initialAssignments={assignments} />;
}
