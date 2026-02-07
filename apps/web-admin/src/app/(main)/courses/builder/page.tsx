'use client';

import React, { useState } from 'react';
import { Settings, BookOpen, Eye, Upload, Save, Plus, Trash2, Edit, FileText, Image, Video, File, ChevronDown } from '@/components/ui/IconWrapper';

export default function CourseBuilderPage() {
    const [activeTab, setActiveTab] = useState('settings');

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Course Builder</h1>
                    <p className="text-gray-600 mt-1">Create and structure your course content</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Course
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                    {[
                        { id: 'settings', label: 'Course Settings', icon: Settings },
                        { id: 'modules', label: 'Curriculum & Modules', icon: BookOpen },
                        { id: 'publish', label: 'Publishing', icon: Upload },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                                ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            <tab.icon className={`h-4 w-4 mr-2 ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[500px]">
                {activeTab === 'settings' && (
                    <div className="p-8 max-w-3xl">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                                <input type="text" className="w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500" placeholder="e.g. Advanced React Patterns" defaultValue="New Course" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500 h-32" placeholder="Describe what students will learn..." defaultValue="Describe what students will learn..."></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select className="w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500">
                                        <option>Web Development</option>
                                        <option>Design</option>
                                        <option>Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                                    <select className="w-full border-gray-300 rounded-lg px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                <span>Upload a file</span>
                                                <input type="file" className="sr-only" />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                                <div className="flex items-center gap-4">
                                    <label className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center cursor-pointer">
                                        <input type="radio" name="pricing" className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" defaultChecked />
                                        <span className="ml-3 font-medium text-gray-900">Free</span>
                                    </label>
                                    <label className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center cursor-pointer">
                                        <input type="radio" name="pricing" className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                        <span className="ml-3 font-medium text-gray-900">Paid</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'modules' && (
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Course Structure</h3>
                            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Section
                            </button>
                        </div>

                        {/* Builder Interface */}
                        <div className="space-y-4">
                            {/* Section 1 */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="mr-3 text-gray-400 text-sm"><ChevronDown className="h-4 w-4" /></span>
                                        <span className="font-medium text-gray-900">Section 1: Introduction</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                                        <button className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2 bg-white">
                                    {[
                                        { type: 'video', title: 'Welcome to the Course', icon: Video, time: '5:20' },
                                        { type: 'text', title: 'Course Prerequisites', icon: FileText, time: '2:00' },
                                        { type: 'file', title: 'Download Course Resources', icon: File, time: '0:00' },
                                    ].map((lesson, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer">
                                            <div className="flex items-center">
                                                <lesson.icon className="h-4 w-4 text-gray-400 mr-3" />
                                                <span className="text-sm text-gray-700">{lesson.title}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{lesson.time}</span>
                                        </div>
                                    ))}
                                    <button className="w-full py-2 border border-dashed border-gray-300 rounded text-sm text-blue-600 hover:bg-blue-50 mt-2 flex items-center justify-center">
                                        <Plus className="h-4 w-4 mr-1" /> Add Lesson
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'publish' && (
                    <div className="p-8 max-w-2xl mx-auto text-center">
                        <div className="bg-green-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                            <Upload className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Publish?</h3>
                        <p className="text-gray-600 mb-8">
                            Your course has passed all quality checks. Once published, it will be visible to students enrolled in the course.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
                            <h4 className="font-medium text-gray-900 mb-4">Pre-publish Checklist</h4>
                            <ul className="space-y-3">
                                {['Course landing page details', 'Curriculum completeness', 'Video quality check', 'Pricing settings'].map((item, idx) => (
                                    <li key={idx} className="flex items-center text-sm text-gray-600">
                                        <div className="h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                                            <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <button className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700">
                            Publish Course Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
