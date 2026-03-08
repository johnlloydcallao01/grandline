import React from 'react';

// Reusing types from builder (simplified)
interface CanvasElement {
    id: string;
    type: 'text' | 'image' | 'date' | 'variable';
    field?: string;
    label?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style: {
        fontSize: number;
        fontFamily: string;
        color: string;
        fontWeight: string;
        textAlign: 'left' | 'center' | 'right';
    };
    content?: string;
}

interface CertificateThumbnailProps {
    backgroundImage?: string | null;
    elements: CanvasElement[];
}

const INITIAL_CANVAS_WIDTH = 1123;
const INITIAL_CANVAS_HEIGHT = 794;

const getPreviewContent = (element: CanvasElement) => {
    if (element.type !== 'variable' || !element.field) return element.content;

    // Mock data for thumbnail preview
    switch (element.field) {
        case 'student_name': return 'John Doe';
        case 'course_title': return 'Course Title';
        case 'completion_date': return 'Jan 01, 2024';
        case 'instructor_name': return 'Instructor Name';
        case 'certificate_id': return 'CERT-0001';
        default: return `{{ ${element.label} }}`;
    }
};

export const CertificateThumbnail: React.FC<CertificateThumbnailProps> = ({
    backgroundImage,
    elements = []
}) => {
    // We render the certificate at a fixed scale to fit into the parent container
    // The parent container is expected to enforce aspect ratio (e.g. aspect-[4/3] or aspect-[1.414/1])
    // But since certificates are A4 landscape (approx 1.414 ratio), we'll try to fit width.

    return (
        <div className="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
            <div
                className="bg-white shadow-sm relative origin-center"
                style={{
                    width: INITIAL_CANVAS_WIDTH,
                    height: INITIAL_CANVAS_HEIGHT,
                    // Scale to ensure it covers standard thumbnail sizes (approx 300-400px width)
                    // 1123 * 0.4 = ~450px width, which covers most grid columns
                    transform: 'scale(0.4)',
                    transformOrigin: 'center center',
                    flexShrink: 0
                }}
            >
                {/* Background Image */}
                {backgroundImage ? (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={backgroundImage}
                            alt="Certificate Background"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 z-0 bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-200">
                        <span className="text-4xl text-gray-300 font-bold">No Image</span>
                    </div>
                )}

                {/* Elements Layer (Read-Only) */}
                {elements.map((el) => (
                    <div
                        key={`thumb-${el.id}`}
                        className="absolute z-10"
                        style={{
                            left: el.x,
                            top: el.y,
                            width: el.width,
                            height: el.height,
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
                                whiteSpace: 'pre-wrap',
                                overflow: 'hidden'
                            }}
                        >
                            {el.type === 'variable' ? (
                                <span>
                                    {getPreviewContent(el)}
                                </span>
                            ) : el.type === 'image' ? (
                                <img
                                    src={el.content || '/placeholder-image.jpg'}
                                    alt={el.label || 'Element'}
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
    );
};
