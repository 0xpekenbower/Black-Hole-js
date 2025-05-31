'use client';

/**
 * Hook for handling authentication forms
 * @module hooks/useAuthForm
 */

import { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Form field with value and validation state
 */
interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
}

/**
 * Form validation rules
 */
interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: string) => string | null;
}

/**
 * Form fields configuration
 */
type FormConfig<T> = {
  [K in keyof T]: {
    initialValue: T[K];
    validation?: ValidationRules;
  };
};

/**
 * Form state with field values and errors
 */
type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

/**
 * Form validation result
 */
interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string | null>;
}

/**
 * Hook for handling authentication forms with validation
 * @param formConfig - Form fields configuration
 * @returns Form state and handlers
 */
export function useAuthForm<T extends Record<string, any>>(formConfig: FormConfig<T>) {
  // Initialize form state from config
  const initialState = Object.entries(formConfig).reduce((acc, [key, config]) => {
    acc[key as keyof T] = {
      value: config.initialValue,
      error: null,
      touched: false,
    };
    return acc;
  }, {} as FormState<T>);

  const [formState, setFormState] = useState<FormState<T>>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { error: authError, clearError } = useAuth();

  /**
   * Validate a single form field
   * @param name - Field name
   * @param value - Field value
   * @returns Validation error message or null if valid
   */
  const validateField = (name: keyof T, value: any): string | null => {
    const rules = formConfig[name]?.validation;
    if (!rules) return null;

    if (rules.required && (value === '' || value === null || value === undefined)) {
      return 'This field is required';
    }

    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        return `Must be at least ${rules.minLength} characters`;
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return `Must be less than ${rules.maxLength} characters`;
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return 'Invalid format';
      }
    }

    if (rules.validate) {
      return rules.validate(value);
    }

    return null;
  };

  /**
   * Validate all form fields
   * @returns Validation result with isValid flag and errors
   */
  const validateForm = (): ValidationResult => {
    const errors: Record<string, string | null> = {};
    let isValid = true;

    Object.keys(formConfig).forEach((key) => {
      const fieldName = key as keyof T;
      const value = formState[fieldName].value;
      const error = validateField(fieldName, value);
      
      errors[key] = error;
      if (error) {
        isValid = false;
      }
    });

    return { isValid, errors };
  };

  /**
   * Handle form field change
   * @param name - Field name
   * @returns Change event handler
   */
  const handleChange = (name: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    const error = validateField(name, value);

    setFormState((prev) => ({
      ...prev,
      [name]: {
        value,
        error,
        touched: true,
      },
    }));

    // Clear auth error when user starts typing
    if (authError) {
      clearError();
    }
  };

  /**
   * Handle form field blur
   * @param name - Field name
   * @returns Blur event handler
   */
  const handleBlur = (name: keyof T) => () => {
    const { value } = formState[name];
    const error = validateField(name, value);

    setFormState((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
        touched: true,
      },
    }));
  };

  /**
   * Handle form submission
   * @param onSubmit - Submit callback function
   * @returns Form submit event handler
   */
  const handleSubmit = (onSubmit: (values: T) => Promise<void>) => async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const { isValid, errors } = validateForm();
    
    // Update form state with validation errors
    const newFormState = { ...formState };
    Object.keys(errors).forEach((key) => {
      const fieldName = key as keyof T;
      newFormState[fieldName] = {
        ...newFormState[fieldName],
        error: errors[key],
        touched: true,
      };
    });
    
    setFormState(newFormState);
    
    // If form is valid, submit
    if (isValid) {
      setIsSubmitting(true);
      
      try {
        // Extract values from form state
        const values = Object.entries(formState).reduce((acc, [key, field]) => {
          acc[key as keyof T] = field.value;
          return acc;
        }, {} as T);
        
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormState(initialState);
    if (authError) {
      clearError();
    }
  };

  /**
   * Get values from form state
   */
  const getValues = (): T => {
    return Object.entries(formState).reduce((acc, [key, field]) => {
      acc[key as keyof T] = field.value;
      return acc;
    }, {} as T);
  };

  return {
    formState,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    getValues,
    authError,
  };
} 