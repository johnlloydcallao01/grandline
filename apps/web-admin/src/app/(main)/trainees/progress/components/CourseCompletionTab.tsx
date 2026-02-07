'use client';

import React from 'react';
import { CheckCircle, Users } from '@/components/ui/IconWrapper';

export function CourseCompletionTab() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'React Fundamentals', completed: 145, enrolled: 200, rate: 72 },
                    { title: 'Advanced TypeScript', completed: 89, enrolled: 150, rate: 59 },
                    { title: 'UI/UX Design', completed: 210, enrolled: 220, rate: 95 },
                    { title: 'Python for Beginners', completed: 300, enrolled: 450, rate: 66 },
                    { title: 'Data Science 101', completed: 50, enrolled: 100, rate: 50 },
                    { title: 'Cybersecurity Basics', completed: 420, enrolled: 430, rate: 97 },
                ].map((course, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-full">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2 truncate" title={course.title}>{course.title}</h4>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{course.enrolled} Enrolled</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-3xl font-bold text-gray-900">{course.rate}%</span>
                                <span className="text-xs text-gray-500 mb-1">{course.completed} Completed</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${course.rate > 80 ? 'bg-green-500' : course.rate > 50 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${course.rate}%` }}></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
