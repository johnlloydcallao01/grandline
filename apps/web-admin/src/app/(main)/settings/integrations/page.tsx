'use client';

import React from 'react';
import {
    CreditCard, Video, Server, Database,
    Plus, Settings
} from '@/components/ui/IconWrapper';

export default function IntegrationsPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
                    <p className="text-gray-600 mt-1">Manage third-party services and API connections</p>
                </div>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Gateways */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                        Payment Gateways
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Stripe', status: 'Connected', description: 'Credit card processing' },
                            { name: 'PayPal', status: 'Connected', description: 'Digital wallet payments' },
                        ].map((gateway, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{gateway.name}</h4>
                                    <p className="text-xs text-gray-500">{gateway.description}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 mr-3">
                                        {gateway.status}
                                    </span>
                                    <button className="text-gray-400 hover:text-blue-600"><Settings className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Video Conferencing */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Video className="h-5 w-5 mr-2 text-gray-500" />
                        Video Conferencing
                    </h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Zoom', status: 'Connected', description: 'Live classes and webinars' },
                            { name: 'Microsoft Teams', status: 'Disconnected', description: 'Corporate meetings' },
                        ].map((app, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{app.name}</h4>
                                    <p className="text-xs text-gray-500">{app.description}</p>
                                </div>
                                <div className="flex items-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-3 ${app.status === 'Connected' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {app.status}
                                    </span>
                                    <button className="text-gray-400 hover:text-blue-600"><Settings className="h-4 w-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* API Access */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Server className="h-5 w-5 mr-2 text-gray-500" />
                        API Access
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between mb-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Production API Key</p>
                            <p className="text-xs font-mono text-gray-500 mt-1">pk_live_••••••••••••••••••••••••</p>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Regenerate</button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-900">Webhook Endpoint</p>
                            <p className="text-xs font-mono text-gray-500 mt-1">https://api.encreasl.com/webhooks/v1</p>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
