import React from 'react';
import Link from 'next/link';

export interface CertificateDetailsData {
  id: number | string;
  certificateCode: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  course?: {
    id: number | string;
    title: string;
    courseCode?: string;
  };
  file?: {
    id: number | string;
    url: string;
    filename: string;
    filesize: number;
    cloudinaryURL?: string;
  };
  metadata?: any;
}

interface CertificateDetailsViewProps {
  certificate: CertificateDetailsData;
  onBack?: () => void;
  backHref?: string;
}

export function CertificateDetailsView({ certificate, onBack, backHref }: CertificateDetailsViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'valid':
        return <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium text-sm border border-green-200">Active / Valid</span>;
      case 'expired':
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium text-sm border border-red-200">Expired</span>;
      case 'revoked':
        return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 font-medium text-sm border border-gray-200">Revoked</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium text-sm border border-blue-200 capitalize">{status}</span>;
    }
  };

  const downloadUrl = certificate.file?.cloudinaryURL || (certificate.file?.url
    ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3001'}${certificate.file.url}`
    : null);

  let previewImageUrl: string | null = null;

  if (certificate.file?.cloudinaryURL) {
    previewImageUrl = certificate.file.cloudinaryURL.replace(/\.pdf$/i, '.jpg');
    if (!previewImageUrl.includes('/image/upload/')) {
      previewImageUrl = previewImageUrl.replace('/raw/upload/', '/image/upload/');
    }
  }

  const BackButton = () => {
    const className = "flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-2 transition-colors";
    const icon = (
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
    );

    if (onBack) {
      return (
        <button onClick={onBack} className={className}>
          {icon} Back to List
        </button>
      );
    }

    if (backHref) {
      return (
        <Link href={backHref as any} className={className}>
          {icon} Back to List
        </Link>
      );
    }

    return null;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-4">
            <div>
              <BackButton />
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                Certificate Details
                {getStatusBadge(certificate.status)}
              </h1>
            </div>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={certificate.file?.filename || 'certificate.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Metadata */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Information
              </h3>

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Certificate ID</p>
                  <p className="font-mono font-bold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                    {certificate.certificateCode}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Course Title</p>
                  <p className="font-medium text-gray-900">
                    {certificate.course?.title || certificate.metadata?.courseTitle || 'Unknown Course'}
                  </p>
                  {certificate.course?.courseCode && (
                    <p className="text-sm text-gray-500 mt-0.5">{certificate.course.courseCode}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date Issued</p>
                  <div className="flex items-center text-gray-900 font-medium">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(certificate.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {certificate.metadata?.instructorName && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Instructor</p>
                    <p className="font-medium text-gray-900">{certificate.metadata.instructorName}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Authenticity Verified
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                This certificate is officially generated and permanently recorded in the Grandline Maritime database. It serves as irrefutable proof of course completion.
              </p>
            </div>
          </div>

          {/* Right Column: PDF Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full min-h-[600px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-bold text-gray-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3.844 14.887c-.367.35-.907.48-1.424.34-.694-.188-2.316-.762-3.864-2.155-1.545 1.4-3.17 1.974-3.864 2.162-.516.14-1.056.01-1.423-.34-.368-.35-.503-.89-.356-1.41l.942-3.418-2.616-2.09c-.434-.347-.59-.92-.4-1.442.19-.523.655-.884 1.206-.937l3.542-.34 1.41-3.32c.19-.446.61-.74 1.09-.74.48 0 .9.294 1.09.74l1.41 3.32 3.542.34c.55.053 1.016.414 1.206.937.19.522.034 1.095-.4 1.442l-2.616 2.09.942 3.418c.147.52.012 1.06-.356 1.41z" />
                  </svg>
                  Original Document
                </h3>
                {certificate.file?.filesize && (
                  <span className="text-xs font-mono text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {(certificate.file.filesize / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
              </div>

              <div className="flex-1 bg-gray-100 p-4 md:p-8 flex items-center justify-center min-h-[600px]">
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt={`Certificate for ${certificate.course?.title || 'Course'}`}
                    className="w-full max-w-4xl h-auto object-contain rounded-lg shadow-lg border border-gray-300 bg-white"
                  />
                ) : downloadUrl ? (
                  <iframe
                    src={`${downloadUrl}#toolbar=0`}
                    className="w-full h-[600px] rounded-lg shadow-lg border border-gray-300 bg-white"
                    title="Certificate PDF Viewer"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>PDF Document Unavailable</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}