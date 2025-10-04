// 'use client';

// import React, { useState, useCallback } from 'react';
// import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
// import { PlusIcon, TrashIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
// import { FormField, FormSchema, FieldType, FormTemplate } from '@/types';
// import { generateFieldName } from '@/lib/utils';
// import FieldEditor from '../FormBuilder/FieldEditor';
// import FieldRenderer from '../FormBuilder/FieldRenderer';
// import SchemaEditor from './SchemaEditor';
// import toast from 'react-hot-toast';

// interface FormBuilderProps {
//   initialSchema?: FormSchema;
//   onSchemaChange: (schema: FormSchema) => void;
//   isPreviewMode?: boolean;
//   onSave?: (formData: any) => void;
//   editingForm?: FormTemplate | null;
// }

// const FIELD_TYPES: Array<{ type: FieldType; label: string; icon: string }> = [
//   { type: 'text', label: 'Text Input', icon: '📝' },
//   { type: 'textarea', label: 'Textarea', icon: '📄' },
//   { type: 'number', label: 'Number', icon: '🔢' },
//   { type: 'email', label: 'Email', icon: '📧' },
//   { type: 'phone', label: 'Phone', icon: '📞' },
//   { type: 'date', label: 'Date', icon: '📅' },
//   { type: 'datetime', label: 'Date & Time', icon: '🕐' },
//   { type: 'select', label: 'Dropdown', icon: '📋' },
//   { type: 'multiselect', label: 'Multi Select', icon: '☑️' },
//   { type: 'checkbox', label: 'Checkbox', icon: '✅' },
//   { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
//   { type: 'file', label: 'File Upload', icon: '📎' },
//   { type: 'files', label: 'Multiple Files', icon: '📎' },
//   { type: 'richtext', label: 'Rich Text', icon: '📝' },
//   { type: 'rating', label: 'Rating', icon: '⭐' },
//   { type: 'slider', label: 'Slider', icon: '🎚️' },
//   { type: 'address', label: 'Address', icon: '🏠' },
//   { type: 'signature', label: 'Signature', icon: '✍️' },
// ];

// export default function FormBuilder({ 
//   initialSchema, 
//   onSchemaChange, 
//   isPreviewMode = false, 
//   onSave,
//   editingForm 
// }: FormBuilderProps) {
//   const [schema, setSchema] = useState<FormSchema>(
//     initialSchema || { fields: [], settings: { allowDrafts: true } }
//   );
//   const [selectedField, setSelectedField] = useState<FormField | null>(null);
//   const [viewMode, setViewMode] = useState<'builder' | 'preview' | 'json'>('builder');
//   const [draggedFieldType, setDraggedFieldType] = useState<FieldType | null>(null);

//   const handleSchemaUpdate = useCallback((newSchema: FormSchema) => {
//     setSchema(newSchema);
//     onSchemaChange(newSchema);
//   }, [onSchemaChange]);

//   const createField = (type: FieldType, label?: string): FormField => {
//     const fieldLabel = label || FIELD_TYPES.find(ft => ft.type === type)?.label || type;
//     return {
//       id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       name: generateFieldName(fieldLabel),
//       label: fieldLabel,
//       type,
//       required: false,
//       placeholder: `Enter ${fieldLabel.toLowerCase()}...`,
//       description: '',
//       options: type === 'select' || type === 'multiselect' || type === 'radio' 
//         ? [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }]
//         : undefined,
//       validation: [],
//       config: {},
//     };
//   };

//   const addField = (type: FieldType) => {
//     const newField = createField(type);
//     const updatedSchema = {
//       ...schema,
//       fields: [...schema.fields, newField],
//     };
//     handleSchemaUpdate(updatedSchema);
//     setSelectedField(newField);
//     toast.success('Field added successfully');
//   };

//   const updateField = (updatedField: FormField) => {
//     const updatedSchema = {
//       ...schema,
//       fields: schema.fields.map((field: { id: any; }) =>
//         field.id === updatedField.id ? updatedField : field
//       ),
//     };
//     handleSchemaUpdate(updatedSchema);
//     setSelectedField(updatedField);
//   };

//   const deleteField = (fieldId: string) => {
//     const updatedSchema = {
//       ...schema,
//       fields: schema.fields.filter((field: { id: string; }) => field.id !== fieldId),
//     };
//     handleSchemaUpdate(updatedSchema);
//     if (selectedField?.id === fieldId) {
//       setSelectedField(null);
//     }
//     toast.success('Field deleted successfully');
//   };

