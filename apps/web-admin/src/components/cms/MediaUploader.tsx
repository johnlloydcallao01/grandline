'use client';

import React, { useState, useRef, useCallback } from 'react';
import { MediaLibraryModal } from '@encreasl/ui/media-library-modal';
import type { SharedMediaItem } from '@encreasl/ui/lexical-course-editor';
import { Upload, X, File as FileIcon } from '@/components/ui/IconWrapper';
// Note: useUploadMediaMutation available but using direct fetch for now
import { cmsApiFetch, cmsConfig, getCMSImageUrl } from '@/lib/cms';
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

interface MediaResponse {
  id: string | number;
  url?: string;
  filename?: string;
  alt?: string;
  mimeType?: string;
  filesize?: number;
  cloudinaryURL?: string;
  thumbnailURL?: string;
  doc?: MediaResponse;
}

interface MediaCollectionResponse {
  docs?: MediaResponse[];
}

function getPayloadToken() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('grandline_auth_token_admin');
  }
  return null;
}

function getMediaEndpoint(path = '') {
  const base = (cmsConfig.apiUrl || '').replace(/\/$/, '');
  return `${base}/media${path}`;
}

function normalizeMediaResponse(payload: unknown): MediaResponse | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const response = payload as MediaResponse;
  if (response.doc && typeof response.doc === 'object') {
    return response.doc;
  }

  return response;
}

function isMeaningfulValue(value: string | number | undefined) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized !== '' && normalized !== 'undefined' && normalized !== 'null';
}

function mapMediaResponseToItem(media: MediaResponse): MediaItem {
  const id = String(media.id ?? '').trim();
  const filename = media.filename || media.alt || (id ? `Media ${id}` : 'Uploaded file');

  return {
    id,
    url: media.cloudinaryURL || media.thumbnailURL || media.url || getCMSImageUrl(media.filename || ''),
    filename,
    alt: media.alt || '',
    mimeType: media.mimeType || '',
    filesize: media.filesize || 0,
  };
}

