import React from 'react';
import { Document, Page, Text, Image, View } from '@react-pdf/renderer';

// Define the exact schema coming from the builder
interface BuilderElementStyle {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: number;
    borderRadius?: number;
    fontWeight?: string | number;
    textAlign?: 'left' | 'center' | 'right';
    opacity?: number;
}

interface BuilderElement {
    id: string;
    type: 'text' | 'image' | 'variable' | 'date';
    field?: string; // e.g. 'student_name'
    label?: string;
    content?: string;
    x: number;
    y: number;
    width?: number | 'auto';
    height?: number | 'auto';
    style?: BuilderElementStyle;
}

export interface CertificateData {
    studentName: string;
    courseTitle: string;
    completionDate: string;
    instructorName: string;
    certificateId: string;
}

interface CertificatePDFProps {
    backgroundUrl: string;
    backgroundFit?: 'cover' | 'contain';
    elements: BuilderElement[];
    data: CertificateData;
    width?: number;
    height?: number;
}

// Maps builder fonts to standard PDF fonts
const getPdfFontFamily = (family?: string, isBold?: boolean) => {
    const familyLower = family?.toLowerCase() || '';
    if (familyLower.includes('serif') || familyLower.includes('times')) {
        return isBold ? 'Times-Bold' : 'Times-Roman';
    }
    if (familyLower.includes('monospace') || familyLower.includes('courier')) {
        return isBold ? 'Courier-Bold' : 'Courier';
    }
    return isBold ? 'Helvetica-Bold' : 'Helvetica';
};

export const CertificatePDF = ({
    backgroundUrl,
    backgroundFit = 'contain',
    elements,
    data,
    width = 3508,
    height = 2480
}: CertificatePDFProps) => {

    // Map builder variable fields to data values
    const getVariableValue = (field: string | undefined, fallbackContent: string = '') => {
        if (!field) return fallbackContent;

        switch (field) {
            case 'student_name': return data.studentName;
            case 'course_title': return data.courseTitle;
            case 'completion_date': return data.completionDate;
            case 'instructor_name': return data.instructorName;
            case 'certificate_id': return data.certificateId;
            default: return fallbackContent;
        }
    };

    // Helper to process content (handling both {{placeholders}} and 'field' property)
    const processContent = (el: BuilderElement) => {
        // Priority 1: If it has a specific variable field assigned by the builder
        if (el.field) {
            return getVariableValue(el.field, el.content);
        }

        // Priority 2: Text content with potential handlebars (legacy/fallback)
        let text = el.content || '';
        text = text
            .replace(/{{studentName}}/g, data.studentName)
            .replace(/{{courseTitle}}/g, data.courseTitle)
            .replace(/{{completionDate}}/g, data.completionDate)
            .replace(/{{instructorName}}/g, data.instructorName)
            .replace(/{{certificateId}}/g, data.certificateId);

        return text;
    };

    return (
        <Document>
            <Page size={[width, height]} style={{ backgroundColor: '#FFFFFF', position: 'relative' }}>

                {/* Background Image */}
                {backgroundUrl && (
                    <Image
                        src={backgroundUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: backgroundFit,
                            zIndex: -1
                        }}
                        fixed
                    />
                )}

                {/* Elements */}
                {elements.map((el, index) => {
                    if (!el) return null;

                    // Handle Text, Variable, and Date Elements
                    if (el.type === 'text' || el.type === 'variable' || el.type === 'date' || !el.type) {
                        const textContent = processContent(el);
                        const styles = el.style || {};
                        const isBold = styles.fontWeight === 'bold' || (typeof styles.fontWeight === 'number' && styles.fontWeight >= 700) || String(styles.fontWeight) === '700';
                        const fontFamily = getPdfFontFamily(styles.fontFamily, isBold);

                        const viewStyle: any = {
                            position: 'absolute',
                            left: Number(el.x) || 0,
                            top: Number(el.y) || 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center', // Centers vertically in the box
                        };

                        const parseNum = (val: any) => {
                            if (val === undefined || val === null || val === 'undefined' || val === 'auto' || val === '') return undefined;
                            // Use parseFloat to handle strings like "10px" -> 10
                            const n = parseFloat(String(val));
                            return isNaN(n) ? undefined : n;
                        };

                        const opacity = parseNum(styles.opacity);
                        if (opacity !== undefined) viewStyle.opacity = opacity;

                        const width = parseNum(el.width);
                        if (width !== undefined && width > 0) viewStyle.width = width;

                        const height = parseNum(el.height);
                        if (height !== undefined && height > 0) viewStyle.height = height;

                        if (styles.backgroundColor && styles.backgroundColor !== 'transparent' && styles.backgroundColor !== 'undefined') {
                            viewStyle.backgroundColor = styles.backgroundColor;
                        }

                        const padding = parseNum(styles.padding);
                        if (padding !== undefined && padding > 0) viewStyle.padding = padding;

                        const borderRadius = parseNum(styles.borderRadius);
                        if (borderRadius !== undefined && borderRadius > 0) viewStyle.borderRadius = borderRadius;

                        const fontSize = parseNum(styles.fontSize) || 48;

                        const textStyle: any = {
                            fontSize: fontSize,
                            fontFamily: fontFamily,
                            color: styles.color && String(styles.color) !== 'undefined' ? styles.color : '#000000',
                            textAlign: styles.textAlign && String(styles.textAlign) !== 'undefined' ? styles.textAlign : 'left',
                            width: '100%', // ensure text takes full width of the container for textAlign
                        };

                        return (
                            <View key={el.id || index} style={viewStyle}>
                                <Text style={textStyle}>
                                    {textContent}
                                </Text>
                            </View>
                        );
                    }

                    // Handle Image Elements (Logos, Signatures)
                    if (el.type === 'image' && el.content) {
                        const parseNumImg = (val: any) => {
                            if (val === undefined || val === null || val === 'undefined' || val === 'auto' || val === '') return undefined;
                            const n = parseFloat(String(val));
                            return isNaN(n) ? undefined : n;
                        };

                        const imgStyle: any = {
                            position: 'absolute',
                            left: Number(el.x) || 0,
                            top: Number(el.y) || 0,
                        };

                        const opacity = parseNumImg(el.style?.opacity);
                        if (opacity !== undefined) imgStyle.opacity = opacity;

                        const width = parseNumImg(el.width);
                        if (width !== undefined && width > 0) imgStyle.width = width;

                        const height = parseNumImg(el.height);
                        if (height !== undefined && height > 0) imgStyle.height = height;

                        return (
                            <Image
                                key={el.id || index}
                                src={el.content}
                                style={imgStyle}
                            />
                        );
                    }

                    return null;
                })}
            </Page>
        </Document>
    );
};