//   const duplicateField = (field: FormField) => {
//     const duplicatedField = {
//       ...field,
//       id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//       name: `${field.name}_copy`,
//       label: `${field.label} (Copy)`,
//     };
    
//     const fieldIndex = schema.fields.findIndex((f: { id: any; }) => f.id === field.id);
//     const updatedFields = [...schema.fields];
//     updatedFields.splice(fieldIndex + 1, 0, duplicatedField);
    
//     const updatedSchema = { ...schema, fields: updatedFields };
//     handleSchemaUpdate(updatedSchema);
//     toast.success('Field duplicated successfully');
//   };

//   const onDragEnd = (result: any) => {
//     if (!result.destination) return;

//     const { source, destination } = result;

//     if (source.droppableId === 'fieldTypes' && destination.droppableId === 'formFields') {
//       // Adding new field from sidebar
//       const fieldType = FIELD_TYPES[source.index].type;
//       const newField = createField(fieldType);
      
//       const updatedFields = [...schema.fields];
//       updatedFields.splice(destination.index, 0, newField);
      
//       const updatedSchema = { ...schema, fields: updatedFields };
//       handleSchemaUpdate(updatedSchema);
//       setSelectedField(newField);
//       toast.success('Field added successfully');
//     } else if (source.droppableId === 'formFields' && destination.droppableId === 'formFields') {
//       // Reordering existing fields
//       const updatedFields = Array.from(schema.fields);
//       const [reorderedField] = updatedFields.splice(source.index, 1);
//       updatedFields.splice(destination.index, 0, reorderedField);
      
//       const updatedSchema = { ...schema, fields: updatedFields };
//       handleSchemaUpdate(updatedSchema);
//     }
//   };

//   const renderBuilderView = () => (
//     <div className="flex h-full">
//       {/* Field Types Sidebar */}
//       <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Types</h3>
//         <Droppable droppableId="fieldTypes" isDropDisabled={true}>
//           {(provided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
//               {FIELD_TYPES.map((fieldType, index) => (
//                 <Draggable
//                   key={fieldType.type}
//                   draggableId={`fieldType_${fieldType.type}`}
//                   index={index}
//                 >
//                   {(provided, snapshot) => (
//                     <div
//                       ref={provided.innerRef}
//                       {...provided.draggableProps}
//                       {...provided.dragHandleProps}
//                       className={`
//                         flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-move
//                         hover:shadow-md transition-shadow
//                         ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
//                       `}
//                       onClick={() => addField(fieldType.type)}
//                     >
//                       <span className="text-2xl mr-3">{fieldType.icon}</span>
//                       <span className="font-medium text-gray-700">{fieldType.label}</span>
//                     </div>
//                   )}
//                 </Draggable>
//               ))}
//               {provided.placeholder}
//             </div>
//           )}
//         </Droppable>
//       </div>

//       {/* Form Canvas */}
//       <div className="flex-1 flex">
//         <div className="flex-1 p-6 overflow-y-auto">
//           <div className="max-w-4xl mx-auto">
//             <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-96">
//               {schema.fields.length === 0 ? (
//                 <div className="flex items-center justify-center h-96 text-gray-500">
//                   <div className="text-center">
//                     <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No fields yet</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       Drag field types from the sidebar to get started
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <Droppable droppableId="formFields">
//                   {(provided, snapshot) => (
//                     <div
//                       {...provided.droppableProps}
//                       ref={provided.innerRef}
//                       className={`p-6 space-y-4 min-h-96 ${
//                         snapshot.isDraggingOver ? 'bg-blue-50' : ''
//                       }`}
//                     >
//                       {schema.fields.map((field: FormField, index: number) => (
//                         <Draggable key={field.id} draggableId={field.id} index={index}>
//                           {(provided, snapshot) => (
//                             <div
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               className={`
//                                 relative group bg-white border rounded-lg p-4
//                                 ${selectedField?.id === field.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
//                                 ${snapshot.isDragging ? 'shadow-xl rotate-1' : ''}
//                                 hover:border-gray-300 transition-colors
//                               `}
//                               onClick={() => setSelectedField(field)}
//                             >
//                               {/* Drag Handle */}
//                               <div
//                                 {...provided.dragHandleProps}
//                                 className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 cursor-move"
//                               >
//                                 <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                                   <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
//                                 </svg>
//                               </div>

