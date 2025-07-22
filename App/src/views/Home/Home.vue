<template>
    <Toolbar pt:root:class="header">
        <template #start>
            <div class="navigation" @click="openAppDrawer">
                <span class="material-symbols-outlined">apps</span>
            </div>
            <logo />
        </template>
        <template #end>
            <div class="logout" @click="logout">
                <span class="material-symbols-outlined">logout</span>
            </div>
        </template>
    </Toolbar>
    <app-drawer />
    <router-view class="fade-in" />
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Logo from "@/components/Composable/Logo/Logo.vue"
import AppDrawer from "./AppDrawer";
import { openAppDrawer, logout, pageInit } from './Home.helper';

pageInit();
</script>

<style scoped src="./Home.style.css"></style>