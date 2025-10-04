// src/components/FormBuilder/FieldEditor.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { FormField, FieldOption, ValidationRule } from '@/types';
import { generateFieldName } from '@/lib/utils';

interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onClose: () => void;
}

export default function FieldEditor({ field, onUpdate, onClose }: FieldEditorProps) {
  const [editedField, setEditedField] = useState<FormField>(field);

  useEffect(() => {
    setEditedField(field);
  }, [field]);

  const updateField = (updates: Partial<FormField>) => {
    const updatedField = { ...editedField, ...updates };
    
    // Auto-generate field name when label changes
    if (updates.label && updates.label !== editedField.label) {
      updatedField.name = generateFieldName(updates.label);
    }
    
    setEditedField(updatedField);
    onUpdate(updatedField);
  };

  const addOption = () => {
    const options = editedField.options || [];
    const newOption: FieldOption = {
      label: `Option ${options.length + 1}`,
      value: `option${options.length + 1}`,
    };
    updateField({ options: [...options, newOption] });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const options = [...(editedField.options || [])];
    options[index] = { ...options[index], ...updates };
    updateField({ options });
  };

  const removeOption = (index: number) => {
    const options = [...(editedField.options || [])];
    options.splice(index, 1);
    updateField({ options });
  };

  const addValidationRule = (type: ValidationRule['type']) => {
    const validation = editedField.validation || [];
    const newRule: ValidationRule = {
      type,
      message: `Please provide a valid ${type}`,
    };

    // Set default values based on type
    switch (type) {
      case 'minLength':
      case 'maxLength':
      case 'min':
      case 'max':
        newRule.value = 1;
        break;
      case 'pattern':
        newRule.value = '^[a-zA-Z0-9]+$';
        break;
      case 'fileSize':
        newRule.value = 5; // 5MB
        break;
      case 'fileType':
        newRule.value = 'image/*,application/pdf';
        break;
    }

    updateField({ validation: [...validation, newRule] });
  };

  const updateValidationRule = (index: number, updates: Partial<ValidationRule>) => {
    const validation = [...(editedField.validation || [])];
    validation[index] = { ...validation[index], ...updates };
    updateField({ validation });
  };

  const removeValidationRule = (index: number) => {
    const validation = [...(editedField.validation || [])];
    validation.splice(index, 1);
    updateField({ validation });
  };

  const supportsOptions = ['select', 'multiselect', 'radio'].includes(editedField.type);
  const supportsValidation = !['checkbox'].includes(editedField.type);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold text-gray-900">Field Settings</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Basic Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Label *
            </label>
            <input
              type="text"
              value={editedField.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Name
            </label>
            <input
              type="text"
              value={editedField.name}
              onChange={(e) => updateField({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="auto-generated from label"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used as the field identifier. Should be unique.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editedField.description || ''}
              onChange={(e) => updateField({ description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Help text for this field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={editedField.placeholder || ''}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              id="required"
              type="checkbox"
              checked={editedField.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-900">
              Required field
            </label>
          </div>
        </div>

        {/* Options (for select, multiselect, radio) */}
        {supportsOptions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Options</h4>
              <button
                onClick={addOption}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Add Option
              </button>
            </div>

            <div className="space-y-2">
              {(editedField.options || []).map(
                (
                  option: { label: string | number | readonly string[] | undefined; value: string | number | readonly string[] | undefined; },
                  index: number
                ) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(index, { label: e.target.value })}
                      placeholder="Option label"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => updateOption(index, { value: e.target.value })}
                      placeholder="Value"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => removeOption(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Field-specific Config */}
        {editedField.type === 'number' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Number Settings</h4>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Value
                </label>
                <input
                  type="number"
                  value={editedField.config?.min || ''}
                  onChange={(e) => updateField({ 
                    config: { ...editedField.config, min: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Value
                </label>
                <input
                  type="number"
                  value={editedField.config?.max || ''}
                  onChange={(e) => updateField({ 
                    config: { ...editedField.config, max: parseFloat(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step
              </label>
              <input
                type="number"
                step="0.01"
                value={editedField.config?.step || ''}
                onChange={(e) => updateField({ 
                  config: { ...editedField.config, step: parseFloat(e.target.value) || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {(editedField.type === 'file' || editedField.type === 'files') && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">File Upload Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accepted File Types
              </label>
              <input
                type="text"
                value={editedField.config?.accept || ''}
                onChange={(e) => updateField({ 
                  config: { ...editedField.config, accept: e.target.value }
                })}
                placeholder="e.g., .pdf,.doc,.docx,image/*"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max File Size (MB)
              </label>
              <input
                type="number"
                value={editedField.config?.maxFileSize || ''}
                onChange={(e) => updateField({ 
                  config: { ...editedField.config, maxFileSize: parseInt(e.target.value) || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {editedField.type === 'files' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Number of Files
                </label>
                <input
                  type="number"
                  value={editedField.config?.maxFiles || ''}
                  onChange={(e) => updateField({ 
                    config: { ...editedField.config, maxFiles: parseInt(e.target.value) || undefined }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}
          </div>
        )}

        {editedField.type === 'rating' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Rating Settings</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Rating
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={editedField.config?.maxRating || 5}
                onChange={(e) => updateField({ 
                  config: { ...editedField.config, maxRating: parseInt(e.target.value) || 5 }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        )}

        {editedField.type === 'slider' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Slider Settings</h4>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min
                </label>
                <input
                  type="number"
                  value={editedField.config?.min || 0}
                  onChange={(e) => updateField({ 
                    config: { ...editedField.config, min: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max
                </label>
                <input
                  type="number"
                  value={editedField.config?.max || 100}
                  onChange={(e) => updateField({ 
                    config: { ...editedField.config, max: parseInt(e.target.value) || 100 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step
                </label>
                <input
                  type="number"
                  value={editedField.config?.step || 1}
                  onChange={(e) => updateField({ 
                    config: { ...editedField.config, step: parseInt(e.target.value) || 1 }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Validation Rules */}
        {supportsValidation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Validation Rules</h4>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addValidationRule(e.target.value as ValidationRule['type']);
                      e.target.value = '';
                    }
                  }}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1"
                >
                  <option value="">Add Rule</option>
                  <option value="minLength">Min Length</option>
                  <option value="maxLength">Max Length</option>
                  <option value="pattern">Pattern</option>
                  {editedField.type === 'number' && (
                    <>
                      <option value="min">Min Value</option>
                      <option value="max">Max Value</option>
                    </>
                  )}
                  {(editedField.type === 'file' || editedField.type === 'files') && (
                    <>
                      <option value="fileSize">File Size</option>
                      <option value="fileType">File Type</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {(editedField.validation || []).map((rule: { type: string; value: any; message: string | number | readonly string[] | undefined; }, index: React.Key | null | undefined) => (
                <div key={index} className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {rule.type.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <button
                      onClick={() => removeValidationRule(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {rule.type !== 'required' && (
                    <div className="mb-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Value
                      </label>
                      <input
                        type={['minLength', 'maxLength', 'min', 'max', 'fileSize'].includes(rule.type) ? 'number' : 'text'}
                        value={rule.value || ''}
                        onChange={(e) => updateValidationRule(index, { 
                          value: ['minLength', 'maxLength', 'min', 'max', 'fileSize'].includes(rule.type) 
                            ? parseInt(e.target.value) || 0 
                            : e.target.value 
                        })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        placeholder={
                          rule.type === 'pattern' ? 'Regular expression' :
                          rule.type === 'fileType' ? 'e.g., image/*,application/pdf' :
                          rule.type === 'fileSize' ? 'Size in MB' :
                          'Value'
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Error Message
                    </label>
                    <input
                      type="text"
                      value={rule.message}
                      onChange={(e) => updateValidationRule(index, { message: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Advanced Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Value
            </label>
            <input
              type="text"
              value={editedField.config?.defaultValue || ''}
              onChange={(e) => updateField({ 
                config: { ...editedField.config, defaultValue: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              id="readonly"
              type="checkbox"
              checked={editedField.config?.readonly || false}
              onChange={(e) => updateField({ 
                config: { ...editedField.config, readonly: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="readonly" className="ml-2 block text-sm text-gray-900">
              Read-only field
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="hidden"
              type="checkbox"
              checked={editedField.config?.hidden || false}
              onChange={(e) => updateField({ 
                config: { ...editedField.config, hidden: e.target.checked }
              })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="hidden" className="ml-2 block text-sm text-gray-900">
              Hidden field
            </label>
          </div>
        </div>

        {/* CSS Classes */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Styling</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CSS Classes
            </label>
            <input
              type="text"
              value={editedField.config?.className || ''}
              onChange={(e) => updateField({ 
                config: { ...editedField.config, className: e.target.value }
              })}
              placeholder="e.g., col-span-2 text-center"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Width
            </label>
            <select
              value={editedField.config?.width || 'full'}
              onChange={(e) => updateField({ 
                config: { ...editedField.config, width: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="full">Full Width</option>
              <option value="half">Half Width</option>
              <option value="third">One Third</option>
              <option value="quarter">One Quarter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="text-xs text-gray-500">
          Field Type: <span className="font-medium">{editedField.type}</span>
        </div>
      </div>
    </div>
  );
}