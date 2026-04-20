'use client';

import React, { useState } from 'react';
import { submitFeedbackForm } from './actions';

interface FeedbackFormRendererProps {
  courseId: string;
  form: any;
  isFeedbackRequired?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function FeedbackFormRenderer({ courseId, form, isFeedbackRequired, onSuccess, onCancel }: FeedbackFormRendererProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (fieldName: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleMatrixChange = (matrixName: string, rowValue: string, colValue: string) => {
    setResponses((prev) => {
      const matrixResponses = prev[matrixName] || {};
      return {
        ...prev,
        [matrixName]: {
          ...matrixResponses,
          [rowValue]: colValue,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitFeedbackForm({
        courseId,
        formId: form.id,
        responses,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!form || !form.fields) {
    return <div className="text-gray-500">No feedback form available.</div>;
  }

  return (
    <div className="bg-white rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{form.title}</h2>
        {form.description && <p className="text-gray-600 mt-2 text-sm">{form.description}</p>}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-3">
          <i className="fa fa-exclamation-circle mt-0.5"></i>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {form.fields.map((block: any, index: number) => {
          if (block.blockType === 'textInput') {
            return (
              <div key={block.id || index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {block.label} {block.isRequired && <span className="text-red-500">*</span>}
                </label>
                {block.format === 'textarea' ? (
                  <textarea
                    required={block.isRequired}
                    placeholder={block.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows={4}
                    value={responses[block.name] || ''}
                    onChange={(e) => handleInputChange(block.name, e.target.value)}
                  />
                ) : (
                  <input
                    type={block.format === 'number' ? 'number' : block.format === 'email' ? 'email' : block.format === 'phone' ? 'tel' : 'text'}
                    required={block.isRequired}
                    placeholder={block.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={responses[block.name] || ''}
                    onChange={(e) => handleInputChange(block.name, e.target.value)}
                  />
                )}
              </div>
            );
          }

          if (block.blockType === 'choiceInput') {
            return (
              <div key={block.id || index} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  {block.label} {block.isRequired && <span className="text-red-500">*</span>}
                </label>
                {block.uiType === 'dropdown' ? (
                  <select
                    required={block.isRequired}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={responses[block.name] || ''}
                    onChange={(e) => handleInputChange(block.name, e.target.value)}
                  >
                    <option value="" disabled>Select an option</option>
                    {block.options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : block.uiType === 'radio' ? (
                  <div className="space-y-2">
                    {block.options?.map((opt: any) => (
                      <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name={block.name}
                            required={block.isRequired}
                            value={opt.value}
                            checked={responses[block.name] === opt.value}
                            onChange={(e) => handleInputChange(block.name, e.target.value)}
                            className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  // Checkbox group
                  <div className="space-y-2">
                    {block.options?.map((opt: any) => {
                      const isChecked = (responses[block.name] || []).includes(opt.value);
                      return (
                        <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            value={opt.value}
                            checked={isChecked}
                            onChange={(e) => {
                              const currentVals = responses[block.name] || [];
                              const newVals = e.target.checked
                                ? [...currentVals, opt.value]
                                : currentVals.filter((v: string) => v !== opt.value);
                              handleInputChange(block.name, newVals);
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          if (block.blockType === 'surveyMatrix') {
            return (
              <div key={block.id || index} className="space-y-4 overflow-x-auto pb-4">
                <label className="block text-sm font-medium text-gray-700">
                  {block.question} {block.isRequired && <span className="text-red-500">*</span>}
                </label>
                <div className="min-w-max border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700 w-1/3">Statement</th>
                        {block.columns?.map((col: any) => (
                          <th key={col.value} className="px-4 py-3 font-semibold text-gray-700 text-center">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {block.rows?.map((row: any) => (
                        <tr key={row.value} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3 text-gray-700 font-medium">{row.statement}</td>
                          {block.columns?.map((col: any) => (
                            <td key={col.value} className="px-4 py-3 text-center">
                              <input
                                type="radio"
                                required={block.isRequired}
                                name={`${block.name}_${row.value}`}
                                value={col.value}
                                checked={(responses[block.name] || {})[row.value] === col.value}
                                onChange={() => handleMatrixChange(block.name, row.value, col.value)}
                                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }

          return null;
        })}

        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          {onCancel && !isFeedbackRequired && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              Skip Feedback
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <i className="fa fa-spinner fa-spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="fa fa-paper-plane"></i> Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}