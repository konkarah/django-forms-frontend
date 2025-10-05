'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DocumentIcon, PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useApiClient } from '@/lib/api';
import { FormTemplate, FormSubmission } from '@/types';
import FormRenderer from './FormRenderer';
import { formatDate } from '@/lib/utils';
import { useClerk } from '@clerk/nextjs';

export default function ClientPortal() {
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<FormSubmission | null>(null);
  
  const apiClient = useApiClient();
  const { signOut } = useClerk();
      const handleSignOut = async () => {
      await signOut();
    };

  const { data: publicForms = [] } = useQuery({
    queryKey: ['public-forms'],
    queryFn: async () => {
      const response = await apiClient.get('/forms/public/');
      return response.data;
    },
  });

  const { data: mySubmissions = [] } = useQuery({
    queryKey: ['my-submissions'],
    queryFn: async () => {
      const response = await apiClient.get('/forms/submissions/');
      return response.data.results || response.data;
    },
  });

  if (selectedForm || editingSubmission) {
    return (
      <FormRenderer
        form={selectedForm}
        submission={editingSubmission}
        onBack={() => {
          setSelectedForm(null);
          setEditingSubmission(null);
        }}
        onSubmit={() => {
          setSelectedForm(null);
          setEditingSubmission(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
          <p className="text-gray-600">Submit forms and manage your applications</p>
        </div>
        <div className="absolute top-4 right-4">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Available Forms */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Forms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicForms.map((form: FormTemplate) => (
                <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <DocumentIcon className="h-6 w-6 text-blue-500 mt-1 mr-3" />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-4">
                      <p>{form.schema?.fields?.length || 0} fields</p>
                    </div>

                    <button
                      onClick={() => setSelectedForm(form)}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Start Form
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Submissions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Submissions</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {mySubmissions.length === 0 ? (
                <div className="p-8 text-center">
                  <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                  <p className="text-gray-600">Start by filling out one of the available forms above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Form
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mySubmissions.map((submission: FormSubmission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {submission.form_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                              submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(submission.updated_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            {submission.status === 'draft' && (
                              <button
                                onClick={() => setEditingSubmission(submission)}
                                className="text-blue-600 hover:text-blue-900 font-medium"
                              >
                                Continue
                              </button>
                            )}
                            <button
                              onClick={() => setEditingSubmission(submission)}
                              className="text-gray-600 hover:text-gray-900 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}