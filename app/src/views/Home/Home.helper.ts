import { useAppDrawerStore } from './AppDrawer';

const { appDrawer } = useAppDrawerStore();

export const openAppDrawer = () => {
    appDrawer.value = true;
}

export const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
}