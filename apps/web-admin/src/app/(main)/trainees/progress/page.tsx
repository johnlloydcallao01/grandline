'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { IndividualProgressTab } from './components/IndividualProgressTab';
import { CourseCompletionTab } from './components/CourseCompletionTab';
import { AssessmentResultsTab } from './components/AssessmentResultsTab';
import { TimeSpentTab } from './components/TimeSpentTab';
import { User, CheckCircle, FileText, Clock } from '@/components/ui/IconWrapper';

function TraineeProgressContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'individual';

    const tabs = [
        { id: 'individual', label: 'Individual Progress', icon: User },
        { id: 'completion', label: 'Course Completion', icon: CheckCircle },
        { id: 'assessments', label: 'Assessment Results', icon: FileText },
        { id: 'time', label: 'Time Spent', icon: Clock },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'individual': return <IndividualProgressTab />;
            case 'completion': return <CourseCompletionTab />;
            case 'assessments': return <AssessmentResultsTab />;
            case 'time': return <TimeSpentTab />;
            default: return <IndividualProgressTab />;
        }
    };

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/trainees/progress?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trainee Progress</h1>
                    <p className="text-gray-600 mt-1">Monitor learning activities, scores, and completion rates</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                            ${isActive
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                        `}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="py-4">
                {renderContent()}
            </div>
        </div>
    );
}

export default function TraineeProgressPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading progress...</div>}>
            <TraineeProgressContent />
        </Suspense>
    );
}
