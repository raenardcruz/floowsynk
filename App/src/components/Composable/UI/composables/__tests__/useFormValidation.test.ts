import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { useFormValidation, validationRules } from '../useFormValidation'

// Mock VueUse composables
vi.mock('@vueuse/core', () => ({
  watchPausable: vi.fn(() => ({
    pause: vi.fn(),
    resume: vi.fn(),
  })),
}))

describe('useFormValidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const initialValues = { name: '', email: '' }
    const form = useFormValidation(initialValues)

    expect(form.values.name).toBe('')
    expect(form.values.email).toBe('')
    expect(form.isValid.value).toBe(true)
    expect(form.hasErrors.value).toBe(false)
    expect(form.isDirty.value).toBe(false)
    expect(form.isTouched.value).toBe(false)
  })

  it('should validate required fields', async () => {
    const initialValues = { name: '', email: '' }
    const rules = {
      name: [validationRules.required()],
      email: [validationRules.required()]
    }
    const form = useFormValidation(initialValues, rules)

    const isValid = await form.validateForm()

    expect(isValid).toBe(false)
    expect(form.hasErrors.value).toBe(true)
    expect(form.getFieldError('name')).toBe('This field is required')
    expect(form.getFieldError('email')).toBe('This field is required')
  })

  it('should validate email format', async () => {
    const initialValues = { email: 'invalid-email' }
    const rules = {
      email: [validationRules.email()]
    }
    const form = useFormValidation(initialValues, rules)

    const isValid = await form.validateField('email')

    expect(isValid).toBe(false)
    expect(form.getFieldError('email')).toBe('Must be a valid email address')
  })

  it('should validate minimum length', async () => {
    const initialValues = { password: '123' }
    const rules = {
      password: [validationRules.minLength(6)]
    }
    const form = useFormValidation(initialValues, rules)

    const isValid = await form.validateField('password')

    expect(isValid).toBe(false)
    expect(form.getFieldError('password')).toBe('Must be at least 6 characters')
  })

  it('should validate maximum length', async () => {
    const initialValues = { username: 'verylongusernamethatexceedslimit' }
    const rules = {
      username: [validationRules.maxLength(10)]
    }
    const form = useFormValidation(initialValues, rules)

    const isValid = await form.validateField('username')

    expect(isValid).toBe(false)
    expect(form.getFieldError('username')).toBe('Must be no more than 10 characters')
  })

  it('should validate numeric ranges', async () => {
    const initialValues = { age: 5, score: 150 }
    const rules = {
      age: [validationRules.min(18)],
      score: [validationRules.max(100)]
    }
    const form = useFormValidation(initialValues, rules)

    await form.validateField('age')
    await form.validateField('score')

    expect(form.getFieldError('age')).toBe('Must be at least 18')
    expect(form.getFieldError('score')).toBe('Must be no more than 100')
  })

  it('should validate with custom patterns', async () => {
    const initialValues = { phone: '123-456' }
    const phonePattern = /^\d{3}-\d{3}-\d{4}$/
    const rules = {
      phone: [validationRules.pattern(phonePattern, 'Phone must be in format XXX-XXX-XXXX')]
    }
    const form = useFormValidation(initialValues, rules)

    const isValid = await form.validateField('phone')

    expect(isValid).toBe(false)
    expect(form.getFieldError('phone')).toBe('Phone must be in format XXX-XXX-XXXX')
  })

  it('should handle multiple validation rules', async () => {
    const initialValues = { email: '' }
    const rules = {
      email: [
        validationRules.required(),
        validationRules.email()
      ]
    }
    const form = useFormValidation(initialValues, rules)

    // Test required validation first
    const isValid1 = await form.validateField('email')
    expect(isValid1).toBe(false)
    expect(form.getFieldError('email')).toBe('This field is required')

    // Test email validation - need to clear the required error first
    form.clearFieldError('email')
    form.setFieldValue('email', 'invalid-email')
    await form.validateField('email')
    expect(form.getFieldError('email')).toBe('Must be a valid email address')

    // Test valid email
    form.setFieldValue('email', 'test@example.com')
    await form.validateField('email')
    expect(form.hasFieldError('email')).toBe(false)
  })

  it('should track field state correctly', () => {
    const initialValues = { name: 'John', email: '' }
    const form = useFormValidation(initialValues)

    // Initially not touched or dirty
    expect(form.isFieldTouched('name')).toBe(false)
    expect(form.isFieldDirty('name')).toBe(false)

    // Set field value
    form.setFieldValue('name', 'Jane')

    expect(form.isFieldTouched('name')).toBe(true)
    expect(form.isFieldDirty('name')).toBe(true)
    expect(form.values.name).toBe('Jane')

    // Set back to original value
    form.setFieldValue('name', 'John')
    expect(form.isFieldDirty('name')).toBe(false)
  })

  it('should handle manual error setting and clearing', () => {
    const initialValues = { name: '' }
    const form = useFormValidation(initialValues)

    // Set manual error
    form.setFieldError('name', 'Custom error message')
    expect(form.getFieldError('name')).toBe('Custom error message')
    expect(form.hasFieldError('name')).toBe(true)

    // Clear error
    form.clearFieldError('name')
    expect(form.hasFieldError('name')).toBe(false)
  })

  it('should reset form correctly', () => {
    const initialValues = { name: 'John', email: 'john@example.com' }
    const form = useFormValidation(initialValues)

    // Modify form
    form.setFieldValue('name', 'Jane')
    form.setFieldError('email', 'Some error')
    form.touchField('name')

    expect(form.values.name).toBe('Jane')
    expect(form.hasFieldError('email')).toBe(true)
    expect(form.isFieldTouched('name')).toBe(true)

    // Reset form
    form.resetForm()

    expect(form.values.name).toBe('John')
    expect(form.values.email).toBe('john@example.com')
    expect(form.hasFieldError('email')).toBe(false)
    expect(form.isFieldTouched('name')).toBe(false)
    expect(form.isDirty.value).toBe(false)
  })

  it('should reset individual fields', () => {
    const initialValues = { name: 'John', email: 'john@example.com' }
    const form = useFormValidation(initialValues)

    // Modify field
    form.setFieldValue('name', 'Jane')
    form.setFieldError('name', 'Some error')

    expect(form.values.name).toBe('Jane')
    expect(form.hasFieldError('name')).toBe(true)

    // Reset specific field
    form.resetField('name')

    expect(form.values.name).toBe('John')
    expect(form.hasFieldError('name')).toBe(false)
    expect(form.isFieldTouched('name')).toBe(false)
    expect(form.isFieldDirty('name')).toBe(false)
  })

  it('should handle touch field method', async () => {
    const initialValues = { name: '' }
    const rules = {
      name: [validationRules.required()]
    }
    const form = useFormValidation(initialValues, rules)

    expect(form.isFieldTouched('name')).toBe(false)

    // Touch field should mark as touched and trigger validation
    await form.touchField('name')

    expect(form.isFieldTouched('name')).toBe(true)
    expect(form.hasFieldError('name')).toBe(true)
  })

  it('should provide validation control methods', () => {
    const initialValues = { name: '' }
    const form = useFormValidation(initialValues)

    expect(typeof form.pauseValidation).toBe('function')
    expect(typeof form.resumeValidation).toBe('function')
  })

  it('should handle async validation', async () => {
    const asyncRule = async (value: string) => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return value === 'valid' ? true : 'Async validation failed'
    }

    const initialValues = { field: 'invalid' }
    const rules = { field: [asyncRule] }
    const form = useFormValidation(initialValues, rules)

    expect(form.isValidating.value).toBe(false)

    const validationPromise = form.validateForm()
    expect(form.isValidating.value).toBe(true)

    const isValid = await validationPromise
    expect(form.isValidating.value).toBe(false)
    expect(isValid).toBe(false)
    expect(form.getFieldError('field')).toBe('Async validation failed')
  })
})

