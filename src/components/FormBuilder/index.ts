'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusIcon, 
  DocumentIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  BellIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useApiClient } from '@/lib/api';
import { FormTemplate, FormSubmission, Notification } from '@/types';
import FormBuilder from '@/components/FormBuilder/FormBuilder';
import FormAnalytics from './FormAnalytics';
import SubmissionViewer from '../AdminDashboard/SubmissionViewer';
import NotificationPanel from '../AdminDashboard/NotificationPanel';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', name: 'Overview', icon: ChartBarIcon },
  { id: 'forms', name: 'Forms', icon: DocumentIcon },
  { id: 'submissions', name: 'Submissions', icon: UserGroupIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<FormTemplate | null>(null);

  const apiClient = useApiClient();

  // Fetch data
  const { data: forms = [], refetch: refetchForms } = useQuery({
    queryKey: ['admin-forms'],
    queryFn: async () => {
      const response = await apiClient.get('/forms/templates/');
      return response.data.results || response.data;
    },
  });

  const { data: submissions = [], refetch: refetchSubmissions } = useQuery({
    queryKey: ['admin-submissions'],
    queryFn: async () => {
      const response = await apiClient.get('/forms/submissions/');
      return response.data.results || response.data;
    },
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications/');
      return response.data.results || response.data;
    },
  });

  const unreadCount = notifications.filter((n: Notification) => !n.is_read).length;

  // Actions
  const handleCreateForm = () => {
    setEditingForm(null);
    setShowFormBuilder(true);
  };

  const handleEditForm = (form: FormTemplate) => {
    setEditingForm(form);
    setShowFormBuilder(true);
  };

  const handleDeleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;
    
    try {
      await apiClient.delete(`/forms/templates/${formId}/`);
      toast.success('Form deleted successfully');
      refetchForms();
    } catch (error) {
      toast.error('Failed to delete form');
    }
  };

  const handleSaveForm = async (formData: any) => {
    try {
      if (editingForm) {
        await apiClient.patch(`/forms/templates/${editingForm.id}/`, formData);
        toast.success('Form updated successfully');
      } else {
        await apiClient.post('/forms/templates/', formData);
        toast.success('Form created successfully');
      }
      setShowFormBuilder(false);
      setEditingForm(null);
      refetchForms();
    } catch (error) {
      toast.error('Failed to save form');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Forms</p>
              <p className="text-2xl font-semibold text-gray-900">{forms.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">
                {submissions.filter((s: FormSubmission) => s.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BellIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unread Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Forms</h3>
          </div>
          <div className="p-6">
            {forms.slice(0, 5).map((form: FormTemplate) => (
              <div key={form.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{form.name}</p>
                  <p className="text-sm text-gray-500">{formatDate(form.created_at)}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  form.status === 'active' ? 'bg-green-100 text-green-800' :
                  form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {form.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
          </div>
          <div className="p-6">
            {submissions.slice(0, 5).map((submission: FormSubmission) => (
              <div key={submission.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{submission.form_name}</p>
                  <p className="text-sm text-gray-500">by {submission.submitted_by_name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {submission.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Form Templates</h2>
        <button
          onClick={handleCreateForm}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Form
        </button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form: FormTemplate) => (
          <div key={form.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{form.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{form.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  form.status === 'active' ? 'bg-green-100 text-green-800' :
                  form.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {form.status}
                </span>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                <p>Created: {formatDate(form.created_at)}</p>
                <p>Submissions: {form.submission_count}</p>
                <p>Fields: {form.schema?.fields?.length || 0}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedForm(form)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => handleEditForm(form)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubmissions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Form Submissions</h2>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission: FormSubmission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.form_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{submission.submitted_by_name}</div>
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
                    {submission.submitted_at ? formatDate(submission.submitted_at) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (showFormBuilder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {editingForm ? 'Edit Form' : 'Create New Form'}
            </h1>
            <button
              onClick={() => {
                setShowFormBuilder(false);
                setEditingForm(null);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        
        <FormBuilder
          initialSchema={editingForm?.schema}
          onSchemaChange={() => {}}
          onSave={handleSaveForm}
          editingForm={editingForm}
        />
      </div>
    );
  }

  if (selectedForm) {
    return (
      <FormAnalytics
        form={selectedForm}
        onBack={() => setSelectedForm(null)}
      />
    );
  }

  if (selectedSubmission) {
    return (
      <SubmissionViewer
        submission={selectedSubmission}
        onBack={() => setSelectedSubmission(null)}
        onUpdate={() => {
          setSelectedSubmission(null);
          refetchSubmissions();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage forms, submissions, and notifications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.name}
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'forms' && renderForms()}
        {activeTab === 'submissions' && renderSubmissions()}
        {activeTab === 'notifications' && (
          <NotificationPanel
            notifications={notifications}
            onRefresh={refetchNotifications}
          />
        )}
      </div>
    </div>
  );
}
