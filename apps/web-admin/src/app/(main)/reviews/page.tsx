'use client';

import React from 'react';
import {
    Star, Search, Reply, Flag
} from '@/components/ui/IconWrapper';

export default function ReviewsPage() {
    const reviews = [
        {
            id: 1,
            user: 'Sarah Jenkins',
            course: 'React Fundamentals',
            rating: 5,
            date: '2 hours ago',
            comment: 'Absolutely arguably the best React course I have taken. The explanations are clear and the projects are very practical. Highly recommended for beginners!',
            reply: null
        },
        {
            id: 2,
            user: 'Michael Chen',
            course: 'Advanced TypeScript',
            rating: 4,
            date: '1 day ago',
            comment: 'Great content, but I felt the section on Generics moved a bit too fast. innovative nonetheless.',
            reply: 'Thanks for the feedback Michael! We are actually planning to expand the Generics module next month.'
        },
        {
            id: 3,
            user: 'Emma Wilson',
            course: 'UI/UX Design',
            rating: 5,
            date: '3 days ago',
            comment: 'The instructor is amazing! I learned so much about Figma in just a few weeks.',
            reply: null
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Feedback & Reviews</h1>
                    <p className="text-gray-600 mt-1">Monitor course ratings and student feedback</p>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Average Rating</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
                                <div className="flex text-yellow-400">
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">1,254</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Response Rate</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">92%</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Replies</p>
                        <h3 className="text-2xl font-bold text-amber-600 mt-1">14</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm top-0 sticky z-10">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Courses</option>
                        <option>React Fundamentals</option>
                        <option>Advanced TypeScript</option>
                        <option>UI/UX Design</option>
                    </select>
                    <select className="border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option>All Ratings</option>
                        <option>5 Stars</option>
                        <option>4 Stars</option>
                        <option>3 Stars</option>
                        <option>2 Stars</option>
                        <option>1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mr-3 font-bold">
                                    {review.user.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">{review.user}</h3>
                                    <p className="text-xs text-gray-500">{review.course}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{review.date}</span>
                        </div>

                        <div className="mb-4">
                            <div className="flex text-yellow-400 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i}>
                                        <Star className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                                    </span>
                                ))}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                        </div>

                        {review.reply && (
                            <div className="ml-4 mb-4 pl-4 border-l-2 border-gray-200 bg-gray-50 p-3 rounded-r-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-blue-600">Instructor Team</span>
                                    <span className="text-xs text-gray-400">Replied 2 days ago</span>
                                </div>
                                <p className="text-xs text-gray-600">{review.reply}</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex gap-4">
                                <button className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors">
                                    <Reply className="h-3.5 w-3.5 mr-1" />
                                    Reply
                                </button>
                                <button className="flex items-center text-xs text-gray-500 hover:text-red-600 transition-colors">
                                    <Flag className="h-3.5 w-3.5 mr-1" />
                                    Report
                                </button>
                            </div>
                            {!review.reply && (
                                <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
                                    Mark as Resolved
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


