import { ref } from "vue";

const appDrawer = ref(false);

export const useAppDrawerStore = () => {
    return {
        appDrawer
    }
}