'use client';

import React from 'react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-[10px]">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seaman Profile</h1>
                <p className="mt-2 text-gray-500">Manage your personal information, rank, and service records</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                  Export CV
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[10px] py-6 space-y-6">
        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-800 to-blue-600 relative">
            <div className="absolute right-4 top-4 text-white/80 text-sm font-mono">
              ID: ML-2024-8892
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-xl p-1 shadow-md">
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-500">
                      AM
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white" title="Active Status">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">Alex Mercer</h2>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 mr-2">Chief Officer</span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Singapore, SG
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Sea Time</div>
                  <div className="font-bold text-gray-900 text-lg">4y 8m</div>
                </div>
                <div className="w-px bg-gray-200 h-10"></div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Last Vessel</div>
                  <div className="font-bold text-gray-900 text-lg">LNG Carrier</div>
                </div>
                <div className="w-px bg-gray-200 h-10"></div>
                <div className="text-center">
                  <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Next Availability</div>
                  <div className="font-bold text-green-600 text-lg">Immediate</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Contact Information</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    alex.mercer@grandline.com
                  </li>
                  <li className="flex items-center text-gray-700">
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +65 9123 4567
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Documents</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Seaman Book</span>
                    <span className="font-mono text-gray-900">SB-9982-XJ</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">Passport</span>
                    <span className="font-mono text-gray-900">E12345678</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-600">SID</span>
                    <span className="font-mono text-gray-900">SG-88291</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Performance Metrics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Training Completion</span>
                      <span className="font-medium text-blue-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">Performance Rating</span>
                      <span className="font-medium text-green-600">4.8/5.0</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '96%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Certificates */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Certificates & Licenses</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { name: 'STCW Basic Safety Training', issue: 'Jan 15, 2024', expiry: 'Jan 14, 2029', status: 'Valid', color: 'green' },
                  { name: 'GMDSS General Operator', issue: 'Mar 10, 2023', expiry: 'Mar 09, 2028', status: 'Valid', color: 'green' },
                  { name: 'Advanced Fire Fighting', issue: 'Jun 22, 2020', expiry: 'Jun 21, 2025', status: 'Expiring Soon', color: 'yellow' },
                  { name: 'Medical First Aid', issue: 'Aug 05, 2023', expiry: 'Aug 04, 2028', status: 'Valid', color: 'green' },
                  { name: 'ECDIS Generic', issue: 'Nov 12, 2024', expiry: 'N/A', status: 'Permanent', color: 'blue' },
                ].map((cert, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 w-2 h-2 rounded-full bg-${cert.color === 'green' ? 'green-500' : cert.color === 'yellow' ? 'yellow-500' : 'blue-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Issued: {cert.issue}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${cert.color === 'green' ? 'green-100' : cert.color === 'yellow' ? 'yellow-100' : 'blue-100'} text-${cert.color === 'green' ? 'green-800' : cert.color === 'yellow' ? 'yellow-800' : 'blue-800'}`}>
                        {cert.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">Exp: {cert.expiry}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="px-6 py-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {[
                      { title: 'Completed Course', desc: 'Maritime Cyber Security Awareness', date: '2 days ago', icon: 'check' },
                      { title: 'Certificate Renewed', desc: 'Updated Medical Fitness Certificate', date: '1 week ago', icon: 'refresh' },
                      { title: 'New Assignment', desc: 'Assigned to Grand Line Express (Vessel ID: 882)', date: '2 weeks ago', icon: 'briefcase' },
                    ].map((item, idx, arr) => (
                      <li key={idx}>
                        <div className="relative pb-8">
                          {idx !== arr.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon === 'check' ? "M5 13l4 4L19 7" : item.icon === 'refresh' ? "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" : "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"} />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900 font-medium">{item.title}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time>{item.date}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Next Steps & Requirements */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Training Requirements</h3>
              <div className="space-y-4">
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Advanced Fire Fighting Refresher due in 6 months.</p>
                      </div>
                      <div className="mt-3">
                        <button className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline">
                          Book Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                   <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended</h4>
                   <p className="text-xs text-blue-700 mb-3">Leadership and Teamwork upgrade for Chief Officer promotion path.</p>
                   <div className="w-full bg-blue-200 rounded-full h-1.5 mb-2">
                     <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                   </div>
                   <span className="text-xs text-blue-600 font-medium">1/3 Modules Completed</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
               <div className="px-6 py-4 border-b border-gray-100">
                 <h3 className="font-semibold text-gray-900">System Status</h3>
               </div>
               <div className="p-6 space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Account Status</span>
                   <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Verified</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Medical Status</span>
                   <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Fit for Duty</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600">Visa Readiness</span>
                   <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">US/EU Valid</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
