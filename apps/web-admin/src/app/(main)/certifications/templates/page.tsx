'use client';

import React from 'react';
import {
    Plus, Search, MoreHorizontal, LayoutTemplate,
    Edit, Trash2, Copy, Eye
} from '@/components/ui/IconWrapper';

export default function CertificateTemplatesPage() {
    const templates = [
        { id: 1, name: 'Standard Professional', category: 'General', lastModified: '2 days ago', status: 'Active', thumb: 'bg-blue-50 border-blue-200' },
        { id: 2, name: 'Technical Certification', category: 'Tech', lastModified: '1 week ago', status: 'Active', thumb: 'bg-slate-50 border-slate-200' },
        { id: 3, name: 'Workshop Completion', category: 'Events', lastModified: '3 weeks ago', status: 'Draft', thumb: 'bg-amber-50 border-amber-200' },
        { id: 4, name: 'Excellence Award', category: 'Awards', lastModified: '1 month ago', status: 'Active', thumb: 'bg-indigo-50 border-indigo-200' },
        { id: 5, name: 'Bootcamp Graduate', category: 'Tech', lastModified: '2 months ago', status: 'Archived', thumb: 'bg-emerald-50 border-emerald-200' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Certificate Templates</h1>
                    <p className="text-gray-600 mt-1">Manage designs for your course certificates</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Template
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Categories</option>
                        <option>General</option>
                        <option>Tech</option>
                        <option>Events</option>
                    </select>
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Draft</option>
                        <option>Archived</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {templates.map((template) => (
                    <div key={template.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                        {/* Thumbnail Placeholder */}
                        <div className={`aspect-[4/3] ${template.thumb} flex items-center justify-center relative border-b border-gray-100`}>
                            <LayoutTemplate className="h-16 w-16 text-black/10" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                                <button className="p-2 bg-white rounded-full shadow-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all">
                                    <Eye className="h-5 w-5" />
                                </button>
                                <button className="p-2 bg-white rounded-full shadow-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all">
                                    <Edit className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="absolute top-3 right-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                    ${template.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        template.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-gray-100 text-gray-600'}`}>
                                    {template.status}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{template.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{template.category}</p>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <span>Modified {template.lastModified}</span>
                                <div className="flex gap-2">
                                    <button title="Duplicate" className="hover:text-gray-600"><Copy className="h-4 w-4" /></button>
                                    <button title="Delete" className="hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* New Template Card */}
                <button className="group relative flex flex-col items-center justify-center h-full min-h-[300px] border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all p-6 text-center">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <Plus className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-700">New Template</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-[200px]">Start from scratch</p>
                </button>
            </div>
        </div>
    );
}
