import type { ComponentSize, ComponentVariant } from '../types'

/**
 * Generate CSS classes for component variants
 */
export function getVariantClasses(
  variant: ComponentVariant | 'outline' | 'ghost' = 'primary',
  prefix = 'btn'
): string[] {
  return [`${prefix}-${variant}`]
}

/**
 * Generate CSS classes for component sizes
 */
export function getSizeClasses(
  size: ComponentSize = 'medium',
  prefix = 'btn'
): string[] {
  return [`${prefix}-${size}`]
}

/**
 * Generate CSS classes for component states
 */
export function getStateClasses(states: {
  disabled?: boolean
  loading?: boolean
  focused?: boolean
  hovered?: boolean
}, prefix = 'component'): string[] {
  const classes: string[] = []
  
  if (states.disabled) classes.push(`${prefix}-disabled`)
  if (states.loading) classes.push(`${prefix}-loading`)
  if (states.focused) classes.push(`${prefix}-focused`)
  if (states.hovered) classes.push(`${prefix}-hovered`)
  
  return classes
}

/**
 * Merge CSS classes from various sources
 */
export function mergeClasses(...classes: (string | string[] | Record<string, boolean> | undefined)[]): string {
  const result: string[] = []
  
  for (const cls of classes) {
    if (!cls) continue
    
    if (typeof cls === 'string') {
      result.push(cls)
    } else if (Array.isArray(cls)) {
      result.push(...cls)
    } else if (typeof cls === 'object') {
      for (const [key, value] of Object.entries(cls)) {
        if (value) result.push(key)
      }
    }
  }
  
  return result.join(' ')
}

/**
 * Generate unique component ID
 */
export function generateId(prefix = 'component'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const cloned = {} as T
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }
  return obj
}

/**
 * Merge component classes with additional classes
 */
export function mergeComponentClasses(
  wrapperClasses: string | object | Array<string | object> | undefined,
  additionalClasses: string | undefined
): string | object | Array<string | object> | undefined {
  if (!wrapperClasses && !additionalClasses) return undefined
  if (!wrapperClasses) return additionalClasses
  if (!additionalClasses) return wrapperClasses
  
  if (typeof wrapperClasses === 'string') {
    return `${wrapperClasses} ${additionalClasses}`
  }
  
  if (Array.isArray(wrapperClasses)) {
    return [...wrapperClasses, additionalClasses]
  }
  
  return [wrapperClasses, additionalClasses]
}

/**
 * Extract event handlers from attributes
 */
export function extractEventHandlers(attrs: Record<string, any>) {
  const events: Record<string, any> = {}
  const otherAttrs: Record<string, any> = {}
  
  Object.entries(attrs).forEach(([key, value]) => {
    if (key.startsWith('on') && typeof value === 'function') {
      events[key] = value
    } else {
      otherAttrs[key] = value
    }
  })
  
  return { events, otherAttrs }
}