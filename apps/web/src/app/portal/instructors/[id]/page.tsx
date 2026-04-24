'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RichTextRenderer } from '@/components/RichTextRenderer';

export default function InstructorProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [instructor, setInstructor] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchInstructor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/instructors/${id}`);

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Instructor not found');
          }
          throw new Error('Failed to fetch instructor details');
        }

        const data = await res.json();

        if (active) {
          setInstructor(data.instructor);
          setCourses(data.courses || []);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Failed to load instructor profile.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchInstructor();
    }

    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="w-full px-[10px] py-6">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="px-[10px] pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm animate-pulse">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
              <div className="space-y-4 text-left border-t border-gray-100 pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="mb-8">
                <div className="h-4 bg-gray-200 rounded w-1/5 mb-3"></div>
                <div className="h-12 bg-gray-200 rounded-lg w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/5 mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="w-full min-h-screen bg-gray-50 px-[10px] py-12 flex flex-col items-center">
        <div className="text-red-500 mb-4">{error || 'Instructor not found.'}</div>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">
          Go back
        </button>
      </div>
    );
  }

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

  const email = instructor.contactEmail || user.email;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header Back Button */}
      <div className="w-full px-[10px] py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors text-sm font-medium"
        >
          <i className="fa fa-arrow-left"></i>
          Back to Instructors
        </button>
      </div>

      <div className="px-[10px] pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
            <img
              src={image}
              alt={name}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{name}</h1>
            <p className="text-blue-600 font-medium mb-6">Instructor</p>

            <div className="space-y-4 text-left border-t border-gray-100 pt-6">
              {email && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <i className="fa fa-envelope text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Contact Email</p>
                    <a href={`mailto:${email}`} className="text-sm text-gray-900 hover:text-blue-600 break-all">{email}</a>
                  </div>
                </div>
              )}

              {instructor.officeHours && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <i className="fa fa-clock-o text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Office Hours</p>
                    <p className="text-sm text-gray-900">{instructor.officeHours}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <i className="fa fa-briefcase text-sm"></i>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Experience</p>
                  <p className="text-sm text-gray-900">{instructor.yearsExperience ? `${instructor.yearsExperience} Years` : 'N/A'}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                const uId = String(user.id || user);
                const fallbackId = uId !== '[object Object]' ? uId : String(instructor.id);
                router.push(`/portal/ask-instructor?instructorId=${fallbackId}`);
              }}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Talk with Me
            </button>
          </div>
        </div>

        {/* Right Column: Details & Courses */}
        <div className="lg:col-span-2 space-y-8">

          {/* About Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fa fa-user text-blue-600"></i> About {user.firstName || 'Instructor'}
            </h2>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Specialization</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                {instructor.specialization || 'Not specified'}
              </p>
            </div>

            {instructor.certifications && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Certifications</h3>
                <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {typeof instructor.certifications === 'string' ? (
                    <p className="whitespace-pre-line">{instructor.certifications}</p>
                  ) : (
                    <RichTextRenderer content={instructor.certifications} />
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Biography</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {user.biography ? (
                  <RichTextRenderer content={user.biography} />
                ) : (
                  <p>No biography available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Taught Courses Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <i className="fa fa-graduation-cap text-blue-600"></i> Courses Taught
            </h2>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => (
                  <Link href={`/view-course/${course.id}` as any} key={course.id} className="group block">
                    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all bg-gray-50 group-hover:bg-white h-full flex flex-col">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {course.shortDescription || 'No description provided.'}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
                        <span>{course.level || 'All Levels'}</span>
                        <span className="text-blue-600 group-hover:underline">View Course &rarr;</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500">No courses available for this instructor at the moment.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}