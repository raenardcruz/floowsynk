<template>
  <div 
    :id="id"
    :class="['loading-wrapper', wrapperClass]"
    :style="wrapperStyle"
    :data-testid="dataTestid || 'loading-component'"
  >
    <p v-if="showHeading" class="loading-heading">Loading</p>
    
    <ProgressSpinner
      ref="primevueRef"
      :style="spinnerStyle"
      :strokeWidth="strokeWidth"
      :animationDuration="animationDuration"
      :class="spinnerClass"
    />
    
    <div v-if="showText && text" class="loading-caption">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import type { LoadingWrapperProps } from './Loading.types'
import { defaultLoadingProps, sizeMap, colorMap } from './Loading.config'

// Define props with defaults
const props = withDefaults(defineProps<LoadingWrapperProps>(), defaultLoadingProps)

// Template ref for PrimeVue component
const primevueRef = ref()

// Computed properties for styling
const wrapperClass = computed(() => {
  const classes = ['loading-wrapper']
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class)
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class.filter(c => typeof c === 'string'))
    }
  }
  return classes
})

const wrapperStyle = computed(() => {
  const styles: Record<string, any> = {}
  
  if (props.style) {
    if (typeof props.style === 'string') {
      // Parse string styles if needed
      Object.assign(styles, props.style)
    } else {
      Object.assign(styles, props.style)
    }
  }
  
  return styles
})

const spinnerStyle = computed(() => {
  const styles: Record<string, any> = {}
  
  // Set size
  if (props.size && sizeMap[props.size]) {
    styles.width = sizeMap[props.size]
    styles.height = sizeMap[props.size]
  }
  
  // Set color
  if (props.color && colorMap[props.color]) {
    styles.color = colorMap[props.color]
  }
  
  return styles
})

const spinnerClass = computed(() => {
  return `loading-spinner loading-spinner--${props.size} loading-spinner--${props.color}`
})



// Expose component methods
defineExpose({
  primevueRef
})
</script>

<style scoped>
.loading-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.loading-heading {
  position: relative;
  display: flex;
  color: var(--p-text-color, black);
  letter-spacing: 0.2em;
  margin-bottom: 1em;
  font-weight: 500;
}

.loading-caption {
  position: relative;
  display: flex;
  color: var(--p-text-muted-color, var(--grey-2, #666));
  letter-spacing: 0.2em;
  margin-top: 1em;
  font-size: 12px;
}

.loading-spinner {
  /* Additional spinner styling can be added here */
}

.loading-spinner--small {
  /* Small size specific styles */
}

.loading-spinner--medium {
  /* Medium size specific styles */
}

.loading-spinner--large {
  /* Large size specific styles */
}

.loading-spinner--primary {
  /* Primary color specific styles */
}

.loading-spinner--secondary {
  /* Secondary color specific styles */
}

.loading-spinner--success {
  /* Success color specific styles */
}

.loading-spinner--info {
  /* Info color specific styles */
}

.loading-spinner--warning {
  /* Warning color specific styles */
}

.loading-spinner--danger {
  /* Danger color specific styles */
}
</style>