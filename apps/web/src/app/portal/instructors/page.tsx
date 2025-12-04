'use client';

import React, { useState } from 'react';

// Mock data for instructors
const INSTRUCTORS = [
  {
    id: 1,
    name: 'Capt. James Wilson',
    title: 'Master Mariner',
    specialization: 'Navigation & Safety',
    experience: '20+ Years',
    courses: 12,
    students: 4500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    status: 'Available',
    location: 'London, UK',
    bio: 'Experienced Master Mariner with extensive background in VLCC operations and maritime safety training.',
  },
  {
    id: 2,
    name: 'Chief Eng. Sarah Chen',
    title: 'Class 1 Engineer',
    specialization: 'Propulsion Systems',
    experience: '15+ Years',
    courses: 8,
    students: 3200,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    status: 'In Class',
    location: 'Singapore',
    bio: 'Specialist in modern propulsion systems and high voltage safety. Former Technical Superintendent.',
  },
  {
    id: 3,
    name: 'Capt. Robert Johnson',
    title: 'Senior Instructor',
    specialization: 'ECDIS & Bridge Ops',
    experience: '18 Years',
    courses: 15,
    students: 5100,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    status: 'Available',
    location: 'Rotterdam, NL',
    bio: 'Expert in ECDIS type-specific training and integrated bridge systems. Certified simulator instructor.',
  },
  {
    id: 4,
    name: 'Ms. Elena Rodriguez',
    title: 'Maritime Linguist',
    specialization: 'Maritime English',
    experience: '10 Years',
    courses: 5,
    students: 8900,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    status: 'Away',
    location: 'Barcelona, ES',
    bio: 'Specialized in SMCP and communication training for multi-national crews.',
  },
  {
    id: 5,
    name: 'Chief Eng. Michael Brown',
    title: 'Technical Director',
    specialization: 'Automation & Control',
    experience: '25+ Years',
    courses: 6,
    students: 1200,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    status: 'Available',
    location: 'Dubai, UAE',
    bio: 'Leading expert in marine automation systems and electrical troubleshooting.',
  },
  {
    id: 6,
    name: 'Capt. David Miller',
    title: 'Security Consultant',
    specialization: 'ISPS & Piracy',
    experience: '22 Years',
    courses: 9,
    students: 2800,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    status: 'In Class',
    location: 'Miami, USA',
    bio: 'Former naval officer turned maritime security consultant and lead auditor.',
  },
];

export default function InstructorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredInstructors = INSTRUCTORS.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          instructor.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || instructor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-[10px] py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
              <p className="mt-1 text-sm text-gray-500">Connect with industry experts and mentors</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Find instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <i className="fa fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-700 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="In Class">In Class</option>
                <option value="Away">Away</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[10px] py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredInstructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={instructor.image} 
                    alt={instructor.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900">{instructor.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{instructor.title}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <i className="fa fa-map-marker-alt"></i>
                      <span>{instructor.location}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  instructor.status === 'Available' ? 'bg-green-50 text-green-700' :
                  instructor.status === 'In Class' ? 'bg-amber-50 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {instructor.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[40px]">
                {instructor.bio}
              </p>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">{instructor.rating}</div>
                  <div className="text-xs text-gray-500">Rating</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">{instructor.courses}</div>
                  <div className="text-xs text-gray-500">Courses</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="text-sm font-bold text-gray-900">{instructor.experience}</div>
                  <div className="text-xs text-gray-500">Exp</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  View Profile
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredInstructors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa fa-user-slash text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No instructors found</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button 
              onClick={() => {setSearchQuery(''); setFilterStatus('All');}}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
