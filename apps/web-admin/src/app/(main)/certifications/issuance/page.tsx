'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Send, CheckCircle, AlertCircle, FileCheck, Info, Search, ChevronDown, Check, X } from 'lucide-react';
import type { EligibleEnrollment } from '@encreasl/cms-types';
import { getEligibleEnrollments } from './actions';

export default function CertificateIssuancePage() {
    const [enrollments, setEnrollments] = useState<EligibleEnrollment[]>([]);
    const [selectedEnrollment, setSelectedEnrollment] = useState<EligibleEnrollment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const comboboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchEnrollments = useCallback(async (search?: string) => {
        if (search === undefined) {
            setIsLoading(true);
        } else {
            setIsSearching(true);
        }
        try {
            const data = await getEligibleEnrollments(search ? { search } : {});
            setEnrollments(data);
        } catch (e: any) {
            console.error('Error fetching enrollments:', e);
            setMessage({ type: 'error', text: 'Failed to load eligible enrollments.' });
        } finally {
            setIsLoading(false);
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchEnrollments(query);
        }, 300);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, fetchEnrollments]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (enrollment: EligibleEnrollment) => {
        if (!enrollment.hasTemplate) return;

        setSelectedEnrollmentId(enrollment.id.toString());
        setSelectedEnrollment(enrollment);
        setQuery(`${enrollment.studentName} - ${enrollment.courseTitle}`);
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedEnrollmentId('');
        setSelectedEnrollment(null);
        setQuery('');
        setIsOpen(true);
        inputRef.current?.focus();
    };

    const handleInputChange = (value: string) => {
        setQuery(value);
        setIsOpen(true);
        if (value === '') {
            setSelectedEnrollmentId('');
            setSelectedEnrollment(null);
        }
    };

    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('Processing...');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEnrollmentId) return;

        setIsSubmitting(true);
        setMessage(null);
        setProgress(0);
        setProgressMessage('Initiating...');

        try {
            const enrollment = selectedEnrollment;
            if (!enrollment) throw new Error('Enrollment not found');

            if (!enrollment.hasTemplate) {
                throw new Error('This course does not have a Certificate Template assigned. Please assign one in the Courses collection first.');
            }

            const response = await fetch('/api/proxy-issuance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrollmentId: enrollment.id }),
            });

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: true });

                const lines = chunkValue.split('\n').filter(line => line.trim() !== '');

                for (const line of lines) {
                    let data: any = null
                    try {
                        data = JSON.parse(line);

                        if (data.error) {
                            throw new Error(data.message || 'Server error occurred');
                        }

                        if (data.progress) {
                            flushSync(() => {
                                setProgress(data.progress);
                                if (data.message) setProgressMessage(data.message);
                            });
                        }

                        if (data.success) {
                            setMessage({ type: 'success', text: 'Certificate successfully issued!' });
                            setSelectedEnrollmentId('');
                            setSelectedEnrollment(null);
                            setQuery('');
                            fetchEnrollments();
                        }
                    } catch (parseError) {
                        console.warn('Error parsing stream chunk:', parseError);
                    }

                    if (data?.progress) {
                        await new Promise((r) => setTimeout(r, 0))
                    }
                }
            }

        } catch (e: any) {
            setProgress(0);
            setMessage({ type: 'error', text: e.message || 'An error occurred during issuance.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                if (progress >= 100) setProgress(0);
            }, 3000);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-[var(--background)] py-6 md:py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-[var(--card-border)] pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Certificate Issuance</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manually verify and issue certificates for completed course enrollments.</p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
                    <Info className="w-5 h-5" />
                    <span className="font-medium text-sm">System Ready</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                Issuance Details
                            </h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {enrollments.length} eligible enrollment{enrollments.length !== 1 ? 's' : ''} found
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            {message && (
                                <div className={`p-4 rounded-lg mb-8 flex items-start gap-3 shadow-sm ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'}`}>
                                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                                    <div className="text-sm font-medium">{message.text}</div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label htmlFor="enrollment-combobox" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Select Eligible Course Enrollment
                                    </label>

                                    <div className="relative" ref={comboboxRef}>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <input
                                                ref={inputRef}
                                                id="enrollment-combobox"
                                                type="text"
                                                className="block w-full pl-10 pr-10 py-3 text-base text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-xl leading-5 bg-white dark:bg-[var(--card-background)] placeholder-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
                                                placeholder="Search by student name or course title..."
                                                value={query}
                                                onChange={(event) => handleInputChange(event.target.value)}
                                                onFocus={() => setIsOpen(true)}
                                                autoComplete="off"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                                                {selectedEnrollmentId ? (
                                                    <div onClick={handleClear} className="cursor-pointer">
                                                        <X className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setIsOpen(!isOpen);
                                                            if (!isOpen) inputRef.current?.focus();
                                                        }}
                                                    >
                                                        <ChevronDown className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {isOpen && (
                                            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-[var(--card-background)] shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                {isLoading ? (
                                                    <div className="relative cursor-default select-none py-4 px-4 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 dark:border-gray-400 mr-2"></div>
                                                        Loading...
                                                    </div>
                                                ) : enrollments.length === 0 ? (
                                                    <div className="relative cursor-default select-none py-4 px-4 text-gray-500 dark:text-gray-400 text-center">
                                                        {isSearching ? 'Searching...' : 'No enrollments found.'}
                                                    </div>
                                                ) : (
                                                    enrollments.map((enc) => {
                                                        const studentName = enc.studentName;
                                                        const hasTemplate = enc.hasTemplate;
                                                        const isSelected = selectedEnrollmentId === enc.id.toString();

                                                        return (
                                                            <div
                                                                key={enc.id}
                                                                className={`cursor-pointer select-none relative py-3 pl-4 pr-9 border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                                                                    !hasTemplate ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-900 dark:text-gray-100 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                                }`}
                                                                onClick={() => !hasTemplate ? null : handleSelect(enc)}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className={`block truncate ${isSelected ? 'font-semibold' : 'font-normal'}`}>
                                                                        {studentName} — {enc.courseTitle || 'Unknown Course'}
                                                                    </span>
                                                                    {!hasTemplate && (
                                                                        <span className="text-xs text-red-400 dark:text-red-500 italic mt-0.5">
                                                                            (No Template Assigned)
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {isSelected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                                                                        <Check className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
                                        Type to search, then click to select.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !selectedEnrollmentId || enrollments.length === 0}
                                        className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-3"></div>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5 mr-2" />
                                                Issue Certificate Now
                                            </>
                                        )}
                                    </button>
                                </div>
                                {isSubmitting && (
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-4">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">{Math.round(progress)}% — {progressMessage}</p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {selectedEnrollment && (
                        <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm overflow-hidden ring-4 ring-blue-50/50 dark:ring-blue-900/20">
                            <div className="bg-blue-50/80 dark:bg-blue-900/30 p-4 border-b border-blue-100 dark:border-blue-800">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm uppercase tracking-wider">Selection Summary</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Student</label>
                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        {selectedEnrollment.studentName}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Course</label>
                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{selectedEnrollment.courseTitle}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Completion Date</label>
                                    <div className="text-base text-gray-700 dark:text-gray-300">
                                        {selectedEnrollment.completedAt ? new Date(selectedEnrollment.completedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                                    </div>
                                </div>

                                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                                        <CheckCircle className="w-4 h-4" />
                                        Ready for issuance
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-[var(--card-background)] rounded-xl border border-gray-200 dark:border-[var(--card-border)] shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Issuance Process</h3>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-4">
                                {[
                                    { title: 'Validation', desc: 'Checks if the student passed and has no existing certificate.' },
                                    { title: 'Generation', desc: 'Creates a PDF using the assigned template and student data.' },
                                    { title: 'Storage', desc: 'Saves the certificate record and PDF file to the database.' },
                                    { title: 'Notification', desc: 'Updates the enrollment status to "Certificate Issued".' }
                                ].map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-100 dark:border-blue-800">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
