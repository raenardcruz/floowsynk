/**
 * Theme integration utilities for PrimeVue migration
 * Handles CSS custom property mapping and theme synchronization
 */

import type { ThemeConfig } from './types'

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  theme: {
    preset: 'Aura',
    options: {
      darkModeSelector: '[data-theme="dark"]',
      cssLayer: {
        name: 'primevue',
        order: 'base, primevue, utilities'
      }
    }
  },
  customProperties: {
    // Map existing CSS custom properties to PrimeVue tokens
    '--color-primary': 'var(--p-primary-color)',
    '--color-primary-hover': 'var(--p-primary-600)',
    '--color-primary-light': 'var(--p-primary-400)',
    '--color-primary-lighter': 'var(--p-primary-200)',
    
    '--color-secondary': 'var(--p-surface-600)',
    '--color-secondary-hover': 'var(--p-surface-500)',
    '--color-secondary-light': 'var(--p-surface-300)',
    '--color-secondary-lighter': 'var(--p-surface-100)',
    
    '--color-success': 'var(--p-green-500)',
    '--color-success-hover': 'var(--p-green-400)',
    '--color-success-light': 'var(--p-green-300)',
    '--color-success-lighter': 'var(--p-green-100)',
    
    '--color-warning': 'var(--p-orange-500)',
    '--color-warning-hover': 'var(--p-orange-400)',
    '--color-warning-light': 'var(--p-orange-300)',
    '--color-warning-lighter': 'var(--p-orange-100)',
    
    '--color-error': 'var(--p-red-500)',
    '--color-error-hover': 'var(--p-red-400)',
    '--color-error-light': 'var(--p-red-300)',
    '--color-error-lighter': 'var(--p-red-100)',
    
    '--color-info': 'var(--p-blue-500)',
    '--color-info-hover': 'var(--p-blue-400)',
    '--color-info-light': 'var(--p-blue-300)',
    '--color-info-lighter': 'var(--p-blue-100)',
    
    '--color-background': 'var(--p-surface-0)',
    '--color-surface': 'var(--p-surface-50)',
    '--color-surface-hover': 'var(--p-surface-100)',
    '--color-surface-active': 'var(--p-surface-200)',
    
    '--color-text-primary': 'var(--p-surface-900)',
    '--color-text-secondary': 'var(--p-surface-700)',
    '--color-text-muted': 'var(--p-surface-500)',
    '--color-text-disabled': 'var(--p-surface-300)',
    '--color-text-inverse': 'var(--p-surface-0)',
    
    '--color-border': 'var(--p-surface-300)',
    '--color-border-hover': 'var(--p-surface-400)',
    '--color-border-focus': 'var(--p-primary-color)',
    '--color-border-error': 'var(--p-red-500)'
  }
}

/**
 * Applies theme integration CSS custom properties
 */
export const applyThemeIntegration = (config: ThemeConfig = defaultThemeConfig): void => {
  const root = document.documentElement
  
  // Apply custom property mappings
  Object.entries(config.customProperties).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })
  
  // Add CSS layer ordering if not already present
  if (!document.querySelector('#primevue-layer-order')) {
    const style = document.createElement('style')
    style.id = 'primevue-layer-order'
    style.textContent = `
      @layer ${config.theme.options.cssLayer.order};
    `
    document.head.appendChild(style)
  }
}

/**
 * Creates CSS custom properties for brand color integration
 */
