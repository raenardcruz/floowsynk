import {ref} from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router';
import { appStore } from "../App"

// Store Section
const username = ref<string>('');
const password = ref<string>('');

export function loginstore() {
    return {
        username,
        password
    }
}

class LoginHandler {
    private router;

    constructor(router: ReturnType<typeof useRouter>) {
        this.router = router;
    }

    async handleLogin() {
        const { session } = appStore();
        try {
            let resp: any = await axios.post('/api/login', {
                username: username.value,
                password: password.value
            });
            if (resp.status === 200) {
                session.value = resp.data.token;
                this.router.push({ path: '/child2' });
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login');
        }
    }
}


export {
    LoginHandler
}
