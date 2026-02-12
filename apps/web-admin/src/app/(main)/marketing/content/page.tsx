'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    PenTool, Folder, Plus, Search,
    MoreHorizontal,
    Calendar, User, Eye, MessageSquare
} from '@/components/ui/IconWrapper';

export default function ContentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') || 'posts';

    const handleTabChange = (tabId: string) => {
        const params = new URLSearchParams(Array.from(searchParams.entries()));
        params.set('tab', tabId);
        router.push(`/marketing/content?${params.toString()}`);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
                    <p className="text-gray-600 mt-1">Manage blog posts and content categories</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Write New Post
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'posts', label: 'Blog Posts', icon: PenTool },
                        { id: 'categories', label: 'Categories', icon: Folder },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`
                                flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'posts' && <BlogPostsList />}
                {activeTab === 'categories' && <CategoriesList />}
            </div>
        </div>
    );
}

function BlogPostsList() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Categories</option>
                        <option>News</option>
                        <option>Tutorials</option>
                        <option>Updates</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: 'Top 10 Learning Strategies', author: 'Jane Doe', date: 'Oct 24, 2024', status: 'Published', views: '1.2k', comments: 45, category: 'Tutorials' },
                    { title: 'Platform Update: v2.0 Released', author: 'Admin', date: 'Oct 20, 2024', status: 'Published', views: '3.4k', comments: 12, category: 'Updates' },
                    { title: 'Instructor Spotlight: Sarah Jenkins', author: 'John Smith', date: '-', status: 'Draft', views: '-', comments: 0, category: 'News' },
                ].map((post, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                            <span className="text-gray-400 text-sm">Featured Image Placeholder</span>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{post.category}</span>
                                <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="h-4 w-4" /></button>
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">{post.title}</h3>
                            <div className="flex items-center text-xs text-gray-500 mb-4 space-x-3">
                                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {post.author}</span>
                                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {post.date}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs text-gray-500">
                                <div className="flex space-x-3">
                                    <span className="flex items-center"><Eye className="h-3 w-3 mr-1" /> {post.views}</span>
                                    <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-1" /> {post.comments}</span>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full font-medium ${post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {post.status}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CategoriesList() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden max-w-4xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Post Categories</h3>
                <button className="text-sm text-blue-600 font-medium hover:underline">+ Add Category</button>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {[
                        { name: 'Tutorials', slug: 'tutorials', count: 12 },
                        { name: 'News', slug: 'news', count: 8 },
                        { name: 'Updates', slug: 'updates', count: 5 },
                        { name: 'Events', slug: 'events', count: 2 },
                    ].map((cat, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center">
                                <Folder className="h-4 w-4 mr-2 text-gray-400" />
                                {cat.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{cat.slug}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-bold">{cat.count}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                    <button className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
