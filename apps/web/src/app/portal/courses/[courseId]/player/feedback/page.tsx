'use client';

import React, { useState } from 'react';
import { useCoursePlayer } from '../CoursePlayerContext';
import { FeedbackFormRenderer } from '../FeedbackFormRenderer';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const { course, hasSubmittedFeedback, setHasSubmittedFeedback } = useCoursePlayer();
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  if (!course || !course.feedbackForm || typeof course.feedbackForm !== 'object') {
    return (
      <div className="p-8 text-center text-gray-500">
        This course does not have a feedback form assigned.
      </div>
    );
  }

  const handleSuccess = async () => {
    setIsSuccess(true);
    setHasSubmittedFeedback(true);
    
    // We optionally mark the course as completed here if they submitted it 
    // during the final finish flow, but since it's a standalone page, 
    // the user might still need to hit "Finish Course". 
    // We'll let the user decide when to actually finish it via the header button, 
    // or we can auto-complete it. Let's just show a success state for the form itself.
  };

  const handleCancel = () => {
    // If they skip, send them back to the course overview or first module
    router.push(`/portal/courses/${course.id}/player` as any);
  };

  if (isSuccess || hasSubmittedFeedback) {
    return (
      <div className="mx-[10px] py-6 md:py-8 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <i className="fa fa-check text-green-600 text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank you for your feedback!</h2>
        <p className="text-gray-600 mb-8 max-w-lg">
          Your responses have been recorded successfully. Your feedback helps us continuously improve the quality of our courses.
        </p>
        <button
          onClick={() => router.push(`/portal/courses/${course.id}/player` as any)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Course
        </button>
      </div>
    );
  }

  return (
    <div className="mx-[10px] py-6 md:py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 text-purple-600 mb-2">
          <i className="fa fa-comment-dots text-xl"></i>
          <span className="font-bold uppercase tracking-wider text-sm">Course Feedback</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {course.feedbackForm.title || 'Course Feedback'}
        </h1>
        <p className="text-gray-500">
          Please take a moment to evaluate your experience in <span className="font-semibold text-gray-700">{course.title}</span>.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
        <FeedbackFormRenderer
          courseId={course.id as string}
          form={course.feedbackForm}
          isFeedbackRequired={course.isFeedbackRequired || false}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}