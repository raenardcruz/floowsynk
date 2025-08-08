import { reactive, computed, ref, readonly, nextTick } from 'vue'
import { watchPausable } from '@vueuse/core'
import type { ValidationRule, ValidationRules } from '../types'

/**
 * Form validation composable with VueUse integration
 * Provides comprehensive form validation with field-level and form-level validation
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: ValidationRules<T> = {}
) {
  // Form values
  const values = reactive({ ...initialValues }) as T
  
  // Validation errors
  const errors = reactive<Record<string, string>>({})
  
  // Touched fields (fields that have been interacted with)
  const touched = reactive<Record<string, boolean>>({})
  
  // Dirty fields (fields that have been modified from initial values)
  const dirty = reactive<Record<string, boolean>>({})
  
  // Validation state
  const isValidating = ref(false)
  
  /**
   * Validate a single field
   */
  const validateField = async (field: keyof T): Promise<boolean> => {
    const fieldKey = String(field)
    const fieldRules = rules[field]
    if (!fieldRules || fieldRules.length === 0) {
      delete errors[fieldKey]
      return true
    }
    
    const value = values[field]
    
    for (const rule of fieldRules) {
      const result = await rule(value)
      if (result !== true) {
        errors[fieldKey] = typeof result === 'string' ? result : `${String(field)} is invalid`
        return false
      }
    }
    
    delete errors[fieldKey]
    return true
  }
  
  /**
   * Validate all fields
   */
  const validateForm = async (): Promise<boolean> => {
    isValidating.value = true
    
    try {
      const fieldKeys = Object.keys(rules) as (keyof T)[]
      const validationPromises = fieldKeys.map(field => validateField(field))
      const results = await Promise.all(validationPromises)
      
      return results.every(result => result === true)
    } finally {
      isValidating.value = false
    }
  }
  
  /**
   * Set field value and mark as touched/dirty
   */
  const setFieldValue = (field: keyof T, value: any) => {
    const fieldKey = String(field)
    values[field] = value
    touched[fieldKey] = true
    dirty[fieldKey] = value !== initialValues[field]
    
    // Validate field if it has been touched
    if (touched[fieldKey]) {
      nextTick(() => validateField(field))
    }
  }
  
  /**
   * Set field error manually
   */
  const setFieldError = (field: keyof T, error: string) => {
    const fieldKey = String(field)
    errors[fieldKey] = error
  }
  
  /**
   * Clear field error
   */
  const clearFieldError = (field: keyof T) => {
    const fieldKey = String(field)
    delete errors[fieldKey]
  }
  
  /**
   * Mark field as touched
   */
  const touchField = (field: keyof T) => {
    const fieldKey = String(field)
    touched[fieldKey] = true
    validateField(field)
  }
  
  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    // Reset values
    Object.keys(values).forEach(key => {
      values[key as keyof T] = initialValues[key as keyof T]
    })
    
    // Clear errors
    Object.keys(errors).forEach(key => {
      delete errors[key]
    })
    
    // Clear touched state
    Object.keys(touched).forEach(key => {
      delete touched[key]
    })
    
    // Clear dirty state
    Object.keys(dirty).forEach(key => {
      delete dirty[key]
    })
  }
  
  /**
   * Reset specific field
   */
  const resetField = (field: keyof T) => {
    const fieldKey = String(field)
    values[field] = initialValues[field]
    delete errors[fieldKey]
    delete touched[fieldKey]
    delete dirty[fieldKey]
  }
  
  // Watch for value changes to update dirty state
  const { pause, resume } = watchPausable(
    values,
    () => {
      Object.keys(values).forEach(key => {
        const field = key as keyof T
        const fieldKey = String(field)
        dirty[fieldKey] = values[field] !== initialValues[field]
      })
    },
    { deep: true }
  )
  
  // Computed properties
  const isValid = computed(() => Object.keys(errors).length === 0)
  const hasErrors = computed(() => Object.keys(errors).length > 0)
  const isDirty = computed(() => Object.values(dirty).some(Boolean))
  const isTouched = computed(() => Object.values(touched).some(Boolean))
  
  // Get error for specific field
  const getFieldError = (field: keyof T) => errors[String(field)]
  
  // Check if field has error
  const hasFieldError = (field: keyof T) => Boolean(errors[String(field)])
  
  // Check if field is touched
  const isFieldTouched = (field: keyof T) => Boolean(touched[String(field)])
  
  // Check if field is dirty
  const isFieldDirty = (field: keyof T) => Boolean(dirty[String(field)])
  
  return {
    // State
    values,
    errors: readonly(errors),
    touched: readonly(touched),
    dirty: readonly(dirty),
    isValidating: readonly(isValidating),
    
    // Computed
    isValid,
    hasErrors,
    isDirty,
    isTouched,
    
    // Field methods
    setFieldValue,
    setFieldError,
    clearFieldError,
    touchField,
    validateField,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    isFieldDirty,
    
    // Form methods
    validateForm,
    resetForm,
    resetField,
    
    // Control
    pauseValidation: pause,
    resumeValidation: resume
  }
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => {
    return (value: any) => {
      if (value === null || value === undefined || value === '') {
        return message
      }
      return true
    }
  },
  
  minLength: (min: number, message?: string): ValidationRule => {
    return (value: string) => {
      if (typeof value !== 'string' || value.length < min) {
        return message || `Must be at least ${min} characters`
      }
      return true
    }
  },
  
  maxLength: (max: number, message?: string): ValidationRule => {
    return (value: string) => {
      if (typeof value === 'string' && value.length > max) {
        return message || `Must be no more than ${max} characters`
      }
      return true
    }
  },
  
  email: (message = 'Must be a valid email address'): ValidationRule => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return (value: string) => {
      if (typeof value === 'string' && value && !emailRegex.test(value)) {
        return message
      }
      return true
    }
  },
  
  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => {
    return (value: string) => {
      if (typeof value === 'string' && value && !regex.test(value)) {
        return message
      }
      return true
    }
  },
  
  min: (min: number, message?: string): ValidationRule => {
    return (value: number) => {
      if (typeof value === 'number' && value < min) {
        return message || `Must be at least ${min}`
      }
      return true
    }
  },
  
  max: (max: number, message?: string): ValidationRule => {
    return (value: number) => {
      if (typeof value === 'number' && value > max) {
        return message || `Must be no more than ${max}`
      }
      return true
    }
  }
}