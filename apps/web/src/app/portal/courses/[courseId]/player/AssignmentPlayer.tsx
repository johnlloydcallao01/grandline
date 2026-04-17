'use client';

import React, { useState, useRef } from 'react';
import { uploadMedia } from './actions';
import { RichTextRenderer } from '@/components/RichTextRenderer';

interface AssignmentPlayerProps {
  assignment: any;
  submissions: any[];
  onSubmit: (assignmentId: string, content: string, fileIds: string[]) => Promise<any>;
}

export function AssignmentPlayer({ assignment, submissions, onSubmit }: AssignmentPlayerProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the latest non-draft submission
  let latestSubmission = submissions
    ?.filter((s) => s.status !== 'draft')
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

  // Auto-correct: If an instructor added a score but forgot to change the status dropdown to 'Graded'
  if (latestSubmission && latestSubmission.score != null && latestSubmission.status === 'submitted') {
    latestSubmission = { ...latestSubmission, status: 'graded' };
  }

  const {
    maxScore = 100,
    passingScore = 75,
    dueDate,
    submissionType = 'both',
    allowedFileTypes = [],
    attachments = [],
  } = assignment.assignmentDetails || {};

  const canUploadFile = submissionType === 'file_upload' || submissionType === 'both';
  const canEnterText = submissionType === 'text_entry' || submissionType === 'both';

  const getMediaUrl = (media: any) => {
    if (!media) return '#';
    if (media.cloudinaryURL) return media.cloudinaryURL;
    if (media.url) {
      if (media.url.startsWith('http')) return media.url;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://cms.grandlinemaritime.com/api';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      return `${baseUrl}${media.url.startsWith('/') ? '' : '/'}${media.url}`;
    }
    return '#';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (canEnterText && submissionType === 'text_entry' && !content.trim()) {
      setError('Please enter your submission text.');
      return;
    }

    if (canUploadFile && submissionType === 'file_upload' && files.length === 0) {
      setError('Please select a file to upload.');
      return;
    }

    if (submissionType === 'both' && !content.trim() && files.length === 0) {
      setError('Please enter text or upload a file.');
      return;
    }

    try {
      setIsSubmitting(true);

      const fileIds: string[] = [];

      // 1. Upload files first if any
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file);
          const uploadedDoc = await uploadMedia(formData);
          if (uploadedDoc && uploadedDoc.id) {
            fileIds.push(uploadedDoc.id);
          }
        }
      }

      // 2. Submit the assignment
      await onSubmit(assignment.id, content, fileIds);

      setSuccess(true);
      setContent('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to extract text if Lexical JSON
  const extractText = (content: any) => {
    if (typeof content === 'string') return content;
    try {
      if (content?.root?.children) {
        return content.root.children.map((c: any) => c.children?.map((child: any) => child.text).join('')).join('\n');
      }
    } catch (_e) {
      return JSON.stringify(content);
    }
    return '';
  };

  const getAcceptString = () => {
    if (!allowedFileTypes || allowedFileTypes.length === 0) return undefined;
    
    const mimeTypes: string[] = [];
    allowedFileTypes.forEach((type: string) => {
      switch (type) {
        case 'pdf': mimeTypes.push('.pdf', 'application/pdf'); break;
        case 'word': mimeTypes.push('.doc', '.docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'); break;
        case 'excel': mimeTypes.push('.xls', '.xlsx', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); break;
        case 'powerpoint': mimeTypes.push('.ppt', '.pptx', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'); break;
        case 'images': mimeTypes.push('image/*'); break;
        case 'zip': mimeTypes.push('.zip', 'application/zip', 'application/x-zip-compressed'); break;
        default: mimeTypes.push(`.${type}`);
      }
    });
    
    return mimeTypes.join(',');
  };

  const getSubmissionTypeTooltip = (type: string) => {
    switch (type) {
      case 'file_upload': return 'You must upload a file (e.g., PDF, DOCX) to complete this assignment.';
      case 'text_entry': return 'You must type your answer directly into the text box provided.';
      case 'both': return 'You can type your answer and/or upload a file to complete this assignment.';
      default: return 'Submission requirements for this assignment.';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Assignment Details</h2>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <i className="fa fa-star text-amber-500"></i> Max Score: {maxScore}
            </span>
            <span className="flex items-center gap-1">
              <i className="fa fa-check-circle text-green-500"></i> Passing Score: {passingScore}
            </span>
            {dueDate && (
              <span className="flex items-center gap-1">
                <i className="fa fa-calendar-alt text-blue-500"></i> Due: {new Date(dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative group flex items-center">
            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-semibold capitalize flex items-center cursor-help">
              {submissionType.replace('_', ' ')}
              <i className="fa fa-info-circle ml-1.5 opacity-60 text-xs"></i>
            </span>
            {/* Tooltip Popup */}
            <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs bg-gray-900 text-white text-xs rounded py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg text-center font-normal">
              {getSubmissionTypeTooltip(submissionType)}
              {/* Little triangle arrow pointing down */}
              <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Instructions</h3>
        {assignment.content ? (
          <RichTextRenderer content={assignment.content} />
        ) : (
          <p className="text-gray-500">No instructions provided.</p>
        )}
        
        {attachments && attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Attachments:</h4>
            <div className="flex flex-wrap gap-2">
              {attachments.map((att: any) => (
                <a 
                  key={att.id} 
                  href={getMediaUrl(att)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <i className="fa fa-download"></i>
                  {att.filename || 'Download File'}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {latestSubmission ? (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Submission</h3>
          
          <div className={`p-4 rounded-xl border mb-6 ${
            latestSubmission.status === 'graded' 
              ? (latestSubmission.score >= passingScore ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
              : latestSubmission.status === 'returned_for_revision'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-semibold text-gray-900 capitalize">Status: {latestSubmission.status.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-500">Submitted on {new Date(latestSubmission.submittedAt).toLocaleString()}</p>
              </div>
              {latestSubmission.status === 'graded' && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Score</p>
                  <p className={`text-2xl font-bold ${latestSubmission.score >= passingScore ? 'text-green-600' : 'text-red-600'}`}>
                    {latestSubmission.score} / {maxScore}
                  </p>
                </div>
              )}
            </div>

            {latestSubmission.feedback && (
              <div className="mt-4 pt-4 border-t border-gray-200/60">
                <p className="text-sm font-semibold text-gray-700 mb-1">Instructor Feedback:</p>
                <div className="text-sm text-gray-800 bg-white/60 p-3 rounded-lg">
                  <RichTextRenderer content={latestSubmission.feedback} />
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Submitted Content:</h4>
            {latestSubmission.submittedText && (
              <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200 mb-3">
                {extractText(latestSubmission.submittedText)}
              </div>
            )}
            
            {latestSubmission.uploadedFiles && latestSubmission.uploadedFiles.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Files:</p>
                <div className="flex flex-wrap gap-2">
                  {latestSubmission.uploadedFiles.map((file: any) => (
                    <a 
                      key={file.id} 
                      href={getMediaUrl(file)} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded text-sm text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <i className="fa fa-file"></i>
                      {file.filename || 'View File'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {(latestSubmission.status === 'returned_for_revision' || latestSubmission.status === 'draft') && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-4">You can submit a new revision below.</p>
            </div>
          )}
        </div>
      ) : null}

      {(!latestSubmission || latestSubmission.status === 'returned_for_revision') && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {latestSubmission ? 'Submit Revision' : 'Submit your work'}
          </h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              <i className="fa fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm">
              <i className="fa fa-check-circle mr-2"></i>
              Assignment submitted successfully!
            </div>
          )}

          <div className="space-y-4">
            {canEnterText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Submission</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                  placeholder="Type your answer here..."
                  disabled={isSubmitting}
                />
              </div>
            )}

            {canUploadFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Upload</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  disabled={isSubmitting}
                  accept={getAcceptString()}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Allowed types: {allowedFileTypes?.join(', ') || 'Any'}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || (!content.trim() && files.length === 0)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa fa-spinner fa-spin"></i> Submitting...
                  </>
                ) : (
                  <>
                    <i className="fa fa-paper-plane"></i> Submit Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
