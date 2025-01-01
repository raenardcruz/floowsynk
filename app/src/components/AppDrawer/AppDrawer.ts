import { ref } from "vue"
import { useRouter } from 'vue-router';

const appDrawer = ref(false);

export default class AppDrawer {
    private router;
    
    constructor(router: ReturnType<typeof useRouter>) {
        this.router = router;
    }

    static store = {
        appDrawer
    }

    navigateTo (path: string) {
        this.router.push(path);
        appDrawer.value = false;
    }

    closeAppDrawer () {
        appDrawer.value = false;
    }
}