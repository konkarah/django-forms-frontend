import * as yup from 'yup';
import { FormField } from '@/types';

export const createFieldValidation = (field: FormField) => {
  let validator: any;

  switch (field.type) {
    case 'text':
    case 'textarea':
      validator = yup.string();
      break;
    case 'email':
      validator = yup.string().email('Invalid email format');
      break;
    case 'number':
      validator = yup.number().typeError('Must be a number');
      break;
    case 'date':
    case 'datetime':
      validator = yup.date().typeError('Invalid date');
      break;
    case 'phone':
      validator = yup.string().matches(
        /^[\+]?[1-9][\d]{0,15}$/,
        'Invalid phone number'
      );
      break;
    case 'checkbox':
      validator = yup.boolean();
      break;
    case 'select':
    case 'radio':
      validator = yup.string();
      break;
    case 'multiselect':
      validator = yup.array().of(yup.string());
      break;
    case 'file':
    case 'files':
      validator = yup.mixed();
      break;
    default:
      validator = yup.mixed();
  }

  // Apply field-specific validations
  if (field.required) {
    if (field.type === 'checkbox') {
      validator = validator.oneOf([true], `${field.label} is required`);
    } else if (field.type === 'multiselect') {
      validator = validator.min(1, `${field.label} is required`);
    } else {
      validator = validator.required(`${field.label} is required`);
    }
  }

  // Apply validation rules
  field.validation?.forEach((rule) => {
    switch (rule.type) {
      case 'minLength':
        validator = validator.min(rule.value, rule.message);
        break;
      case 'maxLength':
        validator = validator.max(rule.value, rule.message);
        break;
      case 'min':
        validator = validator.min(rule.value, rule.message);
        break;
      case 'max':
        validator = validator.max(rule.value, rule.message);
        break;
      case 'pattern':
        validator = validator.matches(new RegExp(rule.value), rule.message);
        break;
    }
  });

  return validator;
};

export const createFormValidationSchema = (fields: FormField[]) => {
  const schemaFields: Record<string, any> = {};

  fields.forEach((field) => {
    schemaFields[field.name] = createFieldValidation(field);
  });

  return yup.object().shape(schemaFields);
};