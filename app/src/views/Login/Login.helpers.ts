import router from "@/router";
import App from "@/App";
import { useLoginStore } from './Login.hooks'
import {
    INACTIVITY_TIMEOUT, 
    SESSION_TOKEN_KEY,
    SESSION_EXPIRY_KEY,
    ERROR_SESSION_EXTENSION,
    ERROR_USER_PASS } from './Login.constants';
import { LoginRequest, LoginRequestUserPass } from './Login.api'
import { Token } from '@/proto/floowsynk_pb'

const {
    username,
    password,
    loginError,
    loginErrorMessage,
    lastActivity
} = useLoginStore();

/*
    Section: Function
    Description: Section for private helper functions
*/
const setupActivityMonitoring = () => {
    ['mousedown', 'keydown', 'touchstart', 'mousemove'].forEach(event => {
        document.addEventListener(event, () => {
            lastActivity.value = Date.now();
        });
    });
}
const checkInactivity = () => {
    const now = Date.now();
    return (now - lastActivity.value) > INACTIVITY_TIMEOUT;
}
const loginHandler = async (usePass: boolean) => {
    const { session } = App.store;
    try {
        let resp: Token = usePass ? await LoginRequestUserPass(username.value, password.value) : await LoginRequest(session.value);
        const token = resp.getToken();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 15);
        session.value = token;
        localStorage.setItem(SESSION_TOKEN_KEY, token);
        localStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString());
        router.push({ path: '/' });
    } catch (err) {
        loginError.value = true;
        loginErrorMessage.value = usePass ? ERROR_USER_PASS : ERROR_SESSION_EXTENSION + ': ' + err;
    }
}


/*
    Section: Main
    Description: Section for main logic
*/
setupActivityMonitoring();
setTimeout(() => {
    setInterval(() => {
        if (checkInactivity()) {
            router.push({ path: '/login' });
        } else {
            extendSession();
        }
    }, INACTIVITY_TIMEOUT);
}, INACTIVITY_TIMEOUT);

/*
    Section: Exports
    Description: Section for module exports
*/
export const login = async () => await loginHandler(true);
export const extendSession = () => loginHandler(false);
export const checkSession = () => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (token && expiry) {
        const expiryDate = new Date(expiry);
        if (expiryDate > new Date()) {
            const { session } = App.store;
            session.value = token;
            router.push({ path: '/' });
        } else {
            localStorage.removeItem(SESSION_TOKEN_KEY);
            localStorage.removeItem(SESSION_EXPIRY_KEY);
            router.push({ path: '/login' });
        }
    }
}