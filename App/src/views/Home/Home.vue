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
                <!-- Environment indicator -->
                <div :class="['nav-env-badge', isProduction ? 'nav-env-badge--prod' : 'nav-env-badge--staging']">
                    <span class="nav-env-dot"></span>
                    <span>{{ isProduction ? 'PRODUCTION' : 'STAGING' }}</span>
                </div>
                <div class="user-pill">
                    <div class="user-avatar">
                        <i class="pi pi-user"></i>
                    </div>
                    <span class="user-name">Name</span>
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
import { ref } from 'vue'

const route = useRoute()
const isProduction = ref(import.meta.env.VITE_APP_ENVIRONMENT === 'production')
pageInit();
</script>

<style scoped src="./Home.style.css"></style>

<style scoped>
/* Environment badge in the navbar */
.nav-env-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1.2px;
    margin-right: 4px;
    flex-shrink: 0;
    user-select: none;
}
.nav-env-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}
.nav-env-badge--staging {
    background: rgba(234, 179, 8, 0.12);
    color: #facc15;
    border: 1px solid rgba(234, 179, 8, 0.3);
}
.nav-env-badge--staging .nav-env-dot {
    background: #eab308;
}
.nav-env-badge--prod {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
}
.nav-env-badge--prod .nav-env-dot {
    background: #22c55e;
    animation: pulse-dot 1.5s infinite;
}
@keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
}
</style>