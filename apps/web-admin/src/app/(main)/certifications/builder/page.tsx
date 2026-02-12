'use client';

import React, { useState } from 'react';
import {
    Plus, Save, Award,
    Type, Image as ImageIcon, Calendar,
    GripVertical, Settings, Eye
} from '@/components/ui/IconWrapper';

export default function CertificateBuilderPage() {

    // const [selectedElement, setSelectedElement] = useState<string | null>(null);

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Certificate Builder</h1>
                    <p className="text-gray-500 text-sm">Design and customize your certificate templates</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </button>
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors">
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                    </button>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Tools */}
                <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Elements</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <Type className="h-6 w-6 text-gray-600 mb-2" />
                                <span className="text-xs font-medium text-gray-700">Text</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <ImageIcon className="h-6 w-6 text-gray-600 mb-2" />
                                <span className="text-xs font-medium text-gray-700">Image</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <Calendar className="h-6 w-6 text-gray-600 mb-2" />
                                <span className="text-xs font-medium text-gray-700">Date</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                                <Award className="h-6 w-6 text-gray-600 mb-2" />
                                <span className="text-xs font-medium text-gray-700">Badge</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Dynamic Fields</h3>
                        <div className="space-y-2">
                            {['Student Name', 'Course Name', 'Completion Date', 'Instructor Name', 'Certificate ID'].map((field) => (
                                <div key={field} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-sm transition-all group">
                                    <GripVertical className="h-4 w-4 text-gray-400 mr-2 group-hover:text-blue-500" />
                                    <span className="text-sm text-gray-700 font-medium">{'{{ ' + field + ' }}'}</span>
                                    <Plus className="h-4 w-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Canvas */}
                <div className="flex-1 bg-gray-100 p-8 overflow-auto flex items-center justify-center relative">
                    {/* Canvas Area */}
                    <div className="bg-white shadow-2xl w-[800px] h-[566px] relative flex flex-col items-center justify-center border border-gray-200">
                        {/* Decorative Borders */}
                        <div className="absolute inset-4 border-4 border-double border-gray-200 pointer-events-none"></div>
                        <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-blue-900"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-blue-900"></div>

                        {/* Sample Content */}
                        <div className="text-center z-10 space-y-8 max-w-2xl px-8">
                            <div className="flex justify-center mb-4">
                                <Award className="h-20 w-20 text-blue-600" />
                            </div>
                            <h1 className="text-5xl font-serif text-gray-900 tracking-wide">CERTIFICATE <br /><span className="text-3xl font-sans font-normal text-gray-600 mt-2 block">OF COMPLETION</span></h1>
                            <p className="text-gray-500 text-lg">This is to certify that</p>

                            <div className="border-b-2 border-gray-300 w-full pb-2">
                                <span className="text-4xl font-serif text-blue-900 italic px-8 py-2 bg-blue-50/50 rounded-lg border border-dashed border-blue-200">
                                    {'{{ Student Name }}'}
                                </span>
                            </div>

                            <p className="text-gray-500 text-lg">has successfully completed the course</p>

                            <div className="pb-2">
                                <h3 className="text-2xl font-bold text-gray-800">{'{{ Course Name }}'}</h3>
                            </div>

                            <div className="flex justify-between w-full pt-12 px-12">
                                <div className="text-center">
                                    <div className="h-0.5 w-40 bg-gray-400 mb-2"></div>
                                    <p className="text-sm font-medium text-gray-600">Date</p>
                                </div>
                                <div className="text-center">
                                    <div className="h-0.5 w-40 bg-gray-400 mb-2"></div>
                                    <p className="text-sm font-medium text-gray-600">Instructor Signature</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Properties */}
                <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Properties</h3>
                    </div>

                    <div className="p-4 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                            <input type="text" defaultValue="Standard Completion V1" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button className="px-3 py-2 bg-blue-50 border border-blue-500 text-blue-700 rounded-md text-sm font-medium">Landscape</button>
                                <button className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50">Portrait</button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                            <div className="grid grid-cols-5 gap-2">
                                <div className="h-8 w-8 rounded-full bg-white border border-gray-300 cursor-pointer ring-2 ring-offset-2 ring-blue-500"></div>
                                <div className="h-8 w-8 rounded-full bg-slate-50 border border-gray-300 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-gray-400"></div>
                                <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-blue-400"></div>
                                <div className="h-8 w-8 rounded-full bg-amber-50 border border-amber-100 cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-amber-400"></div>
                                <button className="h-8 w-8 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-200">
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Typography</h4>
                            <div className="space-y-3">
                                <select className="w-full border-gray-300 rounded-md text-sm">
                                    <option>Merriweather (Serif)</option>
                                    <option>Inter (Sans)</option>
                                    <option>Playfair Display</option>
                                </select>
                                <div className="flex gap-2">
                                    <button className="p-2 border border-gray-300 rounded bg-gray-100"><Settings className="h-4 w-4" /></button>
                                    <input type="number" defaultValue={48} className="w-full border-gray-300 rounded-md text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
