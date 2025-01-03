<template>
    <div class="header fade-in">
        <div class="navigation" @click="Home.openAppDrawer">
            <span class="material-symbols-outlined">apps</span>
        </div>
        <div class="logo">
            <logo />
        </div>
        <div class="logout" @click="Home.logout">
            <span class="material-symbols-outlined">logout</span>
        </div>
    </div>
    <app-drawer />
    <router-view class="fade-in" />
</template>

<script setup lang="ts">
import Logo from "@/components/Logo.vue";
import AppDrawer from "@/components/AppDrawer/AppDrawer.vue";
import Home from "./Home";
</script>

<style scoped src="./Home.css"></style>