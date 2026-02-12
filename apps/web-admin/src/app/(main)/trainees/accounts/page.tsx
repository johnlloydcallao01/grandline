'use client';

import React, { useState } from 'react';
import {
    Search, Filter, Download, Plus, Upload, MoreHorizontal,
    Mail, Phone, Calendar, CheckCircle, XCircle
} from '@/components/ui/IconWrapper';

export default function TraineeAccountsPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Dummy Data
    const trainees = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 (555) 123-4567', status: 'Active', joined: 'Oct 15, 2023', progress: 78, avatar: 'bg-blue-100 text-blue-600' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', phone: '+1 (555) 987-6543', status: 'Inactive', joined: 'Sep 22, 2023', progress: 45, avatar: 'bg-green-100 text-green-600' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+1 (555) 234-5678', status: 'Active', joined: 'Nov 01, 2023', progress: 12, avatar: 'bg-purple-100 text-purple-600' },
        { id: 4, name: 'Diana Ross', email: 'diana@example.com', phone: '+1 (555) 876-5432', status: 'Pending', joined: 'Nov 05, 2023', progress: 0, avatar: 'bg-yellow-100 text-yellow-600' },
        { id: 5, name: 'Evan Wright', email: 'evan@example.com', phone: '+1 (555) 345-6789', status: 'Active', joined: 'Aug 10, 2023', progress: 92, avatar: 'bg-red-100 text-red-600' },
        { id: 6, name: 'Fiona Gallagher', email: 'fiona@example.com', phone: '+1 (555) 456-7890', status: 'Active', joined: 'Jul 12, 2023', progress: 65, avatar: 'bg-gray-100 text-gray-600' },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trainee Accounts</h1>
                    <p className="text-gray-600 mt-1">Manage trainee profiles, accounts, and enrollment status</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trainee
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Filter className="h-4 w-4 mr-2" />
                        Status: All
                    </button>
                    <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Calendar className="h-4 w-4 mr-2" />
                        Joined: Any Time
                    </button>
                </div>
            </div>

            {/* Trainee Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Trainee
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Overall Progress
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Joined Date
                                </th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trainees.map((trainee) => (
                                <tr key={trainee.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${trainee.avatar}`}>
                                                {trainee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{trainee.name}</div>
                                                <div className="text-xs text-gray-500">ID: TR-{2024000 + trainee.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Mail className="h-3.5 w-3.5 mr-1.5" />
                                                {trainee.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Phone className="h-3.5 w-3.5 mr-1.5" />
                                                {trainee.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${trainee.status === 'Active' ? 'bg-green-100 text-green-800' :
                                            trainee.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {trainee.status === 'Active' && <CheckCircle className="h-3 w-3 mr-1" />}
                                            {trainee.status === 'Inactive' && <XCircle className="h-3 w-3 mr-1" />}
                                            {trainee.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="w-full max-w-xs">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-medium text-gray-700">{trainee.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${trainee.progress > 75 ? 'bg-green-500' :
                                                    trainee.progress > 40 ? 'bg-blue-500' :
                                                        'bg-yellow-500'
                                                    }`} style={{ width: `${trainee.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {trainee.joined}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 flex items-center justify-between">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">1</span> to <span className="font-medium">6</span> of <span className="font-medium">24</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    1
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    2
                                </button>
                                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    3
                                </button>
                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
