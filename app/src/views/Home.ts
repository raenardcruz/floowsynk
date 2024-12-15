import { ref } from 'vue';

const appDrawer = ref(false);

export function homeStore() {
    return {
        appDrawer,
    }   
}