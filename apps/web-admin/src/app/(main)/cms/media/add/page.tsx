'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X, Upload, CheckCircle } from '@/components/ui/IconWrapper';
import { uploadMedia, type MediaDoc } from '../actions';

function getMediaUrl(item: MediaDoc): string {
    return item.cloudinaryURL || item.thumbnailURL || item.url || ''
}

export default function AddMediaPage() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<MediaDoc[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...selected]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUploadAll = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setError(null);
        const newResults: MediaDoc[] = [];

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('alt', file.name.split('.')[0]);
                const doc = await uploadMedia(formData);
                newResults.push(doc);
            } catch (err) {
                setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                break;
            }
        }

        setResults(newResults);
        setFiles([]);
        setUploading(false);
    };

    if (results.length > 0) {
        return (
            <div className="p-6 max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Complete</h1>
                    <p className="text-gray-500 dark:text-gray-400">{results.length} file{results.length !== 1 ? 's' : ''} uploaded successfully.</p>
                </div>
                <div className="space-y-3">
                    {results.map(doc => (
                        <div key={doc.id} className="flex items-center gap-4 bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                            <div className="h-14 w-14 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                {getMediaUrl(doc) ? (
                                    <img src={getMediaUrl(doc)} alt={doc.alt || ''} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400"><Upload className="h-6 w-6" /></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{doc.alt || doc.filename}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{doc.filename}</p>
                            </div>
                            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Uploaded</span>
                        </div>
                    ))}
                </div>
                <div className="flex gap-3 justify-center pt-4">
                    <button onClick={() => { setResults([]); setFiles([]); }}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
                    >Upload More</button>
                    <button onClick={() => router.push('/cms/media')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >Go to Media Library</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Media File</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Upload media files to the library</p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"><X className="h-4 w-4" /></button>
                </div>
            )}

            <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-8">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Drop files here or click to browse</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Supports images, videos, documents, and more</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
                </div>
            </div>

            {files.length > 0 && (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{files.length} file{files.length !== 1 ? 's' : ''} selected</h3>
                        <button onClick={() => setFiles([])} className="text-xs text-gray-500 hover:text-red-600">Clear all</button>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-8 w-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 flex-shrink-0">
                                        <Upload className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFile(i)} className="p-1 text-gray-400 hover:text-red-600 flex-shrink-0"><X className="h-4 w-4" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                        <button onClick={handleUploadAll} disabled={uploading}
                            className="w-full flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                        >{uploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{uploading ? 'Uploading...' : `Upload ${files.length} file${files.length !== 1 ? 's' : ''}`}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