describe('validationRules', () => {
  it('should create required rule with default message', () => {
    const rule = validationRules.required()
    
    expect(rule('')).toBe('This field is required')
    expect(rule(null)).toBe('This field is required')
    expect(rule(undefined)).toBe('This field is required')
    expect(rule('value')).toBe(true)
  })

  it('should create required rule with custom message', () => {
    const rule = validationRules.required('Name is required')
    
    expect(rule('')).toBe('Name is required')
    expect(rule('value')).toBe(true)
  })

  it('should create email rule', () => {
    const rule = validationRules.email()
    
    expect(rule('invalid-email')).toBe('Must be a valid email address')
    expect(rule('test@example.com')).toBe(true)
    expect(rule('')).toBe(true) // Empty is valid (use required for mandatory)
  })

  it('should create pattern rule', () => {
    const rule = validationRules.pattern(/^\d+$/, 'Must be numeric')
    
    expect(rule('abc')).toBe('Must be numeric')
    expect(rule('123')).toBe(true)
    expect(rule('')).toBe(true) // Empty is valid
  })

  it('should create length rules', () => {
    const minRule = validationRules.minLength(3)
    const maxRule = validationRules.maxLength(10)
    
    expect(minRule('ab')).toBe('Must be at least 3 characters')
    expect(minRule('abc')).toBe(true)
    
    expect(maxRule('verylongtext')).toBe('Must be no more than 10 characters')
    expect(maxRule('short')).toBe(true)
  })

  it('should create numeric range rules', () => {
    const minRule = validationRules.min(18)
    const maxRule = validationRules.max(100)
    
    expect(minRule(17)).toBe('Must be at least 18')
    expect(minRule(18)).toBe(true)
    
    expect(maxRule(101)).toBe('Must be no more than 100')
    expect(maxRule(100)).toBe(true)
  })
})