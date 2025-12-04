'use client';

import React, { useState } from 'react';

// Mock data for assignments
const ASSIGNMENTS = [
  {
    id: 1,
    title: 'Passage Planning Exercise',
    course: 'Navigation & Safety',
    dueDate: '2025-12-15',
    status: 'Pending',
    description: 'Create a detailed passage plan from Singapore to Rotterdam using provided charts and publications.',
    points: 100,
    type: 'Project',
  },
  {
    id: 2,
    title: 'Engine Room Log Analysis',
    course: 'Marine Engineering',
    dueDate: '2025-12-10',
    status: 'Submitted',
    description: 'Analyze the provided engine room log entries and identify potential efficiency improvements.',
    points: 50,
    type: 'Case Study',
  },
  {
    id: 3,
    title: 'ISPS Code Case Study',
    course: 'Maritime Security',
    dueDate: '2025-12-05',
    status: 'Late',
    description: 'Review the security incident case study and propose corrective actions based on ISPS Code.',
    points: 75,
    type: 'Report',
  },
  {
    id: 4,
    title: 'GMDSS Communication Simulation',
    course: 'Communication',
    dueDate: '2025-12-20',
    status: 'Pending',
    description: 'Complete the distress communication simulation scenario and submit the transcript.',
    points: 60,
    type: 'Simulation',
  },
  {
    id: 5,
    title: 'Fire Safety Equipment Inspection',
    course: 'Safety',
    dueDate: '2025-12-01',
    status: 'Graded',
    description: 'Conduct a virtual inspection of fire safety equipment and report findings.',
    points: 40,
    grade: '38/40',
    type: 'Inspection',
  },
];

export default function AssignmentsPage() {
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredAssignments = ASSIGNMENTS.filter(assignment => 
    filterStatus === 'All' || assignment.status === filterStatus
  );

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-[10px] py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
              <p className="mt-1 text-sm text-gray-500">Track and manage your course tasks and projects</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-gray-700 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Submitted">Submitted</option>
                <option value="Graded">Graded</option>
                <option value="Late">Late</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[10px] py-8">
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      assignment.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      assignment.status === 'Submitted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      assignment.status === 'Graded' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {assignment.status}
                    </span>
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <i className="fa fa-tag"></i>
                      {assignment.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{assignment.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-3">{assignment.course}</p>
                  <p className="text-sm text-gray-600 mb-4 max-w-3xl">{assignment.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <i className="fa fa-calendar-alt text-gray-400"></i>
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fa fa-star text-gray-400"></i>
                      <span>{assignment.points} Points</span>
                    </div>
                    {assignment.grade && (
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <i className="fa fa-check-circle"></i>
                        <span>Grade: {assignment.grade}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  {assignment.status === 'Pending' || assignment.status === 'Late' ? (
                    <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2">
                      <i className="fa fa-upload"></i>
                      Submit Work
                    </button>
                  ) : (
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                      <i className="fa fa-eye"></i>
                      View Submission
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <i className="fa fa-clipboard-check text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="text-gray-500 max-w-sm mt-1">
              You don't have any assignments matching the selected filter.
            </p>
            <button 
              onClick={() => setFilterStatus('All')}
              className="mt-4 text-blue-600 font-medium hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
