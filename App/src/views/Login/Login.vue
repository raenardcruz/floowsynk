<template>
    <div class="login-wrapper">
        <div class="logo-bar">
            <logo />
        </div>
        <div class="login-container fade-in-top">
            <div class="login-card glass-card">
                <div class="card-header">
                    <h1 class="login-title">Welcome Back</h1>
                    <p class="login-subtitle">Sign in to access your FloowSynk workspace</p>
                </div>
                <form @submit.prevent="handleLogin" class="login-form">
                    <TextInput id="username" class="form-item" v-model="username" label="Username" placeholder="Enter your username" />
                    <PasswordInput id="password" class="form-item" v-model="password" label="Password" placeholder="Enter your password" toggleMask />
                    <div v-if="loginError" class="login-error-pill">
                        <span class="material-symbols-outlined error-icon">error</span>
                        <span>{{ loginErrorMessage }}</span>
                    </div>
                    <div class="btn-grp">
                        <button type="button" class="btn-register" @click="handleLogin">Register</button>
                        <button type="submit" class="btn-submit">Sign In</button>
                    </div>
                    <button type="button" @click="handleGuestLogin" class="guest-btn">
                        <span class="material-symbols-outlined">person</span>
                        <span>Continue as Guest</span>
                    </button>
                    <Divider align="center">
                        <span class="divider-text">OR</span>
                    </Divider>
                    <div class="other-login">
                        <p class="other-login-label">Sign in with social provider</p>
                        <div class="social-btns">
                            <button type="button" class="social-btn" title="Sign in with Google">
                                <img src="/src/components/Icons/google.svg" alt="Google" />
                            </button>
                            <button type="button" class="social-btn" title="Sign in with Facebook">
                                <img src="/src/components/Icons/facebook.svg" alt="Facebook" />
                            </button>
                        </div>
                    </div>
                    <div class="forgot-password">
                        <a href="#">Forgot password?</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Logo from "@/components/Composable/Logo/Logo.vue";
import {
    login,
    loginAsGuest,
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

const handleGuestLogin = () => {
    loginAsGuest();
};
</script>

<style scoped src="./Login.styles.css" />