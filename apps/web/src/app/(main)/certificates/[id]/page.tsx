import React from 'react';
import { getCertificateById } from '../actions';
import { CertificateDetailsView } from '@/components/certificates/CertificateDetailsView';
import Link from 'next/link';

export default async function CertificateViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    return <ErrorState message="Invalid certificate ID" />;
  }

  // Fetch certificate server-side.
  const certificate = await getCertificateById(id);

  if (!certificate) {
    return <ErrorState message="Certificate not found or you do not have permission to view it." />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <CertificateDetailsView 
        certificate={certificate} 
        backHref="/certificates" 
      />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <Link 
          href="/certificates"
          className="block w-full bg-gray-900 text-white font-medium py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          Back to Certificates
        </Link>
      </div>
    </div>
  );
}
