import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Reusing types
interface CanvasElement {
    id: string;
    type: 'text' | 'image' | 'date' | 'variable';
    field?: string;
    label?: string;
    x: number;
    y: number;
    width: number | 'auto';
    height: number | 'auto';
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
    content?: string;
}

interface CertificatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
    backgroundImage: string | null;
    backgroundFit?: 'cover' | 'contain';
    elements: CanvasElement[];
    width?: number;
    height?: number;
}

const DEFAULT_WIDTH = 3508;
const DEFAULT_HEIGHT = 2480;

const getPreviewContent = (element: CanvasElement) => {
    if (element.type !== 'variable' || !element.field) return element.content;

    // Mock data for preview
    switch (element.field) {
        case 'student_name': return 'John Doe';
        case 'course_title': return 'Advanced Maritime Safety';
        case 'completion_date': return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        case 'instructor_name': return 'Capt. James Sparrow';
        case 'certificate_id': return 'CERT-2024-XXXX-YYYY';
        default: return `{{ ${element.label} }}`;
    }
};

export const CertificatePreviewModal: React.FC<CertificatePreviewModalProps> = ({
    isOpen,
    onClose,
    onEdit,
    backgroundImage,
    backgroundFit = 'contain',
    elements,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT
}) => {
    const [scale, setScale] = useState(0.5);

    useEffect(() => {
        if (!isOpen) return;

        const updateScale = () => {
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Target roughly 80% of screen width and 70% of screen height
            // But ensure we don't scale UP (max 1)
            const widthRatio = (viewportWidth * 0.8) / width;
            const heightRatio = (viewportHeight * 0.7) / height;

            // Use the smaller ratio to ensure it fits completely
            setScale(Math.min(widthRatio, heightRatio, 1));
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('resize', updateScale);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, width, height]);

    if (!isOpen) return null;

    // Use Portal to escape any parent stacking contexts (overflow:hidden, transforms, etc.)
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200 relative">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Certificate Preview</h3>
                        <p className="text-sm text-gray-500">This is how the certificate will look with sample data</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-8 bg-gray-100 flex items-center justify-center">
                    {/* 
                        Wrapper that matches the VISUAL size of the scaled canvas.
                        This prevents the scrollable area from thinking the content is full 1123px size.
                    */}
                    <div
                        style={{
                            width: width * scale,
                            height: height * scale,
                            transition: 'width 0.2s, height 0.2s'
                        }}
                        className="shadow-xl bg-white relative flex-shrink-0"
                    >
                        {/* 
                            The Canvas itself, scaled down.
                            transform-origin: top left ensures it scales into the wrapper box we defined above.
                        */}
                        <div
                            className="bg-white origin-top-left"
                            style={{
                                width: width,
                                height: height,
                                transform: `scale(${scale})`,
                                transition: 'transform 0.2s'
                            }}
                        >
                            {/* Background Image */}
                            {backgroundImage ? (
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={backgroundImage}
                                        alt="Certificate Background"
                                        className={`w-full h-full object-${backgroundFit}`}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 z-0 bg-gray-50 flex items-center justify-center">
                                    <p className="text-gray-400">No Background Image</p>
                                </div>
                            )}

                            {/* Elements Layer (Read-Only) */}
                            {elements.map((el) => (
                                <div
                                    key={`preview-${el.id}`}
                                    className="absolute z-10"
                                    style={{
                                        left: el.x,
                                        top: el.y,
                                        width: el.width === 'auto' ? 'auto' : el.width,
                                        height: el.height === 'auto' ? 'auto' : el.height,
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
                                            whiteSpace: 'pre-wrap',
                                            overflow: 'hidden',
                                            boxSizing: 'border-box',
                                        }}
                                    >
                                        {el.type === 'variable' ? (
                                            <span>
                                                {getPreviewContent(el)}
                                            </span>
                                        ) : el.type === 'image' ? (
                                            <img
                                                src={el.content || '/placeholder-image.jpg'}
                                                alt={el.label || 'Certificate Element'}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <span>{el.content || 'Text'}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
                        >
                            Edit Template
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
