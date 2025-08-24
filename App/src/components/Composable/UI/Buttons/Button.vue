<template>
  <PrimeButton
    ref="primevueRef"
    :id="id"
    :class="buttonClass"
    :style="style"
    :disabled="disabled || loading"
    :loading="loading"
    :label="label"
    :icon="iconClass"
    :iconPos="iconPosition"
    :severity="mappedSeverity"
    :size="mappedSize"
    :outlined="variant === 'outline'"
    :text="variant === 'ghost'"
    :raised="!variant || variant === 'primary'"
    :rounded="rounded"
    :aria-label="tooltip || label"
    :title="tooltip"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <template v-if="$slots.default" #default>
      <slot />
    </template>
    
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </PrimeButton>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PrimeButton from 'primevue/button'
import type { ButtonWrapperProps, ButtonWrapperEmits } from './Button.types'

// Props and emits
const props = withDefaults(defineProps<ButtonWrapperProps>(), {
  variant: 'primary',
  size: 'medium',
  iconPosition: 'left',
  disabled: false,
  loading: false,
  rounded: false,
  block: false
})

const emit = defineEmits<ButtonWrapperEmits>()

// Template refs
const primevueRef = ref<InstanceType<typeof PrimeButton>>()

// Map wrapper variants to PrimeVue severity
const mappedSeverity = computed(() => {
  const severityMap = {
    primary: 'primary',
    secondary: 'secondary', 
    success: 'success',
    info: 'info',
    warning: 'warn',
    danger: 'danger',
    outline: 'primary', // Will be handled by outlined prop
    ghost: 'secondary'  // Will be handled by text prop
  }
  return severityMap[props.variant] || 'primary'
})

// Map wrapper sizes to PrimeVue sizes
const mappedSize = computed(() => {
  const sizeMap = {
    small: 'small',
    medium: undefined, // Default size in PrimeVue
    large: 'large'
  }
  return sizeMap[props.size]
})

// Handle icon class or component
const iconClass = computed(() => {
  if (typeof props.icon === 'string') {
    return props.icon
  }
  return undefined
})

// Compute button classes including block styling
const buttonClass = computed(() => {
  const classes = []
  
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class)
    } else {
      Object.entries(props.class).forEach(([className, condition]) => {
        if (condition) {
          classes.push(className)
        }
      })
    }
  }
  
  if (props.block) {
    classes.push('w-full')
  }
  
  return classes
})

// Event handlers
const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

// Expose useful properties for parent components
defineExpose({
  primevueRef,
  focus: () => {
    if (primevueRef.value) {
      const el = (primevueRef.value as any).$el as HTMLElement
      el?.focus()
    }
  },
  blur: () => {
    if (primevueRef.value) {
      const el = (primevueRef.value as any).$el as HTMLElement
      el?.blur()
    }
  }
})
</script>

<style scoped>
/* Additional custom styles if needed */
:deep(.p-button.w-full) {
  width: 100%;
}
</style>