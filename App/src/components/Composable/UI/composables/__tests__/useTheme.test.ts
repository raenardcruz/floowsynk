import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'

// Mock VueUse composables
vi.mock('@vueuse/core', () => ({
  usePreferredDark: vi.fn(() => ref(false)),
  useStorage: vi.fn(() => ref('auto')),
}))

import { useTheme, useCSSVar } from '../useTheme'

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset document.documentElement mock
    document.documentElement.setAttribute = vi.fn()
    document.documentElement.getAttribute = vi.fn()
  })

  it('should initialize with default values', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    vi.mocked(usePreferredDark).mockReturnValue(ref(false))
    vi.mocked(useStorage).mockReturnValue(ref('auto'))

    const theme = useTheme()

    expect(theme.themeMode.value).toBe('auto')
    expect(theme.currentTheme.value).toBe('light')
    expect(theme.isDark.value).toBe(false)
    expect(theme.isLight.value).toBe(true)
    expect(theme.isAuto.value).toBe(true)
  })

  it('should return dark theme when prefersDark is true and mode is auto', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    vi.mocked(usePreferredDark).mockReturnValue(ref(true))
    vi.mocked(useStorage).mockReturnValue(ref('auto'))

    const theme = useTheme()

    expect(theme.currentTheme.value).toBe('dark')
    expect(theme.isDark.value).toBe(true)
    expect(theme.isLight.value).toBe(false)
  })

  it('should return light theme when mode is explicitly set to light', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    vi.mocked(usePreferredDark).mockReturnValue(ref(true))
    vi.mocked(useStorage).mockReturnValue(ref('light'))

    const theme = useTheme()

    expect(theme.currentTheme.value).toBe('light')
    expect(theme.isDark.value).toBe(false)
    expect(theme.isLight.value).toBe(true)
    expect(theme.isAuto.value).toBe(false)
  })

  it('should return dark theme when mode is explicitly set to dark', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    vi.mocked(usePreferredDark).mockReturnValue(ref(false))
    vi.mocked(useStorage).mockReturnValue(ref('dark'))

    const theme = useTheme()

    expect(theme.currentTheme.value).toBe('dark')
    expect(theme.isDark.value).toBe(true)
    expect(theme.isLight.value).toBe(false)
    expect(theme.isAuto.value).toBe(false)
  })

  it('should provide theme configuration object', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    vi.mocked(usePreferredDark).mockReturnValue(ref(false))
    vi.mocked(useStorage).mockReturnValue(ref('light'))

    const theme = useTheme()

    expect(theme.themeConfig.value).toHaveProperty('colors')
    expect(theme.themeConfig.value).toHaveProperty('spacing')
    expect(theme.themeConfig.value).toHaveProperty('borderRadius')
    expect(theme.themeConfig.value).toHaveProperty('shadows')

    expect(theme.themeConfig.value.colors).toHaveProperty('primary')
    expect(theme.themeConfig.value.colors).toHaveProperty('secondary')
    expect(theme.themeConfig.value.colors).toHaveProperty('background')
    expect(theme.themeConfig.value.colors).toHaveProperty('text')
  })

  it('should provide different colors for light and dark themes', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    
    // Test light theme
    vi.mocked(usePreferredDark).mockReturnValue(ref(false))
    vi.mocked(useStorage).mockReturnValue(ref('light'))
    const lightTheme = useTheme()
    const lightColors = lightTheme.themeConfig.value.colors

    // Test dark theme
    vi.mocked(useStorage).mockReturnValue(ref('dark'))
    const darkTheme = useTheme()
    const darkColors = darkTheme.themeConfig.value.colors

    expect(lightColors.background).not.toBe(darkColors.background)
    expect(lightColors.text).not.toBe(darkColors.text)
  })

  it('should provide theme switching methods', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    const mockStorage = ref('auto')
    vi.mocked(usePreferredDark).mockReturnValue(ref(false))
    vi.mocked(useStorage).mockReturnValue(mockStorage)

    const theme = useTheme()

    expect(typeof theme.setTheme).toBe('function')
    expect(typeof theme.toggleTheme).toBe('function')
    expect(typeof theme.setLightTheme).toBe('function')
    expect(typeof theme.setDarkTheme).toBe('function')
    expect(typeof theme.setAutoTheme).toBe('function')

    // Test setTheme
    theme.setTheme('dark')
    expect(mockStorage.value).toBe('dark')

    // Test convenience methods
    theme.setLightTheme()
    expect(mockStorage.value).toBe('light')

    theme.setDarkTheme()
    expect(mockStorage.value).toBe('dark')

    theme.setAutoTheme()
    expect(mockStorage.value).toBe('auto')
  })

  it('should toggle theme correctly', async () => {
    const { usePreferredDark, useStorage } = await import('@vueuse/core')
    const mockStorage = ref('light')
    vi.mocked(usePreferredDark).mockReturnValue(ref(false))
    vi.mocked(useStorage).mockReturnValue(mockStorage)

    const theme = useTheme()

    // From light to dark
    theme.toggleTheme()
    expect(mockStorage.value).toBe('dark')

    // From dark to auto
    theme.toggleTheme()
    expect(mockStorage.value).toBe('auto')

    // From auto to light
    theme.toggleTheme()
    expect(mockStorage.value).toBe('light')
  })
})

describe('useCSSVar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock getComputedStyle
    global.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('  #ffffff  ')
    })
  })

  it('should return CSS custom property value', () => {
    const cssVar = useCSSVar('--color-primary')
    
    expect(cssVar.value.value).toBe('#ffffff')
    expect(global.getComputedStyle).toHaveBeenCalledWith(document.documentElement)
  })

  it('should provide update method', () => {
    const cssVar = useCSSVar('--color-primary')
    
    expect(typeof cssVar.update).toBe('function')
    
    // Mock a different value
    const mockGetPropertyValue = vi.fn().mockReturnValue('  #000000  ')
    global.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: mockGetPropertyValue
    })
    
    cssVar.update()
    expect(cssVar.value.value).toBe('#000000')
  })
})