//                               {/* Field Actions */}
//                               <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     duplicateField(field);
//                                   }}
//                                   className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
//                                   title="Duplicate field"
//                                 >
//                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                                   </svg>
//                                 </button>
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     deleteField(field.id);
//                                   }}
//                                   className="p-1 text-gray-400 hover:text-red-500 transition-colors"
//                                   title="Delete field"
//                                 >
//                                   <TrashIcon className="w-4 h-4" />
//                                 </button>
//                               </div>

//                               {/* Field Preview */}
//                               <div className="mt-4">
//                                 <FieldRenderer field={field} value="" onChange={() => {}} disabled />
//                               </div>
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}
//                       {provided.placeholder}
//                     </div>
//                   )}
//                 </Droppable>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Field Editor Sidebar */}
//         {selectedField && (
//           <div className="w-96 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
//             <FieldEditor
//               field={selectedField}
//               onUpdate={updateField}
//               onClose={() => setSelectedField(null)}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderPreviewView = () => (
//     <div className="max-w-4xl mx-auto p-6">
//       <div className="bg-white rounded-lg shadow-sm border p-8">
//         <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Preview</h2>
//         <form className="space-y-6">
//           {schema.fields.map((field: unknown) => (
//             <FieldRenderer
//               key={field.id}
//               field={field}
//               value=""
//               onChange={() => {}}
//             />
//           ))}
//           <div className="flex justify-end space-x-3 pt-6">
//             <button
//               type="button"
//               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//               Save Draft
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
//             >
//               Submit Form
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   if (isPreviewMode) {
//     return renderPreviewView();
//   }

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       <div className="h-full flex flex-col">
//         {/* Toolbar */}
//         <div className="bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-center justify-between">
//             <h2 className="text-lg font-semibold text-gray-900">Form Builder</h2>
            
//             <div className="flex items-center space-x-3">
//               {onSave && (
//                 <button
//                   onClick={() => {
//                     const formData = {
//                       name: editingForm?.name || 'New Form',
//                       description: editingForm?.description || '',
//                       schema: schema,
//                       status: editingForm?.status || 'draft',
//                       allow_multiple_submissions: editingForm?.allow_multiple_submissions ?? false,
//                       require_authentication: editingForm?.require_authentication ?? true,
//                       auto_save_drafts: editingForm?.auto_save_drafts ?? true,
//                     };
//                     onSave(formData);
//                   }}
//                   className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   Save Form
//                 </button>
//               )}
              
//               <div className="flex rounded-lg border border-gray-300 overflow-hidden">
//                 <button
//                   onClick={() => setViewMode('builder')}
//                   className={`px-4 py-2 text-sm font-medium ${
//                     viewMode === 'builder'
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-white text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Builder
//                 </button>
//                 <button
//                   onClick={() => setViewMode('preview')}
//                   className={`px-4 py-2 text-sm font-medium ${
//                     viewMode === 'preview'
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-white text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <EyeIcon className="w-4 h-4 inline mr-1" />
//                   Preview
//                 </button>
//                 <button
//                   onClick={() => setViewMode('json')}
//                   className={`px-4 py-2 text-sm font-medium ${
//                     viewMode === 'json'
//                       ? 'bg-blue-600 text-white'
//                       : 'bg-white text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <CodeBracketIcon className="w-4 h-4 inline mr-1" />
//                   JSON
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="flex-1 overflow-hidden">
//           {viewMode === 'builder' && renderBuilderView()}
//           {viewMode === 'preview' && renderPreviewView()}
//           {viewMode === 'json' && (
//             <div className="h-full p-6">
//               <SchemaEditor
//                 schema={schema}
//                 onChange={handleSchemaUpdate}
//               />
//             </div>
//           )}
//         </div>
//       </div>
//     </DragDropContext>
//   );
// }

'use client';

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon, TrashIcon, EyeIcon, CodeBracketIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { FormField, FormSchema, FieldType, FormTemplate } from '@/types';
import { generateFieldName } from '@/lib/utils';
import FieldEditor from '../FormBuilder/FieldEditor';
import FieldRenderer from '../FormBuilder/FieldRenderer';
import SchemaEditor from './SchemaEditor';
import toast from 'react-hot-toast';

interface FormBuilderProps {
  initialSchema?: FormSchema;
  onSchemaChange: (schema: FormSchema) => void;
  isPreviewMode?: boolean;
  onSave?: (formData: FormTemplate) => void;
  editingForm?: FormTemplate | null;
}

const FIELD_TYPES: Array<{ type: FieldType; label: string; icon: string }> = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'textarea', label: 'Textarea', icon: '📄' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'phone', label: 'Phone', icon: '📞' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'datetime', label: 'Date & Time', icon: '🕐' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'multiselect', label: 'Multi Select', icon: '☑️' },
  { type: 'checkbox', label: 'Checkbox', icon: '✅' },
  { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'files', label: 'Multiple Files', icon: '📎' },
  { type: 'richtext', label: 'Rich Text', icon: '📝' },
  { type: 'rating', label: 'Rating', icon: '⭐' },
  { type: 'slider', label: 'Slider', icon: '🎚️' },
  { type: 'address', label: 'Address', icon: '🏠' },
  { type: 'signature', label: 'Signature', icon: '✍️' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
];

