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
    X, Loader2, ArrowLeft,
    Copy, Clipboard, CopyPlus,
    Layout, ArrowLeftFromLine, ArrowRightFromLine, ArrowUpFromLine, ArrowDownFromLine
} from 'lucide-react';
import { MediaLibraryModal } from '@encreasl/ui/media-library-modal';
import {
    type SharedMediaItem,
    mapPayloadMediaDocsToSharedMediaItems,
} from '@encreasl/ui/lexical-course-editor';
import { env } from '@/lib/env';
import { useToast } from '@/components/ui/Toast';
import { getCertificateTemplateById, updateCertificateTemplate } from '../templates/actions';
import { CertificatePreviewModal } from '../components/CertificatePreviewModal';

// --- Types ---

interface CanvasElement {
    id: string;
    type: 'text' | 'image' | 'date' | 'variable';
    field?: string; // e.g., 'student_name'
    label?: string; // Display label
    x: number;
    y: number;
    width: number | 'auto'; // Width is now flexible
    height: number | 'auto'; // Height is now flexible
    style: {
        fontSize: number;
        fontFamily: string;
        color: string;
        backgroundColor?: string;
        padding?: number;
        borderRadius?: number;
        fontWeight: string;
        textAlign: 'left' | 'center' | 'right';
    };
    content?: string; // For static text
    nodeRef?: React.RefObject<HTMLDivElement | null>;
}

// Removed unused interface: CertificateTemplateData

// --- Constants ---

