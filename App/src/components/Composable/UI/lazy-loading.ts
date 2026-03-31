/**
 * Lazy Loading Configuration for UI Components
 * 
 * This module provides lazy loading utilities for heavy components
 * to optimize initial bundle size and improve performance.
 */

import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'

/**
 * Lazy loading configuration options
 */
interface LazyLoadOptions {
  /** Loading component to show while async component is loading */
  loadingComponent?: Component
  /** Error component to show if loading fails */
  errorComponent?: Component
  /** Delay before showing loading component (ms) */
  delay?: number
  /** Timeout for loading (ms) */
  timeout?: number
  /** Retry attempts */
  retries?: number
}

/**
 * Default lazy loading options
 */
const defaultLazyLoadOptions: LazyLoadOptions = {
  delay: 200,
  timeout: 10000,
  retries: 3
}

/**
 * Create a lazy-loaded component with error handling and loading states
 */
export function createLazyComponent(
  loader: AsyncComponentLoader,
  options: LazyLoadOptions = {}
): Component {
  const config = { ...defaultLazyLoadOptions, ...options }

  return defineAsyncComponent({
    loader,
    loadingComponent: config.loadingComponent,
    errorComponent: config.errorComponent,
    delay: config.delay,
    timeout: config.timeout,
    onError: (error, retry, fail, attempts) => {
      if (attempts <= (config.retries || 3)) {
        console.warn(`Retrying component load (attempt ${attempts}):`, error)
        retry()
      } else {
        console.error('Failed to load component after retries:', error)
        fail()
      }
    }
  })
}

/**
 * Lazy-loaded UI components
 * These are heavy components that should be loaded on demand
 */
export const LazyComponents = {
  // Monaco Editor - very heavy component (2.5MB+)
  MonacoEditor: createLazyComponent(
    () => import('../MonacoEditor/MonacoEditor.vue'),
    {
      delay: 100, // Show loading quickly for editor
      timeout: 15000 // Longer timeout for Monaco
    }
  ),

  // Table component - heavy with DataTable
  Table: createLazyComponent(
    () => import('../Table/Table.vue'),
    {
      delay: 150
    }
  ),

  // Complex input components
  TextCodeInput: createLazyComponent(
    () => import('../Inputs/TextCodeInput.vue'),
    {
      delay: 100
    }
  ),

  ListField: createLazyComponent(
    () => import('../Inputs/ListField.vue'),
    {
      delay: 100
    }
  ),

  KeyValue: createLazyComponent(
    () => import('../Inputs/KeyValue.vue'),
    {
      delay: 100
    }
  )
}

/**
 * Route-based lazy loading for view components
 * These components are only loaded when their routes are accessed
 */
export const LazyViews = {
  // Workflow views - heavy due to Vue Flow and complex logic
  Workflow: createLazyComponent(
    () => import('../../../views/Workflow/Workflow.vue'),
    {
      delay: 200,
      timeout: 15000
    }
  ),

  WorkflowCanvas: createLazyComponent(
    () => import('../../../views/Workflow/Canvas/Workflow.Canvas.vue'),
    {
      delay: 200,
      timeout: 15000
    }
  ),

  // Pages view - heavy due to page builder functionality
  Pages: createLazyComponent(
    () => import('../../../views/Pages/Pages.vue'),
    {
      delay: 200
    }
  )
}

/**
 * Preload strategy for components
 */
export class ComponentPreloader {
  private static preloadedComponents = new Set<string>()

  /**
   * Preload a component in the background
   */
  static async preload(componentName: keyof typeof LazyComponents): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return
    }

    try {
      // Use requestIdleCallback if available for better performance
      if ('requestIdleCallback' in window) {
        return new Promise((resolve) => {
          requestIdleCallback(async () => {
            await LazyComponents[componentName]
            this.preloadedComponents.add(componentName)
            resolve()
          })
        })
      } else {
        // Fallback to setTimeout
        return new Promise((resolve) => {
          setTimeout(async () => {
            await LazyComponents[componentName]
            this.preloadedComponents.add(componentName)
            resolve()
          }, 100)
        })
      }
    } catch (error) {
      console.warn(`Failed to preload component ${componentName}:`, error)
    }
  }

  /**
   * Preload multiple components
   */
  static async preloadMultiple(
    componentNames: (keyof typeof LazyComponents)[]
  ): Promise<void> {
    const promises = componentNames.map(name => this.preload(name))
    await Promise.allSettled(promises)
  }

  /**
   * Preload components based on user interaction hints
   */
  static preloadOnHover(
    element: HTMLElement,
    componentName: keyof typeof LazyComponents
  ): void {
    let timeoutId: number

    const handleMouseEnter = () => {
      timeoutId = window.setTimeout(() => {
        this.preload(componentName)
      }, 100) // Small delay to avoid preloading on quick hovers
    }

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
}

/**
 * Bundle splitting recommendations
 */
export const BUNDLE_SPLITTING_CONFIG = {
  // Critical components that should be in the main bundle
  critical: [
    'Button',
    'TextInput',
    'PasswordInput',
    'Loading'
  ],

  // Components that can be lazy loaded
  lazy: [
    'MonacoEditor',
    'Table',
    'TextCodeInput',
    'ListField',
    'KeyValue'
  ],

  // Route-specific components
  routeSpecific: [
    'Workflow',
    'WorkflowCanvas', 
    'Pages'
  ]
}

/**
 * Performance monitoring for lazy loading
 */
export function trackLazyLoadPerformance(componentName: string) {
  const startTime = performance.now()

  return {
    onLoaded: () => {
      const loadTime = performance.now() - startTime
      console.log(`🚀 Lazy loaded ${componentName} in ${loadTime.toFixed(2)}ms`)
      
      // Track in performance metrics if available
      if (typeof performance !== 'undefined') {
        performance.mark(`lazy-${componentName}-loaded`)
        performance.measure(
          `lazy-${componentName}-duration`,
          `lazy-${componentName}-start`,
          `lazy-${componentName}-loaded`
        )
      }
    },
    onError: (error: Error) => {
      const failTime = performance.now() - startTime
      console.error(`❌ Failed to lazy load ${componentName} after ${failTime.toFixed(2)}ms:`, error)
    }
  }
}

/**
 * Utility to check if a component should be lazy loaded
 */
export function shouldLazyLoad(componentName: string): boolean {
  // Don't lazy load in SSR
  if (typeof window === 'undefined') {
    return false
  }

  // Don't lazy load critical components
  if (BUNDLE_SPLITTING_CONFIG.critical.includes(componentName)) {
    return false
  }

  // Lazy load heavy components
  if (BUNDLE_SPLITTING_CONFIG.lazy.includes(componentName)) {
    return true
  }

  // Check connection speed (if available)
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection && connection.effectiveType === 'slow-2g') {
      return true // Lazy load more aggressively on slow connections
    }
  }

  return false
}