import React, { Suspense } from 'react';
import { getEnrolledMaterials } from './actions';
import TrainingMaterialsClient from './TrainingMaterialsClient';
import { cookies } from 'next/headers';

export const metadata = {
  title: 'Training Materials | Grandline Maritime',
  description: 'Access course supplements, reference guides, and study materials.',
};

export default async function TrainingMaterialsPage() {
  // Extract token directly from cookies just like we do in certificates actions
  const cookieStore = await cookies();
  const token = cookieStore.get('grandline-web-token')?.value;

  const materials = await getEnrolledMaterials(token);

  console.log("Fetched materials for UI:", materials?.length);

  return (
    <Suspense fallback={<MaterialsSkeleton />}>
      <TrainingMaterialsClient initialMaterials={materials || []} />
    </Suspense>
  );
}

function MaterialsSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="flex space-x-8 overflow-x-auto pb-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 w-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        <div className="mb-8 max-w-lg animate-pulse">
          <div className="h-12 bg-gray-200 rounded-md w-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col animate-pulse">
              <div className="h-32 bg-gray-200 rounded-t-xl"></div>
              <div className="p-5 flex-1 flex flex-col space-y-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-auto pt-4 flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
