<template>
    <div class="header fade-in">
        <div class="navigation" @click="openAppDrawer">
            <span class="material-symbols-outlined">apps</span>
        </div>
        <div class="logo">
            <logo />
        </div>
        <div class="logout" @click="logout">
            <span class="material-symbols-outlined">logout</span>
        </div>
    </div>
    <app-drawer />
</template>

<script setup lang="ts">
import Logo from "../components/Logo.vue";
import AppDrawer from "../components/AppDrawer.vue";
import { appDrawerStore } from "../components/AppDrawer"
const { appDrawer } = appDrawerStore();
const openAppDrawer = function () {
    appDrawer.value = true;
}
const logout = function () {
    localStorage.clear();
    window.location.href = "/login";
}
</script>

<style scoped>
.header {
    display: flex;
    align-items: center;
    padding: 0 20px;
    height: 50px;
    width: 100%;
    background-color: #f5f5f5;
    box-shadow: 0 0 10px gray;
    border: none;
}

.navigation {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #222;
    gap: 20px;
    height: 50px;
    width: 50px;
    cursor: pointer;
}

.navigation:hover .material-symbols-outlined {
    color: #007BFF;
    transform: rotate(90deg);
    transition: all 1s;
    font-size: 24px;
}
.navigation::after {
    content: "Apps";
    color: #222;
    position: absolute;
    top: 30px;
    left: 5;
    padding: 5px 10px;
    border-radius: 4px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    font-size: 10px;
}
.navigation:hover::after {
    opacity: 1;
}

.material-symbols-outlined {
    font-size: 30px;
    transition: all 1s;
}
.logo {
    display: flex;
    color: #222;
    font-size: 15px;
}
.logout {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #222;
    gap: 20px;
    height: 50px;
    width: 50px;
    cursor: pointer;
    position: absolute;
    right: 20px;
}
.logout:hover .material-symbols-outlined {
    color: #007BFF;
    transition: all 0.3s;
}
</style>