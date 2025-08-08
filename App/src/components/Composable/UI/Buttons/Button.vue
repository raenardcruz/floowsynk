<template>
  <button
    ref="buttonRef"
    :id="id"
    :type="type || 'button'"
    :class="classes"
    :style="style"
    :disabled="isDisabled"
    :aria-label="tooltip || label"
    :aria-pressed="isPressed"
    :aria-busy="loading"
    :title="tooltip"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
  >
    <!-- Loading state -->
    <template v-if="loading">
      <slot name="loading">
        <span class="btn-loading-spinner" aria-hidden="true"></span>
      </slot>
      <span v-if="loadingText" class="btn-text">{{ loadingText }}</span>
    </template>
    
    <!-- Normal state -->
    <template v-else>
      <!-- Icon (left position or icon-only) -->
      <span 
        v-if="icon && (!iconPosition || iconPosition === 'left')"
        class="btn-icon"
        aria-hidden="true"
      >
        <slot name="icon">
          <component v-if="typeof icon !== 'string'" :is="icon" />
          <span v-else v-html="icon"></span>
        </slot>
      </span>
      
      <!-- Button text/content -->
      <span v-if="label || $slots.default" class="btn-text">
        <slot>{{ label }}</slot>
      </span>
      
      <!-- Icon (right position) -->
      <span 
        v-if="icon && iconPosition === 'right'"
        class="btn-icon"
        aria-hidden="true"
      >
        <slot name="icon">
          <component v-if="typeof icon !== 'string'" :is="icon" />
          <span v-else v-html="icon"></span>
        </slot>
      </span>
    </template>
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useButtonInteractions, useButtonSize, useButtonLoading, useButtonClasses } from './Button.hooks'
import type { ButtonProps, ButtonEmits } from './Button.types'

// Props and emits
const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  iconPosition: 'left',
  type: 'button',
  block: false,
  rounded: false,
  disabled: false,
  loading: false
})

const emit = defineEmits<ButtonEmits>()

// Template refs
const buttonRef = ref<HTMLElement>()

// Composables
const { isPressed, isFocused, isHovered, isDisabled, handleClick, handleFocus, handleBlur } = 
  useButtonInteractions(buttonRef, props, emit)

// Keyboard event handlers for template
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Enter') {
    if (!isDisabled.value) {
      isPressed.value = true
      event.preventDefault()
    }
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  if (event.key === ' ' || event.key === 'Enter') {
    isPressed.value = false
    if (!isDisabled.value) {
      handleClick(event as any)
    }
  }
}

const { width, height, isCompact, isWide } = useButtonSize(buttonRef)

const { isLoading, loadingText, startLoading, stopLoading } = useButtonLoading(props)

const { classes } = useButtonClasses(props, { isPressed, isFocused, isHovered, isDisabled })

// Watch for loading state changes
import { watch } from 'vue'
watch(() => props.loading, (newLoading) => {
  if (newLoading) {
    startLoading()
  } else {
    stopLoading()
  }
}, { immediate: true })

// Expose useful properties for parent components
defineExpose({
  buttonRef,
  width,
  height,
  isCompact,
  isWide,
  isPressed,
  isFocused,
  isHovered,
  isDisabled,
  isLoading
})
</script>

<style scoped>
@import './Button.styles.css';
</style>