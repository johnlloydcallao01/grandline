import React, { useState, useEffect } from 'react';

interface StatStripProps {
  stats?: {
    activeCoursesCount: number;
    completedCoursesCount: number;
    activeAvgGrade: number;
    certificatesCount: number;
  };
}

const AnimatedNumber: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}{suffix}</span>;
};

export const StatStrip: React.FC<StatStripProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Courses</p>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={stats?.activeCoursesCount || 0} />
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i className="fa fa-book text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={stats?.completedCoursesCount || 0} />
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i className="fa fa-check-circle text-green-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Average Grade</p>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={stats?.activeAvgGrade || 0} suffix="%" />
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i className="fa fa-star text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Certificates</p>
            <p className="text-2xl font-bold text-gray-900">
              <AnimatedNumber value={stats?.certificatesCount || 0} />
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i className="fa fa-certificate text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
};
