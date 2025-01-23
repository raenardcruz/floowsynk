import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import App from "../App";
import { error } from 'console';

// Store Section
const username = ref<string>('');
const password = ref<string>('');
const loginError = ref(false);
const loginErrorMessage = ref('');
const lastActivity = ref<number>(Date.now());

export default class Login {
    private readonly router;
    private readonly INACTIVITY_TIMEOUT = 10 * 60 * 1000;
    private readonly SESSION_TOKEN_KEY = 'sessionToken';
    private readonly SESSION_EXPIRY_KEY = 'sessionExpiry';

    constructor(router: ReturnType<typeof useRouter>) {
        this.router = router;
        this.setupActivityMonitoring();
        setTimeout(() => {
            setInterval(() => {
                if (this.checkInactivity()) {
                    this.router.push({ path: '/login' });
                } else {
                    this.extendSession();
                }
            }, this.INACTIVITY_TIMEOUT);
        }, this.INACTIVITY_TIMEOUT);
    }

    static readonly store = {
        username,
        password,
        loginError,
        loginErrorMessage,
        lastActivity
    }

    private setupActivityMonitoring() {
        ['mousedown', 'keydown', 'touchstart', 'mousemove'].forEach(event => {
            document.addEventListener(event, () => {
                lastActivity.value = Date.now();
            });
        });
    }

    private checkInactivity(): boolean {
        const now = Date.now();
        return (now - lastActivity.value) > this.INACTIVITY_TIMEOUT;
    }

    async login() {
        const { session } = App.store;
        const errorMessage = 'Invalid username or password';
        try {
            let resp: any = await axios.post('/api/login', {
                username: username.value,
                password: password.value
            });
            if (resp.status === 200) {
                const token = resp.data.token;
                const expiryDate = new Date();
                expiryDate.setMinutes(expiryDate.getMinutes() + 15);
                session.value = token;
                localStorage.setItem(this.SESSION_TOKEN_KEY, token);
                localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryDate.toISOString());
                this.router.push({ path: '/' });
            } else {
                loginError.value = true;
                loginErrorMessage.value = errorMessage;
            }
        } catch (err) {
            loginError.value = true;
            loginErrorMessage.value = errorMessage + ': ' + err;
        }
    }

    async extendSession() {
        const { session } = App.store;
        const errorMessage = 'Cannot extend session';
        try {
             let resp: any = await axios.post('/api/login', {}, {
                headers: {
                    Authorization: `${session.value}`
                }
             });
             if (resp.status === 200) {
                const token = resp.data.token;
                const expiryDate = new Date();
                expiryDate.setMinutes(expiryDate.getMinutes() + 15);
                session.value = token;
                localStorage.setItem(this.SESSION_TOKEN_KEY, token);
                localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryDate.toISOString());
                this.router.push({ path: '/' });
            } else {
                loginError.value = true;
                loginErrorMessage.value = errorMessage;
            }
        } catch (err) {
            loginError.value = true;
            loginErrorMessage.value = errorMessage + ': ' + err;
        }
    }

    checkSession() {
        const token = localStorage.getItem(this.SESSION_TOKEN_KEY);
        const expiry = localStorage.getItem(this.SESSION_EXPIRY_KEY);
        if (token && expiry) {
            const expiryDate = new Date(expiry);
            if (expiryDate > new Date()) {
                const { session } = App.store;
                session.value = token;
                this.router.push({ path: '/' });
            } else {
                localStorage.removeItem(this.SESSION_TOKEN_KEY);
                localStorage.removeItem(this.SESSION_EXPIRY_KEY);
                this.router.push({ path: '/login' });
            }
        }
    }
}