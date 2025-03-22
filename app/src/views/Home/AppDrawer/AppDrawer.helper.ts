import router from '@/router'
import { useAppDrawerStore } from './AppDrawer.hooks';

export const navigateTo = (path: string) => {
    const { appDrawer } = useAppDrawerStore();
    router.push(path);
    appDrawer.value = false;
}

export const closeAppDrawer = () => {
    const { appDrawer } = useAppDrawerStore();
    appDrawer.value = false;
}
