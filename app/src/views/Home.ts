import AppDrawerClass from "@/components/AppDrawer/AppDrawer"

const { appDrawer } = AppDrawerClass.store;

export default class Home {
    static openAppDrawer() {
        appDrawer.value = true;
    }
    
    static logout() {
        localStorage.clear();
        window.location.href = "/login";
    }
}