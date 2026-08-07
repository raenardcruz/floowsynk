<template>
    <Toolbar pt:root:class="header">
        <template #start>
            <div class="nav-brand-group">
                <div class="navigation" @click="openAppDrawer" title="Quick Launcher">
                    <span class="material-symbols-outlined">apps</span>
                </div>
                <Logo />
            </div>
            
            <div class="header-nav-tabs">
                <router-link to="/" class="nav-tab-item" :class="{ active: route.path === '/' }">
                    <i class="pi pi-home"></i>
                    <span>Dashboard</span>
                </router-link>
                <router-link to="/workflow" class="nav-tab-item" :class="{ active: route.path.startsWith('/workflow') }">
                    <i class="pi pi-sitemap"></i>
                    <span>Workflows</span>
                </router-link>
                <router-link to="/connectors" class="nav-tab-item" :class="{ active: route.path.startsWith('/connectors') }">
                    <i class="pi pi-box"></i>
                    <span>Connectors</span>
                </router-link>
            </div>
        </template>
        
        <template #end>
            <div class="user-actions-group">
                <div class="user-pill">
                    <div class="user-avatar">
                        <i class="pi pi-user"></i>
                    </div>
                    <span class="user-name">Developer</span>
                </div>
                <div class="logout" @click="logout" title="Log Out">
                    <span class="material-symbols-outlined">logout</span>
                </div>
            </div>
        </template>
    </Toolbar>
    <app-drawer />
    <div class="main-content-view">
        <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
                <component :is="Component" />
            </transition>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import Toolbar from 'primevue/toolbar'
import Logo from "@/components/Composable/Logo/Logo.vue"
import AppDrawer from "./AppDrawer"
import { openAppDrawer, logout, pageInit } from './Home.helper'
import { useRoute } from 'vue-router'

const route = useRoute()
pageInit();
</script>

<style scoped src="./Home.style.css"></style>