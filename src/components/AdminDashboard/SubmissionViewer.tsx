'use client';

import React, { useState } from 'react';
import { useApiClient } from '@/lib/api';
import { FormSubmission, FormTemplate } from '@/types';
import { formatDate, formatFileSize, downloadFile } from '@/lib/utils';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon, 
  DocumentArrowDownIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SubmissionViewerProps {
  submission: FormSubmission;
  onBack: () => void;
  onUpdate: () => void;
}

export default function SubmissionViewer({ submission, onBack, onUpdate }: SubmissionViewerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewNotes, setReviewNotes] = useState(submission.review_notes || '');
  const [selectedStatus, setSelectedStatus] = useState(submission.status);

  const apiClient = useApiClient();

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await apiClient.patch(`/forms/submissions/${submission.id}/`, {
        status: newStatus,
        review_notes: reviewNotes,
      });
      
      toast.success(`Submission ${newStatus} successfully`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update submission');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {submission.form_name}
                </h1>
                <p className="text-gray-600">
                  Submitted by {submission.submitted_by_name} on{' '}
                  {submission.submitted_at ? formatDate(submission.submitted_at) : 'Draft'}
                </p>
              </div>
            </div>
            
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Data */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Submission Data</h2>
              
              <div className="space-y-6">
                {Object.entries(submission.data).map(([fieldName, value]) => (
                  <div key={fieldName} className="border-b border-gray-100 pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                    
                    <div className="text-sm text-gray-900">
                      {Array.isArray(value) ? (
                        <ul className="list-disc list-inside">
                          {value.map((item, index) => (
                            <li key={index}>{String(item)}</li>
                          ))}
                        </ul>
                      ) : typeof value === 'object' && value !== null ? (
                        <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span>{String(value || 'N/A')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Files */}
            {submission.files && submission.files.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h2>
                
                <div className="space-y-3">
                  {submission.files.map((file: { id: React.Key | null | undefined; original_filename: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined; file_size: number; content_type: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; url: string | URL | undefined; }) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <DocumentArrowDownIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {file.original_filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.file_size)} • {file.content_type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (typeof file.url === 'string') {
                              downloadFile(
                                file.url,
                                typeof file.original_filename === 'string'
                                  ? file.original_filename
                                  : 'downloaded_file'
                              );
                            } else {
                              toast.error('File URL is not available');
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h2>
              
              {submission.status === 'submitted' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add review comments..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate('approved')}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={isUpdating}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600">
                    This submission has already been {submission.status}.
                  </p>
                  {submission.review_notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left">
                      <p className="text-sm font-medium text-gray-700 mb-1">Review Notes:</p>
                      <p className="text-sm text-gray-600">{submission.review_notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Submission Details */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Submission Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">{formatDate(submission.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="text-gray-900">{formatDate(submission.updated_at)}</span>
                  </div>
                  {submission.submitted_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Submitted:</span>
                      <span className="text-gray-900">{formatDate(submission.submitted_at)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Schema Version:</span>
                    <span className="text-gray-900">v{submission.schema_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Complete:</span>
                    <span className={`font-medium ${submission.is_complete ? 'text-green-600' : 'text-orange-600'}`}>
                      {submission.is_complete ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}