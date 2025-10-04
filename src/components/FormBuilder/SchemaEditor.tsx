'use client';

import React, { useState, useEffect } from 'react';
import { FormSchema } from '@/types';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface SchemaEditorProps {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
}

export default function SchemaEditor({ schema, onChange }: SchemaEditorProps) {
  const [jsonValue, setJsonValue] = useState(() => JSON.stringify(schema, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setJsonValue(JSON.stringify(schema, null, 2));
  }, [schema]);

  const handleChange = (value: string) => {
    setJsonValue(value);
    
    try {
      const parsed = JSON.parse(value);
      
      // Validate schema structure
      const validationResult = validateSchema(parsed);
      if (validationResult.isValid) {
        setError(null);
        setIsValid(true);
        onChange(parsed);
      } else {
        setError(validationResult.error ?? null);
        setIsValid(false);
      }
    } catch (e) {
      setError('Invalid JSON syntax');
      setIsValid(false);
    }
  };

  const validateSchema = (parsed: any): { isValid: boolean; error?: string } => {
    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Schema must be an object' };
    }

    if (!Array.isArray(parsed.fields)) {
      return { isValid: false, error: 'Schema must contain a "fields" array' };
    }

    const fieldNames = new Set();
    for (let i = 0; i < parsed.fields.length; i++) {
      const field = parsed.fields[i];
      
      if (!field.id || !field.name || !field.type || !field.label) {
        return { 
          isValid: false, 
          error: `Field at index ${i} is missing required properties (id, name, type, label)` 
        };
      }

      if (fieldNames.has(field.name)) {
        return { 
          isValid: false, 
          error: `Duplicate field name "${field.name}" at index ${i}` 
        };
      }
      fieldNames.add(field.name);

      const validTypes = [
        'text', 'textarea', 'number', 'email', 'phone', 'date', 'datetime',
        'select', 'multiselect', 'checkbox', 'radio', 'file', 'files',
        'richtext', 'rating', 'slider', 'address', 'signature'
      ];

      if (!validTypes.includes(field.type)) {
        return { 
          isValid: false, 
          error: `Invalid field type "${field.type}" at index ${i}. Valid types: ${validTypes.join(', ')}` 
        };
      }

      // Validate options for select/radio fields
      if (['select', 'multiselect', 'radio'].includes(field.type)) {
        if (!field.options || !Array.isArray(field.options) || field.options.length === 0) {
          return { 
            isValid: false, 
            error: `Field "${field.name}" of type "${field.type}" requires options array` 
          };
        }

        for (let j = 0; j < field.options.length; j++) {
          const option = field.options[j];
          if (!option.label || !option.value) {
            return { 
              isValid: false, 
              error: `Option at index ${j} in field "${field.name}" must have label and value` 
            };
          }
        }
      }
    }

    return { isValid: true };
  };

  const formatSchema = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonValue(formatted);
    } catch (e) {
      // Ignore formatting errors
    }
  };

  const addSampleField = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const newField = {
        id: `field_${Date.now()}`,
        name: 'new_field',
        label: 'New Field',
        type: 'text',
        required: false,
        placeholder: 'Enter value...',
        description: '',
        validation: [],
        config: {}
      };
      
      parsed.fields = parsed.fields || [];
      parsed.fields.push(newField);
      
      const updated = JSON.stringify(parsed, null, 2);
      setJsonValue(updated);
      handleChange(updated);
    } catch (e) {
      // Ignore if invalid JSON
    }
  };

  const loadTemplate = (template: string) => {
    let templateSchema: any;
    
    switch (template) {
      case 'kyc':
        templateSchema = {
          fields: [
            {
              id: 'field_1',
              name: 'full_name',
              label: 'Full Name',
              type: 'text',
              required: true,
              placeholder: 'Enter your full name'
            },
            {
              id: 'field_2',
              name: 'email',
              label: 'Email Address',
              type: 'email',
              required: true,
              placeholder: 'your@email.com'
            },
            {
              id: 'field_3',
              name: 'phone',
              label: 'Phone Number',
              type: 'phone',
              required: true,
              placeholder: '+1 (555) 123-4567'
            },
            {
              id: 'field_4',
              name: 'date_of_birth',
              label: 'Date of Birth',
              type: 'date',
              required: true
            },
            {
              id: 'field_5',
              name: 'id_document',
              label: 'ID Document',
              type: 'file',
              required: true,
              config: {
                accept: 'image/*,application/pdf',
                maxFileSize: 10
              }
            }
          ],
          settings: {
            allowDrafts: true,
            showProgressBar: true
          }
        };
        break;
        
      case 'loan':
        templateSchema = {
          fields: [
            {
              id: 'field_1',
              name: 'loan_amount',
              label: 'Loan Amount',
              type: 'number',
              required: true,
              config: {
                min: 1000,
                max: 1000000,
                step: 1000
              }
            },
            {
              id: 'field_2',
              name: 'loan_purpose',
              label: 'Loan Purpose',
              type: 'select',
              required: true,
              options: [
                { label: 'Home Purchase', value: 'home_purchase' },
                { label: 'Business', value: 'business' },
                { label: 'Education', value: 'education' },
                { label: 'Other', value: 'other' }
              ]
            },
            {
              id: 'field_3',
              name: 'annual_income',
              label: 'Annual Income',
              type: 'number',
              required: true,
              config: {
                min: 0
              }
            },
            {
              id: 'field_4',
              name: 'income_proof',
              label: 'Income Proof Documents',
              type: 'files',
              required: true,
              config: {
                accept: 'image/*,application/pdf',
                maxFiles: 3,
                maxFileSize: 5
              }
            }
          ]
        };
        break;
        
      case 'survey':
        templateSchema = {
          fields: [
            {
              id: 'field_1',
              name: 'satisfaction',
              label: 'Overall Satisfaction',
              type: 'rating',
              required: true,
              config: {
                maxRating: 5
              }
            },
            {
              id: 'field_2',
              name: 'recommend',
              label: 'Would you recommend us?',
              type: 'radio',
              required: true,
              options: [
                { label: 'Yes, definitely', value: 'yes' },
                { label: 'Maybe', value: 'maybe' },
                { label: 'No', value: 'no' }
              ]
            },
            {
              id: 'field_3',
              name: 'feedback',
              label: 'Additional Feedback',
              type: 'textarea',
              required: false,
              placeholder: 'Tell us how we can improve...',
              config: {
                rows: 4
              }
            }
          ]
        };
        break;
        
      default:
        return;
    }
    
    const jsonString = JSON.stringify(templateSchema, null, 2);
    setJsonValue(jsonString);
    handleChange(jsonString);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">JSON Schema Editor</h3>
          {isValid ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
          
          <select
            onChange={(e) => e.target.value && loadTemplate(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
            defaultValue=""
          >
            <option value="">Load Template</option>
            <option value="kyc">KYC Form</option>
            <option value="loan">Loan Application</option>
            <option value="survey">Survey Form</option>
          </select>
          
          <button
            onClick={addSampleField}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Add Field
          </button>
          
          <button
            onClick={formatSchema}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Format
          </button>
        </div>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="p-4 bg-blue-50 border-b border-blue-200 text-sm">
          <h4 className="font-medium text-blue-900 mb-2">Schema Structure:</h4>
          <div className="space-y-1 text-blue-800">
            <p>• <strong>fields</strong>: Array of field objects</p>
            <p>• <strong>settings</strong>: Optional form settings</p>
            <p>• Each field requires: <strong>id, name, label, type</strong></p>
            <p>• Optional field properties: <strong>required, placeholder, description, options, validation, config</strong></p>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          value={jsonValue}
          onChange={(e) => handleChange(e.target.value)}
          className={`w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none text-gray-900 ${
            error ? 'bg-red-50' : 'bg-white'
          }`}
          placeholder="Enter form schema JSON..."
          spellCheck={false}
        />
        
        {/* Line numbers */}
        <div className="absolute left-0 top-0 p-4 pointer-events-none select-none">
          <div className="font-mono text-xs text-gray-400 leading-5">
            {jsonValue.split('\n').map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
        </div>
        
        <style jsx>{`
          textarea {
            padding-left: ${Math.max(2, jsonValue.split('\n').length.toString().length) * 8 + 20}px !important;
          }
        `}</style>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Status bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between">
        <span>
          {jsonValue.split('\n').length} lines, {jsonValue.length} characters
        </span>
        <span>
          {schema.fields?.length || 0} fields defined
        </span>
      </div>
    </div>
  );
}