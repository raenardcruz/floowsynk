import { ref } from "vue"
import { useRouter } from 'vue-router';

const appDrawer = ref(false);

export function appDrawerStore() {
    return {
        appDrawer,
    }
}

class AppDrawerHandler {
     private router;
    
    constructor(router: ReturnType<typeof useRouter>) {
        this.router = router;
    }

    navigateTo (path: string) {
        this.router.push(path);
        appDrawer.value = false;
    }

    closeAppDrawer () {
        appDrawer.value = false;
    }
}

export {
    AppDrawerHandler
}