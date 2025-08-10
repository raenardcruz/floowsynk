/**
 * Performance Monitoring Utilities
 * 
 * This module provides utilities for monitoring application performance,
 * particularly focusing on component loading times and bundle impact.
 */

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  componentLoadTime: number
  bundleSize: number
  memoryUsage: number
  renderTime: number
}

/**
 * Component performance tracker
 */
export class ComponentPerformanceTracker {
  private static instance: ComponentPerformanceTracker
  private metrics: Map<string, PerformanceMetrics> = new Map()

  static getInstance(): ComponentPerformanceTracker {
    if (!ComponentPerformanceTracker.instance) {
      ComponentPerformanceTracker.instance = new ComponentPerformanceTracker()
    }
    return ComponentPerformanceTracker.instance
  }

  /**
   * Start tracking a component's performance
   */
  startTracking(componentName: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${componentName}-start`)
    }
  }

  /**
   * End tracking and record metrics
   */
  endTracking(componentName: string): PerformanceMetrics | null {
    if (typeof performance === 'undefined') {
      return null
    }

    try {
      performance.mark(`${componentName}-end`)
      performance.measure(
        `${componentName}-duration`,
        `${componentName}-start`,
        `${componentName}-end`
      )

      const measure = performance.getEntriesByName(`${componentName}-duration`)[0]
      const metrics: PerformanceMetrics = {
        componentLoadTime: measure.duration,
        bundleSize: this.estimateBundleSize(componentName),
        memoryUsage: this.getMemoryUsage(),
        renderTime: measure.duration
      }

      this.metrics.set(componentName, metrics)
      return metrics
    } catch (error) {
      console.warn(`Failed to track performance for ${componentName}:`, error)
      return null
    }
  }

  /**
   * Get performance metrics for a component
   */
  getMetrics(componentName: string): PerformanceMetrics | undefined {
    return this.metrics.get(componentName)
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics)
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
    if (typeof performance !== 'undefined') {
      performance.clearMarks()
      performance.clearMeasures()
    }
  }

  /**
   * Estimate bundle size impact of a component
   */
  private estimateBundleSize(componentName: string): number {
    // Rough estimates based on component complexity
    const sizeEstimates: Record<string, number> = {
      'Button': 15000,
      'TextInput': 8000,
      'PasswordInput': 12000,
      'Select': 25000,
      'Checkbox': 8000,
      'Modal': 20000,
      'Sidebar': 15000,
      'Loading': 6000,
      'Notif': 18000,
      'Tabs': 22000,
      'Table': 45000,
      'KeyValue': 10000,
      'ListField': 12000,
      'TextCodeInput': 8000,
      'MonacoEditor': 2500000 // Monaco is large
    }

    return sizeEstimates[componentName] || 5000
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize || 0
    }
    return 0
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const metrics = Array.from(this.metrics.entries())
    
    if (metrics.length === 0) {
      return 'No performance metrics available'
    }

    let report = '📊 Component Performance Report\n'
    report += '=' .repeat(50) + '\n\n'

    // Sort by load time (slowest first)
    metrics.sort(([, a], [, b]) => b.componentLoadTime - a.componentLoadTime)

    metrics.forEach(([componentName, metric]) => {
      report += `🔧 ${componentName}\n`
      report += `   Load Time: ${metric.componentLoadTime.toFixed(2)}ms\n`
      report += `   Bundle Size: ${(metric.bundleSize / 1000).toFixed(1)}KB\n`
      report += `   Memory Usage: ${(metric.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`
      report += `   Render Time: ${metric.renderTime.toFixed(2)}ms\n\n`
    })

    // Summary statistics
    const totalLoadTime = metrics.reduce((sum, [, m]) => sum + m.componentLoadTime, 0)
    const totalBundleSize = metrics.reduce((sum, [, m]) => sum + m.bundleSize, 0)
    const avgLoadTime = totalLoadTime / metrics.length

    report += '📈 Summary\n'
    report += `---------\n`
    report += `Total Components: ${metrics.length}\n`
    report += `Total Load Time: ${totalLoadTime.toFixed(2)}ms\n`
    report += `Average Load Time: ${avgLoadTime.toFixed(2)}ms\n`
    report += `Estimated Bundle Impact: ${(totalBundleSize / 1024).toFixed(1)}KB\n`

    return report
  }
}

/**
 * Vue composable for component performance tracking
 */
export function usePerformanceTracking(componentName: string) {
  const tracker = ComponentPerformanceTracker.getInstance()

  const startTracking = () => {
    tracker.startTracking(componentName)
  }

  const endTracking = () => {
    return tracker.endTracking(componentName)
  }

  const getMetrics = () => {
    return tracker.getMetrics(componentName)
  }

  return {
    startTracking,
    endTracking,
    getMetrics
  }
}

/**
 * Performance monitoring decorator for components
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  componentName: string,
  fn: T
): T {
  return ((...args: any[]) => {
    const tracker = ComponentPerformanceTracker.getInstance()
    tracker.startTracking(componentName)
    
    try {
      const result = fn(...args)
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => {
          tracker.endTracking(componentName)
        })
      }
      
      tracker.endTracking(componentName)
      return result
    } catch (error) {
      tracker.endTracking(componentName)
      throw error
    }
  }) as T
}

/**
 * Log performance metrics to console (development only)
 */
export function logPerformanceMetrics(): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const tracker = ComponentPerformanceTracker.getInstance()
  const report = tracker.generateReport()
  console.log(report)
}

/**
 * Bundle size analyzer
 */
export class BundleSizeAnalyzer {
  /**
   * Estimate the bundle size impact of importing specific PrimeVue components
   */
  static estimatePrimeVueImpact(components: string[]): number {
    const componentSizes: Record<string, number> = {
      'Button': 15000,
      'InputText': 8000,
      'FloatLabel': 5000,
      'Password': 12000,
      'Select': 25000,
      'Checkbox': 8000,
      'Dialog': 20000,
      'Sidebar': 15000,
      'ProgressSpinner': 6000,
      'Toast': 18000,
      'TabView': 22000,
      'TabPanel': 5000,
      'DataTable': 45000,
      'Column': 8000
    }

    return components.reduce((total, component) => {
      return total + (componentSizes[component] || 5000)
    }, 0)
  }

  /**
   * Get recommendations for bundle optimization
   */
  static getOptimizationRecommendations(bundleSize: number): string[] {
    const recommendations: string[] = []

    if (bundleSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push('Consider code splitting for large components')
      recommendations.push('Implement lazy loading for route-specific components')
    }

    if (bundleSize > 1 * 1024 * 1024) { // 1MB
      recommendations.push('Enable tree shaking in your build configuration')
      recommendations.push('Use dynamic imports for heavy dependencies')
    }

    if (bundleSize > 500 * 1024) { // 500KB
      recommendations.push('Consider using PrimeVue\'s unstyled mode for smaller bundle')
      recommendations.push('Audit unused dependencies and remove them')
    }

    recommendations.push('Use Vite\'s bundle analyzer to identify large chunks')
    recommendations.push('Enable gzip compression on your server')

    return recommendations
  }
}

// Export singleton instance
export const performanceTracker = ComponentPerformanceTracker.getInstance()