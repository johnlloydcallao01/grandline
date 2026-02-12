'use client';

import React, { useState } from 'react';
import {
    Shield, Key, RefreshCw, Smartphone,
    CheckCircle
} from '@/components/ui/IconWrapper';

export default function SecuritySettingsPage() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

    return (
        <div className="p-6 space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
                <p className="text-gray-600 mt-1">Manage security preferences and access controls</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Two-Factor Authentication */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mr-3">
                                <Smartphone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Two-Factor Authentication</h3>
                                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    {twoFactorEnabled && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100 flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-900">2FA is currently enabled</p>
                                <p className="text-sm text-green-700 mt-1">Your account allows login via Authenticator App.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Password Policy */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center mb-4">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600 mr-3">
                            <Key className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Password Policy</h3>
                            <p className="text-sm text-gray-500">Configuration for user passwords</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Minimum Length</span>
                            <span className="text-sm font-medium text-gray-900">8 Characters</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <span className="text-sm text-gray-700">Require Special Character</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-sm text-gray-700">Password Expiry</span>
                            <span className="text-sm font-medium text-gray-900">90 Days</span>
                        </div>
                    </div>
                </div>

                {/* Backup & Recovery */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600 mr-3">
                                <RefreshCw className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Backup & Recovery</h3>
                                <p className="text-sm text-gray-500">Manage system backups and data snapshots</p>
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
                            Configure Backups
                        </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Last Successful Backup</p>
                                <p className="text-xs text-gray-500 mt-1">Oct 24, 2024 at 02:00 AM</p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Success
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
