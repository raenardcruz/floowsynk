<template>
    <div class="background" :class="{ show: appDrawer }" @click.self="closeAppDrawer">
        <span class="material-symbols-outlined close" @click="closeAppDrawer">close</span>
        <div class="apps-container" :class="{ showapp: appDrawer }">
            <div class="app" v-for="app in appNav" :key="app.name" @click.prevent="navigateTo(app.path)">
                <img :src="app.icon" :alt="app.name + ' icon'" />
                <span>{{ app.name }}</span>
            </div>
        </div>
        <div class="iconfooter">Vectors and icons by <a href="https://www.svgrepo.com" target="_blank">SVG Repo</a></div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { appNav } from "@/components/Config/appDrawer";
import AppDrawer from './AppDrawer';

const router = useRouter();
const appDrawerHandler = new AppDrawer(router);

const { appDrawer } = AppDrawer.store;
const closeAppDrawer = appDrawerHandler.closeAppDrawer;
const navigateTo = appDrawerHandler.navigateTo;
</script>

<style scoped src="./AppDrawer.css" />