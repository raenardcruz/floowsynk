import { ref } from 'vue'

const username = ref<string>('');
const password = ref<string>('');
const loginError = ref(false);
const loginErrorMessage = ref('');
const lastActivity = ref<number>(Date.now());

export const useLoginStore = () => {
    return {
        username,
        password,
        loginError,
        loginErrorMessage,
        lastActivity
    }
}