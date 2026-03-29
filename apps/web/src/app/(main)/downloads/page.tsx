'use client';

import React, { useEffect, useState } from 'react';
import { getMyCertificates } from '../certificates/actions';
import { getEnrolledMaterials, FrontendMaterial } from '../training-materials/actions';
import { useUser } from '@/hooks/useAuth';

interface Certificate {
  id: number;
  certificateCode: string;
  issueDate: string;
  status: string;
  course?: {
    id: number;
    title: string;
  };
  file?: {
    id: number;
    url: string;
    cloudinaryURL?: string;
    filename: string;
    filesize?: number;
    updatedAt?: string;
  };
}

export default function DownloadsPage() {
  const { user, token } = useUser();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [materials, setMaterials] = useState<FrontendMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user === undefined) return;
      if (!user || !user.id || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const [certs, mats] = await Promise.all([
          getMyCertificates(token),
          getEnrolledMaterials(token)
        ]);

        setCertificates(certs || []);

        // Filter out external links from downloads if desired, 
        // or keep them but change the button text.
        setMaterials(mats || []);
      } catch (error) {
        console.error('Failed to fetch downloads', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, token]);

  // Cloudinary allows forcing a download attachment by replacing 'upload/' with 'upload/fl_attachment/'
  const getDownloadUrl = (url: string) => {
    if (!url) return '#';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const handleBulkDownload = (files: { url: string; filename: string }[]) => {
    if (!files || files.length === 0) return;

    // Most modern browsers block multiple rapid programmatic link clicks as popups/spam.
    // Instead of appending a single <a> tag, we must use an iframe approach or trigger them safely.
    files.forEach((file, index) => {
      setTimeout(() => {
        // Create an iframe to trigger the download without opening a new tab
        // that the browser's popup blocker will catch
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = getDownloadUrl(file.url);
        document.body.appendChild(iframe);

        // Clean up the iframe after a short delay
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 5000);
      }, index * 800); // Increased delay to 800ms to be safer
    });
  };

  const formatSize = (size: number | string | undefined) => {
    if (!size) return 'Unknown size';
    if (typeof size === 'number') {
      const kb = size / 1024;
      if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB`;
      return `${Math.round(kb)} KB`;
    }
    return size;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'Unknown date';
    return new Date(dateStr).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 pb-12">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="w-full px-[10px]">
            <div className="py-6">
              <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="w-full px-[10px] py-8 space-y-8">
          {/* Section 1 Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
            </div>
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map((i) => (
                <li key={i} className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center min-w-0 gap-x-4 flex-1">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="min-w-0 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded w-28 animate-pulse ml-4"></div>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2 Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="h-6 bg-gray-200 rounded w-56 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-80 animate-pulse"></div>
            </div>
            <ul className="divide-y divide-gray-200">
              {[1, 2].map((i) => (
                <li key={i} className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center min-w-0 gap-x-4 flex-1">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="min-w-0 flex-1">
                      <div className="h-5 bg-gray-200 rounded w-72 mb-2 animate-pulse"></div>
                      <div className="flex items-center space-x-2">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="h-9 bg-gray-200 rounded w-32 animate-pulse ml-4"></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Downloads Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              Download your certificates and training materials for offline use.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8 space-y-8">

        {/* Certificates Section */}
        {certificates.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">My Certificates</h3>
                <p className="mt-1 text-sm text-gray-500">Official course completion certificates and documents.</p>
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {certificates.map((cert) => (
                <li key={`cert-${cert.id}`} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between">
                  <div className="flex items-center min-w-0 gap-x-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cert.course?.title || 'Certificate'} - {cert.certificateCode}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                        <span className={`px-2 py-0.5 rounded-full border font-medium ${cert.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                          cert.status === 'expired' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                          {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                        </span>
                        <span>•</span>
                        <span>{cert.file?.filesize ? formatSize(cert.file.filesize) : 'PDF Document'}</span>
                        <span>•</span>
                        <span>Issued {formatDate(cert.issueDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    {(cert.file?.cloudinaryURL || cert.file?.url) ? (
                      <a
                        href={getDownloadUrl(cert.file.cloudinaryURL || cert.file.url)}
                        download={cert.file.filename || `Certificate-${cert.certificateCode}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500 italic">Not available</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Training Materials Section */}
        {materials.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Training Materials</h3>
              <p className="mt-1 text-sm text-gray-500">Course and lesson materials available for your enrolled programs.</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {materials.map((item) => (
                <li key={`mat-${item.id}`} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between">
                  <div className="flex items-center min-w-0 gap-x-4">
                    <div className={`flex-shrink-0 h-12 w-12 rounded-lg flex items-center justify-center ${item.type === 'PDF' ? 'bg-red-100 text-red-600' :
                      item.type === 'Video' ? 'bg-blue-100 text-blue-600' :
                        item.type === 'Presentation' ? 'bg-orange-100 text-orange-600' :
                          'bg-indigo-100 text-indigo-600'
                      }`}>
                      {item.type === 'PDF' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      )}
                      {item.type === 'Video' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      )}
                      {(item.type !== 'PDF' && item.type !== 'Video') && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-medium">
                          {item.isLessonMaterial ? 'Lesson' : 'Course'}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[150px] sm:max-w-xs">{item.courseName}</span>
                        {item.lessonTitle && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[150px] sm:max-w-xs">{item.lessonTitle}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{item.type}</span>
                        {item.size !== 'N/A' && (
                          <>
                            <span>•</span>
                            <span>{item.size}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                    {item.hasMultipleFiles && item.allFiles && item.allFiles.length > 0 ? (
                      <button
                        onClick={() => handleBulkDownload(item.allFiles!)}
                        className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="hidden sm:inline">Download All ({item.allFiles.length})</span>
                      </button>
                    ) : item.href ? (
                      item.type === 'Link' ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="hidden sm:inline">Open Link</span>
                        </a>
                      ) : (
                        <a
                          href={getDownloadUrl(item.href)}
                          download={item.title}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span className="hidden sm:inline">Download</span>
                        </a>
                      )
                    ) : (
                      <span className="text-sm text-gray-500 italic">Not available</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {certificates.length === 0 && materials.length === 0 && !isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No downloads available</h3>
            <p className="mt-1 text-sm text-gray-500">You don't have any certificates or training materials to download yet.</p>
          </div>
        )}

      </div>
    </div>
  );
}
