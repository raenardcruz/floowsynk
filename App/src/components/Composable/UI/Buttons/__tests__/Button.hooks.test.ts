import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { 
  useButtonState, 
  useButtonSize, 
  useButtonLoading, 
  useButtonClasses 
} from '../Button.hooks'
import type { ButtonProps } from '../Button.types'

// Mock VueUse composables
vi.mock('@vueuse/core', () => ({
  useElementSize: vi.fn(() => ({
    width: ref(150),
    height: ref(40)
  })),
  useTimeoutFn: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn()
  })),
  useEventListener: vi.fn()
}))

describe('Button Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useButtonState', () => {
    it('returns initial state', () => {
      const props: ButtonProps = {}
      const state = useButtonState(props)

      expect(state.isPressed.value).toBe(false)
      expect(state.isFocused.value).toBe(false)
      expect(state.isHovered.value).toBe(false)
      expect(state.isDisabled.value).toBe(false)
    })

    it('computes disabled state correctly', () => {
      const props: ButtonProps = { disabled: true }
      const state = useButtonState(props)

      expect(state.isDisabled.value).toBe(true)
    })

    it('computes disabled state when loading', () => {
      const props: ButtonProps = { loading: true }
      const state = useButtonState(props)

      expect(state.isDisabled.value).toBe(true)
    })
  })

  describe('useButtonSize', () => {
    it('returns element size information', () => {
      const buttonRef = ref<HTMLElement>()
      const size = useButtonSize(buttonRef)

      expect(size.width.value).toBe(0) // Default value when no element is attached
      expect(size.height.value).toBe(0) // Default value when no element is attached
      expect(size.isCompact.value).toBe(true) // 0 < 100
      expect(size.isWide.value).toBe(false) // 0 < 200
    })
  })

  describe('useButtonLoading', () => {
    it('returns loading state', () => {
      const props: ButtonProps = { loading: true }
      const loading = useButtonLoading(props)

      expect(loading.isLoading.value).toBe(true)
      expect(loading.loadingText.value).toBe('Loading...')
    })

    it('returns default loading text', () => {
      const props: ButtonProps = { loading: true }
      const loading = useButtonLoading(props)

      expect(loading.loadingText.value).toBe('Loading...')
    })

    it('provides loading control methods', () => {
      const props: ButtonProps = {}
      const loading = useButtonLoading(props)

      expect(typeof loading.startLoading).toBe('function')
      expect(typeof loading.stopLoading).toBe('function')
    })
  })

  describe('useButtonClasses', () => {
    it('returns default classes', () => {
      const props: ButtonProps = {}
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('p-button-wrapper')
    })

    it('applies variant classes', () => {
      const props: ButtonProps = { variant: 'secondary' }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('p-button-wrapper')
    })

    it('applies size classes', () => {
      const props: ButtonProps = { size: 'large' }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('p-button-wrapper')
    })

    it('applies state classes', () => {
      const props: ButtonProps = { disabled: true, loading: true }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('p-button-wrapper')
    })

    it('applies layout classes', () => {
      const props: ButtonProps = { block: true, rounded: true }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('p-button-wrapper')
    })

    it('applies icon position classes', () => {
      const props: ButtonProps = { icon: 'test-icon', iconPosition: 'right' }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('p-button-wrapper')
    })

    it('applies custom string class', () => {
      const props: ButtonProps = { class: 'custom-class' }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('custom-class')
    })

    it('applies custom array classes', () => {
      const props: ButtonProps = { class: ['class1', 'class2'] }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('class1')
      expect(classes.value).toContain('class2')
    })

    it('applies custom object classes', () => {
      const props: ButtonProps = { 
        class: { 
          'active': true, 
          'inactive': false 
        } 
      }
      const state = useButtonState(props)
      const { classes } = useButtonClasses(props, state)

      expect(classes.value).toContain('active')
      expect(classes.value).not.toContain('inactive')
    })
  })
})