function getAcceptTokens(accept: string) {
  return accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

function getFileExtension(filename: string) {
  const extensionIndex = filename.lastIndexOf('.');
  if (extensionIndex < 0) return '';
  return filename.slice(extensionIndex).toLowerCase();
}

function matchesAcceptToken(file: File, token: string) {
  const mimeType = String(file.type || '').toLowerCase();
  const extension = getFileExtension(file.name);

  if (token.startsWith('.')) {
    return extension === token;
  }

  if (token.endsWith('/*')) {
    const mimePrefix = token.slice(0, -1);
    return mimeType.startsWith(mimePrefix);
  }

  if (token.includes('/')) {
    return mimeType === token;
  }

  return extension === `.${token}`;
}

function isAcceptedFileType(file: File, accept: string) {
  const tokens = getAcceptTokens(accept);
  if (tokens.length === 0) return true;
  return tokens.some((token) => matchesAcceptToken(file, token));
}

function formatAcceptedTypes(accept: string) {
  const labels = getAcceptTokens(accept).map((token) => {
    if (token.startsWith('.')) return token.slice(1).toUpperCase();
    if (token.endsWith('/*')) return token.replace('/*', '').toUpperCase();
    if (token === 'text/csv' || token === 'application/csv') return 'CSV';
    if (token === 'application/pdf') return 'PDF';
    if (token === 'application/x-ofx' || token === 'application/ofx' || token === 'text/ofx') return 'OFX';
    if (token === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'XLSX';
    if (token === 'application/vnd.ms-excel') return 'XLS';
    return token;
  });

  return Array.from(new Set(labels)).join(', ');
}

export function MediaUploader({
  value,
  onChange,
  accept = "image/*",
  maxSize = 10,
  className = ""
}: MediaUploaderProps) {

  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication is now handled by middleware
  const isAuthenticated = true;

  const loadMediaInfo = useCallback(async (mediaId: string | number) => {
    if (!isAuthenticated) return;

    try {
      const response = await cmsApiFetch(getMediaEndpoint(`/${mediaId}`));

      if (response.ok) {
        const data = normalizeMediaResponse(await response.json());
        if (data) {
          setSelectedMedia(mapMediaResponseToItem(data));
        }
      }
    } catch (err) {
      console.error('Failed to load media info:', err);
    }
  }, [isAuthenticated]);

  // Load selected media info when value changes
  React.useEffect(() => {
    if (isMeaningfulValue(value) && isAuthenticated) {
      const mediaId = value as string | number;
      loadMediaInfo(mediaId);
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
            let errorMessage = `Upload failed: ${xhr.statusText || `HTTP ${xhr.status}`}`;
            try {
              const payload = JSON.parse(xhr.responseText) as { errors?: Array<{ message?: string }>; message?: string };
              errorMessage =
                payload.errors?.[0]?.message ||
                payload.message ||
                errorMessage;
            } catch {
              // Keep the default message when the error body is not JSON.
            }
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        const token = getPayloadToken();
        if (!token) {
          reject(new Error('No admin session available for media upload.'));
          return;
        }

        xhr.open('POST', getMediaEndpoint());
        xhr.setRequestHeader('Authorization', `JWT ${token}`);
        xhr.send(formData);
      });

      const response = await uploadPromise as unknown;
      const mediaDoc = normalizeMediaResponse(response);
      if (!mediaDoc || !isMeaningfulValue(mediaDoc.id)) {
        throw new Error('Upload succeeded but no media record was returned.');
      }

      const mediaItem = mapMediaResponseToItem(mediaDoc);
      setSelectedMedia(mediaItem);
      onChange?.(mediaItem.id);
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
    if (accept && !isAcceptedFileType(file, accept)) {
      setError(`Invalid file type. Allowed types: ${formatAcceptedTypes(accept)}`);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    e.target.value = '';
  };

  const handleRemove = () => {
    setSelectedMedia(null);
    setError(null);
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const loadMediaLibrary = useCallback(async (): Promise<SharedMediaItem[]> => {
    const response = await cmsApiFetch(getMediaEndpoint('?limit=60&sort=-updatedAt'));
    if (!response.ok) {
      throw new Error('Failed to load media library.');
    }

    const payload = (await response.json()) as MediaCollectionResponse;
    const items: SharedMediaItem[] = [];

    for (const media of payload.docs || []) {
      const normalized = normalizeMediaResponse(media);
      if (!normalized || !isMeaningfulValue(normalized.id)) {
        continue;
      }

      const item = mapMediaResponseToItem(normalized);
      if (!item.id || !item.url) {
        continue;
      }

      items.push({
        id: item.id,
        url: item.url,
        alt: item.alt || item.filename,
        mimeType: item.mimeType,
        filename: item.filename,
      });
    }

    return items;
  }, []);

  const handleSelectFromLibrary = useCallback((item: SharedMediaItem) => {
    setError(null);
    setSelectedMedia({
      id: item.id,
      url: item.url,
      filename: item.filename || item.alt || `Media ${item.id}`,
      alt: item.alt || '',
      mimeType: item.mimeType || '',
      filesize: 0,
    });
    onChange?.(item.id);
    setIsLibraryOpen(false);
  }, [onChange]);

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
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isUploading ? 'border-blue-400 bg-blue-50/40' : 'border-gray-300 hover:border-gray-400'}`}
        >
          {isUploading ? (
            <div className="space-y-3">
              <div className="relative mx-auto flex h-12 w-12 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-100"></div>
                <div className="relative rounded-full bg-blue-600 p-3 text-white shadow-sm">
                  <Upload className="h-6 w-6 animate-bounce" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-700">Uploading file...</p>
                <p className="text-xs text-blue-600">{uploadProgress}% complete</p>
              </div>
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
                  disabled={isUploading}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-900"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-900">
                {accept.includes('image') ? 'Images' : 'Files'} up to {maxSize}MB
              </p>
              <p className="text-xs text-gray-500">
                Supported: {formatAcceptedTypes(accept)}
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

      {/* Media Library Button */}
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsLibraryOpen(true);
        }}
        disabled={isUploading}
        className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Choose from Media Library
      </button>

      <MediaLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={handleSelectFromLibrary}
        loadMedia={loadMediaLibrary}
        title="Choose Media"
        zIndex={9999}
      />
    </div>
  );
}
