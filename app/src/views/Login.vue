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
                            <label for="email">Email:</label>
                            <input type="email" id="email" v-model="email" required />
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
    try {
        // Replace with your actual login logic
        if (email.value === 'test@example.com' && password.value === 'password') {
            // Simulate successful login
            alert('Login successful');
            router.push({ name: 'Home' });
        } else {
            alert('Invalid email or password');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
};
</script>

<style scoped>
.logo {
    display: block;
    position: absolute;
    margin-left: 20px;
}
.logo h2 {
    display: flex
;
    justify-content: center;
    align-items: center;
}
.login-container {
    margin: 0 auto;
    padding: 20px;
    border-radius: 5px;
    display: flex;
    height: 300px;
    width: 600px;
    border-radius: 8px;
    flex-direction: column;
    justify-self: center;
    align-self: center;
    justify-content: center;
    align-items: center;
}
.bg-1 {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 60px;
    background: linear-gradient(45deg, #3AA9B6, #14376B, #513C75, #C4597D, #FC930F);
    height: 350px;
    width: 350px;
    border: 1px solid #ccc;
    box-shadow: 0 30px 16px rgba(0, 0, 0, 0.2);
    transform: rotate(15deg);
}
.bg-2 {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 60px;
    background: linear-gradient(45deg, #3AA9B6, #14376B, #513C75, #C4597D, #FC930F);
    height: 350px;
    width: 350px;
    border: 1px solid #ccc;
    box-shadow: 0 30px 16px rgba(0, 0, 0, 0.2);
    transform: rotate(40deg);
}
.login-card {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    flex-direction: column;
    background: #fff;
    padding: 20px;
    transform: rotate(-55deg);
    box-shadow: inset 8px 8px 16px rgba(0, 0, 0, 0.2), inset -8px -8px 16px rgba(255, 255, 255, 0.7);
}
.form-group {
    margin: 10px 0;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 20px;
}
input {
    border: none;
}
input:focus {
    outline: none;
}
.btn-grp {
    display: flex;
    justify-content: space-between;
    width: 100%;
}
.other-login {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin: 10px 0;
}
.other-login button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
    border-radius: 30px;
    margin: 0 5px;
}
.other-login button img {
    margin: 0 5px;
    height: 25px;
}
.forgot-password {
    margin: 10px 0;
}
</style>