import React from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  status: string;
  progressPercentage: number;
  lastAccessedAt: string;
  courseId: string;
  courseTitle: string;
  courseCode: string;
  thumbnailUrl: string | null;
}

interface MyCourseGridProps {
  courses: Course[];
}

export const MyCourseGrid: React.FC<MyCourseGridProps> = ({ courses }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Current Courses</h2>
          <Link href={"/portal/courses" as any} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
            View All
            <i className="fa fa-chevron-right ml-1 text-xs"></i>
          </Link>
        </div>
      </div>
      <div className="p-6">
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors group">
                <div className="flex items-center min-w-0">
                  <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} alt={course.courseTitle} className="w-full h-full object-cover" />
                    ) : (
                      <i className="fa fa-book text-gray-400"></i>
                    )}
                  </div>
                  <div className="ml-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{course.courseTitle}</h3>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${course.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {course.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{course.courseCode}</p>
                  </div>
                </div>
                <div className="ml-4 text-right flex-shrink-0 w-32 hidden sm:block">
                  <div className="flex items-center justify-end mb-1">
                    <span className="text-sm font-bold text-gray-900 mr-2">{course.progressPercentage}%</span>
                    <span className="text-xs text-gray-400">Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${course.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa fa-book-open text-gray-300 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">You're not enrolled in any courses yet.</h3>
            <p className="text-gray-500 mb-6">Browse our catalog to start your learning journey.</p>
            <Link
              href={"/courses" as any}
              className="inline-flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
