import React, { Suspense } from 'react';
import { getMaterialDetails } from '../actions';
import { notFound } from 'next/navigation';
import MaterialViewerClient from './MaterialViewerClient';

export const metadata = {
  title: 'View Material | Grandline Maritime',
  description: 'View training material details and files.',
};

export default async function ViewMaterialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type } = await searchParams;

  const isLessonMaterial = type === 'lesson';
  const data = await getMaterialDetails(id, isLessonMaterial);

  if (!data || !data.material) {
    notFound();
  }

  return (
    <Suspense fallback={<MaterialViewerSkeleton />}>
      <MaterialViewerClient data={data} isLessonMaterial={isLessonMaterial} />
    </Suspense>
  );
}

function MaterialViewerSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse flex items-center space-x-2 mb-4">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse h-[600px] bg-gray-200 rounded-xl w-full"></div>
      </div>
    </div>
  );
}