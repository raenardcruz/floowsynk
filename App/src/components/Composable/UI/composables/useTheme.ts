import { computed, ref, watch, readonly } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'
import type { ThemeMode, ThemeConfig } from '../types'

/**
 * Theme management composable with VueUse integration
 * Provides theme switching, persistence, and CSS custom property management
 */
export function useTheme() {
  // Detect user's preferred color scheme
  const prefersDark = usePreferredDark()
  
  // Persist theme preference in localStorage
  const themeMode = useStorage<ThemeMode>('floowsynk-theme', 'auto')
  
  // Compute the actual theme based on mode and system preference
  const currentTheme = computed(() => {
    if (themeMode.value === 'auto') {
      return prefersDark.value ? 'dark' : 'light'
    }
    return themeMode.value
  })
  
  // Apply theme to document
  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      const bgColor = theme === 'dark' ? '#111827' : '#F9FAFB'
      metaThemeColor.setAttribute('content', bgColor)
    }
  }
  
  // Watch for theme changes and apply them
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme)
  }, { immediate: true })
  
  // Theme configuration object
  const themeConfig = computed<ThemeConfig>(() => ({
    colors: {
      primary: currentTheme.value === 'dark' ? '#3B82F6' : '#14376B',
      secondary: currentTheme.value === 'dark' ? '#6B7280' : '#374151',
      success: '#10B981',
      warning: '#FF8F00',
      error: '#EF4444',
      info: '#3AA9B6',
      background: currentTheme.value === 'dark' ? '#111827' : '#F9FAFB',
      surface: currentTheme.value === 'dark' ? '#374151' : '#FFFFFF',
      text: currentTheme.value === 'dark' ? '#FFFFFF' : '#111827'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
    }
  }))
  
  // Theme switching functions
  const setTheme = (mode: ThemeMode) => {
    themeMode.value = mode
  }
  
  const toggleTheme = () => {
    if (themeMode.value === 'light') {
      setTheme('dark')
    } else if (themeMode.value === 'dark') {
      setTheme('auto')
    } else {
      setTheme('light')
    }
  }
  
  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')
  const setAutoTheme = () => setTheme('auto')
  
  return {
    // Reactive state
    themeMode: readonly(themeMode),
    currentTheme: readonly(currentTheme),
    themeConfig: readonly(themeConfig),
    
    // Computed properties
    isDark: computed(() => currentTheme.value === 'dark'),
    isLight: computed(() => currentTheme.value === 'light'),
    isAuto: computed(() => themeMode.value === 'auto'),
    
    // Methods
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setAutoTheme
  }
}

/**
 * Get CSS custom property value
 */
export function useCSSVar(property: string) {
  const value = ref('')
  
  const updateValue = () => {
    const computedValue = getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim()
    value.value = computedValue
  }
  
  // Update on mount and theme changes
  updateValue()
  
  // Watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        updateValue()
      }
    })
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
  
  return {
    value: readonly(value),
    update: updateValue
  }
}