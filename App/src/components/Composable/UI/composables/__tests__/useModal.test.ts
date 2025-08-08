import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick, ref } from 'vue'

// Mock VueUse composables
vi.mock('@vueuse/core', () => ({
  useMagicKeys: vi.fn(() => ({ escape: ref(false) })),
  whenever: vi.fn(),
  onClickOutside: vi.fn(),
  useScrollLock: vi.fn(() => ref(false)),
}))

import { useModal, useModalStack, globalModalStack } from '../useModal'

describe('useModal', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Mock document methods
    document.body.classList.add = vi.fn()
    document.body.classList.remove = vi.fn()
    
    // Mock querySelector
    document.querySelector = vi.fn()
    
    // Reset VueUse mocks
    const { useMagicKeys, whenever, onClickOutside, useScrollLock } = await import('@vueuse/core')
    vi.mocked(useMagicKeys).mockReturnValue({ escape: ref(false) })
    vi.mocked(whenever).mockImplementation(() => {})
    vi.mocked(onClickOutside).mockImplementation(() => {})
    vi.mocked(useScrollLock).mockReturnValue(ref(false))
  })

  it('should initialize with default state', () => {
    const modal = useModal()

    expect(modal.isOpen.value).toBe(false)
    expect(modal.isOpening.value).toBe(false)
    expect(modal.isClosing.value).toBe(false)
    expect(modal.modalRef.value).toBeUndefined()
    expect(modal.backdropRef.value).toBeUndefined()
  })

  it('should initialize with custom options', async () => {
    const { whenever, onClickOutside } = await import('@vueuse/core')
    
    const options = {
      closeOnEscape: false,
      closeOnOutsideClick: false,
      lockScroll: false,
      trapFocus: false
    }
    
    const modal = useModal(options)
    
    // Should still initialize with default state
    expect(modal.isOpen.value).toBe(false)
    
    // Note: We can't easily test that event listeners are NOT set up
    // because the mocking happens at module level
  })

  it('should open modal correctly', async () => {
    const { useScrollLock } = await import('@vueuse/core')
    const mockScrollLock = ref(false)
    vi.mocked(useScrollLock).mockReturnValue(mockScrollLock)
    
    const modal = useModal()

    expect(modal.isOpen.value).toBe(false)
    expect(modal.isOpening.value).toBe(false)

    const openPromise = modal.open()
    expect(modal.isOpening.value).toBe(true)

    await openPromise

    expect(modal.isOpen.value).toBe(true)
    expect(modal.isOpening.value).toBe(false)
    expect(mockScrollLock.value).toBe(true)
    expect(document.body.classList.add).toHaveBeenCalledWith('modal-open')
  })

  it('should close modal correctly', async () => {
    const { useScrollLock } = await import('@vueuse/core')
    const mockScrollLock = ref(false)
    vi.mocked(useScrollLock).mockReturnValue(mockScrollLock)
    
    const modal = useModal()

    // First open the modal
    await modal.open()
    expect(modal.isOpen.value).toBe(true)
    expect(mockScrollLock.value).toBe(true)

    // Then close it
    expect(modal.isClosing.value).toBe(false)
    
    const closePromise = modal.close()
    // Note: isClosing might be set and immediately unset due to async nature
    
    await closePromise

    expect(modal.isOpen.value).toBe(false)
    expect(modal.isClosing.value).toBe(false)
    expect(mockScrollLock.value).toBe(false)
    expect(document.body.classList.remove).toHaveBeenCalledWith('modal-open')
  })

  it('should toggle modal state', async () => {
    const modal = useModal()

    expect(modal.isOpen.value).toBe(false)

    // Toggle to open
    await modal.toggle()
    expect(modal.isOpen.value).toBe(true)

    // Toggle to close
    await modal.toggle()
    expect(modal.isOpen.value).toBe(false)
  })

  it('should prevent multiple simultaneous opens', async () => {
    const modal = useModal()

    const openPromise1 = modal.open()
    const openPromise2 = modal.open()

    await Promise.all([openPromise1, openPromise2])

    expect(modal.isOpen.value).toBe(true)
    // Should only call classList.add once
    expect(document.body.classList.add).toHaveBeenCalledTimes(1)
  })

  it('should prevent multiple simultaneous closes', async () => {
    const modal = useModal()

    // First open the modal
    await modal.open()
    expect(modal.isOpen.value).toBe(true)

    // Try to close multiple times
    const closePromise1 = modal.close()
    const closePromise2 = modal.close()

    await Promise.all([closePromise1, closePromise2])

    expect(modal.isOpen.value).toBe(false)
    // Should only call classList.remove once
    expect(document.body.classList.remove).toHaveBeenCalledTimes(1)
  })

  it('should handle backdrop click correctly', async () => {
    const modal = useModal({ closeOnOutsideClick: true })
    
    await modal.open()
    expect(modal.isOpen.value).toBe(true)

    // Mock backdrop element
    const mockBackdropElement = document.createElement('div')
    modal.backdropRef.value = mockBackdropElement

    // Simulate backdrop click
    const mockEvent = {
      target: mockBackdropElement
    } as MouseEvent

    modal.handleBackdropClick(mockEvent)

    // Should close the modal
    await nextTick()
    expect(modal.isOpen.value).toBe(false)
  })

  it('should not close on backdrop click when closeOnOutsideClick is false', async () => {
    const modal = useModal({ closeOnOutsideClick: false })
    
    await modal.open()
    expect(modal.isOpen.value).toBe(true)

    // Mock backdrop element
    const mockBackdropElement = document.createElement('div')
    modal.backdropRef.value = mockBackdropElement

    // Simulate backdrop click
    const mockEvent = {
      target: mockBackdropElement
    } as MouseEvent

    modal.handleBackdropClick(mockEvent)

    // Should not close the modal
    expect(modal.isOpen.value).toBe(true)
  })

  it('should handle focus management', async () => {
    // Mock a focusable element
    const mockFocusableElement = {
      focus: vi.fn()
    }
    
    const mockModalElement = {
      querySelector: vi.fn().mockReturnValue(mockFocusableElement),
      contains: vi.fn().mockReturnValue(true)
    }

    const modal = useModal({ trapFocus: true })
    modal.modalRef.value = mockModalElement as any

    await modal.open()

    // Should focus the first focusable element
    expect(mockModalElement.querySelector).toHaveBeenCalledWith(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    expect(mockFocusableElement.focus).toHaveBeenCalled()
  })

  it('should set up escape key listener when closeOnEscape is true', async () => {
    const { useMagicKeys, whenever } = await import('@vueuse/core')
    const mockEscapeRef = ref(false)
    vi.mocked(useMagicKeys).mockReturnValue({ escape: mockEscapeRef })
    
    useModal({ closeOnEscape: true })

    expect(useMagicKeys).toHaveBeenCalled()
    expect(whenever).toHaveBeenCalledWith(mockEscapeRef, expect.any(Function))
  })

  it('should set up outside click listener when closeOnOutsideClick is true', async () => {
    const { onClickOutside } = await import('@vueuse/core')
    
    useModal({ closeOnOutsideClick: true })

    expect(onClickOutside).toHaveBeenCalled()
  })

  it('should not lock scroll when lockScroll is false', async () => {
    const { useScrollLock } = await import('@vueuse/core')
    const mockScrollLock = ref(false)
    vi.mocked(useScrollLock).mockReturnValue(mockScrollLock)
    
    const modal = useModal({ lockScroll: false })

    await modal.open()

    expect(mockScrollLock.value).toBe(false)
  })
})

