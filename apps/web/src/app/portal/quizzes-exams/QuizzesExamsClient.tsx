'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { MergedAssessment } from './actions';

interface QuizzesExamsClientProps {
    initialAssessments: MergedAssessment[];
}

export default function QuizzesExamsClient({ initialAssessments }: QuizzesExamsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Default to 'All' unless a specific status is provided in the URL
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const statusParam = searchParams.get('status');
        if (statusParam) {
            const formattedStatus = statusParam.charAt(0).toUpperCase() + statusParam.slice(1).toLowerCase();

            if (['All', 'Pending', 'In_progress', 'Completed', 'Passed', 'Failed'].includes(formattedStatus)) {
                setFilterStatus(formattedStatus);
            } else {
                setFilterStatus('All');
            }
        } else {
            setFilterStatus('All');
        }
    }, [searchParams]);

    const handleFilterChange = (newStatus: string) => {
        setFilterStatus(newStatus);

        if (newStatus === 'All') {
            router.push('/portal/quizzes-exams');
        } else {
            router.push(`/portal/quizzes-exams?status=${newStatus.toLowerCase()}`);
        }
    };

    const filteredAssessments = useMemo(() => {
        return initialAssessments.filter((assessment) => {
            if (filterStatus === 'All') return true;
            if (filterStatus === 'Pending' && assessment.status === 'pending') return true;
            if (filterStatus === 'In_progress' && assessment.status === 'in_progress') return true;
            if (filterStatus === 'Completed' && (assessment.status === 'submitted' || assessment.status === 'graded')) return true;
            if (filterStatus === 'Passed' && assessment.isPassed === true) return true;
            if (filterStatus === 'Failed' && assessment.isPassed === false) return true;
            return false;
        });
    }, [initialAssessments, filterStatus]);

    const summary = useMemo(() => {
        return {
            pending: initialAssessments.filter(a => a.status === 'pending').length,
            inProgress: initialAssessments.filter(a => a.status === 'in_progress').length,
            completed: initialAssessments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
            passed: initialAssessments.filter(a => a.isPassed === true).length,
            failed: initialAssessments.filter(a => a.isPassed === false).length,
        };
    }, [initialAssessments]);

    const getStatusBadge = (assessment: MergedAssessment) => {
        if (assessment.status === 'graded' || assessment.status === 'submitted') {
            if (assessment.isPassed === true) {
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">Passed</span>;
            } else if (assessment.isPassed === false) {
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">Failed</span>;
            }
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-50 text-gray-700 border-gray-200">Completed</span>;
        }

        if (assessment.status === 'in_progress') {
            return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">In Progress</span>;
        }

        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">Pending</span>;
    };

    const getAssessmentTypeTooltip = (type: string) => {
        switch (type) {
            case 'quiz': return 'A standard module quiz.';
            case 'exam': return 'A major module exam.';
            case 'final': return 'The final comprehensive exam for the course.';
            default: return 'Course assessment.';
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="w-full px-[10px] py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Quizzes & Exams</h1>
                            <p className="mt-1 text-sm text-gray-500">Track and manage your course assessments</p>

                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                <button
                                    onClick={() => handleFilterChange('All')}
                                    className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'All' ? 'font-bold' : ''}`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-gray-400"></span>
                                    <span className="text-gray-700">{initialAssessments.length} All</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange('Pending')}
                                    className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Pending' ? 'font-bold' : ''}`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                                    <span className="text-gray-700">{summary.pending} Pending</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange('In_progress')}
                                    className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'In_progress' ? 'font-bold' : ''}`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    <span className="text-gray-700">{summary.inProgress} In Progress</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange('Completed')}
                                    className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Completed' ? 'font-bold' : ''}`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                                    <span className="text-gray-700">{summary.completed} Completed</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange('Passed')}
                                    className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Passed' ? 'font-bold' : ''}`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span className="text-gray-700">{summary.passed} Passed</span>
                                </button>
                                <button
                                    onClick={() => handleFilterChange('Failed')}
                                    className={`flex items-center gap-2 text-sm transition-opacity hover:opacity-80 ${filterStatus === 'Failed' ? 'font-bold' : ''}`}
                                >
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span className="text-gray-700">{summary.failed} Failed</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 self-start md:self-center">
                            <select
                                value={filterStatus}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-700 cursor-pointer"
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="In_progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="w-full px-[10px] py-8">
                <div className="space-y-4">
                    {filteredAssessments.map((assessment) => (
                        <div key={`${assessment.courseId}-${assessment.id}`} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(assessment)}
                                        <div className="relative group flex items-center">
                                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1 uppercase tracking-wide cursor-help">
                                                <i className="fa fa-tag"></i>
                                                {assessment.assessmentKind.replace('_', ' ')}
                                                <i className="fa fa-info-circle ml-1 text-gray-400"></i>
                                            </span>
                                            {/* Tooltip Popup */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center">
                                                {getAssessmentTypeTooltip(assessment.assessmentKind)}
                                                {/* Little triangle arrow pointing down */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{assessment.title}</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                            Course
                                        </span>
                                        <p className="text-sm text-blue-600 font-medium truncate max-w-sm md:max-w-md lg:max-w-lg">{assessment.courseTitle}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-4">
                                        <div className="flex items-center gap-2">
                                            <i className="fa fa-bullseye text-gray-400"></i>
                                            <span>Passing Score: {assessment.passingScore}%</span>
                                        </div>
                                        {assessment.maxAttempts && (
                                            <div className="flex items-center gap-2">
                                                <i className="fa fa-redo text-gray-400"></i>
                                                <span>Attempt: {assessment.attemptNumber} / {assessment.maxAttempts}</span>
                                            </div>
                                        )}
                                        {(assessment.status === 'graded' || assessment.status === 'submitted') && assessment.score !== null && (
                                            <div className={`flex items-center gap-2 font-medium ${assessment.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                                                <i className={`fa ${assessment.isPassed ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                                <span>Score: {Math.round(assessment.score)}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 self-start md:self-center">
                                    <Link
                                        href={assessment.assessmentKind === 'final'
                                            ? `/portal/courses/${assessment.courseId}/player/assessment/${assessment.assessmentSlug}`
                                            : `/portal/courses/${assessment.courseId}/player/module/${assessment.moduleSlug}/assessment/${assessment.assessmentSlug}`
                                        }
                                        className={`px-4 py-2 font-medium rounded-lg transition-colors text-sm flex items-center gap-2 ${assessment.status === 'pending' || assessment.status === 'in_progress'
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {assessment.status === 'pending' || assessment.status === 'in_progress' ? (
                                            <>
                                                <i className="fa fa-edit"></i> {assessment.status === 'in_progress' ? 'Continue Assessment' : 'Start Assessment'}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa fa-eye"></i> View Results
                                            </>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredAssessments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <i className="fa fa-clipboard-check text-gray-400 text-xl"></i>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No assessments found</h3>
                        <p className="text-gray-500 max-w-sm mt-1">
                            You don't have any quizzes or exams matching the selected filter.
                        </p>
                        <button
                            onClick={() => handleFilterChange('All')}
                            className="mt-4 text-blue-600 font-medium hover:underline"
                        >
                            Clear filter
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}