import router from '@/router'
import { useAppDrawerStore } from './AppDrawer.hooks';

export const navigateTo = (path: string): void => {
    const { appDrawer } = useAppDrawerStore();
    router.push(path);
    appDrawer.value = false;
}

export const closeAppDrawer = (): void => {
    const { appDrawer } = useAppDrawerStore();
    appDrawer.value = false;
}