export default function FormBuilder({ 
  initialSchema, 
  onSchemaChange, 
  isPreviewMode = false, 
  onSave,
  editingForm 
}: FormBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(
    initialSchema || { fields: [], settings: { allowDrafts: true } }
  );
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [viewMode, setViewMode] = useState<'builder' | 'preview' | 'json' | 'settings'>('builder');
  const [formSettings, setFormSettings] = useState({
    name: editingForm?.name || 'New Form',
    description: editingForm?.description || '',
    status: editingForm?.status || 'draft',
    allow_multiple_submissions: editingForm?.allow_multiple_submissions ?? true,
    require_authentication: editingForm?.require_authentication ?? true,
    auto_save_drafts: editingForm?.auto_save_drafts ?? true,
  });

  const handleSchemaUpdate = useCallback((newSchema: FormSchema) => {
    setSchema(newSchema);
    onSchemaChange(newSchema);
  }, [onSchemaChange]);

  const createField = (type: FieldType, label?: string): FormField => {
    const fieldLabel = label || FIELD_TYPES.find(ft => ft.type === type)?.label || type;
    return {
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: generateFieldName(fieldLabel),
      label: fieldLabel,
      type,
      required: false,
      placeholder: `Enter ${fieldLabel.toLowerCase()}...`,
      description: '',
      options: type === 'select' || type === 'multiselect' || type === 'radio' 
        ? [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }]
        : undefined,
      validation: [],
      config: {},
    };
  };

  const addField = (type: FieldType) => {
    const newField = createField(type);
    const updatedSchema = {
      ...schema,
      fields: [...schema.fields, newField],
    };
    handleSchemaUpdate(updatedSchema);
    setSelectedField(newField);
    toast.success('Field added successfully');
  };

  const updateField = (updatedField: FormField) => {
    const updatedSchema = {
      ...schema,
      fields: schema.fields.map((field: FormField) =>
        field.id === updatedField.id ? updatedField : field
      ),
    };
    handleSchemaUpdate(updatedSchema);
    setSelectedField(updatedField);
  };

  const deleteField = (fieldId: string) => {
    const updatedSchema = {
      ...schema,
      fields: schema.fields.filter((field: FormField) => field.id !== fieldId),
    };
    handleSchemaUpdate(updatedSchema);
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
    toast.success('Field deleted successfully');
  };

  const duplicateField = (field: FormField) => {
    const duplicatedField = {
      ...field,
      id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${field.name}_copy`,
      label: `${field.label} (Copy)`,
    };
    
    const fieldIndex = schema.fields.findIndex((f: FormField) => f.id === field.id);
    const updatedFields = [...schema.fields];
    updatedFields.splice(fieldIndex + 1, 0, duplicatedField);
    
    const updatedSchema = { ...schema, fields: updatedFields };
    handleSchemaUpdate(updatedSchema);
    toast.success('Field duplicated successfully');
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'fieldTypes' && destination.droppableId === 'formFields') {
      // Adding new field from sidebar
      const fieldType = FIELD_TYPES[source.index].type;
      const newField = createField(fieldType);
      
      const updatedFields = [...schema.fields];
      updatedFields.splice(destination.index, 0, newField);
      
      const updatedSchema = { ...schema, fields: updatedFields };
      handleSchemaUpdate(updatedSchema);
      setSelectedField(newField);
      toast.success('Field added successfully');
    } else if (source.droppableId === 'formFields' && destination.droppableId === 'formFields') {
      // Reordering existing fields
      const updatedFields = Array.from(schema.fields);
      const [reorderedField] = updatedFields.splice(source.index, 1);
      updatedFields.splice(destination.index, 0, reorderedField);
      
      const updatedSchema = { ...schema, fields: updatedFields };
      handleSchemaUpdate(updatedSchema);
    }
  };

  const handleSave = () => {
    if (onSave) {
      const formData: FormTemplate = {
        ...formSettings,
        schema: schema,
        id: '',
        created_by: '',
        created_by_name: '',
        version: 0,
        created_at: '',
        updated_at: '',
        submission_count: 0
      };
      onSave(formData);
    }
  };

  const renderBuilderView = () => (
    <div className="flex h-full">
      {/* Field Types Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Types</h3>
        <Droppable droppableId="fieldTypes" isDropDisabled={true}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
              {FIELD_TYPES.map((fieldType, index) => (
                <Draggable
                  key={fieldType.type}
                  draggableId={`fieldType_${fieldType.type}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`
                        flex items-center p-3 bg-white border border-gray-200 rounded-lg cursor-move
                        hover:shadow-md transition-shadow
                        ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}
                      `}
                      onClick={() => addField(fieldType.type)}
                    >
                      <span className="text-2xl mr-3">{fieldType.icon}</span>
                      <span className="font-medium text-gray-700">{fieldType.label}</span>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>

      {/* Form Canvas */}
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-96">
              {schema.fields.length === 0 ? (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  <div className="text-center">
                    <PlusIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No fields yet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Drag field types from the sidebar to get started
                    </p>
                  </div>
                </div>
              ) : (
                <Droppable droppableId="formFields">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-6 space-y-4 min-h-96 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {schema.fields.map((field: FormField, index: number) => (
                        <Draggable key={field.id} draggableId={field.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`
                                relative group bg-white border rounded-lg p-4
                                ${selectedField?.id === field.id ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
                                ${snapshot.isDragging ? 'shadow-xl rotate-1' : ''}
                                hover:border-gray-300 transition-colors
                              `}
                              onClick={() => setSelectedField(field)}
                            >
                              {/* Drag Handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 cursor-move"
                              >
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M7 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 8a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM13 14a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>
                                </svg>
                              </div>

                              {/* Field Actions */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    duplicateField(field);
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                  title="Duplicate field"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteField(field.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete field"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Field Preview */}
                              <div className="mt-4">
                                <FieldRenderer field={field} value="" onChange={() => {}} disabled />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </div>

        {/* Field Editor Sidebar */}
        {selectedField && (
          <div className="w-96 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            <FieldEditor
              field={selectedField}
              onUpdate={updateField}
              onClose={() => setSelectedField(null)}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewView = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Preview</h2>
        <form className="space-y-6">
          {schema.fields.map((field: FormField) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value=""
              onChange={() => {}}
            />
          ))}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Save Draft
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Submit Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Form Settings</h2>
        
        <div className="space-y-6">
          {/* Form Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Name *
            </label>
            <input
              type="text"
              value={formSettings.name}
              onChange={(e) => setFormSettings(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter form name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formSettings.description}
              onChange={(e) => setFormSettings(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter form description"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formSettings.status}
              onChange={(e) => setFormSettings(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allow Multiple Submissions
                </label>
                <p className="text-sm text-gray-500">
                  Users can submit this form multiple times
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormSettings(prev => ({ 
                  ...prev, 
                  allow_multiple_submissions: !prev.allow_multiple_submissions 
                }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formSettings.allow_multiple_submissions ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formSettings.allow_multiple_submissions ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Require Authentication
                </label>
                <p className="text-sm text-gray-500">
                  Users must be logged in to access this form
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormSettings(prev => ({ 
                  ...prev, 
                  require_authentication: !prev.require_authentication 
                }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formSettings.require_authentication ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formSettings.require_authentication ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto-save Drafts
                </label>
                <p className="text-sm text-gray-500">
                  Automatically save form progress as draft
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormSettings(prev => ({ 
                  ...prev, 
                  auto_save_drafts: !prev.auto_save_drafts 
                }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formSettings.auto_save_drafts ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formSettings.auto_save_drafts ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isPreviewMode) {
    return renderPreviewView();
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Form Builder</h2>
            
            <div className="flex items-center space-x-3">
              {onSave && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Form
                </button>
              )}
              
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('builder')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'builder'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Builder
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'preview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <EyeIcon className="w-4 h-4 inline mr-1" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode('settings')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'settings'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Cog6ToothIcon className="w-4 h-4 inline mr-1" />
                  Settings
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'json'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CodeBracketIcon className="w-4 h-4 inline mr-1" />
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'builder' && renderBuilderView()}
          {viewMode === 'preview' && renderPreviewView()}
          {viewMode === 'settings' && renderSettingsView()}
          {viewMode === 'json' && (
            <div className="h-full p-6">
              <SchemaEditor
                schema={schema}
                onChange={handleSchemaUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}