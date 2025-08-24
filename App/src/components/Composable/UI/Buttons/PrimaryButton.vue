<template>
  <Button
    :id="id"
    :class="buttonClasses"
    :style="style"
    :disabled="disabled"
    :loading="loading"
    :label="label"
    :icon="icon"
    :iconPosition="iconPosition"
    :size="size"
    :tooltip="tooltip"
    :rounded="rounded"
    :block="block"
    variant="primary"
    @click="handleClick"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
  >
    <template v-if="$slots.default" #default>
      <slot />
    </template>
    
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </Button>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Button from './Button.vue'
import type { ButtonWrapperProps } from './Button.types'

// Extend the base button props but force variant to be primary
interface PrimaryButtonProps extends Omit<ButtonWrapperProps, 'variant'> {
  label?: string
}

// Props
const props = withDefaults(defineProps<PrimaryButtonProps>(), {
  label: undefined
})

// Emits
const emit = defineEmits<{
  click: [event: MouseEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

// Computed classes to handle the primary button styling
const buttonClasses = computed(() => {
  const classes = ['button-primary']
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class.filter(Boolean))
    } else if (typeof props.class === 'object') {
      Object.entries(props.class).forEach(([className, condition]) => {
        if (condition) {
          classes.push(className)
        }
      })
    }
  }
  return classes
})

// Event handlers
const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
/* Primary button specific styling */
:deep(.button-primary) {
  background: var(--grey-3);
  color: var(--white-1);
  border: 1px solid var(--grey-1);
}

:deep(.button-primary:hover) {
  background: var(--grey-2) !important;
  color: var(--white-1);
}

:deep(.button-primary:focus) {
  background: var(--grey-2);
  color: var(--white-1);
}

:deep(.button-primary:active) {
  background: var(--grey-4);
  color: var(--white-1);
}
</style>