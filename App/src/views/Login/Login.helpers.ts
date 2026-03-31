import router from "@/router";
import App from "@/App";
import { useLoginStore } from './Login.hooks'
import {
    SESSION_TOKEN_KEY,
    SESSION_EXPIRY_KEY,
    ERROR_SESSION_EXTENSION,
    ERROR_USER_PASS } from './Login.constants';
import { LoginRequest, LoginRequestUserPass } from './Login.api'
import { Token } from 'proto/login/login_pb'
import { useStorage } from '@vueuse/core';

const {
    username,
    password,
    loginError,
    loginErrorMessage,
} = useLoginStore();

const sessionToken = useStorage(SESSION_TOKEN_KEY, '');
const sessionExpiry = useStorage(SESSION_EXPIRY_KEY, '');

const loginHandler = async (usePass: boolean) => {
    const { session } = App.store;
    try {
        let resp: Token = usePass ? await LoginRequestUserPass(username.value, password.value) : await LoginRequest(session.value);
        const token = resp.getToken();
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 60);
        session.value = token;
        sessionToken.value = token;
        sessionExpiry.value = expiryDate.toISOString();
        router.push({ path: '/' });
    } catch (err) {
        loginError.value = true;
        loginErrorMessage.value = usePass ? ERROR_USER_PASS : ERROR_SESSION_EXTENSION + ': ' + err;
    }
}

export const login = async () => await loginHandler(true);
export const extendSession = () => loginHandler(false);