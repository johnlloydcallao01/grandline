'use client';

import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal, BookOpen, Clock, Users, Star, BarChart3, Edit, Eye, Trash2 } from '@/components/ui/IconWrapper';

export default function CoursesPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
                    <p className="text-gray-600 mt-1">Manage, edit, and publish your courses</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Course
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex gap-3">
                    <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white">
                        <option>Status: All</option>
                        <option>Published</option>
                        <option>Draft</option>
                        <option>Archived</option>
                    </select>
                    <select className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white">
                        <option>Category: All</option>
                        <option>Web Development</option>
                        <option>Design</option>
                        <option>Business</option>
                    </select>
                </div>
            </div>

            {/* Courses Grid/List */}
            <div className="grid grid-cols-1 gap-4">
                {[
                    { title: 'React Fundamentals', category: 'Web Development', status: 'Published', students: 1245, rating: 4.8, lastUpdated: 'Oct 24, 2024' },
                    { title: 'Advanced TypeScript', category: 'Web Development', status: 'Published', students: 850, rating: 4.9, lastUpdated: 'Oct 10, 2024' },
                    { title: 'UI/UX Design Masterclass', category: 'Design', status: 'Draft', students: 0, rating: 0, lastUpdated: 'Today' },
                    { title: 'Digital Marketing 101', category: 'Business', status: 'Archived', students: 3200, rating: 4.5, lastUpdated: 'Sep 15, 2023' },
                ].map((course, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-shadow">
                        {/* Thumbnail Placeholder */}
                        <div className="w-full md:w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {course.category}
                                </span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${course.status === 'Published' ? 'bg-green-100 text-green-800' :
                                        course.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {course.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{course.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                                <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {course.students} Students
                                </span>
                                <span className="flex items-center">
                                    <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
                                    {course.rating > 0 ? course.rating : 'N/A'}
                                </span>
                                <span className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    Updated {course.lastUpdated}
                                </span>
                            </div>
                        </div>

                        <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                            <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </button>
                            <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
