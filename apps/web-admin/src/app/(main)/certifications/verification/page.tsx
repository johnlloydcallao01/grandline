'use client';

import React, { useState } from 'react';
import {
    Search, FileCheck, CheckCircle, AlertCircle,
    Shield, ExternalLink, Calendar, User
} from '@/components/ui/IconWrapper';

export default function CertificateVerificationPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [verificationResult, setVerificationResult] = useState<'success' | 'not-found' | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock verification logic
        if (searchQuery.length > 5) {
            setVerificationResult('success');
        } else if (searchQuery.length > 0) {
            setVerificationResult('not-found');
        } else {
            setVerificationResult(null);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-6">
                    <Shield className="h-10 w-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Certificate Verification</h1>
                <p className="text-gray-600 mt-3 max-w-lg mx-auto">
                    Verify the authenticity of any certificate issued by Grandline.
                    Enter the unique certificate ID found at the bottom of the document.
                </p>
            </div>

            {/* Search Box */}
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
                            className="block w-full pl-10 pr-4 py-4 border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 text-lg placeholder-gray-400"
                            placeholder="e.g. GL-2024-8392-XJ9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="py-4 px-8 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
                    >
                        Verify Now
                        <Search className="h-5 w-5 ml-2" />
                    </button>
                </form>
            </div>

            {/* Results */}
            {verificationResult === 'success' && (
                <div className="bg-white rounded-2xl shadow-sm border border-green-200 overflow-hidden animation-fade-in">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex items-center">
                        <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                        <h3 className="text-lg font-bold text-green-800">Valid Certificate Found</h3>
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
                                            <p className="text-xl font-bold text-gray-900">Alice Johnson</p>
                                            <p className="text-sm text-gray-500">Student ID: 882910</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Course</p>
                                    <p className="text-lg font-medium text-gray-900">Advanced React Patterns & Performance</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
                                    <div className="flex items-center text-gray-900">
                                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-lg font-medium">October 24, 2024</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Certificate ID</p>
                                    <p className="font-mono text-gray-600 bg-gray-50 px-3 py-1 rounded inline-block border border-gray-200">
                                        {searchQuery}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                                View Original Document
                                <ExternalLink className="h-4 w-4 ml-2" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {verificationResult === 'not-found' && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-8 flex flex-col items-center text-center animation-fade-in">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-red-800">Certificate Not Found</h3>
                    <p className="text-red-600 mt-2 max-w-md">
                        We could not find a valid certificate with the ID "{searchQuery}".
                        Please double-check the ID and try again, or contact support if you believe this is an error.
                    </p>
                </div>
            )}
        </div>
    );
}
