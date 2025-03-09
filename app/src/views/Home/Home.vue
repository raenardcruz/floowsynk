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
    <router-view class="fade-in" />
</template>

<script setup lang="ts">
import Logo from "@/components/Composable/Logo/Logo.vue";
import AppDrawer from "./AppDrawer";
import { openAppDrawer, logout } from './Home.helper';
</script>

<style scoped src="./Home.style.css"></style>