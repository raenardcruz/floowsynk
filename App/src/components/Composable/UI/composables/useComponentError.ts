import { ref, readonly, computed, getCurrentInstance } from 'vue'
import { useTimeoutFn } from '@vueuse/core'

/**
 * Component error handling composable
 * Provides error state management with automatic clearing
 */
export function useComponentError(options: {
  autoClearTimeout?: number
  logErrors?: boolean
} = {}) {
  const {
    autoClearTimeout = 5000,
    logErrors = true
  } = options
  
  // Error state
  const error = ref<Error | string | null>(null)
  const errorId = ref<string | null>(null)
  
  // Auto-clear timeout
  const { start: startTimeout, stop: stopTimeout } = useTimeoutFn(() => {
    clearError()
  }, autoClearTimeout, { immediate: false })
  
  /**
   * Set an error
   */
  const setError = (err: Error | string, id?: string) => {
    error.value = err
    errorId.value = id || Date.now().toString()
    
    // Log error if enabled
    if (logErrors) {
      console.error('Component Error:', err)
    }
    
    // Start auto-clear timeout
    if (autoClearTimeout > 0) {
      startTimeout()
    }
  }
  
  /**
   * Clear the current error
   */
  const clearError = () => {
    error.value = null
    errorId.value = null
    stopTimeout()
  }
  
  /**
   * Handle async operations with error catching
   */
  const handleAsync = async <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      clearError()
      return await operation()
    } catch (err) {
      const message = errorMessage || (err instanceof Error ? err.message : 'An error occurred')
      setError(message)
      return null
    }
  }
  
  /**
   * Wrap a function with error handling
   */
  const withErrorHandling = <T extends (...args: any[]) => any>(
    fn: T,
    errorMessage?: string
  ): T => {
    return ((...args: Parameters<T>) => {
      try {
        clearError()
        const result = fn(...args)
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((err) => {
            const message = errorMessage || (err instanceof Error ? err.message : 'An error occurred')
            setError(message)
            throw err
          })
        }
        
        return result
      } catch (err) {
        const message = errorMessage || (err instanceof Error ? err.message : 'An error occurred')
        setError(message)
        throw err
      }
    }) as T
  }
  
  // Computed properties
  const hasError = computed(() => error.value !== null)
  const errorMessage = computed(() => {
    if (!error.value) return null
    return error.value instanceof Error ? error.value.message : error.value
  })
  
  return {
    // State
    error: readonly(error),
    errorId: readonly(errorId),
    hasError,
    errorMessage,
    
    // Methods
    setError,
    clearError,
    handleAsync,
    withErrorHandling
  }
}

/**
 * Global error handler for unhandled errors
 */
export function useGlobalErrorHandler() {
  const errors = ref<Array<{ id: string; error: Error | string; timestamp: Date }>>([])
  
  const addError = (error: Error | string) => {
    const errorEntry = {
      id: Date.now().toString(),
      error,
      timestamp: new Date()
    }
    
    errors.value.push(errorEntry)
    
    // Keep only last 10 errors
    if (errors.value.length > 10) {
      errors.value = errors.value.slice(-10)
    }
  }
  
  const removeError = (id: string) => {
    const index = errors.value.findIndex(err => err.id === id)
    if (index > -1) {
      errors.value.splice(index, 1)
    }
  }
  
  const clearAllErrors = () => {
    errors.value = []
  }
  
  // Set up global error handlers
  const setupGlobalHandlers = () => {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      addError(event.reason)
      console.error('Unhandled promise rejection:', event.reason)
    })
    
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      addError(event.error || event.message)
      console.error('JavaScript error:', event.error || event.message)
    })
    
    // Handle Vue errors (if using Vue 3 error handler)
    const app = getCurrentInstance()?.appContext.app
    if (app) {
      app.config.errorHandler = (error: any, _instance: any, info: any) => {
        addError(error)
        console.error('Vue error:', error, info)
      }
    }
  }
  
  return {
    errors: readonly(errors),
    addError,
    removeError,
    clearAllErrors,
    setupGlobalHandlers
  }
}