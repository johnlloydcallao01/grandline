'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus, Search, MoreHorizontal,
    Edit, Trash2, Copy, Eye
} from '@/components/ui/IconWrapper';
import { cmsConfig, getCMSImageUrl, formatCMSDate } from '@/lib/cms';
import { CertificateThumbnail } from '../components/CertificateThumbnail';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';

interface CertificateTemplate {
    id: number;
    name: string;
    slug: string;
    backgroundImage: {
        id: number;
        url: string;
        alt?: string;
        filename: string;
    } | number;
    canvasSchema: {
        elements: any[];
        width?: number;
        height?: number;
        backgroundFit?: 'cover' | 'contain';
    };
    status: 'draft' | 'published' | 'archived';
    updatedAt: string;
}

export default function CertificateTemplatesPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All Status');
    const [previewTemplate, setPreviewTemplate] = useState<{
        isOpen: boolean;
        id?: number;
        backgroundImage: string | null;
        elements: any[];
        width?: number;
        height?: number;
        backgroundFit?: 'cover' | 'contain';
    }>({
        isOpen: false,
        id: undefined,
        backgroundImage: null,
        elements: [],
        width: 3508, // Default A4 Landscape @ 300 DPI
        height: 2480,
        backgroundFit: 'contain'
    });

    const loadTemplates = async () => {
        try {
            // Fetch with depth=1 to get media details
            const response = await fetch(`${cmsConfig.apiUrl}/certificate-templates?depth=1&limit=100`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch templates');
            }

            const data = await response.json();
            setTemplates(data.docs || []);
        } catch (err) {
            console.error(err);
            setError('Failed to load templates');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-yellow-100 text-yellow-700';
            case 'archived': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'published': return 'Active';
            case 'draft': return 'Draft';
            case 'archived': return 'Archived';
            default: return status;
        }
    };

    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All Status' ||
            (statusFilter === 'Active' && template.status === 'published') ||
            (statusFilter === 'Draft' && template.status === 'draft') ||
            (statusFilter === 'Archived' && template.status === 'archived');
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading templates...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-blue-600 hover:underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Certificate Templates</h1>
                    <p className="text-gray-600 mt-1">Manage designs for your course certificates</p>
                </div>
                <Link
                    href="/certifications/builder"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Template
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Draft</option>
                        <option>Archived</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => {
                    const bgImage = typeof template.backgroundImage === 'object' ? template.backgroundImage : null;

                    // Robust URL resolution - EXACTLY matching builder logic
                    let imageUrl: string | null = null;
                    if (bgImage) {
                        // Prioritize Cloudinary URL as seen in builder
                        // @ts-ignore - property might exist on API response even if not in type
                        if (bgImage.cloudinaryURL) {
                            // @ts-ignore
                            imageUrl = bgImage.cloudinaryURL;
                        } else if (bgImage.url && bgImage.url.startsWith('http')) {
                            imageUrl = bgImage.url;
                        } else if (bgImage.url && bgImage.url.startsWith('/')) {
                            imageUrl = `${cmsConfig.serverUrl}${bgImage.url}`;
                        } else {
                            imageUrl = getCMSImageUrl(bgImage.filename);
                        }
                    }

                    const elements = template.canvasSchema?.elements || [];

                    return (
                        <div key={template.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                            {/* Thumbnail */}
                            <div className="aspect-video bg-slate-50 relative border-b border-gray-100 flex items-center justify-center overflow-hidden">
                                <CertificateThumbnail
                                    backgroundImage={imageUrl}
                                    elements={elements}
                                />

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2 z-20">
                                    <button
                                        onClick={() => setPreviewTemplate({
                                            isOpen: true,
                                            id: template.id,
                                            backgroundImage: imageUrl,
                                            elements: elements,
                                            width: template.canvasSchema?.width || 3508,
                                            height: template.canvasSchema?.height || 2480,
                                            backgroundFit: template.canvasSchema?.backgroundFit || 'contain'
                                        })}
                                        className="p-2 bg-white rounded-full shadow-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </button>
                                    <Link
                                        href={`/certifications/builder?id=${template.id}`}
                                        className="p-2 bg-white rounded-full shadow-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </Link>
                                </div>
                                <div className="absolute top-3 right-3 z-20">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(template.status)}`}>
                                        {getStatusLabel(template.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                    <span>Modified {formatCMSDate(template.updatedAt)}</span>
                                    <div className="flex gap-2">
                                        <button title="Duplicate" className="hover:text-gray-600"><Copy className="h-4 w-4" /></button>
                                        <button title="Delete" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* New Template Card */}
                <Link
                    href="/certifications/builder"
                    className="group relative flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all p-6 text-center"
                >
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-700">New Template</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Start from scratch</p>
                </Link>
            </div>

            {/* Preview Modal */}
            <CertificatePreviewModal
                isOpen={previewTemplate.isOpen}
                onClose={() => setPreviewTemplate(prev => ({ ...prev, isOpen: false }))}
                onEdit={previewTemplate.id ? () => router.push(`/certifications/builder?id=${previewTemplate.id}`) : undefined}
                backgroundImage={previewTemplate.backgroundImage}
                elements={previewTemplate.elements}
                width={previewTemplate.width}
                height={previewTemplate.height}
                backgroundFit={previewTemplate.backgroundFit}
            />
        </div>
    );
}