const INITIAL_CANVAS_WIDTH = 3508; // A4 Landscape at 300 DPI
const INITIAL_CANVAS_HEIGHT = 2480;

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
        if (typeof localStorage !== 'undefined') {
            return localStorage.getItem('grandline_auth_token_admin');
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

    // --- History State (Undo/Redo) ---
    const [history, setHistory] = useState<CanvasElement[][]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    // Removed unused ref: isUndoRedoAction

    // --- Clipboard & Context Menu State ---
    const [clipboard, setClipboard] = useState<CanvasElement | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        targetId: string | null;
        submenu?: 'align' | null;
    }>({ visible: false, x: 0, y: 0, targetId: null, submenu: null });

    // Media Library State
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
    const [mediaLibraryMode, setMediaLibraryMode] = useState<'element' | 'background'>('element');

    // Template Metadata
    const [templateName, setTemplateName] = useState('Untitled Template');
    const [templateSlug, setTemplateSlug] = useState('untitled-template');
    const [templateStatus, setTemplateStatus] = useState<'draft' | 'published' | 'archived'>('draft');
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [backgroundMediaId, setBackgroundMediaId] = useState<string | number | null>(null);
    
    // Canvas Dimensions
    const [canvasWidth, setCanvasWidth] = useState(INITIAL_CANVAS_WIDTH);
    const [canvasHeight, setCanvasHeight] = useState(INITIAL_CANVAS_HEIGHT);
    const [backgroundFit, setBackgroundFit] = useState<'cover' | 'contain'>('contain');
    const [dimensionUnit, setDimensionUnit] = useState<'px' | 'in' | 'mm'>('px');

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
                const data = await getCertificateTemplateById(templateId);

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
                            const base = (env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
                            const mediaUrl = base ? `${base}/media/${bgId}` : `/api/media/${bgId}`;
                            
                            const getPayloadToken = () => {
                                if (typeof localStorage !== 'undefined') {
                                    return localStorage.getItem('grandline_auth_token_admin');
                                }
                                return null;
                            };

                            const headers: Record<string, string> = {};
                            const token = getPayloadToken();
                            if (token) headers.Authorization = `JWT ${token}`;

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

                if (data.canvasSchema) {
                    if (data.canvasSchema.width) setCanvasWidth(data.canvasSchema.width);
                    if (data.canvasSchema.height) setCanvasHeight(data.canvasSchema.height);
                    if (data.canvasSchema.backgroundFit) setBackgroundFit(data.canvasSchema.backgroundFit);

                    if (data.canvasSchema.elements) {
                        // Restore elements with refs
                        const restoredElements = data.canvasSchema.elements.map((el: any) => ({
                            ...el,
                            nodeRef: React.createRef<HTMLDivElement>()
                        }));
                        setElements(restoredElements);
                    }
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

    // --- History Management ---

    // Function to manually push state to history (for decisive actions)
    const pushToHistory = (newElements: CanvasElement[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    // Initialize history on load
    useEffect(() => {
        if (elements.length > 0 && history.length === 0) {
            setHistory([elements]);
            setHistoryIndex(0);
        }
    }, [elements, history.length]);

    const undo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setElements(history[prevIndex]);
            setHistoryIndex(prevIndex);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setElements(history[nextIndex]);
            setHistoryIndex(nextIndex);
        }
    };

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if user is typing in an input or textarea
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

            if (isInput) return;

            // Undo (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }

            // Redo (Ctrl+Y or Ctrl+Shift+Z)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
                return;
            }

            // Delete key
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedId) {
                    deleteElement(selectedId);
                }
            }

            // Copy (Ctrl+C)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                if (selectedId) {
                    e.preventDefault();
                    copyElement(selectedId);
                }
            }

            // Paste (Ctrl+V)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                if (clipboard) {
                    e.preventDefault();
                    pasteElement();
                }
            }

            // Duplicate (Ctrl+D)
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                if (selectedId) {
                    e.preventDefault();
                    duplicateElement(selectedId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, clipboard, historyIndex, history]); // Re-bind when dependencies change

    // --- Actions ---

    const addElement = (type: CanvasElement['type'], field?: string, label?: string) => {
        const newElement: CanvasElement = {
            id: `el_${Date.now()}`,
            type,
            field,
            label: label || 'New Text',
            x: 100, // Default position
            y: 100,
            width: type === 'image' ? 300 : 'auto', // Default width
            height: type === 'image' ? 300 : 'auto', // Default height
            style: {
                fontSize: 48, // Start with larger font for 300 DPI
                fontFamily: 'serif',
                color: '#000000',
                backgroundColor: 'transparent',
                padding: 0,
                borderRadius: 0,
                fontWeight: 'normal',
                textAlign: 'left',
            },
            content: type === 'text' ? 'Double click to edit' : undefined,
            nodeRef: React.createRef<HTMLDivElement>(),
        };

        const newElements = [...elements, newElement];
        setElements(newElements);
        pushToHistory(newElements); // Save history
        setSelectedId(newElement.id);
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };

    const updateElement = (id: string, updates: Partial<CanvasElement> | Partial<CanvasElement['style']>, saveHistory = false) => {
        let updatedElements: CanvasElement[] = [];
        setElements((prev) => {
            updatedElements = prev.map((el) => {
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
            });
            return updatedElements;
        });
        
        // If explicitly requested to save history (e.g. on blur or specific actions)
        if (saveHistory && updatedElements.length > 0) {
            pushToHistory(updatedElements);
        }
    };

    const deleteElement = (id: string) => {
        const newElements = elements.filter((el) => el.id !== id);
        setElements(newElements);
        pushToHistory(newElements); // Save history
        if (selectedId === id) setSelectedId(null);
        if (editingId === id) setEditingId(null);
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };

    const copyElement = (id: string) => {
        const el = elements.find(e => e.id === id);
        if (el) {
            setClipboard(el);
            addToast({ title: 'Copied', message: 'Element copied to clipboard', type: 'success' });
        }
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };

    const pasteElement = (position?: { x: number; y: number }) => {
        if (clipboard) {
            const newElement: CanvasElement = {
                ...clipboard,
                id: `el_${Date.now()}`,
                x: position ? position.x : clipboard.x + 20,
                y: position ? position.y : clipboard.y + 20,
                nodeRef: React.createRef<HTMLDivElement>(),
            };
            setElements(prev => [...prev, newElement]);
            setSelectedId(newElement.id);
            addToast({ title: 'Pasted', message: 'Element pasted from clipboard', type: 'success' });
        }
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };

    const duplicateElement = (id: string) => {
        const el = elements.find(e => e.id === id);
        if (el) {
            const newElement: CanvasElement = {
                ...el,
                id: `el_${Date.now()}`,
                x: el.x + 20,
                y: el.y + 20,
                nodeRef: React.createRef<HTMLDivElement>(),
            };
            setElements(prev => [...prev, newElement]);
            setSelectedId(newElement.id);
            addToast({ title: 'Duplicated', message: 'Element duplicated', type: 'success' });
        }
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
    };

    const handleContextMenu = (e: React.MouseEvent, id: string | null) => {
        e.preventDefault();
        e.stopPropagation();
        
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            targetId: id
        });
        
        if (id) {
            setSelectedId(id);
        }
    };

    const handleDrag = (id: string, e: DraggableEvent, data: DraggableData) => {
        // Continuous update for smooth controlled dragging
        setElements((prev) => prev.map((el) => {
            if (el.id !== id) return el;
            return { ...el, x: data.x, y: data.y };
        }));
    };

    const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
        // Final update to ensure sync
        let updatedElements: CanvasElement[] = [];
        setElements((prev) => {
            updatedElements = prev.map((el) => {
                if (el.id !== id) return el;
                return { ...el, x: data.x, y: data.y };
            });
            return updatedElements;
        });
        pushToHistory(updatedElements); // Save history on drag end
    };

    const alignElement = (id: string, alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
        let updatedElements: CanvasElement[] = [];
        setElements((prev) => {
            updatedElements = prev.map((el) => {
                if (el.id !== id) return el;

                let newX = el.x;
                let newY = el.y;
                const elWidth = typeof el.width === 'number' ? el.width : (el.nodeRef?.current?.offsetWidth || 0);
                const elHeight = typeof el.height === 'number' ? el.height : (el.nodeRef?.current?.offsetHeight || 0);

                switch (alignment) {
                    case 'left':
                        newX = 0;
                        break;
                    case 'center':
                        newX = (canvasWidth - elWidth) / 2;
                        break;
                    case 'right':
                        newX = canvasWidth - elWidth;
                        break;
                    case 'top':
                        newY = 0;
                        break;
                    case 'middle':
                        newY = (canvasHeight - elHeight) / 2;
                        break;
                    case 'bottom':
                        newY = canvasHeight - elHeight;
                        break;
                }

                return { ...el, x: newX, y: newY };
            });
            return updatedElements;
        });
        
        if (updatedElements.length > 0) {
            pushToHistory(updatedElements); // Save history on alignment
        }
        setContextMenu({ visible: false, x: 0, y: 0, targetId: null, submenu: null });
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
                width: canvasWidth,
                height: canvasHeight,
                backgroundFit: backgroundFit,
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

            const data = await updateCertificateTemplate(templateId, payload);

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
                width: 400, // Reasonable default for 300 DPI
                height: 400,
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

            const newElements = [...elements, newElement];
            setElements(newElements);
            pushToHistory(newElements); // Save history
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

    // --- Dimension Conversion Helpers ---
    const toPx = (val: number, unit: 'px' | 'in' | 'mm') => {
        if (unit === 'px') return val;
        if (unit === 'in') return Math.round(val * 300);
        if (unit === 'mm') return Math.round(val * 11.811023622);
        return val;
    };

    const fromPx = (px: number, unit: 'px' | 'in' | 'mm') => {
        if (unit === 'px') return px;
        if (unit === 'in') return Number((px / 300).toFixed(2));
        if (unit === 'mm') return Number((px / 11.811023622).toFixed(1));
        return px;
    };

    const handleDimensionChange = (val: number, type: 'width' | 'height') => {
        const pxVal = toPx(val, dimensionUnit);
        if (type === 'width') setCanvasWidth(pxVal);
        else setCanvasHeight(pxVal);
    };

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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
                        title="Go Back"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Certificate Builder</h1>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{templateName}</span>
                        </div>
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
                                                onBlur={() => updateElement(selectedElement.id, {}, true)} // Save history on blur
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Font Family */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Font Family</label>
                                            <select
                                                value={selectedElement.style.fontFamily}
                                                onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value }, true)} // Save history on change
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
                                                    onBlur={() => updateElement(selectedElement.id, {}, true)} // Save history on blur
                                                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                />
                                                <span className="text-sm font-medium text-black">{selectedElement.style.color}</span>
                                            </div>
                                        </div>

                                        {/* Background Color */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Background Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={selectedElement.style.backgroundColor === 'transparent' ? '#ffffff' : selectedElement.style.backgroundColor}
                                                    onChange={(e) => updateElement(selectedElement.id, { backgroundColor: e.target.value })}
                                                    onBlur={() => updateElement(selectedElement.id, {}, true)} // Save history on blur
                                                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                />
                                                <button
                                                    onClick={() => updateElement(selectedElement.id, { backgroundColor: 'transparent' }, true)} // Save history on clear
                                                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 text-gray-700 font-medium"
                                                    title="Clear Background"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>

                                        {/* Padding */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Padding: {selectedElement.style.padding || 0}px</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedElement.style.padding || 0}
                                                onChange={(e) => updateElement(selectedElement.id, { padding: parseInt(e.target.value) })}
                                                onMouseUp={() => updateElement(selectedElement.id, {}, true)} // Save history on release
                                                onTouchEnd={() => updateElement(selectedElement.id, {}, true)} // Save history on release (touch)
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        {/* Border Radius */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Border Radius: {selectedElement.style.borderRadius || 0}px</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={selectedElement.style.borderRadius || 0}
                                                onChange={(e) => updateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })}
                                                onMouseUp={() => updateElement(selectedElement.id, {}, true)} // Save history on release
                                                onTouchEnd={() => updateElement(selectedElement.id, {}, true)} // Save history on release (touch)
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>

                                        {/* Alignment */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 mb-1">Alignment</label>
                                            <div className="flex bg-white rounded-md border border-gray-300 p-1">
                                                {(['left', 'center', 'right'] as const).map((align) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => updateElement(selectedElement.id, { textAlign: align }, true)} // Save history on click
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
                                            onBlur={() => updateElement(selectedElement.id, {}, true)} // Save history on blur
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
                <div
                    className="flex-1 bg-gray-200 overflow-auto flex items-center justify-center p-8 relative"
                    onClick={() => {
                        setSelectedId(null);
                        setEditingId(null);
                    }}
                >

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
                        onClick={(e) => {
                            // Stop propagation if clicking on canvas background, but still deselect elements
                            e.stopPropagation();
                            setSelectedId(null);
                            setEditingId(null);
                            setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
                        }}
                        onContextMenu={(e) => handleContextMenu(e, null)}
                        style={{
                            width: canvasWidth,
                            height: canvasHeight,
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
                                    className={`w-full h-full object-${backgroundFit}`}
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
                            <div key={el.id} style={{ display: 'contents' }}>
                                <Draggable
                                    position={{ x: el.x, y: el.y }}
                                    onDrag={(e, d) => handleDrag(el.id, e, d)}
                                    onStop={(e, d) => handleDragStop(el.id, e, d)}
                                    scale={canvasScale}
                                    cancel=".nodrag"
                                    nodeRef={el.nodeRef as React.RefObject<HTMLDivElement>}
                                >
                                    <div
                                        ref={el.nodeRef as React.RefObject<HTMLDivElement>}
                                        onContextMenu={(e) => handleContextMenu(e, el.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedId(el.id);
                                            setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation();
                                            if (el.type === 'text') {
                                                setEditingId(el.id);
                                            }
                                            setContextMenu({ visible: false, x: 0, y: 0, targetId: null });
                                        }}
                                        className={`absolute cursor-move group hover:outline hover:outline-1 hover:outline-blue-400 ${selectedId === el.id ? 'outline outline-2 outline-blue-600 z-50' : 'z-10'
                                            }`}
                                    >
                                        <Resizable
                                            size={{
                                                width: el.width === 'auto' ? 'auto' : el.width,
                                                height: el.height === 'auto' ? 'auto' : el.height
                                            }}
                                            onResizeStop={(e, direction, ref, d) => {
                                                const newWidth = (el.width === 'auto' ? ref.offsetWidth : el.width as number) + d.width;
                                                const newHeight = (el.height === 'auto' ? ref.offsetHeight : el.height as number) + d.height;

                                                // Calculate font size scaling if resizing from corner (bottomRight)
                                                let newFontSize = el.style.fontSize;
                                                if (direction === 'bottomRight' || direction === 'topRight' || direction === 'bottomLeft' || direction === 'topLeft') {
                                                    const currentHeight = el.height === 'auto' ? ref.offsetHeight - d.height : el.height as number;
                                                    const ratio = newHeight / currentHeight;
                                                    newFontSize = Math.round(el.style.fontSize * ratio);
                                                }

                                                updateElement(el.id, {
                                                    width: newWidth,
                                                    height: newHeight,
                                                    style: { ...el.style, fontSize: newFontSize }
                                                }, true); // Save history on resize stop
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
                                                top: false,
                                                right: el.type === 'image' || selectedId === el.id, // Only resizable if image or selected
                                                bottom: el.type === 'image' || selectedId === el.id,
                                                left: false,
                                                topRight: false,
                                                bottomRight: el.type === 'image' || selectedId === el.id,
                                                bottomLeft: false,
                                                topLeft: false
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
                                                    backgroundColor: el.style.backgroundColor || 'transparent',
                                                    padding: `${el.style.padding || 0}px`,
                                                    borderRadius: `${el.style.borderRadius || 0}px`,
                                                    fontWeight: el.style.fontWeight,
                                                    textAlign: el.style.textAlign,
                                                    width: el.width === 'auto' ? 'max-content' : '100%',
                                                    height: el.height === 'auto' ? 'auto' : '100%',
                                                    minWidth: '50px',
                                                    whiteSpace: 'pre-wrap', // Allow wrapping
                                                    overflow: 'hidden',
                                                    userSelect: 'none',
                                                    boxSizing: 'border-box', // Ensure padding is included in width calculation
                                                }}
                                            >
                                                {/* Render Content */}
                                                {el.type === 'variable' ? (
                                                    <span className="opacity-80 border border-dashed border-gray-400 px-1 bg-yellow-50/50 whitespace-nowrap">
                                                        {`{{ ${el.label} }}`}
                                                    </span>
                                                ) : el.type === 'image' ? (
                                                    <img
                                                        src={el.content || '/placeholder-image.jpg'}
                                                        alt={el.label || 'Certificate Element'}
                                                        className="w-full h-full object-contain"
                                                        draggable={false}
                                                        onDragStart={(e) => e.preventDefault()}
                                                        style={{ userSelect: 'none' }}
                                                    />
                                                ) : editingId === el.id ? (
                                                    <textarea
                                                        autoFocus
                                                        value={el.content || ''}
                                                        onChange={(e) => {
                                                            updateElement(el.id, { content: e.target.value });
                                                            // Auto-grow height
                                                            e.target.style.height = 'auto';
                                                            e.target.style.height = `${e.target.scrollHeight}px`;
                                                        }}
                                                        onBlur={() => setEditingId(null)}
                                                        onKeyDown={(e) => {
                                                            e.stopPropagation(); // Prevent triggering other shortcuts
                                                        }}
                                                        onMouseDown={(e) => e.stopPropagation()} // Allow clicking inside textarea without dragging
                                                        className="w-full h-full bg-transparent outline-none resize-none p-0 m-0 border-none focus:ring-0 nodrag overflow-hidden"
                                                        style={{
                                                            fontSize: 'inherit',
                                                            fontFamily: 'inherit',
                                                            fontWeight: 'inherit',
                                                            textAlign: 'inherit',
                                                            color: 'inherit',
                                                            lineHeight: 'inherit',
                                                            minWidth: '100%',
                                                            whiteSpace: 'pre-wrap'
                                                        }}
                                                    />
                                                ) : (
                                                    <span>{el.content || 'Text'}</span>
                                                )}
                                            </div>

                                            {/* Helper UI when selected */}
                                            {selectedId === el.id && (
                                                <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-1 rounded whitespace-nowrap">
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

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
                    style={{
                        left: Math.min(contextMenu.x, window.innerWidth - 170), // Prevent overflow right
                        top: Math.min(contextMenu.y, window.innerHeight - 200)  // Prevent overflow bottom
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.targetId ? (
                        <>
                            <button
                                onClick={() => copyElement(contextMenu.targetId!)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                <span>Copy</span>
                                <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
                            </button>
                            <button
                                onClick={() => pasteElement()}
                                disabled={!clipboard}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${clipboard ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                            >
                                <Clipboard className="h-4 w-4" />
                                <span>Paste</span>
                                <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
                            </button>
                            <button
                                onClick={() => duplicateElement(contextMenu.targetId!)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                                <CopyPlus className="h-4 w-4" />
                                <span>Duplicate</span>
                                <span className="ml-auto text-xs text-gray-400">Ctrl+D</span>
                            </button>
                            <div className="relative group/submenu">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setContextMenu(prev => ({ ...prev, submenu: prev.submenu === 'align' ? null : 'align' }));
                                    }}
                                    onMouseEnter={() => setContextMenu(prev => ({ ...prev, submenu: 'align' }))}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between group-hover/submenu:bg-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layout className="h-4 w-4" />
                                        <span>Align to Page</span>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                                
                                {/* Submenu */}
                                {contextMenu.submenu === 'align' && (
                                    <div 
                                        className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
                                        onMouseEnter={() => setContextMenu(prev => ({ ...prev, submenu: 'align' }))}
                                    >
                                        {(() => {
                                            const el = elements.find(e => e.id === contextMenu.targetId);
                                            if (!el) return null;
                                            
                                            const elWidth = typeof el.width === 'number' ? el.width : (el.nodeRef?.current?.offsetWidth || 0);
                                            const elHeight = typeof el.height === 'number' ? el.height : (el.nodeRef?.current?.offsetHeight || 0);
                                            
                                            // Check alignment with small tolerance (1px)
                                            const isLeft = Math.abs(el.x) < 1;
                                            const isCenter = Math.abs(el.x - (canvasWidth - elWidth) / 2) < 1;
                                            const isRight = Math.abs(el.x - (canvasWidth - elWidth)) < 1;
                                            const isTop = Math.abs(el.y) < 1;
                                            const isMiddle = Math.abs(el.y - (canvasHeight - elHeight) / 2) < 1;
                                            const isBottom = Math.abs(el.y - (canvasHeight - elHeight)) < 1;

                                            return (
                                                <>
                                                    <button 
                                                        onClick={() => !isLeft && alignElement(contextMenu.targetId!, 'left')} 
                                                        disabled={isLeft}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isLeft ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <ArrowLeftFromLine className="h-3 w-3" /> Left
                                                    </button>
                                                    <button 
                                                        onClick={() => !isCenter && alignElement(contextMenu.targetId!, 'center')} 
                                                        disabled={isCenter}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isCenter ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <AlignCenter className="h-3 w-3" /> Center
                                                    </button>
                                                    <button 
                                                        onClick={() => !isRight && alignElement(contextMenu.targetId!, 'right')} 
                                                        disabled={isRight}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isRight ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <ArrowRightFromLine className="h-3 w-3" /> Right
                                                    </button>
                                                    <div className="h-px bg-gray-200 my-1" />
                                                    <button 
                                                        onClick={() => !isTop && alignElement(contextMenu.targetId!, 'top')} 
                                                        disabled={isTop}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isTop ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <ArrowUpFromLine className="h-3 w-3" /> Top
                                                    </button>
                                                    <button 
                                                        onClick={() => !isMiddle && alignElement(contextMenu.targetId!, 'middle')} 
                                                        disabled={isMiddle}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isMiddle ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <Layout className="h-3 w-3 rotate-90" /> Middle
                                                    </button>
                                                    <button 
                                                        onClick={() => !isBottom && alignElement(contextMenu.targetId!, 'bottom')} 
                                                        disabled={isBottom}
                                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${isBottom ? 'text-gray-300 cursor-not-allowed bg-gray-50' : 'text-gray-700 hover:bg-gray-100'}`}
                                                    >
                                                        <ArrowDownFromLine className="h-3 w-3" /> Bottom
                                                    </button>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            <div className="h-px bg-gray-200 my-1" />
                            <button
                                onClick={() => deleteElement(contextMenu.targetId!)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
                                <span className="ml-auto text-xs text-red-300">Del</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                // Calculate position relative to canvas
                                // We need to convert screen coordinates (contextMenu.x/y) to canvas coordinates
                                const canvasRect = canvasRef.current?.getBoundingClientRect();
                                if (canvasRect) {
                                    const relativeX = (contextMenu.x - canvasRect.left) / canvasScale;
                                    const relativeY = (contextMenu.y - canvasRect.top) / canvasScale;
                                    pasteElement({ x: relativeX, y: relativeY });
                                } else {
                                    pasteElement();
                                }
                            }}
                            disabled={!clipboard}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${clipboard ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}`}
                        >
                            <Clipboard className="h-4 w-4" />
                            <span>Paste Here</span>
                            <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
                        </button>
                    )}
                </div>
            )}

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
                backgroundFit={backgroundFit}
                elements={elements}
                width={canvasWidth}
                height={canvasHeight}
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
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-gray-900">Canvas Size</label>
                                    <select
                                        value={dimensionUnit}
                                        onChange={(e) => setDimensionUnit(e.target.value as 'px' | 'in' | 'mm')}
                                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white font-medium"
                                    >
                                        <option value="px">Pixels (px)</option>
                                        <option value="in">Inches (in)</option>
                                        <option value="mm">Millimeters (mm)</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Width ({dimensionUnit})</label>
                                        <input
                                            type="number"
                                            value={fromPx(canvasWidth, dimensionUnit)}
                                            onChange={(e) => handleDimensionChange(Number(e.target.value), 'width')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                                            step={dimensionUnit === 'px' ? 1 : 0.1}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Height ({dimensionUnit})</label>
                                        <input
                                            type="number"
                                            value={fromPx(canvasHeight, dimensionUnit)}
                                            onChange={(e) => handleDimensionChange(Number(e.target.value), 'height')}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                                            step={dimensionUnit === 'px' ? 1 : 0.1}
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                                    <button
                                        onClick={() => { setCanvasWidth(3508); setCanvasHeight(2480); }}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 whitespace-nowrap"
                                    >
                                        A4 Landscape
                                    </button>
                                    <button
                                        onClick={() => { setCanvasWidth(2480); setCanvasHeight(3508); }}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 whitespace-nowrap"
                                    >
                                        A4 Portrait
                                    </button>
                                    <button
                                        onClick={() => { setCanvasWidth(3300); setCanvasHeight(2550); }}
                                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 whitespace-nowrap"
                                    >
                                        Letter Landscape
                                    </button>
                                </div>
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
                                            <img src={backgroundImage} alt="Background" className={`h-full w-full object-${backgroundFit}`} />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => openMediaLibrary('background')}
                                            className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors"
                                        >
                                            Change Image
                                        </button>
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setBackgroundFit('contain')}
                                                className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${backgroundFit === 'contain' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Contain
                                            </button>
                                            <button
                                                onClick={() => setBackgroundFit('cover')}
                                                className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${backgroundFit === 'cover' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                            >
                                                Cover
                                            </button>
                                        </div>
                                    </div>
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
