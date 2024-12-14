import { ref } from 'vue';

const session = ref<string | null>(null);

export function appStore() {
    return {
        session
    }
}