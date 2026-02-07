'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LearnerProgressTab } from './components/LearnerProgressTab';
import { CoursePerformanceTab } from './components/CoursePerformanceTab';
import { FinancialTab } from './components/FinancialTab';
import { ComplianceTab } from './components/ComplianceTab';
import { CustomReportBuilderTab } from './components/CustomReportBuilderTab';
import { FileText, TrendingUp, DollarSign, Shield, Users, Plus } from '@/components/ui/IconWrapper';

function ReportsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'learner';

    const tabs = [
        { id: 'learner', label: 'Learner Progress', icon: Users },
        { id: 'performance', label: 'Course Performance', icon: TrendingUp },
        { id: 'financial', label: 'Financial Reports', icon: DollarSign },
        { id: 'compliance', label: 'Compliance Reports', icon: Shield },
        { id: 'custom', label: 'Custom Report Builder', icon: Plus },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'learner': return <LearnerProgressTab />;
            case 'performance': return <CoursePerformanceTab />;
            case 'financial': return <FinancialTab />;
            case 'compliance': return <ComplianceTab />;
            case 'custom': return <CustomReportBuilderTab />;
            default: return <LearnerProgressTab />;
        }
    };

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/reports?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
                    <p className="text-gray-600 mt-1">Advanced analytics and reporting for your organization</p>
                </div>
            </div>

            {/* Enterprise Tabs */}
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

export default function ReportsPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading reports...</div>}>
            <ReportsContent />
        </Suspense>
    );
}
