<template>
    <div class="logo">
        <logo />
    </div>
    <div class="login-container fade-in-top">
        <div class="bg-1">
            <div class="bg-2">
                <div class="login-card">
                    <h1>Login</h1>
                    <form @submit.prevent="loginHandler.login">
                        <div class="form-group">
                            <label for="username">User Name:</label>
                            <input type="text" id="username" v-model="username" required />
                        </div>
                        <div class="form-group">
                            <label for="password">Password:</label>
                            <input type="password" id="password" v-model="password" required />
                        </div>
                        <div v-if="loginError" class="tooltip">{{ loginErrorMessage }}</div>
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
                                <img src="../components/icons/google.svg" alt="Google" />
                            </button>
                            <button>
                                <img src="../components/icons/facebook.svg" alt="Facebook" />
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
import Login from "./Login";
import Logo from "../components/Logo.vue";

const router = useRouter();
const loginHandler = new Login(router);
loginHandler.checkSession(); // Check session on component mount
const {
    username,
    password,
    loginError,
    loginErrorMessage,
} = Login.store;
</script>

<style scoped src="./Login.css" />