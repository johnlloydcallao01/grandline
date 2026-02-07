'use client';

import React, { useState } from 'react';
import { Search, Plus, Folder, File, ChevronDown, CheckCircle, MoreHorizontal, Edit, Trash2 } from '@/components/ui/IconWrapper';

export default function CourseCategoriesPage() {
    const [categories, setCategories] = useState([
        {
            id: 1, name: 'Web Development', count: 12, subcategories: [
                { id: 11, name: 'Frontend', count: 8 },
                { id: 12, name: 'Backend', count: 4 }
            ]
        },
        {
            id: 2, name: 'Data Science', count: 8, subcategories: [
                { id: 21, name: 'Machine Learning', count: 5 },
                { id: 22, name: 'Data Visualization', count: 3 }
            ]
        },
        {
            id: 3, name: 'Design', count: 15, subcategories: [
                { id: 31, name: 'UI/UX', count: 10 },
                { id: 32, name: 'Graphic Design', count: 5 }
            ]
        },
        { id: 4, name: 'Business', count: 20, subcategories: [] },
    ]);

    const [expanded, setExpanded] = useState<number[]>([1, 2, 3]);

    const toggleExpand = (id: number) => {
        if (expanded.includes(id)) {
            setExpanded(expanded.filter(catId => catId !== id));
        } else {
            setExpanded([...expanded, id]);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Categories</h1>
                    <p className="text-gray-600 mt-1">Organize your course catalog structure</p>
                </div>
                <button className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Category
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hierarchy</h3>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider w-32 text-right">Courses</div>
                </div>
                <div className="divide-y divide-gray-200">
                    {categories.map((category) => (
                        <div key={category.id}>
                            <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 group">
                                <div className="flex items-center flex-1">
                                    <button
                                        onClick={() => toggleExpand(category.id)}
                                        className="mr-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    >
                                        <ChevronDown className={`h-4 w-4 transform transition-transform ${expanded.includes(category.id) ? '' : '-rotate-90'}`} />
                                    </button>
                                    <Folder className="h-5 w-5 text-blue-500 mr-3" />
                                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                    <div className="ml-4 opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-opacity">
                                        <button className="text-gray-400 hover:text-blue-600" title="Edit">
                                            <Edit className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="text-gray-400 hover:text-red-600" title="Delete">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button className="text-gray-400 hover:text-green-600" title="Add Subcategory">
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 w-32 text-right">{category.count}</div>
                            </div>

                            {/* Subcategories */}
                            {expanded.includes(category.id) && category.subcategories.length > 0 && (
                                <div className="bg-gray-50/50">
                                    {category.subcategories.map((sub) => (
                                        <div key={sub.id} className="pl-16 pr-6 py-3 flex items-center justify-between border-t border-gray-100 hover:bg-white">
                                            <div className="flex items-center flex-1">
                                                <div className="w-4 h-4 mr-2 border-l border-b border-gray-300 inline-block"></div>
                                                <span className="text-sm text-gray-700">{sub.name}</span>
                                                <div className="ml-4 opacity-0 group-hover:opacity-100 flex items-center space-x-2 transition-opacity">
                                                    <button className="text-gray-400 hover:text-blue-600">
                                                        <Edit className="h-3 w-3" />
                                                    </button>
                                                    <button className="text-gray-400 hover:text-red-600">
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500 w-32 text-right">{sub.count}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
