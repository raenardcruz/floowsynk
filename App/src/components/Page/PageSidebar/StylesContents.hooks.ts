import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useStylesContents = createGlobalState(() => {
  const activeStyleSection = ref(1);

  return {
    activeStyleSection,
  };
})