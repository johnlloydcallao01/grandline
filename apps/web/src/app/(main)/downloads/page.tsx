'use client';

import React from 'react';

export default function DownloadsPage() {
  const sections = [
    {
      title: 'Software & Simulators',
      description: 'Essential tools for your training exercises.',
      items: [
        {
          id: 1,
          name: 'ECDIS Simulator Demo v2.4',
          version: 'v2.4.1',
          size: '1.2 GB',
          platform: 'Windows',
          updated: '2023-12-05',
        },
        {
          id: 2,
          name: 'GMDSS Trainer Client',
          version: 'v1.0.5',
          size: '450 MB',
          platform: 'Windows / Mac',
          updated: '2023-11-20',
        },
      ],
    },
    {
      title: 'Handbooks & Manuals',
      description: 'Official company and maritime regulation handbooks.',
      items: [
        {
          id: 3,
          name: 'Company Safety Management System (SMS) Manual',
          version: 'Rev 12.0',
          size: '15 MB',
          platform: 'PDF',
          updated: '2024-01-10',
        },
        {
          id: 4,
          name: 'Seafarer Employment Agreement (SEA) Template',
          version: '2024 Edition',
          size: '250 KB',
          platform: 'DOCX',
          updated: '2024-01-01',
        },
        {
          id: 5,
          name: 'Medical Guide for Ships',
          version: '3rd Edition',
          size: '22 MB',
          platform: 'PDF',
          updated: '2023-06-15',
        },
      ],
    },
    {
      title: 'Forms & Checklists',
      description: 'Standardized forms for operational use.',
      items: [
        {
          id: 6,
          name: 'Pre-Departure Checklist',
          version: 'v3.0',
          size: '150 KB',
          platform: 'PDF',
          updated: '2023-09-01',
        },
        {
          id: 7,
          name: 'Incident Report Form',
          version: 'v2.1',
          size: '180 KB',
          platform: 'PDF',
          updated: '2023-09-01',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="w-full px-[10px]">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Downloads Center</h1>
            <p className="mt-1 text-sm text-gray-500">
              Download software, manuals, and official forms for offline use.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full px-[10px] py-8 space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{section.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{section.description}</p>
            </div>
            <ul className="divide-y divide-gray-200">
              {section.items.map((item) => (
                <li key={item.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150 flex items-center justify-between">
                  <div className="flex items-center min-w-0 gap-x-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {item.platform === 'Windows' || item.platform === 'Windows / Mac' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
                        <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-600 font-mono">
                          {item.version}
                        </span>
                        <span>•</span>
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>Updated {item.updated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center ml-4">
                     <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                     </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
