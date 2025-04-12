import { ref } from 'vue'
import { createGlobalState } from '@vueuse/core'

export const useLoginStore = createGlobalState(() => {
    const username = ref<string>('');
    const password = ref<string>('');
    const loginError = ref(false);
    const loginErrorMessage = ref('');
    
    return {
        username,
        password,
        loginError,
        loginErrorMessage,
    }
})