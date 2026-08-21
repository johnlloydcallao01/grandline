'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
    Search, FileCheck, CheckCircle, AlertCircle,
    Calendar, User, XCircle, Clock, Link as LinkIcon
} from '@/components/ui/IconWrapper';
import { verifyCertificate } from '../actions';
import type { CertificateVerificationResult } from '@encreasl/cms-types';
import Image from 'next/image';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function CertificateVerificationPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { siteName, logoUrl } = useSiteSettings();

    const codeFromUrl = params.code as string | undefined;
    const codeFromQuery = searchParams.get('code');

    const [searchQuery, setSearchQuery] = useState('');
    const [result, setResult] = useState<CertificateVerificationResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Auto-verify if code is in URL (for QR code links)
    useEffect(() => {
        const code = codeFromUrl || codeFromQuery;
        if (code && !result && !loading) {
            verifyCode(code);
        }
    }, [codeFromUrl, codeFromQuery, result, loading]);

    const verifyCode = async (code: string) => {
        setLoading(true);
        setResult(null);
        try {
            const data = await verifyCertificate(code);
            setResult(data);
            // Update URL to clean verification URL if we came from query param
            if (codeFromQuery && !codeFromUrl) {
                router.replace(`/certifications/verification/${encodeURIComponent(code)}`);
            }
        } catch {
            setResult({ verified: false, error: 'Something went wrong. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        await verifyCode(searchQuery.trim());
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                    </span>
                );
            case 'revoked':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Revoked
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Expired
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (date: string | null | undefined) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const currentCode = codeFromUrl || codeFromQuery || searchQuery;
    const [shareUrl, setShareUrl] = useState('');

    useEffect(() => {
        if (currentCode) {
            setShareUrl(`${window.location.origin}/certifications/verification/${encodeURIComponent(currentCode)}`);
        } else {
            setShareUrl('');
        }
    }, [currentCode]);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="relative w-24 h-24 mx-auto mb-6">
                    <Image
                        src={logoUrl || "/calsiter-inc-logo.png"}
                        alt={`${siteName || 'Grandline Maritime'} Logo`}
                        fill
                        sizes="96px"
                        className="object-contain"
                        priority
                    />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
                <p className="text-gray-600 mt-3 max-w-lg mx-auto">
                    Verify the authenticity of any certificate issued by Grandline.
                    Enter the unique certificate ID or scan the QR code on the document.
                </p>
            </div>

            {/* Search Box */}
            {!currentCode || !result?.verified ? (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <label htmlFor="cert-id" className="sr-only">Certificate ID</label>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileCheck className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="cert-id"
                                className="block w-full pl-10 pr-4 py-4 border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg text-gray-900 placeholder-gray-500"
                                placeholder="e.g. CERT-2026-ABCD-1234"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="py-4 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    Verify Now
                                    <Search className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            ) : null}

            {/* Results */}
            {result && result.verified && result.certificate && (
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden animate-in fade-in"
                     style={{ borderColor: result.certificate.status === 'active' ? '#86efac' : result.certificate.status === 'revoked' ? '#fca5a5' : '#fde047' }}>
                    <div className={`px-6 py-4 border-b flex items-center ${
                        result.certificate.status === 'active'
                            ? 'bg-green-50'
                            : result.certificate.status === 'revoked'
                                ? 'bg-red-50'
                                : 'bg-yellow-50'
                    }`}>
                        {result.certificate.status === 'active' ? (
                            <CheckCircle className="h-6 w-6 text-green-600 mr-3 shrink-0" />
                        ) : result.certificate.status === 'revoked' ? (
                            <XCircle className="h-6 w-6 text-red-600 mr-3 shrink-0" />
                        ) : (
                            <Clock className="h-6 w-6 text-yellow-600 mr-3 shrink-0" />
                        )}
                        <h3 className={`text-lg font-bold ${
                            result.certificate.status === 'active'
                                ? 'text-green-800'
                                : result.certificate.status === 'revoked'
                                    ? 'text-red-800'
                                    : 'text-yellow-800'
                        }`}>
                            {result.certificate.status === 'active' && 'Valid Certificate Found'}
                            {result.certificate.status === 'revoked' && 'Certificate Revoked'}
                            {result.certificate.status === 'expired' && 'Certificate Expired'}
                        </h3>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Supplied To</p>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                            <User className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-900">{result.trainee?.fullName || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">Student ID: {result.trainee?.srn || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Course</p>
                                    <p className="text-lg font-medium text-gray-900">{result.course?.title || 'N/A'}</p>
                                    {result.course?.code && (
                                        <p className="text-sm text-gray-500">Course Code: {result.course.code}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
                                    <div className="flex items-center text-gray-900">
                                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-lg font-medium">{formatDate(result.certificate.issueDate)}</span>
                                    </div>
                                </div>
                                {result.certificate.expiryDate && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Expiry Date</p>
                                        <div className="flex items-center text-gray-900">
                                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                            <span className="text-lg font-medium">{formatDate(result.certificate.expiryDate)}</span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                    {getStatusBadge(result.certificate.status)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                                    <p className="font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded inline-block border border-gray-200">
                                        {result.certificate.certificateCode}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Share/QR Section */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Share Verification</p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                {shareUrl && (
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3 flex-1">
                                        <LinkIcon className="h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={shareUrl}
                                            className="bg-transparent border-none outline-none text-sm text-gray-700 font-mono flex-1"
                                            aria-label="Verification URL"
                                        />
                                        <button
                                            onClick={() => navigator.clipboard.writeText(shareUrl)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result && !result.verified && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-8 flex flex-col items-center text-center animate-in fade-in">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-800">Certificate Not Found</h3>
                    <p className="text-red-600 mt-2 max-w-md">
                        {result.error || `We could not find a valid certificate with the ID "${currentCode}".`}
                    </p>
                    <p className="text-red-500 mt-4 text-sm">
                        Please double-check the ID and try again, or contact support if you believe this is an error.
                    </p>
                </div>
            )}
        </div>
    );
}