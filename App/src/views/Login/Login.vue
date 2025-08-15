<template>
    <div class="logo">
        <logo />
    </div>
    <div class="login-container fade-in-top">
        <div class="bg-1">
            <div class="bg-2">
                <div class="login-card">
                    <h1>Login</h1>
                    <br>
                    <form @submit.prevent="handleLogin">
                        <TextInput id="username" class="form-item" v-model="username" label="User Name" placeholder="Enter your username" />
                        <PasswordInput id="password" class="form-item" v-model="password" label="Password" placeholder="Enter your password" toggleMask />
                        <div v-if="loginError" class="tooltip">{{ loginErrorMessage }}</div>
                        <div class="btn-grp">
                            <button>Register</button>
                            <button type="submit">Login</button>
                        </div>
                        <Divider />
                        <div class="forgot-password">
                            <a href="#">Forgot password?</a>
                        </div>
                        <div class="other-login">
                            <p>Or login with:</p>
                            <button>
                                <img src="/src/components/Icons/google.svg" alt="Google" />
                            </button>
                            <button>
                                <img src="/src/components/Icons/facebook.svg" alt="Facebook" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Logo from "@/components/Composable/Logo/Logo.vue";
import {
    login,
} from './Login.helpers'
import {
    useLoginStore
} from './Login.hooks'
import Divider from 'primevue/divider'
import { TextInput, PasswordInput } from '@/components/Composable/UI/Inputs'

const {
    username,
    password,
    loginError,
    loginErrorMessage
} = useLoginStore();

const handleLogin = async (_: Event) => {
    await login();
};
</script>

<style scoped src="./Login.styles.css" />