import { ref } from "vue"

const appDrawer = ref(false);

export function appDrawerStore() {
    return {
        appDrawer,
    }
}