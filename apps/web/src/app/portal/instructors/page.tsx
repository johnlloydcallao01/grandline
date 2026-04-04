'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InstructorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        let userIdParam: string | null = null;
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('grandline_auth_user_trainee');
            if (raw) {
              const parsed = JSON.parse(raw) as { id?: string | number } | null;
              const value = parsed && parsed.id;
              if (value !== undefined && value !== null) {
                userIdParam = String(value);
              }
            }
          } catch {
            // ignore
          }
        }

        if (!userIdParam) {
          if (active) {
            setError('Please log in to view your instructors.');
            setLoading(false);
          }
          return;
        }

        const res = await fetch(`/api/instructors/enrolled?userId=${userIdParam}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Failed to fetch instructors');
        }

        const data = await res.json();

        if (active) {
          setInstructors(data.instructors || []);
        }
      } catch (err) {
        if (active) {
          setError('Failed to load instructors.');
          console.error(err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchInstructors();
    return () => { active = false; };
  }, []);

  const filteredInstructors = instructors.filter(instructor => {
    const user = instructor.user || {};
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    const spec = instructor.specialization || '';

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
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
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full px-[10px] py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 rounded-full bg-gray-200 shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2 mt-6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg h-16"></div>
                  <div className="p-2 bg-gray-100 rounded-lg h-16"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex justify-center py-12 text-red-500">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInstructors.map((instructor) => {
                const user = instructor.user || {};
                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown Instructor';

                let image = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
                if (user.profilePicture && typeof user.profilePicture === 'object') {
                  if (user.profilePicture.cloudinaryURL) {
                    image = user.profilePicture.cloudinaryURL.replace(/[`'"]/g, '').trim();
                  } else if (user.profilePicture.url) {
                    image = user.profilePicture.url.startsWith('http')
                      ? user.profilePicture.url
                      : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://cms.grandlinemaritime.com'}${user.profilePicture.url}`;
                  }
                }

                const title = 'Instructor'; // Could add role logic if available
                const status = 'Available';

                return (
                  <div key={instructor.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={image}
                          alt={name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div>
                          <h3 className="font-bold text-gray-900">{name}</h3>
                          <p className="text-sm text-blue-600 font-medium">{title}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                            <i className="fa fa-envelope"></i>
                            <span>{instructor.contactEmail || user.email || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${status === 'Available' ? 'bg-green-50 text-green-700' :
                        status === 'In Class' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-6 line-clamp-2 min-h-[40px]">
                      {instructor.specialization || 'No specialization specified.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-900">{instructor.yearsExperience || 0}</div>
                        <div className="text-xs text-gray-500">Years Exp</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-900 line-clamp-1">{instructor.officeHours || 'Flexible'}</div>
                        <div className="text-xs text-gray-500">Office Hours</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/portal/instructors/${instructor.id}` as any} className="flex-1 text-center px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm block">
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredInstructors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fa fa-user-slash text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No instructors found</h3>
                <p className="text-gray-500 max-w-sm mt-1">
                  {instructors.length === 0
                    ? "You are not enrolled in any courses with assigned instructors yet."
                    : "Try adjusting your search or filters to find what you're looking for."}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); }}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