export const createBrandColorIntegration = (): void => {
  const style = document.createElement('style')
  style.id = 'brand-color-integration'
  style.textContent = `
    @layer base {
      :root {
        /* Map existing brand colors to PrimeVue tokens */
        --p-primary-50: var(--blue-7, #e0f7ff);
        --p-primary-100: var(--blue-6, #b3e5fc);
        --p-primary-200: var(--blue-5, #BFDBFE);
        --p-primary-300: var(--blue-3, #60A5FA);
        --p-primary-400: var(--blue-4, #3AA9B6);
        --p-primary-500: var(--blue-2, #3B82F6);
        --p-primary-600: var(--blue-1, #14376B);
        --p-primary-700: var(--blue-1, #14376B);
        --p-primary-800: var(--blue-1, #14376B);
        --p-primary-900: var(--blue-1, #14376B);
        --p-primary-950: var(--blue-1, #14376B);
        
        /* Surface colors mapping */
        --p-surface-0: var(--white-1, #FFFFFF);
        --p-surface-50: var(--white-2, #F9FAFB);
        --p-surface-100: var(--white-3, #F3F4F6);
        --p-surface-200: var(--white-4, #E5E7EB);
        --p-surface-300: var(--white-5, #D1D5DB);
        --p-surface-400: var(--grey-4, #D1D5DB);
        --p-surface-500: var(--grey-3, #6B7280);
        --p-surface-600: var(--grey-2, #374151);
        --p-surface-700: var(--grey-2, #374151);
        --p-surface-800: var(--grey-1, #111827);
        --p-surface-900: var(--grey-1, #111827);
        --p-surface-950: var(--grey-1, #111827);
        
        /* Semantic color mappings */
        --p-green-100: var(--green-5, #A7F3D0);
        --p-green-300: var(--green-4, #6EE7B7);
        --p-green-400: var(--green-3, #34D399);
        --p-green-500: var(--green-2, #10B981);
        
        --p-red-100: var(--red-5, #FECACA);
        --p-red-300: var(--red-4, #FCA5A5);
        --p-red-400: var(--red-3, #F87171);
        --p-red-500: var(--red-2, #EF4444);
        
        --p-orange-100: var(--orange-5, #FFC107);
        --p-orange-300: var(--orange-4, #FFB300);
        --p-orange-400: var(--orange-3, #FC930F);
        --p-orange-500: var(--orange-2, #FF8F00);
        
        --p-blue-100: var(--blue-5, #BFDBFE);
        --p-blue-300: var(--blue-3, #60A5FA);
        --p-blue-400: var(--blue-4, #3AA9B6);
        --p-blue-500: var(--blue-2, #3B82F6);
      }
      
      /* Dark theme mappings */
      [data-theme="dark"] {
        --p-surface-0: var(--grey-1, #111827);
        --p-surface-50: var(--grey-2, #374151);
        --p-surface-100: var(--grey-3, #6B7280);
        --p-surface-200: var(--grey-4, #D1D5DB);
        --p-surface-900: var(--white-1, #FFFFFF);
        --p-surface-800: var(--white-2, #F9FAFB);
        --p-surface-700: var(--white-3, #F3F4F6);
      }
    }
  `
  
  // Remove existing style if present
  const existing = document.querySelector('#brand-color-integration')
  if (existing) {
    existing.remove()
  }
  
  document.head.appendChild(style)
}

/**
 * Synchronizes theme changes between existing system and PrimeVue
 */
export const syncThemeChanges = (): void => {
  // Watch for theme attribute changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        const theme = document.documentElement.getAttribute('data-theme')
        console.log(`Theme changed to: ${theme}`)
        // Re-apply theme integration if needed
        applyThemeIntegration()
      }
    })
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
}

/**
 * Initialize theme integration
 */
export const initializeThemeIntegration = (): void => {
  // Apply theme integration
  applyThemeIntegration()
  
  // Create brand color integration
  createBrandColorIntegration()
  
  // Set up theme synchronization
  syncThemeChanges()
  
  if (process.env.NODE_ENV === 'development') {
    console.log('PrimeVue theme integration initialized')
  }
}

// Auto-initialize when module is imported
initializeThemeIntegration()

// Import and run verification in development
if (process.env.NODE_ENV === 'development') {
  import('./verification').then(({ verifyMigrationFoundation, logMigrationStatus }) => {
    // Small delay to ensure everything is loaded
    setTimeout(() => {
      verifyMigrationFoundation()
      logMigrationStatus()
    }, 100)
  })
}