'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    Search, Loader2, X, Trash2, Edit,
    Upload, FileText, Image, Grid, List,
} from '@/components/ui/IconWrapper';
import {
    getMedia, uploadMedia, updateMedia, deleteMedia,
} from './actions';
import type { MediaDoc } from '@encreasl/cms-types';

function getMediaUrl(item: MediaDoc): string {
    return item.cloudinaryURL || item.thumbnailURL || item.url || ''
}

function isImageMime(mimeType?: string | null): boolean {
    if (!mimeType) return true
    return mimeType.startsWith('image/')
}

function formatFileSize(bytes?: number | null): string {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ITEMS_PER_PAGE = 60;

function formatDate(dateStr: string | null | undefined) {
    if (!dateStr) return '\u2014';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getFileLabel(mimeType?: string | null): string {
    if (!mimeType) return 'File'
    if (mimeType.startsWith('image/')) return 'Image'
    if (mimeType.startsWith('video/')) return 'Video'
    if (mimeType.startsWith('audio/')) return 'Audio'
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Document'
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheet'
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentation'
    if (mimeType.includes('zip')) return 'Archive'
    return 'File'
}

export default function MediaPage() {
    const [items, setItems] = useState<MediaDoc[]>([]);
    const [totalDocs, setTotalDocs] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [stats, setStats] = useState<{ totalFiles: number; images: number; videos: number; documents: number }>({
        totalFiles: 0,
        images: 0,
        videos: 0,
        documents: 0,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [detailItem, setDetailItem] = useState<MediaDoc | null>(null);

    const [editingItem, setEditingItem] = useState<MediaDoc | null>(null);
    const [editAlt, setEditAlt] = useState('');
    const [editFilename, setEditFilename] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [deleteTarget, setDeleteTarget] = useState<MediaDoc | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadItems = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getMedia({
                search: debouncedSearch || undefined,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            setItems(data.docs || []);
            setTotalDocs(data.totalDocs || 0);
            setTotalPages(data.totalPages || 0);
            setStats(data.stats || { totalFiles: 0, images: 0, videos: 0, documents: 0 });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load media');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage]);

    useEffect(() => { loadItems(); }, [loadItems]);

    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 400);
        return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
    }, [searchTerm]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('alt', file.name.split('.')[0]);

            const created = await uploadMedia(formData);
            setItems(prev => [created, ...prev]);
            setTotalDocs(prev => prev + 1);
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const openDetail = (item: MediaDoc) => {
        setDetailItem(item);
    };

    const openEdit = (item: MediaDoc) => {
        setEditingItem(item);
        setEditAlt(item.alt || '');
        setEditFilename(item.filename || '');
        setSaveError(null);
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;
        try {
            setIsSaving(true);
            setSaveError(null);
            const updated = await updateMedia(editingItem.id, {
                alt: editAlt.trim() || null,
                filename: editFilename.trim() || null,
            });
            setItems(prev => prev.map(a => a.id === updated.id ? updated : a));
            if (detailItem?.id === editingItem.id) setDetailItem(updated);
            setEditingItem(null);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to update media');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteMedia(deleteTarget.id);
            setItems(prev => prev.filter(a => a.id !== deleteTarget!.id));
            setTotalDocs(prev => prev - 1);
            if (detailItem?.id === deleteTarget.id) setDetailItem(null);
            setDeleteTarget(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete media');
        } finally {
            setIsDeleting(false);
        }
    };

    const imageCount = stats.images;
    const videoCount = stats.videos;
    const docCount = stats.documents;

    return (
        <div className="py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Media Library</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Upload and manage media files</p>
                </div>
                <div className="flex gap-3">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
                    >{isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}{isUploading ? 'Uploading...' : 'Upload File'}</button>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/30">
                            <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalDocs}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Files</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-green-50 dark:bg-green-900/30">
                            <Image className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{imageCount}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Images</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-900/30">
                            <Image className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{videoCount}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Videos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/30">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{docCount}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Documents</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[var(--card-background)] p-4 rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input type="text" placeholder="Search by filename or alt text..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 bg-white dark:bg-[var(--card-background)]"
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-1">
                <button onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title="Grid view"
                ><Grid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    title="List view"
                ><List className="h-4 w-4" /></button>
            </div>

            {uploadError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
                    <span>{uploadError}</span>
                    <button onClick={() => setUploadError(null)} className="ml-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"><X className="h-4 w-4" /></button>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                    <p className="text-red-700 dark:text-red-300 text-sm mb-3">{error}</p>
                    <button onClick={loadItems} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">Retry</button>
                </div>
            )}

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden animate-pulse">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
                            <div className="p-3 space-y-2">
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm p-12 text-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Image className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No media files found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {debouncedSearch
                            ? 'No files match your search criteria. Try a different search term.'
                            : 'Upload your first media file to get started.'}
                    </p>
                    {!debouncedSearch && (
                        <button onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        ><Upload className="h-4 w-4 mr-2" /> Upload File</button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {items.map(item => {
                            const url = getMediaUrl(item);
                            const isImage = isImageMime(item.mimeType);
                            return (
                                <div key={item.id} className="group bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                                    onClick={() => openDetail(item)}
                                >
                                    <div className="aspect-square relative bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                                        {url && isImage ? (
                                            <img src={url} alt={item.alt || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                                <FileText className="h-10 w-10 mb-2" />
                                                <span className="text-xs font-medium px-2 text-center">{getFileLabel(item.mimeType)}</span>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                            <button onClick={e => { e.stopPropagation(); openEdit(item); }}
                                                className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                title="Edit"
                                            ><Edit className="h-3.5 w-3.5" /></button>
                                            <button onClick={e => { e.stopPropagation(); setDeleteTarget(item); }}
                                                className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Delete"
                                            ><Trash2 className="h-3.5 w-3.5" /></button>
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.alt || item.filename || `Media #${item.id}`}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{item.filename}{item.filesize ? ` \u00B7 ${formatFileSize(item.filesize)}` : ''}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-[var(--card-border)] bg-gray-50/50 dark:bg-gray-800/50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preview</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name / Alt</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items.map(item => {
                                    const url = getMediaUrl(item);
                                    const isImage = isImageMime(item.mimeType);
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer" onClick={() => openDetail(item)}>
                                            <td className="px-4 py-3 w-14">
                                                <div className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                                                    {url && isImage ? (
                                                        <img src={url} alt={item.alt || ''} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[240px]">{item.alt || item.filename || `Media #${item.id}`}</p>
                                                {item.filename && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[240px]">{item.filename}</p>}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {getFileLabel(item.mimeType)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatFileSize(item.filesize) || '\u2014'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(item.updatedAt)}
                                            </td>
                                            <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openEdit(item)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit"
                                                    ><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => setDeleteTarget(item)}
                                                        className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete"
                                                    ><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm px-4 py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page {currentPage} of {totalPages} ({totalDocs} total)
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                        ><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></button>
                        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                            let pn: number;
                            if (totalPages <= 5) pn = i + 1;
                            else if (currentPage <= 3) pn = i + 1;
                            else if (currentPage >= totalPages - 2) pn = totalPages - 4 + i;
                            else pn = currentPage - 2 + i;
                            return <button key={pn} onClick={() => setCurrentPage(pn)}
                                className={`w-8 h-8 rounded-lg text-sm font-medium ${currentPage === pn ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{pn}</button>;
                        })}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed bg-white dark:bg-[var(--card-background)]"
                        ><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg></button>
                    </div>
                </div>
            )}

            {detailItem && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDetailItem(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Media Details</h2>
                            <button onClick={() => setDetailItem(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                {getMediaUrl(detailItem) && isImageMime(detailItem.mimeType) ? (
                                    <img src={getMediaUrl(detailItem)} alt={detailItem.alt || ''} className="w-full max-h-80 object-contain mx-auto" />
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                        <FileText className="h-16 w-16" />
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">File Info</h3></div>
                            <div className="space-y-3 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Alt Text</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{detailItem.alt || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Filename</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-all">{detailItem.filename || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Type</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{detailItem.mimeType || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Size</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{formatFileSize(detailItem.filesize) || '\u2014'}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">ID</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5 font-mono text-xs">{detailItem.id}</p></div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">URL</h3></div>
                            <div className="text-sm">
                                {getMediaUrl(detailItem) ? (
                                    <div className="flex gap-2">
                                        <input type="text" readOnly value={getMediaUrl(detailItem)}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-mono bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                                            onClick={e => (e.target as HTMLInputElement).select()}
                                        />
                                        <button onClick={() => { navigator.clipboard.writeText(getMediaUrl(detailItem)); }}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium whitespace-nowrap"
                                        >Copy</button>
                                    </div>
                                ) : <span className="text-gray-400">No URL available</span>}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Audit</h3></div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-500 dark:text-gray-400">Created</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(detailItem.createdAt)}</p></div>
                                <div><span className="text-gray-500 dark:text-gray-400">Updated</span><p className="font-medium text-gray-900 dark:text-gray-100 mt-0.5">{formatDate(detailItem.updatedAt)}</p></div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-[var(--card-border)]">
                                <button onClick={() => { const a = detailItem; setDetailItem(null); openEdit(a); }}
                                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                                ><Edit className="h-4 w-4 mr-2" /> Edit</button>
                                <button onClick={() => setDetailItem(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium bg-white dark:bg-[var(--card-background)]"
                                >Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingItem && (
                <div className="fixed inset-0 z-50 flex justify-end" onClick={() => !isSaving && setEditingItem(null)}>
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[var(--card-background)] shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white dark:bg-[var(--card-background)] border-b border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit Media</h2>
                            <button onClick={() => setEditingItem(null)} disabled={isSaving} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500"><X className="h-5 w-5" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            {saveError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">{saveError}</div>
                            )}

                            <div className="rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 mb-4">
                                {getMediaUrl(editingItem) && isImageMime(editingItem.mimeType) ? (
                                    <img src={getMediaUrl(editingItem)} alt={editingItem.alt || ''} className="w-full max-h-48 object-contain mx-auto" />
                                ) : (
                                    <div className="h-32 flex items-center justify-center text-gray-400"><FileText className="h-12 w-12" /></div>
                                )}
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3"><h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Properties</h3></div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alt Text</label>
                                    <input type="text" value={editAlt} onChange={e => setEditAlt(e.target.value)}
                                        placeholder="Descriptive text for the media"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filename</label>
                                    <input type="text" value={editFilename} onChange={e => setEditFilename(e.target.value)}
                                        placeholder="filename.ext"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[var(--card-background)] text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    <span className="font-medium">Type:</span> {editingItem.mimeType || '\u2014'} &middot;
                                    <span className="font-medium ml-2">Size:</span> {formatFileSize(editingItem.filesize) || '\u2014'}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white dark:bg-[var(--card-background)] border-t border-gray-200 dark:border-[var(--card-border)] px-6 py-4 flex gap-3">
                            <button onClick={() => setEditingItem(null)} disabled={isSaving}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium bg-white dark:bg-[var(--card-background)]"
                            >Cancel</button>
                            <button onClick={handleSaveEdit} disabled={isSaving}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                            >{isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{isSaving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !isDeleting && setDeleteTarget(null)}>
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Media</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Are you sure you want to delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.alt || deleteTarget.filename || `Media #${deleteTarget.id}`}</span>? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button onClick={() => setDeleteTarget(null)} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                >Cancel</button>
                                <button onClick={handleDelete} disabled={isDeleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-500 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                                >{isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}{isDeleting ? 'Deleting...' : 'Delete'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
