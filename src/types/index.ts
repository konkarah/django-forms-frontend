// src/types/index.ts

// ============================================
// USER TYPES
// ============================================
export interface User {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'client';
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'admin' | 'client';
  email_verified: boolean;
}

// ============================================
// FORM FIELD TYPES
// ============================================
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'files'
  | 'richtext'
  | 'rating'
  | 'slider'
  | 'address'
  | 'signature';

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'fileSize' | 'fileType';
  value?: any;
  message: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: FieldOption[];
  validation?: ValidationRule[];
  config?: FieldConfig;
}

export interface FieldConfig {
  // Common
  defaultValue?: any;
  readonly?: boolean;
  hidden?: boolean;
  className?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
  
  // Number & Slider
  min?: number;
  max?: number;
  step?: number;
  
  // Textarea
  rows?: number;
  
  // File Upload
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
  
  // Rating
  maxRating?: number;
  
  // Rich Text
  toolbar?: string[];
  
  // Address
  countries?: string[];
  
  // Conditional Logic
  conditionalLogic?: ConditionalLogic;
}

export interface ConditionalLogic {
  show?: boolean;
  conditions: Array<{
    field: string;
    operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value: any;
  }>;
  action: 'show' | 'hide' | 'require' | 'unrequire';
}

// ============================================
// FORM SCHEMA TYPES
// ============================================
export interface FormSchema {
  fields: FormField[];
  settings?: FormSettings;
}

export interface FormSettings {
  multiStep?: boolean;
  showProgressBar?: boolean;
  allowDrafts?: boolean;
  saveOnPageChange?: boolean;
  confirmBeforeSubmit?: boolean;
  successMessage?: string;
  redirectUrl?: string;
}

// ============================================
// FORM TEMPLATE TYPES
// ============================================
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_by_name: string;
  status: 'draft' | 'active' | 'inactive';
  schema: FormSchema;
  allow_multiple_submissions: boolean;
  require_authentication: boolean;
  auto_save_drafts: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  submission_count: number;
}

export interface FormTemplateCreateUpdate {
  name: string;
  description?: string;
  status?: 'draft' | 'active' | 'inactive';
  schema: FormSchema;
  allow_multiple_submissions?: boolean;
  require_authentication?: boolean;
  auto_save_drafts?: boolean;
}

// ============================================
// FORM SUBMISSION TYPES
// ============================================
export interface FormSubmission {
  id: string;
  form_template: string;
  form_name: string;
  submitted_by?: string;
  submitted_by_name: string;
  data: Record<string, any>;
  schema_version: number;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  files: FileUpload[];
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes: string;
  is_complete: boolean;
}

export interface FormSubmissionCreate {
  form_template: string;
  data: Record<string, any>;
  status: 'draft' | 'submitted';
}

export interface FormSubmissionUpdate {
  data?: Record<string, any>;
  status?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  review_notes?: string;
}

// ============================================
// FILE UPLOAD TYPES
// ============================================
export interface FileUpload {
  id: string;
  field_name: string;
  original_filename: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
  url: string;
}

export interface FileUploadRequest {
  file: File;
  field_name: string;
  submission_id: string;
}

export interface FileUploadProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  error?: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================
export type NotificationType = 
  | 'form_submitted' 
  | 'form_reviewed' 
  | 'form_approved' 
  | 'form_rejected' 
  | 'system';

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_object_id?: string;
  related_object_type?: string;
  is_read: boolean;
  is_emailed: boolean;
  created_at: string;
  read_at?: string;
  email_sent_at?: string;
}

export interface NotificationCreate {
  recipient_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_object_id?: string;
  related_object_type?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================
export interface FormAnalytics {
  total_submissions: number;
  completed_submissions: number;
  draft_submissions: number;
  completion_rate: number;
  submissions_by_day: SubmissionByDay[];
  field_analytics: Record<string, FieldAnalytics>;
}

export interface SubmissionByDay {
  date: string;
  count: number;
}

export interface FieldAnalytics {
  label: string;
  type: string;
  filled_count: number;
  fill_rate: number;
}

export interface DashboardStats {
  total_forms: number;
  active_forms: number;
  total_submissions: number;
  pending_reviews: number;
  approved_submissions: number;
  rejected_submissions: number;
  draft_submissions: number;
  unread_notifications: number;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

// ============================================
// FORM BUILDER TYPES
// ============================================
export interface FormBuilderState {
  schema: FormSchema;
  selectedField: FormField | null;
  viewMode: 'builder' | 'preview' | 'json';
  isDirty: boolean;
}

export interface DragDropResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
  draggableId: string;
}

// ============================================
// VALIDATION TYPES
// ============================================
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================
// UTILITY TYPES
// ============================================
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// ============================================
// HOOK TYPES
// ============================================
export interface UseFormReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

// ============================================
// COMPONENT PROP TYPES
// ============================================
export interface FormBuilderProps {
  initialSchema?: FormSchema;
  onSchemaChange: (schema: FormSchema) => void;
  onSave?: (formData: FormTemplateCreateUpdate) => void;
  editingForm?: FormTemplate | null;
  isPreviewMode?: boolean;
}

export interface FieldEditorProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onClose: () => void;
}

export interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
  onFileUpload?: (files: File[]) => Promise<string[]>;
}

export interface SchemaEditorProps {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
}

// ============================================
// CONSTANTS & ENUMS
// ============================================
export const FIELD_TYPES: Array<{
  type: FieldType;
  label: string;
  icon: string;
  category: 'basic' | 'selection' | 'file' | 'advanced';
}> = [
  { type: 'text', label: 'Text Input', icon: '📝', category: 'basic' },
  { type: 'textarea', label: 'Textarea', icon: '📄', category: 'basic' },
  { type: 'number', label: 'Number', icon: '🔢', category: 'basic' },
  { type: 'email', label: 'Email', icon: '📧', category: 'basic' },
  { type: 'phone', label: 'Phone', icon: '📞', category: 'basic' },
  { type: 'date', label: 'Date', icon: '📅', category: 'basic' },
  { type: 'datetime', label: 'Date & Time', icon: '🕐', category: 'basic' },
  { type: 'select', label: 'Dropdown', icon: '📋', category: 'selection' },
  { type: 'multiselect', label: 'Multi Select', icon: '☑️', category: 'selection' },
  { type: 'checkbox', label: 'Checkbox', icon: '✅', category: 'selection' },
  { type: 'radio', label: 'Radio Buttons', icon: '🔘', category: 'selection' },
  { type: 'file', label: 'File Upload', icon: '📎', category: 'file' },
  { type: 'files', label: 'Multiple Files', icon: '📎', category: 'file' },
  { type: 'richtext', label: 'Rich Text', icon: '📝', category: 'advanced' },
  { type: 'rating', label: 'Rating', icon: '⭐', category: 'advanced' },
  { type: 'slider', label: 'Slider', icon: '🎚️', category: 'advanced' },
  { type: 'address', label: 'Address', icon: '🏠', category: 'advanced' },
  { type: 'signature', label: 'Signature', icon: '✍️', category: 'advanced' },
];

export const FORM_STATUSES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const SUBMISSION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
} as const;