'use client';

import React from 'react';
import { HardDrive, Settings, AlertCircle, Save } from '@/components/ui/IconWrapper';

export default function StorageSettingsPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Storage Settings</h1>
                <p className="text-gray-600 mt-1">Manage storage usage and file limits</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Storage Usage Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg mr-4">
                            <HardDrive className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Storage Usage</h2>
                            <p className="text-sm text-gray-500">75% of total storage used</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Overall Progress */}
                        <div>
                            <div className="flex justify-between text-sm font-medium mb-2">
                                <span className="text-gray-700">Total Used</span>
                                <span className="text-blue-600">750 GB / 1 TB</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                                <div className="bg-blue-600 h-4 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Storage Breakdown</h3>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">Videos</span>
                                        <span className="text-gray-900 font-medium">450 GB (60%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">Images</span>
                                        <span className="text-gray-900 font-medium">150 GB (20%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">Documents & Others</span>
                                        <span className="text-gray-900 font-medium">150 GB (20%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-gray-400 h-2 rounded-full" style={{ width: '20%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 flex items-start">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-yellow-700">
                                You are approaching your storage limit. Consider upgrading your plan or cleaning up old files to ensure uninterrupted service.
                            </p>
                        </div>
                    </div>
                </div>

                {/* File Limits Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-gray-50 rounded-lg mr-4">
                            <Settings className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">File Size Limits</h2>
                            <p className="text-sm text-gray-500">Configure maximum file upload sizes</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Video Size (MB)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                                defaultValue="500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Maximum size for video uploads (MP4, MOV)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Image Size (MB)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                                defaultValue="10"
                            />
                            <p className="mt-1 text-xs text-gray-500">Maximum size for image uploads (JPG, PNG)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Document Size (MB)</label>
                            <input
                                type="number"
                                className="w-full border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                                defaultValue="25"
                            />
                            <p className="mt-1 text-xs text-gray-500">Maximum size for PDFs and documents</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