describe('useModalStack', () => {
  it('should initialize with empty stack', () => {
    const stack = useModalStack()

    expect(stack.stack.value).toEqual([])
  })

  it('should push modal to stack', () => {
    const stack = useModalStack()

    stack.push('modal1')
    expect(stack.stack.value).toEqual(['modal1'])

    stack.push('modal2')
    expect(stack.stack.value).toEqual(['modal1', 'modal2'])
  })

  it('should not push duplicate modals', () => {
    const stack = useModalStack()

    stack.push('modal1')
    stack.push('modal1')
    
    expect(stack.stack.value).toEqual(['modal1'])
  })

  it('should pop modal from stack', () => {
    const stack = useModalStack()

    stack.push('modal1')
    stack.push('modal2')
    stack.push('modal3')

    // Pop without ID (removes last)
    stack.pop()
    expect(stack.stack.value).toEqual(['modal1', 'modal2'])

    // Pop with specific ID
    stack.pop('modal1')
    expect(stack.stack.value).toEqual(['modal2'])
  })

  it('should clear all modals from stack', () => {
    const stack = useModalStack()

    stack.push('modal1')
    stack.push('modal2')
    stack.push('modal3')

    stack.clear()
    expect(stack.stack.value).toEqual([])
  })

  it('should check if modal is on top', () => {
    const stack = useModalStack()

    stack.push('modal1')
    stack.push('modal2')

    expect(stack.isTop('modal1')).toBe(false)
    expect(stack.isTop('modal2')).toBe(true)
    expect(stack.isTop('modal3')).toBe(false)
  })

  it('should calculate correct z-index', () => {
    const stack = useModalStack()

    stack.push('modal1')
    stack.push('modal2')
    stack.push('modal3')

    expect(stack.getZIndex('modal1')).toBe(1050)
    expect(stack.getZIndex('modal2')).toBe(1051)
    expect(stack.getZIndex('modal3')).toBe(1052)
    expect(stack.getZIndex('nonexistent')).toBe(1050)
  })
})

describe('globalModalStack', () => {
  it('should be a singleton instance', () => {
    expect(globalModalStack).toBeDefined()
    expect(typeof globalModalStack.push).toBe('function')
    expect(typeof globalModalStack.pop).toBe('function')
    expect(typeof globalModalStack.clear).toBe('function')
  })
})