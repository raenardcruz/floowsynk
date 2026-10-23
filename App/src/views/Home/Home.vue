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
                <router-link to="/rag" class="nav-tab-item" :class="{ active: route.path.startsWith('/rag') }">
                    <i class="pi pi-bolt"></i>
                    <span>RAG Knowledge</span>
                </router-link>
            </div>
        </template>
        
        <template #end>
            <div class="user-actions-group">
                <!-- Environment Switcher Dropdown -->
                <div :class="['nav-env-dropdown', currentEnv === 'production' ? 'nav-env-dropdown--prod' : 'nav-env-dropdown--staging']">
                    <span class="nav-env-dot"></span>
                    <select class="nav-env-select" v-model="currentEnv" @change="onEnvChange">
                        <option value="staging">STAGING</option>
                        <option value="production">PRODUCTION</option>
                    </select>
                    <i class="pi pi-chevron-down nav-env-arrow"></i>
                </div>
                <div class="user-pill">
                    <div class="user-avatar">
                        <i class="pi pi-user"></i>
                    </div>
                    <span class="user-name">{{ userName }}</span>
                </div>
                <!-- Theme Mode Toggle -->
                <button type="button" class="theme-toggle-btn" @click="toggleTheme" :title="`Theme: ${themeMode} (click to switch)`">
                    <span class="material-symbols-outlined">{{ isDark ? 'dark_mode' : 'light_mode' }}</span>
                </button>
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
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { SESSION_USER_KEY } from '@/views/Login/Login.constants'
import { useTheme } from '@/components/Composable/UI/composables/useTheme'

const route = useRoute()
const userName = useStorage(SESSION_USER_KEY, 'Guest')
const { isDark, toggleTheme, themeMode } = useTheme()
const currentEnv = ref<'staging' | 'production'>(
    (localStorage.getItem('app_environment') as 'staging' | 'production') || 'staging'
)

const onEnvChange = () => {
    localStorage.setItem('app_environment', currentEnv.value)
    window.location.reload()
}

pageInit();
</script>

<style scoped src="./Home.style.css"></style>

<style scoped>
/* Environment selector dropdown in the navbar */
.nav-env-dropdown {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
    margin-right: 8px;
    flex-shrink: 0;
    user-select: none;
    cursor: pointer;
    transition: all 0.2s ease;
}
.nav-env-select {
    appearance: none;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
    cursor: pointer;
    padding-right: 14px;
}
.nav-env-select option {
    background: #1e1e2d;
    color: #e1e1e6;
    font-weight: 600;
}
.nav-env-arrow {
    position: absolute;
    right: 8px;
    font-size: 9px;
    pointer-events: none;
    opacity: 0.8;
}
.nav-env-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}
.nav-env-dropdown--staging {
    background: rgba(234, 179, 8, 0.12);
    color: #facc15;
    border: 1px solid rgba(234, 179, 8, 0.3);
}
.nav-env-dropdown--staging .nav-env-dot {
    background: #eab308;
}
.nav-env-dropdown--prod {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
}
.nav-env-dropdown--prod .nav-env-dot {
    background: #22c55e;
    animation: pulse-dot 1.5s infinite;
}
@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
}
</style>