'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowLeftIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { FormTemplate, FormSubmission } from '@/types';
import { useApiClient } from '@/lib/api';
import { createFormValidationSchema } from '@/lib/form-validation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import FieldRenderer from '@/components/FormBuilder/FieldRenderer';
import toast from 'react-hot-toast';

interface FormRendererProps {
  form?: FormTemplate | null;
  submission?: FormSubmission | null;
  onBack: () => void;
  onSubmit: () => void;
}

export default function FormRenderer({ form, submission, onBack, onSubmit }: FormRendererProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const apiClient = useApiClient();

  // Use either the form template or get it from submission
  const formTemplate = form || (submission ? { 
    id: submission.form_template, 
    schema: { fields: [] } // Will be fetched
  } as FormTemplate : null);

  // Auto-save draft to localStorage
  const [draftData, setDraftData] = useLocalStorage(
    `form-draft-${formTemplate?.id}`, 
    submission?.data || {}
  );

  const validationSchema = formTemplate?.schema?.fields ? 
    createFormValidationSchema(formTemplate.schema.fields) : undefined;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: validationSchema ? yupResolver(validationSchema) : undefined,
    defaultValues: submission?.data || draftData,
  });

  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && isDirty && formTemplate?.auto_save_drafts) {
      const timeoutId = setTimeout(() => {
        setDraftData(watchedValues);
        saveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, isDirty, autoSaveEnabled, formTemplate?.auto_save_drafts]);

  const saveDraft = async () => {
    if (!formTemplate) return;

    try {
      const payload = {
        form_template: formTemplate.id,
        data: watchedValues,
        status: 'draft',
      };

      if (submission) {
        await apiClient.patch(`/forms/submissions/${submission.id}/`, payload);
      } else {
        await apiClient.post('/forms/submissions/', payload);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!formTemplate) return;

    setIsSubmitting(true);
    try {
      const payload = {
        form_template: formTemplate.id,
        data,
        status: 'submitted',
      };

      if (submission) {
        await apiClient.patch(`/forms/submissions/${submission.id}/`, payload);
        toast.success('Form updated and submitted successfully!');
      } else {
        await apiClient.post('/forms/submissions/', payload);
        toast.success('Form submitted successfully!');
      }

      // Clear draft from localStorage
      setDraftData({});
      onSubmit();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    // This would integrate with the file upload API
    // For now, return mock URLs
    return files.map(file => URL.createObjectURL(file));
  };

  if (!formTemplate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Form not found</h2>
          <button onClick={onBack} className="text-blue-600 hover:text-blue-500">
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{formTemplate.name}</h1>
              {formTemplate.description && (
                <p className="text-gray-600 mt-1">{formTemplate.description}</p>
              )}
            </div>
            {submission && (
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                  submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {submission.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8">
            <div className="space-y-6">
              {formTemplate.schema?.fields?.map((field: unknown) => {
                // Replace 'any' with your actual field type if available, e.g., FieldType
                const typedField = field as any;
                return (
                  <FieldRenderer
                    key={typedField.id}
                    field={typedField}
                    value={watchedValues[typedField.name]}
                    onChange={(value) => setValue(typedField.name, value)}
                    error={errors[typedField.name]?.message as string}
                    onFileUpload={handleFileUpload}
                    disabled={submission?.status === 'submitted' && submission.status !== 'draft'}
                  />
                );
              })}
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                {formTemplate.auto_save_drafts && (
                  <div className="flex items-center">
                    <input
                      id="auto-save"
                      type="checkbox"
                      checked={autoSaveEnabled}
                      onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="auto-save" className="ml-2 block text-sm text-gray-900">
                      Auto-save as draft
                    </label>
                  </div>
                )}
                {isDirty && (
                  <span className="text-sm text-orange-600">Unsaved changes</span>
                )}
              </div>

              <div className="flex space-x-3">
                {formTemplate.auto_save_drafts && (
                  <button
                    type="button"
                    onClick={() => saveDraft()}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Save Draft
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || (submission?.status === 'submitted' && submission.status !== 'draft')}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                      {submission?.status === 'draft' ? 'Submit Form' : 'Update Submission'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
