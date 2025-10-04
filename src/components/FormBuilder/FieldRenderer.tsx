// src/components/FormBuilder/FieldRenderer.tsx
'use client';

import React, { useState, useRef } from 'react';
import { FormField } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { StarIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  onFileUpload?: (files: File[]) => Promise<string[]>;
}

export default function FieldRenderer({ 
  field, 
  value, 
  onChange, 
  error, 
  disabled = false,
  onFileUpload 
}: FieldRendererProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // For single file upload, take only the first file
    const filesToUpload = field.type === 'file' ? [files[0]] : files;

    if (onFileUpload) {
      setIsUploading(true);
      try {
        const uploadedUrls = await onFileUpload(filesToUpload);
        onChange(field.type === 'file' ? uploadedUrls[0] : uploadedUrls);
        setUploadedFiles(filesToUpload);
      } catch (error) {
        console.error('File upload failed:', error);
      } finally {
        setIsUploading(false);
      }
    } else {
      // For preview mode, just store file names
      const fileData = filesToUpload.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));
      onChange(field.type === 'file' ? fileData[0] : fileData);
      setUploadedFiles(filesToUpload);
    }
  };

  const removeFile = (index?: number) => {
    if (field.type === 'file') {
      onChange(null);
      setUploadedFiles([]);
    } else if (field.type === 'files' && index !== undefined) {
      const newFiles = uploadedFiles.filter((_, i) => i !== index);
      setUploadedFiles(newFiles);
      
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.filter((_, i) => i !== index);
      onChange(newValue);
    }
  };

  const renderField = () => {
    const commonProps = {
      disabled: disabled || field.config?.readonly,
      className: `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-300' : 'border-gray-300'
      } ${field.config?.className || ''}`,
    };

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.config?.rows || 3}
            {...commonProps}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.config?.min}
            max={field.config?.max}
            step={field.config?.step}
            {...commonProps}
          />
        );

      case 'email':
        return (
          <input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            {...commonProps}
          />
        );

      case 'phone':
        return (
          <input
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder || '+1 (555) 123-4567'}
            {...commonProps}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            {...commonProps}
          >
            <option value="">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option: { value: string | number | readonly string[] | null | undefined; label: React.ReactNode }) => {
              // Ensure value is not null for the value prop and cast to correct type
              let optionValue: string | number | readonly string[] | undefined;
              if (option.value === null || option.value === undefined) {
                optionValue = undefined;
              } else if (typeof option.value === 'bigint') {
                optionValue = option.value.toString();
              } else {
                optionValue = option.value;
              }
              return (
                <option key={String(option.value)} value={optionValue}>
                  {option.label}
                </option>
              );
            })}
          </select>
        );

      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              onChange(selected);
            }}
            {...commonProps}
            className={`${commonProps.className} min-h-[120px]`}
          >
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              id={field.name}
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled || field.config?.readonly}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option: { value: readonly string[] | React.Key | null | undefined; label: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }) => (
              <div key={String(option.value)} className="flex items-center">
                <input
                  id={`${field.name}_${option.value}`}
                  name={field.name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={disabled || field.config?.readonly}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label htmlFor={`${field.name}_${option.value}`} className="ml-2 block text-sm text-gray-900">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
      case 'files':
        return (
          <div className="space-y-3">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                error ? 'border-red-300' : 'border-gray-300'
              } hover:border-gray-400 transition-colors`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple={field.type === 'files'}
                accept={field.config?.accept}
                onChange={handleFileChange}
                disabled={disabled || isUploading}
                className="hidden"
              />
              
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                    className="font-medium text-blue-600 hover:text-blue-500 disabled:text-gray-400"
                  >
                    {isUploading ? 'Uploading...' : 'Upload files'}
                  </button>
                  <p className="text-gray-500">or drag and drop</p>
                </div>
                
                {field.config?.accept && (
                  <p className="text-xs text-gray-400">
                    Accepted: {field.config.accept}
                  </p>
                )}
                
                {field.config?.maxFileSize && (
                  <p className="text-xs text-gray-400">
                    Max size: {field.config.maxFileSize}MB
                  </p>
                )}
              </div>
            </div>

            {/* Display uploaded files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={disabled}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'rating':
        const maxRating = field.config?.maxRating || 5;
        return (
          <div className="flex items-center space-x-1">
            {Array.from({ length: maxRating }, (_, i) => {
              const starValue = i + 1;
              const isActive = value >= starValue;
              
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(starValue)}
                  disabled={disabled || field.config?.readonly}
                  className="focus:outline-none disabled:cursor-not-allowed"
                >
                  {isActive ? (
                    <StarIconSolid className="h-6 w-6 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-6 w-6 text-gray-300 hover:text-yellow-400 transition-colors" />
                  )}
                </button>
              );
            })}
            {value && (
              <span className="ml-2 text-sm text-gray-600">
                {value} of {maxRating}
              </span>
            )}
          </div>
        );

      case 'slider':
        const min = field.config?.min || 0;
        const max = field.config?.max || 100;
        const step = field.config?.step || 1;
        
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={value || min}
              onChange={(e) => onChange(parseInt(e.target.value))}
              disabled={disabled || field.config?.readonly}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{min}</span>
              <span className="font-medium">Current: {value || min}</span>
              <span>{max}</span>
            </div>
          </div>
        );

      case 'richtext':
        return (
          <div>
            <textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder || 'Enter rich text content...'}
              rows={field.config?.rows || 6}
              {...commonProps}
            />
            <div className="mt-1 text-xs text-gray-500">
              Rich text editor would be implemented here in production
            </div>
          </div>
        );

      case 'address':
        const addressValue = value || {};
        return (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Street Address"
              value={addressValue.street || ''}
              onChange={(e) => onChange({ ...addressValue, street: e.target.value })}
              className={commonProps.className}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={addressValue.city || ''}
                onChange={(e) => onChange({ ...addressValue, city: e.target.value })}
                className={commonProps.className}
              />
              <input
                type="text"
                placeholder="State"
                value={addressValue.state || ''}
                onChange={(e) => onChange({ ...addressValue, state: e.target.value })}
                className={commonProps.className}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="ZIP Code"
                value={addressValue.zip || ''}
                onChange={(e) => onChange({ ...addressValue, zip: e.target.value })}
                className={commonProps.className}
              />
              <input
                type="text"
                placeholder="Country"
                value={addressValue.country || ''}
                onChange={(e) => onChange({ ...addressValue, country: e.target.value })}
                className={commonProps.className}
              />
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Digital signature canvas would be here</p>
              <button
                type="button"
                className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                disabled={disabled}
              >
                {value ? 'Update Signature' : 'Add Signature'}
              </button>
            </div>
            {value && (
              <div className="text-xs text-gray-500">
                Signature captured on {new Date().toLocaleDateString()}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 border border-red-300 bg-red-50 rounded-md">
            <p className="text-sm text-red-700">
              Unknown field type: {field.type}
            </p>
          </div>
        );
    }
  };

  // Don't render checkbox labels separately since they're included in the field
  const showLabel = field.type !== 'checkbox';
  const widthClass = field.config?.width ? 
    {
      'half': 'md:w-1/2',
      'third': 'md:w-1/3',
      'quarter': 'md:w-1/4',
      'full': 'w-full'
    }[field.config.width] || 'w-full' : 'w-full';

  if (field.config?.hidden) {
    return null;
  }

  return (
    <div className={`${widthClass} ${field.config?.className || ''}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {field.description && (
        <p className="text-xs text-gray-600 mb-2">{field.description}</p>
      )}
      
      <div className="relative">
        {renderField()}
        
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}