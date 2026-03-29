'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MaterialViewerClient({ data, isLessonMaterial }: { data: any, isLessonMaterial: boolean }) {
  const material = data.material;
  const courseContext = isLessonMaterial 
    ? (typeof data.lesson === 'object' ? data.lesson.title : 'Lesson') 
    : (typeof data.course === 'object' ? data.course.title : 'Course');

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const getMediaUrl = (media: any) => {
    return media?.cloudinaryURL || media?.url || null;
  };

  const getMimeType = (media: any) => {
    return media?.mimeType?.toLowerCase() || '';
  };

  const isPdf = (mime: string) => mime.includes('pdf');
  const isVideo = (mime: string) => mime.startsWith('video/');
  const isImage = (mime: string) => mime.startsWith('image/');
  const isPowerPoint = (mime: string) => mime.includes('presentation') || mime.includes('powerpoint') || mime.includes('ppt');
  const isOfficeDoc = (mime: string) => 
    mime.includes('word') || 
    mime.includes('excel') || 
    mime.includes('spreadsheet') ||
    mime.includes('officedocument');

  const renderViewer = () => {
    if (material.materialSource === 'external' && material.externalUrl) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">External Resource</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md text-center">
            This material is hosted on an external website. Click the button below to open it in a new tab.
          </p>
          <a 
            href={material.externalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Open External Link
          </a>
        </div>
      );
    }

    if (material.materialSource === 'media' && Array.isArray(material.media) && material.media.length > 0) {
      const activeMedia = material.media[activeMediaIndex];
      if (!activeMedia) return null;

      const url = getMediaUrl(activeMedia);
      const mime = getMimeType(activeMedia);

      if (!url) return <div className="p-8 text-center text-red-500">Error: Media URL not found.</div>;

      if (isPdf(mime)) {
        return (
          <div className="w-full h-full bg-gray-100 flex flex-col">
            <iframe src={`${url}#view=FitH`} className="w-full flex-1" title={material.title} />
          </div>
        );
      }

      if (isVideo(mime)) {
        return (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <video controls className="w-full max-h-full" controlsList="nodownload">
              <source src={url} type={activeMedia.mimeType} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      }

      if (isImage(mime)) {
        return (
          <div className="w-full h-full flex justify-center items-center p-8 bg-gray-50 overflow-auto">
            <img src={url} alt={material.title} className="max-w-full max-h-full object-contain shadow-sm" />
          </div>
        );
      }

      // Render PowerPoint files securely via Google Docs Viewer
      // Note: Google Viewer requires the URL to be publicly accessible.
      // Cloudinary URLs are public by default.
      if (isPowerPoint(mime)) {
        const encodedUrl = encodeURIComponent(url);
        const googleViewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
        return (
          <div className="w-full h-full bg-gray-100 flex flex-col">
            <iframe src={googleViewerUrl} className="w-full flex-1" title={material.title} frameBorder="0" />
          </div>
        );
      }

      if (isOfficeDoc(mime)) {
        const encodedUrl = encodeURIComponent(url);
        const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}`;
        return (
          <div className="w-full h-full bg-gray-100 flex flex-col">
            <iframe src={officeViewerUrl} className="w-full flex-1" title={material.title} frameBorder="0" />
          </div>
        );
      }

      // Fallback for unsupported file types
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl m-8">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">File Preview Not Available</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-md text-center">
            This file format cannot be previewed directly in the browser. Please download it to view.
          </p>
          <a 
            href={getDownloadUrl(url)} 
            download={activeMedia.filename || material.title}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Download File
          </a>
        </div>
      );
    }

    return (
      <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
        No content available for this material.
      </div>
    );
  };

  const hasMultipleFiles = material.materialSource === 'media' && Array.isArray(material.media) && material.media.length > 1;

  const [sidebarOpen] = useState(true);

  const activeMediaUrl = material.materialSource === 'external' 
    ? material.externalUrl 
    : (Array.isArray(material.media) && material.media.length > 0 ? getMediaUrl(material.media[activeMediaIndex]) : null);

  const activeMediaName = material.materialSource === 'external'
    ? 'External Link'
    : (Array.isArray(material.media) && material.media.length > 0 ? material.media[activeMediaIndex]?.filename || material.title : material.title);

  // Cloudinary allows forcing a download attachment by replacing 'upload/' with 'upload/fl_attachment/'
  const getDownloadUrl = (url: string) => {
    if (!url) return '#';
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/fl_attachment/');
    }
    return url;
  };

  const downloadUrl = activeMediaUrl ? getDownloadUrl(activeMediaUrl) : '#';

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="flex-none h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Link 
            href="/training-materials" 
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
            title="Back to Materials"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-semibold text-gray-900 truncate">
              {material.title}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-gray-500 truncate">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${isLessonMaterial ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>
                {isLessonMaterial ? 'Lesson Material' : 'Course Material'}
              </span>
              <span className="truncate">{courseContext}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          {activeMediaUrl && material.materialSource !== 'external' && (
            <a
              href={downloadUrl}
              download={activeMediaName}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Details Sidebar */}
        <div 
          className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-80 md:w-96 translate-x-0' : 'w-0 -translate-x-full border-none'
          }`}
        >
          <div className="flex-1 overflow-y-auto p-6 w-80 md:w-96">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Material Details</h2>
            {data.isRequired && (
              <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded border border-red-200 mb-4">
                Required Reading
              </span>
            )}

            {/* Description */}
            {material.description && (
              <div className="mt-4 mb-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                <div className="prose prose-sm text-gray-600">
                  {material.description}
                </div>
              </div>
            )}

            {/* Multiple Files Selection */}
            {hasMultipleFiles && (
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Files Included ({material.media.length})
                </h3>
                <div className="flex flex-col gap-2">
                  {material.media.map((file: any, idx: number) => (
                    <button
                      key={file.id || idx}
                      onClick={() => setActiveMediaIndex(idx)}
                      className={`text-left px-3 py-3 rounded-lg text-sm transition-colors border flex items-start gap-3 ${
                        activeMediaIndex === idx 
                          ? 'bg-blue-50 border-blue-200 text-blue-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="mt-0.5 opacity-70">
                        {isPdf(getMimeType(file)) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        ) : isVideo(getMimeType(file)) ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`truncate font-medium ${activeMediaIndex === idx ? 'text-blue-900' : 'text-gray-900'}`} title={file.filename}>
                          {file.filename}
                        </div>
                        <div className="text-xs opacity-70 mt-0.5">
                          {file.filesize ? Math.round(file.filesize / 1024) + ' KB' : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Viewer */}
        <div className="flex-1 h-full bg-gray-100 relative">
          {renderViewer()}
        </div>
      </div>
    </div>
  );
}