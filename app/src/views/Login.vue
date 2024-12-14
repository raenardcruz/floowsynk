<template>
    <div class="logo">
        <h2>Fl<span class="material-symbols-outlined">all_inclusive</span>wsynk</h2>
    </div>
    <div class="login-container fade-in-top">
        <div class="bg-1">
            <div class="bg-2">
                <div class="login-card">
                    <h1>Login</h1>
                    <form @submit.prevent="handleLogin">
                        <div class="form-group">
                            <label for="username">User Name:</label>
                            <input type="text" id="username" v-model="username" required />
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" v-model="password" required />
                        </div>
                        <div class="btn-grp">
                            <button>Register</button>
                            <button type="submit">Login</button>
                        </div>
                        <div class="forgot-password">
                            <a href="#">Forgot password?</a>
                        </div>
                        <div class="other-login">
                            <p>Or login with:</p>
                            <button>
                                <img src="../components/icons/search.png" alt="Google" />
                            </button>
                            <button>
                                <img src="../components/icons/facebook.png" alt="Google" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { LoginHandler, loginstore } from "./Login"

const router = useRouter();
const loginHandler = new LoginHandler(router);
const handleLogin = loginHandler.handleLogin;
const {
    username,
    password
} = loginstore()
</script>

<style scoped src="./Login.css" />