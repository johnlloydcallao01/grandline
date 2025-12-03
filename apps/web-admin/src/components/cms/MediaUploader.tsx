'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File as FileIcon } from '@/components/ui/IconWrapper';
// Note: useUploadMediaMutation available but using direct fetch for now
import { getCMSImageUrl } from '@/lib/cms';
// Authentication is now handled by middleware

interface MediaUploaderProps {
  value?: string | number; // Media ID
  onChange?: (mediaId: string | number) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt: string;
  mimeType: string;
  filesize: number;
}

interface UploadResponse {
  doc: {
    id: string;
    url?: string;
    filename: string;
    alt?: string;
    mimeType?: string;
    filesize?: number;
  };
}

export function MediaUploader({
  value,
  onChange,
  accept = "image/*",
  maxSize = 10,
  className = ""
}: MediaUploaderProps) {

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication is now handled by middleware
  const isAuthenticated = true;

  const loadMediaInfo = useCallback(async (mediaId: string | number) => {
    if (!isAuthenticated) return;

    try {
      // Use direct fetch for now - could be replaced with RTK Query
      const response = await fetch(`/api/media/${mediaId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.doc) {
          setSelectedMedia({
            id: data.doc.id,
            url: data.doc.url || getCMSImageUrl(data.doc.filename),
            filename: data.doc.filename,
            alt: data.doc.alt || '',
            mimeType: data.doc.mimeType || '',
            filesize: data.doc.filesize || 0,
          });
        }
      }
    } catch (err) {
      console.error('Failed to load media info:', err);
    }
  }, [isAuthenticated]);

  // Load selected media info when value changes
  React.useEffect(() => {
    if (value && isAuthenticated) {
      loadMediaInfo(value);
    } else {
      setSelectedMedia(null);
    }
  }, [value, loadMediaInfo, isAuthenticated]);

  const uploadFile = useCallback(async (file: File) => {
    if (!isAuthenticated) return;

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', file.name.split('.')[0]); // Use filename as default alt text

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      const uploadPromise = new Promise<unknown>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              reject(new Error('Invalid response format'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open('POST', `/api/media`);
        // Credentials are handled by the browser with credentials: 'include'
        xhr.send(formData);
      });

      const response = await uploadPromise as UploadResponse;

      if (response.doc) {
        const mediaItem: MediaItem = {
          id: response.doc.id,
          url: response.doc.url || getCMSImageUrl(response.doc.filename),
          filename: response.doc.filename,
          alt: response.doc.alt || '',
          mimeType: response.doc.mimeType || '',
          filesize: response.doc.filesize || 0,
        };

        setSelectedMedia(mediaItem);
        onChange?.(mediaItem.id);
      }
    } catch (err: unknown) {
      console.error('Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onChange, isAuthenticated]);

  const handleFileSelect = useCallback((file: File) => {
    if (!isAuthenticated) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError('Invalid file type');
      return;
    }

    uploadFile(file);
  }, [maxSize, accept, uploadFile, isAuthenticated]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedMedia(null);
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = selectedMedia?.mimeType?.startsWith('image/');

  return (
    <div className={`space-y-3 ${className}`}>
      {selectedMedia ? (
        // Show selected media
        <div className="relative border border-gray-200 rounded-lg p-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isImage ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt}
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedMedia.filename}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedMedia.filesize)}
              </p>
              {selectedMedia.alt && (
                <p className="text-xs text-gray-600 mt-1">
                  Alt: {selectedMedia.alt}
                </p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Show upload area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        >
          {isUploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-gray-900 mx-auto" />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-900"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-900">
                {accept.includes('image') ? 'Images' : 'Files'} up to {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Media Library Button - TODO: Implement media library modal */}
      <button
        type="button"
        onClick={() => {
          // TODO: Implement media library functionality
        }}
        className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
      >
        Choose from Media Library
      </button>
    </div>
  );
}
