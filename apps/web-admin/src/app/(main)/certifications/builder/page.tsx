'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { Resizable } from 're-resizable';
import {
    Plus, Save,
    Type, Image as ImageIcon,
    Settings, Eye,
    Trash2, AlignLeft, AlignCenter, AlignRight,
    X, Loader2
} from 'lucide-react';
import { MediaLibraryModal } from '@encreasl/ui/media-library-modal';
import {
    type SharedMediaItem,
    mapPayloadMediaDocsToSharedMediaItems,
} from '@encreasl/ui/lexical-course-editor';
import { env } from '@/lib/env';
import { useToast } from '@/components/ui/Toast';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';

// --- Types ---

interface CanvasElement {
    id: string;
    type: 'text' | 'image' | 'date' | 'variable';
    field?: string; // e.g., 'student_name'
    label?: string; // Display label
    x: number;
    y: number;
    width: number; // Width is now required for resizing
    height: number; // Height is now required for resizing
    style: {
        fontSize: number;
        fontFamily: string;
        color: string;
        fontWeight: string;
        textAlign: 'left' | 'center' | 'right';
    };
    content?: string; // For static text
    nodeRef?: React.RefObject<HTMLDivElement | null>;
}

interface CertificateTemplateData {
    id: string;
    name: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    backgroundImage: string | number | { id: string | number; url?: string; cloudinaryURL?: string };
    canvasSchema: {
        width: number;
        height: number;
        elements: CanvasElement[];
    };
}

// --- Constants ---

const INITIAL_CANVAS_WIDTH = 1123; // A4 Landscape roughly at 96 DPI (approx)
const INITIAL_CANVAS_HEIGHT = 794;

const AVAILABLE_VARIABLES = [
    { label: 'Student Name', field: 'student_name' },
    { label: 'Course Title', field: 'course_title' },
    { label: 'Completion Date', field: 'completion_date' },
    { label: 'Instructor Name', field: 'instructor_name' },
    { label: 'Certificate ID', field: 'certificate_id' },
];

const FONT_FAMILIES = [
    { label: 'Serif (Times)', value: 'serif' },
    { label: 'Sans-serif (Arial)', value: 'sans-serif' },
    { label: 'Monospace (Courier)', value: 'monospace' },
    { label: 'Cursive', value: 'cursive' },
    { label: 'Fantasy', value: 'fantasy' },
];

async function loadWebAdminMedia(): Promise<SharedMediaItem[]> {
    const base = (env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const url = base ? `${base}/media?limit=60` : '/api/media?limit=60';

    const getPayloadToken = () => {
        const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'payload-token') {
                return value;
            }
        }
        return null;
    };

    const payloadToken = getPayloadToken();

    const headers: Record<string, string> = {};
    if (payloadToken) {
        headers.Authorization = `JWT ${payloadToken}`;
    }

    const res = await fetch(url, {
        credentials: 'include',
        headers,
    });

    if (!res.ok) {
        throw new Error(`Failed to load media: ${res.status}`);
    }

    const json = await res.json();
    return mapPayloadMediaDocsToSharedMediaItems(json?.docs);
}

function CertificateBuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { addToast } = useToast();
    const templateId = searchParams.get('id');

    // --- State ---
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [canvasScale, setCanvasScale] = useState(1.0); // Zoom level for the editor

    // Media Library State
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
    const [mediaLibraryMode, setMediaLibraryMode] = useState<'element' | 'background'>('element');

    // Template Metadata
    const [templateName, setTemplateName] = useState('Untitled Template');
    const [templateSlug, setTemplateSlug] = useState('untitled-template');
    const [templateStatus, setTemplateStatus] = useState<'draft' | 'published' | 'archived'>('draft');
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [backgroundMediaId, setBackgroundMediaId] = useState<string | number | null>(null);

    // UI State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const canvasRef = useRef<HTMLDivElement>(null);

    // --- Load Template ---
    useEffect(() => {
        if (!templateId) return;

        const loadTemplate = async () => {
            setIsLoading(true);
            try {
                const base = (env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
                const url = base ? `${base}/certificate-templates/${templateId}?depth=1` : `/api/certificate-templates/${templateId}?depth=1`;

                const getPayloadToken = () => {
                    const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
                    for (const cookie of cookies) {
                        const [name, value] = cookie.trim().split('=');
                        if (name === 'payload-token') return value;
                    }
                    return null;
                };

                const headers: Record<string, string> = {};
                const token = getPayloadToken();
                if (token) headers.Authorization = `JWT ${token}`;

                const res = await fetch(url, { headers, credentials: 'include' });
                if (!res.ok) throw new Error('Failed to load template');

                const data: CertificateTemplateData = await res.json();

                setTemplateName(data.name);
                setTemplateSlug(data.slug);
                setTemplateStatus(data.status);

                if (data.backgroundImage) {
                    const bgObj = typeof data.backgroundImage === 'object' ? data.backgroundImage : null;
                    const bgId = (bgObj ? bgObj.id : data.backgroundImage) as string | number;

                    // Set ID state
                    setBackgroundMediaId(bgId);

                    // Try to get URL from existing object (prioritize Cloudinary)
                    let bgUrl = bgObj ? (bgObj.cloudinaryURL || bgObj.url) : null;

                    // If we don't have a URL yet, fetch it using the ID
                    if (!bgUrl && bgId) {
                        try {
                            const mediaUrl = base ? `${base}/media/${bgId}` : `/api/media/${bgId}`;
                            const mediaRes = await fetch(mediaUrl, { headers, credentials: 'include' });
                            if (mediaRes.ok) {
                                const mediaData = await mediaRes.json();
                                bgUrl = mediaData.cloudinaryURL || mediaData.url;
                            }
                        } catch (e) {
                            console.error('Failed to fetch background media details', e);
                        }
                    }

                    if (bgUrl) {
                        setBackgroundImage(bgUrl);
                    }
                }

                if (data.canvasSchema && data.canvasSchema.elements) {
                    // Restore elements with refs
                    const restoredElements = data.canvasSchema.elements.map((el: any) => ({
                        ...el,
                        nodeRef: React.createRef<HTMLDivElement>()
                    }));
                    setElements(restoredElements);
                }
            } catch (err) {
                console.error('Error loading template:', err);
                addToast({
                    title: 'Load Failed',
                    message: 'Failed to load template data.',
                    type: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadTemplate();
    }, [templateId]);

    // --- Actions ---

    const addElement = (type: CanvasElement['type'], field?: string, label?: string) => {
        const newElement: CanvasElement = {
            id: `el_${Date.now()}`,
            type,
            field,
            label: label || 'New Text',
            x: 100, // Default position
            y: 100,
            width: type === 'image' ? 150 : 300, // Default width
            height: type === 'image' ? 150 : 50, // Default height
            style: {
                fontSize: 24,
                fontFamily: 'serif',
                color: '#000000',
                fontWeight: 'normal',
                textAlign: 'left',
            },
            content: type === 'text' ? 'Double click to edit' : undefined,
            nodeRef: React.createRef<HTMLDivElement>(),
        };

        setElements((prev) => [...prev, newElement]);
        setSelectedId(newElement.id);
    };

    const updateElement = (id: string, updates: Partial<CanvasElement> | Partial<CanvasElement['style']>) => {
        setElements((prev) => prev.map((el) => {
            if (el.id !== id) return el;

            // Check if updates are for style or top-level properties
            const isStyleUpdate = Object.keys(updates).some(k => k in el.style);

            if (isStyleUpdate) {
                return {
                    ...el,
                    style: { ...el.style, ...updates }
                };
            }

            return { ...el, ...updates };
        }));
    };

    const deleteElement = (id: string) => {
        setElements((prev) => prev.filter((el) => el.id !== id));
        if (selectedId === id) setSelectedId(null);
        if (editingId === id) setEditingId(null);
    };

    const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
        // Final update to ensure sync
        setElements((prev) => prev.map((el) => {
            if (el.id !== id) return el;
            return { ...el, x: data.x, y: data.y };
        }));
    };

    const handleSave = async () => {
        if (!backgroundMediaId) {
            addToast({
                title: 'Background Image Missing',
                message: 'Please select a background image in Settings.',
                type: 'warning'
            });
            setIsSettingsOpen(true);
            return;
        }

        if (!templateName || !templateSlug) {
            addToast({
                title: 'Template Details Missing',
                message: 'Please provide a name and slug for the template.',
                type: 'warning'
            });
            setIsSettingsOpen(true);
            return;
        }

        setIsSaving(true);

        try {
            const schema = {
                width: INITIAL_CANVAS_WIDTH,
                height: INITIAL_CANVAS_HEIGHT,
                elements: elements.map(({ id, type, field, label, x, y, width, height, style, content }) => ({
                    id, type, field, label, x, y, width, height, style, content
                }))
            };

            const payload = {
                name: templateName,
                slug: templateSlug,
                status: templateStatus,
                backgroundImage: typeof backgroundMediaId === 'string' && !isNaN(Number(backgroundMediaId))
                    ? Number(backgroundMediaId)
                    : backgroundMediaId,
                canvasSchema: schema,
            };

            // Use the API URL directly - do not replace localhost with 127.0.0.1 as it breaks cookie authentication
            const baseRaw = (env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
            const base = baseRaw;

            const url = templateId
                ? `${base ? base : '/api'}/certificate-templates/${templateId}`
                : `${base ? base : '/api'}/certificate-templates`;

            const method = templateId ? 'PATCH' : 'POST';

            // Debug logging
            console.log('Saving template:', {
                url,
                method,
                templateId,
                payload
            });

            const getPayloadToken = () => {
                const cookies = typeof document !== 'undefined' ? document.cookie.split(';') : [];
                for (const cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'payload-token') return value;
                }
                return null;
            };

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            const token = getPayloadToken();
            if (token) headers.Authorization = `JWT ${token}`;

            let res;
            try {
                // Remove credentials: 'include' if we have a token to avoid CORS strictness
                // but keep it if we don't have a token (relying on cookies)
                const fetchOptions: RequestInit = {
                    method,
                    headers,
                    body: JSON.stringify(payload),
                };

                if (!token) {
                    fetchOptions.credentials = 'include';
                }

                res = await fetch(url, fetchOptions);
            } catch (networkErr: any) {
                console.error('Network error during save:', networkErr);
                throw new Error(`Network error: ${networkErr.message || 'Failed to connect to server'}`);
            }

            if (!res.ok) {
                const err = await res.json().catch(() => ({ errors: [{ message: `HTTP Error ${res.status}` }] }));
                throw new Error(err.errors?.[0]?.message || `Failed to save: ${res.statusText}`);
            }

            const data = await res.json();

            addToast({
                title: 'Success',
                message: 'Template saved successfully!',
                type: 'success'
            });

            if (!templateId && data.doc?.id) {
                // Redirect to edit mode and update URL
                const newUrl = `/certifications/builder?id=${data.doc.id}`;
                router.replace(newUrl);
            }

        } catch (err: any) {
            console.error('Save error:', err);
            addToast({
                title: 'Save Failed',
                message: err.message || 'An unexpected error occurred while saving.',
                type: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleMediaSelect = (item: SharedMediaItem) => {
        if (mediaLibraryMode === 'background') {
            setBackgroundImage(item.url);
            setBackgroundMediaId(item.id);
            setIsMediaLibraryOpen(false);
        } else {
            // Element mode
            const newElement: CanvasElement = {
                id: `el_${Date.now()}`,
                type: 'image',
                label: item.alt || 'Image',
                x: 100,
                y: 100,
                width: 200,
                height: 200,
                style: {
                    fontSize: 0, // Not used for images
                    fontFamily: 'sans-serif',
                    color: 'transparent',
                    fontWeight: 'normal',
                    textAlign: 'left',
                },
                content: item.url, // Store image URL in content
                nodeRef: React.createRef<HTMLDivElement>(),
            };

            setElements((prev) => [...prev, newElement]);
            setSelectedId(newElement.id);
            setIsMediaLibraryOpen(false);
        }
    };

    const openMediaLibrary = (mode: 'element' | 'background') => {
        setMediaLibraryMode(mode);
        setIsMediaLibraryOpen(true);
    };

    // --- Computed ---
    const selectedElement = elements.find(el => el.id === selectedId);

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading template...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0 shadow-sm z-10">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Certificate Builder</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <span>{templateName}</span>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="relative">
                        <select
                            value={templateStatus}
                            onChange={(e) => setTemplateStatus(e.target.value as 'draft' | 'published' | 'archived')}
                            className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-sm font-bold border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${templateStatus === 'published'
                                ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                : templateStatus === 'archived'
                                    ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                                    : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                                }`}
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="archived">Archived</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg className="h-4 w-4 fill-current opacity-70" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsPreviewOpen(true)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isSaving ? 'Saving...' : templateId ? 'Update' : 'Save Template'}
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">

                {/* Left Sidebar - Toolbox */}
                <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-y-auto z-10">

                    {/* Add Elements Section */}
                    <div className="p-5 border-b border-gray-200">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Variables</h3>
                        <div className="space-y-2">
                            {AVAILABLE_VARIABLES.map((v) => (
                                <button
                                    key={v.field}
                                    onClick={() => addElement('variable', v.field, v.label)}
                                    className="w-full flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all group text-left"
                                >
                                    <Plus className="h-4 w-4 text-blue-600 mr-3" />
                                    <span className="text-sm text-gray-900 font-medium">{v.label}</span>
                                </button>
                            ))}
                        </div>

                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mt-6 mb-4">Static Elements</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => addElement('text')}
                                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <Type className="h-6 w-6 text-gray-900 mb-2" />
                                <span className="text-xs font-bold text-gray-900">Text Box</span>
                            </button>

                            <button
                                onClick={() => openMediaLibrary('element')}
                                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                            >
                                <ImageIcon className="h-6 w-6 text-gray-900 mb-2" />
                                <span className="text-xs font-bold text-gray-900">Image</span>
                            </button>
                        </div>
                    </div>

                    {/* Properties Panel (Only visible if element selected) */}
                    {selectedElement ? (
                        <div className="p-5 bg-gray-50 flex-1">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Properties</h3>
                                <button
                                    onClick={() => deleteElement(selectedElement.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Position Info */}
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-900 font-medium mb-2">
                                    <div>X: {Math.round(selectedElement.x)}px</div>
                                    <div>Y: {Math.round(selectedElement.y)}px</div>
                                </div>

                                {/* Font Size */}
                                {selectedElement.type !== 'image' && (
                                    <>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Font Size</label>
                                            <input
                                                type="number"
                                                value={selectedElement.style.fontSize}
                                                onChange={(e) => updateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Font Family */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Font Family</label>
                                            <select
                                                value={selectedElement.style.fontFamily}
                                                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                {FONT_FAMILIES.map(f => (
                                                    <option key={f.value} value={f.value}>{f.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Color */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={selectedElement.style.color}
                                                    onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                                                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-sm font-medium text-black">{selectedElement.style.color}</span>
                                            </div>
                                        </div>

                                        {/* Alignment */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Alignment</label>
                                            <div className="flex bg-white rounded-md border border-gray-300 p-1">
                                                {(['left', 'center', 'right'] as const).map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                                                        className={`flex-1 flex justify-center py-1 rounded ${selectedElement.style.textAlign === align ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                                                    >
                                                        {align === 'left' && <AlignLeft className="h-4 w-4" />}
                                                        {align === 'center' && <AlignCenter className="h-4 w-4" />}
                                                        {align === 'right' && <AlignRight className="h-4 w-4" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Content (for Static Text) */}
                                {selectedElement.type === 'text' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 mb-1">Text Content</label>
                                        <textarea
                                            value={selectedElement.content}
                                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 flex-1 flex items-center justify-center text-gray-400 text-sm text-center">
                            Select an element to edit properties
                        </div>
                    )}
                </div>

                {/* Center Canvas Area */}
                <div className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-8 relative">

                    {/* Zoom Controls */}
                    <div className="absolute bottom-8 right-8 bg-white rounded-lg shadow-md flex items-center gap-2 px-3 py-2 z-20 border border-gray-200">
                        <button onClick={() => setCanvasScale(s => Math.max(0.2, s - 0.1))} className="text-gray-900 hover:text-blue-600 font-bold px-2 text-lg">-</button>
                        <span className="text-xs font-bold w-12 text-center text-gray-900">{Math.round(canvasScale * 100)}%</span>
                        <button onClick={() => setCanvasScale(s => Math.min(2, s + 0.1))} className="text-gray-900 hover:text-blue-600 font-bold px-2 text-lg">+</button>
                    </div>

                    {/* The "Fake Canvas" */}
                    <div
                        ref={canvasRef}
                        className="bg-white shadow-2xl relative transition-transform origin-center overflow-hidden"
                        style={{
                            width: INITIAL_CANVAS_WIDTH,
                            height: INITIAL_CANVAS_HEIGHT,
                            transform: `scale(${canvasScale})`,
                            // Ensure the canvas takes up space even when scaled down
                            flexShrink: 0
                        }}
                    >
                        {/* Background Image Layer */}
                        {backgroundImage ? (
                            <div className="absolute inset-0 z-0 pointer-events-none">
                                <img
                                    src={backgroundImage}
                                    alt="Certificate Background"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200">
                                <div className="text-center p-6">
                                    <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                                    <p className="text-gray-400 font-medium">No Background Image</p>
                                    <button
                                        onClick={() => openMediaLibrary('background')}
                                        className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
                                    >
                                        Select Background
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Elements Layer */}
                        {elements.map((el) => (
                            <div key={`${el.id}-${el.x}-${el.y}`} style={{ display: 'contents' }}>
                                <Draggable
                                    defaultPosition={{ x: el.x, y: el.y }}
                                    onStop={(e, d) => handleDragStop(el.id, e, d)}
                                    scale={canvasScale}
                                    cancel=".nodrag"
                                    nodeRef={el.nodeRef as React.RefObject<HTMLDivElement>}
                                >
                                    <div
                                        ref={el.nodeRef as React.RefObject<HTMLDivElement>}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(el.id);
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (el.type === 'text') {
                                                setEditingId(el.id);
                                            }
                                        }}
                                        className={`absolute cursor-move group hover:outline hover:outline-1 hover:outline-blue-400 ${selectedId === el.id ? 'outline outline-2 outline-blue-600 z-50' : 'z-10'
                                            }`}
                                    >
                                        <Resizable
                                            size={{ width: el.width, height: el.height }}
                                            onResizeStop={(e, direction, ref, d) => {
                                                const newWidth = el.width + d.width;
                                                const newHeight = el.height + d.height;

                                                // Calculate font size scaling if resizing from corner (bottomRight)
                                                let newFontSize = el.style.fontSize;
                                                if (direction === 'bottomRight' || direction === 'topRight' || direction === 'bottomLeft' || direction === 'topLeft') {
                                                    const ratio = newHeight / el.height;
                                                    newFontSize = Math.round(el.style.fontSize * ratio);
                                                }

                                                updateElement(el.id, {
                                                    width: newWidth,
                                                    height: newHeight,
                                                    style: { ...el.style, fontSize: newFontSize }
                                                });
                                            }}
                                            handleClasses={{
                                                bottomRight: 'nodrag',
                                                bottom: 'nodrag',
                                                right: 'nodrag'
                                            }}
                                            handleComponent={{
                                                bottomRight: <div className="w-3 h-3 bg-blue-600 z-50 nodrag" />
                                            }}
                                            // Only enable bottom/right for simplicity to avoid x/y issues for now
                                            enable={{
                                                top: false, right: true, bottom: true, left: false,
                                                topRight: false, bottomRight: true, bottomLeft: false, topLeft: false
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: el.style.textAlign === 'center' ? 'center' : el.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: `${el.style.fontSize}px`,
                                                    fontFamily: el.style.fontFamily,
                                                    color: el.style.color,
                                                    fontWeight: el.style.fontWeight,
                                                    textAlign: el.style.textAlign,
                                                    width: '100%',
                                                    height: '100%',
                                                    whiteSpace: 'pre-wrap', // Allow wrapping
                                                    overflow: 'hidden',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                {/* Render Content */}
                                                {el.type === 'variable' ? (
                                                    <span className="opacity-80 border border-dashed border-gray-400 px-1 bg-yellow-50/50">
                                                        {`{{ ${el.label} }}`}
                                                    </span>
                                                ) : el.type === 'image' ? (
                                                    <img
                                                        src={el.content || '/placeholder-image.jpg'}
                                                        alt={el.label || 'Certificate Element'}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : editingId === el.id ? (
                                                    <textarea
                                                        autoFocus
                                                        value={el.content || ''}
                                                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                                                        onBlur={() => setEditingId(null)}
                                                        onKeyDown={(e) => {
                                                            e.stopPropagation(); // Prevent triggering other shortcuts
                                                        }}
                                                        onMouseDown={(e) => e.stopPropagation()} // Allow clicking inside textarea without dragging
                                                        className="w-full h-full bg-transparent outline-none resize-none p-0 m-0 border-none focus:ring-0 nodrag"
                                                        style={{
                                                            fontSize: 'inherit',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 'inherit',
                                                            textAlign: 'inherit',
                                                            color: 'inherit',
                                                            lineHeight: 'inherit'
                                                        }}
                                                    />
                                                ) : (
                                                    <span>{el.content || 'Text'}</span>
                                                )}
                                            </div>

                                            {/* Helper UI when selected */}
                                            {selectedId === el.id && (
                                                <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-1 rounded">
                                                    {Math.round(el.x)}, {Math.round(el.y)}
                                                </div>
                                            )}
                                        </Resizable>
                                    </div>
                                </Draggable>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* Media Library Modal */}
            <MediaLibraryModal
                isOpen={isMediaLibraryOpen}
                onClose={() => setIsMediaLibraryOpen(false)}
                onSelect={handleMediaSelect}
                loadMedia={loadWebAdminMedia}
                title={mediaLibraryMode === 'background' ? "Select Background Image" : "Select Image Element"}
                zIndex={9999}
            />

            {/* Preview Modal */}
            <CertificatePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                backgroundImage={backgroundImage}
                elements={elements}
            />

            {/* Template Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Template Settings</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Template Name</label>
                                <input
                                    type="text"
                                    value={templateName}
                                    onChange={(e) => {
                                        setTemplateName(e.target.value);
                                        // Auto-generate slug from name if not manually set (simple check)
                                        if (templateSlug === 'untitled-template' || templateSlug.includes('untitled')) {
                                            setTemplateSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g. Standard Completion Certificate"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Slug (URL Identifier)</label>
                                <input
                                    type="text"
                                    value={templateSlug}
                                    onChange={(e) => setTemplateSlug(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-500"
                                    placeholder="e.g. standard-completion-2024"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-1">Status</label>
                                <select
                                    value={templateStatus}
                                    onChange={(e) => setTemplateStatus(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Background Image</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center relative">
                                        {backgroundImage ? (
                                            <img src={backgroundImage} alt="Background" className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <button
                                        onClick={() => openMediaLibrary('background')}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
                                    >
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CertificateBuilderPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <CertificateBuilderContent />
        </Suspense>
    );
}
