import React from 'react';
import Link from 'next/link';

interface Certificate {
  id: string;
  certificateCode: string;
  issueDate: string;
  verificationUrl: string;
  file?: {
    id: number | string;
    url: string;
    filename: string;
    cloudinaryURL?: string;
  };
  courseTitle: string | null;
}

interface CertificatesShelfProps {
  certificates: Certificate[];
}

export const CertificatesShelf: React.FC<CertificatesShelfProps> = ({ certificates }) => {
  const getForcedDownloadUrl = (url: string | null) => {
    if (!url) return '#';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const getDownloadUrl = (file: Certificate['file']) => {
    const downloadUrl = file?.cloudinaryURL || (file?.url
      ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:3001'}${file.url}`
      : null);
    return downloadUrl ? getForcedDownloadUrl(downloadUrl) : null;
  };

  return (
    <div className="bg-[var(--card-background)] rounded-xl shadow-sm border border-[var(--card-border)]">
      <div className="p-6 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Certificates</h2>
          <Link href="/certificates" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
            View All
          </Link>
        </div>
      </div>
      <div className="p-6">
        {certificates.length > 0 ? (
          <div className="space-y-4">
            {certificates.slice(0, 3).map((cert) => {
              const downloadUrl = getDownloadUrl(cert.file);
              return (
                <div key={cert.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fa fa-certificate text-purple-600 dark:text-purple-400 text-xl group-hover:scale-110 transition-transform"></i>
                  </div>
                  <div className="ml-4 min-w-0 flex-1">
                    <Link href={`/certificates/${cert.id}`} className="block">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{cert.courseTitle || 'Course Certificate'}</h3>
                    </Link>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                  </div>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download={`${cert.certificateCode}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <i className="fa fa-download"></i>
                    </a>
                  )}
                </div>
              );
            })}
            {certificates.length > 3 && (
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
                + {certificates.length - 3} more certificates
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="fa fa-award text-gray-300 dark:text-gray-600 text-xl"></i>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Complete a course to earn your first certificate.</p>
          </div>
        )}
      </div>
    </div>
  );
};
