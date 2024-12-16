import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { appStore } from "../App";

// Store Section
const username = ref<string>('');
const password = ref<string>('');
const loginError = ref(false);
const loginErrorMessage = ref('');

export function loginstore() {
    return {
        username,
        password,
        loginError,
        loginErrorMessage
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
                const token = resp.data.token;
                const expiryDate = new Date();
                expiryDate.setHours(expiryDate.getHours() + 1); // Token expires in 1 hour
                session.value = token;
                localStorage.setItem('sessionToken', token);
                localStorage.setItem('sessionExpiry', expiryDate.toISOString());
                this.router.push({ path: '/' });
            } else {
                loginError.value = true;
                loginErrorMessage.value = 'Invalid username or password';
            }
        } catch {
            loginError.value = true;
            loginErrorMessage.value = 'Invalid username or password';
        }
    }

    checkSession() {
        const token = localStorage.getItem('sessionToken');
        const expiry = localStorage.getItem('sessionExpiry');
        if (token && expiry) {
            const expiryDate = new Date(expiry);
            if (expiryDate > new Date()) {
                const { session } = appStore();
                session.value = token;
                this.router.push({ path: '/' });
            } else {
                localStorage.removeItem('sessionToken');
                localStorage.removeItem('sessionExpiry');
            }
        }
    }
}

export {
    LoginHandler
}
